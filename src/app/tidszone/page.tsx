import TidszoneBeregner from "@/components/TidszoneBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";

export async function generateMetadata() {
  return generatePageMetadata("tidszone");
}

export default async function TidszonePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("tidszone", locale) || getPageData("tidszone", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/tidszone`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/tidszone" }]} />

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
        <TidszoneBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om tidszoner</h2>
        <p>
          Verden er opdelt i <strong>24 tidszoner</strong>, der hver svarer til <strong>15 graders længde</strong> på jordkloden.
          Tidszoner gør det muligt at have en praktisk <strong>lokal tid</strong>, der nogenlunde følger solens gang.
        </p>

        <h3>Danmarks tidszone</h3>
        <p>
          Danmark bruger <strong>Central European Time (CET)</strong>, som er <strong>UTC+1</strong>. Om sommeren bruger vi
          {" "}<strong>Central European Summer Time (CEST)</strong>, som er <strong>UTC+2</strong>. Sommertid blev indført for
          at <strong>spare energi</strong> ved at udnytte dagslyset bedre.
        </p>

        <h3>Populære tidsforskelle fra Danmark</h3>
        <ul>
          <li><strong>London:</strong> 1 time bagud</li>
          <li><strong>New York:</strong> 6 timer bagud</li>
          <li><strong>Los Angeles:</strong> 9 timer bagud</li>
          <li><strong>Tokyo:</strong> 8 timer foran</li>
          <li><strong>Sydney:</strong> 9-10 timer foran</li>
        </ul>

        <h3>Tips til internationale møder</h3>
        <ul>
          <li>Brug et mødetidspunkt der er acceptabelt for alle tidszoner</li>
          <li>Angiv altid tidszonen tydeligt (fx &quot;14:00 CET&quot;)</li>
          <li>Overvej at rotere mødetider så byrden deles</li>
          <li>Brug kalenderinvitation med automatisk tidszone-konvertering</li>
        </ul>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om tidszoner</h2>
        <p>
          Världen är indelad i <strong>24 tidszoner</strong>, som var och en motsvarar <strong>15 graders längd</strong> på jordklotet.
          Tidszoner gör det möjligt att ha en praktisk <strong>lokal tid</strong> som ungefär följer solens gång.
        </p>

        <h3>Centraleuropeisk tid</h3>
        <p>
          Stora delar av Europa använder <strong>Central European Time (CET)</strong>, som är <strong>UTC+1</strong>. På sommaren används
          {" "}<strong>Central European Summer Time (CEST)</strong>, som är <strong>UTC+2</strong>. Sommartid infördes för
          att <strong>spara energi</strong> genom att utnyttja dagsljuset bättre.
        </p>

        <h3>Populära tidsskillnader från Centraleuropa</h3>
        <ul>
          <li><strong>London:</strong> 1 timme efter</li>
          <li><strong>New York:</strong> 6 timmar efter</li>
          <li><strong>Los Angeles:</strong> 9 timmar efter</li>
          <li><strong>Tokyo:</strong> 8 timmar före</li>
          <li><strong>Sydney:</strong> 9-10 timmar före</li>
        </ul>

        <h3>Tips för internationella möten</h3>
        <ul>
          <li>Använd en mötestid som är acceptabel för alla tidszoner</li>
          <li>Ange alltid tidszonen tydligt (t.ex. &quot;14:00 CET&quot;)</li>
          <li>Överväg att rotera mötestider så att bördan delas</li>
          <li>Använd kalenderinbjudan med automatisk tidszonskonvertering</li>
        </ul>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/tidszone" />
    </div>
  );
}
