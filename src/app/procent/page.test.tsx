import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import ProcentPage from "./page";

vi.mock("@/components/ProcentBeregner", () => ({
  default: () => <div>Procentværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("procent page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Procentberegner",
      answer: "10 procent af 250 er 25. Beregn procent, procentvis stigning og fald med formler.",
    },
    {
      locale: "se" as const,
      heading: "Procenträknare",
      answer: "10 procent av 250 är 25. Beräkna procent, procentuell ökning och minskning med formler.",
    },
  ])("viser det konkrete svar og beregneren i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await ProcentPage());

    expect(html).toContain(`<h1 class="text-3xl font-bold mb-2">${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Procentværktøj");
  });

  test("den svenska siden har Excel-formlerna og säger inte på dansk skatt", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await ProcentPage());

    // Autocomplete (hl=sv): "hur räknar man ut procent i excel".
    expect(html).toContain("Hur räknar man ut procent i Excel?");
    expect(html).toContain("=A1/B1*100");
    expect(html).toContain("=A1*B1/100");
    // Interne links til de svenska værktøj, der besvarar den næste
    // spørgsmål i samme klasse.
    expect(html).toContain('href="/lon-efter-skatt"');
    expect(html).toContain('href="/loenstigning"');
    // 37 % er en dansk sats og kan ikke dokumenteres for svensk lön.
    expect(html).not.toContain("37% skatt");
    expect(html).toContain("kommunal skatt");
  });

  test("den danske side har Excel-formlerna og ingen dansk sats på et helt beløb", async () => {
    const html = renderToStaticMarkup(await ProcentPage());

    // Dansk autocomplete (hl=da, 2026-09-27) peger på "procent i excel
    // formel", "minus procent i excel" og "procent stigning i excel" — de
    // samme formler fandtes kun på den svenske side.
    expect(html).toContain("Hvordan regner man procent i Excel?");
    expect(html).toContain("=A1/B1*100");
    expect(html).toContain("=A1*B1/100");
    expect(html).toContain("=(B1-A1)/A1*100");
    expect(html).toContain('href="/loenstigning"');
    expect(html).toContain('href="/loen-efter-skat"');
    // 37 % er kommuneskat + statslig bundskat, og den statslige del først
    // slår ind over 641.200 kr (SATSER_2026.mellemskatGraense) — så den må
    // ikke stå som et resultat for 40.000 kr.
    expect(html).not.toContain("37% skat af 40.000 kr");
    expect(html).not.toContain("14.800");
    // Dansk tusindtalsseparator i brødteksten.
    expect(html).not.toContain("på 1000 kr");
  });

  // 8796c16 lod dansk og norsk urørt, fordi arbejdet var på den svenske
  // side. Det er samme metode, så formlerne skal findes i begge sprog.
  test("begge sprog har de tre Excel-formler", async () => {
    for (const [locale, overskrift] of [
      ["da", "Hvordan regner man procent i Excel?"],
      ["se", "Hur räknar man ut procent i Excel?"],
    ] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await ProcentPage());

      expect(html).toContain(overskrift);
      for (const formel of ["=A1/B1*100", "=A1*B1/100", "=(B1-A1)/A1*100"]) {
        expect(html).toContain(formel);
      }
    }
  });
});
