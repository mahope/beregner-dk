import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FiberIMadvarerTabel from "@/components/FiberIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  FIBER_ANBEFALING_G,
  FIBER_KILDE,
  FIBER_MADVARER,
  andelAfAnbefaling,
  fiber100g,
  fiberEksempler,
  fiberIgram,
  fiberRangliste,
  fiberTal,
  fiberVareMedNavn,
  gramForAnbefaling,
} from "@/lib/fiber-i-madvarer";

const TOP_ANTAL = 10;

/**
 * En hel dags fiber fra mad, sat sammen af tabellens egne tal. Bruges til at
 * vise hvordan man når WHO's anbefaling, og summen læses af `fiberIgram`, så
 * teksten og tabellen ikke kan glide fra hinanden (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Havregryn, tørrede", gram: 60 },
  { navn: "Rugbrød", gram: 60 },
  { navn: "Kartoffel, kogt", gram: 200 },
  { navn: "Gulerod", gram: 100 },
  { navn: "Æble", gram: 100 },
  { navn: "Broccoli", gram: 100 },
  { navn: "Avocado", gram: 50 },
].map(({ navn, gram }) => ({ vare: fiberVareMedNavn(navn)!, gram }));

export async function generateMetadata() {
  return generatePageMetadata("fiber-i-madvarer");
}

export default async function FiberIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("fiber-i-madvarer", domainConfig.locale) ||
    getPageData("fiber-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden.
  const eksempler = fiberEksempler();
  const top = fiberRangliste().slice(0, TOP_ANTAL);
  const havregryn = fiberVareMedNavn("Havregryn, tørrede")!;
  const rugbrod = fiberVareMedNavn("Rugbrød")!;
  const gulerod = fiberVareMedNavn("Gulerod")!;
  const bulgur = fiberVareMedNavn("Bulgur, tørret")!;
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + fiberIgram(vare, gram),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/fiber-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/fiber-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <FiberIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget fiber er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {FIBER_MADVARER.length} madvarer. Her er de
            opslag, danskerne oftest laver — fiber pr. 100 g, og hvor meget af
            WHO&apos;s daglige anbefaling på {fiberTal(FIBER_ANBEFALING_G, 0)} g
            fiber de dækker:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Fiber pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {fiberTal(FIBER_ANBEFALING_G, 0)} g
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
                      {fiberTal(fiber100g(madvare))} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {fiber100g(madvare) > 0
                        ? `${fiberTal(gramForAnbefaling(madvare), 0)} g`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Havregryn har {fiberTal(fiber100g(havregryn))} g fiber pr. 100 g, så
            en portion på {fiberTal(60, 0)} g giver{" "}
            {fiberTal(fiberIgram(havregryn, 60))} g. En rugbrødsskive på ca.{" "}
            {fiberTal(30, 0)} g giver {fiberTal(fiberIgram(rugbrod, 30))} g, og
            100 g gulerod giver {fiberTal(fiberIgram(gulerod, 100))} g. Kød,
            mejeri og olie bidrager ikke med fiber — det står som 0 i tabellen,
            fordi kilden ikke opgiver fiber for dem.
          </p>

          <h2>Madvarer med mest fiber pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste fiberindhold.
            Fuldkorn og tørrede varer ligger øverst: bulgur har{" "}
            {fiberTal(fiber100g(bulgur))} g pr. 100 g og{" "}
            {fiberTal(andelAfAnbefaling(bulgur), 0)} % af hele dages anbefaling.
            Frugt og grøntsager har mindre pr. 100 g, men man spiser dem i større
            mængder, så de tæller med alligevel.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Fiber pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {fiberTal(FIBER_ANBEFALING_G, 0)} g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Andel af {fiberTal(FIBER_ANBEFALING_G, 0)} g
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
                      {fiberTal(fiber100g(madvare))} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {fiber100g(madvare) > 0
                        ? `${fiberTal(gramForAnbefaling(madvare), 0)} g`
                        : "—"}
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {fiberTal(andelAfAnbefaling(madvare), 0)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan får du {fiberTal(FIBER_ANBEFALING_G, 0)} g fiber om dagen</h2>
          <p>
            WHO anbefaler voksne mindst {fiberTal(FIBER_ANBEFALING_G, 0)} g
            naturligt forekommende kostfibre om dagen. Det er ikke svært at nå,
            hvis kosten indeholder fuldkorn, grøntsager og frugt. Her er en
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
                    Fiber
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
                      {fiberTal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {fiberTal(fiberIgram(vare, gram))} g
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{fiberTal(dagsTotal)} g</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er ca. {fiberTal(dagsTotal, 0)} g — altså omkring WHO&apos;s
            anbefaling. For børn er anbefalingen lavere: 15 g for 2-5-årige, 21 g
            for 6-9-årige og 25 g fra 10 år. Fuldkorn, bælgfrugter, grøntsager,
            frugt og nødder er de bedste kilder.
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
            <Link href="/salt-i-madvarer" className="underline font-medium">
              salt i madvarer
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
              Tallene er gennemsnit fra {FIBER_KILDE.database}, datasættet{" "}
              {FIBER_KILDE.dataset}, udgaven {FIBER_KILDE.udgave}, pr. 100 g. De
              danske varer du køber i butikken afviger — fuldkornsbrød har mere
              fiber end lyst brød, og fiberindholdet står på mærkningen. Kilden
              angiver råvarer, ikke færdigretter.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om fiber i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/fiber-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/fiber-i-madvarer" adSlotId="fiber-i-madvarer-sidebar" />
    </div>
  );
}
