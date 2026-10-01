import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { SKATTEFRADRAG_2026 } from "@/lib/satser-2026";
import SkattefradragPage from "./page";

vi.mock("next/dynamic", () => ({ default: () => () => <div>Værktøj</div> }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/ads/AdBanner", () => ({ InlineAd: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/**
 * Boligjobordningens to lofter for 2026 var 12.400 kr. og 6.200 kr. — de er
 * 2025-tallene. Fra 1. januar 2026 er håndværkerfradraget kun grønne og
 * energibesparende arbejder til 9.000 kr., mens servicefradraget (rengøring,
 * havearbejde, vinduespudsning, børnepasning i hjemmet) er steget til 18.300 kr.
 * Se `SKATTEFRADRAG_2026` for kilder.
 *
 * Porten læser tallene ud af den **renderede markup** og af den konkrete
 * FAQ-tekst, fordi det er dér fejlen lå: brødteksten og FAQ'en havde hver
 * deres egne hårdkodede tal, som ikke fulgte den centrale konfiguration. Den
 * fanger også en tekststreng, der ikke blev interpoleret — `${kr(...)}` nåede
 * bogstaveligt ud i HTML'en, da svaret stod i almindelige anførselstegn.
 */
describe("/skattefradrag — boligjobordningens 2026-lofter", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("siden viser begge lofter med dansk tusindtalsseparator", async () => {
    const markup = renderToStaticMarkup(await SkattefradragPage());

    expect(markup).toContain("9.000 kr.");
    expect(markup).toContain("18.300 kr.");
    expect(markup).not.toContain("12.400");
    expect(markup).not.toContain("6.200");
  });

  test("ingen uinterpoleret skabelon må over i markup", async () => {
    const markup = renderToStaticMarkup(await SkattefradragPage());

    expect(markup).not.toContain("${");
  });

  test("FAQ'en oplyser begge lofter og at maling ikke længere er omfattet", () => {
    const faq = getPageData("skattefradrag", "da")!.faqItems.find((f) =>
      f.question.startsWith("Hvad dækker håndværkerfradraget"),
    );
    const svar = faq?.answer ?? "";

    expect(svar).toContain(
      formatAntal(SKATTEFRADRAG_2026.haandvaerkerMax),
    );
    expect(svar).toContain(
      formatAntal(SKATTEFRADRAG_2026.servicefradragMax),
    );
    expect(svar).toContain("Maling");
    expect(svar).not.toContain("${");
  });

  test("håndværkerfradraget må ikke længere beskrives som dækkende maling", async () => {
    const markup = renderToStaticMarkup(await SkattefradragPage());

    expect(markup).toContain("maling eller udskiftning af et køkken giver ikke længere fradrag");
  });
});

function formatAntal(value: number): string {
  return new Intl.NumberFormat("da-DK").format(value);
}