/**
 * Affiliate links for MinBeregner calculators.
 *
 * NOTE: Adtraction tracking links must be generated via Adtraction's own link
 * generator (the hand-built track.adtraction.com/t/t?a=… format with a guessed
 * id returns an "Invalid link" page). Until each program's verified tracking
 * URL is wired in here, `adtractionLink` returns the plain merchant deeplink so
 * the CTA always works (untracked but functional, never broken).
 *
 * To enable real tracking for a program: put its verified Adtraction tracking
 * URL (copied from the dashboard link generator) in TRACKING_URLS keyed by
 * programId.
 */
export const ADTRACTION_CHANNEL_MINBEREGNER = "2056156501";

/** programId -> verified Adtraction tracking URL (from the dashboard link generator). */
export const TRACKING_URLS: Record<string, string> = {
  // e.g. "1666137874": "https://track.adtraction.com/t/t?a=…&as=…&epi=…",
};

export function adtractionLink(programId: string, deeplink: string): string {
  return TRACKING_URLS[programId] ?? deeplink;
}
