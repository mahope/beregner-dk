/**
 * Adtraction affiliate tracking links for MinBeregner.
 *
 * track format: https://track.adtraction.com/t/t?a=<programId>&as=<channelId>&t=2&tk=1&url=<deeplink>
 * channelId 2056156501 = the "Min Beregner" channel (partner mads@mahope.dk).
 *
 * A program only tracks/pays once APPROVED in Adtraction; a pending program's
 * track link does NOT redirect. So `adtractionLink` returns the tracking link
 * for approved programs and falls back to the plain merchant deeplink for
 * pending ones — the CTA still works (untracked) and upgrades to tracking
 * automatically once the programId is added to APPROVED_PROGRAMS.
 */
export const ADTRACTION_CHANNEL_MINBEREGNER = "2056156501";

/** Adtraction programIds confirmed APPROVED (pendingActive=true). Extend as approvals land. */
export const APPROVED_PROGRAMS = new Set<string>([
  "1666137874", // ASE (a-kasse)
  "1873805482", // Find Forsikring
  // pending — add when approved: Lendo 1562731450, Mybanker 1740042344,
  // Bank Norwegian 1888483286, Facit Bank 1820677672, CapitalBox 1808759797,
  // Det Faglige Hus 1873805030, Min A-kasse 1667704482, Unilån 1921874571,
  // Kreditnu 1873805943, Mybanker Boliglån 1504814320, L'EASY 1074819331
]);

export function isApproved(programId: string): boolean {
  return APPROVED_PROGRAMS.has(programId);
}

export function adtractionLink(
  programId: string,
  deeplink: string,
  channelId: string = ADTRACTION_CHANNEL_MINBEREGNER,
): string {
  if (!isApproved(programId)) return deeplink; // pending: navigate to merchant (untracked) instead of a dead track link
  return `https://track.adtraction.com/t/t?a=${programId}&as=${channelId}&t=2&tk=1&url=${encodeURIComponent(deeplink)}`;
}
