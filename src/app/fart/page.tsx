import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { beregnFart } from "@/lib/fart";
import { formatNumber } from "@/lib/format";
import FartBeregner from "@/components/FartBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

/**
 * Fart-hastighederne i tempo-tabellen. Rækkerne er de hastigheder, dansk
 * autocomplete spørger om under "fart beregner cykel" og "fart beregner løb",
 * og tempoet udledes af beregnFart — brødteksten kan derfor ikke modsige
 * værktøjet ovenfor.
 */
const FART_TEMPO: { fart: number; typisk: string }[] = [
  { fart: 8, typisk: "rolig løbetur" },
  { fart: 10, typisk: "løb" },
  { fart: 12, typisk: "hurtig løbetur" },
  { fart: 15, typisk: "løb på 5 min/km" },
  { fart: 20, typisk: "cykel" },
  { fart: 25, typisk: "cykel" },
  { fart: 30, typisk: "hurtig cykel" },
];

/** Timer med én decimal, f.eks. 300 km ved 100 km/t = 3 timer. */
function timer(antalTimer: number): string {
  return formatNumber(antalTimer, "da", { maximumFractionDigits: 1 });
}

/** Tempo i min/km udledt af værktøjets egen formel: 60 ÷ fart. */
function tempo(fart: number): string {
  const r = beregnFart("fart", 0, 1, 1 / fart);
  return formatNumber(r ? r.paceMinPrKm : 0, "da", { maximumFractionDigits: 1 });
}

/** 300 km ved 100 km/t, regnet af modulet: 3 timer. */
function tid300(): string {
  const r = beregnFart("tid", 100, 300, 0);
  return `${timer(r?.tid ?? 0)} timer`;
}

/** 100 km på 2 timer, regnet af modulet: 50 km/t. */
function fart100(): string {
  const r = beregnFart("fart", 0, 100, 2);
  return formatNumber(r?.fart ?? 0, "da", { maximumFractionDigits: 1 });
}

/** 50 km/t i 2 timer, regnet af modulet: 100 km. */
function distance50(): string {
  const r = beregnFart("distance", 50, 0, 2);
  return `${formatNumber(r?.distance ?? 0, "da", { maximumFractionDigits: 1 })} km`;
}

export async function generateMetadata() {
  return generatePageMetadata("fart");
}

export default async function FartPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("fart", locale) || getPageData("fart", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/fart`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/fart" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <FartBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beregn fart, distance eller tid</h2>
            <p>
              Sammenhængen er enkel: <strong>distance = fart × tid</strong>. Kender du to af de tre
              værdier, regner beregneren den sidste ud. Vælg, om du vil finde <strong>farten</strong>{" "}
              (fx km/t), <strong>distancen</strong> eller <strong>tiden</strong>, og udfyld de to
              øvrige felter.
            </p>
            <h2>Sådan beregner du tid ud fra hastighed og distance</h2>
            <p>
              Den ene formel kan flyttes rundt, så du kan finde alle tre størrelser. Det er præcis de
              tre regnestykker, beregneren laver — med tal, du kan efterprøve i hovedet:
            </p>
            <ul>
              <li>
                <strong>Tid ud fra hastighed og distance:</strong> 300 km ÷ 100 km/t ={" "}
                <strong>{tid300()}</strong> — altså 3 timer, som er 180 minutter.
              </li>
              <li>
                <strong>Fart ud fra distance og tid:</strong> 100 km ÷ 2 timer ={" "}
                <strong>{fart100()} km/t</strong>.
              </li>
              <li>
                <strong>Distance ud fra fart og tid:</strong> 50 km/t × 2 timer ={" "}
                <strong>{distance50()}</strong>.
              </li>
            </ul>
            <p>
              <strong>Den fælde, der driller mest:</strong> regnestykket giver <em>3</em> — men
              det er <em>3 timer</em>, ikke 3 minutter. Distance og fart står begge pr. time, så
              svaret kommer ud i timer. Skal du bruge det i minutter, ganger du med 60.
            </p>
            <h3>Fart og tempo er ikke det samme</h3>
            <p>
              Farten står i km/t, mens løbere og cyklister taler i <strong>tempo i minutter pr.
              kilometer</strong>. Omregningen er tempo = 60 ÷ farten, og derfor er de to tal altid
              modsat hinanden: tempoet <em>falder</em>, når farten <em>stiger</em>.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Fart</th>
                  <th>Tempo</th>
                  <th>Typisk for</th>
                </tr>
              </thead>
              <tbody>
                {FART_TEMPO.map(({ fart, typisk }) => (
                  <tr key={fart}>
                    <td>{formatNumber(fart, "da")} km/t</td>
                    <td>{tempo(fart)} min/km</td>
                    <td>{typisk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              Vil du vide, hvad turen koster i brændstof, regner du videre på{" "}
              <a href="/braendstof">brændstofberegneren</a>.
            </p>
            <h2>Tempo til løb og cykling</h2>
            <p>
              Ud over farten viser beregneren dit <strong>tempo i minutter pr. kilometer</strong>,
              som er den målemetode, løbere og cyklister oftest bruger. En fart på 10 km/t svarer til
              et tempo på 6 min/km. Det gør det let at planlægge en løbetur eller tjekke, om du
              holder det tempo, du sigter efter.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beräkna hastighet, sträcka eller tid</h2>
            <p>
              Sambandet är enkelt: <strong>sträcka = hastighet × tid</strong>. Känner du till två av
              de tre värdena räknar kalkylatorn ut det sista. Välj om du vill hitta{" "}
              <strong>hastigheten</strong> (t.ex. km/h), <strong>sträckan</strong> eller{" "}
              <strong>tiden</strong>, och fyll i de två övriga fälten.
            </p>
            <h2>Tempo för löpning och cykling</h2>
            <p>
              Utöver hastigheten visar kalkylatorn ditt <strong>tempo i minuter per kilometer</strong>,
              vilket är så löpare och cyklister oftast mäter fart. En hastighet på 10 km/h motsvarar
              ett tempo på 6 min/km. Det gör det lätt att planera en löprunda eller kontrollera att du
              håller det tempo du siktar på.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/fart" />
      </div>
      <Sidebar currentHref="/fart" adSlotId="fart-sidebar" />
    </div>
  );
}
