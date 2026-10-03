import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import {
  getDageIAaretPath,
} from "@/lib/dage-i-aaret";
import { getDageMellemPath } from "@/lib/dage-mellem-datoer";
import { getDageTilHubPath } from "@/lib/dage-til";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";
import {
  isTimerLocale,
  periode,
  TIMER_I_ARET_PATH,
  timerAfsnit,
  timerCopy,
  timerFaq,
  timerMaaneder,
  timerOversigt,
  timerTal,
  type TimerLocale,
} from "@/lib/timer-i-aret";

/**
 * Siden for «hvor mange timer er der på et år». Der er to route-filer over denne
 * komponent (`/timer-i-aret` og `/timmar-i-aret`), og det er *stien* der vælger
 * sproget — samme regel som `/dage-til`, `/klokken-i`, `/dage-mellem-datoer` og
 * `/dage-i-aaret`. Et kald til den anden sprogs sti er routingens 301, så en
 * `notFound()` her betyder at de to ikke er enige, og det er den der holder en
 * svensk kopi af tabellen ude af det danske domænes indeks.
 */
async function sideLocale(prefix: string) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (!isTimerLocale(locale) || TIMER_I_ARET_PATH[locale] !== prefix) {
    notFound();
  }
  return { locale: locale as TimerLocale };
}

export async function buildTimerIAaretMetadata(
  prefix: string,
  _today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale, locale } = domainConfig;
  if (!isTimerLocale(locale) || TIMER_I_ARET_PATH[locale] !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const c = timerCopy[locale];
  const canonical = `${baseUrl}${TIMER_I_ARET_PATH[locale]}`;
  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale("da").baseUrl}${TIMER_I_ARET_PATH.da}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale("se").baseUrl}${TIMER_I_ARET_PATH.se}`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}${TIMER_I_ARET_PATH.da}`,
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

export async function TimerIAaretRoute({ prefix }: { prefix: string }) {
  const { locale } = await sideLocale(prefix);
  const today = new Date();
  const c = timerCopy[locale];
  const o = timerOversigt(locale, today);
  const maaneder = timerMaaneder(o);
  const afsnit = timerAfsnit(locale, today);
  const faq = timerFaq(locale, today);
  const sti = TIMER_I_ARET_PATH[locale];
  const dageTilSti = getDageTilHubPath(locale);
  const dageMellemSti = getDageMellemPath(locale);
  const dageIAaretSti = getDageIAaretPath(locale);
  const aarRække = periode(o, "aar");

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
            ? `${o.aar} har ${o.dage} dage, som er ${timerTal(o.timer, locale)} timer.`
            : `${o.aar} har ${o.dage} dagar, som är ${timerTal(o.timer, locale)} timmar.`}
        </p>
        <p className="text-blue-800 dark:text-blue-200 mt-2">
          {locale === "da"
            ? `Der er ${timerTal(o.timerTilbage, locale)} timer tilbage af året efter i dag.`
            : `Det finns ${timerTal(o.timerTilbage, locale)} timmar kvar av året efter i dag.`}
        </p>
      </div>

      <div className="mb-8 not-prose overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-3">{c.tabelOverskrift}</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th scope="col" className="text-left py-2 pr-3 font-semibold">
                {c.kolonnePeriode}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {c.kolonneDage}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {c.kolonneTimer}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.kolonneMinutter}
              </th>
            </tr>
          </thead>
          <tbody>
            {o.perioder.map((raekke) => (
              <tr
                key={raekke.id + raekke.navn}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <th scope="row" className="text-left py-2 pr-3 font-normal">
                  {raekke.navn}
                </th>
                <td className="text-right py-2 px-3 tabular-nums">
                  {timerTal(raekke.dage, locale)}
                </td>
                <td className="text-right py-2 px-3 tabular-nums">
                  {timerTal(raekke.timer, locale)}
                </td>
                <td className="text-right py-2 pl-3 tabular-nums">
                  {timerTal(raekke.minutter, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {c.underPerioder}
        </p>
      </div>

      <div className="mb-8 not-prose overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-3">{c.maanedOverskrift}</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th scope="col" className="text-left py-2 pr-3 font-semibold">
                {c.kolonnePeriode}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {c.kolonneDage}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {c.kolonneTimer}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.kolonneMinutter}
              </th>
            </tr>
          </thead>
          <tbody>
            {maaneder.map(({ maaned, timer, minutter }) => (
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
                  {timerTal(timer, locale)}
                </td>
                <td className="text-right py-2 pl-3 tabular-nums">
                  {timerTal(minutter, locale)}
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <th scope="row" className="text-left py-2 pr-3">
                {c.sum}
              </th>
              <td className="text-right py-2 px-3 tabular-nums">
                {aarRække.dage}
              </td>
              <td className="text-right py-2 px-3 tabular-nums">
                {timerTal(aarRække.timer, locale)}
              </td>
              <td className="text-right py-2 pl-3 tabular-nums">
                {timerTal(aarRække.minutter, locale)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {c.underMaaneder}
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
          href="/tidsberegner"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
        >
          {c.linkTidsberegner}
        </Link>
        <Link
          href="/dato"
          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
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
            {c.linkDageMellem}
          </Link>
        )}
      </div>

      <FAQ items={faq} />
    </div>
  );
}