import da from "../../locales/da/common.json";
import no from "../../locales/no/common.json";
import se from "../../locales/se/common.json";
import { getHomeCalculatorCount } from "./home-data";

export type Locale = "da" | "no" | "se";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translations: Record<Locale, any> = { da, no, se };

export function getTranslations(locale: Locale = "da") {
  return translations[locale] || translations.da;
}

/**
 * `getTranslations` with `{count}` resolved against the real calculator
 * catalog. `site.description` reaches every page's metadata, both JSON-LD
 * blocks and the web manifest, so a hardcoded count there silently goes stale
 * as calculators are added — it once claimed 33 while the Danish catalog held
 * 79. Same `{count}` pattern `getHomePageData` already uses, and the same
 * source of truth (`getHomeCalculatorCount`), so the two can never disagree.
 *
 * Every other key is passed through untouched, so callers can keep using this
 * as a drop-in for `getTranslations`.
 */
export function getSiteTranslations(locale: Locale = "da") {
  const trans = getTranslations(locale);
  const count = String(getHomeCalculatorCount(locale));
  return {
    ...trans,
    site: {
      ...trans.site,
      description: trans.site.description.replaceAll("{count}", count),
    },
  };
}

export function t(locale: Locale, path: string): string {
  const parts = path.split(".");
  let result: any = translations[locale] || translations.da;
  for (const part of parts) {
    result = result?.[part];
    if (result === undefined) return path;
  }
  return typeof result === "string" ? result : path;
}
