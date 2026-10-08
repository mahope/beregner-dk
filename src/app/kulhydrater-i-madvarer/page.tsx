import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import KulhydraterIMadvarerTabel from "@/components/KulhydraterIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  MADVARER,
  MADVARER_KILDE,
  gramForKulhydrat,
  kulhydratEksempler,
  kulhydratPer100Kcal,
  kulhydratRangliste,
  kulhydratTal,
} from "@/lib/kulhydrater-i-madvarer";

const KULHYDRAT_MAAL_GRAM = 50;
const TOP_ANTAL = 10;

export async function generateMetadata() {
  return generatePageMetadata("kulhydrater-i-madvarer");
}

export default async function KulhydraterIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("kulhydrater-i-madvarer", domainConfig.locale) ||
    getPageData("kulhydrater-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden (punkt 11).
  const eksempler = kulhydratEksempler();
  const top = kulhydratRangliste().slice(0, TOP_ANTAL);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/kulhydrater-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/kulhydrater-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <KulhydraterIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor mange kulhydrater er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {MADVARER.length} madvarer. Her er de opslag, danskerne oftest
            laver — kulhydrat pr. 100 g og hvor mange gram, der skal til for at nå{" "}
            {KULHYDRAT_MAAL_GRAM} g kulhydrat:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Kulhydrat pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {KULHYDRAT_MAAL_GRAM} g
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
                      {kulhydratTal(madvare.kulhydrat100g, 1)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {kulhydratTal(gramForKulhydrat(madvare, KULHYDRAT_MAAL_GRAM), 0)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            En banan har altså {kulhydratTal(eksempler[0].kulhydrat100g, 1)} g kulhydrat pr. 100 g,
            mens kogt kartoffel har {kulhydratTal(eksempler[1].kulhydrat100g, 1)} g. Det er vægten af
            den spiselige del, der tæller — ikke antallet af stykker.
          </p>

          <h2>Madvarer med mest kulhydrat pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste kulhydratindhold. Mængden pr. 100 g
            siger dog ikke alt: sukker og tørret frugt er næsten ren kulhydrat, mens brød og ris
            også indeholder vand og protein. Kolonnen «Pr. 100 kcal» viser, hvor meget kulhydrat du
            reelt får for energien.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Kulhydrat pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Kulhydrat pr. 100 kcal
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
                      {kulhydratTal(madvare.kulhydrat100g, 1)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {kulhydratTal(kulhydratPer100Kcal(madvare), 1)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan regner du kulhydratindholdet ud</h2>
          <p>
            Alle tal er pr. 100 g, så du kan altid regne en portion ud selv:
          </p>
          <p>
            <strong>kulhydrat = vægt i gram × (kulhydrat pr. 100 g ÷ 100)</strong>
          </p>
          <p>
            Et eksempel fra tabellen: {kulhydratTal(eksempler[1].kulhydrat100g, 1)} g kulhydrat pr.
            100 g kogt kartoffel betyder, at {kulhydratTal(gramForKulhydrat(eksempler[1], KULHYDRAT_MAAL_GRAM), 0)} g
            giver {KULHYDRAT_MAAL_GRAM} g kulhydrat. Vil du i stedet finde ud af, hvor mange kalorier
            portionen har, kan du bruge{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>
            ; skal du se proteinindholdet i den samme madvare, kan du bruge{" "}
            <Link href="/protein-i-madvarer" className="underline font-medium">
              protein i madvarer
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende tal</p>
            <p className="text-blue-700 dark:text-blue-400">
              Tallene er gennemsnit fra {MADVARER_KILDE.database} og varierer med sort, tilberedning
              og fedtindhold. Tallene dækker det samlede kulhydratindhold — både sukker, stivelse og
              kostfibre — og siger altså ikke, hvor meget af det der er sukker. Brug tallene som et
              estimat — ikke som præcisionsværdier.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om kulhydrater i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/kulhydrater-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/kulhydrater-i-madvarer" adSlotId="kulhydrater-i-madvarer-sidebar" />
    </div>
  );
}
