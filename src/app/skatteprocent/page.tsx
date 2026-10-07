import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { beregnSkat } from "@/lib/skattefordeling";
import { KOMMUNER, KOMMUNER_SNIT } from "@/lib/kommuner";
import { kirkeskatSats } from "@/lib/kirkeskat";
import { SATSER_2026 } from "@/lib/satser-2026";
import SkatteprocentBeregner from "@/components/SkatteprocentBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sidebar from "@/components/Sidebar";

const kr = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 0 });
const pct = (n: number) => n.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const EKSEMPEL = 500_000;
const KBH_KOMMUNESKAT = KOMMUNER.find((k) => k.navn === "København")?.kommuneskat ?? KOMMUNER_SNIT;
const KBH = beregnSkat(EKSEMPEL, KBH_KOMMUNESKAT / 100, kirkeskatSats("København") / 100)!;
const LAVESTE = [...KOMMUNER].sort((a, b) => a.kommuneskat - b.kommuneskat)[0];
const HOEJESTE = [...KOMMUNER].sort((a, b) => b.kommuneskat - a.kommuneskat)[0];

export async function generateMetadata() {
  return generatePageMetadata("skatteprocent");
}

export default async function SkatteprocentPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("skatteprocent", locale) || getPageData("skatteprocent", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/skatteprocent`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/skatteprocent" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <SkatteprocentBeregner />

        {locale === "da" && (
          <div className="mt-12 prose max-w-none">
            <h2>Hvad er skatteprocent?</h2>
            <p>
              Skatteprocent er den samlede skat du betaler af din indkomst, udtrykt i procent. Den
              består af flere dele: <strong>AM-bidrag</strong> (8 % af bruttolønnen),{" "}
              <strong>bundskat</strong> (12,01 % af den skattepligtige indkomst),{" "}
              <strong>kommuneskat</strong> (23,4-27,1 % afhængig af kommune), <strong>kirkeskat</strong>{" "}
              (0,42-1,10 % for medlemmer af folkekirken), <strong>mellemskat</strong> (7,5 % af
              indkomst over {kr(SATSER_2026.mellemskatGraense)} kr. efter AM-bidrag) og{" "}
              <strong>topskat</strong> (7,5 % af indkomst over {kr(SATSER_2026.topskatGraense)} kr.
              efter AM-bidrag).
            </p>
            <p>
              Den effektive skattesats — altså den samlede skat divideret med bruttolønnen — ligger
              typisk mellem 30 og 40 % for en almindelig lønmodtager, men kan være højere for høje
              indkomster.
            </p>

            <h2>Eksempel: {kr(EKSEMPEL)} kr. i København</h2>
            <p>
              Med en bruttoløn på <strong>{kr(EKSEMPEL)} kr.</strong> i København (kommuneskat{" "}
              {pct(KBH_KOMMUNESKAT)} %, kirkeskat {pct(kirkeskatSats("København"))} %) betaler du{" "}
              <strong>{kr(KBH.samletSkat)} kr.</strong> i skat pr. år — en effektiv skattesats på{" "}
              <strong>{pct(KBH.effektivSkat)} %</strong>. Du får{" "}
              <strong>{kr(KBH.nettoAar)} kr.</strong> om året efter skat.
            </p>

            <h2>Kommuneskat i alle kommuner</h2>
            <p>
              Kommuneskatten varierer fra <strong>{pct(LAVESTE.kommuneskat)} %</strong> i{" "}
              {LAVESTE.navn} til <strong>{pct(HOEJESTE.kommuneskat)} %</strong> i {HOEJESTE.navn}.
              Danmarks gennemsnit er <strong>{pct(KOMMUNER_SNIT)} %</strong>. Værktøjet ovenfor
              viser alle {KOMMUNER.length} kommuner med deres satser og den skat, du betaler i hver
              kommune.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
              <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
              <p className="text-blue-700 dark:text-blue-400">
                Beregneren giver et estimat med 2026-satserne. Den præcise skat afhænger af din
                skattepligtige indkomst, fradrag og kommune. Læs mere på{" "}
                <a
                  href="https://www.skm.dk/satser/statistik/kommuneskatter"
                  className="underline"
                  rel="noopener noreferrer"
                >
                  skm.dk
                </a>
                .
              </p>
            </div>
          </div>
        )}

        <section className="mt-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Relaterede beregninger</p>
            <p className="text-blue-700 dark:text-blue-400">
              Se også{" "}
              <Link href="/kirkeskat" className="underline font-medium">
                kirkeskat-beregneren
              </Link>
              ,{" "}
              <Link href="/brutto-netto" className="underline font-medium">
                brutto-netto-beregneren
              </Link>{" "}
              og{" "}
              <Link href="/topskat" className="underline font-medium">
                topskat-beregneren
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om skatteprocent" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/skatteprocent" />
        </section>
      </div>

      <Sidebar currentHref="/skatteprocent" adSlotId="skatteprocent-sidebar" />
    </div>
  );
}
