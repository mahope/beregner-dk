import { describe, test, expect } from "vitest";
import { getPageData, getAvailableSlugs } from "./page-data";
import { getCalculatorHrefs, isCalculatorAvailable } from "./calculator-list";
import { beregnPromille } from "./promille";
import { sammenlignEnhedspris } from "./enhedspris";

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
      title: "Enhedspris: 35 kr. for 2 kg = 17,50 kr. pr. kg",
      visible: "35 kr. for 2 kg koster 17,50 kr. pr. kg",
      perUnit: "17,50",
      saving: "12,5 %",
      faq: /billigst pr. kilo/,
    },
    {
      locale: "se" as const,
      title: "Jämförpris: 35 kr för 2 kg = 17,50 kr per kg",
      visible: "35 kr för 2 kg kostar 17,50 kr per kg",
      perUnit: "17,50",
      saving: "12,5 %",
      faq: /billigast per kilo/,
    },
  ])(
    "has answer-first unit-price metadata for $locale",
    ({ locale, title, visible, perUnit, saving, faq }) => {
      const data = getPageData("enhedspris", locale)!;

      expect(data.metaTitle).toBe(title);
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(visible);
      expect(data.metaDescription).toContain(perUnit);
      expect(data.metaDescription).toContain(saving);
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(title);
      expect(data.ogDescription).toContain(perUnit);
      expect(data.schemaDescription).toContain(perUnit);
      const exampleFaq = data.faqItems.find((item) => faq.test(item.question));
      expect(exampleFaq?.answer).toContain(perUnit);
      expect(exampleFaq?.answer).toContain(saving);
    }
  );

  test("enhedspris-eksemplet i metadata følger sammenlignEnhedspris", () => {
    const example = sammenlignEnhedspris(20, 1, 35, 2)!;
    expect(example.enhedsprisA).toBe(20);
    expect(example.enhedsprisB).toBe(17.5);
    expect(example.billigst).toBe("B");
    expect(Math.round(example.besparelseProcent * 10) / 10).toBe(12.5);

    for (const locale of ["da", "se"] as const) {
      const data = getPageData("enhedspris", locale)!;
      for (const text of [data.description, data.metaDescription, data.ogDescription, data.schemaDescription]) {
        expect(text).toContain("17,50");
        expect(text).toContain("12,5");
      }
    }
  });

  test.each([
    {
      locale: "da" as const,
      title: "Vægttab: 6 kg på 12 uger = 550 kcal/dag",
      visible: "6 kg på 12 uger kræver 550 kcal",
      goal: /6 kg på 12 uger\?$/,
    },
    { locale: "se" as const, title: "Viktminskning: 6 kg på 12 veckor = 550 kcal/dag", visible: "6 kg på 12 veckor kräver 550 kcal", goal: /6 kg på 12 veckor\?$/ },
    { locale: "no" as const, title: "Vekttap: 6 kg på 12 uker = 550 kcal/dag", visible: "6 kg på 12 uker krever 550 kcal", goal: /6 kg på 12 uker\?$/ },
  ])(
    "has answer-first weight-loss metadata for $locale",
    ({ locale, title, visible, goal }) => {
      const data = getPageData("vaegttab", locale)!;

      expect(data.metaTitle).toBe(title);
      expect(data.metaTitle.length).toBeLessThanOrEqual(60);
      expect(data.description).toContain(visible);
      expect(data.description).toContain("2.209");
      expect(data.metaDescription).toContain("550 kcal");
      expect(data.metaDescription).toContain("2.209");
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.ogTitle).toBe(title);
      expect(data.ogDescription).toContain("2.209");
      expect(data.schemaDescription).toContain("2.209");
      const goalFaq = data.faqItems.find((item) => goal.test(item.question));
      expect(goalFaq?.answer).toContain("2.759");
      expect(goalFaq?.answer).toContain("550 kcal");
      expect(goalFaq?.answer).toContain("2.209");
    }
  );

  test("vægttab-eksemplet følger VaegttabBeregners formel", () => {
    // Mifflin-St Jeor + aktivitetsfaktor 1,55 + 7.700 kcal pr. kg, som i VaegttabBeregner.tsx
    const bmr = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
    const tdee = bmr * 1.55;
    const dagligtDeficit = (6 * 7700) / (12 * 7);
    expect(bmr).toBe(1780);
    expect(tdee).toBe(2759);
    expect(dagligtDeficit).toBe(550);
    expect(Math.round(tdee - dagligtDeficit)).toBe(2209);

    for (const locale of ["da", "se", "no"] as const) {
      const data = getPageData("vaegttab", locale)!;
      expect(data.description).toContain("550");
      expect(data.description).toContain("2.209");
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

describe("2026-skattetall i lønsidernes FAQ", () => {
  const supersede = ["24,94", "25,07", "0,68%", "15% topskat"];

  test.each(["loen-efter-skat", "brutto-netto"])(
    "%s nævner kun den verificerede kommuneskat",
    (slug) => {
      const data = getPageData(slug, "da")!;
      const text = [data.description, ...data.faqItems.map((i) => `${i.question} ${i.answer}`)].join(
        " "
      );

      expect(text).toContain("25,049");
      for (const stale of supersede) {
        expect(text, `${slug} nævner ${stale}`).not.toContain(stale);
      }
    }
  );

  test("topkat-spørgsmålet beskriver 2026-brackets, ikke den afskaffede 15 %", () => {
    const data = getPageData("loen-efter-skat", "da")!;
    const faq = data.faqItems.find((item) =>
      item.question.includes("Hvordan beregnes min løn efter skat")
    );

    expect(faq?.answer).toContain("7,5%");
    expect(faq?.answer).toContain("afskaffet");
  });
});

describe("svensk leasing-metadata", () => {
  const data = getPageData("leasing", "se")!;

  test("er svar-først med kalkylatorens egne standardtal", () => {
    // Uværdierne er kalkylatorens default: 300.000 kr bilpris, 150.000 kr
    // restværde, 4,5 % rente, 30.000 kr kontantinsats, 36 måneder.
    // afskrivning 120.000/36 = 3.333,33 + 4,5 %/12 på 210.000 = 787,50.
    expect(data.title).toBe("Leasingkalkylator: bil på 300.000 kr = 4.121 kr/mån");
    expect(data.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data.metaDescription).toContain("4.121 kr");
    expect(data.metaDescription.length).toBeLessThanOrEqual(160);
    expect(data.ogTitle).toBe(data.metaTitle);
    expect(data.ogDescription).toContain("4.121 kr");
    expect(data.schemaDescription).toContain("4.121 kr");
  });

  test("FAQ'en er skrevet på svenska og bruger kalkylatorens tal", () => {
    const text = data.faqItems.map((item) => `${item.question} ${item.answer}`).join(" ");

    expect(text).toContain("4.121 kr");
    expect(text).toContain("178.350 kr");
    expect(text).toMatch(/leasingkalkylatorn|kalkylatorn/);
    // Ingen norske eller danske rester i den svenska FAQ. å/ä/ö er ægte
    // svenske bogstaver, så det er kun æ og ø der afslører et dansk/norsk leak.
    expect(text).not.toMatch(/jeg|kalkylatoren på mobilen|hvor mye/i);
    expect(text).not.toMatch(/[æø]/i);
  });
});

describe("svenska svar på frågeformulerade sökningar", () => {
  // Search Console 2026-08-27→09-24: de tre svenska sidor med flest visninger
  // rankar på frågeformulerede sökningar ("antal dagar mellan datum",
  // "räkna ut timmar och minuter", "färetagsleasing bil kalkyl"), men frågan
  // fanns inte på sidan. position 8-15 med 0,1-0,9 % CTR er et spørgsmål om
  // svarform, ikke om titel.
  const frageForm = (slug: string, locale: "da" | "no" | "se" = "se") =>
    getPageData(slug, locale)!.faqItems.map((item) => `${item.question} ${item.answer}`).join(" ");

  test("/dato svarar på de fire svenska dags-sökninger", () => {
    const text = frageForm("dato").toLowerCase();
    expect(text).toContain("hur många dagar är det mellan två datum");
    expect(text).toContain("antalet dagar mellan datum");
    expect(text).toContain("hur många dagar till 31 december");
  });

  test("/tidsberegner svarar på de svenska tids-sökninger", () => {
    const text = frageForm("tidsberegner").toLowerCase();
    expect(text).toContain("hur räknar jag ut timmar och minuter");
    expect(text).toContain("hur lång tid det tar");
    // 08:30→16:45 = 8:15 er kalkylatorens eget eksempel i descriptionen.
    expect(text).toContain("08:30 till 16:45 är 8 timmar och 15 minuter");
  });

  test("/leasing nævner färetagsleasing og svarer på leasingkostnaden", () => {
    const text = frageForm("leasing").toLowerCase();
    expect(text).toContain("färetagsleasing");
    expect(text).toContain("4.121 kr");
  });

  // SE /procent har 23.294 visninger og 2 klik (pos. 10,2) — så meget
  // inside på side 2. Autocomplete (hl=sv, 2026-09-26) viser at de svenske
  // søgningerne er spørgsmål om konkrete opgaver: "hur räknar man ut
  // procent i excel", "procent av summa" og "hur räknar man ut procent på
  // lön". Ingen af dem fandtes på siden.
  test("/procent svarar på de svenska procent-søgninger", () => {
    const text = frageForm("procent").toLowerCase();
    expect(text).toContain("hur räknar man ut procent i excel");
    expect(text).toContain("=a1/b1*100");
    expect(text).toContain("hur stor del av en summa");
    expect(text).toContain("hur räknar man ut procent på lön");
  });

  // Dansk/norsk skal være urørt: den danske sides tax-eksempel (37 %) er en
  // dansk sats på en svensk side, og det er svensken der mangler tal.
  test("de danske og norske /procent-sider er uændrede", () => {
    for (const locale of ["da", "no"] as const) {
      const text = frageForm("procent", locale);
      expect(text).not.toMatch(/i excel/i);
    }
  });

  test("den svenska leasing-FAQ har ingen dansk rester eller brudt svensk", () => {
    const text = frageForm("leasing");
    // "värktiga" var en dansk læk, "földer" stavfel, og "mindre går att betala
    // med bilen er till salu" var en sætning uden mening.
    expect(text).not.toMatch(/värktiga|földer|er till salu|mindre går att betala/);
    expect(text).not.toMatch(/værktøj|værkti/);
  });
});

describe("danske svar på tids-søgninger", () => {
  // Search Console 2026-08-27→09-24: /tidsberegner har 72.382 visninger og
  // 207 klik — CTR 0,3 % på position 7,0, tredjestørste CTR-tab på sitet.
  // Søgningerne er spørgsmål ("hvor lang tid" 790 visninger pos. 6, "time
  // beregner" 119v pos. 8, "beregn tid" 94v pos. 7), men title/description
  // lovede et eksempel ("08:30 til 16:45 er 8 timer og 15 minutter") der
  // ikke stod nogen steder i brødteksten. FAQ'en er samme kilde som
  // JSON-LD, så et spørgsmål der mangler her mangler også struktureret.
  const frageForm = (slug: string) =>
    getPageData(slug, "da")!.faqItems
      .map((item) => `${item.question} ${item.answer}`)
      .join(" ");

  test("/tidsberegner svarer på 'hvor lang tid' med et konkret tal", () => {
    const text = frageForm("tidsberegner");
    expect(text).toContain("Hvor lang tid er der mellem to klokkeslæt?");
    expect(text).toContain("08:30 til 16:45 er 8 timer og 15 minutter");
  });

  test("/tidsberegner svarar på head-ternerne 'time beregner' og 'beregn tid'", () => {
    const text = frageForm("tidsberegner");
    // "time beregner" er stavemåden af head-ordet; "beregn tid" er det
    // danske spørgsmål. Begge skal kunne findes i FAQ'ens spørgsmål/svar.
    expect(text.toLowerCase()).toContain("beregner jeg arbejdstid");
    expect(text).toContain("Kan jeg trække en pause fra?");
  });

  test("/tidsberegner dækker både pause og tid over midnat med tal", () => {
    const text = frageForm("tidsberegner");
    expect(text).toContain("30 minutters pause er 7 timer og 30 minutter");
    expect(text).toContain("22:00 til 06:00 er 8 timer");
  });

  test("FAQ'en er ikke længere de tre korte svar uden eksempel", () => {
    const data = getPageData("tidsberegner", "da")!;
    expect(data.faqItems.length).toBeGreaterThanOrEqual(6);
    for (const item of data.faqItems) {
      expect(item.answer.length).toBeGreaterThan(40);
    }
  });
});
