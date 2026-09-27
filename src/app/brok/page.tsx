import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { forkortBrok } from "@/lib/brok";
import { formatNumber } from "@/lib/format";
import BrokBeregner from "@/components/BrokBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

/**
 * Worked examples for the prose block. The numbers are always derived from
 * `forkortBrok`, so a printed value can never contradict the calculator above
 * it (C84's failure class).
 */
const OMREGNINGEKSEMPLER: [number, number][] = [
  [1, 2],
  [1, 4],
  [3, 4],
  [1, 8],
  [2, 3],
  [5, 6],
  [7, 10],
];

function decimaltal(taeller: number, naevner: number): string {
  return formatNumber(forkortBrok(taeller, naevner)!.decimal, "da", { maximumFractionDigits: 3 });
}

function procent(taeller: number, naevner: number): string {
  return formatNumber(forkortBrok(taeller, naevner)!.procent, "da", { maximumFractionDigits: 1 });
}

export async function generateMetadata() {
  return generatePageMetadata("brok");
}

export default async function BrokPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("brok", locale) || getPageData("brok", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/brok`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/brok" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <BrokBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Forkort en brøk</h2>
            <p>
              At <strong>forkorte en brøk</strong> vil sige at gøre tæller og nævner så små som
              muligt uden at ændre værdien. Det gør man ved at dividere begge tal med deres{" "}
              <strong>største fælles divisor</strong>. Fx bliver 6/8 til 3/4, fordi begge tal kan
              divideres med 2.
            </p>
            <h2>Brøk, decimaltal og procent</h2>
            <p>
              Beregneren viser samtidig brøken som <strong>decimaltal</strong>               (3/4 = 0,75) og{" "}
              <strong>procent</strong> (75 %). Det er praktisk i skolen, i køkkenet og alle andre
              steder, hvor du skal skifte mellem de tre måder at skrive et forhold på. Indtast hele
              tal i tæller og nævner.
            </p>
            <h2>Brøkregning: de fire regneregler</h2>
            <p>
              Beregneren forkorter én brøk. Når du skal <strong>regne med</strong> brøker — lægge dem
              sammen, trække dem fra, gange og dele dem — er der fire regler, og alle fire er
              regnestykker du kan læse fra venstre til højre:
            </p>
            <ul>
              <li>
                <strong>Plus:</strong> nævnerne skal være ens. 1/2 + 1/3 = 3/6 + 2/6 ={" "}
                <strong>5/6</strong> = {decimaltal(5, 6)} = {procent(5, 6)} %.
              </li>
              <li>
                <strong>Minus:</strong> nævnerne skal være ens, og så forkorter du. 3/4 − 1/4 = 2/4 ={" "}
                <strong>1/2</strong> = {decimaltal(1, 2)} = {procent(1, 2)} %.
              </li>
              <li>
                <strong>Gange:</strong> tæller ganges med tæller, nævner med nævner, og så forkorter
                du. 1/2 × 2/3 = (1 × 2)/(2 × 3) = 2/6 = <strong>1/3</strong> = {decimaltal(1, 3)} ={" "}
                {procent(1, 3)} %.
              </li>
              <li>
                <strong>Dele:</strong> byt om, og vend den nævner, du flytter op. 1/2 ÷ 2/3 = 1/2 × 3/2
                = 3/4 = <strong>{decimaltal(3, 4)}</strong> = {procent(3, 4)} %.
              </li>
            </ul>
            <p>
              Den fælde, der driller flest, er <strong>plus og minus</strong>: de er de eneste to af de
              fire, hvor nævnerne skal være ens inden regningen. Kan du ikke få dem til at blive ens,
              kan du ikke regne — og det er derfor de to regler tager længst tid.
            </p>
            <h3>Sådan omregner du en brøk til procent og decimaltal</h3>
            <p>
              Formlen er én linje: <strong>procent = brøk × 100</strong>. Decimaltallet får du ved at
              dividere tæller med nævner. Samme brøk kan altså skrives på tre måder, og alle tre er
              i tabellen:
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Brøk</th>
                    <th>Decimaltal</th>
                    <th>Procent</th>
                  </tr>
                </thead>
                <tbody>
                  {OMREGNINGEKSEMPLER.map(([t, n]) => (
                    <tr key={`${t}/${n}`}>
                      <td>
                        {t}/{n}
                      </td>
                      <td>{decimaltal(t, n)}</td>
                      <td>{procent(t, n)} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>Sådan regner du en brøkdel af et tal</h3>
            <p>
              Det er det, de fleste egentlig bruger brøker til. <strong>3/4 af 200 kr.</strong> betyder
              at tage tælleren gange med beløbet og dividere med nævneren: (3 × 200) ÷ 4 ={" "}
              <strong>150 kr.</strong> Tilsvarende er 1/4 af 1.000 kr. = 1.000 ÷ 4 = 250 kr., og 2/5
              af 250 kr. = (2 × 250) ÷ 5 = 100 kr. Skriv brøkdelen som procent, og du får det samme
              svar: 3/4 er 75 %, og 75 % af 200 er 150.
            </p>
            <p>
              <a href="/procent" className="underline hover:no-underline">
                Procentberegneren
              </a>{" "}
              tager den anden vej: den regner procent af et beløb, som er det samme tal.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Förkorta ett bråk</h2>
            <p>
              Att <strong>förkorta ett bråk</strong> innebär att göra täljare och nämnare så små som
              möjligt utan att ändra värdet. Det gör man genom att dela båda talen med deras{" "}
              <strong>största gemensamma delare</strong>. T.ex. blir 6/8 till 3/4, eftersom båda talen
              kan delas med 2.
            </p>
            <h2>Bråk, decimaltal och procent</h2>
            <p>
              Kalkylatorn visar samtidigt bråket som <strong>decimaltal</strong> (3/4 = 0,75) och{" "}
              <strong>procent</strong> (75 %). Det är praktiskt i skolan, i köket och överallt annars
              där du behöver växla mellan de tre sätten att skriva ett förhållande. Ange heltal i
              täljare och nämnare.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/brok" />
      </div>
      <Sidebar currentHref="/brok" adSlotId="brok-sidebar" />
    </div>
  );
}
