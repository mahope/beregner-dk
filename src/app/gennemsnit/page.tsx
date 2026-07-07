import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import GennemsnitBeregner from "@/components/GennemsnitBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("gennemsnit");
}

export default async function GennemsnitPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("gennemsnit", locale) || getPageData("gennemsnit", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/gennemsnit`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/gennemsnit" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <GennemsnitBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beregn gennemsnit, median og sum</h2>
            <p>
              Indtast en række tal, så beregner vi <strong>gennemsnittet</strong> (middelværdien),{" "}
              <strong>medianen</strong>, summen samt det mindste og største tal. Tallene kan adskilles
              med komma, mellemrum eller linjeskift — perfekt til karakterer, målinger eller udgifter.
            </p>
            <h2>Gennemsnit eller median?</h2>
            <p>
              <strong>Gennemsnittet</strong> er summen af alle tal divideret med antallet. Det er let
              at forstå, men trækkes let skævt af meget høje eller lave værdier.{" "}
              <strong>Medianen</strong> er det midterste tal, når værdierne sorteres, og giver ofte et
              mere retvisende billede, hvis der er enkelte ekstreme værdier — fx ved løn eller
              boligpriser.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beräkna medelvärde, median och summa</h2>
            <p>
              Ange en rad tal, så beräknar vi <strong>medelvärdet</strong>, <strong>medianen</strong>,
              summan samt det minsta och största talet. Talen kan separeras med komma, mellanslag
              eller radbrytning — perfekt för betyg, mätningar eller utgifter.
            </p>
            <h2>Medelvärde eller median?</h2>
            <p>
              <strong>Medelvärdet</strong> är summan av alla tal delat med antalet. Det är lätt att
              förstå men dras lätt snett av mycket höga eller låga värden.{" "}
              <strong>Medianen</strong> är det mittersta talet när värdena sorteras och ger ofta en
              mer rättvisande bild om det finns enstaka extremvärden — t.ex. vid lön eller
              bostadspriser.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/gennemsnit" />
      </div>
      <Sidebar currentHref="/gennemsnit" adSlotId="gennemsnit-sidebar" />
    </div>
  );
}
