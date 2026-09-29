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
  FAQSchema: () => null,
}));

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

  test("de danske og svenske grænser er uændrede af udlandstabellen", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    // Udlandstabellen er dansk, fordi målingen kun var dansk. Den må derfor
    // ikke lække til beraknare.se, og den svenske side skal stadig svare med
    // Sveriges egen grænse.
    expect(html).not.toContain("Promillegrænsen i udlandet");
    expect(html).toContain("gränsen för rattfylleri vid <strong>0,2 ‰</strong>");
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
