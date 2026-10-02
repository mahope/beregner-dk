import type { DomainConfig } from "./domain-config";
import { isCalculatorAvailable, isCalculatorPath } from "./calculator-list";
import {
  getDageTilHubPath,
  getDageTilPrefix,
  getDageTilSlugFromPathname,
  isDageTilLocale,
  resolveDageTilSlug,
} from "./dage-til";

/** The section's own path in each language. Kept here, next to the rule. */
const DAGE_TIL_HUBS = ["/dage-til", "/dagar-till"] as const;

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
