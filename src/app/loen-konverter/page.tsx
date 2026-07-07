import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import LoenKonverterBeregner from "@/components/LoenKonverterBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("loen-konverter");
}

export default async function LoenKonverterPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("loen-konverter", locale) || getPageData("loen-konverter", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/loen-konverter`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/loen-konverter" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <LoenKonverterBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Omregn mellem timeløn, månedsløn og årsløn</h2>
            <p>
              Skal du sammenligne et jobtilbud med timeløn mod din nuværende månedsløn? Denne
              beregner regner hurtigt om mellem <strong>timeløn</strong>, <strong>månedsløn</strong>{" "}
              og <strong>årsløn</strong>. Indtast et beløb, vælg om det er pr. time, måned eller år,
              og angiv hvor mange timer du arbejder om ugen.
            </p>
            <h2>Sådan regnes der</h2>
            <p>
              Beregningen bygger på <strong>52 uger om året</strong>: årslønnen er timeløn ×
              ugentlige timer × 52, og månedslønnen er årslønnen divideret med 12. En dansk
              fuldtidsstilling er typisk <strong>37 timer om ugen</strong>. Alle beløb er{" "}
              <strong>bruttoløn før skat</strong> — vil du kende din udbetaling, så brug vores{" "}
              <a href="/loen-efter-skat">løn efter skat-beregner</a>.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Omvandla mellan timlön, månadslön och årslön</h2>
            <p>
              Ska du jämföra ett jobberbjudande med timlön mot din nuvarande månadslön? Den här
              kalkylatorn räknar snabbt om mellan <strong>timlön</strong>, <strong>månadslön</strong>{" "}
              och <strong>årslön</strong>. Ange ett belopp, välj om det är per timme, månad eller år,
              och ange hur många timmar du arbetar per vecka.
            </p>
            <h2>Så räknas det</h2>
            <p>
              Beräkningen utgår från <strong>52 veckor om året</strong>: årslönen är timlön ×
              veckotimmar × 52, och månadslönen är årslönen delat med 12. En svensk heltid är
              vanligtvis <strong>40 timmar per vecka</strong>. Alla belopp är{" "}
              <strong>bruttolön före skatt</strong> — vill du veta vad du får ut, använd vår{" "}
              <a href="/lon-efter-skatt">lön efter skatt-kalkylator</a>.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/loen-konverter" />
      </div>
      <Sidebar currentHref="/loen-konverter" adSlotId="loen-konverter-sidebar" />
    </div>
  );
}
