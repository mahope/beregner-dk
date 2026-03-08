import AlderBeregner from "@/components/AlderBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("alder");
}

export default async function AlderPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("alder", locale) || getPageData("alder", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/alder`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/alder" }]} />

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
        <AlderBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om aldersberegning</h2>
        <p>
          At kende sin <strong>pr&aelig;cise alder</strong> kan v&aelig;re nyttigt i mange sammenh&aelig;nge - fra <strong>juridiske dokumenter</strong>
          {" "}til <strong>sundhedsberegninger</strong>. Vores aldersberegner giver dig et detaljeret overblik over din alder
          i forskellige <strong>tidsenheder</strong>.
        </p>

        <h3>Alder i forskellige enheder</h3>
        <p>
          Din alder kan m&aring;les i mange enheder:
        </p>
        <ul>
          <li><strong>&Aring;r</strong> - Den mest almindelige m&aring;de at angive alder</li>
          <li><strong>M&aring;neder</strong> - Bruges ofte for sm&aring;b&oslash;rn</li>
          <li><strong>Uger</strong> - Bruges ved graviditet og for nyf&oslash;dte</li>
          <li><strong>Dage</strong> - For pr&aelig;cise beregninger</li>
          <li><strong>Timer/Minutter</strong> - For sjov og kuriositet</li>
        </ul>

        <h3>Juridisk alder i Danmark</h3>
        <p>
          I Danmark har alder juridisk betydning ved flere milep&aelig;le:
        </p>
        <ul>
          <li>15 &aring;r - Seksuel lavalder</li>
          <li>18 &aring;r - Myndighedsalder, stemmeret, k&oslash;rekort til bil</li>
          <li>21 &aring;r - Kan adoptere (med undtagelser)</li>
          <li>Pensionsalder - Afh&aelig;nger af f&oslash;dsels&aring;r (ca. 67-68 &aring;r)</li>
        </ul>

        <h3>Stjernetegn</h3>
        <p>
          <strong>Stjernetegnene</strong> er baseret p&aring; den <strong>vestlige astrologi</strong> og f&oslash;lger <strong>solens position</strong>
          {" "}i zodiakken p&aring; f&oslash;dselstidspunktet. Der er <strong>12 tegn</strong>, hver med unikke karaktertr&aelig;k
          if&oslash;lge astrologisk tradition.
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/alder" />
    </div>
  );
}
