/**
 * Plausible Analytics Event Tracking
 * Self-hosted at analytics.holstjensen.eu
 */

// Event names as defined in backlog
export const ANALYTICS_EVENTS = {
  CALCULATION_DONE: 'beregning_udført',
  RESULT_COPIED: 'resultat_kopieret',
  AD_CLICKED: 'ad_clicked',
  SHARE_CLICKED: 'del_klikket',
} as const;

type PlausibleArgs = {
  props?: Record<string, string | number | boolean>;
  callback?: () => void;
};

declare global {
  interface Window {
    plausible?: (event: string, args?: PlausibleArgs) => void;
  }
}

/**
 * Track a custom event with Plausible
 * @param event - Event name
 * @param props - Optional event properties
 */
export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, { props });
  }
}

/**
 * Track a calculation completion
 * @param calculator - Name of the calculator (e.g., "bmi", "loen-efter-skat")
 */
export function trackCalculation(calculator: string): void {
  trackEvent(ANALYTICS_EVENTS.CALCULATION_DONE, { calculator });
}

/**
 * Track when a user copies a result
 * @param calculator - Name of the calculator
 */
export function trackResultCopied(calculator: string): void {
  trackEvent(ANALYTICS_EVENTS.RESULT_COPIED, { calculator });
}

/**
 * Track share button clicks
 * @param calculator - Name of the calculator
 * @param platform - Share platform (e.g., "facebook", "linkedin", "link")
 */
export function trackShare(calculator: string, platform: string): void {
  trackEvent(ANALYTICS_EVENTS.SHARE_CLICKED, { calculator, platform });
}
