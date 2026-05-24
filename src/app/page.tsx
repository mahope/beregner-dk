import Link from "next/link";
import type { Metadata } from "next";
import { FAQSchema } from "@/components/StructuredData";
import SearchBar from "@/components/SearchBar";
import { getTrendingHrefs } from "@/lib/trending";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getAllDomainConfigs } from "@/lib/domain-config";
import { getHomePageData, getHomeCalculators } from "@/lib/home-data";
import { HomeContent } from "@/components/HomeContent";
import CountryFlag from "@/components/CountryFlag";

export async function generateMetadata(): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const data = getHomePageData(domainConfig.locale);
  const baseUrl = domainConfig.baseUrl;
  const allDomains = getAllDomainConfigs();

  const languages: Record<string, string> = {};
  for (const dc of allDomains) {
    languages[dc.hreflangCode] = dc.baseUrl;
  }

  return {
    title: data.meta.title,
    description: data.meta.description,
    keywords: data.meta.keywords,
    openGraph: {
      title: data.meta.ogTitle,
      description: data.meta.ogDescription,
      url: baseUrl,
      type: "website",
    },
    alternates: {
      canonical: baseUrl,
      languages,
    },
  };
}

export default async function Home() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const data = getHomePageData(locale);
  const beregnere = getHomeCalculators(locale);
  const trendingHrefs = getTrendingHrefs();

  const popularBeregnere = beregnere.filter((b) => b.popular);
  const oevrigeBeregnere = beregnere.filter((b) => !b.popular);

  const grouped = new Map<string, typeof beregnere>();
  for (const b of oevrigeBeregnere) {
    const list = grouped.get(b.category) || [];
    list.push(b);
    grouped.set(b.category, list);
  }

  const searchData = beregnere.map(({ title, description, href, icon, category }) => ({
    title,
    description,
    href,
    icon,
    category,
  }));

  // Parse trust signals (format: "value|label")
  const parseSignal = (s: string) => {
    const [value, label] = s.split("|");
    return { value, label };
  };
  const ts = {
    calculators: parseSignal(data.trustSignals.calculators),
    rates: parseSignal(data.trustSignals.rates),
    price: parseSignal(data.trustSignals.price),
    privacy: parseSignal(data.trustSignals.privacy),
  };

  return (
    <div>
      <FAQSchema items={data.faqItems} />

      {/* Hero */}
      <section className="-mx-4 px-4 pt-4 pb-12 mb-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {data.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            {data.hero.subtitle}
          </p>
          <SearchBar beregnere={searchData} />
        </div>
      </section>

      {/* Trust signals */}
      <section className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12 text-center">
        <div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{ts.calculators.value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{ts.calculators.label}</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{ts.rates.value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{ts.rates.label}</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{ts.price.value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{ts.price.label}</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{ts.privacy.value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{ts.privacy.label}</div>
        </div>
      </section>

      {/* Popular calculators */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">{data.sections.popular}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
          {popularBeregnere.map((beregner) => {
            const isTrending = trendingHrefs.includes(beregner.href);
            return (
              <Link
                key={beregner.href}
                href={beregner.href}
                className="group relative block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
              >
                {isTrending && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow">
                    Trending
                  </span>
                )}
                <div className="text-center">
                  <span className="text-5xl block mb-3">{beregner.icon}</span>
                  <span className="inline-block text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mb-2">
                    {beregner.category}
                  </span>
                  <h3 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:text-white transition-colors">
                    {beregner.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                    {beregner.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Categorized sections */}
      {data.categoryOrder.map(({ key, emoji }) => {
        const items = grouped.get(key);
        if (!items || items.length === 0) return null;
        return (
          <section key={key} className="mb-12">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {emoji} {key}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((beregner) => {
                const isTrending = trendingHrefs.includes(beregner.href);
                return (
                  <Link
                    key={beregner.href}
                    href={beregner.href}
                    className="group relative flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                  >
                    <span className="text-3xl flex-shrink-0">{beregner.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:text-white transition-colors truncate">
                        {beregner.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm truncate">
                        {beregner.description}
                      </p>
                    </div>
                    {isTrending && (
                      <span className="flex-shrink-0 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        Trending
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center dark:text-white">
          {data.sections.whyUse}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🆓</div>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">{data.sections.features.free.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{data.sections.features.free.description}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">{data.sections.features.private.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{data.sections.features.private.description}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4"><CountryFlag locale={domainConfig.locale} className="w-10 h-7 inline-block" /></div>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">{data.sections.features.local.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{data.sections.features.local.description}</p>
          </div>
        </div>
      </section>

      {/* SEO content - locale-specific */}
      <HomeContent locale={locale} siteName={domainConfig.siteName} />

      {/* FAQ */}
      <section className="prose dark:prose-invert max-w-none mb-16">
        <h2>{locale === "se" ? "Vanliga frågor" : "Ofte stillede spørgsmål"}</h2>
        {data.faqItems.map((item, index) => (
          <div key={index}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
