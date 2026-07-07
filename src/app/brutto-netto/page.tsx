import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BruttoNettoBeregner from "@/components/BruttoNettoBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("brutto-netto");
}

export default async function BruttoNettoPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("brutto-netto", locale) || getPageData("brutto-netto", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/brutto-netto`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/brutto-netto" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <BruttoNettoBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Fra netto til brutto — den omvendte skatteberegning</h2>
          <p>
            Denne beregner gør det modsatte af en normal skatteberegning. I stedet for at taste din bruttoløn ind og se hvad du får udbetalt, taster du din <strong>ønskede udbetaling</strong> ind og ser hvad du skal tjene brutto.
          </p>

          <h2>Perfekt til lønforhandling</h2>
          <p>
            Når du forhandler løn, er det nyttigt at vide præcis hvad en <strong>lønforhøjelse</strong> betyder for din udbetaling — og omvendt. Hvis du fx ønsker 2.000 kr. mere udbetalt om måneden, skal du typisk forhandle dig til <strong>3.500-4.000 kr. mere i bruttoløn</strong> (afhængigt af din skatteprocent).
          </p>

          <h2>Hvad trækkes fra din løn?</h2>
          <ul>
            <li><strong>AM-bidrag (8%):</strong> Trækkes af bruttolønnen før skat</li>
            <li><strong>Bundskat (12,01%):</strong> Betales af alle lønindkomster</li>
            <li><strong>Kommuneskat (ca. 25%):</strong> Varierer fra 22,8% til 27,8% afhængigt af kommune</li>
            <li><strong>Kirkeskat (ca. 0,7%):</strong> Valgfri — kun for medlemmer af folkekirken</li>
            <li><strong>Mellemskat (7,5%):</strong> Over 641.200 kr./år efter AM-bidrag</li>
            <li><strong>Topskat (7,5%):</strong> Over 777.900 kr./år efter AM-bidrag</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/brutto-netto" />
      </div>

      <Sidebar currentHref="/brutto-netto" adSlotId="brutto-netto-sidebar" />
    </div>
  );
}
