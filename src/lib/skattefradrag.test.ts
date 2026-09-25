import { describe, expect, test } from "vitest";
import { beregnKoerselsfradragAar, beregnSkattefradrag } from "./skattefradrag";
import { SATSER_2026, SKATTEFRADRAG_2026 } from "./satser-2026";

const TOM = {
  afstandKm: 0,
  arbejdsdage: 216,
  aarligRente: 0,
  fagforening: 0,
  aKasse: 0,
  haandvaerker: 0,
  serviceydelser: 0,
  donationer: 0,
  oevrigeFradrag: 0,
};

function input(overrides: Partial<typeof TOM> = {}) {
  return { ...TOM, ...overrides };
}

describe("SKATTEFRADRAG_2026", () => {
  test("locked 2026 figures and documented provenance", () => {
    expect(SKATTEFRADRAG_2026.haandvaerkerMax).toBe(12400);
    expect(SKATTEFRADRAG_2026.servicefradragMax).toBe(6200);
    expect(SKATTEFRADRAG_2026.fagforeningMax).toBe(7000);
    expect(SKATTEFRADRAG_2026.koerselDageMax).toBe(216);
    expect(SKATTEFRADRAG_2026.boligfradragSkattevaerdi).toBe(0.26);
    expect(SKATTEFRADRAG_2026.verifiedAt).toBe("2026-09-25");
    expect(SKATTEFRADRAG_2026.sources.koerselsfradrag).toContain("skat.dk");
  });
});

describe("beregnKoerselsfradragAar", () => {
  test("intet fradrag under bundgrænsen på 24 km dagligt", () => {
    expect(beregnKoerselsfradragAar(0, 216)).toBe(0);
    expect(beregnKoerselsfradragAar(12, 216)).toBe(0);
    // Præcis 24 km tur-retur giver heller ikke noget.
    expect(beregnKoerselsfradragAar(12, 216)).toBe(0);
  });

  test("kun den høje sats op til 120 km dagligt", () => {
    // 15 km hver vej = 30 km tur-retur = 6 fradragsberettigede km.
    const dagsfradrag = beregnKoerselsfradragAar(15, 1);
    expect(dagsfradrag).toBe(Math.round(6 * SATSER_2026.koerselSatsLav));
  });

  test("km over 120 km får den lave sats", () => {
    // 70 km hver vej = 140 km tur-retur = 116 km, heraf 96 i høj sats og 20 i lav.
    const forventet = Math.round(
      (96 * SATSER_2026.koerselSatsLav + 20 * SATSER_2026.koerselSatsHoej) * 216,
    );
    expect(beregnKoerselsfradragAar(70, 216)).toBe(forventet);
  });

  test("grænsen på 120 km går ikke tabt mellem de to satser", () => {
    // 60 km hver vej = nøjagtig 120 km tur-retur = 96 km i høj sats,
    // 60,5 km = ét kilometer mere, som får den lave sats.
    const vedGraensen = beregnKoerselsfradragAar(60, 216);
    const enKmMere = beregnKoerselsfradragAar(60.5, 216);
    expect(vedGraensen).toBe(Math.round(96 * SATSER_2026.koerselSatsLav * 216));
    expect(enKmMere).toBe(
      Math.round(96 * SATSER_2026.koerselSatsLav * 216 + SATSER_2026.koerselSatsHoej * 216),
    );
  });

  test("antallet af arbejdsdage skalerer fradraget lineært", () => {
    // 30 km hver vej = 36 fradragsberettigede km, alle i høj sats.
    const dagsfradrag = 36 * SATSER_2026.koerselSatsLav;
    for (const dage of [50, 100, 216]) {
      expect(beregnKoerselsfradragAar(30, dage)).toBe(Math.round(dagsfradrag * dage));
    }
    expect(beregnKoerselsfradragAar(30, 100)).toBeGreaterThan(beregnKoerselsfradragAar(30, 50));
  });

  test("arbejdsdage ud over loftet tælles ikke med", () => {
    expect(beregnKoerselsfradragAar(30, 9999)).toBe(beregnKoerselsfradragAar(30, 216));
  });

  test("manglende eller ugyldige input giver 0 i stedet for NaN", () => {
    expect(beregnKoerselsfradragAar(Number.NaN, 216)).toBe(0);
    expect(beregnKoerselsfradragAar(-50, 216)).toBe(0);
    expect(beregnKoerselsfradragAar(Number.POSITIVE_INFINITY, 216)).toBe(0);
    expect(beregnKoerselsfradragAar(30, Number.NaN)).toBe(beregnKoerselsfradragAar(30, 216));
    expect(beregnKoerselsfradragAar(30, 0)).toBe(beregnKoerselsfradragAar(30, 216));
  });
});

describe("beregnSkattefradrag", () => {
  test("ingen fradrag giver intet resultat", () => {
    expect(beregnSkattefradrag(input())).toBeNull();
  });

  test("samlet fradrag og poster", () => {
    const r = beregnSkattefradrag(
      input({ afstandKm: 15, aarligRente: 40000, fagforening: 5000, aKasse: 4000, donationer: 1000 }),
    );
    expect(r).not.toBeNull();
    if (!r) return;
    expect(r.koerselsFradrag).toBeGreaterThan(0);
    expect(r.renteFradrag).toBe(40000);
    expect(r.fagOgAkasse).toBe(9000);
    expect(r.boligfradrag).toBe(0);
    expect(r.samletFradrag).toBe(
      r.koerselsFradrag + 40000 + 9000 + 1000,
    );
    expect(r.poster.map((p) => p.navn)).toEqual([
      "Kørselsfradrag",
      "Rentefradrag",
      "Fagforening",
      "A-kasse",
      "Donationer/gaver",
    ]);
  });

  test("rentefradraget værdersættes efter sin egen to-trinssats, ikke marginalskatten", () => {
    const r = beregnSkattefradrag(input({ aarligRente: 40000 }));
    if (!r) throw new Error("forventede et resultat");
    // 33,6 % af 40.000 kr.
    expect(r.renteBesparelse).toBe(13440);
    expect(r.totalBesparelse).toBe(13440);
  });

  test("rentefradrag over 50.000 kr. bruger den lave sats på resten", () => {
    const r = beregnSkattefradrag(input({ aarligRente: 70000 }));
    if (!r) throw new Error("forventede et resultat");
    expect(r.renteBesparelse).toBe(Math.round(50000 * 0.336 + 20000 * 0.256));
  });

  test("boligjob- og servicefradrag respects lofterne og egen fradragsværdi", () => {
    const r = beregnSkattefradrag(
      input({ haandvaerker: 99999, serviceydelser: 99999 }),
    );
    if (!r) throw new Error("forventede et resultat");
    expect(r.boligfradrag).toBe(
      SKATTEFRADRAG_2026.haandvaerkerMax + SKATTEFRADRAG_2026.servicefradragMax,
    );
    expect(r.totalBesparelse).toBe(
      Math.round(r.boligfradrag * SKATTEFRADRAG_2026.boligfradragSkattevaerdi),
    );
    expect(r.poster.every((p) => p.type === "boligfradrag")).toBe(true);
  });

  test("fagforening klemmes til sit loft", () => {
    const r = beregnSkattefradrag(input({ fagforening: 99999 }));
    if (!r) throw new Error("forventede et resultat");
    expect(r.fagOgAkasse).toBe(SKATTEFRADRAG_2026.fagforeningMax);
  });

  test("a-kasse har intet loft", () => {
    const r = beregnSkattefradrag(input({ aKasse: 25000 }));
    if (!r) throw new Error("forventede et resultat");
    expect(r.fagOgAkasse).toBe(25000);
  });

  test("ligningsmæssige fradrag værdersættes til kommuneskat + bundskat", () => {
    const sats = SATSER_2026.kommuneskatSnit + SATSER_2026.bundskat;
    const r = beregnSkattefradrag(input({ aKasse: 10000 }));
    if (!r) throw new Error("forventede et resultat");
    expect(r.totalBesparelse).toBe(Math.round(10000 * sats));
  });

  test("negative og NaN-input ignoreres i stedet for at trække fradrag fra", () => {
    const r = beregnSkattefradrag(
      input({ afstandKm: -10, aarligRente: Number.NaN, aKasse: -500, donationer: Number.NaN }),
    );
    expect(r).toBeNull();
  });

  test("månedlig besparelse er en tolvtedel", () => {
    const r = beregnSkattefradrag(input({ aKasse: 12000 }));
    if (!r) throw new Error("forventede et resultat");
    expect(r.besparelsePrMd).toBe(Math.round(r.totalBesparelse / 12));
  });
});
