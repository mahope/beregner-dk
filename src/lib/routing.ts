import type { DomainConfig } from "./domain-config";
import { isCalculatorAvailable, isCalculatorPath } from "./calculator-list";
import {
  getDageTilHubPath,
  getDageTilPrefix,
  getDageTilSlugFromPathname,
  isDageTilLocale,
  resolveDageTilSlug,
} from "./dage-til";
import { getKlokkenHubPath } from "./klokken-i";
import { getDageMellemPath } from "./dage-mellem-datoer";

/** The section's own path in each language. Kept here, next to the rule. */
const DAGE_TIL_HUBS = ["/dage-til", "/dagar-till"] as const;

/** Same rule for the clock section: one list, two languages, one URL each. */
const KLOKKEN_HUBS = ["/klokken-i", "/klockan-i"] as const;

/**
 * «Dage mellem datoer» er to sider med samme værktøj, så den sti der ikke er
 * dette domænes, sender 301 videre — ellers ville minberegner.dk servere den
 * svenske tekst i dansk og beraknare.se den danske.
 */
const DAGE_MELLEM_SIDER = [
  "/dage-mellem-datoer",
  "/dagar-mellan-datum",
] as const;

export type RouteDecision =
  | { type: "allow" }
  | { type: "not-found" }
  | { type: "redirect"; destination: string; status: 301 | 308 };

export const swedishAliases: Record<string, string> = {
  "/loen-efter-skat": "/lon-efter-skatt",
  "/tidskalkylator": "/tidsberegner",
  "/datumkalkylator": "/dato",
  "/nedrakning": "/nedtaelling",
  "/leasingkalkylator": "/leasing",
  // Google indexes beraknare.se/enhudspris (the Swedish spelling) and ranks it
  // on the first page, but the page has only ever been served at the Danish
  // slug, so every one of those impressions landed on a 404.
  "/enhudspris": "/enhedspris",
};

const danishOnlySections = ["/blog", "/kategori"] as const;

function normalizePathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

function isInSection(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`);
}

export function getRouteDecision(
  domainConfig: DomainConfig | null,
  pathname: string
): RouteDecision {
  const normalizedPath = normalizePathname(pathname);
  const hasTrailingSlash = pathname !== "/" && normalizedPath !== pathname;

  if (!domainConfig || domainConfig.baseUrl.includes("localhost")) {
    return hasTrailingSlash
      ? { type: "redirect", destination: normalizedPath, status: 308 }
      : { type: "allow" };
  }

  if (domainConfig.locale === "se") {
    const alias = swedishAliases[normalizedPath];
    if (alias) return { type: "redirect", destination: alias, status: 301 };
  }

  // The section's own page. `/dage-til` and `/dagar-till` are the same list in
  // two languages, so the one that is not this domain's is redirected to the
  // one that is — the same rule the date pages below follow for their slugs.
  // Without it, minberegner.dk/dagar-till would serve a second copy of
  // /dage-til and beraknare.se/dage-til a second copy of /dagar-till.
  if (DAGE_TIL_HUBS.includes(normalizedPath as (typeof DAGE_TIL_HUBS)[number])) {
    const egenHub = getDageTilHubPath(domainConfig.locale);
    if (!egenHub) return { type: "not-found" };
    if (egenHub !== normalizedPath) {
      return { type: "redirect", destination: egenHub, status: 301 };
    }
  }

  // Same rule for the clock section: `/klokken-i` and `/klockan-i` are the
  // same list of countries in two languages, so the one that is not this
  // domain's is redirected to the one that is. Without it,
  // beraknare.se/klokken-i would serve a second copy of the list in Danish.
  if (
    KLOKKEN_HUBS.includes(normalizedPath as (typeof KLOKKEN_HUBS)[number])
  ) {
    const egenHub = getKlokkenHubPath(domainConfig.locale);
    if (!egenHub) return { type: "not-found" };
    if (egenHub !== normalizedPath) {
      return { type: "redirect", destination: egenHub, status: 301 };
    }
  }

  // Same rule for «dage mellem datoer»: the Danish and the Swedish page hold the
  // same calculator, so the path that is not this domain's is a 301. Without it
  // beraknare.se/dage-mellem-datoer would serve Danish text on a Swedish domain,
  // and the same answer would live at two URLs.
  if (
    DAGE_MELLEM_SIDER.includes(normalizedPath as (typeof DAGE_MELLEM_SIDER)[number])
  ) {
    const egenSti = getDageMellemPath(domainConfig.locale);
    if (!egenSti) return { type: "not-found" };
    if (egenSti !== normalizedPath) {
      return { type: "redirect", destination: egenSti, status: 301 };
    }
  }

  const dageTil = getDageTilSlugFromPathname(normalizedPath);
  if (dageTil) {
    // dage-til pages have one canonical slug per language. A slug in the other
    // language is redirected so the same answer never lives at two URLs.
    if (!isDageTilLocale(domainConfig.locale)) {
      return { type: "not-found" };
    }
    const resolved = resolveDageTilSlug(dageTil.slug, domainConfig.locale);
    if (!resolved) return { type: "not-found" };
    // The path prefix carries the language, so it — not the spelling of the
    // slug — decides which locale the request is in. A slug spelled the same
    // in both languages (`1-december`, `halloween`) resolves to "own locale"
    // on either domain, so testing the slug alone let the request fall
    // through and then 404 in the page component instead of redirecting.
    const ownPrefix = getDageTilPrefix(domainConfig.locale);
    if (!ownPrefix) return { type: "not-found" };
    if (dageTil.prefix !== ownPrefix || !resolved.isOwnLocale) {
      return {
        type: "redirect",
        // `ownPrefix` ends in a slash — the old hardcoded prefix did not, and
        // the extra separator showed up as "/dagar-till//juldagen".
        destination: `${ownPrefix}${resolved.localeSlug}`,
        status: 301,
      };
    }
  }

  if (
    (domainConfig.locale === "se" || domainConfig.locale === "no") &&
    danishOnlySections.some((section) => isInSection(normalizedPath, section))
  ) {
    return { type: "not-found" };
  }

  if (
    isCalculatorPath(normalizedPath) &&
    !isCalculatorAvailable(normalizedPath, domainConfig.locale)
  ) {
    return { type: "not-found" };
  }

  return hasTrailingSlash
    ? { type: "redirect", destination: normalizedPath, status: 308 }
    : { type: "allow" };
}
