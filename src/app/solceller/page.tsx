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

        {locale === "se" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Är solceller en bra investering?</h2>
          <p>
            Med <strong>stigande elpriser</strong> är solceller en <strong>attraktiv investering</strong> för de flesta villaägare. Återbetalningstiden är ofta <strong>7-12 år</strong>, och därefter producerar anläggningen el i ytterligare 15-20 år. Med <strong>grönt avdrag</strong> får du en skattereduktion på 20 % av kostnaden för material och arbete för solceller, vilket sänker priset direkt på fakturan.
          </p>

          <h2>Så fungerar solceller</h2>
          <p>
            Solceller omvandlar <strong>solljus till elektricitet</strong>. Den producerade elen används först i ditt eget hem (<strong>egenanvändning</strong>). Överskottet säljer du till elnätet, där du får betalt enligt <strong>spotpris</strong> plus eventuell ersättning från nätägaren och elhandlaren. På kvällar och nätter köper du el från nätet som vanligt.
          </p>

          <h2>Vad påverkar produktionen?</h2>
          <ul>
            <li><strong>Takriktning:</strong> Söderläge är bäst, öst/väst ger cirka 80 % av optimal produktion</li>
            <li><strong>Taklutning:</strong> 30-40° är idealiskt i Sverige</li>
            <li><strong>Skugga:</strong> Även delvis skugga minskar produktionen markant</li>
            <li><strong>Anläggningens storlek:</strong> Välj en anläggning som matchar din förbrukning</li>
            <li><strong>Underhåll:</strong> Solceller kräver nästan inget underhåll</li>
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
