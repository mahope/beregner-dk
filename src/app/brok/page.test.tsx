import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import BrokPage from "./page";

vi.mock("@/components/BrokBeregner", () => ({
  default: () => <div>Brøkværktøj</div>,
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

describe("brok page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Brøkberegner - forkort brøk til decimaltal og procent",
      answer: "6/8 forkortet = 3/4 = 0,75 = 75 %",
    },
    {
      locale: "se" as const,
      heading: "Bråkkalkylator - förkorta bråk till decimaltal och procent",
      answer: "6/8 förkortat = 3/4 = 0,75 = 75 %",
    },
  ])("viser det konkrete brøk-svar og beregneren i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await BrokPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Brøkværktøj");
  });
});
