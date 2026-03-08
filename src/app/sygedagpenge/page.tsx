import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import SygedagpengeBeregner from "@/components/SygedagpengeBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("sygedagpenge");
}

export default async function SygedagpengePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("sygedagpenge", locale) || getPageData("sygedagpenge", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/sygedagpenge`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/sygedagpenge" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <SygedagpengeBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan fungerer sygedagpenge</h2>
          <p>
            Når du bliver syg og ikke kan arbejde, har du ret til <strong>sygedagpenge</strong>. De første <strong>30 kalenderdage</strong> betaler din arbejdsgiver (<strong>arbejdsgiverperioden</strong>). Herefter overtager <strong>kommunen</strong> udbetalingen via <strong>Udbetaling Danmark</strong>.
          </p>

          <h2>Hvem har ret til sygedagpenge?</h2>
          <ul>
            <li><strong>Lønmodtagere:</strong> Du skal have været ansat i mindst 8 uger og arbejdet mindst 74 timer hos samme arbejdsgiver</li>
            <li><strong>Selvstændige:</strong> Du skal have drevet selvstændig virksomhed i mindst 6 måneder (heraf 1 måned lige før sygdommen)</li>
            <li><strong>Ledige:</strong> Du skal være dagpengeberettiget medlem af en a-kasse</li>
          </ul>

          <h2>Arbejdsgiverens pligter</h2>
          <p>
            Din arbejdsgiver skal anmelde dit fravær til kommunen senest <strong>5 uger</strong> efter din første sygedag. Arbejdsgiveren kan fra <strong>dag 1</strong> anmode om en <strong>mulighedserklæring</strong>, der beskriver, hvad du evt. kan arbejde med under din sygdom.
          </p>

          <h2>Revurdering efter 22 uger</h2>
          <p>
            Kommunen skal senest ved <strong>uge 22</strong> tage stilling til, om dine sygedagpenge kan <strong>forlænges</strong>. Forlængelse sker typisk ved afventning af <strong>behandling</strong>, <strong>revalidering</strong>, afklaring til <strong>fleksjob</strong> eller <strong>ressourceforløb</strong>.
          </p>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/sygedagpenge" />
      </div>

      <Sidebar currentHref="/sygedagpenge" adSlotId="sygedagpenge-sidebar" />
    </div>
  );
}
