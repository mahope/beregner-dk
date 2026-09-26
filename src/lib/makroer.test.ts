import { describe, it, expect } from "vitest";
import {
  beregnMakroer,
  proteinGPerKg,
  PROTEIN_G_PER_KG,
  FEDT_ANDEL,
  KCAL_PER_G,
  MAAL_ORDRE,
  type KalorieMaal,
} from "./makroer";

const VAEGT = 80;
const KALORIER = 2400;

describe("proteinGPerKg", () => {
  it("uses the middle of each documented range", () => {
    expect(proteinGPerKg("vedligehold")).toBe(1.0);
    expect(proteinGPerKg("tab")).toBe(1.4);
    expect(proteinGPerKg("opbyg")).toBeCloseTo(1.9, 10);
  });

  it("stays inside the range the /kalorier page documents", () => {
    for (const maal of MAAL_ORDRE) {
      const gPerKg = proteinGPerKg(maal);
      const { min, max } = PROTEIN_G_PER_KG[maal];
      expect(gPerKg).toBeGreaterThanOrEqual(min);
      expect(gPerKg).toBeLessThanOrEqual(max);
    }
  });

  it("rises with the goal, and the ranges do not overlap", () => {
    expect(proteinGPerKg("vedligehold")).toBeLessThan(proteinGPerKg("tab"));
    expect(proteinGPerKg("tab")).toBeLessThan(proteinGPerKg("opbyg"));
    expect(PROTEIN_G_PER_KG.vedligehold.max).toBeLessThanOrEqual(
      PROTEIN_G_PER_KG.tab.min
    );
    expect(PROTEIN_G_PER_KG.tab.max).toBeLessThanOrEqual(
      PROTEIN_G_PER_KG.opbyg.min
    );
  });
});

describe("beregnMakroer", () => {
  it("gives the page's own example: 80 kg vedligehold = 80 g protein", () => {
    const makro = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal: "vedligehold" });
    expect(Math.round(makro.protein)).toBe(80);
    expect(makro.proteinGPerKgMin).toBe(0.8);
    expect(makro.proteinGPerKgMax).toBe(1.2);
  });

  it("gives more protein for weight loss than for maintenance", () => {
    const tab = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal: "tab" });
    const vedligehold = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal: "vedligehold" });
    expect(tab.protein).toBeGreaterThan(vedligehold.protein);
    expect(Math.round(tab.protein)).toBe(112);
  });

  it("gives the most protein for muscle gain", () => {
    const opbyg = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal: "opbyg" });
    expect(Math.round(opbyg.protein)).toBe(152);
  });

  it("keeps fat at 25 % of the calories", () => {
    for (const maal of MAAL_ORDRE) {
      const makro = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal });
      expect(makro.fedt * KCAL_PER_G.fedt).toBeCloseTo(KALORIER * FEDT_ANDEL, 6);
    }
  });

  it("adds up to the calories, and never returns negative carbohydrates", () => {
    for (const maal of MAAL_ORDRE) {
      for (const kalorier of [1400, 1800, 2400, 3200, 4500]) {
        const makro = beregnMakroer({ vaegtKg: VAEGT, kalorier, maal });
        const sum =
          makro.protein * KCAL_PER_G.protein +
          makro.fedt * KCAL_PER_G.fedt +
          makro.kulhydrater * KCAL_PER_G.kulhydrater;
        expect(makro.kulhydrater).toBeGreaterThanOrEqual(0);
        expect(sum).toBeCloseTo(Math.max(kalorier, sum), 6);
        if (makro.kulhydrater > 0) expect(sum).toBeCloseTo(kalorier, 6);
      }
    }
  });

  it("keeps protein inside the documented range for every weight and goal", () => {
    for (let vaegt = 35; vaegt <= 200; vaegt += 5) {
      for (const maal of MAAL_ORDRE) {
        const makro = beregnMakroer({ vaegtKg: vaegt, kalorier: KALORIER, maal });
        const { min, max } = PROTEIN_G_PER_KG[maal];
        expect(makro.protein / vaegt).toBeGreaterThanOrEqual(min);
        expect(makro.protein / vaegt).toBeLessThanOrEqual(max);
        expect(makro.proteinGPerKgMin).toBe(min);
        expect(makro.proteinGPerKgMax).toBe(max);
      }
    }
  });

  it("returns zero protein for a non-positive weight instead of a negative", () => {
    for (const maal of MAAL_ORDRE) {
      const makro = beregnMakroer({ vaegtKg: 0, kalorier: KALORIER, maal });
      expect(makro.protein).toBe(0);
      expect(makro.kulhydrater).toBeGreaterThanOrEqual(0);
    }
  });

  it("covers every goal the calculator offers", () => {
    for (const maal of ["vedligehold", "tab", "opbyg"] as KalorieMaal[]) {
      expect(MAAL_ORDRE).toContain(maal);
      expect(() =>
        beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal })
      ).not.toThrow();
    }
  });
});
