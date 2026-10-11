import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import AldersopsparingsBeregner from "@/components/AldersopsparingsBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { formatBelob } from "@/lib/format";
import {
  ALDERSOPSPARING_2026,
  ALDERSOPSPARING_KILDER,
  PENSIONSUDBETALINGSALDER,
} from "@/lib/aldersopsparing";

const kr = (vaerdi: number) => `${formatBelob(vaerdi, "da")} kr.`;

export async function generateMetadata() {
  return generatePageMetadata("aldersopsparing");
}

export default async function AldersopsparingPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("aldersopsparing", locale) || getPageData("aldersopsparing", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/aldersopsparing`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs
        items={[
          { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
          { name: pageData.title, href: "/aldersopsparing" },
        ]}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{pageData.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{pageData.description}</p>
          </header>

          <section className="mb-12">
            <AldersopsparingsBeregner />
          </section>

          {locale === "da" && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Hvor meget må du indbetale til aldersopsparing?
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-4">
                <p>
                  Der er to beløbsgrænser i 2026: <strong>{kr(ALDERSOPSPARING_2026.grundbeloeb)}</strong>{" "}
                  er grundbeløbet, alle kan indbetale uden at betale afgift. Fra det syvende indkomstår
                  før det indkomstår, hvor du når din folkepensionsalder, stiger beløbet til{" "}
                  <strong>{kr(ALDERSOPSPARING_2026.hoejtBeloeb)}</strong> pr. år.
                </p>
                <p>
                  Grænsen aftales af dig og din arbejdsgiver tilsammen. Indbetaler arbejdsgiveren
                  allerede til din aldersopsparing, trækkes det fra, før du selv kan indbetale
                  restbeløbet.
                </p>
                <p>
                  <strong>Der er intet fradrag.</strong> Det er den forskel, der skiller
                  aldersopsparing fra ratepension og livrente: du indbetaler penge, du allerede har
                  betalt skat for. Skattefordelen kommer først ved udbetalingen, som er skatte- og
                  afgiftsfri.
                </p>
              </div>
              <table className="w-full border-collapse mt-4 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">År til din folkepensionsalder</th>
                    <th className="border p-3 text-left">Du må indbetale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">8 år eller mere</td>
                    <td className="border p-3">{kr(ALDERSOPSPARING_2026.grundbeloeb)}</td>
                  </tr>
                  <tr>
                    <td className="border p-3">7 år eller mindre</td>
                    <td className="border p-3">{kr(ALDERSOPSPARING_2026.hoejtBeloeb)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-sm text-gray-600 mt-2">
                Beløbsgrænserne er skat.dk's egne tal for 2026.
              </p>
            </section>
          )}

          {locale === "da" && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sådan beskattes aldersopsparing
              </h2>
              <div className="prose max-w-none text-gray-700 space-y-3">
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Indbetaling:</strong> intet fradrag. Det eneste, der koster dig noget, er
                    indbetalingen over din beløbsgrænse — der opkræver Skattestyrelsen 20 % i afgift, når du har
                    mere end 7 år til folkepensionsalderen, og 40 %, når du har 7 år eller mindre.
                  </li>
                  <li>
                    <strong>Afkast:</strong> beskattes med {formatBelob(ALDERSOPSPARING_2026.palSats * 100, "da")} % i
                    pensionsafkastskat (PAL). Skatten beregner og indbetaler dit pensionsselskab, så du
                    skal ikke foretage dig noget.
                  </li>
                  <li>
                    <strong>Udbetaling:</strong> skatte- og afgiftsfri, når den sker efter reglerne i
                    ordningen. Udbetalingen tæller ikke som personlig indkomst.
                  </li>
                </ul>
                <p>
                  Ordningen er registreret med skattekode <strong>{ALDERSOPSPARING_2026.skattekode}</strong>.
                </p>
              </div>
            </section>
          )}

          {locale === "da" && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Hvornår kan du få pengene ud?
              </h2>
              <p className="text-gray-700 mb-4">
                Aldersopsparingen udbetales ikke, før du når din
                pensionsudbetalingsalder. For en ordning oprettet 1. januar 2018 eller senere gælder
                denne alder:
              </p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Fødselsdag</th>
                    <th className="border p-3 text-left">Pensionsudbetalingsalder</th>
                  </tr>
                </thead>
                <tbody>
                  {PENSIONSUDBETALINGSALDER.map((kohort) => (
                    <tr key={kohort.fra}>
                      <td className="border p-3">
                        {kohort.til ? `${kohort.fra} – ${kohort.til}` : `${kohort.fra} og senere`}
                      </td>
                      <td className="border p-3">{kohort.alderTekst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-sm text-gray-600 mt-2">
                Udbetalingen skal være påbegyndt senest første policedag{" "}
                {ALDERSOPSPARING_2026.senesteUdbetalingEfterAlderAar} år efter din
                pensionsudbetalingsalder.
              </p>
            </section>
          )}

          <section className="mb-12">
            <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om aldersopsparing" />
          </section>

          <section className="mb-12">
            <RelatedCalculators current="/aldersopsparing" />
          </section>

          {locale === "da" && (
            <section className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Kilder</h2>
              <ul className="text-sm text-gray-600 space-y-1">
                {Object.entries(ALDERSOPSPARING_KILDER).map(([noegle, kilde]) => (
                  <li key={noegle}>{kilde}</li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
    </div>
  );
}
