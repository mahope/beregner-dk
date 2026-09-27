import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getDageTilSlugs } from "@/lib/dage-til";
import { getPageData } from "@/lib/page-data";
import DatoPage from "./page";

vi.mock("next/dynamic", () => ({
  default: () => () => <div>Datoværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("dato page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Beregn antal dage mellem to datoer",
      answer: "Vælg en startdato og en slutdato",
    },
    {
      locale: "se" as const,
      heading: "Beräkna antal dagar mellan två datum",
      answer: "Välj ett startdatum och ett slutdatum",
    },
  ])("viser den konkrete opgave i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Datoværktøj");
  });

  // Search Console: "hvor mange dage er der til 1 december" 996 visninger
  // pos. 5 og "hvor mange dage er der tilbage af 2026" 223 visninger pos. 5.
  // `/dato` var sidens største indgang (963 indgangssider) og linkede til
  // ingen dage-til-side, selv om `/nedtaelling` gør (C7).
  test("da linker til alle dage-til-sider og videre til /nedtaelling", async () => {
    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("Datoer folk oftest tæller ned til");
    for (const slug of getDageTilSlugs("da")) {
      expect(html, slug).toContain(`href="/dage-til/${slug}"`);
    }
    expect(html).toContain('href="/dage-til/1-december"');
    expect(html).toContain("Hvor mange dage er der til 1. december?");
    expect(html).toContain('href="/nedtaelling"');
  });

  test("se linker til dagar-till-siderne på svensk", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("Datum folk oftast räknar ner till");
    for (const slug of getDageTilSlugs("se")) {
      expect(html, slug).toContain(`href="/dagar-till/${slug}"`);
    }
    expect(html).toContain("Hur många dagar är det till 1 december?");
    expect(html).not.toContain("/dage-til/");
  });

  test("no faar ingen dage-til-links", async () => {
    vi.mocked(getLocale).mockResolvedValue("no");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("no"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).not.toContain("/dage-til/");
    expect(html).not.toContain("/dagar-till/");
  });
});

describe("dato page — dage tilbage i året", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("da svarer på 'hvor mange dage er der tilbage af 2026' med dagens tal", async () => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("<h2>Hvor mange dage er der tilbage af 2026?</h2>");
    expect(html).toContain("<strong>95 dage tilbage af 2026</strong>");
    expect(html).toContain("13 uger og 4 dage");
    expect(html).toContain('href="/dage-til/1-december"');
    expect(html).toContain('href="/dage-til/nytaarsaften"');
  });

  test("se svarer på 'dagar kvar av 2026' med dagens tal", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("<h2>Hur många dagar är det kvar av 2026?</h2>");
    expect(html).toContain("<strong>95 dagar kvar av 2026</strong>");
    expect(html).toContain('href="/dagar-till/1-december"');
    expect(html).toContain('href="/dagar-till/nyarsafton"');
  });

  test("tallet følger dagen, så siden kan ikke stå med gårsdags svar", async () => {
    vi.setSystemTime(new Date("2026-12-31T08:00:00Z"));
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const html = renderToStaticMarkup(await DatoPage());

    expect(html).toContain("<h2>Hvor mange dage er der tilbage af 2026?</h2>");
    expect(html).toContain("<strong>0 dage tilbage af 2026</strong>");
  });
});

// Svensk autocomplete under "dagar mellan två datum" (GSC: 367 visninger,
// pos. 8) har 7 af 10 variationer med "excel" — "antal dagar mellan två
// datum excel", "hur många dagar mellan två datum excel", "excel formel
// antal dagar mellan datum excel". Dansk autocomplete under "antal dage
// mellem to datoer" har tre. Begge `/dato`-sider havde 0 forekomster af
// "Excel" i den server-renderede HTML.
describe("dato page — antal dagar mellan datum i Excel", () => {
  test.each([
    {
      locale: "da" as const,
      heading: "<h2>Sådan tæller du dage mellem to datoer i Excel</h2>",
      days: "<strong>365 dage</strong>",
      days194: "<strong>194 dage</strong>",
      months: "altså 6 hele måneder",
      semicolon: "Dansk Excel bruger <strong>semikolon</strong>",
    },
    {
      locale: "se" as const,
      heading: "<h2>Så räknar du ut dagar mellan två datum i Excel</h2>",
      days: "<strong>365 dagar</strong>",
      days194: "<strong>194 dagar</strong>",
      months: "alltså 6 hela månader",
      semicolon: "Svensk Excel använder <strong>semikolon</strong>",
    },
  ])(
    "viser formlerne og de samme tal i $locale",
    async ({ locale, heading, days, days194, months, semicolon }) => {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await DatoPage());

      expect(html).toContain(heading);
      expect(html).toContain("<code>=B1-A1</code>");
      expect(html).toContain(days);
      expect(html).toContain("<code>=DATEDIF(A1;B1;&quot;d&quot;)</code>");
      expect(html).toContain("<code>=DATEDIF(A1;B1;&quot;m&quot;)</code>");
      expect(html).toContain("<code>=DATEDIF(A1;B1;&quot;y&quot;)</code>");
      expect(html).toContain(days194);
      expect(html).toContain(months);
      expect(html).toContain(semicolon);
    }
  );

  test("begge sprog har de to nye spørgsmål i FAQ'en, som også går i JSON-LD", async () => {
    for (const locale of ["da", "se"] as const) {
      const faq = getPageData("dato", locale)!.faqItems;
      const excel = faq.filter((item) => item.question.includes("Excel"));

      expect(excel).toHaveLength(2);
      expect(excel[0].question).not.toBe(excel[1].question);
      for (const item of excel) {
        expect(item.answer).toContain("=B1-A1");
        expect(item.answer).toContain("DATEDIF");
      }
    }
  });
});
