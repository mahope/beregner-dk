import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BudgetBeregner from "@/components/BudgetBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("budget");
}

export default async function BudgetPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("budget", locale) || getPageData("budget", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/budget`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/budget" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <BudgetBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvad er et rådighedsbeløb?</h2>
            <p>
              Dit <strong>rådighedsbeløb</strong> er det beløb, du har tilbage hver måned, når alle
              faste udgifter er betalt. Det beregnes som din <strong>indkomst efter skat</strong>
              minus dine faste udgifter — og er et af de vigtigste tal i din privatøkonomi.
            </p>

            <h2>Hvorfor er rådighedsbeløbet vigtigt?</h2>
            <p>
              Banker bruger rådighedsbeløbet, når de vurderer, om du kan få et lån. De regner med et
              <strong> minimum rådighedsbeløb</strong> — typisk omkring 5.000-6.000 kr for en enlig
              og 8.500-10.000 kr for et par, plus tillæg pr. barn. Et sundt rådighedsbeløb giver
              plads til opsparing og uforudsete udgifter.
            </p>

            <h2>Sådan får du et større rådighedsbeløb</h2>
            <ul>
              <li><strong>Gennemgå dine abonnementer:</strong> Opsig dem, du ikke bruger</li>
              <li><strong>Forhandl dine forsikringer:</strong> Indhent tilbud én gang om året</li>
              <li><strong>Saml dine lån:</strong> Ét lån med lavere rente kan sænke dine afdrag</li>
              <li><strong>Læg et madbudget:</strong> Dagligvarer er ofte den nemmeste post at sænke</li>
              <li><strong>Betal dig selv først:</strong> Overfør til opsparing samme dag, du får løn</li>
            </ul>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Vad betyder kvar att leva på?</h2>
            <p>
              <strong>Kvar att leva på</strong> är det belopp du har över varje månad när alla fasta
              utgifter är betalda — din <strong>inkomst efter skatt</strong> minus fasta utgifter.
              Det är ett av de viktigaste talen i din privatekonomi.
            </p>

            <h2>Varför är det viktigt?</h2>
            <p>
              Långivare tittar på hur mycket du har kvar att leva på när de bedömer din
              betalningsförmåga. Kronofogden använder ett <strong>normalbelopp</strong>
              (förbehållsbelopp) som riktmärke — 2026 cirka 6 400 kr per månad för en ensamstående
              vuxen, utöver boendekostnaden. Ett större överskott ger buffert och möjlighet att spara.
            </p>

            <h2>Så får du mer kvar att leva på</h2>
            <ul>
              <li><strong>Se över dina abonnemang:</strong> Säg upp det du inte använder</li>
              <li><strong>Jämför dina försäkringar:</strong> Ta in offerter en gång om året</li>
              <li><strong>Samla dina lån:</strong> Ett lån med lägre ränta sänker månadskostnaden</li>
              <li><strong>Sätt en matbudget:</strong> Dagligvaror är ofta lättast att sänka</li>
              <li><strong>Betala dig själv först:</strong> Spara automatiskt samma dag du får lön</li>
            </ul>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/budget" />
      </div>
      <Sidebar currentHref="/budget" adSlotId="budget-sidebar" />
    </div>
  );
}
