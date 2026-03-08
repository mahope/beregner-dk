import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import RentefradragBeregner from "@/components/RentefradragBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("rentefradrag");
}

export default async function RentefradragPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("rentefradrag", locale) || getPageData("rentefradrag", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/rentefradrag`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/rentefradrag" }]} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {pageData.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {pageData.description}
            </p>
          </header>

          <section className="mb-12">
            <RentefradragBeregner />
          </section>

          {locale === "da" && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om rentefradrag
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                <strong>Rentefradrag</strong> er en af de mest værdifulde <strong>skattefordele</strong> for boligejere i Danmark.
                Når du betaler renter på dit lån, får du lov til at <strong>trække en del fra i skat</strong>.
                Det betyder, at staten reelt betaler en del af dine <strong>renteudgifter</strong>.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Fradragssatser 2026</h3>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Renteudgifter</th>
                    <th className="border p-3 text-left">Fradragsværdi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">Under 50.000 kr. (enlig) / 100.000 kr. (par)</td>
                    <td className="border p-3">Ca. 33,6%</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Over 50.000 kr. (enlig) / 100.000 kr. (par)</td>
                    <td className="border p-3">Ca. 25,6%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-2">
                * Den præcise fradragsværdi afhænger af din kommune.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Eksempel</h3>
              <p>
                Hvis du har <strong>80.000 kr. i årlige renteudgifter</strong> som enlig:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>De første 50.000 kr. giver fradrag: 50.000 × 33,6% = 16.800 kr.</li>
                <li>De næste 30.000 kr. giver fradrag: 30.000 × 25,6% = 7.680 kr.</li>
                <li><strong>Samlet skattebesparelse: 24.480 kr.</strong></li>
              </ul>
            </div>
          </section>
          )}

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ofte stillede spørgsmål
            </h2>
            <FAQ items={pageData.faqItems} />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Relaterede beregnere
            </h2>
            <RelatedCalculators current="/rentefradrag" />
          </section>
        </article>
      </main>
    </div>
  );
}
