import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import EfterloensBeregner from "@/components/EfterloensBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  EFTERLOEN_ALDER_2026,
  EFTERLOEN_ALDER_KILDE,
  EFTERLOEN_ALDER_VERIFICERET,
} from "@/lib/efterloen";

export async function generateMetadata() {
  return generatePageMetadata("efterloen");
}

export default async function EfterloenPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("efterloen", locale) || getPageData("efterloen", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/efterloen`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/efterloen" }]} />

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
            <EfterloensBeregner />
          </section>

          {locale === "da" && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om efterløn
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                <strong>Efterløn</strong> er en ordning, der giver dig mulighed for at <strong>trække dig tilbage fra
                arbejdsmarkedet</strong> før folkepensionsalderen. Ordningen er frivillig og kræver,
                at du har indbetalt til <strong>efterlønsordningen</strong> gennem din a-kasse.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Efterlønsalder (2026)</h3>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Født</th>
                    <th className="border p-3 text-left">Efterlønsalder</th>
                    <th className="border p-3 text-left">Folkepensionsalder</th>
                    <th className="border p-3 text-left">Mulige år</th>
                  </tr>
                </thead>
                <tbody>
                  {EFTERLOEN_ALDER_2026.map((raekke) => (
                    <tr key={raekke.fraAar}>
                      <td className="border p-3">
                        {raekke.fraDato} – {raekke.tilDato}
                      </td>
                      <td className="border p-3">
                        {raekke.efterloensalder.lav === raekke.efterloensalder.hoej
                          ? `${raekke.efterloensalder.lav} år`
                          : `${raekke.efterloensalder.lav}–${raekke.efterloensalder.hoej} år`}
                      </td>
                      <td className="border p-3">{raekke.folkepensionsalder} år</td>
                      <td className="border p-3">
                        {raekke.maxAarPaaEfterloen.lav === raekke.maxAarPaaEfterloen.hoej
                          ? `${raekke.maxAarPaaEfterloen.lav} år`
                          : `${raekke.maxAarPaaEfterloen.lav}–${raekke.maxAarPaaEfterloen.hoej} år`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-2">
                * Født efter 31. december 1970 stiger efterløns- og
                folkepensionsalderen løbende med middellevetiden, så spørg din
                a-kasse. Kilde:{" "}
                <a
                  href={EFTERLOEN_ALDER_KILDE}
                  className="underline hover:text-gray-700"
                  rel="noopener noreferrer"
                >
                  borger.dk
                </a>{" "}
                (Styrelsen for Arbejmarked og Rekruttering), verificeret{" "}
                {EFTERLOEN_ALDER_VERIFICERET}.
              </p>
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
            <RelatedCalculators current="/efterloen" />
          </section>
        </article>
      </main>
    </div>
  );
}
