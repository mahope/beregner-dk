import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import {
  getKlokkenHubPath,
  getKlokkenHubRaekker,
  type KlokkenSprog,
} from "@/lib/klokken-i";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { OG_IMAGE } from "@/lib/page-helpers";

/**
 * Sektionens egen side: alle lande med klokken lige nu, i da og se.
 *
 * Copy'en her er den, der ikke er et tal. Hvert tal på siden — rækkernes
 * klokkeslæt og tidsforskel — kommer fra `getKlokkenHubRaekker`, som kalder
 * `beregnKlokkenNu` pr. land, altså samme funktion som den linkede landside
 * bruger med samme øjeblik. Derfor kan overskriften og rækkerne ikke love et tal,
 * siden ikke viser.
 */
const hubCopy: Record<
  KlokkenSprog,
  {
    h1: string;
    title: (lande: number) => string;
    lead: string;
    listHeading: string;
    listBody: string;
    converter: string;
    faq: { question: string; answer: string }[];
  }
> = {
  da: {
    h1: "Hvad er klokken i …?",
    title: (lande) => `Hvad er klokken i …? Klokken i ${lande} lande lige nu`,
    lead:
      "Klokken lige nu i tolv lande, med tidsforskellen til Danmark. Rækkerne er sorteret efter hvor tæt landet ligger på dansk tid, og hver linje fører til en side med hele tidszonen og flere byer.",
    listHeading: "Klokken i landene lige nu",
    listBody:
      "Tallet er byens egen tid i det øjeblik siden er hentet, og forskellen er målt mod klokken i Danmark. USA står med fire byer, fordi landet har fire tidszoner.",
    converter: "Tidszonekonverter",
    faq: [
      {
        question: "Hvordan er tidsforskellen fundet?",
        answer:
          "Hver by læses med sin egen tidszone i det øjeblik siden er hentet, og forskellen mod Danmark trækkes fra de to klokkeslæt. Derfor følger forskellen begge landes egne skiftedatoer, så den ændrer sig to gange om året, i de fleste tilfælde på hver sin dag.",
      },
      {
        question: "Hvorfor står der fire byer under USA?",
        answer:
          "USA har fire tidszoner, så «hvad er klokken i USA» ikke har ét svar. Landsiden svarer med hovedbyen New York og viser de tre andre byer ved siden af, så du kan se hele landet på ét sted.",
      },
      {
        question: "Jeg vil finde klokken i en by, der ikke står her — hvad gør jeg?",
        answer:
          "Brug tidszonekonverteren. Den tager imod ethvert bynavn og viser både klokken og forskellen til Danmark, så du slipper for at slå byen op i en tabel først.",
      },
    ],
  },
  se: {
    h1: "Vad är klockan i …?",
    title: (lande) => `Vad är klockan i …? Klockan i ${lande} länder just nu`,
    lead:
      "Klockan just nu i tolv länder, med tidsskillnaden till Sverige. Raderna är sorterade efter hur nära landet ligger svensk tid, och varje rad leder till en sida med hela tidszonen och flera städer.",
    listHeading: "Klockan i länderna just nu",
    listBody:
      "Talet är stadens egen tid i det ögonblick sidan hämtas, och skillnaden är mätt mot klockan i Sverige. USA står med fyra städer, eftersom landet har fyra tidszoner.",
    converter: "Tidszonskonverterare",
    faq: [
      {
        question: "Hur har tidsskillnaden räknats ut?",
        answer:
          "Varje stad läses med sin egen tidszon i det ögonblick sidan hämtas, och skillnaden mot Sverige dras av de två klockslagen. Därför följer skillnaden båda ländernas egna byten, så den ändras två gånger om året, oftast på olika dagar.",
      },
      {
        question: "Varför står det fyra städer under USA?",
        answer:
          "USA har fyra tidszoner, så «vad är klockan i USA» inte har ett svar. Landssidan svarar med huvudstaden New York och visar de tre andra städerna bredvid, så du ser hela landet på ett ställe.",
      },
      {
        question: "Jag vill hitta klockan i en stad som inte finns här — vad gör jag?",
        answer:
          "Använd tidszonskonverteraren. Den tar emot vilket stadnamn som helst och visar både klockan och skillnaden mot Sverige, så du slipper slå upp staden i en tabell först.",
      },
    ],
  },
};

/**
 * Sproget afhænger af **ruten**, ikke af domænet: `/klokken-i` er dansk og
 * `/klockan-i` er svensk, præcis som `/dage-til` og `/dagar-till` er det. En
 * forespørgsel om det anden sprogs sti er routerens 301, så nåer man her er de
 * to uenige — og så afviser renderer vi, for det er det der holder en dublet
 * af listen ude af indekset.
 */
async function hubLocale(prefix: string) {
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (locale !== "da" && locale !== "se") notFound();
  if (getKlokkenHubPath(locale) !== prefix) notFound();
  return { domainConfig, sprog: locale as KlokkenSprog };
}

export async function buildKlokkenHubMetadata(
  prefix: string,
  tidspunkt: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale } = domainConfig;
  const { locale } = domainConfig;
  if (locale !== "da" && locale !== "se") {
    return { robots: { index: false, follow: false } };
  }
  const sprog: KlokkenSprog = locale;
  if (getKlokkenHubPath(sprog) !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const rækker = getKlokkenHubRaekker(sprog, tidspunkt);
  const naeste = rækker[0];
  if (!naeste) return { robots: { index: false, follow: false } };
  const c = hubCopy[sprog];
  const canonical = `${baseUrl}${prefix}`;
  // Den spørgsmål, sektionen svarer på, og så svaret — samme princip som på
  // den enkelte landside: landet og byen er de to ord, folk søger på.
  const titleText = c.title(rækker.length);
  const naesteText =
    sprog === "da"
      ? `Det er ${naeste.tid} i ${naeste.land}`
      : `Det är ${naeste.tid} i ${naeste.land}`;
  const description = `${naesteText}. ${
    sprog === "da"
      ? `Se klokken i alle ${rækker.length} lande og tidsforskellen til Danmark.`
      : `Se klockan i alla ${rækker.length} länder och tidsskillnaden till Sverige.`
  }`;

  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale(
      "da"
    ).baseUrl}${getKlokkenHubPath("da")}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale(
      "se"
    ).baseUrl}${getKlokkenHubPath("se")}`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}${getKlokkenHubPath(
      "da"
    )}`,
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

export async function KlokkenIHubRoute({ prefix }: { prefix: string }) {
  const { domainConfig, sprog } = await hubLocale(prefix);
  const tidspunkt = new Date();
  const rækker = getKlokkenHubRaekker(sprog, tidspunkt);
  if (rækker.length === 0) notFound();
  const c = hubCopy[sprog];
  const iso = tidspunkt.toISOString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: c.h1,
    description: `${c.h1} ${rækker
      .map((raekke) => `${raekke.land} ${raekke.tid}`)
      .join(", ")}.`,
    url: `${domainConfig.baseUrl}${prefix}`,
    dateModified: iso,
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
            name: sprog === "da" ? "Hverdag" : "Vardag",
            href: `/kategori/${sprog === "da" ? "hverdag" : "praktisk"}`,
          },
          { name: c.h1, href: prefix },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{c.h1}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{c.lead}</p>

      <div className="prose dark:prose-invert max-w-none mb-4">
        <h2>{c.listHeading}</h2>
        <p>{c.listBody}</p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 not-prose">
        {rækker.map((raekke) => (
          <li key={raekke.id}>
            <Link
              href={raekke.href}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:border-blue-300 dark:hover:border-blue-600"
            >
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {raekke.land}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                <time dateTime={iso}>{raekke.tid}</time>{" "}
                <span className="text-xs">({raekke.forskel})</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/tidszone"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
        >
          {c.converter}
        </Link>
      </div>

      <FAQ items={c.faq} />
    </div>
  );
}
