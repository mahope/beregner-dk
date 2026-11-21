import type { Locale } from "./i18n";

/**
 * Returns the locale to use for text content.
 * Norwegian (no) gets its own text where available, otherwise falls back to Danish.
 * This replaces the `locale === "se" ? "se" : "da"` pattern that incorrectly
 * mapped Norwegian to Danish.
 */
export function getTextLocale(locale: Locale): "da" | "se" | "no" {
  return locale;
}

/**
 * Returns the locale to use for functions that only support Danish and Swedish
 * (e.g., holiday calculations, dage-til functions). Norwegian falls back to Danish.
 */
export function getDaSeLocale(locale: Locale): "da" | "se" {
  return locale === "se" ? "se" : "da";
}

/**
 * Type for text that exists in all three locales.
 */
export type LocaleText = Record<Locale, string>;

/**
 * Get text for the current locale from a LocaleText record.
 * Falls back to Danish if the locale key is missing (should not happen for complete records).
 */
export function getLocaleText<T extends LocaleText>(texts: T, locale: Locale): string {
  return texts[locale] ?? texts.da;
}