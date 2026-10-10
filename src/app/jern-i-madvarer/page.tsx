import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import JernIMadvarerTabel from "@/components/JernIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  JERN_ANBEFALING_MG,
  JERN_AR_KVINDE_MG,
  JERN_AR_MAND_MG,
  JERN_KILDE,
  JERN_MADVARER,
  JERN_RI_KVINDE_MG,
  JERN_RI_MAND_MG,
  andelAfAnbefaling,
  gramForAnbefaling,
  jern100g,
  jernEksempler,
  jernIgram,
  jernRangliste,
  jernTal,
  jernVareMedNavn,
} from "@/lib/jern-i-madvarer";

const TOP_ANTAL = 10;

/**
 * En hel dags jern fra mad, sat sammen af tabellens egne tal. Bruges til at
 * vise hvordan man når NNR2023's anbefaling, og summen læses af `jernIgram`,
 * så teksten og tabellen ikke kan glide fra hinanden (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Havregryn, tørrede", gram: 60 },
  { navn: "Rugbrød", gram: 60 },
  { navn: "Æg, helt, råt", gram: 55 },
  { navn: "Oksekød, mørbrad", gram: 100 },
  { navn: "Spinat", gram: 100 },
  { navn: "Broccoli", gram: 150 },
].map(({ navn, gram }) => ({ vare: jernVareMedNavn(navn)!, gram }));

export async function generateMetadata() {
  return generatePageMetadata("jern-i-madvarer");
}

export default async function JernIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("jern-i-madvarer", domainConfig.locale) ||
    getPageData("jern-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden.
  const eksempler = jernEksempler();
  const top = jernRangliste().slice(0, TOP_ANTAL);
  const havregryn = jernVareMedNavn("Havregryn, tørrede")!;
  const aeg = jernVareMedNavn("Æg, helt, råt")!;
  const spinat = jernVareMedNavn("Spinat")!;
  const paere = jernVareMedNavn("Pære")!;
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + jernIgram(vare, gram),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/jern-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/jern-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <JernIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget jern er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {JERN_MADVARER.length} madvarer. Her er de
            opslag, danskerne oftest laver — jern pr. 100 g, og hvor meget af
            Nordic Nutrition Recommendations 2023&apos;s anbefalede indtagelse på{" "}
            {jernTal(JERN_ANBEFALING_MG, 0)} mg for kvinder de dækker:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Jern pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {jernTal(JERN_ANBEFALING_MG, 0)} mg
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
                      {jernTal(jern100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {jern100g(madvare) > 0
                        ? `${jernTal(gramForAnbefaling(madvare), 0)} g`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Havregryn har {jernTal(jern100g(havregryn))} mg jern pr. 100 g, så en
            portion på {jernTal(60, 0)} g giver{" "}
            {jernTal(jernIgram(havregryn, 60))} mg. Et knækkeræg på{" "}
            {jernTal(55, 0)} g giver {jernTal(jernIgram(aeg, 55))} mg, og 100 g
            spinat giver {jernTal(jernIgram(spinat, 100))} mg. Frugt giver kun
            lidt jern — en {jernTal(150, 0)} g pære indeholder{" "}
            {jernTal(jernIgram(paere, 150))} mg — så de mest jernrige kilder
            på tabellen er brød, havregryn, kød og spinat.
          </p>

          <h2>Madvarer med mest jern pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste jernindhold.
            Havregryn ligger øverst med {jernTal(jern100g(havregryn))} mg pr.
            100 g og{" "}
            {jernTal(andelAfAnbefaling(havregryn), 0)} % af kvinders
            anbefalede dagsindtag. Brød og gryn står for en stor del af jernet i
            den danske kost, mens kød indeholder jern i den form kroppen bedst
            optager.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Jern pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Andel af {jernTal(JERN_ANBEFALING_MG, 0)} mg
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
                      {jernTal(jern100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {jernTal(andelAfAnbefaling(madvare), 0)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan får du {jernTal(JERN_ANBEFALING_MG, 0)} mg jern om dagen</h2>
          <p>
            Nordic Nutrition Recommendations 2023 anbefaler {jernTal(JERN_RI_KVINDE_MG, 0)} mg
            om dagen for voksne kvinder og {jernTal(JERN_RI_MAND_MG, 0)} mg for voksne
            mænd — forskellen kommer af menstruationen. Gennemsnitsbehovet er
            henholdsvis {jernTal(JERN_AR_KVINDE_MG, 0)} og {jernTal(JERN_AR_MAND_MG, 0)}{" "}
            mg. Her er en almindelig dag sat sammen af tabellens egne tal:
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
                    Jern
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
                      {jernTal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {jernTal(jernIgram(vare, gram))} mg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{jernTal(dagsTotal)} mg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er ca. {jernTal(dagsTotal, 1)} mg — altså over kvinders
            anbefalede dagsindtag. NNR2023 skriver at kroppen typisk optager
            10–15 % jernet fra en blandet kost, og at optagelsen opreguleres når
            jernlagrene er lave. Kød- og fiskjern (hæm-jern) optages bedre end
            plantejern (ikke-hæm-jern), og C-vitamin øger optagelsen, mens te,
            kaffe og grove kornstoffer dæmper den. Derfor hjælper det at
            kombinere grøntsager og korn med kød eller peberfrugt.
          </p>
          <p>
            Vil du se den spiselige dels energi og de andre næringsstoffer, kan du
            bruge{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>
            ,{" "}
            <Link href="/protein-i-madvarer" className="underline font-medium">
              protein i madvarer
            </Link>
            ,{" "}
            <Link href="/kulhydrater-i-madvarer" className="underline font-medium">
              kulhydrater i madvarer
            </Link>
            ,{" "}
            <Link href="/fedt-i-madvarer" className="underline font-medium">
              fedt i madvarer
            </Link>{" "}
            og{" "}
            <Link href="/fiber-i-madvarer" className="underline font-medium">
              fiber i madvarer
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
              Tallene er gennemsnit fra {JERN_KILDE.database}, datasættet{" "}
              {JERN_KILDE.dataset}, udgaven {JERN_KILDE.udgave}, pr. 100 g. De
              danske varer du køber i butikken afviger — brød varierer efter
              meltype, og jernindholdet står ikke på mærkningen i Danmark. Kilden
              angiver råvarer, ikke færdigretter.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om jern i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/jern-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/jern-i-madvarer" adSlotId="jern-i-madvarer-sidebar" />
    </div>
  );
}
