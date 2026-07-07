import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import DelRegningBeregner from "@/components/DelRegningBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("del-regning");
}

export default async function DelRegningPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("del-regning", locale) || getPageData("del-regning", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/del-regning`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/del-regning" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <DelRegningBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Del regningen ligeligt</h2>
            <p>
              Var I ude at spise sammen? Indtast regningens beløb og antal personer, så regner
              beregneren ud, <strong>hvor meget hver især skal betale</strong>. Du kan lægge{" "}
              <strong>drikkepenge</strong> oven i med en fast procent eller vælge et af de hurtige
              trin.
            </p>
            <h2>Drikkepenge i Danmark</h2>
            <p>
              I Danmark er drikkepenge <strong>ikke forventet</strong> — betjening er inkluderet i
              priserne. Mange runder dog op eller giver 5-10 % ved rigtig god service. Det er helt op
              til dig, og beregneren gør det let at fordele beløbet ligeligt mellem jer.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Dela notan jämnt</h2>
            <p>
              Var ni ute och åt tillsammans? Ange notans belopp och antal personer, så räknar
              kalkylatorn ut <strong>hur mycket var och en ska betala</strong>. Du kan lägga till{" "}
              <strong>dricks</strong> med en fast procent eller välja ett av snabbstegen.
            </p>
            <h2>Dricks i Sverige</h2>
            <p>
              I Sverige <strong>förväntas inte dricks</strong> — servicen ingår i priserna. Många
              rundar dock upp eller ger 5-10 % vid riktigt bra service. Det är helt upp till dig, och
              kalkylatorn gör det enkelt att fördela beloppet jämnt mellan er.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/del-regning" />
      </div>
      <Sidebar currentHref="/del-regning" adSlotId="del-regning-sidebar" />
    </div>
  );
}
