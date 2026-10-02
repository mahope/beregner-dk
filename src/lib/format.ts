import type { Locale } from "./i18n";

const localeMap: Record<Locale, string> = {
  da: "da-DK",
  no: "nb-NO",
  se: "sv-SE",
};

const currencyMap: Record<Locale, string> = {
  da: "DKK",
  no: "NOK",
  se: "SEK",
};

/**
 * Format a number as currency (e.g. "1.000,00 kr." for DA, "1 000,00 kr" for SE).
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency: currencyMap[locale],
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(amount);
}

/**
 * Format a number with locale-aware thousand separators (no currency symbol).
 */
export function formatNumber(
  amount: number,
  locale: Locale,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  return new Intl.NumberFormat(localeMap[locale], {
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
  }).format(amount);
}

/**
 * Format a number as Swedish running text: thousands separated by a plain
 * space ("643 000"), decimals by a comma ("32,38").
 *
 * `formatNumber(tal, "se")` groups identically, but `Intl` writes the separator
 * as U+00A0. That renders the same and is the right character in a table cell,
 * but the Swedish prose quotes these figures inside sentences, where the copy
 * already uses a plain space — and an invisible character in source is a trap
 * for the next reader and for every string assertion.
 */
export function formatSvenskText(amount: number, decimals = 0): string {
  return formatNumber(amount, "se", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).replace(/\u00a0/g, " ");
}

/**
 * Get the Intl locale string (e.g. "da-DK", "sv-SE").
 */
export function getIntlLocale(locale: Locale): string {
  return localeMap[locale];
}

/**
 * Get the currency code (e.g. "DKK", "SEK").
 */
export function getCurrencyCode(locale: Locale): string {
  return currencyMap[locale];
}

/**
 * Get the currency suffix for input fields (e.g. "kr.", "kr").
 */
export function getCurrencySuffix(locale: Locale): string {
  return locale === "da" ? "kr." : "kr";
}
