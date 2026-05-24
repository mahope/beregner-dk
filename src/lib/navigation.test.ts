import { describe, test, expect } from "vitest";
import { getNavigation } from "./navigation";

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
});
