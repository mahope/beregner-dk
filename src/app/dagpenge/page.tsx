import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import DagpengeBeregner from "@/components/DagpengeBeregner";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { RelatedCalculators } from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("dagpenge");
}

export default async function DagpengePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("dagpenge", locale) || getPageData("dagpenge", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/dagpenge`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/dagpenge" }]} />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {pageData.description}
        </p>
      </div>

      {/* Calculator */}
      <DagpengeBeregner />

      {/* Info sektion */}
      {locale === "da" && (
      <section className="mt-12 prose prose-blue max-w-none dark:prose-invert">
        <h2>Sådan fungerer dagpenge i 2026</h2>
        <p>
          <strong>Dagpenge</strong> er en økonomisk sikkerhed for dig, der er medlem af en <strong>A-kasse</strong> og
          bliver ledig. Dagpengene giver dig mulighed for at fokusere på at finde et
          nyt job uden at bekymre dig for meget om <strong>økonomien</strong>.
        </p>

        <h3>Dagpenge-satser 2026</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Sats pr. måned (før skat)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Max dagpengesats</td>
                <td>22.041 kr</td>
              </tr>
              <tr>
                <td>Med beskæftigelsestillæg (3 mdr)</td>
                <td>Op til 26.198 kr</td>
              </tr>
              <tr>
                <td>Dimittend (ikke-forsørger)</td>
                <td>ca. 15.174 kr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Hvad påvirker din dagpengesats?</h3>
        <ul>
          <li><strong>Din tidligere løn:</strong> Dagpenge = 90% af løn efter 8% AM-bidrag</li>
          <li><strong>Maxsatsen:</strong> Uanset din løn kan du højst få 22.041 kr/md i 2026</li>
          <li><strong>Beskæftigelsestillæg:</strong> Op til 26.198 kr/md de første 3 måneder</li>
          <li><strong>Arbejdstid:</strong> Deltidsansatte får forholdsmæssigt mindre</li>
          <li><strong>A-kasse medlemskab:</strong> Du skal have været medlem i mindst 1 år</li>
        </ul>

        <h3>Indkomstkravet</h3>
        <p>
          For at få ret til dagpenge skal du opfylde et <strong>indkomstkrav</strong>. I 2026 skal du
          have haft en samlet indkomst på mindst <strong>263.232 kr</strong> inden for de seneste 3 år,
          eller have haft <strong>fuldtidsarbejde</strong> i mindst <strong>1.924 timer</strong> inden for de seneste 3 år.
        </p>

        <h3>Supplerende dagpenge</h3>
        <p>
          Hvis du arbejder på <strong>nedsat tid</strong> (under 37 timer), kan du få <strong>supplerende dagpenge</strong>.
          Dog er der et loft på <strong>30 ugers</strong> supplerende dagpenge inden for <strong>104 uger</strong>.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Opdateret med 2026-satser</p>
          <p className="text-green-700 dark:text-green-400">
            Satserne er de officielle 2026-satser fra Beskæftigelsesministeriet (bm.dk). Sidst verificeret februar 2026.
          </p>
        </div>
      </section>
      )}

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ofte stillede spørgsmål om dagpenge
        </h2>
        <FAQ items={pageData.faqItems} />
      </section>

      {/* Related */}
      <section className="mt-12">
        <RelatedCalculators current="/dagpenge" />
      </section>
      </div>
      <Sidebar currentHref="/dagpenge" adSlotId="dagpenge-sidebar" />
    </div>
  );
}
