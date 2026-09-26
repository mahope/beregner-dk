import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import VaegttabPage from "./page";

vi.mock("@/components/VaegttabBeregner", () => ({
  default: () => <div>Vægttabsværktøj</div>,
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

describe("vaegttab page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Vægttab Beregner",
      answer: "6 kg på 12 uger kræver 550 kcal i underskud, så du skal spise 2.209 kcal om dagen",
    },
    {
      locale: "se" as const,
      heading: "Viktminskning Kalkylator",
      answer: "6 kg på 12 veckor kräver 550 kcal i underskott, så du behöver äta 2.209 kcal per dag",
    },
    {
      locale: "no" as const,
      heading: "Vekttap Kalkulator",
      answer: "6 kg på 12 uker krever 550 kcal i underskudd, så du må spise 2.209 kcal per dag",
    },
  ])("viser det konkrete kalorie-svar og beregneren i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await VaegttabPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Vægttabsværktøj");
  });
});
