import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getPageData } from "@/lib/page-data";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import KvadratmeterPage from "./page";

vi.mock("@/components/KvadratmeterBeregner", () => ({
  default: () => <div>Arealværktøj</div>,
}));
// ArealOmregner er en klient-komponent med egen LocaleProvider-kontekst;
// den har sin egen test i src/components/ArealOmregner.test.tsx.
vi.mock("@/components/ArealOmregner", () => ({
  default: () => <div>Omregn arealværktøj</div>,
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

  // Dansk autocomplete 6/10: 9 af 10 træffere under «omregn kvadratmeter til»
  // er en omregning, og «500 kvadratfod» er første træffer under «kvadratfod».
  // Værktøjet viste kun den ene vej, så siden skal nu kunne svare begge veje.
  test("brødteksten skriver de tre omregninger, værktøjet regner", async () => {
    const html = renderToStaticMarkup(await KvadratmeterPage());

    expect(html).toContain("Omregn arealværktøj");
    expect(html).toContain("<h2>Omregn kvadratmeter til andre enheder</h2>");
    expect(html).toContain("<strong>500 kvadratfod</strong> = <strong>46,45 m²</strong>");
    expect(html).toContain("<strong>1 acre</strong> = <strong>4.046,86 m²</strong>");
    expect(html).toContain("<strong>100 m²</strong> = <strong>1.076,39 kvadratfod</strong>");
    // Foden er præcis 0,3048 m i begge lande, så tallene er de samme.
    expect(html).toContain("præcis 0,3048 m");
    expect(html).toContain("0,09290304 m²");
  });

  test("den svenska siden har samme tre omregninger i svensk notation", async () => {
    const html = normalisér(renderToStaticMarkup(await medLocale("se")));

    expect(html).toContain("<h2>Omvandla kvadratmeter till andra enheter</h2>");
    expect(html).toContain("<strong>500 kvadratfot</strong> = <strong>46,45 m²</strong>");
    expect(html).toContain("<strong>1 acre</strong> = <strong>4 046,86 m²</strong>");
    expect(html).toContain("<strong>100 m²</strong> = <strong>1 076,39 kvadratfot</strong>");
  });

  test("begge sprog regner om til samme areal, så de ikke kan glide fra hinanden", async () => {
    const da = normalisér(renderToStaticMarkup(await medLocale("da")));
    const se = normalisér(renderToStaticMarkup(await medLocale("se")));

    // 46,45 m² og 0,09290304 m² skrives ens i begge sprog.
    for (const omregning of ["46,45 m²", "0,09290304 m²"]) {
      expect(da).toContain(omregning);
      expect(se).toContain(omregning);
    }
    // Tusindtalsseparatoren er sprogets, så 500 kvadratfod mod 1.076,39 er
    // «1.076,39» i dansk og «1 076,39» i svensk — samme tal, to skrivemåder.
    expect(da).toContain("<strong>1.076,39 kvadratfod</strong>");
    expect(se).toContain("<strong>1 076,39 kvadratfot</strong>");
  });

  test("de nye svar kommer i FAQ'en og dermed i JSON-LD'en", async () => {
    const faqItems = getPageData("kvadratmeter", "da")!.faqItems;
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
    const faqItems = getPageData("kvadratmeter", "se")!.faqItems;
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

  // 3/10: FAQ'en skrev «1 m² = 10.000 cm²» og «blir det 3.000 kr for 20 m²»
  // på svensk og norsk, altså med dansk punktum — og `FAQSchema` publicerer
  // svaret som JSON-LD, så Google citerede det. Porten dømmer den *rendere*
  // side, så hele HTML'en — synlig tekst, JSON-LD og RSC-payloaden — skal være
  // fri for det danske mønster i de to sprog.
  test("svensk og norsk har intet beløb med dansk tusindtalspunktum", async () => {
    for (const locale of ["se", "no"] as const) {
      // FAQ'en dømmes fra `page-data.ts`, for det er den `FAQSchema` læser —
      // altså præcis den tekst, Google citerer. Resten af siden dømmes på den
      // renderede HTML, så hele sværdet er med.
      const alt = [
        ...getPageData("kvadratmeter", locale)!.faqItems.map((f) => `${f.question} ${f.answer}`),
        normalisér(renderToStaticMarkup(await medLocale(locale))),
      ].join("\n");

      // 10.000 cm², 10.000 m², 3.000 kr, 80.000 … — intet af det er gyldigt i
      // de to sprog. Mutation: en enkelt streng tilbage i page-data.ts med det
      // danske punktum gør denne prøve rød.
      expect(`${locale}: ${alt.match(/\d\.\d{3}/g) ?? []}`).not.toMatch(/\d/);

      // Og de rigtige tal skal stå, så prøven ikke kan gå grøn ved at fjerne
      // svaret. Enheden er «kr» på begge — de skrev «SEK/m²» og «NOK/m²» om de
      // samme danske intervaller.
      expect(alt).toContain("10 000 cm²");
      expect(alt).toContain("3 000 kr");
      expect(alt).not.toContain("SEK/m²");
      expect(alt).not.toContain("NOK/m²");
    }
  });

  test("materialepriserne siger i sætningen, at de er danske", async () => {
    // Der er ingen kilde i repoet på svensk eller norsk materialepris, så
    // intervallerne er danske — og det skal stå i svaret, ellers lover de et
    // marked, de ikke kan. Samme greb som `timepris-markedspriser.ts`.
    const se = getPageData("kvadratmeter", "se")!.faqItems.find((f) =>
      f.answer.includes("Laminat"),
    );
    const no = getPageData("kvadratmeter", "no")!.faqItems.find((f) =>
      f.answer.includes("Laminat"),
    );

    expect(se?.answer).toContain("Nivåerna är danska");
    expect(no?.answer).toContain("Nivåene er danske");
    // Dansk svarer uden forbehold — det er sit eget marked.
    const da = getPageData("kvadratmeter", "da")!.faqItems.find((f) =>
      f.answer.includes("Laminat"),
    );
    expect(da?.answer).toBe("Laminat 80-200 kr/m², trægulv 300-800 kr/m², fliser 200-500 kr/m².");
  });

  test("den danske siden har ingen svenska formuleringer", async () => {
    const html = renderToStaticMarkup(await KvadratmeterPage());

    expect(html).not.toContain("Så här räknar man ut kvadratmeter");
    expect(html).not.toContain("radie");
    expect(html).not.toContain("trapets");
  });
});
