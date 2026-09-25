import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import RenteberegnerPage from "./page";

vi.mock("@/components/RenteBeregner", () => ({
  default: () => <div>Renteværktøj</div>,
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

describe("renteberegner page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Renteberegner",
      answer: "1.887 kr. om måneden",
      interest: "Samlet rente: 13.227 kr.",
    },
    {
      locale: "se" as const,
      heading: "Räntekalkylator",
      answer: "1.887 kr i månaden",
      interest: "Total ränta: 13.227 kr.",
    },
  ])("viser det konkrete lån-svar og beregneren i $locale", async ({ locale, heading, answer, interest }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await RenteberegnerPage());

    expect(html).toContain(`<h1 class="text-3xl font-bold mb-2">${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain(interest);
    expect(html).toContain("Renteværktøj");
  });

  test("henviser dansk skatteafsnit til den kildeførte rentefradragsberegner", async () => {
    const html = renderToStaticMarkup(await RenteberegnerPage());

    expect(html).toContain('href="/rentefradrag"');
  });
});
