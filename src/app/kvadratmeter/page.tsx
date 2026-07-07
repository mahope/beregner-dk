import KvadratmeterBeregner from "@/components/KvadratmeterBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("kvadratmeter");
}

export default async function KvadratmeterPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("kvadratmeter", locale) || getPageData("kvadratmeter", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/kvadratmeter`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/kvadratmeter" }]} />

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
        <KvadratmeterBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om arealberegning</h2>
        <p>
          Areal måles i <strong>kvadratmeter (m²)</strong> og angiver størrelsen af en flade.
          Det er vigtigt at kunne beregne areal ved mange lejligheder — fra <strong>gulvlægning</strong>
          og <strong>maling</strong> til køb af bolig.
        </p>

        <h3>Almindelige anvendelser</h3>
        <ul>
          <li><strong>Bolig:</strong> Beregn boligareal, værelsesstørrelser</li>
          <li><strong>Have:</strong> Planlæg græsplæne, terrasse, bede</li>
          <li><strong>Renovering:</strong> Beregn materialer til gulv, væg, loft</li>
          <li><strong>Ejendomshandel:</strong> Forstå grundstørrelse og BBR-areal</li>
        </ul>

        <h3>BBR-areal vs. boligareal</h3>
        <p>
          Ved <strong>boligkøb</strong> skelner man mellem:
        </p>
        <ul>
          <li><strong>Boligareal:</strong> De faktiske beboelige rum</li>
          <li><strong>BBR-areal:</strong> Det registrerede areal inkl. vægge</li>
          <li><strong>Grundareal:</strong> Hele grundens størrelse</li>
          <li><strong>Bebygget areal:</strong> Bygningens fodaftryk</li>
        </ul>

        <h3>Materialeberegning</h3>
        <p>
          Når du skal købe materialer, læg altid <strong>5-10% til for spild</strong>:
        </p>
        <ul>
          <li>Gulvbrædder: +10% for tilskæring</li>
          <li>Maling: Ca. 8-10 m² pr. liter (tjek produktet)</li>
          <li>Fliser: +5-10% for tilskæring og knækkede</li>
        </ul>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om ytberäkning</h2>
        <p>
          Yta mäts i <strong>kvadratmeter (m²)</strong> och anger storleken på en yta.
          Det är viktigt att kunna beräkna yta vid många tillfällen — från <strong>golvläggning</strong>
          och <strong>målning</strong> till bostadsköp.
        </p>

        <h3>Vanliga användningsområden</h3>
        <ul>
          <li><strong>Bostad:</strong> Beräkna boyta, rumsstorlekar</li>
          <li><strong>Trädgård:</strong> Planera gräsmatta, terrass, rabatter</li>
          <li><strong>Renovering:</strong> Beräkna material till golv, vägg, tak</li>
          <li><strong>Fastighetsaffär:</strong> Förstå tomtstorlek och boyta</li>
        </ul>

        <h3>Olika ytbegrepp</h3>
        <p>
          Vid <strong>bostadsköp</strong> skiljer man mellan:
        </p>
        <ul>
          <li><strong>Boyta:</strong> De faktiskt beboeliga rummen</li>
          <li><strong>Biyta:</strong> Utrymmen som inte räknas som boyta</li>
          <li><strong>Tomtyta:</strong> Hela tomtens storlek</li>
          <li><strong>Byggnadsyta:</strong> Byggnadens fotavtryck</li>
        </ul>

        <h3>Materialberäkning</h3>
        <p>
          När du ska köpa material, lägg alltid <strong>5-10% till för spill</strong>:
        </p>
        <ul>
          <li>Golvbrädor: +10% för kapning</li>
          <li>Färg: Ca 8-10 m² per liter (kontrollera produkten)</li>
          <li>Kakel: +5-10% för kapning och trasiga plattor</li>
        </ul>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/kvadratmeter" />
    </div>
  );
}
