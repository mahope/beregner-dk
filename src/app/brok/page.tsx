import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BrokBeregner from "@/components/BrokBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("brok");
}

export default async function BrokPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("brok", locale) || getPageData("brok", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/brok`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/brok" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <BrokBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Forkort en brøk</h2>
            <p>
              At <strong>forkorte en brøk</strong> vil sige at gøre tæller og nævner så små som
              muligt uden at ændre værdien. Det gør man ved at dividere begge tal med deres{" "}
              <strong>største fælles divisor</strong>. Fx bliver 6/8 til 3/4, fordi begge tal kan
              divideres med 2.
            </p>
            <h2>Brøk, decimaltal og procent</h2>
            <p>
              Beregneren viser samtidig brøken som <strong>decimaltal</strong> (3/4 = 0,75) og{" "}
              <strong>procent</strong> (75 %). Det er praktisk i skolen, i køkkenet og alle andre
              steder, hvor du skal skifte mellem de tre måder at skrive et forhold på. Indtast hele
              tal i tæller og nævner.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Förkorta ett bråk</h2>
            <p>
              Att <strong>förkorta ett bråk</strong> innebär att göra täljare och nämnare så små som
              möjligt utan att ändra värdet. Det gör man genom att dela båda talen med deras{" "}
              <strong>största gemensamma delare</strong>. T.ex. blir 6/8 till 3/4, eftersom båda talen
              kan delas med 2.
            </p>
            <h2>Bråk, decimaltal och procent</h2>
            <p>
              Kalkylatorn visar samtidigt bråket som <strong>decimaltal</strong> (3/4 = 0,75) och{" "}
              <strong>procent</strong> (75 %). Det är praktiskt i skolan, i köket och överallt annars
              där du behöver växla mellan de tre sätten att skriva ett förhållande. Ange heltal i
              täljare och nämnare.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/brok" />
      </div>
      <Sidebar currentHref="/brok" adSlotId="brok-sidebar" />
    </div>
  );
}
