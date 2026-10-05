/**
 * F4 (2026-09-30): forsiden som genvej til beregnerne — og dens retteelse
 * 1/10, efter en review fandt at genvejen *kopierede* listen.
 *
 * **Målingen der satte opgaven op.** Plausible 28 dage: `/` havde 218
 * besøgende, 38 % bounce og 465 indgangssider, mens selve beregnerne havde
 * 2-7 % bounce. beraknare.se's `/` havde 80 % bounce. Forsiden linkede altså
 * de mest brugte beregnere — men i et gitter med én kolonne på mobil, efter
 * helten, søgefeltet og tillidsrækken, med kort der er ca. 230 px høje. På en
 * telefon i 390 px bredde nåede man **ét** kort.
 *
 * **Hvad der så skete, og hvorfor porten så ud som den gjorde.** F4 lagde en
 * kompakt stribe med de otte mest brugte *ovenfor* tillidsrækken og lod
 * gitteret blive stående lige under den. Review fandt at de otte links var de
 * samme som gitterets — målt: `se` 6 populære / 6 i striben og hrefs
 * identiske, `da` 14 populære og striben er de første 8, så **otte af fjorten
 * optrådte to gange på samme skærm**. De to gamle tests holdt alligevel, fordi
 * de krævede *rækkefølgen* (striben før tillidsrækken) og *antallet* (otte
 * links) — ingen af dem kunne se, at de otte var de samme.
 *
 * **Rettelsen.** Én liste, ét sted: striben er væk, og populærgitteret med
 * kort, beskrivelser og kategori ligger nu direkte under helten. Porten her er
 * derfor skrevet om til at tælle *hvor mange gange* hver populær beregner
 * linkes i forsidens egne lister, i alle tre sprog — den fejl, de to gamle
 * tests ikke kunne se.
 *
 * Hvorfor den renderer frem for at grepe kilden: rækkefølgen og dubletten er
 * hele rettelsen, og en grep i `page.tsx` kan ikke se, hvor de to lister ender
 * i DOM'en — det er præcis det blind spot, der lod bounce-problemet ligge.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getHomeCalculators, getHomePageData } from "@/lib/home-data";
import { getTrendingHrefs } from "@/lib/trending";
import type { Locale } from "@/lib/i18n";
import HomePage from "./page";

vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null }));
vi.mock("@/components/SearchBar", () => ({ default: () => <div>Søgefelt</div> }));
vi.mock("@/components/HomeContent", () => ({ HomeContent: () => <div>Brødtekst</div> }));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/**
 * Forsidens egne lister: helten, populærgitteret, tillidsrækken,
 * nedtællingskortene og kategorierne — altså alt hvad *siden* linker med sit
 * eget gitter, og intet af `HomeContent`s brødtekst, der med vilje omtaler
 * `/procent` og `/moms` igen.
 */
function forsideLister(html: string, locale: Locale): string {
  const data = getHomePageData(locale);
  const start = html.indexOf("</section>");
  const end = html.indexOf(`>${data.sections.whyUse}<`);
  expect(start, "forsiden har ingen helt").toBeGreaterThan(-1);
  expect(end, "forsiden har ingen feature-sektion").toBeGreaterThan(start);
  return html.slice(start, end);
}

/** Hvor mange gange `href` optræder som link i markupken. */
function linkForekomster(html: string, href: string): number {
  return html.split(`href="${href}"`).length - 1;
}

describe("forsidens genvej til beregnerne", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("populærgitteret ligger direkte under helten, før tillidsrækken", async () => {
    const html = renderToStaticMarkup(await HomePage());
    const data = getHomePageData("da");

    const gitter = html.indexOf(`>${data.sections.popular}<`);
    const tillidsRaekke = html.indexOf(data.trustSignals.calculators.split("|")[1]);

    expect(gitter, "populærgitteret findes ikke").toBeGreaterThan(-1);
    expect(tillidsRaekke, "tillidsrækken findes ikke").toBeGreaterThan(-1);
    // F4's pointe: en telefon skal nå beregnerne på første skærm, ikke tre
    // skærme ned. Rækkefølgen i markupken er den, browseren tegner.
    expect(gitter, "populærgitteret kommer efter tillidsrækken").toBeLessThan(tillidsRaekke);
  });

  test("hver populær beregner linkes præcis én gang i forsidens lister", async () => {
    for (const locale of ["da", "se", "no"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const lister = forsideLister(renderToStaticMarkup(await HomePage()), locale);

      const popular = getHomeCalculators(locale).filter((c) => c.popular);
      expect(popular.length, `${locale} popular count`).toBeGreaterThan(3);
      for (const beregner of popular) {
        expect(
          linkForekomster(lister, beregner.href),
          `${locale}: ${beregner.href} er linket mere end én gang i forsidens lister`
        ).toBe(1);
      }
    }
  });

  test("tællingen kan se en dublet", () => {
    // Uden dette kunne porten være grøn, fordi den tæller forkert. Den fejl den
    // her låser opstod som otte ens links i to lister — to forekomster, én
    // beregner.
    const toLister = `<a href="/dato">Dato</a><a href="/dato">Dato igen</a>`;
    expect(linkForekomster(toLister, "/dato")).toBe(2);
    expect(linkForekomster(toLister, "/bmi")).toBe(0);
  });

  test("alle populære beregnere er stadig kort med titel og beskrivelse", async () => {
    const html = renderToStaticMarkup(await HomePage());
    for (const beregner of getHomeCalculators("da").filter((c) => c.popular)) {
      expect(html, `forsiden mangler et kort til ${beregner.href}`).toContain(`href="${beregner.href}"`);
      expect(html, `kortet til ${beregner.href} mangler titlen`).toContain(beregner.title);
    }
  });

  test("sæsonbadgen står på forsidens eget sprog, aldrig på engelsk", async () => {
    // Badgen er en påstand til læseren om at netop denne beregner er aktuel
    // lige nu. Den lå som et engelsk `Trending` i `page.tsx`, altså uden for
    // den øvrige tekst, så den fulgte ikke `locale`: danske læsere så
    // «Trending», og de svenske ligeså. Målt 5/10 i live-HTML: 6 forekomster
    // på minberegner.dk/forsiden (3 badger, hver et par gange — populærkortet
    // og kategorirækken kan ramme samme href).
    for (const locale of ["da", "se", "no"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const html = renderToStaticMarkup(await HomePage());
      const data = getHomePageData(locale);

      expect(html, `${locale}: sæsonbadgen mangler i markupken`).toContain(
        `>${data.sections.trending}<`
      );
      // Badgen skal kunne ses, ellers dømmer porten en label der aldrig males.
      const synlige = html.split(`>${data.sections.trending}<`).length - 1;
      expect(synlige, `${locale}: sæsonbadgen males ikke`).toBeGreaterThan(0);
      expect(html, `${locale}: engelsk "Trending" står stadig på forsiden`).not.toContain(
        ">Trending<"
      );
    }
  });

  test("sæsonmærkets href er dem badgen faktisk sidder på", async () => {
    // `getTrendingHrefs()` er en måneds-tabel, så porten ovenfor ville være grøn
    // fordi en badge med et andet ord renderer et andet sted. Denne dømmer, at
    // badgen hænger på præcis de hrefs tabellen leverer — og at ingen anden
    // beregner er badget. Begge tal læses fra den målte trafik-tabel.
    for (const locale of ["da", "se"] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
      const html = renderToStaticMarkup(await HomePage());
      const data = getHomePageData(locale);
      const badgede = getTrendingHrefs(new Date(), locale).filter((href) => html.includes(`href="${href}"`));
      const synlige = html.split(`>${data.sections.trending}<`).length - 1;

      expect(synlige, `${locale}: antal badges på forsiden`).toBe(badgede.length);
      // Badgen ligger *inde i* sit link, så porten læser linkene og spørger om
      // hvilke der bærer den — ikke om teksten står et sted på siden. Det er
      // den forskel, der skelner «badgen sidder på /opsparing» fra «ordet
      // står et sted tæt på /opsparsing».
      const linkMedBadge = new Set(
        html
          .split("<a ")
          .filter((link) => link.includes(`>${data.sections.trending}<`))
          .map((link) => link.match(/href="(\/[^"]+)"/)?.[1])
          .filter((href): href is string => Boolean(href))
      );

      expect([...linkMedBadge].sort(), `${locale}: hvilke links der bærer badgen`).toEqual(
        getTrendingHrefs(new Date(), locale).filter((href) => html.includes(`href="${href}"`)).sort()
      );
    }
  });

  test("den svenske forside har svenske populære kort", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await HomePage());
    const popular = getHomeCalculators("se").filter((c) => c.popular);
    expect(popular.length).toBeGreaterThan(3);
    for (const beregner of popular) {
      expect(html, `svensk forside mangler ${beregner.href}`).toContain(`href="${beregner.href}"`);
      expect(beregner.title, `svensk titel på ${beregner.href}`).not.toMatch(/[æø]/i);
    }
  });
});
