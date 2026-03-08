import { generatePageMetadata } from "@/lib/page-helpers";
import SolcelleBeregner from "@/components/SolcelleBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("solceller");
}

export default async function SolcellerPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("solceller", locale) || getPageData("solceller", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/solceller`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/solceller" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <SolcelleBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Er solceller en god investering?</h2>
          <p>
            Med <strong>stigende elpriser</strong> er solceller en <strong>attraktiv investering</strong> for de fleste husejere. Tilbagebetalingstiden er typisk <strong>7-12 år</strong>, og herefter producerer anlægget gratis strøm i yderligere 15-20 år.
          </p>

          <h2>Sådan virker solceller</h2>
          <p>
            Solceller omdanner <strong>sollys til elektricitet</strong>. Den producerede strøm bruges først i dit eget hjem (<strong>egetforbrug</strong>). Overskuddet sælges til elnettet via <strong>nettoafregning</strong>. Om aftenen og natten køber du el fra nettet som normalt.
          </p>

          <h2>Hvad påvirker produktionen?</h2>
          <ul>
            <li><strong>Tagretning:</strong> Sydvendt er optimalt, øst/vest giver ca. 80% af optimal produktion</li>
            <li><strong>Taghældning:</strong> 30-40° er ideelt i Danmark</li>
            <li><strong>Skygge:</strong> Selv delvis skygge reducerer produktionen markant</li>
            <li><strong>Anlægsstørrelse:</strong> Vælg et anlæg, der matcher dit forbrug</li>
            <li><strong>Vedligeholdelse:</strong> Solceller kræver næsten ingen vedligeholdelse</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/solceller" />
      </div>

      <Sidebar currentHref="/solceller" adSlotId="solceller-sidebar" />
    </div>
  );
}
