import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import ForbrugslaanBeregner from "@/components/ForbrugslaanBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("forbrugslaan");
}

export default async function ForbrugslaanPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("forbrugslaan", locale) || getPageData("forbrugslaan", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/forbrugslaan`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/forbrugslaan" }]} />

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
        <ForbrugslaanBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om forbrugslån</h2>
        <p>
          <strong>Forbrugslån</strong> er en populær finansieringsløsning for danskere, der ønsker
          fleksibilitet i deres økonomi. I modsætning til <strong>boliglån</strong> eller <strong>billån</strong> er
          forbrugslån ikke knyttet til en specifik aktiv, hvilket giver frihed til at
          bruge pengene efter eget ønske.
        </p>

        <h3>Typer af forbrugslån</h3>
        <ul>
          <li><strong>Banklån:</strong> Traditionelle banker tilbyder ofte de bedste vilkår for kunder med god økonomi</li>
          <li><strong>Online banker:</strong> Bank Norwegian, Lunar og lignende tilbyder nem online ansøgning</li>
          <li><strong>Sammenligningstjenester:</strong> Samlino og Mybanker hjælper dig med at finde den bedste rente</li>
          <li><strong>Creditforeninger:</strong> Nogle creditforeninger tilbyder forbrugslån med fordelagtige vilkår</li>
        </ul>

        <h3>Sådan får du det bedste forbrugslån</h3>
        <ol>
          <li><strong>Sammenlign flere udbydere:</strong> Brug vores beregner og sammenlign ÅOP fra flere banker</li>
          <li><strong>Tjek alle gebyrer:</strong> Stiftelsesgebyr og administration kan gøre stor forskel</li>
          <li><strong>Vurder løbetid:</strong> Kortere løbetid = lavere samlede renter, men højere ydelse</li>
          <li><strong>Overvej din rådighedsbeløb:</strong> Sørg for at ydelsen passer til din økonomi</li>
          <li><strong>Læs det med småt:</strong> Tjek for gebyrer ved tidlig indfrielse og ekstra indbetalinger</li>
        </ol>

        <h3>Hvornår giver forbrugslån mening?</h3>
        <p>
          Forbrugslån kan være fornuftige til større investeringer som <strong>renovation af bolig</strong>,
          køb af bil, uddannelse eller andre formål hvor opsparing ikke er mulig. Det er
          vigtigt at <strong>låne ansvarligt</strong> og kun det beløb, du har råd til at betale tilbage.
        </p>
        <p>
          Undgå at låne til forbrug der hurtigt <strong>mister værdi</strong>, som rejser, elektronik eller
          tøj. I disse tilfælde kan det være bedre at <strong>spare op først</strong>.
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/forbrugslaan" />
    </div>
  );
}
