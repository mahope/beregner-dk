import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import LonEfterSkattBeregner from "@/components/LonEfterSkattBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("lon-efter-skatt");
}

export default async function LonEfterSkattPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("lon-efter-skatt", domainConfig.locale) ||
    getPageData("lon-efter-skatt", "se")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/lon-efter-skatt`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/lon-efter-skatt" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <LonEfterSkattBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Så beräknas din lön efter skatt 2026</h2>
          <p>
            När du får din lön dras skatt innan pengarna landar på kontot. Den här kalkylatorn
            visar din <strong>nettolön</strong> – vad du får kvar – utifrån din bruttolön och
            din kommuns skattesats. Beräkningen följer <strong>Skatteverkets regler för 2026</strong>.
          </p>

          <h2>Skatten steg för steg</h2>
          <ul>
            <li><strong>Grundavdrag:</strong> En del av inkomsten är skattefri. Grundavdraget är
              mellan cirka 17 400 och 45 600 kr per år 2026 (baserat på prisbasbeloppet 59 200 kr).</li>
            <li><strong>Kommunalskatt:</strong> Betalas på den beskattningsbara inkomsten. Snittet
              i Sverige 2026 är 32,38 % (kommun + region), men det varierar mellan kommuner.</li>
            <li><strong>Statlig inkomstskatt:</strong> 20 % tas ut på beskattningsbar inkomst över
              skiktgränsen 643 000 kr 2026 (brytpunkt cirka 660 400 kr i bruttolön).</li>
            <li><strong>Jobbskatteavdrag:</strong> En skattereduktion för arbetsinkomst som sänker
              din skatt med upp till cirka 4 400 kr per månad. Avtrappningen vid höga inkomster
              slopas 2026.</li>
            <li><strong>Public service-avgift:</strong> 1 % av inkomsten, högst 1 184 kr per år.</li>
          </ul>

          <h2>Kommunalskatten spelar stor roll</h2>
          <p>
            Skillnaden mellan Sveriges lägsta och högsta kommunalskatt är över 6 procentenheter.
            På en månadslön på 35 000 kr kan det skilja flera hundra kronor i månaden i nettolön
            beroende på var du bor. Ange din egen kommunalskatt för ett mer exakt resultat.
          </p>

          <h2>Bra att veta</h2>
          <p>
            Allmän pensionsavgift (7 %) dras från lönen men <strong>krediteras fullt ut</strong>
            via en skattereduktion, så den påverkar normalt inte din nettolön. Begravnings- och
            eventuell kyrkoavgift varierar mellan församlingar. Kalkylatorn ger en noggrann
            uppskattning för anställda under 66 år – det exakta beloppet framgår av Skatteverkets
            skattetabeller.
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/lon-efter-skatt" />
      </div>
      <Sidebar currentHref="/lon-efter-skatt" adSlotId="lon-efter-skatt-sidebar" />
    </div>
  );
}
