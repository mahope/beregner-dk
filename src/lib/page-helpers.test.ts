import { describe, expect, test } from "vitest";
import { getDomainConfigByLocale } from "./domain-config";
import { buildPageMetadata } from "./page-helpers";

describe("buildPageMetadata", () => {
  test.each(["tidsberegner", "moms", "dato", "nedtaelling", "leasing"])(
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

  test.each([
    {
      locale: "da" as const,
      title: "Procentberegner – beregn 10 procent af et tal",
      description: "10 procent af et tal er tallet × 0,10. 10 procent af 250 er 25. Beregn også stigning, fald og andre procentopgaver.",
    },
    {
      locale: "se" as const,
      title: "Procenträknare – beräkna 10 procent av ett tal",
      description: "10 procent av ett tal är talet × 0,10. 10 procent av 250 är 25. Beräkna också ökning, minskning och andra procentuppgifter.",
    },
  ])("builds answer-first percentage metadata for $locale", ({ locale, title, description }) => {
    const metadata = buildPageMetadata("procent", getDomainConfigByLocale(locale));

    expect(metadata).toMatchObject({
      title: { absolute: title },
      description,
      openGraph: { title, description },
    });
  });

  test.each([
    {
      slug: "tidsberegner" as const,
      locale: "da" as const,
      title: "Tidsberegner – timer mellem klokkeslæt | MinBeregner.dk",
      description: "Beregn hvor lang tid der går mellem to klokkeslæt. Eksempel: 08:30 til 16:45 er 8 timer og 15 minutter. Se decimaltimer og træk en pause fra.",
    },
    {
      slug: "tidsberegner" as const,
      locale: "se" as const,
      title: "Tidskalkylator – timmar mellan klockslag | Beräknare.se",
      description: "Beräkna hur lång tid det går mellan två klockslag. Exempel: 08:30 till 16:45 är 8 timmar och 15 minuter. Se decimaltimmar och dra av en rast.",
    },
    {
      slug: "moms" as const,
      locale: "da" as const,
      title: "Momsberegner 25 % – inkl. og ekskl. moms | MinBeregner.dk",
      description: "Beregn dansk moms på 25 %. Læg moms til 1.000 kr. og få 1.250 kr. Træk også moms fra en pris inkl. moms, eller find momsandelen.",
    },
    {
      slug: "moms" as const,
      locale: "se" as const,
      title: "Momskalkylator – inkl. och exkl. moms | Beräknare.se",
      description: "Beräkna svensk moms på 25 %. Lägg till 1 000 kr. och få 1 250 kr. Dra av moms eller hitta momsandelen.",
    },
  ])("builds answer-first metadata for $slug in $locale", ({ slug, locale, title, description }) => {
    const metadata = buildPageMetadata(slug, getDomainConfigByLocale(locale));

    expect(metadata).toMatchObject({
      title: { absolute: title },
      description,
      openGraph: { title, description },
    });
  });

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
