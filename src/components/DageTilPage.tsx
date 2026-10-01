import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import {
  formatTargetDate,
  formatTargetYear,
  getDageTilAnswer,
  getDageTilEvents,
  getDageTilPrefix,
  getDageTilSlugFromPathname,
  isDageTilLocale,
  resolveDageTilSlug,
  type DageTilEvent,
  type DageTilLocale,
  dageTilArm,
  dagensDatoAnker,
} from "@/lib/dage-til";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { OG_IMAGE } from "@/lib/page-helpers";

const units: Record<DageTilLocale, { day: string; days: string; week: string; weeks: string }> = {
  da: { day: "dag", days: "dage", week: "uge", weeks: "uger" },
  se: { day: "dag", days: "dagar", week: "vecka", weeks: "veckor" },
};

const copy: Record<
  DageTilLocale,
  {
    answerPrefix: string;
    today: string;
    /** The line above the answer: "I dag er det" / "I dag är det". */
    todayIs: string;
    equivalent: string;
    /** Preposition before the event name: "til" in Danish, "till" in Swedish. */
    to: string;
    updated: string;
    methodHeading: string;
    methodBody: string;
    ctaHeading: string;
    ctaBody: string;
    weekday: (index: number) => string;
  }
> = {
  da: {
    answerPrefix: "Der er",
    today: "Det er",
    todayIs: "I dag er det",
    equivalent: "Det svarer til",
    to: "til",
    updated: "Tallet er beregnet ud fra dagens dato og opdateres automatisk.",
    methodHeading: "Sådan er tallet beregnet",
    methodBody:
      "Tallet er forskellen mellem dagens dato og datoen i overskriften, målt i hele dage. Dagen i dag tælles ikke med, så der er 1 dag tilbage dagen før. Skriver du bare 1. december, juledagen eller påskedag i søgefeltet, får du samme svar.",
    ctaHeading: "Andre datoer",
    ctaBody: "De næste datoer, der bliver søgt på",
    weekday: (index) =>
      ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"][index],
  },
  se: {
    answerPrefix: "Det finns",
    today: "Det är",
    todayIs: "I dag är det",
    equivalent: "Det motsvarar",
    to: "till",
    updated: "Talet räknas ut från dagens datum och uppdateras automatiskt.",
    methodHeading: "Så här räknas talet ut",
    methodBody:
      "Talet är skillnaden mellan dagens datum och datumet i rubriken, mätt i hela dagar. Dagen i dag räknas inte med, så det finns 1 dag kvar dagen innan. Skriver du bara 1 december, juldagen eller påskdagen i sökfältet får du samma svar.",
    ctaHeading: "Andra datum",
    ctaBody: "Nästa datum som blir sökta på",
    weekday: (index) =>
      ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"][index],
  },
};

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function getAnswerText(
  event: DageTilEvent,
  locale: DageTilLocale,
  today: Date
): { headline: string; equivalent: string; target: string; targetIso: string } {
  const answer = getDageTilAnswer(event, locale, today);
  const u = units[locale];
  const target = formatTargetDate(answer.targetDate, locale);
  const weekday = copy[locale].weekday(answer.targetDate.getUTCDay());
  if (answer.isToday) {
    return {
      headline: `${copy[locale].today} ${dageTilArm(event, locale).copy.short} — 0 ${u.days}`,
      equivalent: locale === "da" ? "Der er 0 dage tilbage." : "Det finns 0 dagar kvar.",
      target: `${target} ${formatTargetYear(answer.targetDate)} er en ${weekday}`,
      targetIso: answer.targetDate.toISOString().slice(0, 10),
    };
  }
  return {
    headline: `${copy[locale].answerPrefix} ${count(answer.days, u.day, u.days)} ${
      copy[locale].to
    } ${dageTilArm(event, locale).copy.short}`,
    equivalent:
      answer.daysLeft === 0
        ? `${copy[locale].equivalent} ${count(answer.weeks, u.week, u.weeks)}.`
        : `${copy[locale].equivalent} ${count(answer.weeks, u.week, u.weeks)} og ${count(
            answer.daysLeft,
            u.day,
            u.days
          )}.`,
    target: `${target} ${formatTargetYear(answer.targetDate)} er en ${weekday}`,
    targetIso: answer.targetDate.toISOString().slice(0, 10),
  };
}

export async function buildDageTilMetadata(
  prefix: string,
  slug: string,
  today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale } = domainConfig;
  const { locale } = domainConfig;
  if (!isDageTilLocale(locale) || getDageTilPrefix(locale) !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const dageLocale: DageTilLocale = locale;
  const event = getDageTilEvents(dageLocale).find(
    (candidate) => candidate[dageLocale]?.slug === slug
  );
  if (!event) {
    return { robots: { index: false, follow: false } };
  }
  const { headline, target, targetIso } = getAnswerText(event, dageLocale, today);
  const canonical = `${baseUrl}${prefix}${slug}`;
  const u = units[dageLocale];
  const days = getDageTilAnswer(event, dageLocale, today).days;

  const languages: Record<string, string> = {};
  languages[getDomainConfigByLocale("da").hreflangCode] =
    `${getDomainConfigByLocale("da").baseUrl}/dage-til/${event.da.slug}`;
  // Sommerferien has no Swedish date, so there is no Swedish page to point
  // at; hreflang to a 404 would be worse than no hreflang at all.
  if (event.se) {
    languages[getDomainConfigByLocale("se").hreflangCode] =
      `${getDomainConfigByLocale("se").baseUrl}/dagar-till/${event.se.slug}`;
  }
  languages["x-default"] = languages.da;

  // The title carries the question and the answer, and *not* the site name:
  // `| MinBeregner.dk` pushed all nine titles to 61-67 characters, so Google
  // clipped away the tail — the part that carries no search intent. The site
  // name is still sent as `og:site_name` and is still in every other page's
  // title; these nine are the exception because their question alone is the
  // whole lift. C81 locked this for the 160 `page-data` titles, and this is
  // the same rule applied to the nine the gate could not see.
  const titleText = `${dageTilArm(event, dageLocale).copy.question} ${count(days, u.day, u.days)}`;

  // The description used to open with the event's own question — the exact
  // words the title already carries — so the first ~38 characters of the
  // snippet repeated the blue link verbatim (C164's finding, on the pages its
  // `page-data.ts` scan could not reach because these are built here).
  // What is left of the snippet then held a restatement of the day count that
  // the title also shows, and Google clipped the tail mid-word: all 28 were
  // 179-195 characters. Starting at the answer gives every remaining character
  // to the date, the weekday and the freshness — the three things the title
  // does not say — and lands under Google's ~160-character cut.
  return {
    title: { absolute: titleText },
    description: `${headline}. ${target}. ${
      dageLocale === "da"
        ? "Tallet opdateres hver dag."
        : "Talet uppdateras varje dag."
    }`,
    openGraph: {
      title: titleText,
      description: `${headline}. ${target} (${targetIso}).`,
      url: canonical,
      type: "website",
      siteName,
      locale: ogLocale,
      images: OG_IMAGE,
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: `${headline}. ${target} (${targetIso}).`,
      images: OG_IMAGE,
    },
    alternates: { canonical, languages },
  };
}

export async function DageTilRoute({
  prefix,
  slug,
}: {
  prefix: string;
  slug: string;
}) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  const parsed = getDageTilSlugFromPathname(`${prefix}${slug}`);
  const resolved = isDageTilLocale(locale) ? resolveDageTilSlug(slug, locale) : undefined;

  // A slug in the other language, or a slug that is not one of ours, must not
  // render here — the middleware normally redirects or 404s first.
  if (
    !parsed ||
    !resolved ||
    !isDageTilLocale(locale) ||
    getDageTilPrefix(locale) !== prefix ||
    !resolved.isOwnLocale
  ) {
    notFound();
  }

  const dageLocale: DageTilLocale = locale;
  const event = resolved.event;
  const today = new Date();
  // The same anchor the day count is computed from, so the date shown is the
  // date the number was counted from — a `new Date()` here would disagree with
  // it between 00:00 and 02:00 Danish time.
  const iDag = dagensDatoAnker(today);
  const iDagIso = iDag.toISOString().slice(0, 10);
  const iDagTekst = `${formatTargetDate(iDag, dageLocale)} ${formatTargetYear(iDag)}`;
  const c = copy[dageLocale];
  const u = units[dageLocale];
  const eventCopy = dageTilArm(event, dageLocale).copy;
  const answer = getDageTilAnswer(event, dageLocale, today);
  const { headline, equivalent, target, targetIso } = getAnswerText(
    event,
    dageLocale,
    today
  );
  const others = getDageTilEvents(dageLocale).filter((e) => e.id !== event.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${eventCopy.question} ${count(answer.days, u.day, u.days)}`,
    description: headline,
    url: `${domainConfig.baseUrl}${prefix}${slug}`,
    dateModified: today.toISOString(),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQSchema items={eventCopy.faq} />
      <Breadcrumbs
        items={[
          {
            name: dageLocale === "da" ? "Hverdag" : "Vardag",
            href: `/kategori/${dageLocale === "da" ? "hverdag" : "praktisk"}`,
          },
          { name: eventCopy.question, href: `${prefix}${slug}` },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{eventCopy.question}</h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 md:p-8 mb-8">
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
          {c.todayIs}{" "}
          <time dateTime={iDagIso}>
            {c.weekday(iDag.getUTCDay())} {iDagTekst}
          </time>
        </p>
        <p className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-100">
          {headline}
        </p>
        <p className="text-lg text-blue-800 dark:text-blue-200 mt-2">{equivalent}</p>
        <p className="text-blue-800 dark:text-blue-200 mt-2">
          <time dateTime={targetIso}>{target}</time>
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">{c.updated}</p>
      </div>

      <div className="prose dark:prose-invert max-w-none mb-8">
        <h2>{c.methodHeading}</h2>
        <p>{c.methodBody}</p>
        <ul>
          {eventCopy.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 not-prose">
        <h2 className="text-xl font-semibold mb-3 dark:text-white">{c.ctaHeading}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{c.ctaBody}</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {others.map((other) => {
            const otherCopy = dageTilArm(other, dageLocale).copy;
            const otherAnswer = getDageTilAnswer(other, dageLocale, today);
            return (
              <li key={other.id}>
                <Link
                  href={`${prefix}${dageTilArm(other, dageLocale).slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {otherCopy.short}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {count(otherAnswer.days, u.day, u.days)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dato"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            {dageLocale === "da" ? "Datoberegner" : "Datumräknare"}
          </Link>
          <Link
            href="/nedtaelling"
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {dageLocale === "da" ? "Nedtæller" : "Nedräknare"}
          </Link>
        </div>
      </div>

      <FAQ items={eventCopy.faq} />
    </div>
  );
}
