import TidsBeregner from "@/components/TidsBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import RelatedCalculators from "@/components/RelatedCalculators";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("tidsberegner");
}

export default async function TidsberegnerPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("tidsberegner", locale) || getPageData("tidsberegner", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/tidsberegner`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/tidsberegner" }]} />

      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {pageData.title}
      </h1>
      <p className="text-gray-600 mb-8 text-lg">
        {pageData.description}
      </p>

      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
        <TidsBeregner />
      </div>

      {/* SEO Content */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Sådan bruger du tidsberegneren</h2>
        <p>
          Vores <strong>tidsberegner</strong> hjælper dig med at beregne den <strong>præcise tid</strong> mellem
          to tidspunkter. Den er ideel til:
        </p>
        <ul>
          <li>
            <strong>Arbejdstidsregistrering</strong> - beregn dine timer til
            lønseddel
          </li>
          <li>
            <strong>Mødetid</strong> - se hvor lang tid et møde varede
          </li>
          <li>
            <strong>Projektplanlægning</strong> - estimer tid til opgaver
          </li>
          <li>
            <strong>Nattevagter</strong> - beregn tid over midnat
          </li>
        </ul>

        <h2>Decimal timer vs. timer:minutter</h2>
        <p>
          Mange virksomheder bruger decimal timer til timeregistrering. Her er
          en hurtig reference:
        </p>
        <ul>
          <li>15 min = 0,25 timer</li>
          <li>30 min = 0,50 timer</li>
          <li>45 min = 0,75 timer</li>
          <li>1 time 15 min = 1,25 timer</li>
        </ul>

        <h2>Tips til præcis timeregistrering</h2>
        <ul>
          <li>Husk altid at <strong>fratrække pauser</strong> fra din arbejdstid</li>
          <li>De fleste har <strong>30 minutters frokostpause</strong>, som ikke tælles med i den betalte arbejdstid</li>
          <li>Brug <strong>decimal timer</strong> når din virksomhed kræver det til timeregistrering</li>
        </ul>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Så här använder du tidsberäknaren</h2>
        <p>
          Vår <strong>tidsberäknare</strong> hjälper dig att beräkna den <strong>exakta tiden</strong> mellan
          två tidpunkter. Den är idealisk för:
        </p>
        <ul>
          <li>
            <strong>Arbetstidsregistrering</strong> - beräkna dina timmar till
            lönebesked
          </li>
          <li>
            <strong>Mötestid</strong> - se hur länge ett möte varade
          </li>
          <li>
            <strong>Projektplanering</strong> - uppskatta tid för uppgifter
          </li>
          <li>
            <strong>Nattpass</strong> - beräkna tid över midnatt
          </li>
        </ul>

        <h2>Decimaltimmar vs. timmar:minuter</h2>
        <p>
          Många företag använder decimaltimmar för tidsregistrering. Här är
          en snabb referens:
        </p>
        <ul>
          <li>15 min = 0,25 timmar</li>
          <li>30 min = 0,50 timmar</li>
          <li>45 min = 0,75 timmar</li>
          <li>1 timme 15 min = 1,25 timmar</li>
        </ul>

        <h2>Tips för exakt tidsregistrering</h2>
        <ul>
          <li>Kom alltid ihåg att <strong>dra av raster</strong> från din arbetstid</li>
          <li>De flesta har <strong>30 minuters lunchrast</strong>, som inte räknas med i den betalda arbetstiden</li>
          <li>Använd <strong>decimaltimmar</strong> när ditt företag kräver det för tidsregistrering</li>
        </ul>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/tidsberegner" />
    </div>
  );
}
