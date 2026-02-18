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

/**
 * Track affiliate link clicks
 * @param calculator - Name of the calculator
 * @param destination - Affiliate destination URL or name
 */
export function trackAffiliateClick(calculator: string, destination: string): void {
  trackEvent(ANALYTICS_EVENTS.AD_CLICKED, { calculator, destination });
}

/**
 * Initialize scroll-depth tracking for a page.
 * Tracks when user scrolls past 25%, 50%, 75%, and 100%.
 * Call once per page mount.
 */
export function initScrollDepthTracking(pageName: string): () => void {
  if (typeof window === 'undefined') return () => {};

  const thresholds = [25, 50, 75, 100];
  const tracked = new Set<number>();

  const handler = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((scrollTop / docHeight) * 100);

    for (const t of thresholds) {
      if (pct >= t && !tracked.has(t)) {
        tracked.add(t);
        trackEvent('scroll_depth', { page: pageName, depth: t });
      }
    }
  };

  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}
