import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import ProteinIMadvarerTabel from "@/components/ProteinIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  MADVARER,
  MADVARER_KILDE,
  gramForProtein,
  proteinEksempler,
  proteinPer100Kcal,
  proteinRangliste,
  proteinTal,
} from "@/lib/protein-i-madvarer";

const PROTEIN_MAAL_GRAM = 20;
const TOP_ANTAL = 10;

export async function generateMetadata() {
  return generatePageMetadata("protein-i-madvarer");
}

export default async function ProteinIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("protein-i-madvarer", domainConfig.locale) ||
    getPageData("protein-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden (punkt 11).
  const eksempler = proteinEksempler();
  const top = proteinRangliste().slice(0, TOP_ANTAL);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/protein-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/protein-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <ProteinIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget protein er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {MADVARER.length} madvarer. Her er de opslag, danskerne oftest
            laver — protein pr. 100 g og hvor mange gram, der skal til for at nå{" "}
            {PROTEIN_MAAL_GRAM} g protein:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Protein pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {PROTEIN_MAAL_GRAM} g
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
                      {proteinTal(madvare.protein100g, 1)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {proteinTal(gramForProtein(madvare, PROTEIN_MAAL_GRAM), 0)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Et æg har altså {proteinTal(eksempler[0].protein100g, 1)} g protein pr. 100 g, mens
            kylling har {proteinTal(eksempler[1].protein100g, 1)} g. Det er vægten af den spiselige
            del, der tæller — ikke antallet af stykker.
          </p>

          <h2>Madvarer med mest protein pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste proteinindhold. Mængden pr. 100 g
            siger dog ikke alt: en madvare med meget fedt har også mange kalorier, så kolonnen
            «Pr. 100 kcal» viser, hvor meget protein du reelt får for energien.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Protein pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Protein pr. 100 kcal
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
                      {proteinTal(madvare.protein100g, 1)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {proteinTal(proteinPer100Kcal(madvare), 1)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan regner du proteinindholdet ud</h2>
          <p>
            Alle tal er pr. 100 g, så du kan altid regne en portion ud selv:
          </p>
          <p>
            <strong>protein = vægt i gram × (protein pr. 100 g ÷ 100)</strong>
          </p>
          <p>
            Et eksempel fra tabellen: {proteinTal(eksempler[1].protein100g, 1)} g protein pr. 100 g
            kylling betyder, at {proteinTal(gramForProtein(eksempler[1], PROTEIN_MAAL_GRAM), 0)} g
            giver {PROTEIN_MAAL_GRAM} g protein. Vil du i stedet finde ud af, hvor meget protein du
            har brug for på en dag, kan du bruge{" "}
            <Link href="/proteinbehov" className="underline font-medium">
              proteinbehov-beregneren
            </Link>
            ; skal du regne kalorier for den samme portion, kan du bruge{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende tal</p>
            <p className="text-blue-700 dark:text-blue-400">
              Tallene er gennemsnit fra {MADVARER_KILDE.database} og varierer med sort, tilberedning
              og fedtindhold. Kylling uden skind har mindre fedt og dermed mere protein pr. 100 kcal
              end kylling med skind. Brug tallene som et estimat — ikke som præcisionsværdier.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om protein i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/protein-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/protein-i-madvarer" adSlotId="protein-i-madvarer-sidebar" />
    </div>
  );
}
