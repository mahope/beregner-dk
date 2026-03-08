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

        <h3>1. AM-bidrag (8%)</h3>
        <p>
          Først trækkes <strong>arbejdsmarkedsbidraget</strong> på 8% fra din
          bruttoløn. Dette bidrag går til dagpenge, efterløn og andre
          arbejdsmarkedsordninger.
        </p>

        <h3>2. Personfradrag (54.100 kr)</h3>
        <p>
          Alle har ret til et <strong>personfradrag</strong> på 54.100 kr i
          2026 (op fra 49.700 kr). Du betaler ikke skat af dette beløb.
        </p>

        <h3>3. Beskæftigelsesfradrag (12,75%)</h3>
        <p>
          Som lønmodtager får du et ekstra fradrag på 12,75% af din lønindkomst
          (efter AM-bidrag), dog maks. 63.300 kr i 2026 (op fra 45.100 kr).
        </p>

        <h3>4. Bundskat (12,01%)</h3>
        <p>
          Alle betaler <strong>bundskat</strong> af den skattepligtige indkomst
          (efter fradrag). Satsen er sat ned fra 12,22% til 12,01% i 2026.
        </p>

        <h3>5. Kommuneskat (varierer)</h3>
        <p>
          <strong>Kommuneskatten</strong> varierer fra kommune til kommune.
          Landsgennemsnittet er ca. 25,07% i 2026. De billigste kommuner ligger
          omkring 22%, mens de dyreste er over 27%.
        </p>

        <h3>6. Kirkeskat (valgfri)</h3>
        <p>
          Medlemmer af folkekirken betaler <strong>kirkeskat</strong> på ca.
          0,6-1% (gennemsnit 0,68%).
        </p>

        <h3>7. Nyt: Mellemskat, topskat og top-topskat (2026)</h3>
        <p>
          Fra 2026 er den gamle topskat på 15% erstattet af tre nye skattebrackets:
        </p>
        <ul>
          <li>
            <strong>Mellemskat (7,5%):</strong> Indkomst over 641.200 kr/år (efter AM-bidrag)
          </li>
          <li>
            <strong>Topskat (7,5%):</strong> Indkomst over 777.900 kr/år (efter AM-bidrag)
          </li>
          <li>
            <strong>Top-topskat (5%):</strong> Indkomst over 2.592.700 kr/år (efter AM-bidrag)
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
              <tr>
                <td>Rudersdal (22,5%)</td>
                <td>Langeland (27,8%)</td>
              </tr>
              <tr>
                <td>Gentofte (22,8%)</td>
                <td>Ishøj (27,2%)</td>
              </tr>
              <tr>
                <td>Allerød (23,3%)</td>
                <td>Brøndby (27,1%)</td>
              </tr>
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
