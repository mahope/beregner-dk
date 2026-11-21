import { describe, expect, test } from "vitest";
import {
  GRUS_EKSEMPEL,
  GRUS_MATERIALER,
  GRUS_STANDARD_SPILD_PCT,
  LITER_PR_M3,
  beregnGrus,
  grusEksempel,
  grusMaterialeVedId,
} from "./sand-og-grus";

describe("beregnGrus", () => {
  test("10 m² med 5 cm sand er 0,5 m³ uden spild", () => {
    const r = beregnGrus({
      laengdeM: 5,
      breddeM: 2,
      materialeId: "afretningssand",
      lagCm: 5,
      spildPct: 0,
    });
    expect(r.arealM2).toBe(10);
    expect(r.volumenM3).toBeCloseTo(0.5, 10);
    expect(r.volumenMedSpildM3).toBeCloseTo(0.5, 10);
  });

  test("spild lægges oveni volumen", () => {
    const r = beregnGrus({
      laengdeM: 5,
      breddeM: 2,
      materialeId: "afretningssand",
      lagCm: 5,
      spildPct: 10,
    });
    expect(r.volumenMedSpildM3).toBeCloseTo(0.55, 10);
    expect(r.literMedSpild).toBeCloseTo(0.55 * LITER_PR_M3, 10);
  });

  test("vægten er volumen gange materialets densitet", () => {
    const r = beregnGrus({
      laengdeM: 5,
      breddeM: 2,
      materialeId: "stabilgrus",
      lagCm: 12,
      spildPct: 0,
    });
    expect(r.volumenM3).toBeCloseTo(1.2, 10);
    expect(r.tonMedSpild).toBeCloseTo(1.2 * 1.9, 10);
  });

  test("50 m² med 12 cm stabilgrus er 6 m³", () => {
    const r = beregnGrus({
      laengdeM: 10,
      breddeM: 5,
      materialeId: "stabilgrus",
      lagCm: 12,
      spildPct: 0,
    });
    expect(r.volumenM3).toBeCloseTo(6, 10);
  });

  test("udefineret lagtykkelse bruger materialets standard", () => {
    const r = beregnGrus({ laengdeM: 5, breddeM: 2, materialeId: "stabilgrus" });
    expect(r.lagCm).toBe(grusMaterialeVedId("stabilgrus").lagCmStandard);
  });

  test("ukendt materiale falder tilbage til det første", () => {
    const r = beregnGrus({ laengdeM: 5, breddeM: 2, materialeId: "findes-ikke", lagCm: 5 });
    expect(r.materiale.id).toBe(GRUS_MATERIALER[0].id);
  });

  test("nul og negative mål giver ingen volumen", () => {
    const nul = beregnGrus({ laengdeM: 0, breddeM: 2, materialeId: "stabilgrus" });
    expect(nul.volumenMedSpildM3).toBe(0);
    expect(nul.tonMedSpild).toBe(0);
    const negativ = beregnGrus({ laengdeM: -5, breddeM: 2, materialeId: "stabilgrus" });
    expect(negativ.volumenMedSpildM3).toBe(0);
  });

  test("negativ spild trækkes ikke fra", () => {
    const r = beregnGrus({
      laengdeM: 5,
      breddeM: 2,
      materialeId: "afretningssand",
      lagCm: 5,
      spildPct: -10,
    });
    expect(r.volumenMedSpildM3).toBeCloseTo(0.5, 10);
  });
});

describe("materialelisten", () => {
  test("hvert materiale har et positivt laginterval og en positiv densitet", () => {
    for (const m of GRUS_MATERIALER) {
      expect(m.lagCmMin).toBeGreaterThan(0);
      expect(m.lagCmMax).toBeGreaterThanOrEqual(m.lagCmMin);
      expect(m.lagCmStandard).toBeGreaterThanOrEqual(m.lagCmMin);
      expect(m.lagCmStandard).toBeLessThanOrEqual(m.lagCmMax);
      expect(m.densitetTPerM3).toBeGreaterThan(0);
    }
  });

  test("id'erne er unikke", () => {
    const ider = GRUS_MATERIALER.map((m) => m.id);
    expect(new Set(ider).size).toBe(ider.length);
  });
});

describe("eksemplet", () => {
  test("5 × 2 m med 5 cm sand og 10 % spild giver 0,55 m³ og 0,88 ton", () => {
    const r = grusEksempel();
    expect(r.arealM2).toBe(10);
    expect(r.volumenMedSpildM3).toBeCloseTo(0.55, 10);
    expect(r.tonMedSpild).toBeCloseTo(0.88, 10);
  });

  test("eksemplets mål er dem brødteksten nævner", () => {
    expect(GRUS_EKSEMPEL.laengdeM).toBe(5);
    expect(GRUS_EKSEMPEL.breddeM).toBe(2);
    expect(GRUS_EKSEMPEL.materialeId).toBe("afretningssand");
    expect(GRUS_EKSEMPEL.spildPct).toBe(GRUS_STANDARD_SPILD_PCT);
  });
});

describe("sidens metadata bærer eksemplets tal", () => {
  test("titel og beskrivelse nævner det volumen værktøjet regner", async () => {
    const { getPageData } = await import("./page-data");
    const data = getPageData("sand-og-grus", "da")!;
    expect(data).toBeDefined();

    expect(data.metaTitle).toContain("0,55");
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.faqItems.length).toBeGreaterThanOrEqual(4);
  });
});
