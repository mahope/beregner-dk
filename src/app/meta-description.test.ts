/**
 * Hver `meta description` skal være under 160 tegn.
 *
 * Google afbryder description i snippet'en omkring de 160 tegn, så en længere
 * tekst taber den sidste sætning — den del, der plejer at give grunden til
 * klikket. 22 sider brød den regel i `page-data.ts` (C193), og da ingen test
 * dækkede resten af sitet holdt 24 sider stadig over den: forside, fem
 * blogindlæg og de sider, hvis description ligger i `page.tsx`.
 *
 * Testen kalder hver sides `generateMetadata()` — altså den tekst der rent
 * faktisk havner i `<head>` — i stedet for at læse kilden, så en description
 * der bygges af satser, tal eller skabeloner tælles med sin rigtige længde.
 */
import { describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getHomePageData } from "@/lib/home-data";
import { getAvailableSlugs, getPageData } from "@/lib/page-data";
import type { Locale } from "@/lib/i18n";

// Hosten afgør hvilken sprogudgave `generateMetadata()` bygger, så mocken kan
// skifte: den danske gennemgang kører med `da`, den svenske med `se`.
const host = vi.hoisted(() => ({ locale: "da" as Locale }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: async () => host.locale,
  getCurrentDomainConfig: async () => getDomainConfigByLocale(host.locale),
}));

const MAX_TEGN = 160;

/**
 * Sider der med vilje ikke har en description på den danske host: to svenske
 * alias-URL'er som middleware'en sender videre med 301, embed-siderne og
 * design-systemet med `noindex`, `/locale-unavailable` som kalder `notFound()`,
 * og `/dagar-till/*`, der er `noindex` på minberegner.dk og først får en egen
 * description på beraknare.se. Alt andet skal have en — ellers kan en ny side
 * springe reglen over ved at glemme den.
 */
const SIDER_UDEN_DESCRIPTION = new Set([
  "/bolan",
  "/lon-efter-skatt",
  "/embed/bmi",
  "/embed/moms",
  "/design-system",
  "/locale-unavailable",
  "/dagar-till",
  "/dagar-till/[dato]",
  "/klockan-i",
]);

/**
 * Én repræsentativ værdi pr. dynamisk segment. `land` dækker
 * `/klokken-i/[land]` og `/klockan-i/[land]`; uden den fik de to ruter et
 * `undefined` som slug, så porten meldte dem som sider uden description.
 */
function paramsFor(dato: string, slug: string) {
  return {
    params: Promise.resolve({ dato, slug, land: "usa" }),
    searchParams: Promise.resolve({}),
  };
}

// `import.meta.glob` frem for `readdirSync`: de dynamiske ruter hedder
// `[dato]` og `[slug]`, og kantede parenteser i et import-spektrum bliver læst
// som et glob-mønster, så filerne ville ikke blive fundet.
type SideModul = {
  metadata?: { description?: unknown };
  generateMetadata?: (props: {
    params: Promise<{ dato: string; slug: string; land: string }>;
    searchParams: Promise<Record<string, never>>;
  }) => Promise<{ description?: unknown }>;
};

// Vite's `import.meta.glob` type is a set of overloads that never take the
// module type as its single type argument, so the loader is typed here. Same
// shape as the transform itself: one lazy loader per matched path.
const PAGE_MODULER = (
  import.meta.glob as unknown as (
    pattern: string,
  ) => Record<string, () => Promise<SideModul>>
)("./**/page.tsx");

function ruteFor(nøgle: string): string {
  return `/${nøgle.replace(/^\.\//, "").replace(/page\.tsx$/, "").replace(/\/$/, "")}`;
}

describe("meta description under 160 tegn", () => {
  test("alle beregnersider i sitemapmen på begge domæner", () => {
    for (const locale of ["da", "se"] as const) {
      for (const slug of getAvailableSlugs(locale)) {
        const description = getPageData(slug, locale)?.metaDescription;
        expect(typeof description, `${locale}/${slug}`).toBe("string");
        expect((description as string).length, `${locale}/${slug}`).toBeLessThanOrEqual(
          MAX_TEGN
        );
      }
    }
  });

  test("forsiden på begge domæner", () => {
    for (const locale of ["da", "se"] as const) {
      const { meta } = getHomePageData(locale as Locale);
      expect(meta.description.length, locale).toBeLessThanOrEqual(MAX_TEGN);
    }
  });

  test("hver dansk side der har sin egen description", async () => {
    host.locale = "da";
    expect(await altFor("da")).toEqual({ mangler: [], lange: [] });
  }, 120000);

  test("de svenske dage-til-sider", async () => {
    host.locale = "se";
    for (const [rute, nøgle] of [
      ["/dagar-till/[dato]", "./dagar-till/[dato]/page.tsx"],
      ["/dage-til/[dato]", "./dage-til/[dato]/page.tsx"],
    ] as const) {
      const mod = await PAGE_MODULER[nøgle]();
      const raw = (await mod.generateMetadata?.(paramsFor("1-december", "oekonomi")))
        ?.description;
      if (rute === "/dagar-till/[dato]") {
        expect(typeof raw, rute).toBe("string");
        expect((raw as string).length, rute).toBeLessThanOrEqual(MAX_TEGN);
      } else {
        // Den danske udgave er `noindex` på beraknare.se, så den har hverken
        // description eller canonical der — den skal bare ikke have en tekst,
        // der ligner den svenske.
        expect(raw, rute).toBeUndefined();
      }
    }
  }, 30000);
});

/** Kør hele sitet gennem og saml de to fejlmuligheder. */
async function altFor(locale: Locale): Promise<{ mangler: string[]; lange: string[] }> {
  const forventetUden = new Set(SIDER_UDEN_DESCRIPTION);
  const lange: string[] = [];
  const mangler: string[] = [];

  for (const [nøgle, hent] of Object.entries(PAGE_MODULER)) {
    const rute = ruteFor(nøgle);
    const mod = await hent();
    const raw =
      mod.metadata?.description ??
      (await mod.generateMetadata?.(paramsFor("1-december", "oekonomi")))?.description;
    if (typeof raw !== "string") {
      if (!forventetUden.has(rute)) mangler.push(`${locale} ${rute}`);
      continue;
    }
    if (raw.length > MAX_TEGN) lange.push(`${locale} ${rute} (${raw.length})`);
  }

  return { mangler, lange };
}
