import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import EnhedsprisPage from "./page";

vi.mock("@/components/EnhedsprisBeregner", () => ({
  default: () => <div>Enhedsprisværktøj</div>,
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

describe("enhedspris page", () => {
  beforeEach(() => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Enhedspris beregner - find den billigste vare",
      answer: "35 kr. for 2 kg koster 17,50 kr. pr. kg",
      saving: "12,5 %",
    },
    {
      locale: "se" as const,
      heading: "Jämförpris - hitta den billigaste varan",
      answer: "35 kr för 2 kg kostar 17,50 kr per kg",
      saving: "12,5 %",
    },
  ])("viser det konkrete enhedspris-svar og beregneren i $locale", async ({ locale, heading, answer, saving }) => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await EnhedsprisPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain(saving);
    expect(html).toContain("Enhedsprisværktøj");
  });
});
