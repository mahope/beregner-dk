import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import ProcentPage from "./page";

vi.mock("@/components/ProcentBeregner", () => ({
  default: () => <div>Procentværktøj</div>,
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

describe("procent page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Procentberegner",
      answer: "10 procent af 250 er 25. Beregn procent, procentvis stigning og fald med formler.",
    },
    {
      locale: "se" as const,
      heading: "Procenträknare",
      answer: "10 procent av 250 är 25. Beräkna procent, procentuell ökning och minskning med formler.",
    },
  ])("viser det konkrete svar og beregneren i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await ProcentPage());

    expect(html).toContain(`<h1 class="text-3xl font-bold mb-2">${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Procentværktøj");
  });
});
