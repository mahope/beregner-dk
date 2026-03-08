import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import dynamic from "next/dynamic";
const LaaneBeregner = dynamic(() => import("@/components/LaaneBeregner"));
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("laaneberegner");
}

export default async function LaaneberegnerPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("laaneberegner", locale) || getPageData("laaneberegner", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/laaneberegner`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/laaneberegner" }]} />

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
        <LaaneBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om låneberegning</h2>
        <p>
          Før du optager et lån, er det vigtigt at forstå de <strong>samlede omkostninger</strong>.
          Vores <strong>låneberegner</strong> hjælper dig med at se, hvad lånet reelt koster - ikke
          bare den <strong>månedlige ydelse</strong>, men også de <strong>samlede renter</strong> over lånets løbetid.
        </p>

        <h3>Typer af lån</h3>
        <ul>
          <li><strong>Forbrugslån:</strong> Til mindre køb, ofte 5-25% i rente</li>
          <li><strong>Billån:</strong> Til køb af bil, typisk 4-12% i rente</li>
          <li><strong>Boliglån:</strong> Til køb af bolig, lavest rente (1-5%)</li>
          <li><strong>Kviklån:</strong> Små hurtige lån, meget høj rente (100%+)</li>
        </ul>

        <h3>Sådan får du det bedste lån</h3>
        <ol>
          <li>Sammenlign ÅOP fra flere udbydere</li>
          <li>Tjek alle gebyrer (stiftelse, administration, indfrielse)</li>
          <li>Vurder om du kan klare ydelsen hvis renten stiger</li>
          <li>Overvej om du kan spare op i stedet for at låne</li>
          <li>Læs det med småt - er der binding eller gebyrer ved ekstra afdrag?</li>
        </ol>

        <h3>Hvornår giver det mening at låne?</h3>
        <p>
          Lån kan give mening til <strong>investeringer</strong> der øger din værdi (<strong>uddannelse</strong>, <strong>bolig</strong>)
          eller nødvendige køb du ikke kan spare op til. Undgå at låne til <strong>forbrug</strong>
          der hurtigt mister værdi (rejser, elektronik, tøj).
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/laaneberegner" />
      </div>
      <Sidebar currentHref="/laaneberegner" adSlotId="laaneberegner-sidebar" />
    </div>
  );
}
