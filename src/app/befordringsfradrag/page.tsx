import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BefordringsfradragBeregner from "@/components/BefordringsfradragBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("befordringsfradrag");
}

export default async function BefordringsfradragPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("befordringsfradrag", locale) || getPageData("befordringsfradrag", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/befordringsfradrag`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/befordringsfradrag" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <BefordringsfradragBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan bruger du befordringsfradrag-beregneren</h2>
            <p>
              Befordringsfradrag (kørsel mellem hjem og arbejde) kan trækkes fra i skat, hvis din
              samlede daglige transport er over <strong>24 km</strong> (13,5 km hver vej — skatten
              regner med km/tur/retur). Indtast dine km pr. dag, antal arbejdsdage og indkomst for
              at se, hvor meget du får i fradrag og i skattebesparelse.
            </p>
            <h2>2026-satser for befordringsfradrag</h2>
            <p>
              I 2026 er satserne{" "}
              <strong>3,17 kr./km for 25-120 km</strong> og{" "}
              <strong>1,59 kr./km for kørsel over 120 km</strong> dagligt (op fra 2,23 og 1,12 kr.
              i 2025). I yderkommuner og visse småøer er satsen forhøjet til{" "}
              <strong>3,51 kr./km</strong>.
            </p>
            <h2>Brofradrag</h2>
            <p>
              Krydser du Storebælts- eller Øresundsbroen på vej til arbejde, kan du lægge et ekstra
              fradrag pr. tur oveni — fx{" "}
              <strong>110 kr. pr. Storebæltspassage i bil</strong> og{" "}
              <strong>50 kr. pr. Øresundspassage i bil</strong>. Bruger du tog eller anden offentlig
              transport over broen, er satsen lavere.
            </p>
            <h2>Ekstra befordringsfradrag</h2>
            <p>
              Har du en årlig indkomst under{" "}
              <strong>391.500 kr.</strong> før AM-bidrag, kan du få et ekstra fradrag på op til{" "}
              <strong>30.800 kr.</strong> — nedtrappes gradvist med stigende indkomst.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/befordringsfradrag" />
      </div>
      <Sidebar currentHref="/befordringsfradrag" adSlotId="befordringsfradrag-sidebar" />
    </div>
  );
}