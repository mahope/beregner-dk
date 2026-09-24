import type { Metadata } from "next";
import { getAllDomainConfigs, type DomainConfig } from "./domain-config";
import { getCurrentDomainConfig } from "./get-locale";
import type { Locale } from "./i18n";
import { getPageData } from "./page-data";

const alternateSlugs: Record<string, Partial<Record<Locale, string>>> = {
  "loen-efter-skat": { se: "lon-efter-skatt" },
  "lon-efter-skatt": { da: "loen-efter-skat" },
};

function getAlternateSlug(slug: string, locale: Locale): string {
  return alternateSlugs[slug]?.[locale] || slug;
}

export function buildPageMetadata(
  slug: string,
  domainConfig: DomainConfig
): Metadata {
  const pageData = getPageData(slug, domainConfig.locale);
  if (!pageData) {
    return { robots: { index: false, follow: false } };
  }

  const canonicalUrl = `${domainConfig.baseUrl}/${slug}`;
  const languages: Record<string, string> = {};

  for (const config of getAllDomainConfigs()) {
    const alternateSlug = getAlternateSlug(slug, config.locale);
    if (getPageData(alternateSlug, config.locale)) {
      languages[config.hreflangCode] = `${config.baseUrl}/${alternateSlug}`;
    }
  }

  if (languages.da) languages["x-default"] = languages.da;

  return {
    title: { absolute: pageData.metaTitle },
    description: pageData.metaDescription,
    keywords: pageData.keywords,
    openGraph: {
      title: pageData.ogTitle,
      description: pageData.ogDescription,
      url: canonicalUrl,
      type: "website",
      siteName: domainConfig.siteName,
      locale: domainConfig.ogLocale,
    },
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
  };
}

export async function generatePageMetadata(slug: string): Promise<Metadata> {
  return buildPageMetadata(slug, await getCurrentDomainConfig());
}
