import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import NedtaellingBeregner from "@/components/NedtaellingBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("nedtaelling");
}

export default async function NedtaellingPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("nedtaelling", locale) || getPageData("nedtaelling", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/nedtaelling`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/nedtaelling" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <NedtaellingBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvor mange dage til…?</h2>
            <p>
              Tæl ned til en <strong>fødselsdag</strong>, <strong>ferie</strong>,{" "}
              <strong>eksamen</strong>, jul eller en hvilken som helst vigtig dato. Vælg datoen, så
              viser beregneren, hvor mange dage der er tilbage — både som antal dage og som uger og
              dage.
            </p>
            <h2>Sådan regnes der</h2>
            <p>
              Beregneren tæller fra <strong>dags dato</strong> til den dato, du vælger. Vælger du en
              dato, der allerede er passeret, viser den i stedet, hvor mange dage der er gået. Dagen i
              dag tælles ikke med, så vælger du morgendagen, får du 1 dag.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hur många dagar till…?</h2>
            <p>
              Räkna ner till en <strong>födelsedag</strong>, <strong>semester</strong>,{" "}
              <strong>tenta</strong>, jul eller vilket viktigt datum som helst. Välj datumet, så visar
              kalkylatorn hur många dagar som är kvar — både som antal dagar och som veckor och dagar.
            </p>
            <h2>Så räknas det</h2>
            <p>
              Kalkylatorn räknar från <strong>dagens datum</strong> till det datum du väljer. Väljer
              du ett datum som redan passerat visar den i stället hur många dagar som gått. Dagens
              datum räknas inte med, så väljer du morgondagen får du 1 dag.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/nedtaelling" />
      </div>
      <Sidebar currentHref="/nedtaelling" adSlotId="nedtaelling-sidebar" />
    </div>
  );
}
