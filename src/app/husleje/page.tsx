import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import HuslejeBudgetBeregner from "@/components/HuslejeBudgetBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";

export async function generateMetadata() {
  return generatePageMetadata("husleje");
}

export default async function HuslejePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("husleje", locale) || getPageData("husleje", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/husleje`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/husleje" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600">
          {pageData.description}
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <HuslejeBudgetBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Hvor meget bør du bruge på husleje?</h2>
        <p>
          At finde den <strong>rigtige balance mellem husleje og andre udgifter</strong> er afgørende for
          en sund økonomi. Bruger du for meget på bolig, kan det gå ud over din <strong>livskvalitet</strong>
          og mulighed for <strong>opsparing</strong>.
        </p>

        <h3>30% reglen forklaret</h3>
        <p>
          Den mest udbredte tommelfingerregel siger, at din husleje (inkl. forbrugsudgifter)
          ikke bør overstige <strong>30% af din nettoindkomst</strong>. Nogle kilder siger 33%, men 30%
          giver mere <strong>buffer til uforudsete udgifter</strong>.
        </p>
        <p>
          <strong>Eksempel:</strong> Med en nettoløn på 25.000 kr bør din husleje max være
          7.500 kr inkl. el, vand og varme.
        </p>

        <h3>Hvad inkluderer "husleje"?</h3>
        <p>
          Når du beregner dit <strong>boligbudget</strong>, skal du huske alle <strong>boligrelaterede udgifter</strong>:
        </p>
        <ul>
          <li>Grundleje/husleje</li>
          <li>A conto varme og vand</li>
          <li>Elektricitet</li>
          <li>Internet og TV</li>
          <li>Indboforsikring</li>
        </ul>

        <h3>Tips til at finde billigere bolig</h3>
        <ul>
          <li>Overvej delelejlighed eller roommate</li>
          <li>Kig udenfor de dyreste områder</li>
          <li>Vær fleksibel med størrelse og stand</li>
          <li>Tjek almene boliger (boligforeninger)</li>
          <li>Brug flere boligportaler og sociale medier</li>
        </ul>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/husleje" />
    </div>
  );
}
