import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import BraendstofPage from "./page";

vi.mock("next/dynamic", () => ({
  default: () => () => <div>Brændstofværktøj</div>,
}));
vi.mock("@/components/BraendstofBeregner", () => ({
  default: () => <div>Brændstofværktøj</div>,
}));
vi.mock("@/components/AffiliateBox", () => ({
  BilforsikringAffiliate: () => null,
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

describe("braendstof page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Brændstofberegner",
      answer: "500 km benzin koster 450 kr.",
      perKm: "0,90 kr. pr. km",
    },
    {
      locale: "se" as const,
      heading: "Bränslekalkylator",
      answer: "500 km bensin kostar 450 kr.",
      perKm: "0,90 kr. per km",
    },
    {
      locale: "no" as const,
      heading: "Drivstoffkalkulator",
      answer: "500 km bensin koster 450 kr.",
      perKm: "0,90 kr. per km",
    },
  ])("viser det konkrete benzin-svar og beregneren i $locale", async ({ locale, heading, answer, perKm }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await BraendstofPage());

    expect(html).toContain(`<h1 class="text-3xl md:text-4xl font-bold mb-4">${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain(perKm);
    expect(html).toContain("Brændstofværktøj");
  });
});
