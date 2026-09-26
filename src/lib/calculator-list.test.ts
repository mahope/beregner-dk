import { describe, test, expect } from "vitest";
import {
  getCalculatorsByLocale,
  getRelatedCalculators,
  getPopularCalculators,
  isCalculatorAvailable,
  RELATED_CALCULATORS,
} from "./calculator-list";

const LOCALES = ["da", "no", "se"] as const;

/** 3x2 grid: more than six cards leaves a lone item on the last row. */
const MAX_RELATED = 6;

describe("relatedMap is the contract the renderer keeps", () => {
  // Regression guard: `getRelatedCalculators` used to `slice(0, 5)`, so 13
  // pages declared a link they never rendered — `/dato` and `/tidsberegner`
  // lost `/ugenummer`, `/kvadratmeter` lost `/flyttebudget`, and `/promille`
  // lost `/procent`, leaving `/ugenummer` and `/flyttebudget` with almost no
  // inbound links from the pages that declare them.
  test("every declared related link is actually rendered, in every locale", () => {
    for (const [page, declared] of Object.entries(RELATED_CALCULATORS)) {
      for (const locale of LOCALES) {
        const available = new Set(
          getCalculatorsByLocale(locale).map((c) => c.href),
        );
        const expected = declared.filter((href) => available.has(href));
        if (expected.length === 0) continue; // falls back to a generic list
        expect(
          getRelatedCalculators(page, locale).map((c) => c.href),
          `${locale}:${page} renderer dropped a declared link`,
        ).toEqual(expected);
      }
    }
  });

  test("no page declares more related links than the grid can show", () => {
    for (const [page, declared] of Object.entries(RELATED_CALCULATORS)) {
      expect(declared.length, `${page} declares ${declared.length}`).toBeLessThanOrEqual(
        MAX_RELATED,
      );
    }
  });

  test("no page links to itself or repeats a link", () => {
    for (const [page, declared] of Object.entries(RELATED_CALCULATORS)) {
      expect(declared, `${page} links to itself`).not.toContain(page);
      expect(new Set(declared).size, `${page} repeats a link`).toBe(declared.length);
    }
  });

  test("every declared target is a real calculator", () => {
    const known = new Set(
      LOCALES.flatMap((locale) =>
        getCalculatorsByLocale(locale).map((c) => c.href),
      ),
    );
    for (const [page, declared] of Object.entries(RELATED_CALCULATORS)) {
      for (const href of declared) {
        expect(known.has(href), `${page} links to unknown ${href}`).toBe(true);
      }
    }
  });
});

describe("editorial inbound links", () => {
  // Search Console 2026-08-27→09-24 gave `/brok` 4.640 impressions at position
  // 5,3 — the 12th biggest page on the site — while it had zero editorial
  // inbound links: it is a key in `relatedMap` but no page pointed at it, and
  // it is absent from navigation, footer, home and the sidebar's popular list.
  // The only place it was linked from was its own category page.
  const GSC_TOP_PAGES = [
    "/procent",
    "/dato",
    "/tidsberegner",
    "/tidszone",
    "/moms",
    "/kvadratmeter",
    "/braendstof",
    "/renteberegner",
    "/kalorier",
    "/boligstoette",
    "/alder",
    "/brok",
    "/rentefradrag",
    "/promille",
  ] as const;

  test("/brok is reachable from /procent, the site's biggest page", () => {
    expect(RELATED_CALCULATORS["/procent"]).toContain("/brok");
    expect(getRelatedCalculators("/procent", "da").map((c) => c.href)).toContain(
      "/brok",
    );
  });

  // A page nobody links to cannot pass link weight onward, whatever its own
  // content says. This is the assertion that would have caught `/brok`.
  test("every page with documented GSC traffic has an inbound related link", () => {
    const linkedTo = new Set(Object.values(RELATED_CALCULATORS).flat());
    const orphans = GSC_TOP_PAGES.filter((page) => !linkedTo.has(page));
    expect(
      orphans,
      `no related-calculator list links to: ${orphans.join(", ")}`,
    ).toEqual([]);
  });

  // The silent `slice(0, 5)` starved three calculators of the hub pages that
  // declared them. Each lost link is named so the regression is legible.
  test("the links the cap used to drop are now rendered", () => {
    for (const [page, href] of [
      ["/dato", "/ugenummer"],
      ["/tidsberegner", "/ugenummer"],
      ["/alder", "/ugenummer"],
      ["/nedtaelling", "/ugenummer"],
      ["/kvadratmeter", "/flyttebudget"],
      ["/boligstoette", "/flyttebudget"],
      ["/promille", "/procent"],
      ["/barselsdagpenge", "/boligstoette"],
      ["/ejendomsvaerdiskat", "/boligsalg"],
      ["/andelsbolig", "/boligsalg"],
    ] as const) {
      expect(RELATED_CALCULATORS[page], `${page} -> ${href}`).toContain(href);
    }
  });
});


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

  test("describes BMI as an adult calculator", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const bmi = getCalculatorsByLocale(locale).find((calc) => calc.href === "/bmi");
      expect(bmi?.description.toLowerCase()).toMatch(/voksne|vuxna/);
    }
  });

  test("enforces the live DA/SE locale matrix", () => {
    for (const href of ["/loen-efter-skat", "/ugenummer", "/flyttebudget"]) {
      expect(isCalculatorAvailable(href, "da")).toBe(true);
      expect(isCalculatorAvailable(href, "se")).toBe(false);
    }
    for (const href of ["/lon-efter-skatt", "/bolan"]) {
      expect(isCalculatorAvailable(href, "da")).toBe(false);
      expect(isCalculatorAvailable(href, "se")).toBe(true);
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

  test("Swedish popular calculators use Swedish-only canonicals", () => {
    const hrefs = getPopularCalculators("se").map((calculator) => calculator.href);
    expect(hrefs).toContain("/lon-efter-skatt");
    expect(hrefs).toContain("/bolan");
    expect(hrefs).not.toContain("/pension");
  });
});
