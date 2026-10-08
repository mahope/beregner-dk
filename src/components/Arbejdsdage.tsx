import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import {
  ARBEJDSDAGE_PATH,
  arbejdsdageCopy,
  arbejdsdageFaq,
  arbejdsdageOversigt,
  getArbejdsdagePath,
  isArbejdsdageLocale,
  type ArbejdsdageLocale,
} from "@/lib/arbejdsdage";
import { getDageIAaretPath } from "@/lib/dage-i-aaret";
import { getTimerIAaretPath } from "@/lib/timer-i-aret";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";

/**
 * Siden for «hvor mange arbejdsdage er der på et år». Der er to route-filer
 * over denne komponent (`/arbejdsdage` og `/arbetsdagar`), og det er *stien*
 * der vælger sproget — samme regel som `/dage-i-aaret`, `/timer-i-aret` og
 * `/dage-til`. Et kald til den anden sprogs sti er routingens 301, så en
 * `notFound()` her betyder at de to ikke er enige, og det er den der holder en
 * svensk kopi af tabellen ude af det danske domænes indeks.
 */
async function sideLocale(prefix: string) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (!isArbejdsdageLocale(locale) || ARBEJDSDAGE_PATH[locale] !== prefix) {
    notFound();
  }
  return { locale: locale as ArbejdsdageLocale };
}

export async function buildArbejdsdageMetadata(
  prefix: string,
  today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale, locale } = domainConfig;
  if (!isArbejdsdageLocale(locale) || ARBEJDSDAGE_PATH[locale] !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const c = arbejdsdageCopy[locale];
  const canonical = `${baseUrl}${ARBEJDSDAGE_PATH[locale]}`;
  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale("da").baseUrl}${ARBEJDSDAGE_PATH.da}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale("se").baseUrl}${ARBEJDSDAGE_PATH.se}`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}${ARBEJDSDAGE_PATH.da}`,
  };

  return {
    title: { absolute: c.title },
    description: c.description,
    openGraph: {
      title: c.title,
      description: c.description,
      url: canonical,
      type: "website",
      siteName,
      locale: ogLocale,
      images: OG_IMAGE,
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
      images: OG_IMAGE,
    },
    alternates: { canonical, languages },
  };
}

export async function ArbejdsdageRoute({ prefix }: { prefix: string }) {
  const { locale } = await sideLocale(prefix);
  const today = new Date();
  const c = arbejdsdageCopy[locale];
  const o = arbejdsdageOversigt(locale, today);
  const faq = arbejdsdageFaq(locale, today);
  const sti = ARBEJDSDAGE_PATH[locale];
  const dageIAaretSti = getDageIAaretPath(locale);
  const timerSti = getTimerIAaretPath(locale);
  const da = locale === "da";

  return (
    <div>
      <FAQSchema items={faq} />
      <Breadcrumbs
        items={[
          {
            name: da ? "Hverdag" : "Vardag",
            href: `/kategori/${da ? "hverdag" : "praktisk"}`,
          },
          { name: c.h1, href: sti },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{c.h1}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{c.lead}</p>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8 not-prose">
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
          {c.eksempel}
        </p>
        <p className="text-lg text-blue-900 dark:text-blue-100">
          {da
            ? `${o.aar} har ${o.arbejdsdage} arbejdsdage.`
            : `${o.aar} har ${o.arbejdsdage} arbetsdagar.`}
        </p>
        <p className="text-blue-800 dark:text-blue-200 mt-2">
          {da
            ? `Der er ${o.arbejdsdageTilbage} arbejdsdage tilbage af året.`
            : `Det är ${o.arbejdsdageTilbage} arbetsdagar kvar av året.`}
        </p>
      </div>

      <div className="mb-8 not-prose overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-3">{c.tabelOverskrift}</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th scope="col" className="text-left py-2 pr-3 font-semibold">
                {c.kolonneMaaned}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {c.kolonneArbejdsdage}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {c.kolonneWeekend}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.kolonneHelligdage}
              </th>
            </tr>
          </thead>
          <tbody>
            {o.maaneder.map((maaned) => (
              <tr
                key={maaned.month}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <th scope="row" className="text-left py-2 pr-3 font-normal">
                  {maaned.name}
                </th>
                <td className="text-right py-2 px-3 tabular-nums">
                  {maaned.arbejdsdage}
                </td>
                <td className="text-right py-2 px-3 tabular-nums">
                  {maaned.weekenddage}
                </td>
                <td className="text-right py-2 pl-3 tabular-nums">
                  {maaned.helligdage}
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <th scope="row" className="text-left py-2 pr-3">
                {c.sum}
              </th>
              <td className="text-right py-2 px-3 tabular-nums">
                {o.arbejdsdage}
              </td>
              <td className="text-right py-2 px-3 tabular-nums">
                {o.weekenddage}
              </td>
              <td className="text-right py-2 pl-3 tabular-nums">
                {o.helligdage}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {c.underTabel}
        </p>
      </div>

      <div className="mb-8 not-prose overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-3">{c.ferieOverskrift}</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th scope="col" className="text-left py-2 pr-3 font-semibold">
                {c.ferieKolonneUger}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {c.ferieKolonneDage}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.ferieKolonneTilbage}
              </th>
            </tr>
          </thead>
          <tbody>
            {o.ferie.map((række) => (
              <tr
                key={række.uger}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <th scope="row" className="text-left py-2 pr-3 font-normal">
                  {række.uger} {da ? "uger" : "veckor"}
                </th>
                <td className="text-right py-2 px-3 tabular-nums">
                  {række.dage}
                </td>
                <td className="text-right py-2 pl-3 tabular-nums">
                  {række.arbejdsdage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {c.ferieUnderTabel}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {dageIAaretSti && (
          <Link
            href={dageIAaretSti}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            {c.linkDageIAaret}
          </Link>
        )}
        {timerSti && (
          <Link
            href={timerSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkTimer}
          </Link>
        )}
        <Link
          href="/dato"
          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
        >
          {c.linkDato}
        </Link>
      </div>

      <FAQ items={faq} />
    </div>
  );
}
