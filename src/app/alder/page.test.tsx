import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import {
  ALDER_EKSEEMPLER,
  FODSELSAAR_MAX,
  FODSELSAAR_MIN,
  formatAlder,
  formatAlderRaekke,
  foedselsaarRaekker,
} from "@/lib/alder-eksempler";
import { beregnAlder } from "@/lib/alder";
import { LEVET_FOEDSELSDATO, alderLevet, formatDageTal } from "@/lib/alder-levet";
import { tilIsoDato } from "@/lib/lokal-dato";
import { getPageData } from "@/lib/page-data";
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

  test.each([
    { locale: "da" as const, overskrift: "Svar på de oftest stillede aldersspørgsmål" },
    { locale: "se" as const, overskrift: "Svar på de vanligaste åldersfrågorna" },
  ])("svarer på spørgsmålet om alder mellem to datoer i $locale", async ({ locale, overskrift }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await AlderPage());

    expect(html).toContain(overskrift);
    // Rækkerne kommer fra ALDER_EKSEEMPLER, som beregnes af beregnAlder.
    for (const eksempel of ALDER_EKSEEMPLER) {
      expect(html).toContain(formatAlder(eksempel, locale));
    }
  });

  test("tabellen viser præcis de fem rækker, modulet genererer", async () => {
    const html = renderToStaticMarkup(await AlderPage());

    expect(ALDER_EKSEEMPLER).toHaveLength(5);
    for (const eksempel of ALDER_EKSEEMPLER) {
      expect(html).toContain(formatAlder(eksempel, "da"));
    }
  });

  test("tastaturet siger det samme som tabellen, så copy og værktøj ikke kan glide fra hinanden", async () => {
    const html = renderToStaticMarkup(await AlderPage());
    const faq = getPageData("alder", "da")!.faqItems;

    const sporgsmaal = faq.map((item) => item.question);
    expect(sporgsmaal).toContain("Kan jeg beregne alder mellem to datoer?");
    expect(sporgsmaal).toContain("Hvor gammel var jeg den 1. maj 2010?");

    for (const item of faq) {
      for (const eksempel of ALDER_EKSEEMPLER) {
        const talt = formatAlder(eksempel, "da");
        if (item.answer.includes(talt)) {
          expect(html).toContain(talt);
        }
      }
    }
  });

  test("har ikke en fast dato-tabel på norsk, som der ikke er trafikdata for", async () => {
    vi.mocked(getLocale).mockResolvedValue("no");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("no"));

    const html = renderToStaticMarkup(await AlderPage());

    expect(html).not.toContain("Svar på de oftest stillede aldersspørgsmål");
    expect(html).not.toContain("Hvor gammel er jeg, hvis jeg er født i 2007?");
    expect(html).toContain("Alderskalkulator");
  });

  // Autocomplete under "hvor gammel er jeg" (hl=da, gl=dk, hentet 2026-09-27)
  // giver fem forslag i formen "hvor gammel er jeg hvis jeg er født i 2006/2007/
  // 2008/2009/1989". GSC: "hvor gammel er jeg" står på pos. 33, siden samlet på
  // pos. 7,8 med 0,6 % CTR. Tabellen er svaret på den klynge.
  test("svarer på 'hvor gammel er jeg, hvis jeg er født i …' med en alder fra og en alder til pr. dagens dato", async () => {
    const html = renderToStaticMarkup(await AlderPage());
    const raekker = foedselsaarRaekker(tilIsoDato(new Date()));

    expect(html).toContain("Hvor gammel er jeg, hvis jeg er født i 2007?");
    for (const raekke of raekker) {
      expect(html).toContain(`<td>${raekke.aar}</td>`);
      expect(html).toContain(`<strong>${formatAlderRaekke(raekke)}</strong>`);
    }
  });

  test("fødselsårs-tabellen dækker de år, dansk autocomplete faktisk viser", async () => {
    const aar = new Set(foedselsaarRaekker(tilIsoDato(new Date())).map((r) => r.aar));

    // De fem år, autocomplete gav under "hvor gammel er jeg".
    for (const autocompleteAar of [1989, 2006, 2007, 2008, 2009]) {
      expect(aar.has(autocompleteAar)).toBe(true);
    }
    expect(Math.min(...aar)).toBe(FODSELSAAR_MIN);
    expect(Math.max(...aar)).toBe(FODSELSAAR_MAX);
    expect(aar.size).toBe(FODSELSAAR_MAX - FODSELSAAR_MIN + 1);
  });

  // Et fødselsår giver to aldre. Uden denne test kunne en række miste sin
  // "til"-alder og svare forkert på præcis den søgning, tabellen er lavet til.
  test("giver hvert fødselsår højst ét års aldersforskel, og alderen er dagene fødselsdagen fortjener", async () => {
    for (const raekke of foedselsaarRaekker(tilIsoDato(new Date()))) {
      expect(raekke.maxAlder - raekke.minAlder).toBeLessThanOrEqual(1);
      expect(raekke.minAlder).toBeGreaterThanOrEqual(0);

      const senest = beregnAlder({
        foedselsdato: `${raekke.aar}-12-31`,
        beregningsdato: tilIsoDato(new Date()),
      })!;
      const tidligst = beregnAlder({
        foedselsdato: `${raekke.aar}-01-01`,
        beregningsdato: tilIsoDato(new Date()),
      })!;
      expect(raekke.minDage).toBe(senest.totalDage);
      expect(raekke.maxDage).toBe(tidligst.totalDage);
      expect(raekke.maxDage - raekke.minDage).toBeGreaterThan(300);
    }
  });

  test("svarer på 'beregn alder i Excel' med DATEDIF og sidens egne tal", async () => {
    const html = renderToStaticMarkup(await AlderPage());

    expect(html).toContain("Sådan beregner du alder i Excel");
    for (const formel of [
      "=DATEDIF(A1;B1;",
      "DATEDIF(A1;B1;&quot;Y&quot;)",
      "DATEDIF(A1;B1;&quot;M&quot;)",
      "DATEDIF(A1;B1;&quot;D&quot;)",
      "DATEDIF(A1;B1;&quot;YM&quot;)",
      "DATEDIF(A1;B1;&quot;YD&quot;)",
    ]) {
      expect(html).toContain(formel);
    }
    // Tallene i Excel-tabellen er sidens egne eksempel, regnet af modulet.
    const eksempel = ALDER_EKSEEMPLER[0];
    expect(eksempel.aar).toBe(36);
    expect(eksempel.maaneder).toBe(6);
    expect(eksempel.dage).toBe(10);
    expect(eksempel.totalDage).toBe(13343);
    expect(eksempel.aar * 12 + eksempel.maaneder).toBe(438);
    expect(html).toContain("13.343");
  });

  // C84's og C87's lære: en indekseret tekst må ikke sige et tal, logikken
  // modsiger. Før denne rettelse stod der 13.342 dage i FAQ'en — i alle tre
  // sprog, og page-data.test.ts låste det.
  test("FAQ'ens dage-tal er det beregnAlder giver for den samme dato", () => {
    const faq = getPageData("alder", "da")!.faqItems;
    const iDage = faq.find((item) => item.question === "Hvor gammel er jeg i dage?");
    const rigtigt = beregnAlder({
      foedselsdato: "1990-03-15",
      beregningsdato: "2026-09-25",
    })!;

    expect(rigtigt.totalDage).toBe(13343);
    expect(iDage?.answer).toContain("13.343");
    expect(iDage?.answer).not.toContain("13.342");
  });

  // FAQ'en ligger i page-data, fordi page.test.tsx mocker FAQ-komponenten væk
  // (C85's og C86's fælde). Den skal derfor svara på de samme søgninger som
  // brødteksten — ellers er svaret kun i den ene af de to.
  test("FAQ'en stiller de tre nye spørgsmål, som autocomplete viser", () => {
    const spoergsmaal = getPageData("alder", "da")!.faqItems.map((item) => item.question);

    expect(spoergsmaal).toContain("Hvor gammel er jeg, hvis jeg er født i 2007?");
    expect(spoergsmaal).toContain("Hvordan beregner jeg alder i Excel?");
    expect(spoergsmaal).toContain("Kan jeg beregne min alder ud fra CPR-nummeret?");
  });

  // Svensk autocomplete (hl=se, gl=se, 2026-09-28) har "räkna ut ålder från
  // personnummer" som nr. 2, "räkna ut ålder excel" som nr. 5 og "räkna ut
  // ålder excel personnummer" som nr. 9 under "räkna ut ålder". GSC viser
  // beraknare.se/alder på 3.197 visninger, CTR 0,3 %, pos. 7,7 — altså første
  // side, men næsten ingen klik. Sådan så den ud, før denne rettelse: 0
  // forekomster af "personnummer" og 0 af "Excel" på svensk, mod 16 Excel på
  // dansk. Svensk CTR er derfor emnet, og da-grenen er urørt.
  test("den svenska sidan svarer på personnummer-klyngen", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await AlderPage());

    expect(html).toContain("Räkna ut ålder från personnummer");
    // Skatteverkets egna exempel, så tallene ikke er gætter.
    expect(html).toContain("640823");
    expect(html).toContain("23 augusti 1964");
    expect(html).toContain("19900315");
    expect(html).toContain("701063-2391");
    expect(html).toContain("3 oktober 1970");
    expect(html).toContain("skatteverket.se/privat/folkbokforing/personnummer/");
    expect(html).toContain("skatteverket.se/privat/folkbokforing/samordningsnummer/");
    // Bindestreken blir plustegn det år man fyller 100 — sagten må ikke glide
    // tilbage til den gamle "60 år"-forklaringen, som ikke findes hos Skatteverket.
    expect(html).toContain("plustecken");
    expect(html).toMatch(/100 år|100/);
    expect(html).not.toContain("60 år");
  });

  test("den svenska Excel-tabel har samma formler som den danske, med svensk IDAG()", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await AlderPage());

    expect(html).toContain("Så beräknar du ålder i Excel");
    for (const formel of [
      "=DATEDIF(A1;B1;&quot;Y&quot;)",
      "=DATEDIF(A1;B1;&quot;M&quot;)",
      "=DATEDIF(A1;B1;&quot;D&quot;)",
      "DATEDIF(A1;B1;&quot;YM&quot;)",
      "DATEDIF(A1;B1;&quot;YD&quot;)",
      "=IDAG()",
      "=DATUM(1900+VÄRDE(VÄNSTER(A1;2))",
    ]) {
      expect(html).toContain(formel);
    }
    // Tallene er sidens egne, regnet af modulet — ikke skrevet i hånden.
    const rigtigt = beregnAlder({
      foedselsdato: "1990-03-15",
      beregningsdato: "2026-09-25",
    })!;
    expect(rigtigt.aar * 12 + rigtigt.maaneder).toBe(438);
    expect(rigtigt.totalDage).toBe(13343);
    expect(html).toContain("13.343");
    expect(html).toContain("19900315");
  });

  test("fødselsårs-tabellen findes også på svensk, og året i overskriften er et år i tabellen", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await AlderPage());
    const raekker = foedselsaarRaekker(tilIsoDato(new Date()));

    expect(html).toMatch(/<h2[^>]*>Hur gammal är jag om jag är född i \d{4}\?<\/h2>/);
    const aarIHeadline = Number(html.match(/är jag om jag är född i (\d{4})\?/)?.[1]);
    expect(raekker.map((r) => r.aar)).toContain(aarIHeadline);
    expect(html).toContain("Dagar levda");
    expect(html).toContain("Född år");
  });

  test("FAQ'en på svensk stiller de samme spørgsmål som brødteksten", () => {
    const faq = getPageData("alder", "se")!.faqItems.map((item) => item.question);

    expect(faq).toContain("Räkna ut ålder från personnummer?");
    expect(faq).toContain("Hur beräknar man ålder i Excel?");
    expect(faq).toContain("Varför står det två åldrar för varje födelseår?");
  });

  // Personnummer-FAQ'en siger 36 år, 6 månader og 10 dagar for 15. mars 1990.
  // Det skal være det beregnAlder giver for de samme to datoer — ellers er
  // svaret i FAQ'en og svaret i brødteksten ikke det samme svar.
  test("personnummer-FAQ'ens alder er den beregnAlder giver", () => {
    const faq = getPageData("alder", "se")!.faqItems;
    const punkt = faq.find((item) => item.question === "Räkna ut ålder från personnummer?");
    const rigtigt = beregnAlder({
      foedselsdato: "1990-03-15",
      beregningsdato: "2026-09-25",
    })!;

    expect(rigtigt.aar).toBe(36);
    expect(punkt?.answer).toContain("36 år, 6 månader och 10 dagar");
    expect(punkt?.answer).toContain("900315");
    // Samordningsnumret: dagen er 60 højere, så 63 skal læses som 3.
    expect(punkt?.answer).toContain("63 ska läsas som 3");
  });

  // "Hvor mange dage har jeg levet" / "hur många dagar har jag levt" stod som
  // autocomplete nr. 1 i begge sprog med 0 forekomster på begge live-sider,
  // selv om værktøjet viser "Dage levet" i sin egen resultattabel. GSC har
  // den som nr. 3 blandt beraknare.se's /dato-søgninger (385 v, pos. 10).
  test.each([
    { locale: "da" as const, overskrift: "Hvor mange dage har du levet?" },
    { locale: "se" as const, overskrift: "Hur många dagar har du levt?" },
  ])("svarer på 'hvor mange dage har du levet' i $locale", async ({ locale, overskrift }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
    const html = renderToStaticMarkup(await AlderPage());
    const levet = alderLevet(tilIsoDato(new Date()));

    expect(html).toContain(`<h2>${overskrift}</h2>`);
    // Tallene skriver sig selv fra beregnAlder, så brødteksten kan ikke love
    // et tal logikken modsiger — C84's og C87's lære.
    expect(html).toContain(formatDageTal(levet.totalDage, locale));
    expect(html).toContain(formatDageTal(levet.totalUger, locale));
    expect(html).toContain(formatDageTal(levet.totalTimer, locale));
    // Kalenderdage, ikke timer: et døgn med uret stillet er stadig 1 dag.
    expect(html).toContain("24");
    expect(html).toContain('href="/dato"');
  });

  // Modulet skal ikke kunne svare med et tal, der ikke stemmer med
  // `beregnAlder`. Uden denne lås kunne en ny tekstlove et forkert dage-tal.
  test("alderLevet er præcis beregnAlder for de samme to datoer", () => {
    const rigtigt = beregnAlder({
      foedselsdato: LEVET_FOEDSELSDATO,
      beregningsdato: "2026-09-25",
    })!;
    const levet = alderLevet("2026-09-25");

    expect(levet.totalDage).toBe(rigtigt.totalDage);
    expect(levet.totalUger).toBe(rigtigt.totalUger);
    expect(levet.totalMaaneder).toBe(rigtigt.totalMaaneder);
    expect(levet.totalTimer).toBe(rigtigt.totalTimer);
    expect(levet.totalMinutter).toBe(rigtigt.totalMinutter);
    // De fire konstanter, der står håndskrevet i FAQ'en.
    expect(levet.totalDage).toBe(13343);
    expect(levet.totalUger).toBe(1906);
    expect(levet.totalMaaneder).toBe(438);
    expect(levet.totalTimer).toBe(320232);
  });

  // En fødselsdato efter beregningsdatoen kan ikke give en levetid. Modulet
  // kaster i stedet for at returnere null, så en framtidsdato ikke kan give
  // en læser et negativt antal dage.
  test("alderLevet kaster på en fødselsdato efter reference-datoen", () => {
    expect(() => alderLevet("1990-03-14")).toThrow(/kan ikke beregnes/);
  });

  // FAQ'en ligger i page-data og kommer derfor i JSON-LD'en. Den skal sige
  // præcis det brødteksten siger, ellers svarer de to overflader på
  // spørgsmålet med to forskellige tal (C84's fejlklasse).
  test.each([
    { locale: "da" as const, sporgsmaal: "Hvor mange dager har jeg levet?" },
    { locale: "da" as const, sporgsmaal: "Hvor mange dager har jeg været i live?" },
    { locale: "se" as const, sporgsmaal: "Hur många dagar har jag levt?" },
    { locale: "se" as const, sporgsmaal: "Hur många timmar har jag levt?" },
  ])("FAQ'en i $locale stiller '$sporgsmaal'", ({ locale, sporgsmaal }) => {
    const faq = getPageData("alder", locale)!.faqItems;
    const punkt = faq.find((item) => item.question === sporgsmaal);

    expect(punkt, `${sporgsmaal} mangler i ${locale}`).toBeDefined();
    // Dage-levet-tallet i FAQ'en er det beregnAlder giver for de samme datoer.
    expect(punkt?.answer).toContain("13.343");
    expect(punkt?.answer).toContain("320.232");
    expect(punkt?.answer).not.toContain("13.342");
  });

  // `no`-sproget serverer ikke (domænet er hidden, jf. C79), så den nye blok
  // skal ikke tilføje tekst til en side ingen ser — og den må ikke have en
  // halv dansk halv svensk overskrift.
  test("den nye blok findes ikke på norsk", async () => {
    vi.mocked(getLocale).mockResolvedValue("no");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("no"));
    const html = renderToStaticMarkup(await AlderPage());

    expect(html).not.toContain("Hvor mange dage har du levet?");
    expect(html).not.toContain("Hur många dagar har du levt?");
  });
});
