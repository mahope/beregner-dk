import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
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
});
