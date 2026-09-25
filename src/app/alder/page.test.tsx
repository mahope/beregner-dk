import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import AlderPage from "./page";

vi.mock("@/components/AlderBeregner", () => ({
  default: () => <div>Aldersværktøj</div>,
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

describe("alder page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    { locale: "da" as const, heading: "Aldersberegner", answer: "36 år, 6 måneder og 10 dage" },
    { locale: "se" as const, heading: "Ålderskalkylator", answer: "36 år, 6 månader och 10 dagar" },
    { locale: "no" as const, heading: "Alderskalkulator", answer: "36 år, 6 måneder og 10 dager" },
  ])("viser det konkrete alders-svar og beregneren i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await AlderPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Aldersværktøj");
  });

  test("viser ikke den forældede frosne alders-sum i introen", async () => {
    const html = renderToStaticMarkup(await AlderPage());

    expect(html).not.toContain("35 år, 10 måneder og 28 dage");
  });
});
