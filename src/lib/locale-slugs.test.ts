import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { buildSitemap } from "@/app/sitemap";
import { getCalculatorsByLocale, getPopularCalculators, isCalculatorAvailable } from "./calculator-list";
import { getDomainConfigByLocale } from "./domain-config";
import { getFooterCategories } from "./footer-data";
import { getHomeCalculators } from "./home-data";
import {
  LOCALE_SLUGS,
  SAMME_SLUG,
  internalPathAnyLocale,
  localizedPath,
  localizedSlug,
  type SlugLocale,
} from "./locale-slugs";
import { getNavigation } from "./navigation";
import { buildPageMetadata } from "./page-helpers";
import { getAvailableSlugs } from "./page-data";
import { getRouteDecision } from "./routing";

const LOCALES: SlugLocale[] = ["se", "no"];
const APP_DIR = join(process.cwd(), "src", "app");
const APP_FOLDERS = new Set(readdirSync(APP_DIR));
const DANSKE_SLUGS = new Set(getAvailableSlugs("da"));
const lastModified = new Date("2026-11-08T00:00:00.000Z");

/** Shared calculators a language serves under a Danish-named folder. */
function delteBeregnere(locale: SlugLocale): string[] {
  return getAvailableSlugs(locale).filter(
    (slug) => DANSKE_SLUGS.has(slug) && isCalculatorAvailable(`/${slug}`, locale),
  );
}

describe("sprogstier: tabellen er komplet og konsistent", () => {
  for (const locale of LOCALES) {
    test(`${locale}: hver delt beregner er omdøbt eller bevidst uændret`, () => {
      const afgjort = new Set([...Object.keys(LOCALE_SLUGS[locale]), ...SAMME_SLUG[locale]]);
      const uafgjort = delteBeregnere(locale).filter((slug) => !afgjort.has(slug));
      expect(uafgjort, `${locale}: slugs uden afgørelse`).toEqual([]);
    });

    test(`${locale}: ingen post er overflødig eller selvmodsigende`, () => {
      const serveret = new Set(delteBeregnere(locale));
      for (const [intern, offentlig] of Object.entries(LOCALE_SLUGS[locale])) {
        expect(serveret.has(intern), `${locale}: ${intern} er ikke en delt beregner`).toBe(true);
        expect(offentlig, `${intern} er sit eget slug`).not.toBe(intern);
        expect(offentlig, `${offentlig} er ikke et gyldigt slug`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      }
      for (const slug of SAMME_SLUG[locale]) {
        expect(serveret.has(slug), `${locale}: ${slug} i SAMME_SLUG serveres ikke`).toBe(true);
        expect(LOCALE_SLUGS[locale], `${slug} er både omdøbt og uændret`).not.toHaveProperty(slug);
      }
    });

    test(`${locale}: et offentligt slug rammer ingen mappe og ingen anden side`, () => {
      const værdier = Object.values(LOCALE_SLUGS[locale]);
      expect(new Set(værdier).size, "to sider deler et slug").toBe(værdier.length);
      for (const offentlig of værdier) {
        expect(APP_FOLDERS.has(offentlig), `${offentlig} er også en mappe`).toBe(false);
        expect(DANSKE_SLUGS.has(offentlig), `${offentlig} er også et dansk slug`).toBe(false);
        expect(getAvailableSlugs(locale), `${offentlig} er også en side`).not.toContain(offentlig);
      }
    });
  }

  test("samme offentlige slug betyder den samme side på tværs af sprog", () => {
    const set = new Map<string, string>();
    for (const locale of LOCALES) {
      for (const [intern, offentlig] of Object.entries(LOCALE_SLUGS[locale])) {
        const før = set.get(offentlig);
        expect(før === undefined || før === intern, `${offentlig} peger på to sider`).toBe(true);
        set.set(offentlig, intern);
      }
    }
  });

  test("svenske slugs er ikke dansk stavet", () => {
    for (const offentlig of Object.values(LOCALE_SLUGS.se)) {
      expect(offentlig, offentlig).not.toMatch(/ae|oe|aa|beregner|dage|uger|mellem|tilbage/);
    }
  });
});

describe("sprogstier: routing", () => {
  for (const locale of LOCALES) {
    const config = getDomainConfigByLocale(locale);
    test(`${locale}: det danske slug er en 301 og det egne er en rewrite`, () => {
      for (const [intern, offentlig] of Object.entries(LOCALE_SLUGS[locale])) {
        expect(getRouteDecision(config, `/${intern}`), `/${intern}`).toEqual({
          type: "redirect",
          destination: `/${offentlig}`,
          status: 301,
        });
        expect(getRouteDecision(config, `/${offentlig}`), `/${offentlig}`).toEqual({
          type: "rewrite",
          destination: `/${intern}`,
        });
      }
    });
  }

  test("et andet sprogs slug er en 404, ikke et dobbeltgænger-svar", () => {
    const da = getDomainConfigByLocale("da");
    const se = getDomainConfigByLocale("se");
    expect(getRouteDecision(da, "/datum").type).toBe("not-found");
    expect(getRouteDecision(se, "/lanekalkulator").type).toBe("not-found");
  });

  test("dansk er uændret", () => {
    const da = getDomainConfigByLocale("da");
    for (const slug of ["dato", "tidsberegner", "nedtaelling", "tidszone"]) {
      expect(getRouteDecision(da, `/${slug}`)).toEqual({ type: "allow" });
    }
  });

  test("localizedPath og internalPathAnyLocale er hinandens omvendte", () => {
    for (const locale of LOCALES) {
      for (const [intern, offentlig] of Object.entries(LOCALE_SLUGS[locale])) {
        expect(localizedPath(`/${intern}`, locale)).toBe(`/${offentlig}`);
        expect(internalPathAnyLocale(`/${offentlig}`)).toBe(`/${intern}`);
      }
    }
    expect(localizedPath("/dato?x=1", "se")).toBe("/datum?x=1");
    expect(localizedPath("/blog/dato", "se")).toBe("/blog/dato");
  });
});

describe("sprogstier: ingen danske slugs på de svenske sider", () => {
  const se = getDomainConfigByLocale("se");
  const danskeSomErOmdoebt = new Set(Object.keys(LOCALE_SLUGS.se));
  const førsteLed = (path: string) => path.split(/[?#]/)[0].split("/")[1] ?? "";

  test("sitemap: kun svenske slugs", () => {
    const urls = buildSitemap(se, lastModified).map((e) => String(e.url));
    for (const url of urls) {
      const led = førsteLed(url.replace(se.baseUrl, ""));
      expect(danskeSomErOmdoebt.has(led), `${url} er et dansk slug`).toBe(false);
    }
    for (const offentlig of ["datum", "tidskalkylator", "nedrakning", "tidszon", "alder"]) {
      expect(urls).toContain(`${se.baseUrl}/${offentlig}`);
    }
  });

  test("canonical og hreflang matcher sitemap for hver omdøbt side", () => {
    const urls = new Set(buildSitemap(se, lastModified).map((e) => String(e.url)));
    const da = getDomainConfigByLocale("da");
    for (const [intern, offentlig] of Object.entries(LOCALE_SLUGS.se)) {
      const meta = buildPageMetadata(intern, se);
      expect(meta.alternates?.canonical, intern).toBe(`${se.baseUrl}/${offentlig}`);
      expect(urls.has(`${se.baseUrl}/${offentlig}`), `${offentlig} mangler i sitemap`).toBe(true);
      const languages = meta.alternates?.languages as Record<string, string>;
      expect(languages.sv, intern).toBe(`${se.baseUrl}/${offentlig}`);
      expect(languages.da, intern).toBe(`${da.baseUrl}/${intern}`);
      // Den danske side peger på det svenske slug, ikke på det danske.
      const dansk = buildPageMetadata(intern, da).alternates?.languages as Record<string, string>;
      expect(dansk.sv, intern).toBe(`${se.baseUrl}/${offentlig}`);
    }
  });

  test("norsk canonical bruger det norske slug", () => {
    const no = getDomainConfigByLocale("no");
    for (const [intern, offentlig] of Object.entries(LOCALE_SLUGS.no)) {
      expect(buildPageMetadata(intern, no).alternates?.canonical, intern).toBe(
        `${no.baseUrl}/${offentlig}`,
      );
    }
  });

  test("navigation, footer, forside og kalkulatorlister linker kun til svenske slugs", () => {
    const hrefs = [
      ...getNavigation("se").flatMap((i) => [i.href, ...(i.children ?? []).map((c) => c.href)]),
      ...getFooterCategories("se").flatMap((c) => c.links.map((l) => l.href)),
      ...getHomeCalculators("se").map((c) => c.href),
      ...getCalculatorsByLocale("se").map((c) => c.href),
      ...getPopularCalculators("se").map((c) => c.href),
    ].filter((h): h is string => Boolean(h));
    expect(hrefs.length).toBeGreaterThan(100);
    const forkerte = hrefs.filter((h) => danskeSomErOmdoebt.has(førsteLed(h)));
    expect([...new Set(forkerte)]).toEqual([]);
  });

  test("den danske side er uberørt af tabellen", () => {
    expect(localizedSlug("dato", "da")).toBe("dato");
    expect(getCalculatorsByLocale("da").map((c) => c.href)).toContain("/dato");
  });
});
