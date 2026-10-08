import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import {
  isUgerLocale,
  ugerAfsnit,
  ugerCopy,
  ugerFaq,
  ugerOversigt,
  ugerTal,
  UGER_I_ARET_PATH,
  type UgerLocale,
} from "@/lib/uger-i-aret";
import { getDageIAaretPath } from "@/lib/dage-i-aaret";
import { getTimerIAaretPath } from "@/lib/timer-i-aret";
import { getArbejdsdagePath } from "@/lib/arbejdsdage";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";

/**
 * Siden for «hvor mange uger er der på et år». Der er to route-filer over denne
 * komponent (`/uger-i-aret` og `/veckor-i-aret`), og det er *stien* der vælger
 * sproget — samme regel som `/dage-i-aaret`, `/timer-i-aret`, `/arbejdsdage`
 * og `/dage-til`. Et kald til den anden sprogs sti er routingens 301, så en
 * `notFound()` her betyder at de to ikke er enige, og det er den der holder en
 * svensk kopi af tabellen ude af det danske domænes indeks.
 */
async function sideLocale(prefix: string) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (!isUgerLocale(locale) || UGER_I_ARET_PATH[locale] !== prefix) {
    notFound();
  }
  return { locale: locale as UgerLocale };
}

export async function buildUgerIAaretMetadata(
  prefix: string,
  _today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale, locale } = domainConfig;
  if (!isUgerLocale(locale) || UGER_I_ARET_PATH[locale] !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const c = ugerCopy[locale];
  const canonical = `${baseUrl}${UGER_I_ARET_PATH[locale]}`;
  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale("da").baseUrl}${UGER_I_ARET_PATH.da}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale("se").baseUrl}${UGER_I_ARET_PATH.se}`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}${UGER_I_ARET_PATH.da}`,
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

export async function UgerIAaretRoute({ prefix }: { prefix: string }) {
  const { locale } = await sideLocale(prefix);
  const today = new Date();
  const c = ugerCopy[locale];
  const o = ugerOversigt(locale, today);
  const afsnit = ugerAfsnit(locale, today);
  const faq = ugerFaq(locale, today);
  const sti = UGER_I_ARET_PATH[locale];
  const da = locale === "da";
  const dageIAaretSti = getDageIAaretPath(locale);
  const timerSti = getTimerIAaretPath(locale);
  const arbejdsdageSti = getArbejdsdagePath(locale);
  const ugenummerSti = da ? "/ugenummer" : null;

  const t = (n: number) => ugerTal(n, locale);

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
            ? `${o.aar} har ${t(o.dage)} dage, som er ${t(o.uger)} uger og ${o.restDage} dag${o.restDage === 1 ? "" : "e"}.`
            : `${o.aar} har ${t(o.dage)} dagar, som är ${t(o.uger)} veckor och ${o.restDage} dag${o.restDage === 1 ? "" : "ar"}.`}
        </p>
        <p className="text-blue-800 dark:text-blue-200 mt-2">
          {da
            ? `Der er ${t(o.ugerTilbage)} uger og ${o.dageTilbageRest} dage tilbage af året efter i dag.`
            : `Det finns ${t(o.ugerTilbage)} veckor och ${o.dageTilbageRest} dagar kvar av året efter i dag.`}
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
                {c.kolonneUger}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.kolonneRest}
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
                  {t(raekke.dage)}
                </td>
                <td className="text-right py-2 px-3 tabular-nums">
                  {t(raekke.uger)}
                </td>
                <td className="text-right py-2 pl-3 tabular-nums">
                  {t(raekke.restDage)}
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
                {c.kolonneUger}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.kolonneRest}
              </th>
            </tr>
          </thead>
          <tbody>
            {o.maaneder.map(({ maaned, uger, restDage }) => (
              <tr
                key={maaned.month}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <th scope="row" className="text-left py-2 pr-3 font-normal">
                  {maaned.name}
                </th>
                <td className="text-right py-2 px-3 tabular-nums">
                  {t(maaned.dage)}
                </td>
                <td className="text-right py-2 px-3 tabular-nums">{t(uger)}</td>
                <td className="text-right py-2 pl-3 tabular-nums">
                  {t(restDage)}
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <th scope="row" className="text-left py-2 pr-3">
                {c.sum}
              </th>
              <td className="text-right py-2 px-3 tabular-nums">{t(o.dage)}</td>
              <td className="text-right py-2 px-3 tabular-nums">{t(o.uger)}</td>
              <td className="text-right py-2 pl-3 tabular-nums">
                {t(o.restDage)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {c.underMaaneder}
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
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.ferieKolonneArbejdsuger}
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
                <td className="text-right py-2 pl-3 tabular-nums">
                  {t(række.arbejdsuger)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {c.ferieUnderTabel}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none mb-8">
        {afsnit.map((s) => (
          <section key={s.overskrift}>
            <h2>{s.overskrift}</h2>
            <p>{s.brødtekst}</p>
          </section>
        ))}
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
        {arbejdsdageSti && (
          <Link
            href={arbejdsdageSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkArbejdsdage}
          </Link>
        )}
        {ugenummerSti && (
          <Link
            href={ugenummerSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkUgenummer}
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
