import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getDageTilSlugs } from "@/lib/dage-til";
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
