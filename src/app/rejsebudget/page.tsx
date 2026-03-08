import RejsebudgetBeregner from "@/components/RejsebudgetBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("rejsebudget");
}

export default async function RejsebudgetPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("rejsebudget", locale) || getPageData("rejsebudget", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/rejsebudget`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/rejsebudget" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <RejsebudgetBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Planlæg dit rejsebudget</h2>
          <p>
            Et godt <strong>rejsebudget</strong> giver dig overblik over de <strong>samlede udgifter</strong>, så du kan spare op og undgå ubehagelige overraskelser. Beregneren giver dig et <strong>realistisk estimat</strong> baseret på gennemsnitspriser for populære destinationer.
          </p>

          <h2>De største udgiftsposter</h2>
          <p>
            <strong>Fly</strong> er ofte den største enkeltudgift ved oversøiske rejser. <strong>Overnatning</strong> er den største post ved europæiske rejser, og her kan du spare mest ved at vælge budget-muligheder som hostels eller Airbnb.
          </p>

          <h2>Sparetips til rejsen</h2>
          <ul>
            <li><strong>Book tidligt:</strong> Fly og hotel er billigst 6-10 uger før afrejse</li>
            <li><strong>Vær fleksibel:</strong> Afrejse tirsdag-torsdag er typisk billigst</li>
            <li><strong>Spis lokalt:</strong> Sidestrøgernes restauranter er billigere og ofte bedre</li>
            <li><strong>Gratis oplevelser:</strong> Mange byer har gratis museer, parker og walking tours</li>
            <li><strong>Rejsekort:</strong> Brug lokale dagskort til offentlig transport</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/rejsebudget" />
      </div>

      <Sidebar currentHref="/rejsebudget" adSlotId="rejsebudget-sidebar" />
    </div>
  );
}
