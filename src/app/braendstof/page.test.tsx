import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
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
  FAQSchema: () => null, ArticleSchema: () => null }));

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
      answer: "500 km bensin kostar 585 kr.",
      perKm: "1,2 kr. per km",
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

  test("viser regnestykket for alle tre drivmidler i dansk", async () => {
    const html = renderToStaticMarkup(await BraendstofPage());

    expect(html).toContain("<h2>Sådan regner du benzinforbrug og pris ud med tal</h2>");
    // 500 ÷ 15 = 33,3 l, og 33,3 × 13,50 = 449,55, rundet op til de 450 kr.
    // titlen allerede lover.
    expect(html).toContain("500 ÷ 15 = 33,3 l");
    expect(html).toContain("33,3 l × 13,50 kr. =");
    expect(html).toContain("500 ÷ 18 = 27,8 l");
    expect(html).toContain("500 × 17 ÷ 100 = 85 kWh");
    expect(html).toContain("356 kr.");
    expect(html).toContain("213 kr.");
  });

  test("viser pr. km for alle tre drivmidler", async () => {
    const html = renderToStaticMarkup(await BraendstofPage());

    expect(html).toContain("<td>0,90 kr.</td>");
    expect(html).toContain("<td>0,71 kr.</td>");
    expect(html).toContain("<td>0,43 kr.</td>");
  });

  test("svarer på de to spørgsmål fra søgeklyngen og omregner km/l til l/100 km", async () => {
    const html = renderToStaticMarkup(await BraendstofPage());

    expect(html).toContain("<h3>Sådan finder du dit eget forbrug</h3>");
    // 380 ÷ 40 = 9,5 km/l, altså 10,5 l/100 km.
    expect(html).toContain("380 ÷ 40 =");
    expect(html).toContain("9,5 km/l");
    expect(html).toContain("<h3>km/l eller l/100 km?</h3>");
    expect(html).toContain("15 km/l er 6,7 l/100 km");
    // Den gamle liste sagde 5,5-8,3, men 100 / 18 = 5,6.
    expect(html).toContain("5,6-8,3 l/100km");
    expect(html).not.toContain("5,5-8,3 l/100km");
  });

  test("de to nye spørgsmål er i FAQ'en", async () => {
    const faq = getPageData("braendstof", "da")!.faqItems.map((f) => f.question);

    expect(faq).toContain("Hvordan regner man benzinforbrug ud?");
    expect(faq).toContain("Hvor meget benzin bruger en bil?");
  });

  test("de svenske og norske sider er urørte af regnestykkerne", async () => {
    for (const locale of ["se", "no"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await BraendstofPage());

      // Kun strenge fra den nye danske blok. "500 ÷ 15" er bevidst ikke brugt:
      // FAQ'en er mocket her, så den ville være grøn uden at teste noget.
      expect(html).not.toContain("Sådan regner du benzinforbrug og pris ud med tal");
      expect(html).not.toContain("Her er de tre drivmidler regnet på 500 km");
      expect(html).not.toContain("Priserne er rundet op til hele kroner");
      expect(html).not.toContain("Sådan finder du dit eget forbrug");
      expect(html).not.toContain("km/l eller l/100 km?");
    }
  });
});
