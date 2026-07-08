import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import SparemaalBeregner from "@/components/SparemaalBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("sparemaal");
}

export default async function SparemaalPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("sparemaal", locale) || getPageData("sparemaal", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/sparemaal`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/sparemaal" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <SparemaalBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Nå dit sparemål</h2>
            <p>
              Drømmer du om en udbetaling til bolig, en rejse eller en buffer? Indtast dit{" "}
              <strong>sparemål</strong>, hvor mange <strong>år</strong> du vil spare op, og en{" "}
              <strong>forventet rente</strong>, så beregner vi, hvor meget du skal lægge til side{" "}
              <strong>hver måned</strong> for at nå målet. Har du allerede sparet noget op, kan du
              indtaste det som startbeløb.
            </p>
            <h2>Renters rente hjælper dig</h2>
            <p>
              Jo længere tid og jo højere rente, jo mere arbejder <strong>renters rente</strong> for
              dig — og jo mindre skal du selv indbetale. Beregneren viser, hvor stor en del af målet
              der kommer fra dine egne indbetalinger, og hvor meget der kommer fra afkastet. Bemærk, at
              afkast svinger, og at historiske tal ikke er nogen garanti.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Nå ditt sparmål</h2>
            <p>
              Drömmer du om en kontantinsats till bostad, en resa eller en buffert? Ange ditt{" "}
              <strong>sparmål</strong>, hur många <strong>år</strong> du vill spara, och en{" "}
              <strong>förväntad ränta</strong>, så beräknar vi hur mycket du behöver lägga undan{" "}
              <strong>varje månad</strong> för att nå målet. Har du redan sparat något kan du ange det
              som startbelopp.
            </p>
            <h2>Ränta-på-ränta hjälper dig</h2>
            <p>
              Ju längre tid och ju högre ränta, desto mer arbetar <strong>ränta-på-ränta</strong> för
              dig — och desto mindre behöver du själv sätta in. Kalkylatorn visar hur stor del av målet
              som kommer från dina egna insättningar och hur mycket som kommer från avkastningen.
              Observera att avkastning svänger och att historiska siffror inte är någon garanti.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/sparemaal" />
      </div>
      <Sidebar currentHref="/sparemaal" adSlotId="sparemaal-sidebar" />
    </div>
  );
}
