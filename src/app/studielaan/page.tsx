import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import StudielaanBeregner from "@/components/StudielaanBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { SU_2026 } from "@/lib/satser-2026";

export async function generateMetadata() {
  return generatePageMetadata("studielaan");
}

export default async function StudielaanPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("studielaan", locale) || getPageData("studielaan", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/studielaan`}
          category={pageData.schemaCategory}
          siteName={domainConfig.siteName}
          currency={domainConfig.currency}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/studielaan" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <StudielaanBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Tilbagebetaling af SU-lån</h2>
          <p>
            Tilbagebetalingen starter 1. januar året efter det år, hvor uddannelsen slutter.
            Almindelig SU-gæld betales typisk hver {SU_2026.loan.repaymentFrequencyMonths}. måned.
            Den officielle løbetid følger lånets størrelse: {SU_2026.loan.repaymentMinYears} år
            op til {SU_2026.loan.repaymentFirstBandMaxDebt.toLocaleString("da-DK")} kr. og op til{" "}
            {SU_2026.loan.repaymentMaxYears} år fra{" "}
            {SU_2026.loan.repaymentLastBandMinDebt.toLocaleString("da-DK")} kr. Se{" "}
            <a href={SU_2026.sources.loanRepayment} target="_blank" rel="noopener noreferrer" className="underline">Udbetaling Danmarks oversigt over løn, løbetid og betalinger</a>.
          </p>
          <p>
            Værktøjet viser et <strong>hypotetisk månedsscenario</strong> med annuity og
            brugerflere valgfri løbetid på {SU_2026.loan.repaymentMinYears}-{SU_2026.loan.repaymentMaxYears}
            år. Det er ikke Udbetaling Danmarks endelige afdragsplan, som betales hver anden måned
            og afhænger af den oprindelige gæld.
          </p>
          <p>
            Pr. {SU_2026.verifiedAt} er renten {(SU_2026.loan.duringStudyRate * 100).toLocaleString("da-DK")} % under studiet og {(SU_2026.loan.afterGraduationRate * 100).toLocaleString("da-DK")} % fra 1. juli 2026 efter uddannelsen. Se{" "}
            <a href={SU_2026.sources.loanInterest} target="_blank" rel="noopener noreferrer" className="underline">de officielle rentesatser</a> og{" "}
            <a href={SU_2026.sources.loan} target="_blank" rel="noopener noreferrer" className="underline">SU-lånssatserne</a>.
          </p>

          <h2>Fordele ved ekstra afdrag</h2>
          <p>
            Selvom renten på SU-lån er lav, kan <strong>ekstra afdrag</strong> stadig spare dig penge. Jo hurtigere du betaler ned, jo mindre <strong>rente</strong> betaler du samlet. Brug beregneren til at se den præcise effekt.
          </p>

          <h2>Tips til studielån</h2>
          <ul>
            <li><strong>Betal mindst minimumsydelsen:</strong> Undgå rykkere og ekstra gebyrer</li>
            <li><strong>Overvej ekstra afdrag:</strong> Selv 500 kr./md. ekstra gør en forskel</li>
            <li><strong>Prioriter dyr gæld først:</strong> Har du forbrugslån, betal dem først — de har højere rente</li>
            <li><strong>Se den aktuelle rente:</strong> SU-lånerenten er variabel og fastsættes løbende af Udbetaling Danmark</li>
            <li><strong>Søg nedsat ydelse:</strong> Ved lav indkomst kan du få reduceret din ydelse</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/studielaan" />
      </div>

      <Sidebar currentHref="/studielaan" adSlotId="studielaan-sidebar" />
    </div>
  );
}
