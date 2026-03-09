import Link from "next/link";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getTranslations } from "@/lib/i18n";
import { getFooterCategories, getFooterBlogLinks } from "@/lib/footer-data";
import { getAllDomainConfigs } from "@/lib/domain-config";
import { FooterAd } from "./ads/AdBanner";
import CountryFlag from "./CountryFlag";

export default async function Footer() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const t = getTranslations(locale);
  const categories = getFooterCategories(locale);
  const blogLinks = getFooterBlogLinks(locale);
  const allDomains = getAllDomainConfigs();
  const year = new Date().getFullYear();

  const totalCalcs = categories.reduce((sum, cat) => sum + cat.links.length, 0);

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 mt-auto border-t border-transparent dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 pb-10 border-b border-gray-800 text-sm">
          <span className="flex items-center gap-2">
            🧮 <strong className="text-white">{totalCalcs}</strong> {t.footer.freeCalculators}
          </span>
          <span className="flex items-center gap-2">
            📅 {t.footer.updatedRates.replace("{year}", String(year))}
          </span>
          <span className="flex items-center gap-2">
            🔒 <strong className="text-white">{t.footer.noLogin}</strong>
          </span>
          <span className="flex items-center gap-2">
            <CountryFlag locale={domainConfig.locale} /> {t.footer.madeFor}
          </span>
        </div>

        {/* All calculators by category */}
        <div className="mb-10 pb-10 border-b border-gray-800">
          <h3 className="text-white font-semibold mb-6">{t.footer.allCalculators}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-6 text-sm">
            {categories.map((cat) => (
              <div key={cat.name}>
                <h4 className="text-white font-medium mb-2">
                  {cat.emoji} {cat.name}
                </h4>
                <ul className="space-y-1.5">
                  {cat.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Blog + info + cross-links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-gray-800">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              {domainConfig.siteName}
            </h3>
            <p className="text-sm mb-4">{t.footer.aboutSite}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/om" className="hover:text-white transition-colors">
                  {t.footer.aboutLink}
                </Link>
              </li>
              <li>
                <Link
                  href="/privatlivspolitik"
                  className="hover:text-white transition-colors"
                >
                  {t.footer.privacyLink}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookiepolitik"
                  className="hover:text-white transition-colors"
                >
                  {t.footer.cookieLink}
                </Link>
              </li>
            </ul>
          </div>

          {blogLinks.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-4">
                {t.footer.latestArticles}
              </h4>
              <ul className="space-y-2 text-sm">
                {blogLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/blog"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {t.footer.seeAllArticles} &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-white font-semibold mb-4">
              {t.footer.otherTools}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://gratisfaktura.dk" className="hover:text-white transition-colors">
                  Faktura Generator
                </a>
              </li>
              <li>
                <a href="https://kodeord.dk" className="hover:text-white transition-colors">
                  Kodeord Generator
                </a>
              </li>
              <li>
                <a href="https://countdowntimer.dk" className="hover:text-white transition-colors">
                  Countdown Timer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* hreflang cross-links between domains */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
          {allDomains.map((dc) => (
            <a
              key={dc.locale}
              href={dc.baseUrl}
              className={`hover:text-white transition-colors ${
                dc.locale === locale ? "text-white font-medium" : ""
              }`}
            >
              <CountryFlag locale={dc.locale} /> {dc.siteName}
            </a>
          ))}
        </div>

        <div className="text-center text-sm">
          <p>{t.footer.copyright.replace("{year}", String(year))}</p>
        </div>

        <FooterAd />
      </div>
    </footer>
  );
}
