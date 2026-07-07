import BryllupBeregner from "@/components/BryllupBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("bryllup");
}

export default async function BryllupPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("bryllup", locale) || getPageData("bryllup", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/bryllup`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/bryllup" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <BryllupBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Planlæg dit bryllupsbudget</h2>
          <p>
            Et bryllup er en af livets største fester — og en af de <strong>dyreste</strong>. Ved at <strong>planlægge budgettet tidligt</strong> kan du prioritere det, der betyder mest for jer, og undgå ubehagelige overraskelser.
          </p>

          <h2>Typiske udgiftsposter</h2>
          <p>
            <strong>Mad og drikke</strong> er den klart største post. <strong>Venue</strong> varierer enormt — fra gratis i en privat have til 35.000+ kr. for et slot. <strong>Fotograf</strong> er en investering i minder og bør ikke spares væk.
          </p>

          <h2>Sparetips til brylluppet</h2>
          <ul>
            <li><strong>Vælg lavsæson:</strong> Vinter og hverdage er markant billigere</li>
            <li><strong>DIY-dekoration:</strong> Blomster fra haven og hjemmelavet pynt sparer tusindvis</li>
            <li><strong>Buffet:</strong> Billigere og mere afslappet end serveret middag</li>
            <li><strong>DJ over band:</strong> En DJ koster 3.000-5.000 kr. vs. 15.000+ for et band</li>
            <li><strong>Prioritér:</strong> Vælg 2-3 ting der virkelig betyder noget, og spar på resten</li>
          </ul>
        </div>
        )}

        {locale === "se" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Planera din bröllopsbudget</h2>
          <p>
            Ett bröllop är en av livets största fester — och en av de <strong>dyraste</strong>. Genom att <strong>planera budgeten tidigt</strong> kan ni prioritera det som betyder mest för er och undvika obehagliga överraskningar.
          </p>

          <h2>Typiska utgiftsposter</h2>
          <p>
            <strong>Mat och dryck</strong> är den klart största posten. <strong>Lokalen</strong> varierar enormt — från gratis i en privat trädgård till 35 000+ kr för ett slott. <strong>Fotografen</strong> är en investering i minnen och bör inte sparas bort.
          </p>

          <h2>Spartips till bröllopet</h2>
          <ul>
            <li><strong>Välj lågsäsong:</strong> Vinter och vardagar är betydligt billigare</li>
            <li><strong>Gör-det-själv-dekoration:</strong> Blommor från trädgården och hemmagjord pynt sparar tusentals</li>
            <li><strong>Buffé:</strong> Billigare och mer avslappnad än serverad middag</li>
            <li><strong>DJ framför band:</strong> En DJ kostar 5 000-10 000 kr mot 20 000+ för ett band</li>
            <li><strong>Prioritera:</strong> Välj 2-3 saker som verkligen betyder något och spara på resten</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/bryllup" />
      </div>

      <Sidebar currentHref="/bryllup" adSlotId="bryllup-sidebar" />
    </div>
  );
}
