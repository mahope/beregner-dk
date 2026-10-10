import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  VITAMIN_B12_ANBEFALING_UG,
  VITAMIN_B12_AI_UG,
  VITAMIN_B12_AR_UG,
  VITAMIN_B12_KILDE,
  VITAMIN_B12_NORDISK_INDTAG,
  VITAMIN_B12_VARER,
  andelAfAnbefaling,
  b100g,
  bIgram,
  gramForAnbefaling,
  rangliste,
  vareMedNavn,
  b12Tal,
} from "@/lib/vitamin-b12";

export async function generateMetadata() {
  return generatePageMetadata("vitamin-b12");
}

/**
 * Et almindeligt dagsindtag sat sammen af tabellens egne tal. Summen læses af
 * `bIgram`, så teksten og tabellen ikke kan stå med forskellige tal (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Makrel, atlantic, rå", gram: 125 },
  { navn: "Æg, helt, råt", gram: 60 },
  { navn: "Gouda", gram: 30 },
].map(({ navn, gram }) => ({ vare: vareMedNavn(navn)!, gram }));

const MAKREL = vareMedNavn("Makrel, atlantic, rå")!;
const OKSELEVER = vareMedNavn("Okselever, rå")!;
const KALKUN = vareMedNavn("Kalkun, hel, rå")!;
const MOERBRAD = vareMedNavn("Oksekød, mørbrad, rå")!;
const AEG = vareMedNavn("Æg, helt, råt")!;
const LETMAELK = vareMedNavn("Mælk, letmælk 1,5 %")!;
const HAVREGRYN = vareMedNavn("Havregryn, tørrede")!;

export default async function VitaminB12Page() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("vitamin-b12", domainConfig.locale) ||
    getPageData("vitamin-b12", "da")!;

  // Alle tal på siden læses fra den samme tabel, så teksten, tabellerne og
  // FAQ'en ikke kan glide fra hinanden.
  const top = rangliste().filter((v) => v.b100g > 0).slice(0, 8);
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + bIgram(vare, gram),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/vitamin-b12`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/vitamin-b12" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Hvor meget B12-vitamin skal du have om dagen?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {pageData.description}
          </p>
        </div>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Anbefalingen for voksne: {b12Tal(VITAMIN_B12_AI_UG, 0)} µg om dagen
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Voksne kvinder og mænd (AI)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {b12Tal(VITAMIN_B12_AI_UG, 0)} µg
              </dd>
            </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Gennemsnitsbehov (AR)</dt>
                <dd className="text-2xl font-bold tabular-nums dark:text-white">
                  {b12Tal(VITAMIN_B12_AR_UG)} µg
                </dd>
              </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Øvre sikkerhedsgrænse (UL)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                sættes ikke
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            NNR2023 angiver et <em>anbefalet indtagelse</em> (AI) for B12 og
            ikke et gennemsnitsbehov (AR), fordi ingen af biomarkørerne alene
            kan fastslå, hvad den enkelte har brug for — derfor er AI-tallet
            afledt af EU&apos;s fødevaremyndighed (EFSA, 2015c). Det
            gennemsnitlige nordiske indtag er{" "}
            {b12Tal(VITAMIN_B12_NORDISK_INDTAG.lav)}–
            {b12Tal(VITAMIN_B12_NORDISK_INDTAG.hoej)} µg om dagen.
          </p>
        </section>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Hvor meget B12 er der i mad?</h2>
          <p>
            B12 (cobalamin) findes naturligt i animalske fødevarer: kød, lever,
            mejeriprodukter, fisk og skaldyr er hovedkilderne i Norden. Alle{" "}
            {VITAMIN_B12_VARER.length} kilder nedenfor er pr. 100 g, og andelen
            viser, hvor meget portionen dækker af voksnes anbefaling på{" "}
            {b12Tal(VITAMIN_B12_ANBEFALING_UG, 0)} µg:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Portion
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    I portionen
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Andel af {b12Tal(VITAMIN_B12_ANBEFALING_UG, 0)} µg
                  </th>
                </tr>
              </thead>
              <tbody>
                {VITAMIN_B12_VARER.map((vare) => (
                  <tr key={vare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {b12Tal(b100g(vare))} µg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {b12Tal(vare.portionGram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums font-medium text-gray-800 dark:text-gray-100">
                      {b12Tal(bIgram(vare, vare.portionGram))} µg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {b100g(vare) > 0 ? `${b12Tal(andelAfAnbefaling(vare), 0)} %` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Værdierne pr. 100 g er fra {VITAMIN_B12_KILDE.database}, datasættet{" "}
            {VITAMIN_B12_KILDE.dataset}, udgaven {VITAMIN_B12_KILDE.udgave}.
            Portionsstørrelserne er almindelige danske serveringer valgt af os,
            ikke noget kilden opgiver.
          </p>

          <h2>De største kilder pr. 100 g</h2>
          <p>
            Okselever er en særklasse: {b12Tal(b100g(OKSELEVER))} µg pr. 100 g,
            så der skal kun {b12Tal(gramForAnbefaling(OKSELEVER), 0)} g til for
            at dække anbefalingen — men lever spises i små mængder, ikke i
            portioner på 100 g. Den almindelige hverdagskilde med mest B12 er
            fed fisk: makrel har {b12Tal(b100g(MAKREL))} µg pr. 100 g, så en
            portion på {b12Tal(MAKREL.portionGram, 0)} g dækker hele{" "}
            {b12Tal(andelAfAnbefaling(MAKREL), 0)} % af anbefalingen. Skal du
            have {b12Tal(VITAMIN_B12_ANBEFALING_UG, 0)} µg fra almindelige
            madvarer, skal du bruge{" "}
            {b12Tal(gramForAnbefaling(MAKREL), 0)} g makrel,{" "}
            {b12Tal(gramForAnbefaling(KALKUN), 0)} g kalkun,{" "}
            {b12Tal(gramForAnbefaling(MOERBRAD), 0)} g oksekød,{" "}
            {b12Tal(gramForAnbefaling(AEG), 0)} g æg eller{" "}
            {b12Tal(gramForAnbefaling(LETMAELK), 0)} g letmælk.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {b12Tal(VITAMIN_B12_ANBEFALING_UG, 0)} µg
                  </th>
                </tr>
              </thead>
              <tbody>
                {top.map((vare) => (
                  <tr key={vare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {b12Tal(b100g(vare))} µg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {b12Tal(gramForAnbefaling(vare), 0)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan dækker kosterne en hel dag</h2>
          <p>
            Her er en almindelig dag sat sammen af tabellens egne tal —{" "}
            {b12Tal(MAKREL.portionGram, 0)} g makrel, et æg og {b12Tal(30, 0)} g
            gouda:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Mængde
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    B12
                  </th>
                </tr>
              </thead>
              <tbody>
                {DAGS_EKSEMPEL.map(({ vare, gram }) => (
                  <tr key={vare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {b12Tal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {b12Tal(bIgram(vare, gram))} µg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{b12Tal(dagsTotal)} µg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er {b12Tal(dagsTotal)} µg — altså omkring{" "}
            {b12Tal(dagsTotal / VITAMIN_B12_ANBEFALING_UG, 1)} gange anbefalingen
            på {b12Tal(VITAMIN_B12_ANBEFALING_UG, 0)} µg. En dag uden kød, fisk
            eller æg lyder meget, men{" "}
            {b12Tal(gramForAnbefaling(LETMAELK), 0)} g letmælk,{" "}
            {b12Tal(gramForAnbefaling(AEG), 0)} g æg eller{" "}
            {b12Tal(gramForAnbefaling(vareMedNavn("Gouda")!), 0)} g gouda løfter
            også den daglige mængde. Havregryn, rugbrød og de øvrige
            plantefødevarer står på tabellen med nul, fordi B12 naturligt kun
            findes i animalske fødevarer.
          </p>

          <p>
            Vil du se den spiselige dels energi og de andre næringsstoffer, kan
            du bruge{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>{" "}
            eller læg dem sammen med{" "}
            <Link href="/protein-i-madvarer" className="underline font-medium">
              protein i madvarer
            </Link>
            ,{" "}
            <Link href="/jern-i-madvarer" className="underline font-medium">
              jern i madvarer
            </Link>{" "}
            og{" "}
            <Link href="/fedt-i-madvarer" className="underline font-medium">
              fedt i madvarer
            </Link>
            . Læs også om{" "}
            <Link href="/vitamin-d" className="underline font-medium">
              D-vitamin
            </Link>{" "}
            og{" "}
            <Link href="/vitamin-c" className="underline font-medium">
              C-vitamin
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende tal</p>
            <p className="text-blue-700 dark:text-blue-400">
              Madindholdet er gennemsnit fra {VITAMIN_B12_KILDE.database},
              datasættet {VITAMIN_B12_KILDE.dataset}, udgaven{" "}
              {VITAMIN_B12_KILDE.udgave}, pr. 100 g. NNR2023 fandt ingen
              kvalificeret skadevirkning ved høje B12-indtager og sætter derfor
              ingen øvre sikkerhedsgrænse — men siderne siger ikke noget om,
              hvad du personligt skal tage. Er du veganer, vegetarer, gravid
              eller over 70 år, tal med din læge, før du vælger et tilskud.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om B12-vitamin" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/vitamin-b12" />
        </section>
      </div>

      <Sidebar currentHref="/vitamin-b12" adSlotId="vitamin-b12-sidebar" />
    </div>
  );
}
