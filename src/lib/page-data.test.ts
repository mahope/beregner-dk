import { describe, test, expect } from "vitest";
import { getPageData, getAvailableSlugs } from "./page-data";

describe("getPageData", () => {
  test("returns data for known DA slug", () => {
    const data = getPageData("bmi", "da");
    expect(data).toBeDefined();
    expect(data!.slug).toBe("bmi");
    expect(data!.metaTitle).toBeTruthy();
    expect(data!.faqItems.length).toBeGreaterThan(0);
  });

  test("returns data for known SE slug", () => {
    const data = getPageData("bmi", "se");
    expect(data).toBeDefined();
    expect(data!.slug).toBe("bmi");
  });

  test("returns data for known NO slug", () => {
    const data = getPageData("bmi", "no");
    expect(data).toBeDefined();
    expect(data!.slug).toBe("bmi");
  });

  test("BMI metadata and child FAQ are adult-oriented", () => {
    const expectedAdultWord = { da: "voksne", no: "voksne", se: "vuxna" } as const;

    for (const locale of ["da", "no", "se"] as const) {
      const data = getPageData("bmi", locale)!;
      const adultWord = expectedAdultWord[locale];
      expect(data.title.toLowerCase()).toContain(adultWord);
      expect(data.metaTitle.toLowerCase()).toContain(adultWord);
      expect(data.metaDescription.toLowerCase()).toContain(adultWord);
      expect(data.metaDescription).toContain("1,75²");
      expect(data.metaDescription).not.toContain("1,75m");
      expect(data.ogTitle.toLowerCase()).toContain(adultWord);
      expect(data.ogDescription.toLowerCase()).toContain(adultWord);
      expect(data.schemaName.toLowerCase()).toContain(adultWord);
      expect(data.schemaDescription.toLowerCase()).toContain(adultWord);
      const childFaq = data.faqItems.find((item) => /børn|barn|children/i.test(item.question));
      expect(childFaq?.answer).toMatch(/percentil/i);
      expect(childFaq?.answer).not.toMatch(/persentil/i);
    }
  });

  test("returns undefined for DA-only slug on SE", () => {
    const data = getPageData("loen-efter-skat", "se");
    expect(data).toBeUndefined();
  });

  test("returns data for DA-only slug on DA", () => {
    const data = getPageData("loen-efter-skat", "da");
    expect(data).toBeDefined();
    expect(data!.slug).toBe("loen-efter-skat");
  });

  test("returns undefined for non-existent slug", () => {
    expect(getPageData("does-not-exist", "da")).toBeUndefined();
  });

  test("all page data has required fields", () => {
    const requiredFields = [
      "slug", "title", "description", "metaTitle", "metaDescription",
      "keywords", "ogTitle", "ogDescription", "category",
    ] as const;

    for (const locale of ["da", "no", "se"] as const) {
      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale);
        expect(data, `Missing page data for ${locale}/${slug}`).toBeDefined();
        for (const field of requiredFields) {
          expect(data![field], `${locale}/${slug} missing field: ${field}`).toBeTruthy();
        }
      }
    }
  });
});

describe("getAvailableSlugs", () => {
  test("DA has the most slugs (all calculators)", () => {
    const da = getAvailableSlugs("da");
    const se = getAvailableSlugs("se");
    const no = getAvailableSlugs("no");
    expect(da.length).toBeGreaterThan(se.length);
    expect(da.length).toBeGreaterThan(no.length);
  });

  test("SE has at least as many slugs as NO (SE-only calculators allowed)", () => {
    const se = getAvailableSlugs("se");
    const no = getAvailableSlugs("no");
    // SE ships Swedish-only calculators (e.g. lön efter skatt) that NO lacks.
    expect(se.length).toBeGreaterThanOrEqual(no.length);
  });

  test("all universal slugs exist on all locales", () => {
    const universalSlugs = ["bmi", "moms", "procent", "valuta", "boliglaan"];
    for (const slug of universalSlugs) {
      for (const locale of ["da", "no", "se"] as const) {
        expect(
          getAvailableSlugs(locale),
          `${slug} missing from ${locale}`
        ).toContain(slug);
      }
    }
  });

  test("DA-only slugs do not exist on SE/NO", () => {
    const daOnlySlugs = ["loen-efter-skat", "dagpenge", "su"];
    for (const slug of daOnlySlugs) {
      expect(getAvailableSlugs("da")).toContain(slug);
      expect(getAvailableSlugs("se")).not.toContain(slug);
      expect(getAvailableSlugs("no")).not.toContain(slug);
    }
  });
});
