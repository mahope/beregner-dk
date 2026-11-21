import { describe, expect, test } from "vitest";
import {
  ALKOHOL_DRIKKE,
  beregnAlkoholKalorier,
  drikMedNavn,
  GRAM_PR_GENSTAND,
  kcalIServering,
  alkoholGramIServering,
} from "./kalorier-i-alkohol";

const OEEL = drikMedNavn("Øl, almindelig")!;
const ROEDVIN = drikMedNavn("Vin, rød")!;
const SPIRIT = drikMedNavn("Spirit, 40 % (vodka, gin, rom)")!;

describe("kalorier i alkohol", () => {
  test("a beer is ~143 kcal and about one Danish unit", () => {
    expect(kcalIServering(OEEL)).toBeCloseTo(142.5, 1);
    expect(alkoholGramIServering(OEEL)).toBeCloseTo(12.9, 1);
    expect(alkoholGramIServering(OEEL) / GRAM_PR_GENSTAND).toBeCloseTo(1.08, 2);
  });

  test("a glass of red wine is ~101 kcal, a shot ~87 kcal", () => {
    expect(kcalIServering(ROEDVIN)).toBeCloseTo(101.4, 1);
    expect(kcalIServering(SPIRIT)).toBeCloseTo(86.9, 1);
  });

  test("servings are converted to grams, not treated as millilitres", () => {
    // 4 cl of 40 % spirit weighs 37.6 g — using ml would overstate the kcal.
    const gram = (SPIRIT.ml * SPIRIT.gramPr100ml) / 100;
    expect(gram).toBeCloseTo(37.6, 1);
    expect(SPIRIT.kcal100g * 0.4).toBeCloseTo(92.4, 1); // the ml mistake
    expect(kcalIServering(SPIRIT)).toBeLessThan(92.4);
  });

  test("alcohol accounts for most of the calories in a beer", () => {
    const raekke = beregnAlkoholKalorier({ oel: 1 }).rækker[0];
    expect(raekke.kcalFraAlkohol).toBeGreaterThan(raekke.kcalFraKulhydrat);
    expect(raekke.kcalFraAlkohol + raekke.kcalFraKulhydrat).toBeCloseTo(
      raekke.kcalPrServering,
      5,
    );
  });

  test("alkoholfri beer has almost no alcohol but calories from carbs", () => {
    const raekke = beregnAlkoholKalorier({ "alkoholfri-oel": 1 }).rækker.find((r) => r.id === "alkoholfri-oel")!;
    expect(raekke.genstandePrServering).toBeLessThan(0.1);
    expect(raekke.kcalPrServering).toBeGreaterThan(110);
    expect(raekke.kcalFraKulhydrat).toBeGreaterThan(raekke.kcalFraAlkohol);
  });

  test("totals add the chosen drinks and ignore the rest", () => {
    const t = beregnAlkoholKalorier({ oel: 2, roedvin: 1 });
    expect(t.rækker.filter((r) => r.antal > 0)).toHaveLength(2);
    expect(t.kcal).toBeCloseTo(386.4, 1);
    expect(t.genstande).toBeCloseTo(3.21, 2);
    expect(t.alkoholGram).toBeCloseTo(38.5, 1);
  });

  test("nothing chosen means an empty evening", () => {
    const t = beregnAlkoholKalorier({});
    expect(t.kcal).toBe(0);
    expect(t.rækker).toHaveLength(ALKOHOL_DRIKKE.length);
  });

  test("counts are floored, capped and cannot be negative", () => {
    expect(beregnAlkoholKalorier({ oel: 2.9 }).kcal).toBeCloseTo(
      2 * kcalIServering(OEEL),
      5,
    );
    expect(beregnAlkoholKalorier({ oel: 900 }).rækker[0].antal).toBe(99);
    expect(beregnAlkoholKalorier({ oel: -3 }).kcal).toBe(0);
    expect(beregnAlkoholKalorier({ oel: Number.NaN }).kcal).toBe(0);
  });

  test("every row carries an fdcId and a parseable density", () => {
    for (const d of ALKOHOL_DRIKKE) {
      expect(Number.isInteger(d.fdcId)).toBe(true);
      expect(d.gramPr100ml).toBeGreaterThan(80);
      expect(d.gramPr100ml).toBeLessThan(130);
      expect(d.ml).toBeGreaterThan(0);
    }
  });
});
