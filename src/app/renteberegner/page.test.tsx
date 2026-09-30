import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { RENTEFRADRAG_2026 } from "@/lib/satser-2026";
import { getPageData } from "@/lib/page-data";
import { annuitetsEksempel } from "@/lib/rente-eksempler";
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
  FAQSchema: () => null, ArticleSchema: () => null }));

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

  test("procenterne i skatteafsnittet læses fra RENTEFRADRAG_2026", async () => {
    const html = renderToStaticMarkup(await RenteberegnerPage());
    const procent = (værdi: number) => (værdi * 100).toFixed(1).replace(".", ",");

    expect(html).toContain(`<strong>${procent(RENTEFRADRAG_2026.highRate)}%</strong>`);
    expect(html).toContain(`<strong>${procent(RENTEFRADRAG_2026.lowRate)}%</strong>`);
    expect(html).toContain(`${RENTEFRADRAG_2026.highRateLimitSingle.toLocaleString("da-DK")} kr.`);
    // 5 % lån: 5 % × (1 − 33,6 %) = 3,32 % → 3,3 % under grænsen
    expect(html).toContain(`<strong>${procent(0.05 * (1 - RENTEFRADRAG_2026.highRate))}% efter skat</strong>`);
    // …og 5 % × (1 − 25,6 %) = 3,72 % → 3,7 % over grænsen
    expect(html).toContain(`over grænsen er det ca. ${procent(0.05 * (1 - RENTEFRADRAG_2026.lowRate))}%.`);
  });

  test("svarer på formlen, Excel og nominel mod effektiv — de tre ting dansk autocomplete spørger om", async () => {
    const html = renderToStaticMarkup(await RenteberegnerPage());

    // "annuitetslån formel" og "annuitetslån formel bevis"
    expect(html).toContain("ydelse = P × r ÷ (1 − (1 + r)");
    expect(html).toContain("Summen af den geometriske række");
    // "annuitetslån excel", "renteberegner excel", "annuitetslån excel skabelon"
    expect(html).toContain("=YDELSE(0,04/12;240;-200000)");
    expect(html).toContain("=RENTENPERIODER(0,04/12;-1211,96;200000)");
    expect(html).toContain("1.211,96");
    // "månedlig rente til årlig rente", "månedlig rente formel"
    expect(html).toContain("Månedlig rente til årlig rente");
    expect(html).toContain("12,68 % om året");
  });

  test("svarer på sidens største søgning: annuitetslån beregner (GSC 353 visninger, pos. 8)", async () => {
    const html = renderToStaticMarkup(await RenteberegnerPage());
    const eksempel = annuitetsEksempel();
    const krDa = (tal: number) =>
      tal.toLocaleString("da-DK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // Søgningen er "annuitetslån beregner". Før denne ændring stod den i 0
    // forekomster i hele den danske side — kun `<h1>Renteberegner</h1>`.
    expect(html).toContain("<h2>Annuitetslån beregner: beregn månedsydelsen på et lån</h2>");
    expect(html).toContain("<strong>annuitetslån beregner</strong>");
    // …og løftet udfyldes med `rente-eksempler`-tal, så brødteksten ikke kan
    // glide fra formelblokken længere ned på samme side.
    expect(html).toContain(`${eksempel.hovedstol.toLocaleString("da-DK")} kr. til`);
    expect(html).toContain(`<strong>${krDa(eksempel.maanedligBetalning)} kr. pr. måned</strong>`);
    expect(html).toContain(`${krDa(eksempel.samletBetaling)} kr.`);
    expect(html).toContain(`${krDa(eksempel.samletRante)} kr. er renter`);
  });

  test("de to nye spørgsmål ligger i page-data, og dermed i JSON-LD", () => {
    // FAQ-komponenten og StructuredData er begge mocket væk i denne fil, så
    // svarene læses i den tabel de begge får fra.
    const spg = getPageData("renteberegner", "da")!.faqItems.map((f) => f.question);

    expect(spg).toContain("Hvilken formel beregner et annuitetslån, og hvordan gør man det i Excel?");
    expect(spg).toContain("Hvad er forskellen på nominel og effektiv rente?");
  });

  describe("svensk formelgren", () => {
    async function seHtml(): Promise<string> {
      vi.mocked(getLocale).mockResolvedValue("se");
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
      return renderToStaticMarkup(await RenteberegnerPage());
    }

    test("formlen og eksemplet står i markupken", async () => {
      const html = await seHtml();

      expect(html).toContain("<h2>Formeln för ett annuitetslån</h2>");
      expect(html).toContain("betalning = P × r ÷ (1 − (1 + r)");
      // Autocomplete: "annuitetslån formel bevis" (nr. 2 under
      // "annuitetslån formel"), altså spørgsmålet om beviset.
      expect(html).toContain("Summan av den geometriska serien");
      expect(html).toContain("Flyttar du bara räntorna");
    });

    test("hvert beløb i teksten er det, modulet regner", async () => {
      const html = await seHtml();
      const eksempel = annuitetsEksempel();
      const svensk = (tal: number) => tal.toLocaleString("sv-SE", { maximumFractionDigits: 2 });

      expect(html).toContain(svensk(eksempel.hovedstol));
      expect(html).toContain(svensk(eksempel.maanedligBetalning));
      expect(html).toContain(svensk(eksempel.samletBetaling));
      expect(html).toContain(svensk(eksempel.samletRante));
      // De samme tal, de danske sider altid har skrevet.
      expect(svensk(eksempel.maanedligBetalning)).toBe("1 211,96");
    });

    test("effektiv ränta er formlen, der manglede — begge veje", async () => {
      const html = await seHtml();

      // SE-autocomplete under "effektiv ränta" har "formel" på nr. 2 og
      // "beräkna effektiv ränta formel" som egen variation. Siden havde
      // nul af dem.
      expect(html).toContain("(1 + månadsränta)<sup>12</sup> − 1");
      expect(html).toContain("12,68 % per år");
      // Og den modsatte vej, som siden heller ikke havde: 4 % om året.
      expect(html).toContain("4,07 % effektivt");
    });

    test("den nominella må aldrig kunne stå som den effektiva", async () => {
      const html = await seHtml();

      // 4 % om året må ikke stå som 4,00 % effektivt — det er præcis den
      // fejl afsnittet er skrevet for at undgå.
      expect(html).not.toContain("4 % effektivt");
      expect(html).toContain("0,3333 %");
    });

    test("den danske side er urørt af denne rettelse", async () => {
      const html = renderToStaticMarkup(await RenteberegnerPage());

      expect(html).not.toContain("Formeln för ett annuitetslån");
      expect(html).not.toContain("månadsränta");
      // C85's egen rettelse står, altså tog den svenska greb ikke dansk med.
      expect(html).toContain("<h2>Formlen for et annuitetslån");
      expect(html).toContain("=YDELSE(0,04/12;240;-200000)");
    });

    test("de tre nye spørgsmål ligger i page-data, og dermed i JSON-LD", () => {
      const spg = getPageData("renteberegner", "se")!.faqItems.map((f) => f.question);

      expect(spg).toContain("Vad är formeln för ett annuitetslån?");
      expect(spg).toContain("Hur räknar man ut effektiv ränta?");
      // C190: Excel-klyngen ("annuitetslån excel formel", "lån excel mal") havde
      // nul forekomster på beraknare.se, selv om dansk fik den i C85.
      expect(spg).toContain("Hur räknar jag ett annuitetslån i Excel?");
      // De fire forrige skal være der stadig — de nye er lagt til, ikke byttet.
      expect(spg).toHaveLength(7);
    });
  });
});
