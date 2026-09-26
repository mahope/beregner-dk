import type { MetadataRoute } from "next";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import type { DomainConfig } from "@/lib/domain-config";
import { isCalculatorAvailable } from "@/lib/calculator-list";
import { getFooterBlogLinks } from "@/lib/footer-data";
import type { Locale } from "@/lib/i18n";
import { getAvailableSlugs } from "@/lib/page-data";
import { getDageTilPrefix, getDageTilSlugs } from "@/lib/dage-til";

// The sitemap route is rendered per request (it resolves the host from
// headers), so a wall-clock default would stamp every URL with the moment
// Google fetches the file and make all 110+ unchanged pages look fresh on
// every crawl. `lastmod` is therefore only emitted for the pages that really
// do change without a new deploy: the daily group in `dailyUpdates` and the
// dage-til pages, whose answer is recomputed per request. Everything else
// omits `lastmod` rather than stating a freshness we cannot keep accurate.
export function buildSitemap(
  domainConfig: DomainConfig,
  now = new Date()
): MetadataRoute.Sitemap {
  const { locale, baseUrl } = domainConfig;
  const availableSlugs = getAvailableSlugs(locale).filter((slug) =>
    isCalculatorAvailable(`/${slug}`, locale)
  );
  const highPriority = new Set([
    "bmi", "moms", "procent", "valuta", "boliglaan", "laaneberegner",
    "renteberegner", "kalorier", "elberegner", "braendstof", "dato",
    "tidsberegner", "opsparing", "loen-efter-skat", "lon-efter-skatt",
    "bolan", "dagpenge", "pension", "boligstoette", "skattefradrag",
  ]);
  const dailyUpdates = new Set(["valuta"]);
  const calculatorEntries: MetadataRoute.Sitemap = availableSlugs.map((slug) => {
    const daily = dailyUpdates.has(slug);
    return {
      url: `${baseUrl}/${slug}`,
      ...(daily ? { lastModified: now } : {}),
      changeFrequency: daily ? ("daily" as const) : ("monthly" as const),
      priority: highPriority.has(slug) ? 0.9 : 0.8,
    };
  });
  const categoryEntries: MetadataRoute.Sitemap = locale === "da"
    ? [
        "oekonomi", "bolig", "laan", "sundhed", "familie",
        "uddannelse", "erhverv", "hverdag", "praktisk", "matematik",
      ].map((slug) => ({
        url: `${baseUrl}/kategori/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    : [];
  const blogLinks = getFooterBlogLinks(locale);
  const blogEntries: MetadataRoute.Sitemap = blogLinks.length > 0
    ? [
        { url: `${baseUrl}/blog`, changeFrequency: "weekly" as const, priority: 0.7 },
        ...getBlogSlugs(locale).map((slug) => ({
          url: `${baseUrl}/blog/${slug}`,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })),
      ]
    : [];
  const infoEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/om`, changeFrequency: "yearly" as const, priority: 0.5 },
    { url: `${baseUrl}/privatlivspolitik`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/cookiepolitik`, changeFrequency: "yearly" as const, priority: 0.3 },
  ];
  // Curated "hvor mange dage er der til X" pages. The answer changes every
  // day, so they are re-crawled daily.
  const dageTilPrefix = getDageTilPrefix(locale);
  const dageTilEntries: MetadataRoute.Sitemap = dageTilPrefix
    ? getDageTilSlugs(locale).map((slug) => ({
        url: `${baseUrl}${dageTilPrefix}${slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }))
    : [];

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...calculatorEntries,
    ...categoryEntries,
    ...blogEntries,
    ...dageTilEntries,
    ...infoEntries,
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(await getCurrentDomainConfig());
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
    "maanedsbudget-2026-komplet-guide",
    "boernepenge-2026-satser-og-regler",
    "boligsalg-2026-guide-til-omkostninger-og-provenu",
    "kvadratmeter-saadan-regner-du-ud",
  ];
}
