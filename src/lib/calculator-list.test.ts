import { describe, test, expect } from "vitest";
import { getCalculatorsByLocale, getRelatedCalculators, getPopularCalculators } from "./calculator-list";

describe("getCalculatorsByLocale", () => {
  test("DA returns all calculators", () => {
    const calcs = getCalculatorsByLocale("da");
    expect(calcs.length).toBeGreaterThanOrEqual(40);
  });

  test("SE returns fewer calculators than DA", () => {
    const da = getCalculatorsByLocale("da");
    const se = getCalculatorsByLocale("se");
    expect(se.length).toBeLessThan(da.length);
    expect(se.length).toBeGreaterThan(20);
  });

  test("all calculators have required fields", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const calc of getCalculatorsByLocale(locale)) {
        expect(calc.title, `${locale}:${calc.href} missing title`).toBeTruthy();
        expect(calc.description, `${locale}:${calc.href} missing description`).toBeTruthy();
        expect(calc.href, `${locale}:${calc.href} missing href`).toMatch(/^\//);
      }
    }
  });

  test("no duplicate hrefs within a locale", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const calcs = getCalculatorsByLocale(locale);
      const hrefs = calcs.map((c) => c.href);
      expect(new Set(hrefs).size, `${locale} has duplicate hrefs`).toBe(hrefs.length);
    }
  });
});

describe("getRelatedCalculators", () => {
  test("returns up to 5 related calculators", () => {
    const related = getRelatedCalculators("/bmi", "da");
    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(5);
  });

  test("does not include current calculator", () => {
    const related = getRelatedCalculators("/bmi", "da");
    expect(related.find((c) => c.href === "/bmi")).toBeUndefined();
  });

  test("returns fallback for unknown href", () => {
    const related = getRelatedCalculators("/unknown-page", "da");
    expect(related.length).toBeGreaterThan(0);
  });

  test("filters DA-only calculators from SE results", () => {
    const related = getRelatedCalculators("/bmi", "se");
    for (const calc of related) {
      const seCalcs = getCalculatorsByLocale("se");
      expect(seCalcs.find((c) => c.href === calc.href), `${calc.href} not available in SE`).toBeDefined();
    }
  });
});

describe("getPopularCalculators", () => {
  test("returns calculators for all locales", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const popular = getPopularCalculators(locale);
      expect(popular.length).toBeGreaterThan(0);
    }
  });

  test("all popular calculators exist in their locale", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const popular = getPopularCalculators(locale);
      const all = getCalculatorsByLocale(locale);
      const allHrefs = new Set(all.map((c) => c.href));
      for (const calc of popular) {
        expect(allHrefs.has(calc.href), `${calc.href} not in ${locale}`).toBe(true);
      }
    }
  });
});
