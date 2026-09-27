import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getPageData } from "@/lib/page-data";
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

  // Search Console (2026-08-28→09-25) har "hvordan regner man kvadratmeter ud"
  // (359 visninger, pos. 3) som sidens næststørste søgning. Værktøjet skrev
  // kun formlerne symbolske, så spørgsmålet var ikke besvaret synligt.
  test("viser regneeksempler med tal for alle fire figurer", async () => {
    const html = renderToStaticMarkup(await KvadratmeterPage());

    expect(html).toContain("<h2>Sådan regner du kvadratmeter ud med tal</h2>");
    expect(html).toContain("5 × 4 = 20 m²");
    expect(html).toContain("3,14 × 3 × 3 = 28,3 m²");
    expect(html).toContain("(6 × 4) / 2 = 12 m²");
    expect(html).toContain("((4 + 6) / 2) × 3 = 15 m²");
    expect(html).toContain("20 m² til 150 kr./m² er <strong>3.000 kr.</strong>");
  });

  test("de nye svar kommer i FAQ'en og dermed i JSON-LD'en", async () => {
    const faqItems = getPageData("kvadratmeter", "da").faqItems;
    const questions = faqItems.map((item) => item.question);

    expect(questions).toContain("Hvordan regner man kvadratmeter ud?");
    expect(questions).toContain("Hvor mange m² er et værelse på 3 x 4 meter?");
    expect(faqItems[1].answer).toContain("28,3 m²");
  });

  test("den svenske side er urørt af danske regneeksempler", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await KvadratmeterPage());

    expect(html).not.toContain("Sådan regner du kvadratmeter ud");
    expect(html).not.toContain("3,14 × 3 × 3");
  });
});
