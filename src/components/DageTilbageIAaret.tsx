import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import {
  aaretTilbage,
  DAGE_TILBAGE_PATH,
  dageTilbageIAaretAfsnit,
  dageTilbageIAaretCopy,
  dageTilbageIAaretFaq,
  getDageTilbagePath,
  isDageTilbageLocale,
  type DageTilbageLocale,
} from "@/lib/dage-tilbage-i-aaret";
import { getDageIAaretPath } from "@/lib/dage-i-aaret";
import { getDageIManedenPath } from "@/lib/dage-i-maaneden";
import { getTimerIAaretPath } from "@/lib/timer-i-aret";
import { getArbejdsdagePath } from "@/lib/arbejdsdage";
import { getDageTilHubPath } from "@/lib/dage-til";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getIntlLocale } from "@/lib/format";
import { OG_IMAGE } from "@/lib/page-helpers";

/**
 * Siden for «hvor mange dage er der tilbage af 2026». Der er to route-filer over
 * denne komponent (`/dage-tilbage-i-aaret` og `/dagar-kvar-i-aret`), og det er
 * *stien* der vælger sproget — samme regel som `/dage-til`, `/klokken-i` og
 * `/dage-i-aaret`. Et kald til den anden sprogs sti er routingens 301, så en
 * `notFound()` her betyder at de to ikke er enige, og det er den der holder en
 * svensk kopi af tabellen ude af det danske domænes indeks.
 */
async function sideLocale(prefix: string) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (!isDageTilbageLocale(locale) || DAGE_TILBAGE_PATH[locale] !== prefix) {
    notFound();
  }
  return { locale: locale as DageTilbageLocale };
}

/** Tal med sitets egen gruppering — dansk punktum, svensk mellemrum. */
function tal(n: number, locale: DageTilbageLocale): string {
  return n.toLocaleString(getIntlLocale(locale));
}

export async function buildDageTilbageIAaretMetadata(
  prefix: string,
  today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale, locale } = domainConfig;
  if (!isDageTilbageLocale(locale) || DAGE_TILBAGE_PATH[locale] !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const c = dageTilbageIAaretCopy[locale];
  const o = aaretTilbage(locale, today);
  const dagetal =
    o.dageTilbage === 1
      ? "1 dag"
      : `${tal(o.dageTilbage, locale)} ${locale === "da" ? "dage" : "dagar"}`;
  const canonical = `${baseUrl}${DAGE_TILBAGE_PATH[locale]}`;
  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale("da").baseUrl}${DAGE_TILBAGE_PATH.da}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale("se").baseUrl}${DAGE_TILBAGE_PATH.se}`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}${DAGE_TILBAGE_PATH.da}`,
  };

  // Titlen bærer spørgsmålet *og* svaret, og intet site-navn: «| MinBeregner.dk»
  // skar halen af de ni dage-til-titler (C81), og her er svaret hele løftet.
  // Sætningen begynder derfor på svaret frem for at gentage spørgsmålet, så
  // Google får både årstallet og de tre tal den ikke allerede har vist.
  const description =
    locale === "da"
      ? `${dagetal} og ${tal(o.uger, locale)} uger er tilbage af ${o.aar}. Se hvad der er tilbage af hver måned, hverdage der er tilbage og de helligdage der stadig kommer.`
      : `${dagetal} och ${tal(o.uger, locale)} veckor är kvar av ${o.aar}. Se vad som är kvar av varje månad, vardagar som är kvar och de helgdagar som fortfarande kommer.`;

  return {
    title: { absolute: `${c.titelSpoergsmaal} ${o.aar}? ${dagetal}` },
    description,
    openGraph: {
      title: `${c.titelSpoergsmaal} ${o.aar}? ${dagetal}`,
      description,
      url: canonical,
      type: "website",
      siteName,
      locale: ogLocale,
      images: OG_IMAGE,
    },
    twitter: {
      card: "summary_large_image",
      title: `${c.titelSpoergsmaal} ${o.aar}? ${dagetal}`,
      description,
      images: OG_IMAGE,
    },
    alternates: { canonical, languages },
  };
}

export async function DageTilbageIAaretRoute({ prefix }: { prefix: string }) {
  const { locale } = await sideLocale(prefix);
  const today = new Date();
  const c = dageTilbageIAaretCopy[locale];
  const da = locale === "da";
  const o = aaretTilbage(locale, today);
  const afsnit = dageTilbageIAaretAfsnit(locale, today);
  const faq = dageTilbageIAaretFaq(locale, today);
  const sti = DAGE_TILBAGE_PATH[locale];
  const dageIAaretSti = getDageIAaretPath(locale);
  const dageIManedenSti = getDageIManedenPath(locale);
  const timerIAaretSti = getTimerIAaretPath(locale);
  const arbejdsdageSti = getArbejdsdagePath(locale);
  const dageTilSti = getDageTilHubPath(locale);

  /** «1 dag» og «17 dage» / «1 dag» och «17 dagar» — med rigtigt ental. */
  const dagetal =
    o.dageTilbage === 1
      ? "1 dag"
      : `${tal(o.dageTilbage, locale)} ${da ? "dage" : "dagar"}`;

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
          {c.svarIgang}
        </p>
        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
          {dagetal}
        </p>
        <p className="text-blue-800 dark:text-blue-200 mt-2">
          {da
            ? `Det er ${tal(o.uger, locale)} hele uger og ${tal(o.restDage, locale)} dage — eller ${tal(o.timer, locale)} timer. ${tal(o.procentForbi, locale)} % af ${o.aar} er gået, og ${tal(o.hverdageTilbage, locale)} af dem er hverdage.`
            : `Det är ${tal(o.uger, locale)} hela veckor och ${tal(o.restDage, locale)} dagar — eller ${tal(o.timer, locale)} timmar. ${tal(o.procentForbi, locale)} % av ${o.aar} har gått, och ${tal(o.hverdageTilbage, locale)} av dem är vardagar.`}
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
          {da
            ? `I dag tælles ikke med — regnes den med, er der ${tal(o.medIDag, locale)} dage tilbage.`
            : `Dagens datum räknas inte med — räknas det med är det ${tal(o.medIDag, locale)} dagar kvar.`}
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
                {c.kolonneDageTilbage}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.kolonneHverdage}
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
                  {maaned.dageTilbage}
                </td>
                <td className="text-right py-2 pl-3 tabular-nums">
                  {maaned.hverdageTilbage}
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <th scope="row" className="text-left py-2 pr-3">
                {c.sum}
              </th>
              <td className="text-right py-2 px-3 tabular-nums">
                {o.dageTilbage}
              </td>
              <td className="text-right py-2 pl-3 tabular-nums">
                {o.hverdageTilbage}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {c.underTabel}
        </p>
      </div>

      <div className="mb-8 not-prose">
        <h2 className="text-2xl font-semibold mb-3">
          {c.helligdageOverskrift}
        </h2>
        {o.helligdageTilbage.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">{c.helligdageTom}</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {o.helligdageTilbage.map((helligdag) => (
              <li
                key={helligdag.iso}
                className="flex justify-between gap-4 py-2 text-sm"
              >
                <span className="font-medium">{helligdag.navn}</span>
                <span className="text-gray-600 dark:text-gray-400 tabular-nums">
                  {helligdag.datoTekst} · {helligdag.ugedag}
                </span>
              </li>
            ))}
          </ul>
        )}
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
        {dageIManedenSti && (
          <Link
            href={dageIManedenSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkDageIManeden}
          </Link>
        )}
        {timerIAaretSti && (
          <Link
            href={timerIAaretSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkTimerIAaret}
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
        {dageTilSti && (
          <Link
            href={dageTilSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkDageTil}
          </Link>
        )}
      </div>

      <FAQ items={faq} />
    </div>
  );
}
