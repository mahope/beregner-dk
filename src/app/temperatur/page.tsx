import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import TemperaturBeregner from "@/components/TemperaturBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("temperatur");
}

export default async function TemperaturPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("temperatur", locale) || getPageData("temperatur", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/temperatur`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/temperatur" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <TemperaturBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Omregn Celsius, Fahrenheit og Kelvin</h2>
            <p>
              Har du en opskrift i Fahrenheit eller en vejrudsigt fra USA? Denne beregner omregner
              øjeblikkeligt mellem <strong>Celsius (°C)</strong>, <strong>Fahrenheit (°F)</strong> og{" "}
              <strong>Kelvin (K)</strong>.
            </p>
            <h2>Formlerne</h2>
            <p>
              Fra Celsius til Fahrenheit: <em>°F = °C × 9/5 + 32</em>. Fra Celsius til Kelvin:{" "}
              <em>K = °C + 273,15</em>. Vand fryser ved <strong>0 °C</strong> (32 °F) og koger ved{" "}
              <strong>100 °C</strong> (212 °F). Et sjovt sammenfald: <strong>−40 °C er præcis det
              samme som −40 °F</strong>.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Omvandla Celsius, Fahrenheit och Kelvin</h2>
            <p>
              Har du ett recept i Fahrenheit eller en väderprognos från USA? Den här kalkylatorn
              omvandlar direkt mellan <strong>Celsius (°C)</strong>, <strong>Fahrenheit (°F)</strong>{" "}
              och <strong>Kelvin (K)</strong>.
            </p>
            <h2>Formlerna</h2>
            <p>
              Från Celsius till Fahrenheit: <em>°F = °C × 9/5 + 32</em>. Från Celsius till Kelvin:{" "}
              <em>K = °C + 273,15</em>. Vatten fryser vid <strong>0 °C</strong> (32 °F) och kokar vid{" "}
              <strong>100 °C</strong> (212 °F). En rolig sammanträffning: <strong>−40 °C är exakt
              samma som −40 °F</strong>.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/temperatur" />
      </div>
      <Sidebar currentHref="/temperatur" adSlotId="temperatur-sidebar" />
    </div>
  );
}
