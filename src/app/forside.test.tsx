/**
 * F4 (2026-09-30): forsiden som indgangspunkt.
 *
 * **Målingen der satte opgaven op.** Plausible 28 dage: `/` havde 218
 * besøgende, 38 % bounce og 465 indgangssider, mens selve beregnerne havde
 * 2-7 % bounce. beraknare.se's `/` havde 80 % bounce. Forsiden linkede altså
 * de mest brugte beregnere — men i et gitter med én kolonne på mobil, efter
 * helten, søgefeltet og tillidsrækken, med kort der er ca. 230 px høje. På en
 * telefon i 390 px bredde nåede man **ét** kort.
 *
 * **Hvorfor denne test renderer frem for at grepe kilden.** Rækkefølgen er hele
 * rettelsen: stripen skal ligge *før* tillidsrækken og *før* det fulde
 * populære gitter. Et grep i `page.tsx` kan ikke se, hvor de to ender i DOM'en,
 * og det er præcis det blind spot, der lod bounce-problemet ligge — kilden's
 * rækkefølge så rigtig ud, fordi den faktisk var rigtig, men tre skærmbilleder
 * ned. Markupken er den, browseren tegner.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getHomePageData, getHomeQuickLinks } from "@/lib/home-data";
import type { Locale } from "@/lib/i18n";
import HomePage from "./page";

vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null }));
vi.mock("@/components/SearchBar", () => ({ default: () => <div>Søgefelt</div> }));
vi.mock("@/components/HomeContent", () => ({ HomeContent: () => <div>Brødtekst</div> }));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/** Uddér kun den kompakte strips <nav>, som aria-label identificerer. */
function quickNav(html: string, locale: Locale): string {
  const label = getHomePageData(locale).sections.quick;
  const start = html.indexOf(`aria-label="${label}"`);
  expect(start, `forsiden har ingen nav med aria-label "${label}"`).toBeGreaterThan(-1);
  const end = html.indexOf("</nav>", start);
  expect(end, "strippen er ikke lukket").toBeGreaterThan(start);
  return html.slice(start, end);
}

describe("forsidens genvej til beregnerne", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("stripen ligger før tillidsrækken og før det fulde populære gitter", async () => {
    const html = renderToStaticMarkup(await HomePage());
    const data = getHomePageData("da");

    const stripen = html.indexOf(`aria-label="${data.sections.quick}"`);
    const tillidsRaekke = html.indexOf(data.trustSignals.calculators.split("|")[1]);
    const populæreGitter = html.indexOf(`>${data.sections.popular}<`);

    expect(stripen, "stripen findes ikke").toBeGreaterThan(-1);
    expect(stripen, "stripen kommer efter tillidsrækken").toBeLessThan(tillidsRaekke);
    expect(stripen, "stripen kommer efter populære gitter").toBeLessThan(populæreGitter);
  });

  test("alle otte mest brugte beregnere er links i stripen", async () => {
    const nav = quickNav(renderToStaticMarkup(await HomePage()), "da");
    for (const link of getHomeQuickLinks("da")) {
      expect(nav, `stripen mangler et link til ${link.href}`).toContain(`href="${link.href}"`);
      expect(nav, `stripen skal vise titlen på ${link.href}`).toContain(link.title);
    }
    // Otte links, ikke fjorten: tælles på <li>, så en ekstra markering et sted
    // ikke kan gøre testen grøn ved et tilfældighedstmatch.
    expect(nav.match(/<li>/g) ?? []).toHaveLength(getHomeQuickLinks("da").length);
  });

  test("stripen har en overskrift for skærmlæsere, men ikke en synlig dublet", async () => {
    const html = renderToStaticMarkup(await HomePage());
    const data = getHomePageData("da");
    // sr-only: skærmlæseren hører "Mest brugte beregnere", det synlige gitter
    // bærer sin egen "Populære beregnere". To ens h2 i træk er den fejl
    // dublet-overskrift-testen findes for.
    expect(html).toContain(`<h2 class="sr-only">${data.sections.quick}</h2>`);
    expect(data.sections.quick).not.toBe(data.sections.popular);
  });

  test("den svenske forside har stripen med svensk overskrift og svenske titler", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const nav = quickNav(renderToStaticMarkup(await HomePage()), "se");

    expect(nav, "svensk overskrift").not.toMatch(/[æø]/i);
    for (const link of getHomeQuickLinks("se")) {
      expect(nav, `svensk strib mangler ${link.href}`).toContain(`href="${link.href}"`);
    }
    // Danske titler på beraknare.se er den fejlklasse locale-leak.mjs scannerer
    // for; de svenske populære kort har hver sin svenske titel.
    expect(nav).not.toContain("Beregner");
  });
});
