import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { formatNumber } from "@/lib/format";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { PROCENT_10_AF_TAL } from "@/lib/procent";
import ProcentPage from "./page";

vi.mock("@/components/ProcentBeregner", () => ({
  default: () => <div>Procentværktøj</div>,
}));
// Samme grund som linjen oven: renderToStaticMarkup kører uden LocaleProvider,
// som de to værktøjer læser deres sprog fra. Værktøjets egen port
// (ProcentpointBeregner.test.tsx) dækker dens adfærd med provider.
vi.mock("@/components/ProcentpointBeregner", () => ({
  default: () => <div>Procentpointværktøj</div>,
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

/** React skriver `<!-- -->` mellem to tekstnoder i én JSX-celle, så de fjernes før grep. */
async function render(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return (await renderToStaticMarkup(await ProcentPage())).replaceAll("<!-- -->", "");
}

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

  test("den svenska siden har Excel-formlerna og säger inte på dansk skatt", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await ProcentPage());

    // Autocomplete (hl=sv): "hur räknar man ut procent i excel".
    expect(html).toContain("Hur räknar man ut procent i Excel?");
    expect(html).toContain("=A1/B1*100");
    expect(html).toContain("=A1*B1/100");
    // Interne links til de svenska værktøj, der besvarar den næste
    // spørgsmål i samme klasse.
    expect(html).toContain('href="/lon-efter-skatt"');
    expect(html).toContain('href="/loenstigning"');
    // 37 % er en dansk sats og kan ikke dokumenteres for svensk lön.
    expect(html).not.toContain("37% skatt");
    expect(html).toContain("kommunal skatt");
  });

  test("den danske side har Excel-formlerna og ingen dansk sats på et helt beløb", async () => {
    const html = renderToStaticMarkup(await ProcentPage());

    // Dansk autocomplete (hl=da, 2026-09-27) peger på "procent i excel
    // formel", "minus procent i excel" og "procent stigning i excel" — de
    // samme formler fandtes kun på den svenske side.
    expect(html).toContain("Hvordan regner man procent i Excel?");
    expect(html).toContain("=A1/B1*100");
    expect(html).toContain("=A1*B1/100");
    expect(html).toContain("=(B1-A1)/A1*100");
    expect(html).toContain('href="/loenstigning"');
    expect(html).toContain('href="/loen-efter-skat"');
    // 37 % er kommuneskat + statslig bundskat, og den statslige del først
    // slår ind over 641.200 kr (SATSER_2026.mellemskatGraense) — så den må
    // ikke stå som et resultat for 40.000 kr.
    expect(html).not.toContain("37% skat af 40.000 kr");
    expect(html).not.toContain("14.800");
    // Dansk tusindtalsseparator i brødteksten.
    expect(html).not.toContain("på 1000 kr");
  });

  // 8796c16 lod dansk og norsk urørt, fordi arbejdet var på den svenske
  // side. Det er samme metode, så formlerne skal findes i begge sprog.
  test("begge sprog har de tre Excel-formler", async () => {
    for (const [locale, overskrift] of [
      ["da", "Hvordan regner man procent i Excel?"],
      ["se", "Hur räknar man ut procent i Excel?"],
    ] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await ProcentPage());

      expect(html).toContain(overskrift);
      for (const formel of ["=A1/B1*100", "=A1*B1/100", "=(B1-A1)/A1*100"]) {
        expect(html).toContain(formel);
      }
    }
  });

  // SE /procent er beraknare.se's tredjestørste side (25.954 visninger, 2 klik,
  // CTR 0,0 %, pos. 10,0) og svarede på nul af den klynge, dens egen
  // sidekonkurrence danner: "procent skillnad mellan två tal" er nr. 1 under
  // "procent skillnad" og "räkna ut procent mellan två tal" nr. 10 under
  // "räkna ut procent" (autocomplete hl=se, 2026-09-28). Siden havde nul
  // forekomster af "mellan två tal".
  test("den svenska side svarar på skillnaden mellem to tall", async () => {
    const html = await render("se");

    expect(html).toContain("<h2>Skillnad i procent mellan två tal</h2>");
    // De to formler, der giver hver sit svar for de samme to tall.
    expect(html).toContain("((Ny - Gammal) / Gammal) × 100");
    expect(html).toContain("(|A - B| / ((A + B) / 2)) × 100");
    // Clusteren har tre Excel-varianter, så formlen skal stå i tabellen.
    expect(html).toContain("=(B1-A1)/A1*100");
    // Tallene er regnet, ikke skrevet i hånden: 25 % forskel mod 22,2 %
    // differens for 10 000 -> 12 500, og 10 % mod 9,5 % for 30 000 -> 33 000.
    expect(html).toContain("10 000 till 12 500 = 25 procent");
    expect(html).toContain("10 000 och 12 500 = 22,2 procent");
    expect(html).toContain("30 000 kr, som stiger till 33 000 kr");
    expect(html).toContain("ökning på 10 procent i en");
    expect(html).toContain("9,5 procent stora skillnaden");
    // Og fælden skal være skrevet ud, ellers er de to tal bare forvirrende.
    expect(html).toContain("De två formlerna ger aldrig samma svar");
    expect(html).toContain('href="/loenstigning"');
  });

  // De tre ovenstående forventninger lå på den *danske* tekst i den svenske
  // blok, så de var grønne med netop den fejl de skulle have fanget. Det er
  // C84's og C115's fejlklasse: en test der genskaber den kode, den skal
  // modsige, beviser intet. Derfor låses den danske tekst nu negativt, så den
  // ikke kan komme tilbage ved at nogen kopierer en dansk sætning ind.
  test("den svenska side har ingen dansk tekst i skillnadsafsnittet", async () => {
    const html = await render("se");
    for (const dansk of [
      "der stiger til",
      "er en stigning på",
      "den gamle summen",
      "procent store forskellen",
      "regnet på",
      "De to formlene gir",
      "er det gamle tallet",
      "hvor A1",
    ]) {
      expect(html).not.toContain(dansk);
    }
  });

  // Samme tal må aldrig stå med to forskellige separatorer på én side:
  // Intl bruger U+00A0 på svensk, resten af siden bruger almindeligt mellemrum.
  test("den svenska side bruger almindeligt mellemrum i tallene", async () => {
    const html = await render("se");
    expect(html).toContain("10 000 till 12 500");
    expect(html).not.toContain("\u00a0000");
  });

  // Den danske side fik sin egen svar-sektion i C170. Den gamle lås her krævede
  // "procentdifferens" på den danske side, altså låste den *tilstanden før
  // rettelsen* i stedet for en egenskab — C94's fejlklasse. Den er skrevet om
  // til de to ting, der faktisk skal gælde: dansk har sin egen overskrift, og
  // den svenske lækker ikke ind i den.
  test("den danske side svarer på procentforskel mellem to tal", async () => {
    const html = await render("da");

    expect(html).toContain("<h2>Sådan beregner du procentforskellen mellem to tal</h2>");
    // De to formler, der giver hver sit svar for de samme to tal.
    expect(html).toContain("((Ny - Gammel) / Gammel) × 100");
    expect(html).toContain("(|A - B| / ((A + B) / 2)) × 100");
    expect(html).toContain("=(B1-A1)/A1*100");
    // Tallene er regnet af procentForskel/procentDifferens, ikke skrevet i
    // hånden: 25 % mod 22,2 % for 10.000 -> 12.500 og 10 % mod 9,5 % for
    // 30.000 -> 33.000. Dansk tusindtalsseparator er punktum, ikke mellemrum.
    expect(html).toContain("10.000 til 12.500 = 25 procent");
    expect(html).toContain("10.000 og 12.500 = 22,2 procent");
    expect(html).toContain("30.000 kr, der stiger til 33.000 kr");
    expect(html).toContain("stigning på 10 procent i en");
    expect(html).toContain("9,5 procent store forskel");
    // Fælden skal stå, ellers er de to tal bare forvirrende.
    expect(html).toContain("De to formler giver aldrig samme svar");
    expect(html).toContain('href="/loenstigning"');
  });

  test("den danske side har ingen svensk tekst i skillnadsafsnittet", async () => {
    const html = await render("da");
    expect(html).not.toContain("Skillnad i procent mellan två tal");
    expect(html).not.toContain("De två formlerna ger aldrig samma svar");
    // "procentdifferens" staves ens på dansk og svensk, så den låses ikke —
    // det gjorde den gamle test, som så lå den danske sætning være ulovlig.
    expect(html).not.toContain("mellanvärde");
    expect(html).not.toContain("Den två formlerna");
  });

  // Svensk skal have præcis sin egen overskrift. Låsen tæller forekomster, så
  // en dansk sætning der bliver kopieret ind i den svenske gren fanges her.
  test("hvert sprog har præcis sin egen skillnads-overskrift", async () => {
    const da = await render("da");
    const se = await render("se");

    expect(da.match(/Sådan beregner du procentforskellen mellem to tal/g)).toHaveLength(1);
    expect(da).not.toContain("Skillnad i procent mellan två tal");
    expect(se.match(/Skillnad i procent mellan två tal/g)).toHaveLength(1);
    expect(se).not.toContain("procentforskellen mellem to tal");
  });

  // "10 procent af" er GSC's tredjestørste søgning på siden (53 visninger,
  // pos. 6) og dansk autocomplete svarer den med ni tal ud af ti. Siden
  // indeholdt før kun "10 % af 250", så låsen er på hvert eneste målt tal.
  test.each([
    { locale: "da" as const, spoergsmaal: "10 procent af" },
    { locale: "se" as const, spoergsmaal: "10 procent av" },
  ])("$locale svarer på hvert tal fra sin egen autocomplete-liste", async ({ locale, spoergsmaal }) => {
    const html = await render(locale);

    for (const tal of PROCENT_10_AF_TAL) {
      // Samme formatering som page.tsx bruger: Intl med landets eget
      // tusindtalsseparator, og U+00A0 (som svensk Intl bruger) normaliseret
      // til et mellemrum, fordi resten af den svenske side gør det.
      const formateret = formatNumber(tal, locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).replace(/ /g, " ");
      expect(html).toContain(`${spoergsmaal} ${formateret}</td>`);
    }
  });

  test("svaret i hver række er tallet delt med 10", async () => {
    const html = await render("da");

    // 75 er det eneste tal med komma i svaret, så det låser både heltal og
    // decimal: en formatteringsfejl ville skrive 7,5 som 8. 1.600 står med
    // punktum, fordi det er dansk tusindtalsseparator.
    expect(html).toContain("10 procent af 75</td><td>7,5</td>");
    expect(html).toContain("10 procent af 500</td><td>50</td>");
    expect(html).toContain("10 procent af 1.600</td><td>160</td>");
  });

  // Svensk skal have præcis sin egen 10-procent-sektion. Samme lære som
  // skillnadsafsnittet ovenfor: et negativt lås må kræve en egenskab, ikke
  // en tilstand — "dansk må ikke have den svenska sektion" låser den
  // tilstand før rettelsen og ville blokere næste svar-rettelse.
  test("hvert sprog har præcis sin egen 10-procent-overskrift", async () => {
    const da = await render("da");
    const se = await render("se");

    expect(da.match(/10 procent af et tal/g)).toHaveLength(1);
    expect(da).not.toContain("10 procent av ett tal");
    expect(se.match(/10 procent av ett tal/g)).toHaveLength(1);
    expect(se).not.toContain("10 procent af et tal");
  });

  test("begge tabeller har præcis de samme rækker", async () => {
    const da = await render("da");
    const se = await render("se");

    // En ny række kun i det ene sprog er en fejl: tallene kommer fra én
    // konstant, så de to domæner skal se identiske tabeller.
    const rækker = (html: string, mønster: RegExp) =>
      html.match(new RegExp(mønster.source, "g"))?.length ?? 0;
    expect(
      rækker(da, /10 procent af ([\d\s.]+)<\/td>/),
    ).toBe(PROCENT_10_AF_TAL.length);
    expect(
      rækker(se, /10 procent av ([\d\s.]+)<\/td>/),
    ).toBe(PROCENT_10_AF_TAL.length);
  });

  test("hverken dansk eller svensk side har den anden sprogbloks sats-omtekst", async () => {
    const da = await render("da");
    const se = await render("se");

    expect(da).toContain("25 procent er en fjerdedel");
    expect(da).not.toContain("25 procent är en fjärdedel");
    expect(se).toContain("25 procent är en fjärdedel");
    expect(se).not.toContain("25 procent er en fjerdedel");
  });
});

// GSC's tredjestørste søgning på /procent (56 visninger, pos. 6,
// 2026-08-31 → 2026-09-28) er en hel sætning fra en læser: "en telefon er
// sat 1125 kr. ned. normalt koster den 9000 kr. hvor stor er rabatten i
// procent?". Før dette afsnit stod svaret kun som en bullet i "Procentregning
// i hverdagen", skrevet i hånden og uden formlen — altså ikke et svar, man
// kan regne efter, og tal der intet låste ved siden af.
describe("rabat i procent", () => {
  test("den danske side svarer på spørgsmålet med formel og gennemregnet eksempel", async () => {
    const html = await render("da");

    expect(html).toContain("<h2>Sådan beregner du rabatten i procent</h2>");
    expect(html).toContain("Rabatprocent = (Prisnedsættelse ÷ Normalpris) × 100");
    // Alle tre tal regnes fra RABAT_EKSEMPEL, så de kan ikke være skrevet
    // forkert ved siden af formlen. Punktum er dansk tusindtalsseparator.
    expect(html).toContain("normalprisen er 9.000 kr, varen er sat 1.125 kr ned, så den nye pris er 7.875 kr");
    expect(html).toContain("1.125 ÷ 9.000 × 100 = <strong>12,5 procent</strong>");
    // Fælden skal stå, ellers er 12,5 og 14,3 bare to forvirrende tal.
    expect(html).toContain("Del med den normale pris, ikke med den nye");
    expect(html).toContain("1.125 kr er 14,3 procent af den pris, du betaler");
    // Og den værktøjet der regner de to priser uden regnestykke.
    expect(html).toContain('href="/rabat"');
  });

  test("den svenska side har samme svar, samme tal og sin egen formulering", async () => {
    const html = await render("se");

    expect(html).toContain("<h2>Så här räknar du ut rabatten i procent</h2>");
    expect(html).toContain("Rabatprocent = (Prisnedsättning ÷ Vanligt pris) × 100");
    // Svensk tusindtalsseparator er mellemrum, ikke punktum.
    expect(html).toContain("det vanliga priset är 9 000 kr, varan har sänkts 1 125 kr, så det nya priset är 7 875 kr");
    expect(html).toContain("1 125 ÷ 9 000 × 100 = <strong>12,5 procent</strong>");
    expect(html).toContain("Dela med det vanliga priset, inte med det nya");
    expect(html).toContain("1 125 kr är 14,3 procent av det du betalar");
  });

  // Samme fejlklasse som C84/C115, der lå på den danske tekst i den svenske
  // blok: en test der genskaber den kode, den skal modsige, beviser intet.
  test("hvert sprog har præcis sin egen rabat-tekst", async () => {
    const da = await render("da");
    const se = await render("se");

    expect(da).not.toContain("Rabatprocent = (Prisnedsättning ÷ Vanligt pris)");
    expect(da).not.toContain("Så här räknar du ut rabatten i procent");
    expect(se).not.toContain("Rabatprocent = (Prisnedsættelse ÷ Normalpris)");
    expect(se).not.toContain("Sådan beregner du rabatten i procent");
  });

  // Formlen skal have én ejer, som de fire formler i referenceboksen har.
  // Tæller forekomster, så en dansk sætning kopieret ind i den svenske
  // gren fanges her i stedet for at give to sider samme svar.
  test("rabatformlen står præcis én gang pr. sprog", async () => {
    const da = await render("da");
    const se = await render("se");

    const tæl = (html: string, mønster: RegExp) => html.match(mønster)?.length ?? 0;
    expect(tæl(da, /Rabatprocent = \(Prisnedsættelse ÷ Normalpris\)/g)).toBe(1);
    expect(tæl(se, /Rabatprocent = \(Prisnedsättning ÷ Vanligt pris\)/g)).toBe(1);
  });

  // Sats-tabellen viser det, man *betaler* — det var ikke på siden før, og
  // det er det folk spørger om ("hvor meget koster 30 % rabat"). Rækkerne
  // kommer fra RABAT_SATS, så de to sprog skal se ens ud.
  test.each([
    { locale: "da" as const, spoergsmaal: "Hvad koster X % rabat på en vare til 1.000 kr?" },
    { locale: "se" as const, spoergsmaal: "Vad kostar X % rabatt på en vara för 1 000 kr?" },
  ])("$locale tabellerer både besparelse og pris", async ({ locale, spoergsmaal }) => {
    const html = await render(locale);

    expect(html).toContain(`<h3>${spoergsmaal}</h3>`);
    for (const [sats, sparer, betaler] of [
      [10, 100, 900],
      [20, 200, 800],
      [25, 250, 750],
      [33, 330, 670],
      [50, 500, 500],
    ] as const) {
      expect(html).toContain(`<td>${sats} %</td><td>${sparer}</td><td>${betaler}</td>`);
    }
  });

  // Påstanden i teksten om 33 %: en tredjedel af 1.000 er 333,33, så den
  // giver 666,67 kr — ikke de 670 kr som 33 % giver. Uden denne test er
  // sætningen en ubevidst påstand i brødteksten.
  test.each([
    {
      locale: "da" as const,
      paastand: "33 % er ikke en tredjedel",
      foelge: "så du ville betalt 666,67 kr",
      pris: "du betaler 670 kr",
      tusind: "en tredjedel af 1.000 kr er 333,33 kr",
    },
    {
      locale: "se" as const,
      paastand: "33 % är inte en tredjedel",
      foelge: "så du hade betalat 666,67 kr",
      pris: "du betalar 670 kr",
      tusind: "en tredjedel av 1 000 kr är 333,33 kr",
    },
  ])("$locale siger at 33 % ikke er en tredjedel", async ({ locale, paastand, foelge, pris, tusind }) => {
    const html = await render(locale);

    expect(html).toContain(paastand);
    expect(html).toContain(tusind);
    expect(html).toContain(foelge);
    expect(html).toContain(pris);
  });

  // De 9.000/1.125-tal lå tidligere to steder: i bulletten og i det nye
  // afsnit. Kun det nye afsnit regner dem, så bulletten skal være ryddet —
  // ellers kan de to glide fra hinanden, og det er præcis den dublet
  // "formlerne har én ejer"-testen fjernede for formlerne.
  test("hverdagsbulletten ikke længere gentager rabattallene", async () => {
    const html = await render("da");

    expect(html).toContain(
      "<li><strong>Rabatter:</strong> 25% rabat på en vare til 400 kr = du sparer 100 kr</li>",
    );
    expect(html).not.toContain("1.125 ÷ 9.000 = 12,5");
  });
});

// ─── Procentpoint-klyngen ────────────────────────────────────────────────
// Dansk autocomplete (hl=da&gl=dk, målt 2026-10-01) svarer på "hvad er
// procent" med "hvad er procentpoint" som nummer ét, og alle otte
// completions under "procent point" handler om den enhed. Siden havde før
// dette afsnit kun én FAQ-sætning om den. Porten dømmer på den RENDEREDE
// markup, fordi hele pointen er at læseren kan se forskellen — tallene
// stammer fra PROCENTPOINT_EKSEMPEL, så de kan ikke glide fra tabellen.
describe("procentpoint-afsnittet", () => {
  test("dansk: overskrift, definition og de fem tabelrækker", async () => {
    const html = await render("da");

    expect(html).toContain("Forskellen på procentpoint og procent");
    // Point forskellen for de tre rentetrin, alle +1.
    expect(html).toContain("De tre renterækker er det samme flytning, tre gange.");
    // Rækkerne i markupken, med de to tal og point forskellen.
    expect(html).toContain("1 % til 2 %");
    expect(html).toContain("3 % til 4 %");
    expect(html).toContain("22,1 % til 19,7 %");
    // Point forskellen er skrevet i tabellen, den relative i næste kolonne.
    expect(html).toContain("point");
    expect(html).toMatch(/100 %/);
    expect(html).toMatch(/33,3 %/);
  });

  test("svensk: egen overskrift og egen enhed", async () => {
    const html = await render("se");

    expect(html).toContain("Skillnad mellan procentenheter och procent");
    expect(html).toContain("Ränderaderna är samma flytt, tre gånger.");
    // Svensk må ikke tale om danske "point" alene — enheden hedder
    // procentenheter, og det er den svenske læser skal se.
    expect(html).not.toContain("point</strong>");
  });

  test("begge sprog har værktøjet og en kilde på rentebanen", async () => {
    for (const [locale, kilde] of [
      ["da", "https://www.nationalbanken.dk/den-rabende-rente"],
      ["se", "https://www.riksbank.se/sv/politik/penningpolitik/"],
    ] as const) {
      const html = await render(locale);
      expect(html).toContain("Procentpointværktøj");
      expect(html).toContain(kilde);
    }
  });

  test("dansk: FAQ'en svarer på de tre spørgsmål, autocomplete har vist", async () => {
    // FAQ'en og FAQSchema er mock'et væk i denne fil, så spørgsmålene læses
    // fra sidekilden — den samme kilde som de to komponenter læser.
    const { getPageData } = await import("@/lib/page-data");
    const spg = getPageData("procent", "da")!.faqItems;
    const spoergsmaal = spg.map((f) => f.question);
    const svar = spg.map((f) => f.answer).join(" ");

    expect(spoergsmaal).toContain("Hvad er procentpoint vs procent?");
    expect(spoergsmaal).toContain("Hvad er forskellen på procentpoint og procent?");
    expect(spoergsmaal).toContain("Hvor mange procentpoint er 1 procent?");
    // Svaret skal pege på værktøjet, ellers er der ingen næste handling.
    expect(svar).toContain("procentpointberegneren");
  });
});
