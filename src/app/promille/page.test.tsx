import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { PROMILLEGRANSE } from "@/lib/promille";
import PromillePage from "./page";

vi.mock("@/components/PromilleBeregner", () => ({
  default: () => <div>Promilleværktøj</div>,
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

describe("promille page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Promilleberegner",
      answer: "4 øl til en mand på 80 kg giver 0,88 ‰",
      limit: "promille <strong>over 0,5 ‰</strong>",
    },
    {
      locale: "se" as const,
      heading: "Promillekalkylator",
      answer: "4 öl till en man på 80 kg ger 0,88 ‰",
      limit: "gränsen för rattfylleri vid <strong>0,2 ‰</strong>",
    },
  ])(
    "viser det konkrete promille-svar, den rigtige grænse og beregneren i $locale",
    async ({ locale, heading, answer, limit }) => {
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await PromillePage());

      expect(html).toContain(`>${heading}</h1>`);
      expect(html).toContain(answer);
      expect(html).toContain(limit);
      expect(html).toContain("Promilleværktøj");
    }
  );

  test("svarer på hvor mange promille N øl giver, med tal for tre kropsvægte", async () => {
    const html = renderToStaticMarkup(await PromillePage());

    // "promille efter 1/2/3 øl", "promille efter 1 glas vin" — de ti variationer
    // under "promille efter" i dansk autocomplete.
    expect(html).toContain("Hvor mange promille er N øl?");
    expect(html).toContain("0,44 ‰");
    expect(html).toContain("0,88 ‰");
    expect(html).toContain("1,45 ‰");
    // Grænsen skal være sat rigtigt ind mellem to og tre øl for en 80 kg mand.
    expect(html).toContain("mellem to og tre øl");
  });

  test("svarer på promillegrænsen i de lande, dansk autocomplete spørger om", async () => {
    const html = renderToStaticMarkup(await PromillePage());

    // De ti variationer under "promillegrænse" i dansk autocomplete (27/9):
    // … danmark, sverige, tyskland, italien, norge, frankrig, spanien, cykel
    // og grækenland. Siden havde kun Danmark og Sverige.
    expect(html).toContain("Promillegrænsen i udlandet");
    for (const land of [
      "Tyskland",
      "Norge",
      "Italien",
      "Frankrig",
      "Spanien",
      "Grækenland",
      "Sverige",
      "Polen",
      "Holland",
      "Østrig",
      "Storbritannien",
    ]) {
      expect(html).toContain(`<td>${land}</td>`);
    }
    // Domene 2 af autocomplete-klyngen er ikke et land: "promillegrænse cykel"
    // gælder færdselsloven, ikke et andet lands lov, og cykler har ingen
    // promillegrænse i Danmark. Siden skal ikke finde på en.
    expect(html).toContain("0,8 ‰");
  });

  test("tabellens tal er de samme som dem beregneren selv sammenligner mod", async () => {
    const html = renderToStaticMarkup(await PromillePage());

    // Samme fejlklasse som C84's metaDescription-drift: en tabel med egne
    // tal kan glide fra modulet, der beskriver dem. Danmark, Sverige og
    // Norge låser derfor på PROMILLEGRANSE, så siden aldrig kan trykke en
    // anden grænse end den beregneren bruger.
    for (const [land, nokkel] of [
      ["Danmark", "da"],
      ["Sverige", "se"],
      ["Norge", "no"],
    ] as const) {
      const forventet = `${String(PROMILLEGRANSE[nokkel]).replace(".", ",")} ‰`;
      const raekke = new RegExp(`<tr><td>${land}</td><td>${forventet}</td>`);
      expect(html).toMatch(raekke);
    }
    // Og de to tal, konklusionen bygger på, skal komme fra tabellen ovenfor —
    // ellers står påstanden alene.
    expect(html).toContain("2 øl på 80 kg er 0,44 ‰");
    expect(html).toContain("under den danske grænse, men over den svenske og norske på 0,2 ‰");
  });

  test("tabellen er vejledende, fordi reglerne ændrer sig", async () => {
    const html = renderToStaticMarkup(await PromillePage());

    // Raterne er fra WHO's landeoversigt, og en forkert grænse i en tabel er
    // en fejl folk kører bil efter. Siden skal sige det, den er.
    expect(html).toContain("vejledende");
    expect(html).toContain("WHO");
  });

  test("hver celle i den svenska tabel har tal OG enhed i én klynge", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    // React skriver `{" "}` som et kommentar-markørlag mellem tal og enhed,
    // altså `1,45<!-- --> ‰`. Det er normalt og hele sitet gør det — men
    // C78's fejl (8.25 i den indekserede tekst) var præcis den klasse, hvor
    // tallet og enheden bliver hængt fra hinanden. Låsen kræver derfor at
    // hver celle er ét tal umiddelbart efterfulgt af "‰", så en senere
    // refaktor ikke kan efterlade et tal uden enhed.
    const celler = html.match(/<td>[^<]*<\/td>/g) ?? [];
    const medPromille = celler.filter((c) => /[0-9],[0-9]{2}/.test(c));
    expect(medPromille.length).toBeGreaterThanOrEqual(15);
    for (const celle of medPromille) {
      expect(celle).toMatch(/^<td>[0-9],[0-9]{2} ‰<\/td>$/);
    }
  });

  test("den danske side er uændret: samme tabel, samme tal, samme sætning", async () => {
    const html = renderToStaticMarkup(await PromillePage());

    // Rettelsen lagde et nyt modul bag tabellen, så den danske side skal
    // stadig vise præcis de tal den viste før — ellers har en "ren" SE-rettelse
    // flyttet tal i den danske brødtekst.
    for (const celle of [
      "<td>0,22 ‰</td>",
      "<td>0,44 ‰</td>",
      "<td>0,66 ‰</td>",
      "<td>0,88 ‰</td>",
      "<td>1,32 ‰</td>",
      "<td>0,73 ‰</td>",
      "<td>1,09 ‰</td>",
      "<td>1,45 ‰</td>",
      "<td>2,18 ‰</td>",
    ]) {
      expect(html).toContain(celle);
    }
    expect(html).toContain("Hvor mange promille er N øl?");
    expect(html).toContain("mellem to og tre øl");
  });
  test("de danske og svenske grænser er uændrede af udlandstabellen", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    // Sveriges egen grænse skal stadig være den, siden svarer med, også når
    // den svenske udlandstabel er lagt ind. Før denne iteration lå låsen på
    // at beraknare.se slet ikke havde en landtabel — den sætning holdt, fordi
    // C87's måling kun var dansk, ikke fordi en svensk tabel ville være forkert.
    expect(html).toContain("gränsen för rattfylleri vid <strong>0,2 ‰</strong>");
    // Og den danske overskrift må ikke stå på den svenska side.
    expect(html).not.toContain("Promillegrænsen i udlandet");
    expect(html).toContain("Promillegränsen utomlands");
  });

  test("beraknare.se svarer på 'hur många promille är N öl' med samme tabel som Danmark", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    // Svensk autocomplete under "promille efter" (hl=se, gl=se, 29. september
    // 2026) giver 10/10 variationer i præcis det her spørgsmål: "promille efter
    // 1 øl", "efter 2 øl", "efter 3 øl", "efter ett glas vin" … Siden havde
    // nul tabeller og nul forekomster af spørgsmålet.
    expect(html).toContain("Hur många promille är N öl?");
    // Tallene er de samme rækker som den danske side viser — de kommer fra
    // PROMILLE_GENSTANDE_RAEKKER, så de to sider ikke kan glide fra hinanden.
    for (const promille of ["0,22", "0,44", "0,66", "0,88", "1,32", "1,45", "2,18"]) {
      expect(html).toContain(`${promille} ‰`);
    }
    // Og grænsen skal være-sat ind i antal øl, ikke hårdkodet: 80 kg man
    // når 0,2 ‰ efter to øl, og 60 kg kvinde efter det samme.
    expect(html).toContain("gränsen på 0,2 ‰ går");
  });

  test("den svenska landtabel bruger svenska landnavne og Sveriges egen rækkefølge", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    expect(html).toContain("<td>Sverige</td>");
    // Holland hedder inte "Holland" på svenska, och Österrike heter Österrike.
    // En dansk läsare får "Holland" — det är hela poängen med låsen.
    expect(html).toContain("<td>Nederländerna</td>");
    expect(html).toContain("<td>Österrike</td>");
    expect(html).not.toContain("<td>Holland</td>");
    // Danmark står med, fordi 0,5 ‰ er det en svensk læser helst skal kende
    // til semesterresen.
    expect(html).toContain("<td>Danmark</td>");
  });

  test("den svenska side siger det ærlige om 2 øl: over svensk, under dansk", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    // 0,44 ‰ er over Sveriges 0,2 men under Danmarks 0,5. Skrives der
    // "under den svenska gränsen", får en svensk läsere besked om at han
    // må köra — det er den farligste fejl siden kan lave.
    expect(html).toContain("2 öl på 80 kg är 0,44 ‰");
    expect(html).toContain("över</strong> den svenska gränsen på 0,2 ‰");
    expect(html).toContain("under</strong> den");
    expect(html).not.toContain("under den svenska gränsen");
  });

  test("den svenska side har de svenska landnavne og ingen danske", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    // Samme fejlklasse som C168: et dansk landnavn i en svensk tabel er en
    // lækage, men den har intet dansk tegn, så scanneren kan ikke finde den.
    // Kun tre land hedder forskeligt — Danmark, Tyskland, Storbritannien,
    // Sverige, Norge, Polen, Italien, Frankrike og Spanien hedder det samme
    // på begge sprog, og det er korrekt.
    for (const dansk of ["Holland", "Østrig", "Grækenland"]) {
      expect(html).not.toContain(dansk);
    }
    // Og de danske ord fra den danske tabel må ikke finde vej til beraknare.se.
    for (const dansk of ["Ingen særregel", "nye og professionelle", "Udenlandet", "hæld"]) {
      expect(html).not.toContain(dansk);
    }
  });

  test("den svenska to-tals-sætning er svensk, ikke dansk", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    // C168 fandt denne på beraknare.se's server-renderede HTML: "før" (dansk
    // og norsk for *før*) og "end" (dansk for *än*) stod i den svenska gren af
    // en fælles template-literal. Begge har æ/ø? Nej — det er pointen: `før`
    // har ø, så scanneren fandt den, mens `end` ikke har noget dansk tegn og
    // derfor kræver denne lås. Kun `før` ville være fanget uden den.
    expect(html).toContain("före den är under 0 ‰");
    expect(html).toContain("kortare än");
    expect(html).not.toContain("før");
    expect(html).not.toContain("altid kortere end");
    expect(html).not.toContain("er derfor");
  });

  test("dansk sætningen er uændret af rettelsen", async () => {
    const html = renderToStaticMarkup(await PromillePage());

    // Den danske gren skal stadig sige "før den er under" og "kortere end" —
    // det er korrekt dansk. Låsen her er mod at rette den med den svenske.
    expect(html).toContain("før den er under 0 ‰");
    expect(html).toContain("kortere end");
  });
});
