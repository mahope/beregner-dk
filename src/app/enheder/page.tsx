import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import EnhederBeregner from "@/components/EnhederBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("enheder");
}

export default async function EnhederPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("enheder", locale) || getPageData("enheder", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/enheder`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/enheder" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <EnhederBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Omregn mellem enheder for længde, vægt og volumen</h2>
            <p>
              Omregn hurtigt mellem <strong>metriske og angelsaksiske enheder</strong>: kilometer og
              engelske mil, meter og fod, centimeter og tommer, kilogram og pund, liter og gallon.
              Vælg en kategori, indtast en værdi og vælg de enheder, du vil regne mellem.
            </p>
            <h2>Pas på ordet »mil«</h2>
            <p>
              En <strong>engelsk mil</strong> er 1.609 meter, mens en <strong>skandinavisk mil</strong>{" "}
              er 10 kilometer. Denne beregner bruger den engelske mil, som er den, du møder i
              amerikanske opskrifter, film og rejseinfo. 1 tomme er præcis 2,54 cm, og 1 kg er cirka
              2,2 pund.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Omvandla mellan enheter för längd, vikt och volym</h2>
            <p>
              Omvandla snabbt mellan <strong>metriska och angloamerikanska enheter</strong>: kilometer
              och engelska mil, meter och fot, centimeter och tum, kilogram och pund, liter och
              gallon. Välj en kategori, ange ett värde och välj de enheter du vill räkna mellan.
            </p>
            <h2>Se upp med ordet »mil«</h2>
            <p>
              En <strong>engelsk mil</strong> är 1 609 meter, medan en <strong>skandinavisk mil</strong>{" "}
              är 10 kilometer. Den här kalkylatorn använder engelsk mil, som är den du möter i
              amerikanska recept, filmer och reseinfo. 1 tum är exakt 2,54 cm, och 1 kg är cirka 2,2
              pund.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/enheder" />
      </div>
      <Sidebar currentHref="/enheder" adSlotId="enheder-sidebar" />
    </div>
  );
}
