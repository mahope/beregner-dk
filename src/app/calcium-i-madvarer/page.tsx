import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import CalciumIMadvarerTabel from "@/components/CalciumIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  CALCIUM_ANBEFALING_MG,
  CALCIUM_AR_MG,
  CALCIUM_KILDE,
  CALCIUM_MADVARER,
  CALCIUM_RI_MG,
  CALCIUM_UL_MG,
  andelAfAnbefaling,
  calcium100g,
  calciumEksempler,
  calciumIgram,
  calciumRangliste,
  calciumTal,
  calciumVareMedNavn,
  gramForAnbefaling,
} from "@/lib/calcium-i-madvarer";

const TOP_ANTAL = 10;

/**
 * En hel dags calcium fra mad, sat sammen af tabellens egne tal. Bruges til at
 * vise hvordan man når NNR2023's anbefaling, og summen læses af `calciumIgram`,
 * så teksten og tabellen ikke kan glide fra hinanden (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Mælk, letmælk 1,5 %", gram: 500 },
  { navn: "Yoghurt, natur", gram: 100 },
  { navn: "Gouda", gram: 30 },
  { navn: "Rugbrød", gram: 60 },
  { navn: "Broccoli", gram: 100 },
].map(({ navn, gram }) => ({ vare: calciumVareMedNavn(navn)!, gram }));

export async function generateMetadata() {
  return generatePageMetadata("calcium-i-madvarer");
}

export default async function CalciumIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("calcium-i-madvarer", domainConfig.locale) ||
    getPageData("calcium-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden.
  const eksempler = calciumEksempler();
  const top = calciumRangliste().slice(0, TOP_ANTAL);
  const letmaelk = calciumVareMedNavn("Mælk, letmælk 1,5 %")!;
  const gouda = calciumVareMedNavn("Gouda")!;
  const yoghurt = calciumVareMedNavn("Yoghurt, natur")!;
  const banan = calciumVareMedNavn("Banan")!;
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + calciumIgram(vare, gram),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/calcium-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/calcium-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <CalciumIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget calcium er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {CALCIUM_MADVARER.length} madvarer. Her er de
            opslag, danskerne oftest laver — calcium pr. 100 g, og hvor mange gram
            der svarer til Nordic Nutrition Recommendations 2023&apos;s anbefalede
            indtagelse på {calciumTal(CALCIUM_ANBEFALING_MG, 0)} mg:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Calcium pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {calciumTal(CALCIUM_ANBEFALING_MG, 0)} mg
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
                      {calciumTal(calcium100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {calcium100g(madvare) > 0
                        ? `${calciumTal(gramForAnbefaling(madvare), 0)} g`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Letmælk har {calciumTal(calcium100g(letmaelk))} mg calcium pr. 100 g,
            så et glas på {calciumTal(200, 0)} g giver{" "}
            {calciumTal(calciumIgram(letmaelk, 200))} mg. Halvliteren står for{" "}
            {calciumTal(calciumIgram(letmaelk, 500))} mg, og en skive gouda på{" "}
            {calciumTal(30, 0)} g giver {calciumTal(calciumIgram(gouda, 30))} mg.
            Frugt giver kun lidt — en {calciumTal(150, 0)} g banan indeholder{" "}
            {calciumTal(calciumIgram(banan, 150))} mg — så calcium skal primært
            komme fra mælk, ost og yoghurt.
          </p>

          <h2>Madvarer med mest calcium pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste calciumindhold.
            Gouda ligger øverst med {calciumTal(calcium100g(gouda), 0)} mg pr.
            100 g og {calciumTal(andelAfAnbefaling(gouda), 0)} % af dages
            anbefaling. NNR2023 skriver, at mælk og mejeriprodukter er den største
            calciums kilde i de nordiske lande — ost tæller med, selvom det også
            indeholder salt.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Calcium pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Andel af {calciumTal(CALCIUM_ANBEFALING_MG, 0)} mg
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
                      {calciumTal(calcium100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {calciumTal(andelAfAnbefaling(madvare), 0)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan får du {calciumTal(CALCIUM_ANBEFALING_MG, 0)} mg calcium om dagen</h2>
          <p>
            Nordic Nutrition Recommendations 2023 anbefaler {calciumTal(CALCIUM_RI_MG, 0)} mg
            om dagen for voksne kvinder og mænd, og gennemsnitsbehovet er{" "}
            {calciumTal(CALCIUM_AR_MG, 0)} mg. Den øvre sikkerhedsgrænse for
            tilskud og kost tilsammen er {calciumTal(CALCIUM_UL_MG, 0)} mg. Her er
            en almindelig dag sat sammen af tabellens egne tal:
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
                    Calcium
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
                      {calciumTal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {calciumTal(calciumIgram(vare, gram))} mg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{calciumTal(dagsTotal)} mg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er ca. {calciumTal(dagsTotal, 1)} mg — altså over dages
            anbefaling. NNR2023 peger på, at kroppens optagelse af calcium afhænger
            af D-vitamin, og at calcium i mælk og ost optages bedre end calcium fra
            grøntsager. Grupper der typisk får for lidt er børn, unge,
            kvinder efter menopause og veganere uden berigede varer.
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
            <Link href="/jern-i-madvarer" className="underline font-medium">
              jern i madvarer
            </Link>{" "}
            og{" "}
            <Link href="/vitamin-d" className="underline font-medium">
              D-vitamin
            </Link>{" "}
            (D-vitamin styrer optagelsen af calcium). Skal mængderne regnes om til
            gram, hjælper{" "}
            <Link href="/gram-til-dl" className="underline font-medium">
              gram-til-dl-beregneren
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende tal</p>
            <p className="text-blue-700 dark:text-blue-400">
              Tallene er gennemsnit fra {CALCIUM_KILDE.database}, datasættet{" "}
              {CALCIUM_KILDE.dataset}, udgaven {CALCIUM_KILDE.udgave}, pr. 100 g. De
              danske varer du køber i butikken afviger — ost og yoghurt varierer
              efter fedtgrad og fremstilling, og calciumindholdet står ikke på
              mærkningen i Danmark. Kilden angiver råvarer, ikke færdigretter.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om calcium i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/calcium-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/calcium-i-madvarer" adSlotId="calcium-i-madvarer-sidebar" />
    </div>
  );
}
