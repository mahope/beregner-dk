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

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/bryllup" />
      </div>

      <Sidebar currentHref="/bryllup" adSlotId="bryllup-sidebar" />
    </div>
  );
}
