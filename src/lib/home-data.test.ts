import { describe, test, expect } from "vitest";
import {
  getHomePageData,
  getHomeCalculators,
  getHomeCalculatorCount,
} from "./home-data";
import { isCalculatorAvailable } from "./calculator-list";

describe("getHomePageData", () => {
  test("returns data for all locales", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const data = getHomePageData(locale);
      expect(data.hero.title, `${locale} hero title`).toBeTruthy();
      expect(data.hero.subtitle, `${locale} hero subtitle`).toBeTruthy();
      expect(data.meta.title, `${locale} meta title`).toBeTruthy();
      expect(data.faqItems.length, `${locale} FAQ items`).toBeGreaterThan(0);
    }
  });

  test("trust signals have correct format (value|label)", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const data = getHomePageData(locale);
      for (const key of ["calculators", "rates", "price", "privacy"] as const) {
        const signal = data.trustSignals[key];
        expect(signal, `${locale} trust signal ${key}`).toContain("|");
      }
    }
  });

  test("privacy copy distinguishes fragment and query-based share links", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const data = getHomePageData(locale);
      const privacyCopy = [
        data.sections.features.private.description,
        data.faqItems.find((item) => item.question.toLowerCase().includes(locale === "se" ? "sparar" : locale === "no" ? "lagrer" : "gemmer"))?.answer ?? "",
      ].join(" ");
      expect(privacyCopy, `${locale} privacy copy`).not.toMatch(
        /åbner et delelink|åpner et delelink|öppnar en delelänk/i,
      );
      expect(privacyCopy, `${locale} privacy copy`).not.toMatch(
        /bruger en delefunktion|bruker en delingsfunksjon|använder en delningsfunktion/i,
      );
      expect(privacyCopy, `${locale} privacy copy`).toMatch(/query/i);
      expect(data.trustSignals.privacy, `${locale} privacy badge`).toMatch(/database|databas/i);
      expect(data.trustSignals.privacy, `${locale} privacy badge`).not.toMatch(
        /^100%\|/,
      );
    }
  });
});

describe("getHomeCalculators", () => {
  test("returns calculators for all locales", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const calcs = getHomeCalculators(locale);
      expect(calcs.length, `${locale} calculator count`).toBeGreaterThan(10);
    }
  });

  test("DA has more calculators than SE/NO", () => {
    const da = getHomeCalculators("da");
    const se = getHomeCalculators("se");
    expect(da.length).toBeGreaterThan(se.length);
  });

  test("all calculators have required fields", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const calc of getHomeCalculators(locale)) {
        expect(calc.title, `${locale}:${calc.href}`).toBeTruthy();
        expect(calc.href).toMatch(/^\//);
        expect(calc.category).toBeTruthy();
      }
    }
  });

  test("BMI home cards describe an adult calculator", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const bmi = getHomeCalculators(locale).find((calc) => calc.href === "/bmi");
      expect(bmi?.description.toLowerCase()).toMatch(/voksne|vuxna/);
    }
  });

  test("only exposes calculators available in the active locale", () => {
    for (const locale of ["da", "no", "se"] as const) {
      for (const calculator of getHomeCalculators(locale)) {
        expect(
          isCalculatorAvailable(calculator.href, locale),
          `${locale}/${calculator.href}`
        ).toBe(true);
      }
    }
  });

  test("Swedish home links the Swedish-only salary and mortgage calculators", () => {
    const hrefs = getHomeCalculators("se").map((calculator) => calculator.href);
    expect(hrefs).toContain("/lon-efter-skatt");
    expect(hrefs).toContain("/bolan");
    expect(hrefs).not.toContain("/loen-efter-skat");
  });

  test("the visible calculator count is derived, not hardcoded", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const count = getHomeCalculatorCount(locale);
      const data = getHomePageData(locale);
      const copy = [
        data.trustSignals.calculators,
        data.meta.description,
        data.hero.subtitle,
        ...data.faqItems.map((item) => item.answer),
      ].join(" ");
      expect(copy, `${locale} copy has no leftover placeholder`).not.toContain("{count}");
      expect(
        copy,
        `${locale} copy states the real calculator count (${count})`
      ).toContain(`${count}`);
    }
  });

  test("popular row follows the measured top pages per locale", () => {
    const daPopular = getHomeCalculators("da")
      .filter((c) => c.popular)
      .map((c) => c.href);
    for (const href of [
      "/dato",
      "/bmi",
      "/boligstoette",
      "/kvadratmeter",
      "/rentefradrag",
      "/tidsberegner",
      "/kalorier",
      "/braendstof",
      "/loen-efter-skat",
    ]) {
      expect(daPopular, `DA popular ${href}`).toContain(href);
    }

    const sePopular = getHomeCalculators("se")
      .filter((c) => c.popular)
      .map((c) => c.href);
    for (const href of [
      "/tidsberegner",
      "/dato",
      "/leasing",
      "/nedtaelling",
      "/tidszone",
      "/lon-efter-skatt",
    ]) {
      expect(sePopular, `SE popular ${href}`).toContain(href);
    }
  });

  test("some calculators are marked popular", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const popular = getHomeCalculators(locale).filter((c) => c.popular);
      expect(popular.length, `${locale} popular count`).toBeGreaterThan(3);
    }
  });
});
