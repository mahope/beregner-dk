import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import OhmBeregner from "@/components/OhmBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("ohm");
}

export default async function OhmPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("ohm", locale) || getPageData("ohm", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/ohm`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/ohm" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <OhmBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvad er Ohms lov?</h2>
            <p>
              Ohms lov beskriver sammenhængen mellem <strong>spænding (V)</strong>,{" "}
              <strong>strøm (I)</strong> og <strong>modstand (R)</strong> i et elektrisk kredsløb:{" "}
              <em>V = I × R</em>. Kender du to af størrelserne, kan du beregne den tredje. Vælg, hvad
              du vil finde, og indtast de to øvrige.
            </p>
            <h2>Effekt (watt)</h2>
            <p>
              Beregneren viser også <strong>effekten</strong> i watt, som er den energi kredsløbet
              omsætter pr. sekund: <em>P = V × I</em>. Det er praktisk, når du fx skal vurdere, hvor
              kraftig en strømforsyning eller en modstand skal være. Husk enhederne: volt (V), ampere
              (A), ohm (Ω) og watt (W).
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Vad är Ohms lag?</h2>
            <p>
              Ohms lag beskriver sambandet mellan <strong>spänning (V)</strong>,{" "}
              <strong>ström (I)</strong> och <strong>resistans (R)</strong> i en elektrisk krets:{" "}
              <em>V = I × R</em>. Känner du till två av storheterna kan du beräkna den tredje. Välj vad
              du vill hitta och ange de två övriga.
            </p>
            <h2>Effekt (watt)</h2>
            <p>
              Kalkylatorn visar även <strong>effekten</strong> i watt, som är den energi kretsen
              omsätter per sekund: <em>P = V × I</em>. Det är praktiskt när du t.ex. ska bedöma hur
              kraftig en strömförsörjning eller en resistor behöver vara. Kom ihåg enheterna: volt (V),
              ampere (A), ohm (Ω) och watt (W).
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/ohm" />
      </div>
      <Sidebar currentHref="/ohm" adSlotId="ohm-sidebar" />
    </div>
  );
}
