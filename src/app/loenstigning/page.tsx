import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import LoenstigningBeregner from "@/components/LoenstigningBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("loenstigning");
}

export default async function LoenstigningPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("loenstigning", locale) || getPageData("loenstigning", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/loenstigning`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/loenstigning" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <LoenstigningBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvor stor er din lønstigning?</h2>
            <p>
              Skal du forhandle løn eller har du fået et nyt tilbud? Indtast din{" "}
              <strong>nuværende løn</strong> og den <strong>nye løn</strong>, så viser beregneren
              stigningen både i <strong>procent</strong> og i <strong>kroner</strong>. Det virker med
              timeløn, månedsløn eller årsløn — bare brug samme enhed begge steder.
            </p>
            <h2>Sådan regnes procenten</h2>
            <p>
              Den procentvise stigning er forskellen divideret med den gamle løn:{" "}
              <em>(ny − gammel) / gammel × 100</em>. Går din månedsløn fx fra 30.000 til 33.000 kr, er
              det en stigning på 3.000 kr eller <strong>10 %</strong>. Husk, at tallene er bruttoløn —
              hvad du får udbetalt afhænger af skatten.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hur stor är din löneökning?</h2>
            <p>
              Ska du löneförhandla eller har du fått ett nytt erbjudande? Ange din{" "}
              <strong>nuvarande lön</strong> och den <strong>nya lönen</strong>, så visar kalkylatorn
              ökningen både i <strong>procent</strong> och i <strong>kronor</strong>. Det fungerar med
              timlön, månadslön eller årslön — använd bara samma enhet på båda.
            </p>
            <h2>Så räknas procenten</h2>
            <p>
              Den procentuella ökningen är skillnaden delat med den gamla lönen:{" "}
              <em>(ny − gammal) / gammal × 100</em>. Går din månadslön t.ex. från 30 000 till 33 000 kr
              är det en ökning på 3 000 kr eller <strong>10 %</strong>. Kom ihåg att beloppen är
              bruttolön — vad du får ut beror på skatten.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/loenstigning" />
      </div>
      <Sidebar currentHref="/loenstigning" adSlotId="loenstigning-sidebar" />
    </div>
  );
}
