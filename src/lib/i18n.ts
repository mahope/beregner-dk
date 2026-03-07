import da from "../../locales/da/common.json";
import no from "../../locales/no/common.json";
import se from "../../locales/se/common.json";

export type Locale = "da" | "no" | "se";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translations: Record<Locale, any> = { da, no, se };

export function getTranslations(locale: Locale = "da") {
  return translations[locale] || translations.da;
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

export const supportedLocales: Locale[] = ["da", "no", "se"];
export const defaultLocale: Locale = "da";
