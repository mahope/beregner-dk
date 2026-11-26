export const ADTRACTION_CHANNEL_MINBEREGNER = "2056156501";

/** Verified partner API links keyed by program ID. The a= value is the ad ID. */
export const TRACKING_URLS: Record<string, string> = {
  "1666137874": "https://on.ase.dk/t/t?a=1666137879&as=2056156501&t=2&tk=1",
  "1667704482": "https://go.min-a-kasse.dk/t/t?a=1667704485&as=2056156501&t=2&tk=1",
  "1873805482": "https://go.findforsikring.dk/t/t?a=1873805483&as=2056156501&t=2&tk=1",
};

export function adtractionLink(programId: string, deeplink: string): string {
  if (!Object.hasOwn(TRACKING_URLS, programId)) return deeplink;
  return `${TRACKING_URLS[programId]}&url=${encodeURIComponent(deeplink)}`;
}
