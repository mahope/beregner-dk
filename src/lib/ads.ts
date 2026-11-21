import type { Locale } from "./i18n";

export const ADSENSE_CLIENT = "ca-pub-1902871361369866";
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

/**
 * AdSense verifies a site by finding the publisher script in <head>. Only
 * beraknare.se carries it on every page, regardless of NEXT_PUBLIC_ADSENSE_ENABLED;
 * the ad units themselves stay behind the flag and the consent banner.
 */
export function hasAdSenseVerificationScript(locale: Locale) {
  return locale === "se";
}

export const ADSENSE_PAGES: ReadonlySet<string> = new Set([
  "/dato",
  "/afstand-mellem-adresser",
  "/tidsberegner",
  "/kvadratmeter",
]);

export function isAdSenseEnabled() {
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED;
  return enabled === "1" || enabled === "true";
}

export function reloadAfterAdConsentWithdrawal() {
  window.location.reload();
}
