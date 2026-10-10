import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import ZinkIMadvarerTabel from "@/components/ZinkIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  ZINK_ANBEFALING_MG,
  ZINK_AR_KVINDE_MG,
  ZINK_AR_MAND_MG,
  ZINK_KILDE,
  ZINK_MADVARER,
  ZINK_RI_KVINDE_MG,
  ZINK_RI_MAND_MG,
  ZINK_UL_MG,
  andelAfAnbefaling,
  gramForAnbefaling,
  zink100g,
  zinkEksempler,
  zinkIgram,
  zinkRangliste,
  zinkTal,
  zinkVareMedNavn,
} from "@/lib/zink-i-madvarer";

const TOP_ANTAL = 10;

/**
 * En hel dags zink fra mad, sat sammen af tabellens egne tal. Bruges til at
 * vise hvordan man når NNR2023's anbefaling, og summen læses af `zinkIgram`,
 * så teksten og tabellen ikke kan glide fra hinanden (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Havregryn, tørrede", gram: 100 },
  { navn: "Rugbrød", gram: 100 },
  { navn: "Oksekød, mørbrad", gram: 100 },
  { navn: "Æg, helt, råt", gram: 50 },
  { navn: "Mælk, letmælk 1,5 %", gram: 200 },
  { navn: "Gouda", gram: 30 },
].map(({ navn, gram }) => ({ vare: zinkVareMedNavn(navn)!, gram }));

export async function generateMetadata() {
  return generatePageMetadata("zink-i-madvarer");
}

export default async function ZinkIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("zink-i-madvarer", domainConfig.locale) ||
    getPageData("zink-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden.
  const eksempler = zinkEksempler();
  const top = zinkRangliste().slice(0, TOP_ANTAL);
  const havregryn = zinkVareMedNavn("Havregryn, tørrede")!;
  const oksekod = zinkVareMedNavn("Oksekød, mørbrad")!;
  const gouda = zinkVareMedNavn("Gouda")!;
  const kylling = zinkVareMedNavn("Kylling, hel")!;
  const rugbrod = zinkVareMedNavn("Rugbrød")!;
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + zinkIgram(vare, gram),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/zink-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/zink-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <ZinkIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget zink er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {ZINK_MADVARER.length} madvarer. Her er de
            opslag, danskerne oftest laver — zink pr. 100 g, og hvor mange gram
            der svarer til Nordic Nutrition Recommendations 2023&apos;s anbefaling
            på {zinkTal(ZINK_ANBEFALING_MG, 0)} mg for voksne mænd:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Zink pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {zinkTal(ZINK_ANBEFALING_MG, 0)} mg
                  </th>
                </tr>
              </thead>
              <tbody>
                {eksempler.map((madvare) => (
                  <tr key={madvare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {madvare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {zinkTal(zink100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {zink100g(madvare) > 0
                        ? `${zinkTal(gramForAnbefaling(madvare), 0)} g`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Oksekød (mørbrad) har {zinkTal(zink100g(oksekod))} mg zink pr. 100 g, så en
            portion på {zinkTal(150, 0)} g giver {zinkTal(zinkIgram(oksekod, 150))} mg. Havregryn
            har {zinkTal(zink100g(havregryn))} mg pr. 100 g, en gouda {zinkTal(zink100g(gouda))} mg
            og kylling {zinkTal(zink100g(kylling))} mg. Æg har {zinkTal(zink100g(zinkVareMedNavn("Æg, helt, råt")!))} mg
            pr. 100 g og rugbrød {zinkTal(zink100g(rugbrod))} mg — zink findes altså i både
            animalske og plantemadvarer, men optagelsen fra planter er dårligere.
          </p>

          <h2>Madvarer med mest zink pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste zinkindhold.
            Havregryn ligger øverst med {zinkTal(zink100g(havregryn))} mg pr. 100 g og{" "}
            {zinkTal(andelAfAnbefaling(havregryn), 0)} % af dages anbefaling. NNR2023
            skriver, at kød, mælk og mejeriprodukter, bælgfrugter, æg og korn er de
            nordiske zinkkilder, og at mangel er sjælden i de nordiske og
            baltiske lande.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Zink pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Andel af {zinkTal(ZINK_ANBEFALING_MG, 0)} mg
                  </th>
                </tr>
              </thead>
              <tbody>
                {top.map((madvare) => (
                  <tr key={madvare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {madvare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {zinkTal(zink100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {zinkTal(andelAfAnbefaling(madvare), 0)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan får du {zinkTal(ZINK_ANBEFALING_MG, 0)} mg zink om dagen</h2>
          <p>
            Nordic Nutrition Recommendations 2023 fastsætter et referenceindtag
            (RI) på {zinkTal(ZINK_RI_MAND_MG, 0)} mg om dagen for voksne mænd og{" "}
            {zinkTal(ZINK_RI_KVINDE_MG, 0)} mg for voksne kvinder. Gennemsnitsbehovet
            (AR) er {zinkTal(ZINK_AR_MAND_MG, 0)} mg (mænd) og {zinkTal(ZINK_AR_KVINDE_MG, 0)}{" "}
            mg (kvinder), sat ud fra et fytatindtag på 600 mg om dagen, der svarer
            til en halvraffineret kost. Den øvre sikkerhedsgrænse er{" "}
            {zinkTal(ZINK_UL_MG, 0)} mg — den gælder zink fra kosttilskud. Her er en
            almindelig dag sat sammen af tabellens egne tal:
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
                    Zink
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
                      {zinkTal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {zinkTal(zinkIgram(vare, gram))} mg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{zinkTal(dagsTotal)} mg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er ca. {zinkTal(dagsTotal)} mg — altså over kvinders RI på{" "}
            {zinkTal(ZINK_RI_KVINDE_MG, 0)} mg og tæt på mænds {zinkTal(ZINK_RI_MAND_MG, 0)} mg.
            NNR2023 skriver, at fytinsyre og calcium i kosten nedsætter optagelsen
            af zink, og at en mere plantebaseret kost med chelaterende stoffer
            derfor øger behovet. Mennesker, der spiser få animalske produkter —
            især veganere uden tilskud eller beriget mad — er i risiko for
            manglende zinktilførsel.
          </p>
          <p>
            Vil du se den spiselige dels energi og de andre næringsstoffer, kan du
            bruge{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>
            ,{" "}
            <Link href="/magnesium-i-madvarer" className="underline font-medium">
              magnesium i madvarer
            </Link>
            ,{" "}
            <Link href="/calcium-i-madvarer" className="underline font-medium">
              calcium i madvarer
            </Link>{" "}
            og{" "}
            <Link href="/jern-i-madvarer" className="underline font-medium">
              jern i madvarer
            </Link>
            . Skal mængderne regnes om til gram, hjælper{" "}
            <Link href="/gram-til-dl" className="underline font-medium">
              gram-til-dl-beregneren
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende tal</p>
            <p className="text-blue-700 dark:text-blue-400">
              Tallene er gennemsnit fra {ZINK_KILDE.database}, datasættet{" "}
              {ZINK_KILDE.dataset}, udgaven {ZINK_KILDE.udgave}, pr. 100 g. De
              danske varer du køber i butikken afviger — indholdet afhænger af jordbund,
              forarbejdning og hvordan kornet er malet. Kilden angiver råvarer, ikke
              færdigretter.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om zink i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/zink-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/zink-i-madvarer" adSlotId="zink-i-madvarer-sidebar" />
    </div>
  );
}
