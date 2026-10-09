import { describe, expect, it } from "vitest";
import {
  BETONBIL_GRENSE_M3,
  BETON_STANDARD_SPILD_PCT,
  BETON_TOM_MAKS_PR_M3,
  BETON_TOM_MIN_PR_M3,
  STOEBEMIX_POSE_KG,
  STOEBEMIX_POSE_LITER,
  beregnBeton,
  betonElementVedId,
  betonEksempel,
  betonStandardValg,
} from "./beton";

describe("beregnBeton — plade", () => {
  it("regner volumen som længde × bredde × tykkelse", () => {
    const r = beregnBeton({ elementId: "plade", laengdeM: 4, breddeM: 3, tykkelseCm: 10, spildPct: 0 });
    expect(r.volumenM3Uden).toBe(1.2);
    expect(r.volumenM3).toBe(1.2);
    expect(r.liter).toBe(1200);
  });

  it("lægger spild til på volumen", () => {
    const r = beregnBeton({
      elementId: "plade",
      laengdeM: 4,
      breddeM: 3,
      tykkelseCm: 10,
      spildPct: BETON_STANDARD_SPILD_PCT,
    });
    expect(r.volumenM3Uden).toBe(1.2);
    expect(r.volumenM3).toBeCloseTo(1.32, 10);
  });

  it("omregner til poser à 20 kg og runder op", () => {
    // 1,32 m³ = 1.320 liter, ca. 10 liter pr. 20 kg-pose.
    const r = beregnBeton({
      elementId: "plade",
      laengdeM: 4,
      breddeM: 3,
      tykkelseCm: 10,
      spildPct: BETON_STANDARD_SPILD_PCT,
    });
    expect(r.poser20kg).toBe(132);
    expect(STOEBEMIX_POSE_KG).toBe(20);
    expect(STOEBEMIX_POSE_LITER).toBe(10);
  });

  it("runder poser op, også når de ikke går lige op", () => {
    // 1,235 m³ = 1.235 liter → 123,5 poser → 124.
    const r = beregnBeton({
      elementId: "plade",
      laengdeM: 2.47,
      breddeM: 5,
      tykkelseCm: 10,
      spildPct: 0,
    });
    expect(r.liter).toBeCloseTo(1235, 6);
    expect(r.poser20kg).toBe(124);
  });

  it("giver et vægtinterval i ton", () => {
    const r = beregnBeton({ elementId: "plade", laengdeM: 1, breddeM: 1, tykkelseCm: 10, spildPct: 0 });
    expect(r.tonMin).toBeCloseTo(0.1 * BETON_TOM_MIN_PR_M3, 10);
    expect(r.tonMaks).toBeCloseTo(0.1 * BETON_TOM_MAKS_PR_M3, 10);
    expect(r.tonMaks).toBeGreaterThan(r.tonMin);
  });
});

describe("beregnBeton — randfundament", () => {
  it("regner med omkredsen 2 × (længde + bredde)", () => {
    const r = beregnBeton({
      elementId: "fundament",
      laengdeM: 8,
      breddeM: 6,
      fundamentBreddeCm: 20,
      fundamentDybdeCm: 50,
      spildPct: 0,
    });
    // Omkreds 28 m × 0,20 m × 0,50 m = 2,8 m³.
    expect(r.volumenM3Uden).toBeCloseTo(2.8, 10);
    expect(r.maal).toContain("8 × 6 m");
  });

  it("et kvadratisk giv har fire ens kanter i omkredsen", () => {
    const r = beregnBeton({
      elementId: "fundament",
      laengdeM: 5,
      breddeM: 5,
      fundamentBreddeCm: 25,
      fundamentDybdeCm: 50,
      spildPct: 0,
    });
    // Omkreds 20 m × 0,25 m × 0,50 m = 2,5 m³.
    expect(r.volumenM3Uden).toBeCloseTo(2.5, 10);
  });
});

describe("beregnBeton — søjler", () => {
  it("regner antal × tværsnit × højde", () => {
    const r = beregnBeton({
      elementId: "soejle",
      antal: 4,
      soejleBreddeCm: 20,
      soejleDybdeCm: 20,
      soejleHoejdeCm: 40,
      spildPct: 0,
    });
    // 4 × 0,20 × 0,20 × 0,40 = 0,064 m³.
    expect(r.volumenM3Uden).toBeCloseTo(0.064, 10);
    expect(r.maal).toContain("4 søjler");
  });
});

describe("beregnBeton — kanttilfælde", () => {
  it("giver 0 når målene mangler eller er negative", () => {
    const r = beregnBeton({ elementId: "plade", laengdeM: 0, breddeM: 3, tykkelseCm: 10 });
    expect(r.volumenM3).toBe(0);
    expect(r.poser20kg).toBe(0);
    expect(r.overBetonbilGraense).toBe(false);
  });

  it("behandler ikke-tal som 0", () => {
    const r = beregnBeton({ elementId: "plade", laengdeM: Number.NaN, breddeM: 4, tykkelseCm: 10 });
    expect(r.volumenM3).toBe(0);
  });

  it("bruger standardtykkelsen når feltet er tomt", () => {
    const r = beregnBeton({ elementId: "plade", laengdeM: 2, breddeM: 2 });
    expect(r.volumenM3Uden).toBe(0.4);
  });

  it("markerer store mængder til betonbil", () => {
    const lille = beregnBeton({ elementId: "plade", laengdeM: 1, breddeM: 1, tykkelseCm: 10, spildPct: 0 });
    expect(lille.overBetonbilGraense).toBe(false);
    const stor = beregnBeton({ elementId: "plade", laengdeM: 10, breddeM: 10, tykkelseCm: 15, spildPct: 0 });
    expect(stor.volumenM3).toBeGreaterThan(BETONBIL_GRENSE_M3);
    expect(stor.overBetonbilGraense).toBe(true);
  });

  it("falde tilbage til pladen ved ukendt element-id", () => {
    expect(betonElementVedId("findes-ikke").id).toBe("plade");
    expect(betonElementVedId("fundament").id).toBe("fundament");
  });
});

describe("betonStandardValg og betonEksempel", () => {
  it("giver fornuftige standardmål for hvert element", () => {
    expect(betonStandardValg("plade").laengdeM).toBeGreaterThan(0);
    expect(betonStandardValg("fundament").fundamentBreddeCm).toBeGreaterThan(0);
    expect(betonStandardValg("soejle").antal).toBeGreaterThan(0);
  });

  it("eksemplet er en 4 × 3 m plade i 10 cm", () => {
    const r = betonEksempel();
    expect(r.volumenM3Uden).toBe(1.2);
    expect(r.volumenM3).toBeCloseTo(1.32, 10);
    expect(r.maal).toBe("4 × 3 m i 10 cm");
  });
});
