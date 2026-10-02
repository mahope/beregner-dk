import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import { copy, count, units } from "@/components/DageTilPage";
import {
  dagensDatoAnker,
  formatTargetDate,
  formatTargetYear,
  getDageTilHubPath,
  getDageTilHubRækker,
  isDageTilLocale,
  type DageTilLocale,
} from "@/lib/dage-til";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { OG_IMAGE } from "@/lib/page-helpers";

/**
 * Copy for the section's own page. Everything that is a *date* is not here:
 * the rows come from `getDageTilHubRækker`, and the headline on top of the page
 * is the nearest row's own question and day count, so the hub cannot promise a
 * countdown it does not show.
 */
const hubCopy: Record<
  DageTilLocale,
  {
    h1: string;
    title: (datoer: number) => string;
    lead: string;
    listHeading: string;
    listBody: string;
    listEmpty: string;
    faq: { question: string; answer: string }[];
  }
> = {
  da: {
    h1: "Hvor mange dage er der til …?",
    title: (datoer) => `Hvor mange dage er der til …? ${datoer} datoer med dagens tal`,
    lead:
      "Alle datoer og helligdage på ét sted, med dagens antal dage. Tallene er sorteret efter hvad der kommer først, og hver linje fører til en side med hele regnestykket og flere oplysninger om datoen.",
    listHeading: "Datoer sorteret efter hvad der kommer først",
    listBody:
      "Tallet er forskellen mellem dagens kalenderdag og datoens kalenderdag. Rækkerne er sorteret efter hvor få dage der er tilbage, så den dato du leder efter står øverst.",
    listEmpty: "Der er ingen datoer at vise lige nu.",
    faq: [
      {
        question: "Hvor kommer dagene fra?",
        answer:
          "Hver dato regnes i hele kalenderdage i dansk tid (CET/CEST), og dagen i dag tælles ikke med: på selve dagen står der 0 dage, og dagen før står der 1 dag. Det er samme regel som på den enkelte datoside, så de to sider aldrig kan komme til at stride.",
      },
      {
        question: "Hvorfor står der både dage og uger?",
        answer:
          "Fordi de fleste spørgsmål findes i begge former. 84 dage er 12 hele uger, og det er samme svar: dagene er delt med 7, og de dage der er tilbage efter den sidste hele uge står for sig selv.",
      },
      {
        question: "Min dato står ikke på siden — hvad gør jeg så?",
        answer:
          "Brug nedtællingen til et vilkårligt dato: vælg datoen, så får du dage, uger og dage. Skal du regne forskellen mellem to valgfri datoer, tager datoberegneren sig af det.",
      },
    ],
  },
  se: {
    h1: "Hur många dagar är det till …?",
    title: (datoer) => `Hur många dagar är det till …? ${datoer} datum med dagens tal`,
    lead:
      "Alla datum och helgdagar på ett ställe, med dagens antal dagar. Talen är sorterade efter vad som kommer först, och varje rad leder till en sida med hela uträkningen och mer information om datumet.",
    listHeading: "Datum sorterade efter vad som kommer först",
    listBody:
      "Talet är skillnaden mellan dagens kalenderdag och datumets kalenderdag. Raderna är sorterade efter hur få dagar som är kvar, så datumet du letar efter står överst.",
    listEmpty: "Det finns inga datum att visa just nu.",
    faq: [
      {
        question: "Var kommer dagarna ifrån?",
        answer:
          "Varje datum räknas i hela kalendardagar i svensk tid (CET/CEST), och dagen i dag räknas inte med: på själva dagen står det 0 dagar, och dagen innan står det 1 dag. Det är samma regel som på den enskilda datasidan, så de två sidorna kan aldrig komma i konflikt.",
      },
      {
        question: "Varför står det både dagar och veckor?",
        answer:
          "För att de flesta frågorna finns i båda formerna. 84 dagar är 12 hela veckor, och det är samma svar: dagarna delas med 7, och de dagar som är kvar efter den sista hela veckan står för sig.",
      },
      {
        question: "Mitt datum står inte på sidan — vad gör jag då?",
        answer:
          "Använd nedräkningen till vilket datum som helst: välj datumet, så får du dagar, veckor och dagar. Om du ska räkna ut skillnaden mellan två valfria datum tar datumräknaren hand om det.",
      },
    ],
  },
};

/** "er" in Danish, "är" in Swedish — the same verb in two spellings. */
const ER: Record<DageTilLocale, string> = { da: "er", se: "är" };

/** "i dag" is spelled the same in both languages. */
const I_DAG = "i dag";

/**
 * "1. december 2026 er en tirsdag" — the target's own weekday, so the row can
 * never show a date whose weekday disagrees with it.
 */
function targetText(
  date: Date,
  locale: DageTilLocale
): { text: string; iso: string } {
  return {
    text: `${formatTargetDate(date, locale)} ${formatTargetYear(date)} ${ER[locale]} en ${copy[locale].weekday(
      date.getUTCDay()
    )}`,
    iso: date.toISOString().slice(0, 10),
  };
}

/**
 * The hub is a Danish section and a Swedish one, and the *path* says which
 * language is being asked for — the same rule the date pages follow with their
 * prefix. A request for the other language's path on this domain is the
 * router's redirect, so reaching here means the two disagree; refusing to
 * render is what keeps a second copy of the list out of the index.
 */
async function hubLocale(prefix: string) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (!isDageTilLocale(locale) || getDageTilHubPath(locale) !== prefix) {
    notFound();
  }
  return { domainConfig, locale: locale as DageTilLocale };
}

export async function buildDageTilHubMetadata(
  prefix: string,
  today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale } = domainConfig;
  const { locale } = domainConfig;
  if (!isDageTilLocale(locale) || getDageTilHubPath(locale) !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const dageLocale: DageTilLocale = locale;
  const rækker = getDageTilHubRækker(dageLocale, today);
  const naeste = rækker[0];
  if (!naeste) {
    return { robots: { index: false, follow: false } };
  }
  const c = hubCopy[dageLocale];
  const u = units[dageLocale];
  const canonical = `${baseUrl}${getDageTilHubPath(dageLocale)}`;
  const naesteTarget = targetText(naeste.targetDate, dageLocale);
  // The question the section answers, then the answer. The site name is left
  // out for the same reason `buildDageTilMetadata` leaves it out: the question
  // is the whole lift, and the name is still sent as `og:site_name`.
  const titleText = c.title(rækker.length);
  const description = `${count(naeste.days, u.day, u.days)} ${
    dageLocale === "da" ? "til" : "till"
  } ${naesteTarget.text}. ${
    dageLocale === "da"
      ? `Se alle ${rækker.length} datoer med dagens antal dage, sorteret efter hvad der kommer først.`
      : `Se alla ${rækker.length} datum med dagens antal dagar, sorterade efter vad som kommer först.`
  }`;

  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]:
      `${getDomainConfigByLocale("da").baseUrl}/dage-til`,
    [getDomainConfigByLocale("se").hreflangCode]:
      `${getDomainConfigByLocale("se").baseUrl}/dagar-till`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}/dage-til`,
  };

  return {
    title: { absolute: titleText },
    description,
    openGraph: {
      title: titleText,
      description,
      url: canonical,
      type: "website",
      siteName,
      locale: ogLocale,
      images: OG_IMAGE,
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description,
      images: OG_IMAGE,
    },
    alternates: { canonical, languages },
  };
}

export async function DageTilHubRoute({ prefix }: { prefix: string }) {
  const { domainConfig, locale } = await hubLocale(prefix);
  const today = new Date();
  const rækker = getDageTilHubRækker(locale, today);
  const naeste = rækker[0];
  if (!naeste) notFound();

  const c = hubCopy[locale];
  const u = units[locale];
  const hubPath = getDageTilHubPath(locale) as string;
  const naesteTarget = targetText(naeste.targetDate, locale);
  const iDag = dagensDatoAnker(today);
  const iDagIso = iDag.toISOString().slice(0, 10);
  const iDagTekst = `${formatTargetDate(iDag, locale)} ${formatTargetYear(iDag)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: c.h1,
    description: `${count(naeste.days, u.day, u.days)} ${
      locale === "da" ? "til" : "till"
    } ${naeste.short}`,
    url: `${domainConfig.baseUrl}${hubPath}`,
    dateModified: today.toISOString(),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQSchema items={c.faq} />
      <Breadcrumbs
        items={[
          {
            name: locale === "da" ? "Hverdag" : "Vardag",
            href: `/kategori/${locale === "da" ? "hverdag" : "praktisk"}`,
          },
          { name: c.h1, href: hubPath },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{c.h1}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{c.lead}</p>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 md:p-8 mb-8">
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
          {copy[locale].todayIs}{" "}
          <time dateTime={iDagIso}>
            {copy[locale].weekday(iDag.getUTCDay())} {iDagTekst}
          </time>
        </p>
        <p className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-100">
          {count(naeste.days, u.day, u.days)}{" "}
          {locale === "da" ? "til" : "till"} {naeste.short}
        </p>
        <p className="text-lg text-blue-800 dark:text-blue-200 mt-2">
          {naeste.isToday
            ? locale === "da"
              ? "Det er dagen i dag."
              : "Det är dagen i dag."
            : `${copy[locale].equivalent} ${count(naeste.weeks, u.week, u.weeks)}${
                naeste.daysLeft === 0
                  ? "."
                  : ` ${locale === "da" ? "og" : "och"} ${count(
                      naeste.daysLeft,
                      u.day,
                      u.days
                    )}.`
              }`}
        </p>
        <p className="text-blue-800 dark:text-blue-200 mt-2">
          <Link href={naeste.href}>
            <time dateTime={naesteTarget.iso}>{naesteTarget.text}</time>
          </Link>
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
          {copy[locale].updated}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none mb-8">
        <h2>{c.listHeading}</h2>
        <p>{c.listBody}</p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 not-prose">
        {rækker.length === 0 && <li className="text-gray-600">{c.listEmpty}</li>}
        {rækker.map((raekke) => (
          <li key={raekke.id}>
            <Link
              href={raekke.href}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:border-blue-300 dark:hover:border-blue-600"
            >
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {raekke.short} {formatTargetYear(raekke.targetDate)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {raekke.isToday ? I_DAG : count(raekke.days, u.day, u.days)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/dato"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
        >
          {locale === "da" ? "Datoberegner" : "Datumräknare"}
        </Link>
        <Link
          href="/nedtaelling"
          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
        >
          {locale === "da" ? "Nedtæller" : "Nedräknare"}
        </Link>
      </div>

      <FAQ items={c.faq} />
    </div>
  );
}
