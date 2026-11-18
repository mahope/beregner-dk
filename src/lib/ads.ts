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
