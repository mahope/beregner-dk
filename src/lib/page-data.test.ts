import { describe, test, expect } from "vitest";
import { getPageData, getAvailableSlugs } from "./page-data";
import { getCalculatorHrefs, isCalculatorAvailable } from "./calculator-list";
import { beregnPromille } from "./promille";

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

  test.each([
    {
      locale: "da" as const,
      title: "Procentberegner – beregn 10 procent af et tal",
      intent: "10 procent af",
      answer: "10 procent af 250 er 25",
    },
    {
      locale: "se" as const,
      title: "Procenträknare – beräkna 10 procent av ett tal",
      intent: "10 procent av",
      answer: "10 procent av 250 är 25",
    },
  ])("has answer-first percentage metadata for $locale", ({ locale, title, intent, answer }) => {
    const data = getPageData("procent", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(answer);
    expect(data.metaDescription).toContain(answer);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(answer);
    expect(data.schemaDescription).toContain(intent);
  });

  test.each([
    {
      locale: "da" as const,
      title: "Renteberegner: 100.000 kr. i 5 år = 1.887 kr./md.",
      loanType: "annuitetslån",
    },
    {
      locale: "se" as const,
      title: "Räntekalkylator: 100.000 kr i 5 år = 1.887 kr/mån",
      loanType: "annuitetslån",
    },
    {
      locale: "no" as const,
      title: "Rentekalkulator: 100.000 kr i 5 år = 1.887 kr/md",
      loanType: "annuitetslån",
    },
  ])("has answer-first loan metadata for $locale", ({ locale, title, loanType }) => {
    const data = getPageData("renteberegner", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain("1.887");
    expect(data.description).toContain("13.227");
    expect(data.description).toContain(loanType);
    expect(data.metaDescription).toContain("1.887");
    expect(data.metaDescription).toContain("13.227");
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain("1.887");
    expect(data.ogDescription).toContain("13.227");
    expect(data.schemaDescription).toContain(loanType);
  });

  test.each([
    {
      locale: "da" as const,
      title: "Hvor mange kalorier om dagen? | Kalorieberegner",
      question: "Hvor mange kalorier skal du have om dagen?",
      diet: "2.259",
    },
    {
      locale: "se" as const,
      title: "Hur många kalorier per dag? | Kalorikalkylator",
      question: "Hur många kalorier behöver du per dag?",
      diet: "2.259",
    },
    {
      locale: "no" as const,
      title: "Hvor mange kalorier per dag? | Kalorikalkulator",
      question: "Hvor mange kalorier trenger du per dag?",
      diet: "2.259",
    },
  ])("has answer-first calorie metadata for $locale", ({ locale, title, question, diet }) => {
    const data = getPageData("kalorier", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(question);
    expect(data.description).toContain("1.780");
    expect(data.description).toContain("2.759");
    expect(data.metaDescription).toContain("1.780");
    expect(data.metaDescription).toContain("2.759");
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.schemaDescription).toContain("BMR");
    const dietFaq = data.faqItems.find((item) => item.answer.includes(diet));
    expect(dietFaq).toBeDefined();
  });

  test.each([
    {
      locale: "da" as const,
      title: "Aldersberegner: hvor gammel er du i år, måneder og dage?",
      age: "36 år, 6 måneder og 10 dage",
      days: "13.342 dage",
      birthDate: "fødselsdato",
    },
    {
      locale: "se" as const,
      title: "Ålderskalkylator: hur gammal är du i år, månader och dagar?",
      age: "36 år, 6 månader och 10 dagar",
      days: "13.342 dagar",
      birthDate: "födelsedatum",
    },
    {
      locale: "no" as const,
      title: "Alderskalkulator: hvor gammel er du i år, måneder og dager?",
      age: "36 år, 6 måneder og 10 dager",
      days: "13.342 dager",
      birthDate: "fødselsdatoen",
    },
  ])("has answer-first age metadata for $locale", ({ locale, title, age, days, birthDate }) => {
    const data = getPageData("alder", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(age);
    expect(data.metaDescription).toContain(age);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(age);
    expect(data.schemaDescription).toContain(birthDate);
    const daysFaq = data.faqItems.find((item) => item.answer.includes(days));
    expect(daysFaq).toBeDefined();
  });

  test.each(["da", "se", "no"] as const)(
    "dropper den frosne alders-sum i %s",
    (locale) => {
      const data = getPageData("alder", locale)!;

      expect(data.metaDescription).not.toContain("35 år");
      expect(data.description).not.toContain("35 år");
    }
  );

  test.each([
    {
      locale: "da" as const,
      title: "Brændstofberegner: 500 km benzin koster 450 kr.",
      fuel: "benzin",
      cost: "450 kr.",
      perKm: "0,90 kr. pr. km",
    },
    {
      locale: "se" as const,
      title: "Bränslekalkylator: 500 km bensin kostar 450 kr",
      fuel: "bensin",
      cost: "450 kr",
      perKm: "0,90 kr. per km",
    },
    {
      locale: "no" as const,
      title: "Drivstoffkalkulator: 500 km bensin koster 450 kr.",
      fuel: "bensin",
      cost: "450 kr.",
      perKm: "0,90 kr. per km",
    },
  ])("has answer-first fuel metadata for $locale", ({ locale, title, fuel, cost, perKm }) => {
    const data = getPageData("braendstof", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(cost);
    expect(data.description).toContain(perKm);
    expect(data.metaDescription).toContain(cost);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(cost);
    expect(data.schemaDescription).toContain(fuel);
    const exampleFaq = data.faqItems.find((item) => item.answer.includes(cost));
    expect(exampleFaq).toBeDefined();
  });

  test.each([
    {
      locale: "da" as const,
      title: "Kvadratmeterberegner: 5 x 4 m = 20 m²",
      area: "20 m²",
      heading: "Et rum på 5 x 4 m er 20 m²",
      price: "3.000 kr.",
    },
    {
      locale: "se" as const,
      title: "Kvadratmeterkalkylator: 5 x 4 m = 20 m²",
      area: "20 m²",
      heading: "Ett rum på 5 x 4 m är 20 m²",
      price: "3.000 kr",
    },
    {
      locale: "no" as const,
      title: "Kvadratmeterkalkylator: 5 x 4 m = 20 m²",
      area: "20 m²",
      heading: "Et rom på 5 x 4 m er 20 m²",
      price: "3.000 kr",
    },
  ])("has answer-first area metadata for $locale", ({ locale, title, area, heading, price }) => {
    const data = getPageData("kvadratmeter", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(heading);
    expect(data.description).toContain(area);
    expect(data.metaDescription).toContain(area);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(area);
    expect(data.schemaDescription).toContain(area);
    const priceFaq = data.faqItems.find((item) => item.answer.includes(price));
    expect(priceFaq).toBeDefined();
  });

  test.each([
    {
      locale: "da" as const,
      title: "Brøkberegner: forkort 6/8 til 3/4 = 0,75 = 75 %", answer: "6/8 forkortet = 3/4 = 0,75 = 75 %" },
    { locale: "se" as const, title: "Bråkkalkylator: förkorta 6/8 till 3/4 = 0,75 = 75 %", answer: "6/8 förkortat = 3/4 = 0,75 = 75 %" },
  ])("has answer-first fraction metadata for $locale", ({ locale, title, answer }) => {
    const data = getPageData("brok", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(answer);
    expect(data.metaDescription).toContain("3/4 = 0,75 = 75 %");
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain("3/4 = 0,75 = 75 %");
    expect(data.schemaDescription).toContain("decimaltal");
    const exampleFaq = data.faqItems.find((item) => item.question.includes("6/8"));
    expect(exampleFaq).toBeDefined();
  });

  test.each([
    {
      locale: "da" as const,
      title: "Promilleberegner: 4 øl på 80 kg = 0,88 ‰",
      visible: "4 øl til en mand på 80 kg giver 0,88 ‰",
      answer: "4 øl på 80 kg = 0,88 ‰",
      drivingAfter: "5,9 timer",
      limit: "0,5 ‰",
    },
    {
      locale: "se" as const,
      title: "Promillekalkylator: 4 öl på 80 kg = 0,88 ‰",
      visible: "4 öl till en man på 80 kg ger 0,88 ‰",
      answer: "4 öl på 80 kg = 0,88 ‰",
      drivingAfter: "5,9 timmar",
      limit: "0,2 ‰",
    },
  ])(
    "has answer-first promille metadata for $locale",
    ({ locale, title, visible, answer, drivingAfter, limit }) => {
      const data = getPageData("promille", locale)!;

      expect(data.metaTitle).toBe(title);
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(visible);
      expect(data.metaDescription).toContain(answer);
      expect(data.metaDescription).toContain(limit);
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(title);
      expect(data.ogDescription).toContain(answer);
      expect(data.schemaDescription).toContain(answer);
      const soberFaq = data.faqItems.find((item) => /køre bil igen|köra bil igen/.test(item.question));
      expect(soberFaq?.answer).toContain(answer);
      expect(soberFaq?.answer).toContain(drivingAfter);
    }
  );

  test("promille-eksemplet i metadata følger beregningen", () => {
    const example = beregnPromille(4, 80, "mand", 0)!;
    expect(example.promille).toBe(0.88);
    expect(example.timerTilNul).toBe(5.9);

    for (const locale of ["da", "se"] as const) {
      const data = getPageData("promille", locale)!;
      expect(data.description).toContain("0,88 ‰");
      expect(data.metaDescription).toContain("0,88 ‰");
      const soberFaq = data.faqItems.find((item) => /køre bil igen|köra bil igen/.test(item.question));
      expect(soberFaq?.answer).toContain("0,88 ‰");
      expect(soberFaq?.answer).toContain("5,9");
    }
  });

  test.each([
    {
      locale: "da" as const,
      title: "Beregn antal dage mellem to datoer | MinBeregner.dk",
      heading: "Beregn antal dage mellem to datoer",
      intent: "antal dage mellem to datoer",
      answer: "Vælg en startdato og en slutdato",
      months: "ca. måneder",
    },
    {
      locale: "se" as const,
      title: "Beräkna antal dagar mellan två datum | Beräknare.se",
      heading: "Beräkna antal dagar mellan två datum",
      intent: "antal dagar mellan två datum",
      answer: "Välj ett startdatum och ett slutdatum",
      months: "ungefärligt antal månader",
    },
  ])("has answer-first date metadata for $locale", ({ locale, title, heading, intent, answer, months }) => {
    const data = getPageData("dato", locale)!;

    expect(data.title).toBe(heading);
    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(answer);
    expect(data.description).toContain(months);
    expect(data.metaDescription).toContain(intent);
    expect(data.metaDescription).toContain(months);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(intent);
    expect(data.ogDescription).toContain(months);
    expect(data.schemaDescription).toContain(intent);
    expect(data.schemaDescription).toContain(months);
  });

  test.each([
    {
      locale: "da" as const,
      title: "Tidsberegner – timer mellem klokkeslæt | MinBeregner.dk",
      intent: "mellem to klokkeslæt",
      example: "08:30 til 16:45 er 8 timer og 15 minutter",
      schema: "Gratis tidsberegner. Beregn tidsrum mellem to klokkeslæt og se resultatet i timer, minutter og decimaltimer.",
    },
    {
      locale: "se" as const,
      title: "Tidskalkylator – timmar mellan klockslag | Beräknare.se",
      intent: "mellan två klockslag",
      example: "08:30 till 16:45 är 8 timmar och 15 minuter",
      schema: "Gratis tidskalkylator. Beräkna tidsintervall mellan två klockslag och se resultatet i timmar, minuter och decimaltimmar.",
    },
  ])("has answer-first time metadata for $locale", ({ locale, title, intent, example, schema }) => {
    const data = getPageData("tidsberegner", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(intent);
    expect(data.metaDescription).toContain(example);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(example);
    expect(data.schemaDescription).toBe(schema);
  });

  test.each([
    {
      locale: "da" as const,
      title: "Momsberegner 25 % – inkl. og ekskl. moms | MinBeregner.dk",
      answer: "1.000 kr. og få 1.250 kr.",
      schema: "Gratis momsberegner. Beregn dansk moms på 25 % med priser inkl. og ekskl. moms.",
    },
    {
      locale: "se" as const,
      title: "Momskalkylator – inkl. och exkl. moms | Beräknare.se",
      answer: "1 000 kr. och få 1 250 kr.",
      schema: "Gratis momskalkylator. Beräkna svensk moms på 25 %, 12 % och 6 % med priser inkl. och exkl. moms.",
    },
  ])("has answer-first VAT metadata for $locale", ({ locale, title, answer, schema }) => {
    const data = getPageData("moms", locale)!;

    expect(data.metaTitle).toBe(title);
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.description).toContain(answer);
    expect(data.metaDescription).toContain(answer);
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(title);
    expect(data.ogDescription).toContain(answer);
    expect(data.schemaDescription).toBe(schema);
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
    const daOnlySlugs = ["loen-efter-skat", "dagpenge", "su", "ugenummer", "flyttebudget"];
    for (const slug of daOnlySlugs) {
      expect(getAvailableSlugs("da")).toContain(slug);
      expect(getAvailableSlugs("se")).not.toContain(slug);
      expect(getAvailableSlugs("no")).not.toContain(slug);
    }
  });

  test("live-domain availability matches localized page data", () => {
    for (const locale of ["da", "se"] as const) {
      for (const href of getCalculatorHrefs()) {
        const slug = href.slice(1);
        expect(
          isCalculatorAvailable(href, locale),
          `${locale}/${slug} availability mismatch`
        ).toBe(Boolean(getPageData(slug, locale)));
      }
    }
  });
});
