import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import KvadratmeterPage from "./page";

vi.mock("@/components/KvadratmeterBeregner", () => ({
  default: () => <div>Arealværktøj</div>,
}));
vi.mock("@/components/BoligOpslag", () => ({ default: () => null }));
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

describe("kvadratmeter page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Kvadratmeterberegner",
      answer: "Et rum på 5 x 4 m er 20 m²",
    },
    {
      locale: "se" as const,
      heading: "Kvadratmeterkalkylator",
      answer: "Ett rum på 5 x 4 m är 20 m²",
    },
    {
      locale: "no" as const,
      heading: "Kvadratmeterkalkylator",
      answer: "Et rom på 5 x 4 m er 20 m²",
    },
  ])("viser det konkrete areal-svar og beregneren i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await KvadratmeterPage());

    expect(html).toContain(`<h1 class="text-3xl md:text-4xl font-bold mb-4">${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Arealværktøj");
  });
});
