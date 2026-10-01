import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import dynamic from "next/dynamic";
const LoenBeregner = dynamic(() => import("@/components/LoenBeregner"));
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { InlineAd } from "@/components/ads/AdBanner";
import Sidebar from "@/components/Sidebar";
import { formatNumber } from "@/lib/format";
import { KOMMUNER } from "@/lib/kommuner";
import { SATSER_2026 } from "@/lib/satser-2026";

/**
 * Alle tallene i afsnittet "Sådan beregnes din skat i Danmark" læses fra
 * `SATSER_2026` — samme fil som beregneren og `/blog/skat-2026-alt-du-skal-vide`
 * bruger. De stod tidligere som hårdkodede tal i brødteksten, så en
 * satsændring kunne ramme beregningen og ikke copyen (eller omvendt).
 *
 * Kommunetabellen er tilsvarende afledet af `KOMMUNER` i stedet for at være
 * skrevet i hånden. Den hårdkodede tabel sagde "Allerød (23,3 %)", mens
 * `KOMMUNER` siger 24,80 % — og Allerød er ikke blandt de tre laveste
 * kommuner overhovedet (Lyngby-Taarbæk er det med 23,00 %). Nu kan tabellen
 * ikke komme på afveje, fordi den *er* tabellen.
 *
 * Sammenligninger med 2025 ("op fra 49.700 kr", "op fra 45.100 kr", "sat ned
 * fra 12,22 %") er fjernet i stedet for rettet: de 2025-tal har ingen kilde i
 * repoet, og skat.dk svarer HTTP 500 for både browser og hentning (1/10), så de
 * kunne ikke verificeres. `SATSER_2026` bærer de verificerede 2026-tal med
 * kilde — en påstand om et gammelt år uden kilde hører ikke der.
 */
const da = (beloeb: number) => formatNumber(beloeb, "da");
const pct = (sats: number) =>
  formatNumber(sats * 100, "da", { maximumFractionDigits: 3 });
/** `KOMMUNER` fører procent som 22.5, mens `pct` forventer en andel. */
const pctTal = (procent: number) => pct(procent / 100);

/** De tre laveste og tre højeste kommuneskatter i `KOMMUNER`, beregnet her. */
const KOMMUNER_STIGENDE = [...KOMMUNER].sort(
  (a, b) => a.kommuneskat - b.kommuneskat
);
const LAVESTE_KOMMUNER = KOMMUNER_STIGENDE.slice(0, 3);
const HOEJESTE_KOMMUNER = KOMMUNER_STIGENDE.slice(-3).reverse();

export async function generateMetadata() {
  return generatePageMetadata("loen-efter-skat");
}

export default async function LoenPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("loen-efter-skat", locale) || getPageData("loen-efter-skat", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content - Left Column */}
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/loen-efter-skat`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/loen-efter-skat" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <LoenBeregner />

      {/* Inline Ad - After calculator */}
      <InlineAd slotId="loen-after-calculator" />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none dark:prose-invert">
        <h2>Sådan beregnes din skat i Danmark</h2>
        <p>
          I Danmark betaler vi skat af vores indkomst i flere lag. Her er en
          oversigt over hvordan din løn beskattes i 2026:
        </p>

        <h3>1. AM-bidrag ({pct(SATSER_2026.amBidrag)} %)</h3>
        <p>
          Først trækkes <strong>arbejdsmarkedsbidraget</strong> på{" "}
          {pct(SATSER_2026.amBidrag)} % fra din bruttoløn. Dette bidrag går til
          dagpenge, efterløn og andre arbejdsmarkedsordninger.
        </p>

        <h3>2. Personfradrag ({da(SATSER_2026.personfradrag)} kr)</h3>
        <p>
          Alle har ret til et <strong>personfradrag</strong> på{" "}
          {da(SATSER_2026.personfradrag)} kr i 2026. Du betaler ikke skat af dette
          beløb.
        </p>

        <h3>3. Beskæftigelsesfradrag ({pct(SATSER_2026.beskaeftigelsesfradragPct)} %)</h3>
        <p>
          Som lønmodtager får du et ekstra fradrag på{" "}
          {pct(SATSER_2026.beskaeftigelsesfradragPct)} % af din lønindkomst (efter
          AM-bidrag), dog maks. {da(SATSER_2026.beskaeftigelsesfradragMax)} kr i
          2026.
        </p>

        <h3>4. Bundskat ({pct(SATSER_2026.bundskat)} %)</h3>
        <p>
          Alle betaler <strong>bundskat</strong> på {pct(SATSER_2026.bundskat)} %
          af den skattepligtige indkomst (efter fradrag).
        </p>

        <h3>5. Kommuneskat (varierer)</h3>
        <p>
          <strong>Kommuneskatten</strong> varierer fra kommune til kommune.
          Landsgennemsnittet er ca. {pct(SATSER_2026.kommuneskatSnit)} % i 2026.
          Den billigste kommune ligger på {pctTal(LAVESTE_KOMMUNER[0].kommuneskat)} %,{" "}
          {pctTal(HOEJESTE_KOMMUNER[0].kommuneskat)} % er den dyreste.
        </p>

        <h3>6. Kirkeskat (valgfri)</h3>
        <p>
          Medlemmer af folkekirken betaler <strong>kirkeskat</strong> på ca. 0,6-1 %
          (gennemsnit {pct(SATSER_2026.kirkeskatSnit)} %).
        </p>

        <h3>7. Nyt: Mellemskat, topskat og top-topskat (2026)</h3>
        <p>
          Fra 2026 er den gamle topskat på 15% erstattet af tre nye skattebrackets:
        </p>
        <ul>
          <li>
            <strong>Mellemskat ({pct(SATSER_2026.mellemskat)} %):</strong>{" "}
            Indkomst over {da(SATSER_2026.mellemskatGraense)} kr/år (efter
            AM-bidrag)
          </li>
          <li>
            <strong>Topskat ({pct(SATSER_2026.topskat)} %):</strong> Indkomst
            over {da(SATSER_2026.topskatGraense)} kr/år (efter AM-bidrag)
          </li>
          <li>
            <strong>Top-topskat ({pct(SATSER_2026.topTopskat)} %):</strong>{" "}
            Indkomst over {da(SATSER_2026.topTopskatGraense)} kr/år (efter
            AM-bidrag)
          </li>
        </ul>
        <p>
          For de fleste danskere betyder reformen en skattelettelse, da
          mellemskattegrænsen er højere end den gamle topskattegrænse.
        </p>

        <h2>Kommuner med lavest og højest skat (2026)</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
<th>Laveste skatteprocent</th>
              <th>Højeste skatteprocent</th>
            </tr>
          </thead>
          <tbody>
            {LAVESTE_KOMMUNER.map((k, i) => (
              <tr key={k.navn}>
                <td>
                  {k.navn} ({pctTal(k.kommuneskat)} %)
                </td>
                <td>
                  {HOEJESTE_KOMMUNER[i].navn} (
                  {pctTal(HOEJESTE_KOMMUNER[i].kommuneskat)} %)
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        <h2>Tips til at optimere din skat</h2>
        <ul>
          <li>
            <strong>Kørselsfradrag:</strong> Bor du langt fra arbejde, kan du få
            fradrag for transport over 24 km hver vej.
          </li>
          <li>
            <strong>Håndværkerfradrag:</strong> Få fradrag for serviceydelser i
            hjemmet.
          </li>
          <li>
            <strong>Pensionsindbetalinger:</strong> Ratepension og livrente
            giver fradrag.
          </li>
          <li>
            <strong>Fagforeningskontingent:</strong> Op til 7.000 kr kan
            fratrækkes (2026).
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Tip</p>
          <p className="text-blue-700 dark:text-blue-400">
            Tjek din forskudsopgørelse på{" "}
            <a
              href="https://skat.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              skat.dk
            </a>{" "}
            for at se dine præcise fradrag og skatteprocenter.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Opdateret med 2026-skattereform</p>
          <p className="text-green-700 dark:text-green-400">
            Denne beregner er opdateret med det nye skattesystem fra 2026 med mellemskat,
            topskat og top-topskat. Kilde: skm.dk, skat.dk. Sidst verificeret februar 2026.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/loen-efter-skat" />
      </div>

      <Sidebar currentHref="/loen-efter-skat" adSlotId="loen-sidebar" />
    </div>
  );
}
