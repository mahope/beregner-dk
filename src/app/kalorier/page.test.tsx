import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import KalorierPage from "./page";

vi.mock("@/components/KalorieBeregner", () => ({
  default: () => <div>Kalorieværktøj</div>,
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

describe("kalorier page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Kalorieberegner",
      question: "Hvor mange kalorier skal du have om dagen?",
      tdee: "TDEE 2.759 kcal ved moderat aktivitet",
    },
    {
      locale: "se" as const,
      heading: "Kalorikalkylator",
      question: "Hur många kalorier behöver du per dag?",
      tdee: "TDEE 2.759 kcal vid måttlig aktivitet",
    },
  ])("viser det konkrete kaloriebehov og beregneren i $locale", async ({ locale, heading, question, tdee }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await KalorierPage());

    expect(html).toContain(`<h1 class="text-3xl font-bold mb-2">${heading}</h1>`);
    expect(html).toContain(question);
    expect(html).toContain(tdee);
    expect(html).toContain("Kalorieværktøj");
  });

  test("svarer på 'kalorier pr dag' med en tabel af værkøjets egne tal", async () => {
    const html = renderToStaticMarkup(await KalorierPage());

    expect(html).toContain("<h2>Hvor mange kalorier pr dag?</h2>");
    expect(html).toContain("180 cm og 30 år");
    // De fire rækker: 60, 70, 80 og 90 kg
    for (const vaegt of ["60", "70", "80", "90"]) {
      expect(html).toContain(`<td>${vaegt} kg</td>`);
    }
    // 80 kg mand er det eksempel siden allerede bruger i sin egen tekst
    expect(html).toContain("<td>2.759 kcal</td>");
    expect(html).toContain("<td>2.259 kcal</td>");
    expect(html).toContain('href="/vaegttab"');
    expect(html).toContain('href="/motion-kalorier"');
  });

  test("har de nye spoergsmaal i page-data, saa de ogsaa kommer i JSON-LD", async () => {
    const data = getPageData("kalorier", "da")!;
    const questions = data.faqItems.map((f) => f.question);

    expect(questions).toContain("Hvor mange kalorier skal jeg have?");
    expect(questions).toContain("Hvor mange kalorier skal jeg forbrænde for at tabe 1 kg?");
    expect(questions).toContain("Er kalorieberegneren gratis?");
    // De nye svar skal ikke tale om BMR og TDEE, men svare paa spoergsmaalet
    const svar = data.faqItems.find((f) => f.question === "Hvor mange kalorier skal jeg have?")!;
    expect(svar.answer).toContain("2.502 kcal");
  });
});
