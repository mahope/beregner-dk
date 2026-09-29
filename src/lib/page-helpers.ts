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

/**
 * The social preview image. `src/app/opengraph-image.tsx` generates it at
 * `/opengraph-image`, but the file convention never reached the rendered
 * `<head>`: all 206 pages served zero `og:image` tags, so every link shared
 * from the site rendered without a preview. Naming it explicitly here (and in
 * the root layout) is what actually emits the tag, and it keeps the URL in one
 * place so the layout and the per-page metadata cannot drift apart.
 */
export const OG_IMAGE_URL = "/opengraph-image";

const ogImage = {
  url: OG_IMAGE_URL,
  width: 1200,
  height: 630,
  alt: "MinBeregner.dk / Beräknare.se",
};

/**
 * The same image, shaped as a spreadable value. A page that declares its own
 * `openGraph` replaces the layout's object wholesale, so every such page needs
 * to name the image itself — 33 of them were dropping it.
 */
export const OG_IMAGE = [ogImage];

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
      images: OG_IMAGE,
    },
    twitter: {
      card: "summary_large_image",
      title: pageData.ogTitle,
      description: pageData.ogDescription,
      images: OG_IMAGE,
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
