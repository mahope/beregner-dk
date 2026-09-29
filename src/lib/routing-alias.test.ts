import { describe, expect, test } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { isCalculatorAvailable, isCalculatorPath } from "@/lib/calculator-list";
import { getAvailableSlugs } from "@/lib/page-data";
import { getRouteDecision, swedishAliases as ALIASES } from "@/lib/routing";
import { buildSitemap } from "@/app/sitemap";

const se = getDomainConfigByLocale("se");
const da = getDomainConfigByLocale("da");
const lastModified = new Date("2026-09-29T00:00:00.000Z");

/**
 * swedishAliases is the only thing between a Swedish spelling of a slug and a
 * 404. These tests read the map that routing.ts actually uses, so a new alias
 * is measured on the same properties instead of on one bug at a time.
 */
describe("Swedish slug aliases", () => {
  test("/enhudspris forwards to /enhedspris instead of 404", () => {
    // Google ranks beraknare.se/enhudspris on the first page, but the page has
    // only ever been served at the Danish slug, so every impression of it
    // landed on a 404 — 1.260 views a month with nowhere to go.
    expect(getRouteDecision(se, "/enhudspris")).toEqual({
      type: "redirect",
      destination: "/enhedspris",
      status: 301,
    });
  });

  test("every alias resolves to a calculator actually served on beraknare.se", () => {
    for (const [alias, target] of Object.entries(ALIASES)) {
      expect(isCalculatorPath(target), `${alias} -> ${target}`).toBe(true);
      expect(
        isCalculatorAvailable(target, se.locale),
        `${alias} -> ${target} is not served on beraknare.se`
      ).toBe(true);
    }
  });

  test("no alias shadows a real Swedish page", () => {
    const live = new Set(getAvailableSlugs(se.locale));
    for (const alias of Object.keys(ALIASES)) {
      expect(live.has(alias.slice(1)), `${alias} already exists as a page`).toBe(false);
    }
  });

  test("every alias is a 301, so the two spellings are not two pages", () => {
    for (const alias of Object.keys(ALIASES)) {
      expect(getRouteDecision(se, alias), alias).toEqual({
        type: "redirect",
        destination: ALIASES[alias],
        status: 301,
      });
    }
  });

  test("aliases stay out of the sitemap, so there is one canonical URL", () => {
    const urls = buildSitemap(se, lastModified).map((entry) => String(entry.url));
    for (const alias of Object.keys(ALIASES)) {
      expect(urls, alias).not.toContain(`${se.baseUrl}${alias}`);
    }
  });

  test("aliases are Swedish only — the Danish host is untouched", () => {
    // There is no measured Danish demand for /enhudspris, and the page copy
    // is Swedish. Locking this makes it a decision rather than an oversight
    // if someone later finds a Danish reason.
    expect(getRouteDecision(da, "/enhudspris")).toEqual({ type: "allow" });
  });
});
