import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FedtIMadvarerTabel from "@/components/FedtIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  MADVARER,
  MADVARER_KILDE,
  fedtEksempler,
  fedtPer100Kcal,
  fedtRangliste,
  fedtTal,
  gramForFedt,
} from "@/lib/fedt-i-madvarer";

const FEDT_MAAL_GRAM = 20;
const TOP_ANTAL = 10;

export async function generateMetadata() {
  return generatePageMetadata("fedt-i-madvarer");
}

export default async function FedtIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("fedt-i-madvarer", domainConfig.locale) ||
    getPageData("fedt-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden (punkt 11).
  const eksempler = fedtEksempler();
  const top = fedtRangliste().slice(0, TOP_ANTAL);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/fedt-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/fedt-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <FedtIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget fedt er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {MADVARER.length} madvarer. Her er de opslag, danskerne oftest
            laver — fedt pr. 100 g og hvor mange gram, der skal til for at nå{" "}
            {FEDT_MAAL_GRAM} g fedt:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Fedt pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {FEDT_MAAL_GRAM} g
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
                      {fedtTal(madvare.fedt100g, 1)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {fedtTal(gramForFedt(madvare, FEDT_MAAL_GRAM), 0)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Et æg har altså {fedtTal(eksempler[0].fedt100g, 1)} g fedt pr. 100 g, mens avocado har{" "}
            {fedtTal(eksempler[1].fedt100g, 1)} g. Det er vægten af den spiselige del, der tæller —
            ikke antallet af stykker.
          </p>

          <h2>Madvarer med mest fedt pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste fedtindhold. Mængden pr. 100 g siger
            dog ikke alt: smør og olie er næsten rent fedt, mens ost og avocado også indeholder
            vand og protein. Kolonnen «Pr. 100 kcal» viser, hvor meget fedt du reelt får for
            energien.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Fedt pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Fedt pr. 100 kcal
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
                      {fedtTal(madvare.fedt100g, 1)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {fedtTal(fedtPer100Kcal(madvare), 1)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan regner du fedtindholdet ud</h2>
          <p>
            Alle tal er pr. 100 g, så du kan altid regne en portion ud selv:
          </p>
          <p>
            <strong>fedt = vægt i gram × (fedt pr. 100 g ÷ 100)</strong>
          </p>
          <p>
            Et eksempel fra tabellen: {fedtTal(eksempler[1].fedt100g, 1)} g fedt pr. 100 g avocado
            betyder, at {fedtTal(gramForFedt(eksempler[1], FEDT_MAAL_GRAM), 0)} g giver{" "}
            {FEDT_MAAL_GRAM} g fedt. Fedt giver 9 kcal pr. gram — mere end både protein og kulhydrat
            (4 kcal pr. gram) — så fedt vejer tungt i kalorieregnskabet. Vil du se portionens
            samlede energi, kan du bruge{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>
            ; skal du se de to andre makronæringsstoffer i den samme madvare, kan du bruge{" "}
            <Link href="/protein-i-madvarer" className="underline font-medium">
              protein i madvarer
            </Link>{" "}
            og{" "}
            <Link href="/kulhydrater-i-madvarer" className="underline font-medium">
              kulhydrater i madvarer
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende tal</p>
            <p className="text-blue-700 dark:text-blue-400">
              Tallene er gennemsnit fra {MADVARER_KILDE.database} og varierer med sort, tilberedning
              og fedtindhold. De viser det <strong>samlede</strong> fedtindhold — ikke hvor meget
              der er mættet, enkeltumættet eller flerumættet, for det opdeler kilden ikke her. Brug
              tallene som et estimat — ikke som præcisionsværdier.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om fedt i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/fedt-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/fedt-i-madvarer" adSlotId="fedt-i-madvarer-sidebar" />
    </div>
  );
}
