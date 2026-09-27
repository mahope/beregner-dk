/**
 * Tidszonen låses til Danmark, fordi det er dér fejlen lå: mellem to lokale
 * midnat er der 23 timer det døgn Danmark går frem (29. marts 2026) og 25 timer
 * det døgn Danmark går tilbage (25. oktober 2026). På en maskine med UTC-tid
 * er alle dage 24 timer, så de to tests til sidst kan aldrig fejle der — de
 * skal kun fejle, fordi regnestykket tæller millisekunder i stedet for
 * kalenderdage.
 */
process.env.TZ = "Europe/Copenhagen";

import { describe, expect, test } from "vitest";
import { beregnAlder } from "./alder";
import { ALDER_EKSEEMPLER, formatAlder } from "./alder-eksempler";

describe("beregnAlder", () => {
  test("tæller hele år, måneder og dage", () => {
    const r = beregnAlder({ foedselsdato: "1990-03-15", beregningsdato: "2026-09-25" });
    expect(r).not.toBeNull();
    expect(r).toMatchObject({ aar: 36, maaneder: 6, dage: 10, totalDage: 13343 });
  });

  test("totalerne er uafhængige af den kalenderkonvention, måneder og dage bruger", () => {
    const r = beregnAlder({ foedselsdato: "2025-12-31", beregningsdato: "2026-02-27" });
    expect(r).not.toBeNull();
    expect(r?.totalDage).toBe(58);
    expect(r?.totalUger).toBe(8);
    expect(r?.totalMaaneder).toBe(1);
    expect(r?.totalTimer).toBe(58 * 24);
    expect(r?.totalMinutter).toBe(58 * 24 * 60);
  });

  test("tæller kalenderdage, ikke millisekunder, når uret stilles om", () => {
    // 15. marts 1990 → 25. september 2026 krydser 37 gange op og 36 gange ned,
    // så der går én time mere end 13.343 døgn. Før C59 sagde "Dage levet"
    // 13342 her — og i eksempeltabellen på /alder.
    const r = beregnAlder({ foedselsdato: "1990-03-15", beregningsdato: "2026-09-25" });
    expect(r?.totalDage).toBe(13343);
    expect(r?.totalTimer).toBe(13343 * 24);
    // Og et interval der kun krydder nedslaget, 24. okt. → 27. okt. 2026.
    const e = beregnAlder({ foedselsdato: "2026-10-24", beregningsdato: "2026-10-27" });
    expect(e?.totalDage).toBe(3);
  });

  test("nedtællingen til fødselsdagen tæller også kalenderdage", () => {
    // Fødselsdag 25. oktober: det døgn Danmark går tilbage har 25 timer, så
    // intervallet 26. okt. 2026 → 25. okt. 2027 er 364 dage og 23 timer. Før
    // C59 sagde siden "Der er 363 dage til din næste fødselsdag".
    const r = beregnAlder({ foedselsdato: "1990-10-25", beregningsdato: "2026-10-26" });
    expect(r?.dageTilFoedselsdag).toBe(364);
    // Samme fødselsdag, dagen hvor uret stilles om: et døgn før, ikke to.
    const i = beregnAlder({ foedselsdato: "1990-10-25", beregningsdato: "2026-10-24" });
    expect(i?.dageTilFoedselsdag).toBe(1);
  });

  test("låner dage fra den måned, der går umiddelbart forud", () => {
    // 31. jan. → 30. mar. Den korte februar må ikke tage en dag fra svaret.
    const r = beregnAlder({ foedselsdato: "2026-01-31", beregningsdato: "2026-03-30" });
    expect(r).not.toBeNull();
    expect(r?.aar).toBe(0);
    expect(r?.dage).toBe(27);
  });

  test("skudårsfødselsdag tæller dagen før 29. februar i et ikke-skudår", () => {
    const r = beregnAlder({ foedselsdato: "2004-02-29", beregningsdato: "2026-02-28" });
    expect(r).not.toBeNull();
    expect(r).toMatchObject({ aar: 21, maaneder: 11, dage: 30 });
  });

  test("skudårsfødselsdag tæller 29. februar i et skudår", () => {
    const r = beregnAlder({ foedselsdato: "2004-02-29", beregningsdato: "2028-02-29" });
    expect(r).not.toBeNull();
    expect(r).toMatchObject({ aar: 24, maaneder: 0, dage: 0 });
  });

  test("fødselsdagen selv er 0 måneder og 0 dage", () => {
    const r = beregnAlder({ foedselsdato: "2000-01-01", beregningsdato: "2000-01-01" });
    expect(r).toMatchObject({ aar: 0, maaneder: 0, dage: 0, totalDage: 0 });
  });

  test("næste fødselsdag er næste årsdag, også på selve fødselsdagen", () => {
    const paaDagen = beregnAlder({ foedselsdato: "1990-03-15", beregningsdato: "2026-03-15" });
    expect(paaDagen).toMatchObject({ aar: 36, dageTilFoedselsdag: 365, naesteFoedselsdagAlder: 37 });

    const dagenFoer = beregnAlder({ foedselsdato: "1990-03-15", beregningsdato: "2026-03-14" });
    expect(dagenFoer).toMatchObject({ aar: 35, dageTilFoedselsdag: 1, naesteFoedselsdagAlder: 36 });
  });

  test("et skudårsfødselsbarn får fødselsdagen i marts, fordi 2026 ikke er et skudår", () => {
    const r = beregnAlder({ foedselsdato: "2004-02-29", beregningsdato: "2026-02-28" });
    expect(r?.dageTilFoedselsdag).toBe(1);
    expect(r?.naesteFoedselsdagAlder).toBe(22);
  });

  test("afviser fødselsdato efter beregningsdatoen", () => {
    expect(beregnAlder({ foedselsdato: "2026-09-26", beregningsdato: "2026-09-25" })).toBeNull();
  });

  test("afviser datoer der ikke findes, og datostrenge i andet format", () => {
    expect(beregnAlder({ foedselsdato: "1990-02-31", beregningsdato: "2026-09-25" })).toBeNull();
    expect(beregnAlder({ foedselsdato: "15.03.1990", beregningsdato: "2026-09-25" })).toBeNull();
    expect(beregnAlder({ foedselsdato: "1990-13-01", beregningsdato: "2026-09-25" })).toBeNull();
    expect(beregnAlder({ foedselsdato: "", beregningsdato: "2026-09-25" })).toBeNull();
  });

  test("er uafhængig af tidszonen, så server og klient viser samme svar", () => {
    // Ved UTC-tolkning af "1990-03-15" ville getDate() give 14 i en tidszone
    // bag UTC. Lokal kalenderparsing gør resultatet det samme overalt.
    const r = beregnAlder({ foedselsdato: "1990-01-01", beregningsdato: "1990-01-02" });
    expect(r).toMatchObject({ aar: 0, maaneder: 0, dage: 1, totalDage: 1 });
  });
});

describe("ALDER_EKSEEMPLER", () => {
  test("hvert eksempel er beregnet af beregnAlder, så tabellen ikke kan lyve", () => {
    for (const eksempel of ALDER_EKSEEMPLER) {
      const r = beregnAlder({
        foedselsdato: eksempel.foedselsdato,
        beregningsdato: eksempel.beregningsdato,
      });
      expect(r).not.toBeNull();
      expect(eksempel.aar).toBe(r?.aar);
      expect(eksempel.maaneder).toBe(r?.maaneder);
      expect(eksempel.dage).toBe(r?.dage);
      expect(eksempel.totalDage).toBe(r?.totalDage);
      expect(eksempel.dageTilFoedselsdag).toBe(r?.dageTilFoedselsdag);
      expect(eksempel.naesteFoedselsdagAlder).toBe(r?.naesteFoedselsdagAlder);
    }
  });

  test("rækken dækker både det eksempel, siden lover, og spørgsmålet om en dato tilbage i tiden", () => {
    const foerste = ALDER_EKSEEMPLER[0];
    expect(formatAlder(foerste, "da")).toBe("36 år, 6 måneder og 10 dage");
    expect(formatAlder(foerste, "se")).toBe("36 år, 6 månader och 10 dagar");

    const tilbage = ALDER_EKSEEMPLER[1];
    expect(tilbage.foedselsdato).toBe(foerste.foedselsdato);
    expect(tilbage).toMatchObject({ aar: 20, maaneder: 1, dage: 16 });
    expect(formatAlder(tilbage, "da")).toBe("20 år, 1 måned og 16 dage");
    expect(formatAlder(tilbage, "se")).toBe("20 år, 1 månad och 16 dagar");
  });

  test("ental og flertal, og null i flertal", () => {
    // "1 måneder" var den fejl, C47's egen tabel introducerede, fordi
    // værktøjet førhen skrev `${m} måneder` uden at se efter tallet.
    expect(formatAlder({ aar: 20, maaneder: 1, dage: 1 }, "da")).toBe("20 år, 1 måned og 1 dag");
    expect(formatAlder({ aar: 20, maaneder: 1, dage: 1 }, "se")).toBe("20 år, 1 månad och 1 dag");
    expect(formatAlder({ aar: 25, maaneder: 0, dage: 0 }, "da")).toBe("25 år, 0 måneder og 0 dage");
    expect(formatAlder({ aar: 25, maaneder: 0, dage: 0 }, "se")).toBe("25 år, 0 månader och 0 dagar");
    expect(formatAlder({ aar: 36, maaneder: 6, dage: 10 }, "da")).toBe("36 år, 6 måneder og 10 dage");
    expect(formatAlder({ aar: 36, maaneder: 6, dage: 10 }, "se")).toBe("36 år, 6 månader och 10 dagar");
    expect(formatAlder({ aar: 36, maaneder: 6, dage: 10 }, "no")).toBe("36 år, 6 måneder og 10 dage");
  });

  test("hvert eksempel er formateret uden fejlmorphing", () => {
    // Negativt mønster med tal-grænse: "11 måneder" må ikke fejle, fordi
    // teksten indeholder bogstaverne i "1 måneder".
    const fejlMønstre = /(^|[^0-9])1 (måneder|månader|dage|dagar)\b/;
    for (const eksempel of ALDER_EKSEEMPLER) {
      for (const locale of ["da", "se", "no"] as const) {
        expect(formatAlder(eksempel, locale)).not.toMatch(fejlMønstre);
      }
    }
  });

  test("alle eksempler har en bemærkning på begge sprog", () => {
    for (const eksempel of ALDER_EKSEEMPLER) {
      expect(eksempel.bemaerkning.da.length).toBeGreaterThan(20);
      expect(eksempel.bemaerkning.se.length).toBeGreaterThan(20);
    }
  });
});
