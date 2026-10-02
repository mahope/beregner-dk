import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { beregnPace, formaterLobetid } from "@/lib/pace";
import { formatSekunder } from "@/lib/tidsberegner";
import PaceBeregner from "@/components/PaceBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

/**
 * Alle tal i brødteksten dannes af de samme funktioner som værktøjet, så
 * siden ikke kan modsige beregneren. 5 km på 25 minutter og en halvmarahton
 * på 1:45 er de samme to eksempler som /tidsberegners egen tempo-FAQ bruger.
 */
const EKS = beregnPace("tid", 5, 25 * 60, 0)!;
const HALV = beregnPace("tid", 21.0975, 105 * 60, 0)!;

export async function generateMetadata() {
  return generatePageMetadata("pace");
}

export default async function PacePage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("pace", locale) || getPageData("pace", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/pace`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/pace" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <PaceBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan beregner du tempo på en distance</h2>
            <p>
              Tempo er den gennemsnitlige tid pr. kilometer. Den fås ved at <strong>dele løbetiden med distancen</strong>.
              5 km på 25 minutter er {formaterLobetid(EKS.totalSek)}, og det giver {formatSekunder(EKS.sekunderPerKm)} pr.
              kilometer. Det er hele regnestykket — der er ingen anden formel inde i vejen.
            </p>

            <h3>Den anden vej: løbetid ud fra tempo</h3>
            <p>
              Skal du finde ud af, hvor langt du når på en time, er regnestykket det modsatte:{" "}
              <strong>tid = distance × tempo</strong>. 5 km ved {formatSekunder(EKS.sekunderPerKm)} pr. kilometer er 5 × 5
              = 25 minutter. Vælg derfor «Tempo fra løbetid», når du kender tiden, og «Løbetid fra tempo», når du kender
              tempoet.
            </p>

            <h3>Holdtider pr. kilometer</h3>
            <p>
              En løbetid på {formaterLobetid(HALV.totalSek)} over en halvmarahton på 21,0975 km svarer til{" "}
              {formatSekunder(HALV.sekunderPerKm)} pr. kilometer. Værktøjet viser holdtiderne for hver kilometer, og de
              summerer til præcis den samme løbetid som resultatet — sidste kilometer bærer den afrunding, der ellers
              ville hoppe én sekund for hver kilometer.
            </p>

            <h3>De to løbedistancer bruger flest spørgsmål</h3>
            <p>
              Tidsberegneren kan også regne klokkeslæt og timer imellem hinanden, hvis du skal finde ud af, hvornår du
              skal gå hjem for at nå en given sluttid. Vil du i stedet se gennemsnitsfarten i km/t, er det{" "}
              <a href="/fart">fartberegneren</a>.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Så beräknar du pace på en sträcka</h2>
            <p>
              Pace är den genomsnittliga tiden per kilometer. Den fås genom att{" "}
              <strong>dela löptiden med sträckan</strong>. 5 km på 25 minuter är {formaterLobetid(EKS.totalSek)}, vilket ger{" "}
              {formatSekunder(EKS.sekunderPerKm)} per kilometer.
            </p>

            <h3>Åt andra vägen: löptid ut från pace</h3>
            <p>
              Vill du veta hur långt du hinner på en timme är regnestycket omvänt:{" "}
              <strong>tid = sträcka × pace</strong>. 5 km med {formatSekunder(EKS.sekunderPerKm)} per kilometer är 5 × 5 = 25
              minuter.
            </p>

            <h3>Deltider per kilometer</h3>
            <p>
              En löptid på {formaterLobetid(HALV.totalSek)} över en halvmaraton på 21,0975 km motsvarar{" "}
              {formatSekunder(HALV.sekunderPerKm)} per kilometer. Verktyget visar deltiderna för varje kilometer, och de
              summerar till exakt samma löptid som resultatet.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/pace" />
      </div>
      <Sidebar currentHref="/pace" adSlotId="pace-sidebar" />
    </div>
  );
}