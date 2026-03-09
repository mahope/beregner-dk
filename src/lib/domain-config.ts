import type { Locale } from "./i18n";

export interface DomainConfig {
  locale: Locale;
  baseUrl: string;
  siteName: string;
  ogLocale: string;
  analyticsDataDomain: string;
  countryFlag: string;
  countryName: string;
  currency: string;
  hreflangCode: string;
}

const domainConfigs: Record<string, DomainConfig> = {
  // Production domains
  "minberegner.dk": {
    locale: "da",
    baseUrl: "https://minberegner.dk",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
    analyticsDataDomain: "minberegner.dk",
    countryFlag: "🇩🇰",
    countryName: "danskere",
    currency: "DKK",
    hreflangCode: "da",
  },
  "beregner.no": {
    locale: "no",
    baseUrl: "https://beregner.no",
    siteName: "Beregner.no",
    ogLocale: "nb_NO",
    analyticsDataDomain: "beregner.no",
    countryFlag: "🇳🇴",
    countryName: "nordmenn",
    currency: "NOK",
    hreflangCode: "nb",
  },
  "beraknare.se": {
    locale: "se",
    baseUrl: "https://beraknare.se",
    siteName: "Beräknare.se",
    ogLocale: "sv_SE",
    analyticsDataDomain: "beraknare.se",
    countryFlag: "🇸🇪",
    countryName: "svenskar",
    currency: "SEK",
    hreflangCode: "sv",
  },
  // Localhost fallback
  localhost: {
    locale: "da",
    baseUrl: "http://localhost:3000",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
    analyticsDataDomain: "minberegner.dk",
    countryFlag: "🇩🇰",
    countryName: "danskere",
    currency: "DKK",
    hreflangCode: "da",
  },
};

/**
 * Get domain config from hostname.
 * Falls back to Danish (minberegner.dk) if domain is unknown.
 */
export function getDomainConfig(hostname: string): DomainConfig {
  // Strip port number
  const domain = hostname.split(":")[0];
  return domainConfigs[domain] || domainConfigs["localhost"];
}

/**
 * Get all LIVE domain configs (for hreflang and footer cross-links).
 * Excludes localhost and domains not yet launched.
 */
const hiddenDomains = new Set(["localhost", "beregner.no"]);

export function getAllDomainConfigs(): DomainConfig[] {
  return Object.entries(domainConfigs)
    .filter(([key]) => !hiddenDomains.has(key))
    .map(([, config]) => config);
}

/**
 * Get the domain config for a specific locale.
 */
export function getDomainConfigByLocale(locale: Locale): DomainConfig {
  const entry = Object.values(domainConfigs).find(
    (c) => c.locale === locale
  );
  return entry || domainConfigs["localhost"];
}
