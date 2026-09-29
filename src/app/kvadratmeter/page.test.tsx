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
  FAQSchema: () => null, ArticleSchema: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/**
 * Intl skriver tusindtalsseparatoren som et ikke-brydende mellemrum (U+00A0,
 * i andre ICU-versioner U+202F), så en test der skriver "3 000" med et
 * almindeligt mellemrum ville være vakuum-grøn. C111's lære.
 */
function normalisér(html: string): string {
  return html.replace(/[  ]/g, " ");
}

async function medLocale(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return KvadratmeterPage();
}

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

  // Svensk GSC (2026-08-29→09-26) har beraknare.se/kvadratmeter på 3.249
  // visninger, 6 klik, CTR 0,2 %, pos. 11,2. Svensk autocomplete under "räkna ut
  // kvadratmeter" har 10 variationer, hvoraf vägg, golv, tak, cirkel och triangel
  // själva formen — och sidan hade 0 regnestykker, 2.933 ord och 3 <h2> mod
  // dansk 4.361 ord og 6.
  test("den svenska siden har samma fyra regneeksempel med tal", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = normalisér(renderToStaticMarkup(await KvadratmeterPage()));

    expect(html).toContain("<h2>Så här räknar man ut kvadratmeter med siffror</h2>");
    expect(html).toContain("5 × 4 = 20 m²");
    expect(html).toContain("3,14 × 3 × 3 = 28,3 m²");
    expect(html).toContain("(6 × 4) / 2 = 12 m²");
    expect(html).toContain("((4 + 6) / 2) × 3 = 15 m²");
    expect(html).toContain("20 m² till 150 kr/m² kostar <strong>3 000 kr</strong>");
    // Form-ordene fra autocomplete: golv, vägg, tak.
    expect(html).toMatch(/golv, vägg, tak/);
  });

  test("de to nye frågorna står i den svenska FAQ og dermed i JSON-LD'en", async () => {
    const faqItems = getPageData("kvadratmeter", "se").faqItems;
    const questions = faqItems.map((item) => item.question);

    expect(questions).toContain("Hur räknar man ut kvadratmeter?");
    expect(questions).toContain("Hur många m² är ett rum på 3 x 4 meter?");
    expect(faqItems[1].answer).toContain("28,3 m²");
  });

  test("begge sprog viser de samme tal, så de to sproghalvle ikke kan glide fra hinanden", async () => {
    const da = normalisér(renderToStaticMarkup(await medLocale("da")));
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const se = normalisér(renderToStaticMarkup(await KvadratmeterPage()));

    // De fire arealer skal stå i begge, uanset tusindtalsseparator.
    for (const facit of ["= 20 m²", "= 28,3 m²", "= 12 m²", "= 15 m²"]) {
      expect(da).toContain(facit);
      expect(se).toContain(facit);
    }
    // Prisen er 3.000 kr i dansk notation og 3 000 kr i svensk.
    expect(da).toContain("3.000 kr");
    expect(se).toContain("3 000 kr");
  });

  test("den svenska siden har ingen danske formuleringer", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await KvadratmeterPage());

    expect(html).not.toContain("Sådan regner du kvadratmeter ud");
    expect(html).not.toContain("længde × bredde");
    expect(html).not.toContain("pr. m²");
    expect(html).not.toContain("fliser");
  });

  test("den danske siden har ingen svenska formuleringer", async () => {
    const html = renderToStaticMarkup(await KvadratmeterPage());

    expect(html).not.toContain("Så här räknar man ut kvadratmeter");
    expect(html).not.toContain("radie");
    expect(html).not.toContain("trapets");
  });
});
