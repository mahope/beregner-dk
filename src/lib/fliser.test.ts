import { describe, test, expect } from "vitest";
import {
  FLISER_EKSEMPEL,
  FLISER_FORMATER,
  FLISER_STANDARD_PR_ESKE,
  FLISER_STANDARD_SPILD_PCT,
  beregnFliser,
  fliserEksempel,
  fliserPrKvadratmeter,
} from "./fliser";
import { materialeVedId } from "./kvadratmeter-materialer";

describe("fliserPrKvadratmeter", () => {
  test("en 60 × 60-flise giver 2,78 fliser pr. m²", () => {
    // 10.000 cm² ÷ 3.600 cm² = 2,777…
    expect(fliserPrKvadratmeter(60, 60)).toBeCloseTo(2.7778, 3);
  });

  test("en 30 × 30-flise giver 11,11 fliser pr. m²", () => {
    expect(fliserPrKvadratmeter(30, 30)).toBeCloseTo(11.1111, 3);
  });

  test("et rektangulært format bruger begge mål", () => {
    // 10.000 ÷ (30 × 60) = 5,56
    expect(fliserPrKvadratmeter(30, 60)).toBeCloseTo(5.5556, 3);
  });

  test("et nul-mål giver nul i stedet for uendeligt", () => {
    expect(fliserPrKvadratmeter(0, 60)).toBe(0);
    expect(fliserPrKvadratmeter(60, 0)).toBe(0);
    expect(fliserPrKvadratmeter(-10, 60)).toBe(0);
  });
});

describe("beregnFliser", () => {
  test("arealet er længde gange bredde", () => {
    const r = beregnFliser({
      laengdeM: 4,
      breddeM: 3,
      fliseBreddeCm: 60,
      fliseHoejdeCm: 60,
    });
    expect(r.arealM2).toBe(12);
    expect(r.fliseArealM2).toBeCloseTo(0.36, 10);
  });

  test("fliserne rundes op til hele fliser", () => {
    // 12 ÷ 0,36 = 33,33 → 34 fliser uden spild.
    const r = beregnFliser({
      laengdeM: 4,
      breddeM: 3,
      fliseBreddeCm: 60,
      fliseHoejdeCm: 60,
      spildPct: 0,
    });
    expect(r.fliserUdenSpild).toBe(34);
    expect(r.fliserMedSpild).toBe(34);
  });

  test("spild lægges oveni", () => {
    // 12 × 1,10 = 13,2 m² ÷ 0,36 = 36,67 → 37 fliser.
    const r = beregnFliser({
      laengdeM: 4,
      breddeM: 3,
      fliseBreddeCm: 60,
      fliseHoejdeCm: 60,
      spildPct: 10,
    });
    expect(r.fliserMedSpild).toBe(37);
  });

  test("kasser rundes op, og købsarealet er hele kasser", () => {
    // 37 fliser ÷ 4 pr. kasse = 9,25 → 10 kasser = 40 fliser = 14,4 m².
    const r = beregnFliser({
      laengdeM: 4,
      breddeM: 3,
      fliseBreddeCm: 60,
      fliseHoejdeCm: 60,
      spildPct: 10,
      fliserPrEske: 4,
    });
    expect(r.esker).toBe(10);
    expect(r.koebM2).toBeCloseTo(14.4, 10);
  });

  test("én flise pr. kasse giver lige så mange kasser som fliser", () => {
    const r = beregnFliser({
      laengdeM: 4,
      breddeM: 3,
      fliseBreddeCm: 60,
      fliseHoejdeCm: 60,
      spildPct: 10,
      fliserPrEske: 1,
    });
    expect(r.esker).toBe(37);
  });

  test("antal pr. kasse under 1 behandles som én", () => {
    const r = beregnFliser({
      laengdeM: 4,
      breddeM: 3,
      fliseBreddeCm: 60,
      fliseHoejdeCm: 60,
      fliserPrEske: 0,
    });
    expect(r.esker).toBe(r.fliserMedSpild);
  });

  test("en anden flisestørrelse ændrer antallet", () => {
    // 12 m² ÷ 0,09 (30 × 30) = 133,33 → 134 uden spild.
    const r = beregnFliser({
      laengdeM: 4,
      breddeM: 3,
      fliseBreddeCm: 30,
      fliseHoejdeCm: 30,
      spildPct: 0,
    });
    expect(r.fliserUdenSpild).toBe(134);
  });

  test("manglende eller negative mål giver nul", () => {
    const nul = beregnFliser({
      laengdeM: 0,
      breddeM: 3,
      fliseBreddeCm: 60,
      fliseHoejdeCm: 60,
    });
    expect(nul.fliserMedSpild).toBe(0);
    expect(nul.esker).toBe(0);

    const negativ = beregnFliser({
      laengdeM: -4,
      breddeM: 3,
      fliseBreddeCm: 60,
      fliseHoejdeCm: 60,
    });
    expect(negativ.arealM2).toBe(0);
  });

  test("en ugyldig flisestørrelse giver ingen fliser", () => {
    const r = beregnFliser({
      laengdeM: 4,
      breddeM: 3,
      fliseBreddeCm: 0,
      fliseHoejdeCm: 60,
    });
    expect(r.fliserMedSpild).toBe(0);
    expect(r.esker).toBe(0);
  });
});

describe("standardværdierne har én kilde", () => {
  test("spild kommer fra materialemodulet", () => {
    expect(FLISER_STANDARD_SPILD_PCT).toBe(materialeVedId("fliser").spildPct);
  });
});

describe("eksempelrummet", () => {
  test("4 × 3 m med 60 × 60-fliser giver 37 fliser og 10 kasser", () => {
    const r = fliserEksempel();
    expect(r.arealM2).toBe(12);
    expect(r.fliserMedSpild).toBe(37);
    expect(r.esker).toBe(10);
  });

  test("eksempelrummets mål er dem brødteksten nævner", () => {
    expect(FLISER_EKSEMPEL.laengdeM).toBe(4);
    expect(FLISER_EKSEMPEL.breddeM).toBe(3);
    expect(FLISER_EKSEMPEL.fliseBreddeCm).toBe(60);
    expect(FLISER_EKSEMPEL.fliseHoejdeCm).toBe(60);
    expect(FLISER_EKSEMPEL.fliserPrEske).toBe(FLISER_STANDARD_PR_ESKE);
  });

  test("formatlisten har mindst otte formater med positive mål", () => {
    expect(FLISER_FORMATER.length).toBeGreaterThanOrEqual(8);
    for (const [b, h] of FLISER_FORMATER) {
      expect(b).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
    }
  });
});

describe("sidens metadata bærer eksemplets tal", () => {
  test("titel og beskrivelse nævner det antal værktøjet regner", async () => {
    const { getPageData } = await import("./page-data");
    const data = getPageData("fliser", "da")!;
    const r = fliserEksempel();

    expect(data.metaTitle).toContain(`${r.fliserMedSpild} fliser`);
    expect(data.metaDescription).toContain(`${r.fliserMedSpild} fliser`);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);

    const svar = data.faqItems.find((f) => f.question === "Hvor mange fliser skal jeg bruge til et rum?")!;
    expect(svar.answer).toContain(`${r.fliserMedSpild}`);
  });
});
