import { describe, expect, it } from "vitest";
import {
  beregnSkridt,
  skridtFraKm,
  SKRIDTLAENGDE_M,
  KADENCE_SKRIDT_PR_MIN,
  GANG_MET,
} from "./skridt";

describe("beregnSkridt", () => {
  it("omregner 10.000 skridt til 6,6 km for kvinder (66 cm pr. skridt)", () => {
    const r = beregnSkridt(10_000, "kvinde", 70)!;
    // Murray, Kory & Sepic (1970): 0,66 m pr. skridt -> 10.000 * 0,66 = 6.600 m.
    expect(r.km).toBe(6.6);
  });

  it("omregner 10.000 skridt til 7,9 km for mænd (79 cm pr. skridt)", () => {
    const r = beregnSkridt(10_000, "mand", 70)!;
    // Murray, Drought & Kory (1964): 0,79 m pr. skridt -> 7.900 m.
    expect(r.km).toBe(7.9);
  });

  it("regner tiden fra kadencen 117 skridt/min, så 10.000 skridt tager 85 minutter", () => {
    // 10.000 / 117 = 85,47 -> 85. En forkert kadence flytter tallet.
    expect(beregnSkridt(10_000, "kvinde", 70)!.minutter).toBe(85);
    expect(beregnSkridt(10_000, "mand", 70)!.minutter).toBe(85);
  });

  it("regner kalorier som MET 3,5 × vægt × timer: 349 kcal for 10.000 skridt ved 70 kg", () => {
    const r = beregnSkridt(10_000, "kvinde", 70)!;
    // 3,5 * 70 * (10.000/117/60) = 348,99… -> 349.
    expect(r.kcal).toBe(349);
  });

  it("giver kcal null uden kropsvægt, for kalorier kræver en vægt", () => {
    expect(beregnSkridt(10_000, "kvinde")!.kcal).toBeNull();
    expect(beregnSkridt(10_000, "kvinde", 0)!.kcal).toBeNull();
  });

  it("afviser 0, negative tal og NaN", () => {
    expect(beregnSkridt(0, "kvinde", 70)).toBeNull();
    expect(beregnSkridt(-500, "mand", 70)).toBeNull();
    expect(beregnSkridt(Number.NaN, "kvinde", 70)).toBeNull();
  });

  it("skalerer lineært: 5.000 skridt er halvdelen af 10.000", () => {
    const hel = beregnSkridt(10_000, "mand", 80)!;
    const halv = beregnSkridt(5_000, "mand", 80)!;
    expect(halv.km).toBeCloseTo(hel.km / 2, 2);
    // 3,5 * 80 * (5.000/117/60) = 199,43… -> 199.
    expect(halv.kcal).toBe(199);
  });
});

describe("skridtFraKm", () => {
  it("svarer på det omvendte spørgsmål: 1 km er 1.515 skridt for kvinder", () => {
    // 1.000 m / 0,66 m = 1.515,15 -> 1.515.
    expect(skridtFraKm(1, "kvinde")).toBe(1515);
  });

  it("1 km er 1.266 skridt for mænd", () => {
    // 1.000 / 0,79 = 1.265,82 -> 1.266.
    expect(skridtFraKm(1, "mand")).toBe(1266);
  });

  it("er den omvendte af beregnSkridt på en rund tur", () => {
    const km = beregnSkridt(10_000, "kvinde")!.km;
    expect(skridtFraKm(km, "kvinde")).toBe(10_000);
  });

  it("afviser 0, negative tal og NaN", () => {
    expect(skridtFraKm(0, "kvinde")).toBeNull();
    expect(skridtFraKm(-2, "mand")).toBeNull();
    expect(skridtFraKm(Number.NaN, "kvinde")).toBeNull();
  });
});

describe("konstanter", () => {
  it("holder kildeværdierne fra gang-laboratorierne låst", () => {
    expect(SKRIDTLAENGDE_M.kvinde).toBe(0.66);
    expect(SKRIDTLAENGDE_M.mand).toBe(0.79);
    expect(KADENCE_SKRIDT_PR_MIN).toBe(117);
    expect(GANG_MET).toBe(3.5);
  });
});
