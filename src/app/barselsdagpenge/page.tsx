import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BarselBeregner from "@/components/BarselBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("barselsdagpenge");
}

export default async function BarselPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("barselsdagpenge", locale) || getPageData("barselsdagpenge", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/barselsdagpenge`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/barselsdagpenge" }]} />

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
            <BarselBeregner />
          </section>

          {locale === "da" && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om barselsdagpenge
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                <strong>Barselsdagpenge</strong> er en offentlig ydelse, der hjælper forældre økonomisk under <strong>barselsorlov</strong>.
                Ydelsen administreres af <strong>Udbetaling Danmark</strong> og erstatter din indkomst, når du holder pause
                fra arbejdet for at passe dit barn.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Hvem kan få barselsdagpenge?</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Lønmodtagere, der opfylder beskæftigelseskravet (mindst 160 timer inden for de seneste 4 måneder)</li>
                <li>Selvstændige med frivillig forsikring eller tilstrækkeligt overskud</li>
                <li>Ledige, der er medlem af en a-kasse</li>
                <li>Studerende med et vist antal arbejdstimer</li>
              </ul>
              <h3 className="text-xl font-semibold mt-6 mb-3">Barselsoversigt 2026</h3>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Periode</th>
                    <th className="border p-3 text-left">Mor</th>
                    <th className="border p-3 text-left">Far/medmor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">Før fødsel</td>
                    <td className="border p-3">4 uger</td>
                    <td className="border p-3">-</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Efter fødsel (øremærket)</td>
                    <td className="border p-3">10 uger</td>
                    <td className="border p-3">2 uger</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Øremærket til hver</td>
                    <td className="border p-3">9 uger</td>
                    <td className="border p-3">9 uger</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Til deling</td>
                    <td className="border p-3" colSpan={2}>13 uger</td>
                  </tr>
                </tbody>
              </table>
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
            <RelatedCalculators current="/barselsdagpenge" />
          </section>
        </article>
      </main>
    </div>
  );
}
