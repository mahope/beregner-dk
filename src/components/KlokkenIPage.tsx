import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";
import {
  beregnKlokkenNu,
  byensNavn,
  findKlokkenLand,
  getKlokkenPrefix,
  KLOKKEN_LANDE,
  klokkenLandTitel,
  landetsNavn,
  slugForSprog,
  type KlokkenSprog,
} from "@/lib/klokken-i";

/**
 * Sproget afhænger af **ruten**, ikke af domænet: `/klokken-i` er dansk og
 * `/klockan-i` er svensk, præcis som `/dage-til` og `/dagar-till` er det.
 * Samme komponent og samme modul renderer begge, så en ny tid i en tekst ikke
 * kan stå i den anden sprogudgave end i den danske.
 */
export const KLOKKEN_PREFIX = { da: "/klokken-i/", se: "/klockan-i/" } as const;

const copy = {
  da: {
    question: (land: string) => `Hvad er klokken i ${land}?`,
    answer: (tid: string) => `Det er ${tid} i`,
    justNow: "lige nu.",
    andetLand: "Andre lande — hvad er klokken i dem?",
    converter: "Tidszonekonverter",
    converterBody:
      "Skal du finde klokken i en by, der ikke står på denne side, kan du regne den om i konverteren.",
    night: (by: string, tid: string) => `Det er nat i ${by} — klokken er ${tid}.`,
    faq: (land: string, by: string, forskel: string, tid: string) => [
      {
        question: `Hvor mange timer er ${land} foran Danmark?`,
        answer: `${by} ligger ${forskel}. Forskellen ændrer sig, når Danmark og landet skifter til sommertid på forskellige datoer.`,
      },
      {
        question: `Hvornår er det bedst at ringe til ${land}?`,
        answer: `Tidsforskellen på ${forskel} betyder, at en aftensoplågning i Danmark normalt er senere, når du ringer til ${land}.`,
      },
      {
        question: `Hvad er klokken i ${by} lige nu?`,
        answer: `Lige nu er det ${tid} i ${by}. Tallet regnes hver gang siden indlæses, så det følger byens egen tidszone og landets egen skiftedag.`,
      },
    ],
  },
  se: {
    question: (land: string) => `Vad är klockan i ${land}?`,
    answer: (tid: string) => `Det är ${tid} i`,
    justNow: "just nu.",
    andetLand: "Andra länder — vad är klockan i dem?",
    converter: "Tidszonskonverterare",
    converterBody:
      "Behöver du klockan i en stad som inte finns på den här sidan kan du räkna ut den i konverteraren.",
    night: (by: string, tid: string) => `Det är natt i ${by} — klockan är ${tid}.`,
    faq: (land: string, by: string, forskel: string, tid: string) => [
      {
        question: `Hur många timmar är ${land} före Sverige?`,
        answer: `${by} ligger ${forskel}. Skillnaden ändras när Sverige och landet byter till sommartid på olika datum.`,
      },
      {
        question: `När är det bäst att ringa ${land}?`,
        answer: `Tidsskillnaden på ${forskel} innebär att ett kvällssamtal i Sverige normalt blir senare när du ringer till ${land}.`,
      },
      {
        question: `Vad är klockan i ${by} just nu?`,
        answer: `Just nu är det ${tid} i ${by}. Talet räknas om varje gång sidan hämtas, så det följer stadens egen tidszon och landets eget byte.`,
      },
    ],
  },
} as const;

export function buildKlokkenMetadata(
  sprog: KlokkenSprog,
  slug: string,
  tidspunkt: Date
): Promise<Metadata> | Metadata {
  const land = findKlokkenLand(slug, sprog);
  if (!land) return {};
  const c = copy[sprog];
  const svar = beregnKlokkenNu(land.byer[0], sprog, tidspunkt);
  const landet = landetsNavn(land, sprog);
  // Titlen er `absolute`, så den ikke arver rodlayoutets `| MinBeregner.dk`
  // (målt 3/10 19:0x: alle tolv sider endte på «Hvad er klokken i USA? |
  // MinBeregner.dk», 18 tegn af et klokkeslæt der ikke stod i titlen). Den
  // skrives fra `klokkenLandTitel`, altså fra samme måling som brødteksten.
  const title = klokkenLandTitel(land, sprog, tidspunkt);
  // hreflang for hvert land i **begge** sprog. Slugene læses fra
  // `KLOKKEN_LANDE` — samme modul `getKlokkenSlugs` bygger ruterne af — så en
  // ny tid ikke kan få en dansk side uden sin svenske modpart. Uden disse tag
  // så `/klokken-i/usa` (da) og `/klockan-i/usa` (se) ud som to sider om det
  // samme emne i stedet for som én side i to sprog, hvilket er det de er bygget
  // til. `/dage-til` gjorde det samme med `getDomainConfigByLocale`.
  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale(
      "da"
    ).baseUrl}${KLOKKEN_PREFIX.da}${slugForSprog(land, "da")}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale(
      "se"
    ).baseUrl}${KLOKKEN_PREFIX.se}${slugForSprog(land, "se")}`,
  };
  languages["x-default"] = languages[getDomainConfigByLocale("da").hreflangCode];

  return getCurrentDomainConfig().then((domainConfig) => ({
    title: { absolute: title },
    description: sprog === "da"
      ? `Det er ${svar.tid} i ${svar.by} lige nu, ${svar.forskel} Danmark. Se klokken i alle tidszoner i ${landet} og konverter til en hvilken som helst by.`
      : `Det är ${svar.tid} i ${svar.by} just nu, ${svar.forskel} Sverige. Se klockan i alla tidszoner i ${landet} och konvertera till vilken stad som helst.`,
    alternates: {
      canonical: `${domainConfig.baseUrl}${KLOKKEN_PREFIX[sprog]}${slug}`,
      languages,
    },
    openGraph: {
      title,
      description: `${svar.tid} i ${svar.by}`,
      url: `${domainConfig.baseUrl}${KLOKKEN_PREFIX[sprog]}${slug}`,
      ...OG_IMAGE,
    },
  }));
}

export default async function KlokkenIPage({
  sprog,
  slug,
}: {
  sprog: KlokkenSprog;
  slug: string;
}) {
  const land = findKlokkenLand(slug, sprog);
  const domainConfig = await getCurrentDomainConfig();
  const prefix = KLOKKEN_PREFIX[sprog];
  if (!land || getKlokkenPrefix(domainConfig.locale) === undefined) {
    notFound();
  }
  const c = copy[sprog];
  const tidspunkt = new Date();
  const landet = landetsNavn(land, sprog);
  const svar = beregnKlokkenNu(land.byer[0], sprog, tidspunkt);
  const overskrift = c.question(landet);
  const øvrige = land.byer.slice(1);
  const andre = KLOKKEN_LANDE.filter((l) => l !== land);
  const faq = c.faq(landet, svar.by, svar.forskel, svar.tid);
  const andetFor =
    sprog === "da" ? "i forhold til Danmark" : "i förhållande till Sverige";

  return (
    <div>
      <FAQSchema items={faq} />
      <Breadcrumbs
        items={[
          {
            name: sprog === "da" ? "Hverdag" : "Vardag",
            href: `/kategori/${sprog === "da" ? "hverdag" : "praktisk"}`,
          },
          { name: overskrift, href: `${prefix}${slug}` },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{overskrift}</h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 md:p-8 mb-8">
        <p className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-100">
          {c.answer(svar.tid)}{" "}
          <time dateTime={tidspunkt.toISOString()}>{svar.by}</time>
          {c.justNow}
        </p>
        <p className="text-lg text-blue-800 dark:text-blue-200 mt-2">
          <time dateTime={tidspunkt.toISOString()}>{svar.dato}</time>
        </p>
        <p className="text-blue-800 dark:text-blue-200 mt-2">
          {sprog === "da" ? "Byen ligger" : "Staden ligger"}{" "}
          <strong>{svar.forskel}</strong> {andetFor}.
        </p>
        {svar.andenDag ? (
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            {svar.andenDag}
          </p>
        ) : null}
      </div>

      {øvrige.length > 0 ? (
        <div className="prose dark:prose-invert max-w-none mb-8 not-prose">
          <h2 className="text-2xl font-bold mb-3 dark:text-white">
            {sprog === "da"
              ? `${landet} har flere tidszoner`
              : `${landet} har flera tidszoner`}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {øvrige.map((by) => {
              const bySvar = beregnKlokkenNu(by, sprog, tidspunkt);
              return (
                <li
                  key={by.zone}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {byensNavn(by, sprog)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    <time dateTime={tidspunkt.toISOString()}>{bySvar.tid}</time>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {svar.erNatte ? (
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {c.night(svar.by, svar.tid)}
        </p>
      ) : null}

      <div className="prose dark:prose-invert max-w-none mb-8">
        <h2>
          {sprog === "da" ? "Sådan er tallet fundet" : "Så här hittas talet"}
        </h2>
        <p>
          {sprog === "da"
            ? `Tallet er læst i ${landet}s egen tidszone i det øjeblik, siden er hentet, og sammenlignet med klokken i Danmark. Det er derfor der står ${svar.forskel} her og på tidspunktet: forskellen følger begge landes egne skiftedatoer, så den ændrer sig to gange om året, i de fleste tilfælde på hver sin dag.`
            : `Talet läses i ${landet}s egen tidszon i det ögonblick sidan hämtas och jämförs med klockan i Sverige. Därför står det ${svar.forskel} här och i dag: skillnaden följer båda ländernas egna byten, så den ändras två gånger om året, oftast på olika dagar.`}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 not-prose">
        <h2 className="text-xl font-semibold mb-3 dark:text-white">{c.andetLand}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {andre.map((andet) => (
            <li key={slugForSprog(andet, sprog)}>
              <Link
                href={`${prefix}${slugForSprog(andet, sprog)}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:border-blue-300 dark:hover:border-blue-600"
              >
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {landetsNavn(andet, sprog)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {beregnKlokkenNu(andet.byer[0], sprog, tidspunkt).tid}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tidszone"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            {c.converter}
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
          {c.converterBody}
        </p>
      </div>

      <FAQ items={faq} />
    </div>
  );
}