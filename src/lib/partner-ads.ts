// Partner-ads links. A plain module (no "use client"), so both server and client components can call it: an export
// from a "use client" module is only a client reference on the server (Sentry MINBEREGNER-4).
//
// Only programs Mahope is approved for at Partner-ads (partnerid 42553). The sub-id (uid) per page and box is added
// by AffiliateBox via withSubid(). Never add links with a home-made ?ref= — they earn no commission.

const PARTNER_ADS_ID = "42553";

/** Partner-ads tracking link, optionally as a deeplink to a subpage at the advertiser. */
export function partnerAdsLink(bannerId: string, deeplink?: string): string {
  const base = `https://www.partner-ads.com/dk/klikbanner.php?partnerid=${PARTNER_ADS_ID}&bannerid=${bannerId}`;
  return deeplink ? `${base}&htmlurl=${encodeURIComponent(deeplink)}` : base;
}
