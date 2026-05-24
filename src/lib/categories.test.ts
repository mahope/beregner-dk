import { describe, test, expect } from "vitest";
import { getCategoryBySlug, getBeregnereByCategoryName, getAllCategorySlugs, categories, beregnere } from "./categories";

describe("getCategoryBySlug", () => {
  test("returns category for known slug", () => {
    const cat = getCategoryBySlug("oekonomi");
    expect(cat).toBeDefined();
    expect(cat!.slug).toBe("oekonomi");
    expect(cat!.name).toBeTruthy();
    expect(cat!.title).toBeTruthy();
  });

  test("returns undefined for unknown slug", () => {
    expect(getCategoryBySlug("nonexistent")).toBeUndefined();
  });

  test("all categories have required fields", () => {
    for (const cat of categories) {
      expect(cat.slug, `category missing slug`).toBeTruthy();
      expect(cat.name, `${cat.slug} missing name`).toBeTruthy();
      expect(cat.title, `${cat.slug} missing title`).toBeTruthy();
      expect(cat.metaDescription, `${cat.slug} missing metaDescription`).toBeTruthy();
      expect(cat.faqItems.length, `${cat.slug} has no FAQ items`).toBeGreaterThan(0);
    }
  });
});

describe("getBeregnereByCategoryName", () => {
  test("returns beregnere for known category", () => {
    const result = getBeregnereByCategoryName("Økonomi");
    expect(result.length).toBeGreaterThan(0);
  });

  test("returns empty array for unknown category", () => {
    expect(getBeregnereByCategoryName("Nonexistent")).toEqual([]);
  });

  test("all beregnere have required fields", () => {
    for (const b of beregnere) {
      expect(b.title, `beregner missing title`).toBeTruthy();
      expect(b.href, `${b.title} missing href`).toMatch(/^\//);
      expect(b.category, `${b.title} missing category`).toBeTruthy();
    }
  });
});

describe("getAllCategorySlugs", () => {
  test("returns non-empty array", () => {
    const slugs = getAllCategorySlugs();
    expect(slugs.length).toBeGreaterThan(5);
  });

  test("all slugs are unique", () => {
    const slugs = getAllCategorySlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("includes expected categories", () => {
    const slugs = getAllCategorySlugs();
    expect(slugs).toContain("oekonomi");
    expect(slugs).toContain("bolig");
    expect(slugs).toContain("sundhed");
  });
});
