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
