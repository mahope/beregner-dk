import type { Metadata } from "next";
import BoernepengBeregner from "@/components/BoernepengBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Børnepenge Beregner 2026 - Børne- og ungeydelse",
  description:
    "Beregn børnepenge 2026. Officielle satser: 0-2 år: 5.370 kr/kvartal, 3-6 år: 4.251 kr/kvartal, 7-14 år: 3.345 kr/kvartal, 15-17 år: 1.115 kr/md. Beregn ud fra antal børn og indkomst.",
  keywords: [
    "børnepenge",
    "børnepenge beregner",
    "børne- og ungeydelse",
    "børnecheck",
    "børnepenge 2026",
    "børnetilskud",
    "hvad får jeg i børnepenge",
    "børneydelse beregner",
    "børnepenge satser",
    "børnepenge satser 2026",
    "ungeydelse 2026",
  ],
  openGraph: {
    title: "Børnepenge Beregner 2026 - Børne- og ungeydelse",
    description:
      "Beregn din børne- og ungeydelse med officielle 2026-satser. Se hvad du får udbetalt med ny deling mellem forældre.",
    url: `${baseUrl}/boernepenge`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/boernepenge`,
  },
};

const faqItems = [
  {
    question: "Hvem kan få børne- og ungeydelse?",
    answer:
      "Forældre med børn under 18 år, hvor barnet bor i Danmark, og mindst én forælder er dansk statsborger eller har haft bopæl i DK i min. 2 år. Siden 2022 deles ydelsen som standard mellem forældre med fælles forældremyndighed.",
  },
  {
    question: "Hvor meget får jeg i børnepenge 2026?",
    answer:
      "I 2026 er de officielle satser: 0-2 år: 21.480 kr/år (5.370 kr/kvartal), 3-6 år: 17.004 kr/år (4.251 kr/kvartal), 7-14 år: 13.380 kr/år (3.345 kr/kvartal), 15-17 år: 1.115 kr/måned (13.380 kr/år). Ved fælles forældremyndighed modtager hver forælder halvdelen.",
  },
  {
    question: "Hvornår udbetales børnepenge?",
    answer:
      "Børneydelsen (0-14 år) udbetales kvartalsvis forud den 20. i januar, april, juli og oktober. Ungeydelsen (15-17 år) udbetales månedligt den 20. i hver måned direkte til den unge.",
  },
  {
    question: "Bliver børnepenge modregnet ved høj indkomst?",
    answer:
      "Ja, hvis din indkomst overstiger 961.100 kr. i 2026, nedsættes ydelsen med 2% af beløbet over grænsen. Eksempel: tjener du 1.000.000 kr., reduceres ydelsen med 2% af 38.900 kr. = 778 kr. årligt.",
  },
  {
    question: "Hvordan deles børnepenge mellem forældre?",
    answer:
      "Siden januar 2022 deles børne- og ungeydelsen som standard ligeligt mellem forældre med fælles forældremyndighed. Hver forælder modtager halvdelen af ydelsen. Bor barnet kun hos den ene forælder, kan man søge om at få hele ydelsen.",
  },
  {
    question: "Hvad får enlige forsørgere ekstra?",
    answer:
      "Enlige forsørgere kan udover børne- og ungeydelsen få: ordinært børnetilskud (ca. 6.300 kr/kvartal per barn), ekstra børnetilskud (ca. 6.600 kr/kvartal, kun én gang uanset antal børn), og evt. særligt børnetilskud hvis den anden forælder er død eller ukendt.",
  },
  {
    question: "Er børnepenge skattefrie?",
    answer:
      "Ja, børne- og ungeydelsen er skattefri. Du skal ikke betale skat af beløbet, og det påvirker ikke din skattepligtige indkomst eller offentlige ydelser som boligstøtte.",
  },
  {
    question: "Hvordan søger jeg om børnepenge?",
    answer:
      "Børneydelsen udbetales automatisk når dit barn får et CPR-nummer. Du behøver ikke søge. Ved særlige forhold som eneforældremyndighed, delt bopæl eller høj indkomst kan du administrere ydelsen via borger.dk eller Digital Post til Udbetaling Danmark.",
  },
];

export default function BoernepengePage() {
  return (
    <div>
      <CalculatorSchema
        name="Børnepenge Beregner - Børne- og ungeydelse"
        description="Gratis børnepenge beregner. Beregn din børne- og ungeydelse for 2026."
        url={`${baseUrl}/boernepenge`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Familie", href: "/kategori/familie" }, { name: "Børnepenge Beregner", href: "/boernepenge" }]} />

      <h1 className="text-3xl font-bold mb-2">Børnepenge Beregner 2026</h1>
      <p className="text-gray-600 mb-8">
        Beregn din børne- og ungeydelse baseret på dine børns alder og din
        husstandsindkomst. Opdateret med de officielle 2026-satser.
      </p>

      <BoernepengBeregner />

      <div className="mt-12 prose max-w-none dark:prose-invert">
        <h2>Om børne- og ungeydelse</h2>
        <p>
          Børne- og ungeydelsen (ofte kaldet &quot;børnepenge&quot; eller
          &quot;børnecheck&quot;) er en skattefri ydelse, som{" "}
          <strong>Udbetaling Danmark</strong> udbetaler til forældre med børn
          under 18 år. Ydelsen udbetales automatisk og kræver ingen ansøgning.
        </p>
        <p>
          Siden <strong>januar 2022</strong> deles ydelsen som standard <strong>ligeligt mellem forældre</strong>
          med <strong>fælles forældremyndighed</strong> — hver forælder modtager halvdelen.
        </p>

        <h3>Børnepenge satser 2026 (officielle)</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Alder</th>
                <th>Årligt</th>
                <th>Udbetaling</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0-2 år</td>
                <td>21.480 kr</td>
                <td>5.370 kr/kvartal</td>
              </tr>
              <tr>
                <td>3-6 år</td>
                <td>17.004 kr</td>
                <td>4.251 kr/kvartal</td>
              </tr>
              <tr>
                <td>7-14 år</td>
                <td>13.380 kr</td>
                <td>3.345 kr/kvartal</td>
              </tr>
              <tr>
                <td>15-17 år (ungeydelse)</td>
                <td>13.380 kr</td>
                <td>1.115 kr/måned</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm">
          <strong>Børneydelsen</strong> (0-14 år) udbetales <strong>kvartalsvis</strong> forud den 20. i januar, april, juli og oktober.
          <strong>Ungeydelsen</strong> (15-17 år) udbetales <strong>månedligt</strong> den 20. direkte til den unge.
        </p>

        <h2>Aftrapning for høje indkomster</h2>
        <p>
          Hvis din indkomst overstiger <strong>961.100 kr.</strong> i 2026,
          nedsættes ydelsen med 2% af beløbet over grænsen.
        </p>
        <p>
          <strong>Eksempel:</strong> Tjener du 1.100.000 kr., er du 138.900 kr. over grænsen.
          Aftrapningen bliver 2% × 138.900 kr. = 2.778 kr. årligt.
        </p>

        <h2>Deling mellem forældre</h2>
        <p>
          Siden <strong>januar 2022</strong> deles ydelsen automatisk mellem forældre med <strong>fælles
          forældremyndighed</strong>. Det betyder:
        </p>
        <ul>
          <li>Hver forælder modtager halvdelen af ydelsen</li>
          <li>Gælder uanset barnets bopæl</li>
          <li>Bor barnet kun hos én forælder, kan man søge om fuld ydelse via borger.dk</li>
        </ul>

        <h2>Ekstra ydelser til enlige forsørgere</h2>
        <p>Enlige forsørgere kan derudover være berettiget til:</p>
        <ul>
          <li>
            <strong>Ordinært børnetilskud:</strong> Ca. 6.300 kr. pr. kvartal per barn
          </li>
          <li>
            <strong>Ekstra børnetilskud:</strong> Ca. 6.600 kr. pr. kvartal (kun
            én gang uanset antal børn)
          </li>
          <li>
            <strong>Særligt børnetilskud:</strong> Hvis den anden forælder er
            død eller ukendt
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Ansøg og administrer</p>
          <p className="text-blue-700 dark:text-blue-400">
            Du kan administrere din børneydelse på{" "}
            <a
              href="https://www.borger.dk/familie-og-boern/Familieydelser-oversigt/Boerne-ungeydelse"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              borger.dk
            </a>
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Opdateret med 2026-satser</p>
          <p className="text-green-700 dark:text-green-400">
            Satserne i denne beregner er de officielle 2026-satser fra
            borger.dk. Sidst verificeret februar 2026.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/boernepenge" />
    </div>
  );
}
