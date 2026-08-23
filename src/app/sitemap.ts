import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getDomainConfig } from "@/lib/domain-config";
import { getAvailableSlugs } from "@/lib/page-data";
import { getFooterBlogLinks } from "@/lib/footer-data";
import type { Locale } from "@/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const hostname = headersList.get("x-hostname") || "localhost";
  const domainConfig = getDomainConfig(hostname);
  const locale = domainConfig.locale;
  const baseUrl = domainConfig.baseUrl;
  const lastModified = new Date();

  // Calculator pages available for this locale
  const availableSlugs = getAvailableSlugs(locale);

  // Priority map for important pages
  const highPriority = new Set([
    "bmi", "moms", "procent", "valuta", "boliglaan", "laaneberegner",
    "renteberegner", "kalorier", "elberegner", "braendstof", "dato",
    "tidsberegner", "opsparing", "loen-efter-skat", "dagpenge",
    "pension", "boligstoette", "skattefradrag",
  ]);

  const dailyUpdates = new Set(["valuta"]);

  const calculatorEntries: MetadataRoute.Sitemap = availableSlugs.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified,
    changeFrequency: dailyUpdates.has(slug) ? "daily" : "monthly",
    priority: highPriority.has(slug) ? 0.9 : 0.8,
  }));

  // Category pages (only for DA which has all categories)
  const categoryEntries: MetadataRoute.Sitemap = locale === "da"
    ? [
        "oekonomi", "bolig", "laan", "sundhed", "familie",
        "uddannelse", "erhverv", "hverdag", "praktisk", "matematik",
      ].map((slug) => ({
        url: `${baseUrl}/kategori/${slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    : [];

  // Blog entries (only for DA which has blog content)
  const blogLinks = getFooterBlogLinks(locale);
  const blogEntries: MetadataRoute.Sitemap = blogLinks.length > 0
    ? [
        { url: `${baseUrl}/blog`, lastModified, changeFrequency: "weekly" as const, priority: 0.7 },
        ...getBlogSlugs(locale).map((slug) => ({
          url: `${baseUrl}/blog/${slug}`,
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })),
      ]
    : [];

  // Info pages
  const infoEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/om`, lastModified, changeFrequency: "yearly" as const, priority: 0.5 },
    { url: `${baseUrl}/privatlivspolitik`, lastModified, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/cookiepolitik`, lastModified, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...calculatorEntries,
    ...categoryEntries,
    ...blogEntries,
    ...infoEntries,
  ];
}

function getBlogSlugs(locale: Locale): string[] {
  if (locale !== "da") return [];
  return [
    "pension-hvor-meget-skal-du-spare-op",
    "boligstoette-2026-nye-regler",
    "bmi-for-boern-saadan-tjekker-du",
    "guide-feriepenge-hvornaar-og-hvor-meget",
    "saadan-beregner-du-din-reelle-timeloen",
    "hvordan-beregner-man-moms",
    "30-procent-reglen-husleje",
    "saadan-finder-du-din-timepris-som-freelancer",
    "guide-til-laan-og-renter",
    "spar-penge-paa-braendstof",
    "skat-2026-alt-du-skal-vide",
    "su-2026-satser-og-regler",
    "dagpenge-saadan-finder-du-din-sats",
    "boliglaan-2026-renter-og-afdrag",
    "fradrag-2026-komplet-guide",
    "barsel-2026-regler-og-satser",
    "arveafgift-regler-og-satser",
    "elpriser-2026-beregn-dit-forbrug",
    "privatoekonomi-for-unge",
    "koeb-af-bolig-2026-omkostninger",
    "biloekonomi-2026-hvad-koster-det-at-eje-bil",
    "leasing-af-bil-2026-pris-og-guide",
  ];
}
