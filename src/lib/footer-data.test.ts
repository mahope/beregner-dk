import { describe, test, expect } from "vitest";
import { getFooterCategories, getFooterBlogLinks } from "./footer-data";

describe("getFooterCategories", () => {
  test("returns categories for all locales", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const cats = getFooterCategories(locale);
      expect(cats.length, `${locale} should have footer categories`).toBeGreaterThan(0);
    }
  });

  test("all categories have name and links", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const cat of getFooterCategories(locale)) {
        expect(cat.name, `${locale}: category missing name`).toBeTruthy();
        expect(cat.links.length, `${locale}:${cat.name} has no links`).toBeGreaterThan(0);
        for (const link of cat.links) {
          expect(link.name).toBeTruthy();
          expect(link.href).toMatch(/^\//);
        }
      }
    }
  });

  test("DA has more total links than SE/NO", () => {
    const daLinks = getFooterCategories("da").reduce((sum, cat) => sum + cat.links.length, 0);
    const seLinks = getFooterCategories("se").reduce((sum, cat) => sum + cat.links.length, 0);
    expect(daLinks).toBeGreaterThan(seLinks);
  });
});

describe("getFooterBlogLinks", () => {
  test("DA has blog links", () => {
    const links = getFooterBlogLinks("da");
    expect(links.length).toBeGreaterThan(0);
  });

  test("SE and NO have no blog links", () => {
    expect(getFooterBlogLinks("se")).toEqual([]);
    expect(getFooterBlogLinks("no")).toEqual([]);
  });

  test("all DA blog links have valid hrefs", () => {
    for (const link of getFooterBlogLinks("da")) {
      expect(link.name).toBeTruthy();
      expect(link.href).toMatch(/^\/blog\//);
    }
  });
});
