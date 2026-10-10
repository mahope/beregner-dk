import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import {
  DAGE_I_MAANEDEN_PATH,
  dageIManedenAfsnit,
  dageIManedenCopy,
  dageIManedenFaq,
  getDageIManedenPath,
  isDageIManedenLocale,
  maanederOversigt,
  type DageIManedenLocale,
} from "@/lib/dage-i-maaneden";
import { getDageTilHubPath } from "@/lib/dage-til";
import { getDageMellemPath } from "@/lib/dage-mellem-datoer";
import { getDageIAaretPath } from "@/lib/dage-i-aaret";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";

async function sideLocale(prefix: string) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (!isDageIManedenLocale(locale) || DAGE_I_MAANEDEN_PATH[locale] !== prefix) {
    notFound();
  }
  return { locale: locale as DageIManedenLocale };
}

export async function buildDageIManedenMetadata(
  prefix: string,
  today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale, locale } = domainConfig;
  if (!isDageIManedenLocale(locale) || DAGE_I_MAANEDEN_PATH[locale] !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const c = dageIManedenCopy[locale];
  const canonical = `${baseUrl}${DAGE_I_MAANEDEN_PATH[locale]}`;
  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale("da").baseUrl}${DAGE_I_MAANEDEN_PATH.da}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale("se").baseUrl}${DAGE_I_MAANEDEN_PATH.se}`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}${DAGE_I_MAANEDEN_PATH.da}`,
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

export async function DageIManedenRoute({ prefix }: { prefix: string }) {
  const { locale } = await sideLocale(prefix);
  const today = new Date();
  const c = dageIManedenCopy[locale];
  const oversigt = maanederOversigt(locale, today);
  const afsnit = dageIManedenAfsnit(locale, today);
  const faq = dageIManedenFaq(locale, today);
  const sti = DAGE_I_MAANEDEN_PATH[locale];
  const dageTilSti = getDageTilHubPath(locale);
  const dageMellemSti = getDageMellemPath(locale);
  const dageIAaretSti = getDageIAaretPath(locale);
  const dm = oversigt.denneMaaned;

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
            ? `${dm.name} ${dm.year} har ${dm.dage} dage.`
            : `${dm.name} ${dm.year} har ${dm.dage} dagar.`}
        </p>
        <p className="text-blue-800 dark:text-blue-200 mt-2">
          {locale === "da"
            ? `Der er ${dm.dageTilbage} dage tilbage af måneden efter i dag.`
            : `Det finns ${dm.dageTilbage} dagar kvar av månaden efter i dag.`}
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
                className={`border-b border-gray-200 dark:border-gray-700${
                  maaned.month === dm.month ? " bg-gray-50 dark:bg-gray-800/50" : ""
                }`}
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
                {oversigt.aarDage}
              </td>
              <td className="text-right py-2 px-3 tabular-nums">
                {oversigt.maaneder.reduce((sum, m) => sum + m.arbejdsdage, 0)}
              </td>
              <td className="text-right py-2 pl-3 tabular-nums">
                {oversigt.maaneder.reduce((sum, m) => sum + m.weekenddage, 0)}
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
        {dageIAaretSti && (
          <Link
            href={dageIAaretSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkDageIAaret}
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
      </div>

      <FAQ items={faq} />
    </div>
  );
}
