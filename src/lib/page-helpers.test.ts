import { describe, expect, test } from "vitest";
import { getDomainConfigByLocale } from "./domain-config";
import { buildPageMetadata } from "./page-helpers";

describe("buildPageMetadata", () => {
  test.each(["tidsberegner", "dato", "nedtaelling", "leasing"])(
    "keeps %s self-canonical with DA/SE alternates",
    (slug) => {
      for (const locale of ["da", "se"] as const) {
        const config = getDomainConfigByLocale(locale);
        const metadata = buildPageMetadata(slug, config);
        const canonical = `${config.baseUrl}/${slug}`;

        expect(metadata.alternates?.canonical).toBe(canonical);
        expect(metadata.alternates?.languages).toMatchObject({
          da: `https://minberegner.dk/${slug}`,
          sv: `https://beraknare.se/${slug}`,
          "x-default": `https://minberegner.dk/${slug}`,
        });
        expect(metadata.alternates?.languages).not.toHaveProperty("nb");
        expect(metadata.openGraph).toMatchObject({
          url: canonical,
          siteName: config.siteName,
          locale: config.ogLocale,
        });
      }
    }
  );

  test("links the Danish salary canonical to its Swedish slug", () => {
    const metadata = buildPageMetadata(
      "loen-efter-skat",
      getDomainConfigByLocale("da")
    );

    expect(metadata.alternates).toMatchObject({
      canonical: "https://minberegner.dk/loen-efter-skat",
      languages: {
        da: "https://minberegner.dk/loen-efter-skat",
        sv: "https://beraknare.se/lon-efter-skatt",
        "x-default": "https://minberegner.dk/loen-efter-skat",
      },
    });
  });

  test("links the Swedish salary canonical to its Danish slug", () => {
    const metadata = buildPageMetadata(
      "lon-efter-skatt",
      getDomainConfigByLocale("se")
    );

    expect(metadata.alternates).toMatchObject({
      canonical: "https://beraknare.se/lon-efter-skatt",
      languages: {
        da: "https://minberegner.dk/loen-efter-skat",
        sv: "https://beraknare.se/lon-efter-skatt",
        "x-default": "https://minberegner.dk/loen-efter-skat",
      },
    });
  });

  test("fails closed for a page without data in the active locale", () => {
    for (const [slug, locale] of [
      ["loen-efter-skat", "se"],
      ["lon-efter-skatt", "da"],
    ] as const) {
      const metadata = buildPageMetadata(slug, getDomainConfigByLocale(locale));
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(metadata.alternates).toBeUndefined();
      expect(metadata.openGraph).toBeUndefined();
    }
  });
});
