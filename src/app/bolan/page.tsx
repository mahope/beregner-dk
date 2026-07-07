import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BolanBeregner from "@/components/BolanBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("bolan");
}

export default async function BolanPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("bolan", domainConfig.locale) || getPageData("bolan", "se")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/bolan`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/bolan" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <BolanBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Så fungerar ett bolån i Sverige 2026</h2>
          <p>
            När du köper en bostad finansierar du den med <strong>kontantinsats</strong> och
            <strong> bolån</strong>. Förhållandet mellan lånet och bostadens värde kallas
            <strong> belåningsgrad</strong> och avgör både räntan och hur mycket du måste amortera.
          </p>

          <h2>Bolånetak och kontantinsats</h2>
          <p>
            Från 2026 är <strong>bolånetaket 90%</strong> av bostadens värde – du behöver alltså
            minst <strong>10% i kontantinsats</strong> (sänkt från 15%). En större kontantinsats ger
            ofta bättre ränta och lägre månadskostnad.
          </p>

          <h2>Amorteringskrav (nya regler från 1 april 2026)</h2>
          <p>
            Amorteringskravet baseras numera <strong>enbart på belåningsgraden</strong>. Det
            tidigare skuldkvotskravet (extra 1% för lån över 4,5 gånger inkomsten) är borttaget.
          </p>
          <ul>
            <li><strong>Belåningsgrad över 70%:</strong> minst 2% av lånet per år</li>
            <li><strong>Belåningsgrad 50–70%:</strong> minst 1% av lånet per år</li>
            <li><strong>Under 50%:</strong> inget lagstadgat amorteringskrav</li>
          </ul>

          <h2>Ränteavdrag</h2>
          <p>
            Du får göra <strong>ränteavdrag</strong> i deklarationen: <strong>30%</strong> av
            räntekostnaderna upp till 100 000 kr underskott av kapital per år, och <strong>21%</strong>
            på beloppet däröver. Det sänker din verkliga räntekostnad.
          </p>

          <h2>Bunden eller rörlig ränta?</h2>
          <p>
            <strong>Bunden ränta</strong> låser räntan en period och ger en förutsägbar
            månadskostnad. <strong>Rörlig ränta</strong> (oftast tremånaders) är ofta lägre men kan
            ändras. Jämför alltid flera banker och förhandla om räntan.
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/bolan" />
      </div>
      <Sidebar currentHref="/bolan" adSlotId="bolan-sidebar" />
    </div>
  );
}
