import type { MetadataRoute } from "next";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import type { DomainConfig } from "@/lib/domain-config";
import { isCalculatorAvailable } from "@/lib/calculator-list";
import { getFooterBlogLinks } from "@/lib/footer-data";
import type { Locale } from "@/lib/i18n";
import { getAvailableSlugs } from "@/lib/page-data";
import { getDageTilHubPath, getDageTilPrefix, getDageTilSlugs } from "@/lib/dage-til";
import { getKlokkenHubPath, getKlokkenPrefix, getKlokkenSlugs } from "@/lib/klokken-i";
import { getDageMellemPath } from "@/lib/dage-mellem-datoer";
import { getUgedagPath } from "@/lib/ugedag";
import { getDageIAaretPath } from "@/lib/dage-i-aaret";
import { getTimerIAaretPath } from "@/lib/timer-i-aret";
import { getArbejdsdagePath } from "@/lib/arbejdsdage";
import { getUgerIAaretPath } from "@/lib/uger-i-aret";

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
  const dageTilHubPath = getDageTilHubPath(locale);
  const dageTilEntries: MetadataRoute.Sitemap = dageTilPrefix
    ? [
        // The section's own page, so the date pages are not an orphan set
        // reachable only from two other pages.
        {
          url: `${baseUrl}${dageTilHubPath}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
        ...getDageTilSlugs(locale).map((slug) => ({
          url: `${baseUrl}${dageTilPrefix}${slug}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.7,
        })),
      ]
    : [];

  const klokkenPrefix = getKlokkenPrefix(locale);
  const klokkenHubPath = getKlokkenHubPath(locale);
  const klokkenEntries: MetadataRoute.Sitemap = klokkenPrefix
    ? [
        // The section's own page, so the country pages are not an orphan set
        // reachable only from the blog.
        ...(klokkenHubPath
          ? [
              {
                url: `${baseUrl}${klokkenHubPath}`,
                lastModified: now,
                changeFrequency: "daily" as const,
                priority: 0.8,
              },
            ]
          : []),
        ...getKlokkenSlugs(locale === "se" ? "se" : "da").map((slug) => ({
          url: `${baseUrl}${klokkenPrefix}${slug}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.7,
        })),
      ]
    : [];

  // «Ugedag» ligger i hvert sprog på sin egen sti (`/ugedag` og `/veckodag`),
  // så den kan ikke komme fra `availableSlugs` — den lister danske slugs. Den
  // følger **ikke** dagens dato: værktøjet er forudindstillet med dagen, men
  // siden har ingen nedtælling, så ugentlig er nok.
  const ugedagPath = getUgedagPath(locale);
  const ugedagEntries: MetadataRoute.Sitemap = ugedagPath
    ? [
        {
          url: `${baseUrl}${ugedagPath}`,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        },
      ]
    : [];

  // «Dage mellem datoer» har sit eget eksempel på siden, og det følger dagens
  // dato, så den re-crawles dagligt lige som dage-til-siderne.
  const dageMellemPath = getDageMellemPath(locale);
  const dageMellemEntries: MetadataRoute.Sitemap = dageMellemPath
    ? [
        {
          url: `${baseUrl}${dageMellemPath}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
      ]
    : [];

  // «Hvor mange dage er der på et år» har både en tolv-måneders-tabel og et
  // «dage tilbage»-tal, og begge følger dagens dato, så siden re-crawles
  // dagligt lige som dage-til- og dage-mellem-siderne.
  const dageIAaretPath = getDageIAaretPath(locale);
  const dageIAaretEntries: MetadataRoute.Sitemap = dageIAaretPath
    ? [
        {
          url: `${baseUrl}${dageIAaretPath}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
      ]
    : [];

  // «Hvor mange timer er der på et år» har en periodetabel og et «timer
  // tilbage»-tal, og begge følger dagens dato, så siden re-crawles dagligt.
  const timerIAaretPath = getTimerIAaretPath(locale);
  const timerIAaretEntries: MetadataRoute.Sitemap = timerIAaretPath
    ? [
        {
          url: `${baseUrl}${timerIAaretPath}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
      ]
    : [];

  // «Hvor mange arbejdsdage er der på et år» har en tolv-måneders-tabel og et
  // «arbejdsdage tilbage»-tal, og begge følger dagens dato, så siden
  // re-crawles dagligt.
  const arbejdsdagePath = getArbejdsdagePath(locale);
  const arbejdsdageEntries: MetadataRoute.Sitemap = arbejdsdagePath
    ? [
        {
          url: `${baseUrl}${arbejdsdagePath}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
      ]
    : [];

  // «Hvor mange uger er der på et år» har en uge-tabel og et «uger tilbage»-tal,
  // og begge følger dagens dato, så siden re-crawles dagligt.
  const ugerIAaretPath = getUgerIAaretPath(locale);
  const ugerIAaretEntries: MetadataRoute.Sitemap = ugerIAaretPath
    ? [
        {
          url: `${baseUrl}${ugerIAaretPath}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        },
      ]
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
    ...dageMellemEntries,
    ...ugedagEntries,
    ...dageIAaretEntries,
    ...timerIAaretEntries,
    ...arbejdsdageEntries,
    ...ugerIAaretEntries,
    ...klokkenEntries,
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
    "bmi-voksen-saadan-tolk-er-du-tallet",
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
    "hvad-er-klokken-i-usa-naar-den-er-12-i-danmark",
  ];
}
