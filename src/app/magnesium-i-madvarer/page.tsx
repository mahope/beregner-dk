import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import MagnesiumIMadvarerTabel from "@/components/MagnesiumIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  MAGNESIUM_AI_KVINDE_MG,
  MAGNESIUM_AI_MAND_MG,
  MAGNESIUM_ANBEFALING_MG,
  MAGNESIUM_AR_KVINDE_MG,
  MAGNESIUM_AR_MAND_MG,
  MAGNESIUM_KILDE,
  MAGNESIUM_MADVARER,
  MAGNESIUM_UL_MG,
  andelAfAnbefaling,
  gramForAnbefaling,
  magnesium100g,
  magnesiumEksempler,
  magnesiumIgram,
  magnesiumRangliste,
  magnesiumTal,
  magnesiumVareMedNavn,
} from "@/lib/magnesium-i-madvarer";

const TOP_ANTAL = 10;

/**
 * En hel dags magnesium fra mad, sat sammen af tabellens egne tal. Bruges til
 * at vise hvordan man når NNR2023's anbefaling, og summen læses af
 * `magnesiumIgram`, så teksten og tabellen ikke kan glide fra hinanden
 * (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Havregryn, tørrede", gram: 100 },
  { navn: "Rugbrød", gram: 100 },
  { navn: "Spinat", gram: 100 },
  { navn: "Banan", gram: 100 },
  { navn: "Mælk, letmælk 1,5 %", gram: 200 },
  { navn: "Chokolade, mælke", gram: 20 },
].map(({ navn, gram }) => ({ vare: magnesiumVareMedNavn(navn)!, gram }));

export async function generateMetadata() {
  return generatePageMetadata("magnesium-i-madvarer");
}

export default async function MagnesiumIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("magnesium-i-madvarer", domainConfig.locale) ||
    getPageData("magnesium-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden.
  const eksempler = magnesiumEksempler();
  const top = magnesiumRangliste().slice(0, TOP_ANTAL);
  const havregryn = magnesiumVareMedNavn("Havregryn, tørrede")!;
  const spinat = magnesiumVareMedNavn("Spinat")!;
  const banan = magnesiumVareMedNavn("Banan")!;
  const avocado = magnesiumVareMedNavn("Avocado")!;
  const chokolade = magnesiumVareMedNavn("Chokolade, mælke")!;
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + magnesiumIgram(vare, gram),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/magnesium-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/magnesium-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <MagnesiumIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget magnesium er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {MAGNESIUM_MADVARER.length} madvarer. Her er de
            opslag, danskerne oftest laver — magnesium pr. 100 g, og hvor mange gram
            der svarer til Nordic Nutrition Recommendations 2023&apos;s tilstrækkelige
            indtag på {magnesiumTal(MAGNESIUM_ANBEFALING_MG, 0)} mg for voksne mænd:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Magnesium pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {magnesiumTal(MAGNESIUM_ANBEFALING_MG, 0)} mg
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
                      {magnesiumTal(magnesium100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {magnesium100g(madvare) > 0
                        ? `${magnesiumTal(gramForAnbefaling(madvare), 0)} g`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Havregryn har {magnesiumTal(magnesium100g(havregryn), 0)} mg magnesium pr. 100 g, så
            en portion på {magnesiumTal(60, 0)} g giver{" "}
            {magnesiumTal(magnesiumIgram(havregryn, 60))} mg. Spinat har{" "}
            {magnesiumTal(magnesium100g(spinat), 0)} mg pr. 100 g, en banan{" "}
            {magnesiumTal(magnesium100g(banan), 0)} mg og en avocado{" "}
            {magnesiumTal(magnesium100g(avocado), 0)} mg. Mælkechokolade har{" "}
            {magnesiumTal(magnesium100g(chokolade), 0)} mg pr. 100 g, fordi kakaobønner er
            rige på magnesium — men den kommer med sukker og fedt, så den tæller ikke som en
            sund kilde.
          </p>

          <h2>Madvarer med mest magnesium pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste magnesiumindhold.
            Havregryn ligger øverst med {magnesiumTal(magnesium100g(havregryn), 0)} mg pr.
            100 g og {magnesiumTal(andelAfAnbefaling(havregryn), 0)} % af dages
            anbefaling. NNR2023 skriver, at fuldkorn, mælk, grøntsager og bælgfrugter er
            de nordiske magnesiumkilder, og at indholdet er særligt højt i kakao, nødder
            og frø.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Magnesium pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Andel af {magnesiumTal(MAGNESIUM_ANBEFALING_MG, 0)} mg
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
                      {magnesiumTal(magnesium100g(madvare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {magnesiumTal(andelAfAnbefaling(madvare), 0)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan får du {magnesiumTal(MAGNESIUM_ANBEFALING_MG, 0)} mg magnesium om dagen</h2>
          <p>
            Nordic Nutrition Recommendations 2023 fastsætter et tilstrækkeligt indtag
            på {magnesiumTal(MAGNESIUM_AI_MAND_MG, 0)} mg om dagen for voksne mænd og{" "}
            {magnesiumTal(MAGNESIUM_AI_KVINDE_MG, 0)} mg for voksne kvinder. Det
            foreløbige gennemsnitsbehov er {magnesiumTal(MAGNESIUM_AR_MAND_MG, 0)} mg
            (mænd) og {magnesiumTal(MAGNESIUM_AR_KVINDE_MG, 0)} mg (kvinder). Den øvre
            sikkerhedsgrænse er {magnesiumTal(MAGNESIUM_UL_MG, 0)} mg, men den gælder
            kun magnesium i kosttilskud — ikke magnesium fra mad. Her er en almindelig
            dag sat sammen af tabellens egne tal:
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
                    Magnesium
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
                      {magnesiumTal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {magnesiumTal(magnesiumIgram(vare, gram))} mg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{magnesiumTal(dagsTotal)} mg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er ca. {magnesiumTal(dagsTotal, 0)} mg — altså over dages anbefaling.
            NNR2023 peger på, at en kost med meget fytinsyre og fosfat nedsætter
            optagelsen af magnesium, men at den kliniske betydning er usikker, og at
            nyerne regulerer overskuddet. Magnesiummangel er sjælden og kommer
            normalt som følge af sygdom eller medicin.
          </p>
          <p>
            Vil du se den spiselige dels energi og de andre næringsstoffer, kan du
            bruge{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>
            ,{" "}
            <Link href="/calcium-i-madvarer" className="underline font-medium">
              calcium i madvarer
            </Link>
            ,{" "}
            <Link href="/jern-i-madvarer" className="underline font-medium">
              jern i madvarer
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
              Tallene er gennemsnit fra {MAGNESIUM_KILDE.database}, datasættet{" "}
              {MAGNESIUM_KILDE.dataset}, udgaven {MAGNESIUM_KILDE.udgave}, pr. 100 g. De
              danske varer du køber i butikken afviger — indholdet afhænger af jordbund,
              forarbejdning og hvordan kornet er malet. Kilden angiver råvarer, ikke
              færdigretter.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om magnesium i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/magnesium-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/magnesium-i-madvarer" adSlotId="magnesium-i-madvarer-sidebar" />
    </div>
  );
}
