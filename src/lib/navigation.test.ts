import { describe, test, expect } from "vitest";
import { getNavigation } from "./navigation";
import { isCalculatorAvailable } from "./calculator-list";

describe("getNavigation", () => {
  test("returns non-empty array for all locales", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const nav = getNavigation(locale);
      expect(nav.length).toBeGreaterThan(0);
    }
  });

  test("all nav items have name, and either href or children", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const item of getNavigation(locale)) {
        expect(item.name).toBeTruthy();
        expect(item.href || item.children?.length, `${locale}: ${item.name} has neither href nor children`).toBeTruthy();
        if (item.children) {
          for (const child of item.children) {
            expect(child.name).toBeTruthy();
            expect(child.href).toMatch(/^\//);
          }
        }
      }
    }
  });

  test("all child hrefs start with /", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const item of getNavigation(locale)) {
        if (item.children) {
          for (const child of item.children) {
            expect(child.href, `${locale}: ${child.name}`).toMatch(/^\//);
          }
        }
      }
    }
  });

  test("DA has more nav items than SE/NO", () => {
    const da = getNavigation("da");
    const se = getNavigation("se");
    const no = getNavigation("no");
    const daTotal = da.reduce((sum, item) => sum + (item.children?.length || 1), 0);
    const seTotal = se.reduce((sum, item) => sum + (item.children?.length || 1), 0);
    const noTotal = no.reduce((sum, item) => sum + (item.children?.length || 1), 0);
    expect(daTotal).toBeGreaterThan(seTotal);
    expect(daTotal).toBeGreaterThan(noTotal);
  });

  test("Swedish navigation links both Swedish-only calculators", () => {
    const hrefs = getNavigation("se")
      .flatMap((item) => item.children ?? [])
      .map((child) => child.href);
    expect(hrefs).toContain("/lon-efter-skatt");
    expect(hrefs).toContain("/bolan");
  });

  test("navigation only links calculators available in its locale", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const item of getNavigation(locale)) {
        for (const child of item.children ?? []) {
          if (child.href.startsWith("/kategori") || child.href === "/blog") continue;
          expect(
            isCalculatorAvailable(child.href, locale),
            `${locale}:${child.href}`
          ).toBe(true);
        }
      }
    }
  });

  test("labels BMI navigation links for adults", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const bmi = getNavigation(locale)
        .flatMap((item) => item.children ?? [])
        .find((child) => child.href === "/bmi");
      expect(bmi?.name).toMatch(/voksne|vuxna/);
    }
  });

  test("nav names contain no emojis and no stray whitespace", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const item of getNavigation(locale)) {
        const names = [item.name, ...(item.children?.map((c) => c.name) ?? [])];
        for (const name of names) {
          expect(name).not.toMatch(/\p{Extended_Pictographic}/u);
          expect(name).toBe(name.trim());
        }
      }
    }
  });
});
