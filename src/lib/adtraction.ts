/**
 * Adtraction affiliate tracking links for MinBeregner.
 *
 * Format: https://track.adtraction.com/t/t?a=<programId>&as=<channelId>&t=2&tk=1&url=<deeplink>
 * channelId 2056156501 = the "Min Beregner" channel in the Adtraction account
 * (partner mads@mahope.dk). Each program must be APPROVED in Adtraction before
 * its link tracks/pays — pending programs return a non-redirecting page.
 */
export const ADTRACTION_CHANNEL_MINBEREGNER = "2056156501";

export function adtractionLink(
  programId: string,
  deeplink: string,
  channelId: string = ADTRACTION_CHANNEL_MINBEREGNER,
): string {
  return `https://track.adtraction.com/t/t?a=${programId}&as=${channelId}&t=2&tk=1&url=${encodeURIComponent(deeplink)}`;
}
