import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import {
  NETTOPRISINDEKS_2026M08,
  FORBRUGERPRISINDEKS_2026M08,
  NETTOPRISINDELS_MAANED,
  beregnHuslejestigning,
} from "@/lib/nettoprisindeks";
import HuslejePage from "./page";

vi.mock("@/components/HuslejeBudgetBeregner", () => ({ default: () => <div>værktøj</div> }));
vi.mock("@/components/HuslejePrKvm", () => ({ default: () => <div>pr-kvm</div> }));
vi.mock("@/components/AffiliateBox", () => ({ ForsikringAffiliate: () => null }));
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

/** Samme normalisering som komponentens test: NBSP skal blive almindelig plads. */
const norm = (value: string) => value.replace(/\s+/g, " ").replace(/ /g, " ");

describe("husleje side — nettoprisindeks", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("renderer nettoprisindeks-blokken på den danske side", async () => {
    // Autocomplete nr. 3 under "husleje beregner" pr. 2026-09-28 var
    // "nettoprisindeks husleje beregner". Siden havde 0 forekomster af ordet.
    const html = renderToStaticMarkup(await HuslejePage());
    expect(html).toContain('<h2 id="nettoprisindeks-husleje">');
    const tekst = norm(html.replace(/<[^>]*>/g, " ").replace(/<!-- -->/g, ""));
    expect(tekst).toContain("Hvor meget stiger huslejen efter nettoprisindekset?");
    expect(tekst.toLowerCase()).toContain("nettoprisindeks");
    expect(tekst).toContain(NETTOPRISINDELS_MAANED);
  });

  test("brødtekstens beløb er beregnet af modulet, ikke skrevet i hånden", async () => {
    const html = renderToStaticMarkup(await HuslejePage());
    const tekst = norm(html.replace(/<[^>]*>/g, " ").replace(/<!-- -->/g, ""));
    const r = beregnHuslejestigning(8000, NETTOPRISINDEKS_2026M08.aarsVaeksningPct);
    // C84's fejlklasse: indekseret tekst der modsiger sit eget beregningsmodul.
    expect(tekst).toContain(r.stigning.toLocaleString("da-DK"));
    expect(tekst).toContain(r.efter.toLocaleString("da-DK"));
    expect(tekst).toContain(
      FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct.toLocaleString("da-DK") + " %",
    );
  });

  test("beholder den eksisterende 30%-regel-tekst urørt", async () => {
    const html = renderToStaticMarkup(await HuslejePage());
    const tekst = norm(html.replace(/<[^>]*>/g, " ").replace(/<!-- -->/g, ""));
    // 3/10: «30% reglen» er sitets *navn* på regelen — blogindlæggets SEO-titel
    // og fire sidelinks skriver det samme ord — så det er undtaget fra
    // procent-portens mellemrumskrav. Brødtekstens tal er derimod rettet.
    expect(tekst).toContain("30% reglen forklaret");
    expect(tekst).toContain("30 % af din nettoindkomst");
    expect(tekst).toContain("Nogle kilder siger 33 %");
    expect(tekst).toContain("Sammenlign husleje pr. m²");
  });

  test("viser ikke den danske blok på en svensk domæne-udfyldning", async () => {
    // beraknare.se har sin egen lejeside. Blokken er daOnly, så en svensk
    // rendering må ikke få den (C73's R4 / locale-leak-gaten).
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await HuslejePage());
    expect(html).not.toContain('id="nettoprisindeks-husleje"');
    const tekst = norm(html.replace(/<[^>]*>/g, " ").replace(/<!-- -->/g, ""));
    expect(tekst).not.toContain("nettoprisindeks");
  });
});

describe("husleje FAQ — nettoprisindeks-spørgsmålene", () => {
  test("de tre nye spørgsmål ligger i faqItems og dermed i JSON-LD'en", () => {
    // FAQ er mocket væk i side-testen, så spørgsmålene testes i page-data,
    // præcis som C85 gjorde. FAQSchema læser samme faqItems.
    const faq = getPageData("husleje", "da")!.faqItems;
    const spørgsmål = faq.map((f) => f.question);
    expect(spørgsmål).toContain("Hvor meget stiger huslejen efter nettoprisindekset?");
    expect(spørgsmål).toContain("Hvad er forskellen på pristalsregulering og nettoprisindeks?");
    expect(spørgsmål).toContain(
      "Hvem fastsætter huslejestigningen — huslejenævnet eller udlejeren?",
    );
  });

  test("FAQ-ens beløb er modulets, så en ny DST-måned ikke gør sætningen forældet", () => {
    const faq = getPageData("husleje", "da")!.faqItems;
    const svar = faq.find((f) => f.question === "Hvor meget stiger huslejen efter nettoprisindekset?")!
      .answer;
    const r = beregnHuslejestigning(8000, NETTOPRISINDEKS_2026M08.aarsVaeksningPct);
    expect(svar).toContain(r.stigning.toLocaleString("da-DK"));
    expect(svar).toContain(r.efter.toLocaleString("da-DK"));
    expect(svar).toContain(NETTOPRISINDEKS_2026M08.aarsVaeksningPct.toLocaleString("da-DK") + " %");
    // Kilden skal være nævnt, ellers er tallene bare et påstand.
    expect(svar).toContain("PRIS04");
    expect(svar).toContain("PRIS01");
  });

  test("keywords dækker søgningerne i klyngen", () => {
    const keywords = getPageData("husleje", "da")!.keywords.join(" ");
    expect(keywords).toContain("nettoprisindeks husleje beregner");
    expect(keywords).toContain("pristalsregulering husleje");
    expect(keywords).toContain("nettoprisindeks");
  });
});
