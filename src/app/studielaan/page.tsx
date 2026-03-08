import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import StudielaanBeregner from "@/components/StudielaanBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

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
            SU-lån er et af de <strong>billigste lån</strong>, du kan have. Tilbagebetalingen starter <strong>1 år efter endt uddannelse</strong>, og du har typisk 7 år til at betale lånet ud — med mulighed for forlængelse til 15 år.
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
            <li><strong>Brug rentefradraget:</strong> Renter på SU-lån er fradragsberettigede (ca. 25% fradragsværdi)</li>
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
