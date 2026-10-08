import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import KoffeinBeregner from "@/components/KoffeinBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { KOFFEIN_EKSEMPEL, KOFFEIN_GRAENSER, KOFFEIN_KILDER, koffeinBeregning } from "@/lib/koffein";
import { formatNumber } from "@/lib/format";

export async function generateMetadata() {
  return generatePageMetadata("koffein");
}

export default async function KoffeinPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("koffein", locale) || getPageData("koffein", "da")!;
  const se = locale === "se";
  const dec = (v: number) => formatNumber(v, locale, { maximumFractionDigits: 0 });

  const eksempelSvar = koffeinBeregning([{ kilde: KOFFEIN_EKSEMPEL.kilde, gram: KOFFEIN_EKSEMPEL.gram }], KOFFEIN_EKSEMPEL.profil);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/koffein`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/koffein" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <KoffeinBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8 not-prose">
          <h2 className="text-2xl font-bold mb-3">
            {se ? "Koffein i vanliga drycker och mat" : "Koffein i almindelige drikke og mad"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">
                {se ? "Koffein per 100 gram eller 100 milliliter, och i en typisk portion" : "Koffein pr. 100 g eller 100 ml, og i en typisk portion"}
              </caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-2 pr-4">{se ? "Dryck eller mat" : "Drik eller mad"}</th>
                  <th scope="col" className="py-2 pr-4">{se ? "mg/100 g" : "mg/100 g"}</th>
                  <th scope="col" className="py-2 pr-4">{se ? "Typisk portion" : "Typisk portion"}</th>
                  <th scope="col" className="py-2 pr-4">{se ? "mg i portion" : "mg i portion"}</th>
                </tr>
              </thead>
              <tbody>
                {KOFFEIN_KILDER.map((k) => (
                  <tr key={k.id} className="border-b last:border-0">
                    <th scope="row" className="py-2 pr-4 text-left font-medium text-gray-900 dark:text-white">
                      {k[se ? "se" : "da"]}
                    </th>
                    <td className="py-2 pr-4">{dec(k.mgPer100)}</td>
                    <td className="py-2 pr-4">{dec(k.portion)} {se ? "ml/g" : "ml/g"}</td>
                    <td className="py-2 pr-4">{dec(k.portionMg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {se
              ? "Siffrorna kommer från EFSA:s Scientific Opinion on the safety of caffeine (2015) och USDA FoodData Central (SR Legacy 2018-04, näringsämne 1057)."
              : "Tallene kommer fra EFSA's Scientific Opinion on the safety of caffeine (2015) og USDA FoodData Central (SR Legacy 2018-04, næringsstof 1057)."}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>{se ? "EFSA:s gränser för koffein" : "EFSA's grænser for koffein"}</h2>
          <p>
            {se
              ? `EFSA rekommenderar högst ${KOFFEIN_GRAENSER.voksen.dagligMg} mg koffein per dag för vuxna. En endos bör inte överstiga ${KOFFEIN_GRAENSER.voksen.enkeltMg} mg. För gravida och ammande är gränsen ${KOFFEIN_GRAENSER.gravid.dagligMg} mg per dag, och för barn och unga rekommenderas 3 mg per kroppsvikt.`
              : `EFSA anbefaler højst ${KOFFEIN_GRAENSER.voksen.dagligMg} mg koffein om dagen for voksne. En enkeltdosis bør ikke overstige ${KOFFEIN_GRAENSER.voksen.enkeltMg} mg. For gravide og ammende er grænsen ${KOFFEIN_GRAENSER.gravid.dagligMg} mg om dagen, og for børn og unge anbefales 3 mg pr. kropsvægt.`}
          </p>
          <p>
            {se
              ? `En filterkaffe på 200 ml gir cirka ${dec(eksempelSvar.totalMg)} mg koffein — altså ${dec(eksempelSvar.pctAfGraense)} % av den dagliga gränsen för en vuxen.`
              : `En filterkaffe på 200 ml giver cirka ${dec(eksempelSvar.totalMg)} mg koffein — altså ${dec(eksempelSvar.pctAfGraense)} % af den daglige grænse for en voksen.`}
          </p>

          <h2>{se ? "Så påverkar koffein sömnen" : "Sådan påvirker koffein søvnen"}</h2>
          <p>
            {se
              ? "EFSA skriver att en endos på 100 mg kan påverka sömnens längd och kvalitet hos vissa vuxna, särskilt om den intas nära läggdags. Koffein har en halveringstid på cirka 4-6 timmar, så en kaffe på eftermiddagen kan fortfarande påverka sövnen på kvällen."
              : "EFSA skriver, at en enkeltdosis på 100 mg kan påvirke søvnens længde og kvalitet hos voksne, især når den indtages tæt på sengetid. Koffein har en halveringstid på cirka 4-6 timer, så en kaffe om eftermiddagen kan stadig påvirke søvnen om aftenen."}
          </p>

          <h2>{se ? "Vanliga frågor om koffein" : "Ofte stillede spørgsmål om koffein"}</h2>
          <p>
            {se
              ? "Här är svar på de vanligaste frågorna om koffein, baserat på EFSA:s vetenskapliga utlåtande från 2015."
              : "Her er svar på de mest almindelige spørgsmål om koffein, baseret på EFSA's videnskabelige udtalelse fra 2015."}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {se
              ? "Kalkylatorn är vägledande och ersätter inte läkare. Vid graviditet, sömnproblem eller hjärt-kärl-sjukdom bör du rådgöra med en läkare."
              : "Beregneren er vejledende og erstatter ikke en læge. Ved graviditet, søvnbesvær eller hjerte-kar-sygdom bør du rådføre dig med en læge."}
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/koffein" />
      </div>
      <Sidebar currentHref="/koffein" adSlotId="koffein-sidebar" />
    </div>
  );
}
