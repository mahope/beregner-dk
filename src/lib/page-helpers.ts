import type { Metadata } from "next";
import { getCurrentDomainConfig } from "./get-locale";
import { getPageData } from "./page-data";
import { getAllDomainConfigs } from "./domain-config";

/**
 * Generate locale-aware metadata for a calculator page.
 * Replaces the static `export const metadata` pattern.
 *
 * Usage in page.tsx:
 * ```ts
 * export async function generateMetadata() {
 *   return generatePageMetadata("bmi");
 * }
 * ```
 */
export async function generatePageMetadata(slug: string): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const data = getPageData(slug, domainConfig.locale);

  // Fallback to DA if no data for this locale
  const pageData = data || getPageData(slug, "da");
  if (!pageData) {
    return { title: slug };
  }

  const baseUrl = domainConfig.baseUrl;
  const allDomains = getAllDomainConfigs();

  // Build hreflang alternates
  const languages: Record<string, string> = {};
  for (const dc of allDomains) {
    const pd = getPageData(slug, dc.locale);
    if (pd) {
      languages[dc.hreflangCode] = `${dc.baseUrl}/${slug}`;
    }
  }

  return {
    title: pageData.metaTitle,
    description: pageData.metaDescription,
    keywords: pageData.keywords,
    openGraph: {
      title: pageData.ogTitle,
      description: pageData.ogDescription,
      url: `${baseUrl}/${slug}`,
      type: "website",
    },
    alternates: {
      canonical: `${baseUrl}/${slug}`,
      languages,
    },
  };
}
