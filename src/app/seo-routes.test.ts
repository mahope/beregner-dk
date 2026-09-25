import { describe, expect, test } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getAvailableSlugs } from "@/lib/page-data";
import { buildRobots } from "./robots";
import { buildSitemap } from "./sitemap";

const lastModified = new Date("2026-09-24T00:00:00.000Z");

describe("host-aware sitemap", () => {
  test("uses only Danish calculator and section URLs on the Danish host", () => {
    const sitemap = buildSitemap(getDomainConfigByLocale("da"), lastModified);
    const urls = sitemap.map((entry) => String(entry.url));

    expect(urls).toContain("https://minberegner.dk/loen-efter-skat");
    expect(urls).not.toContain("https://minberegner.dk/lon-efter-skatt");
    expect(urls.some((url) => url.includes("/kategori/"))).toBe(true);
    expect(urls.some((url) => url.includes("/blog/"))).toBe(true);
  });

  test("uses only Swedish calculator URLs on the Swedish host", () => {
    const sitemap = buildSitemap(getDomainConfigByLocale("se"), lastModified);
    const urls = sitemap.map((entry) => String(entry.url));

    for (const slug of ["tidsberegner", "dato", "nedtaelling", "leasing", "lon-efter-skatt", "bolan"]) {
      expect(urls, slug).toContain(`https://beraknare.se/${slug}`);
    }
    for (const slug of ["su", "loen-efter-skat", "ugenummer", "flyttebudget"]) {
      expect(urls, slug).not.toContain(`https://beraknare.se/${slug}`);
    }
    expect(urls.some((url) => url.includes("/kategori/"))).toBe(false);
    expect(urls.some((url) => url.includes("/blog"))).toBe(false);
    expect(urls).not.toContain("https://beraknare.se/tidskalkylator");
  });

  test("includes every available live-domain calculator exactly once", () => {
    for (const locale of ["da", "se"] as const) {
      const config = getDomainConfigByLocale(locale);
      const urls = buildSitemap(config, lastModified).map((entry) => String(entry.url));
      for (const slug of getAvailableSlugs(locale)) {
        const matches = urls.filter((url) => url === `${config.baseUrl}/${slug}`);
        expect(matches, `${locale}/${slug}`).toHaveLength(1);
      }
    }
  });

  test("keeps one canonical host for every entry", () => {
    for (const locale of ["da", "se"] as const) {
      const config = getDomainConfigByLocale(locale);
      const urls = buildSitemap(config, lastModified).map((entry) => String(entry.url));
      expect(urls.every((url) => url.startsWith(config.baseUrl))).toBe(true);
      expect(new Set(urls).size).toBe(urls.length);
    }
  });
});

describe("sitemap lastmod hygiene", () => {
  test("omits lastmod for pages that only change on deploy", () => {
    for (const locale of ["da", "se"] as const) {
      const sitemap = buildSitemap(getDomainConfigByLocale(locale), lastModified);
      const stable = sitemap.filter((entry) => entry.changeFrequency !== "daily");
      expect(stable.length, locale).toBeGreaterThan(50);
      for (const entry of stable) {
        expect(entry.lastModified, String(entry.url)).toBeUndefined();
      }
    }
  });

  test("keeps lastmod for the pages that really change every day", () => {
    for (const locale of ["da", "se"] as const) {
      const sitemap = buildSitemap(getDomainConfigByLocale(locale), lastModified);
      const daily = sitemap.filter((entry) => entry.changeFrequency === "daily");
      expect(daily.length, locale).toBeGreaterThan(0);
      for (const entry of daily) {
        expect(entry.lastModified, String(entry.url)).toEqual(lastModified);
      }
      expect(daily.map((entry) => String(entry.url))).toContain(
        `${getDomainConfigByLocale(locale).baseUrl}/valuta`
      );
    }
  });

  test("stable entries are identical no matter when the sitemap is fetched", () => {
    // The route resolves the host from headers, so it is rendered per request.
    // Two fetches minutes apart must not claim the site changed in between.
    for (const locale of ["da", "se"] as const) {
      const config = getDomainConfigByLocale(locale);
      const early = buildSitemap(config, new Date("2026-09-24T00:00:00.000Z"));
      const late = buildSitemap(config, new Date("2026-09-26T03:00:00.000Z"));
      const strip = (entries: ReturnType<typeof buildSitemap>) =>
        JSON.stringify(
          entries.filter((entry) => entry.changeFrequency !== "daily")
        );
      expect(strip(late), locale).toBe(strip(early));
    }
  });
});

describe("host-aware robots", () => {
  test("points each live host to its own sitemap", () => {
    expect(buildRobots(getDomainConfigByLocale("da")).sitemap).toBe(
      "https://minberegner.dk/sitemap.xml"
    );
    expect(buildRobots(getDomainConfigByLocale("se")).sitemap).toBe(
      "https://beraknare.se/sitemap.xml"
    );
  });
});
