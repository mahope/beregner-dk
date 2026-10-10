import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import KaliumIMadvarerTabel from "@/components/KaliumIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  KALIUM_AI_MG,
  KALIUM_ANBEFALING_MG,
  KALIUM_AR_MG,
  KALIUM_KILDE,
  KALIUM_MADVARER,
  andelAfAnbefaling,
  gramForAnbefaling,
  kalium100g,
  kaliumEksempler,
  kaliumIgram,
  kaliumRangliste,
  kaliumTal,
  kaliumVareMedNavn,
} from "@/lib/kalium-i-madvarer";

const TOP_ANTAL = 10;

/**
 * En hel dags kalium fra mad, sat sammen af tabellens egne tal. Bruges til at
 * vise hvordan man når NNR2023's anbefaling, og summen læses af `kaliumIgram`,
 * så teksten og tabellen ikke kan glide fra hinanden (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Havregryn, tørrede", gram: 100 },
  { navn: "Banan", gram: 120 },
  { navn: "Kartoffel, bagt", gram: 250 },
  { navn: "Spinat", gram: 100 },
  { navn: "Tomat", gram: 100 },
  { navn: "Avocado", gram: 50 },
  { navn: "Mælk, letmælk 1,5 %", gram: 200 },
].map(({ navn, gram }) => ({ vare: kaliumVareMedNavn(navn)!, gram }));

export async function generateMetadata() {
  return generatePageMetadata("kalium-i-madvarer");
}

export default async function KaliumIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("kalium-i-madvarer", domainConfig.locale) ||
    getPageData("kalium-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden.
  const eksempler = kaliumEksempler();
  const top = kaliumRangliste().slice(0, TOP_ANTAL);
  const banan = kaliumVareMedNavn("Banan")!;
  const kartoffel = kaliumVareMedNavn("Kartoffel, bagt")!;
  const avocado = kaliumVareMedNavn("Avocado")!;
  const spinat = kaliumVareMedNavn("Spinat")!;
  const havregryn = kaliumVareMedNavn("Havregryn, tørrede")!;
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + kaliumIgram(vare, gram),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/kalium-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/kalium-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <KaliumIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget kalium er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {KALIUM_MADVARER.length} madvarer. Her er de
            opslag, danskerne oftest laver — kalium pr. 100 g, og hvor mange gram
            der svarer til Nordic Nutrition Recommendations 2023&apos;s anbefaling
            på {kaliumTal(KALIUM_ANBEFALING_MG)} mg om dagen:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Kalium pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {kaliumTal(KALIUM_ANBEFALING_MG)} mg
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
                      {kaliumTal(kalium100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {kalium100g(madvare) > 0
                        ? `${kaliumTal(gramForAnbefaling(madvare), 0)} g`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            En banan har {kaliumTal(kalium100g(banan))} mg kalium pr. 100 g, så en
            mellemstor banan på {kaliumTal(120, 0)} g giver {kaliumTal(kaliumIgram(banan, 120))} mg.
            En bagt kartoffel har {kaliumTal(kalium100g(kartoffel))} mg pr. 100 g, avocado{" "}
            {kaliumTal(kalium100g(avocado))} mg og spinat {kaliumTal(kalium100g(spinat))} mg.
            Havregryn har {kaliumTal(kalium100g(havregryn))} mg pr. 100 g — kalium findes
            altså både i frugt, grøntsager, korn og mejeriprodukter.
          </p>

          <h2>Madvarer med mest kalium pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste kaliumindhold.
            Tørret banan ligger øverst med {kaliumTal(kalium100g(kaliumRangliste()[0]))} mg pr. 100 g, men
            de færreste spiser 100 g tørret frugt ad gangen. NNR2023 peger på, at
            kartofler, frugt, grøntsager, korn og kornprodukter, mælk og
            mejeriprodukter samt kød er de vigtigste kaliumkilder.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Kalium pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Andel af {kaliumTal(KALIUM_ANBEFALING_MG)} mg
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
                      {kaliumTal(kalium100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {kaliumTal(andelAfAnbefaling(madvare), 0)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan får du {kaliumTal(KALIUM_ANBEFALING_MG)} mg kalium om dagen</h2>
          <p>
            Nordic Nutrition Recommendations 2023 fastsætter et tilstrækkeligt
            indtag (AI) på {kaliumTal(KALIUM_AI_MG)} mg om dagen for voksne kvinder
            og mænd. Det foreløbige gennemsnitsbehov (AR) er {kaliumTal(KALIUM_AR_MG)} mg.
            Der er ingen øvre sikkerhedsgrænse for kalium fra kosten — overskud
            udskilles normalt gennem nyrerne. Her er en almindelig dag sat sammen
            af tabellens egne tal:
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
                    Kalium
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
                      {kaliumTal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {kaliumTal(kaliumIgram(vare, gram))} mg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{kaliumTal(dagsTotal)} mg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er ca. {kaliumTal(dagsTotal)} mg — altså lidt over anbefalingen på{" "}
            {kaliumTal(KALIUM_AI_MG)} mg. NNR2023 skriver, at et indtag over{" "}
            {kaliumTal(KALIUM_AI_MG)} mg hænger sammen med lavere risiko for blodprop
            i hjernen og et lavere blodtryk hos personer med forhøjet blodtryk.
            Kaliummangel på grund af lavt indtag er sjælden, men personer med nedsat
            nyrefunktion skal være opmærksomme på for højt kalium i blodet og følge
            lægens råd.
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
              Tallene er gennemsnit fra {KALIUM_KILDE.database}, datasættet{" "}
              {KALIUM_KILDE.dataset}, udgaven {KALIUM_KILDE.udgave}, pr. 100 g. De
              danske varer du køber i butikken afviger — indholdet afhænger af
              jordbund, forarbejdning og hvordan maden er tilberedt. Kilden
              angiver råvarer, ikke færdigretter.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om kalium i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/kalium-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/kalium-i-madvarer" adSlotId="kalium-i-madvarer-sidebar" />
    </div>
  );
}
