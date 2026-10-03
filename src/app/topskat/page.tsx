import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { SATSER_2026 } from "@/lib/satser-2026";
import {
  MELLEMSKAT,
  TOPSKAT,
  TOPTOPSKAT,
  bruttoGraense,
  topskatBelob,
} from "@/lib/topskat-eksempler";
import TopskatBeregner from "@/components/TopskatBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("topskat");
}

export default async function TopskatPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("topskat", locale) || getPageData("topskat", "da")!;

  // Beløbene og satserne i brødteksten læses fra den samme kilde som
  // TopskatBeregner, så de ikke kan glide fra hinanden. Bruttotallene er
  // beregnerens egen betingelse — mellem- og topskat beregnes af indkomsten
  // efter AM-bidrag, så grænsen nås ved grænse / (1 - AM-bidrag) — og de læses
  // fra `topskat-eksempler`, som også skriver dem i FAQ-svaret, så de to steder
  // ikke kan få hvert sit rundede tal.
  const kr = topskatBelob;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/topskat`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/topskat" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <TopskatBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Topskat i Danmark 2026 — ny skattemodel</h2>
          <p>
            I 2026 er det danske skattesystem ændret med en ny skattemodel. Den gamle topskat er erstattet af <strong>tre progressive skattetrin</strong>:
          </p>
          <ul>
            <li><strong>Mellemskat ({MELLEMSKAT}):</strong> Betales af indkomst over {kr(SATSER_2026.mellemskatGraense)} (efter AM-bidrag)</li>
            <li><strong>Topskat ({TOPSKAT}):</strong> Betales af indkomst over {kr(SATSER_2026.topskatGraense)} (efter AM-bidrag)</li>
            <li><strong>Top-topskat ({TOPTOPSKAT}):</strong> Betales af indkomst over {kr(SATSER_2026.topTopskatGraense)} (efter AM-bidrag)</li>
          </ul>

          <h2>Hvem betaler topskat?</h2>
          <p>
            Omregnet til bruttoindkomst (før AM-bidrag) betaler du mellemskat fra ca. <strong>{kr(bruttoGraense(SATSER_2026.mellemskatGraense))}/år</strong> (ca. {kr(bruttoGraense(SATSER_2026.mellemskatGraense, 12))}/md) og topskat fra ca. <strong>{kr(bruttoGraense(SATSER_2026.topskatGraense))}/år</strong> (ca. {kr(bruttoGraense(SATSER_2026.topskatGraense, 12))}/md).
          </p>
          <p>
            Ca. <strong>10-15 % af alle danske lønmodtagere</strong> betaler topskat. Det inkluderer typisk ledere, specialister, læger og andre med <strong>høj indkomst</strong>.
          </p>

          <h2>Effektiv skat vs. marginalskat</h2>
          <p>
            Din <strong>effektive skatteprocent</strong> er den gennemsnitlige skat du betaler af hele din indkomst. Den er altid lavere end marginalskatten, fordi de første kroner du tjener beskattes med en lavere sats (pga. personfradrag).
          </p>
          <p>
            Din <strong>marginalskat</strong> er skatten af den sidst tjente krone. Hvis du betaler topskat, er din marginalskat ca. 52-56 % (inkl. AM-bidrag). Det betyder at af en lønforhøjelse på 1.000 kr. beholder du kun ca. 440-480 kr.
          </p>

          <h2>Sådan reducerer du din topskat</h2>
          <p>
            Den mest effektive måde at reducere topskat er via <strong>ekstra pensionsindbetalinger</strong>. Indbetalinger til ratepension eller livrente fratrækkes i den skattepligtige indkomst og kan bringe dig under topskattegrænsen. Du betaler først skat af pengene når du hæver dem som pensionist — typisk til en lavere sats.
          </p>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/topskat" />
      </div>

      <Sidebar currentHref="/topskat" adSlotId="topskat-sidebar" />
    </div>
  );
}
