import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import SukkerIMadvarerTabel from "@/components/SukkerIMadvarerTabel";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  SUKKER_MADVARER,
  SUKKER_UDEN_KILDE_NAVN,
  MADVARER_KILDE,
  sukkerEksempler,
  sukkerIgram,
  sukkerPer100Kcal,
  sukkerRangliste,
  sukkerTal,
  sukkerVareMedNavn,
  gramForSukker,
} from "@/lib/sukker-i-madvarer";

const SUKKER_MAAL_GRAM = 20;
const TOP_ANTAL = 10;

export async function generateMetadata() {
  return generatePageMetadata("sukker-i-madvarer");
}

export default async function SukkerIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("sukker-i-madvarer", domainConfig.locale) ||
    getPageData("sukker-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel som værktøjet, så teksten og
  // tabellen ikke kan glide fra hinanden (punkt 11).
  const eksempler = sukkerEksempler();
  const top = sukkerRangliste().slice(0, TOP_ANTAL);
  const banan = eksempler[1];
  const aeble = eksempler[2];
  const vandmelon = eksempler[3];
  const chokolade = sukkerVareMedNavn("Chokolade, mælke")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/sukker-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/sukker-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <SukkerIMadvarerTabel />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget sukker er der i …?</h2>
          <p>
            Tabellen ovenfor dækker {SUKKER_MADVARER.length} madvarer. Her er de
            opslag, danskerne oftest laver — sukker pr. 100 g og hvor mange gram,
            der skal til for at nå {SUKKER_MAAL_GRAM} g sukker:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Sukker pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {SUKKER_MAAL_GRAM} g
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
                      {sukkerTal(madvare.sukker100g, 1)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {madvare.sukker100g > 0
                        ? `${sukkerTal(gramForSukker(madvare, SUKKER_MAAL_GRAM), 0)} g`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            En banan har altså {sukkerTal(banan.sukker100g, 1)} g sukker pr. 100
            g, mens et æble har {sukkerTal(aeble.sukker100g, 1)} g. Sukkerkigger
            på vægten af den spiselige del, ikke antallet af stykker: en banan
            vejer typisk ca. 120 g, og så er tallet{" "}
            {sukkerTal(sukkerIgram(banan, 120), 0)} g.
          </p>

          <h2>Madvarer med mest sukker pr. 100 g</h2>
          <p>
            De {TOP_ANTAL} madvarer i tabellen med det højeste sukkerindhold.
            Sukker står øverst, for det er sukker — {sukkerTal(top[0].sukker100g, 1)} g
            pr. 100 g. Kolonnen «Pr. 100 kcal» viser, hvor meget sukker du får for
            den energi, du samtidig indtager, og der kommer en overraskelse:
            vandmelon har {sukkerTal(sukkerPer100Kcal(vandmelon), 1)} g sukker pr.
            100 kcal mod chokoladens {sukkerTal(sukkerPer100Kcal(chokolade), 1)} g,
            for chokoladens energi kommer mest fra fedtet.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Sukker pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Sukker pr. 100 kcal
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
                      {sukkerTal(madvare.sukker100g, 1)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {sukkerTal(sukkerPer100Kcal(madvare), 1)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan regner du sukkerindholdet ud</h2>
          <p>
            Alle tal er pr. 100 g, så du kan altid regne en portion ud selv:
          </p>
          <p>
            <strong>sukker = vægt i gram × (sukker pr. 100 g ÷ 100)</strong>
          </p>
          <p>
            Et eksempel fra tabellen: {sukkerTal(vandmelon.sukker100g, 1)} g sukker
            pr. 100 g vandmelon betyder, at {sukkerTal(gramForSukker(vandmelon, SUKKER_MAAL_GRAM), 0)} g
            giver {SUKKER_MAAL_GRAM} g sukker — fordi vandmelon mest er vand. Vil du
            se portionens samlede energi og de andre makronæringsstoffer, kan du
            bruge{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>
            ,{" "}
            <Link href="/kulhydrater-i-madvarer" className="underline font-medium">
              kulhydrater i madvarer
            </Link>
            ,{" "}
            <Link href="/protein-i-madvarer" className="underline font-medium">
              protein i madvarer
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
              Tallene er gennemsnit fra {MADVARER_KILDE.database} og viser det{" "}
              <strong>samlede</strong> sukkerindhold — både sukker, naturen selv
              har lagt i frugt og mælk, og sukker, der er tilsat. Derfor står
              mælk i tabellen, selvom den ikke er sød: der er sukker i laktosen.
              Kilden opgiver ikke sukker for {SUKKER_UDEN_KILDE_NAVN.toLowerCase()},
              så den står ikke med her. Brug tallene som et estimat — ikke som
              præcisionsværdier.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om sukker i mad" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/sukker-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/sukker-i-madvarer" adSlotId="sukker-i-madvarer-sidebar" />
    </div>
  );
}
