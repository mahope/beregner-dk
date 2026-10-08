import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import SaltIMadvarerTabel from "@/components/SaltIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  MADVARER_KILDE,
  SALT_ANBEFALING_G,
  NATRIUM_ANBEFALING_MG,
  SALT_MADVARER,
  andelAfAnbefaling,
  saltEksempler,
  salt100g,
  saltIgram,
  saltRangliste,
  saltTal,
  saltVareMedNavn,
} from "@/lib/salt-i-madvarer";

const TOP_ANTAL = 10;
const RUGBROD_SKIVE = 30;
const SMOER_PORTION = 10;

export async function generateMetadata() {
  return generatePageMetadata("salt-i-madvarer");
}

export default async function SaltIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("salt-i-madvarer", domainConfig.locale) ||
    getPageData("salt-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden (punkt 11).
  const eksempler = saltEksempler();
  const top = saltRangliste().slice(0, TOP_ANTAL);
  const rugbrod = saltVareMedNavn("Rugbrød")!;
  const smoer = saltVareMedNavn("Smør")!;
  const skinke = saltVareMedNavn("Skinke")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/salt-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/salt-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <SaltIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget salt er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {SALT_MADVARER.length} madvarer. Her er de
            opslag, danskerne oftest laver — salt pr. 100 g, og hvor meget af
            WHO&apos;s daglige anbefaling på {saltTal(SALT_ANBEFALING_G, 0)} g salt
            de dækker:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Natrium pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Salt pr. 100 g
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
                      {saltTal(madvare.natrium100g, 0)} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {saltTal(saltIgram(madvare, 100))} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Rugbrød har {saltTal(saltIgram(rugbrod, 100))} g salt pr. 100 g, så én
            skive på ca. {RUGBROD_SKIVE} g giver{" "}
            {saltTal(saltIgram(rugbrod, RUGBROD_SKIVE))} g salt. En skefuld smør
            på {SMOER_PORTION} g giver {saltTal(saltIgram(smoer, SMOER_PORTION))} g.
            Skinke har mest salt af de seks eksempler i tabellen ovenfor,{" "}
            {saltTal(saltIgram(skinke, 100))} g pr. 100 g — først ved{" "}
            {saltTal((SALT_ANBEFALING_G * 100) / salt100g(skinke), 0)} g
            er WHO&apos;s daglige anbefaling nået.
          </p>

          <h2>Madvarer med mest salt pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste natriumindhold,
            omregnet til salt. Skinke ligger øverst med{" "}
            {saltTal(saltIgram(skinke, 100))} g — {saltTal(top[0].natrium100g, 0)}{" "}
            mg natrium — for det er saltet for at holde. Ost fulger efter, mens
            frugt og grøntsager står nederst: en banan har{" "}
            {saltTal(saltIgram(saltVareMedNavn("Banan")!, 100), 1)} g salt pr. 100 g.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Natrium pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Salt pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Andel af {saltTal(SALT_ANBEFALING_G, 0)} g
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
                      {saltTal(madvare.natrium100g, 0)} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {saltTal(saltIgram(madvare, 100))} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {saltTal(andelAfAnbefaling(madvare), 0)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan regner du saltindholdet ud</h2>
          <p>
            Næringstabeller angiver som Regel natrium, mens mærkningen på
            fødevarer angiver salt. Sådan regner du det ene om til det andet:
          </p>
          <p>
            <strong>salt i gram = natrium i mg × 2,5 ÷ 1000</strong>
          </p>
          <p>
            Faktoren 2,5 kommer fra kemi: et molekyle kogesalt (NaCl) vejer 58,5
            g, og deraf er 23 g natrium. Et eksempel fra tabellen: rugbrød med{" "}
            {saltTal(rugbrod.natrium100g, 0)} mg natrium pr. 100 g svarer til{" "}
            {saltTal(saltIgram(rugbrod, 100))} g salt. WHO anbefaler voksne under{" "}
            {saltTal(NATRIUM_ANBEFALING_MG, 0)} mg natrium om dagen, svarende til
            under {saltTal(SALT_ANBEFALING_G, 0)} g salt — ca. en teskefuld.
          </p>
          <p>
            Vil du se den spiselige dels energi og de andre makronæringsstoffer,
            kan du bruge{" "}
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
            </Link>{" "}
            og{" "}
            <Link href="/fedt-i-madvarer" className="underline font-medium">
              fedt i madvarer
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
              Tallene er gennemsnit fra {MADVARER_KILDE.database}, datasættet{" "}
              {MADVARER_KILDE.dataset}, udgaven {MADVARER_KILDE.udgave}, pr. 100 g. De
              danske varer du køber i butikken afviger — rugbrød varierer fra
              knap 1 g til over 1,5 g salt pr. 100 g alt efter opskrift — så
              mærkningen på pakken er det rigtige sted at tjekke for netop din
              vare. Kilden angiver råvarer, ikke færdigretter som en bouillonterning,
              og den angiver natrium, ikke salt.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om salt i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/salt-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/salt-i-madvarer" adSlotId="salt-i-madvarer-sidebar" />
    </div>
  );
}
