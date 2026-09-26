import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import PromillePage from "./page";

vi.mock("@/components/PromilleBeregner", () => ({
  default: () => <div>Promilleværktøj</div>,
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

describe("promille page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Promilleberegner",
      answer: "4 øl til en mand på 80 kg giver 0,88 ‰",
      limit: "promille <strong>over 0,5 ‰</strong>",
    },
    {
      locale: "se" as const,
      heading: "Promillekalkylator",
      answer: "4 öl till en man på 80 kg ger 0,88 ‰",
      limit: "gränsen för rattfylleri vid <strong>0,2 ‰</strong>",
    },
  ])(
    "viser det konkrete promille-svar, den rigtige grænse og beregneren i $locale",
    async ({ locale, heading, answer, limit }) => {
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await PromillePage());

      expect(html).toContain(`>${heading}</h1>`);
      expect(html).toContain(answer);
      expect(html).toContain(limit);
      expect(html).toContain("Promilleværktøj");
    }
  );
});
