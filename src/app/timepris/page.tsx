import { generatePageMetadata } from "@/lib/page-helpers";
import dynamic from "next/dynamic";
const TimeprisBeregner = dynamic(() => import("@/components/TimeprisBeregner"));
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("timepris");
}

export default async function TimeprisPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("timepris", locale) || getPageData("timepris", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/timepris`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/timepris" }]} />

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
        <TimeprisBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Sådan finder du den rigtige timepris</h2>
        <p>
          At <strong>fastsætte sin timepris</strong> er en af de vigtigste beslutninger som <strong>freelancer</strong>.
          Sætter du den <strong>for lavt</strong>, ender du med at arbejde for meget for for lidt.
          Sætter du den <strong>for højt</strong>, risikerer du at miste kunder.
        </p>

        <h3>Faktorer der påvirker din timepris</h3>
        <ul>
          <li><strong>Erfaring og kompetencer</strong> - Jo mere specialist du er, jo højere pris</li>
          <li><strong>Branche</strong> - Nogle brancher har højere markedspriser</li>
          <li><strong>Geografi</strong> - København har typisk højere priser end provinsen</li>
          <li><strong>Kunde-type</strong> - Store virksomheder betaler ofte mere</li>
          <li><strong>Projekttype</strong> - Hasteopgaver og specialprojekter kan tage mere</li>
        </ul>

        <h3>Skjulte omkostninger som freelancer</h3>
        <p>
          Mange nye freelancere <strong>undervurderer deres omkostninger</strong>:
        </p>
        <ul>
          <li>Ingen betalt ferie (5-6 uger = 10-12% af din tid)</li>
          <li>Ingen pension fra arbejdsgiver</li>
          <li>Ingen løn under sygdom</li>
          <li>Software, udstyr og kontorudgifter</li>
          <li>Erhvervsforsikringer</li>
          <li>Bogføring og revisor</li>
          <li>Tid til salg, netværk og administration</li>
        </ul>

        <h3>Timepris vs. fastpris</h3>
        <p>
          Overvej også at tilbyde <strong>fastpriser på projekter</strong>. Det kan give dig <strong>bedre indtjening</strong>
          når du bliver mere effektiv, og kunder foretrækker ofte at kende den <strong>samlede pris</strong> på forhånd.
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/timepris" />
    </div>
  );
}
