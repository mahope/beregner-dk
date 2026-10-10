import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import {
  aarsoversigt,
  DAGE_I_AARET_PATH,
  dageIAaretAfsnit,
  dageIAaretCopy,
  dageIAaretFaq,
  getDageIAaretPath,
  isDageIAaretLocale,
  type DageIAaretLocale,
} from "@/lib/dage-i-aaret";
import { getDageTilHubPath } from "@/lib/dage-til";
import { getDageTilbagePath } from "@/lib/dage-tilbage-i-aaret";
import { getDageMellemPath } from "@/lib/dage-mellem-datoer";
import { getArbejdsdagePath } from "@/lib/arbejdsdage";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";

/**
 * Siden for «hvor mange dage er der på et år». Der er to route-filer over denne
 * komponent (`/dage-i-aaret` og `/dagar-i-aret`), og det er *stien* der vælger
 * sproget — samme regel som `/dage-til`, `/klokken-i` og
 * `/dage-mellem-datoer`. Et kald til den anden sprogs sti er routingens 301, så
 * en `notFound()` her betyder at de to ikke er enige, og det er den der holder
 * en svensk kopi af tabellen ude af det danske domænes indeks.
 */
async function sideLocale(prefix: string) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (!isDageIAaretLocale(locale) || DAGE_I_AARET_PATH[locale] !== prefix) {
    notFound();
  }
  return { locale: locale as DageIAaretLocale };
}

export async function buildDageIAaretMetadata(
  prefix: string,
  today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale, locale } = domainConfig;
  if (!isDageIAaretLocale(locale) || DAGE_I_AARET_PATH[locale] !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const c = dageIAaretCopy[locale];
  const canonical = `${baseUrl}${DAGE_I_AARET_PATH[locale]}`;
  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale("da").baseUrl}${DAGE_I_AARET_PATH.da}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale("se").baseUrl}${DAGE_I_AARET_PATH.se}`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}${DAGE_I_AARET_PATH.da}`,
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

export async function DageIAaretRoute({ prefix }: { prefix: string }) {
  const { locale } = await sideLocale(prefix);
  const today = new Date();
  const c = dageIAaretCopy[locale];
  const oversigt = aarsoversigt(locale, today);
  const afsnit = dageIAaretAfsnit(locale, today);
  const faq = dageIAaretFaq(locale, today);
  const sti = DAGE_I_AARET_PATH[locale];
  const dageTilbageSti = getDageTilbagePath(locale);
  const dageTilSti = getDageTilHubPath(locale);
  const dageMellemSti = getDageMellemPath(locale);
  const arbejdsdageSti = getArbejdsdagePath(locale);

  return (
    <div>
      <FAQSchema items={faq} />
      <Breadcrumbs
        items={[
          {
            name: locale === "da" ? "Hverdag" : "Vardag",
            href: `/kategori/${locale === "da" ? "hverdag" : "praktisk"}`,
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
          {locale === "da"
            ? `${oversigt.aar} har ${oversigt.dage} dage og ${oversigt.arbejdsdage} hverdage.`
            : `${oversigt.aar} har ${oversigt.dage} dagar och ${oversigt.arbejdsdage} vardagar.`}
        </p>
        <p className="text-blue-800 dark:text-blue-200 mt-2">
          {locale === "da"
            ? `Der er ${oversigt.tilbage} dage tilbage af året efter i dag.`
            : `Det finns ${oversigt.tilbage} dagar kvar av året efter i dag.`}
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
                {c.kolonneDage}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {c.kolonneHverdage}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.kolonneWeekend}
              </th>
            </tr>
          </thead>
          <tbody>
            {oversigt.maaneder.map((maaned) => (
              <tr
                key={maaned.month}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <th scope="row" className="text-left py-2 pr-3 font-normal">
                  {maaned.name}
                </th>
                <td className="text-right py-2 px-3 tabular-nums">
                  {maaned.dage}
                </td>
                <td className="text-right py-2 px-3 tabular-nums">
                  {maaned.arbejdsdage}
                </td>
                <td className="text-right py-2 pl-3 tabular-nums">
                  {maaned.weekenddage}
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <th scope="row" className="text-left py-2 pr-3">
                {c.sum}
              </th>
              <td className="text-right py-2 px-3 tabular-nums">
                {oversigt.dage}
              </td>
              <td className="text-right py-2 px-3 tabular-nums">
                {oversigt.arbejdsdage}
              </td>
              <td className="text-right py-2 pl-3 tabular-nums">
                {oversigt.weekenddage}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {c.underTabel}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none mb-8">
        {afsnit.map((afsnit) => (
          <section key={afsnit.overskrift}>
            <h2>{afsnit.overskrift}</h2>
            <p>{afsnit.brødtekst}</p>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/dato"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
        >
          {c.linkDato}
        </Link>
        {dageTilbageSti && (
          <Link
            href={dageTilbageSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkDageTilbage}
          </Link>
        )}
        {locale === "da" && (
          <Link
            href="/ugenummer"
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkUgenummer}
          </Link>
        )}
        {dageTilSti && (
          <Link
            href={dageTilSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkDageTil}
          </Link>
        )}
        {dageMellemSti && (
          <Link
            href={dageMellemSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkMellem}
          </Link>
        )}
        {arbejdsdageSti && (
          <Link
            href={arbejdsdageSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkArbejdsdage}
          </Link>
        )}
      </div>

      <FAQ items={faq} />
    </div>
  );
}
