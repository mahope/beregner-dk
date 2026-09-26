import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { ALDER_EKSEEMPLER, formatAlder } from "@/lib/alder-eksempler";
import { getPageData } from "@/lib/page-data";
import AlderPage from "./page";

vi.mock("@/components/AlderBeregner", () => ({
  default: () => <div>Aldersværktøj</div>,
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

describe("alder page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    { locale: "da" as const, heading: "Aldersberegner", answer: "36 år, 6 måneder og 10 dage" },
    { locale: "se" as const, heading: "Ålderskalkylator", answer: "36 år, 6 månader och 10 dagar" },
    { locale: "no" as const, heading: "Alderskalkulator", answer: "36 år, 6 måneder og 10 dager" },
  ])("viser det konkrete alders-svar og beregneren i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await AlderPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Aldersværktøj");
  });

  test("viser ikke den forældede frosne alders-sum i introen", async () => {
    const html = renderToStaticMarkup(await AlderPage());

    expect(html).not.toContain("35 år, 10 måneder og 28 dage");
  });

  test.each([
    { locale: "da" as const, overskrift: "Svar på de oftest stillede aldersspørgsmål" },
    { locale: "se" as const, overskrift: "Svar på de vanligaste åldersfrågorna" },
  ])("svarer på spørgsmålet om alder mellem to datoer i $locale", async ({ locale, overskrift }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await AlderPage());

    expect(html).toContain(overskrift);
    // Rækkerne kommer fra ALDER_EKSEEMPLER, som beregnes af beregnAlder.
    for (const eksempel of ALDER_EKSEEMPLER) {
      expect(html).toContain(formatAlder(eksempel, locale));
    }
  });

  test("tabellen viser præcis de fem rækker, modulet genererer", async () => {
    const html = renderToStaticMarkup(await AlderPage());

    expect(ALDER_EKSEEMPLER).toHaveLength(5);
    for (const eksempel of ALDER_EKSEEMPLER) {
      expect(html).toContain(formatAlder(eksempel, "da"));
    }
  });

  test("tastaturet siger det samme som tabellen, så copy og værktøj ikke kan glide fra hinanden", async () => {
    const html = renderToStaticMarkup(await AlderPage());
    const faq = getPageData("alder", "da")!.faqItems;

    const sporgsmaal = faq.map((item) => item.question);
    expect(sporgsmaal).toContain("Kan jeg beregne alder mellem to datoer?");
    expect(sporgsmaal).toContain("Hvor gammel var jeg den 1. maj 2010?");

    for (const item of faq) {
      for (const eksempel of ALDER_EKSEEMPLER) {
        const talt = formatAlder(eksempel, "da");
        if (item.answer.includes(talt)) {
          expect(html).toContain(talt);
        }
      }
    }
  });

  test("har ikke en fast dato-tabel på norsk, som der ikke er trafikdata for", async () => {
    vi.mocked(getLocale).mockResolvedValue("no");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("no"));

    const html = renderToStaticMarkup(await AlderPage());

    expect(html).not.toContain("Svar på de oftest stillede aldersspørgsmål");
    expect(html).toContain("Alderskalkulator");
  });
});
