import type { Metadata } from "next";
import BoernepengBeregner from "@/components/BoernepengBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Børnepenge Beregner 2026 - Børne- og ungeydelse",
  description:
    "Gratis børnepenge beregner. Beregn din børne- og ungeydelse (børnecheck) for 2026. Se hvad du får udbetalt baseret på dine børns alder og din indkomst.",
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
  ],
  openGraph: {
    title: "Børnepenge Beregner 2026 - Børne- og ungeydelse",
    description:
      "Beregn din børne- og ungeydelse med de nyeste 2026 satser. Gratis børnepenge beregner.",
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
      "Forældre med børn under 18 år, hvor barnet bor i Danmark, og mindst én forælder er dansk statsborger eller har haft bopæl i DK i min. 2 år. Ydelsen udbetales til den forælder barnet bor hos.",
  },
  {
    question: "Hvor meget får jeg i børnepenge 2026?",
    answer:
      "I 2026 er satserne ca.: 0-2 år: 19.296 kr/år (4.824 kr/kvartal), 3-6 år: 15.276 kr/år (3.819 kr/kvartal), 7-14 år: 12.012 kr/år (3.003 kr/kvartal), 15-17 år: ca. 1.001 kr/måned.",
  },
  {
    question: "Hvornår udbetales børnepenge?",
    answer:
      "For børn 0-14 år udbetales kvartalsvis (januar, april, juli, oktober). For unge 15-17 år udbetales månedligt direkte til den unge selv.",
  },
  {
    question: "Bliver børnepenge modregnet ved høj indkomst?",
    answer:
      "Ja, hvis husstandens samlede indkomst overstiger ca. 961.100 kr. (2026), aftrappes ydelsen med 2% for hver 2.500 kr. over grænsen. Ved meget høje indkomster kan ydelsen blive 0 kr.",
  },
  {
    question: "Hvordan deles børnepenge ved delt bopæl?",
    answer:
      "Ved delt bopæl (7/7-ordning) kan ydelsen deles mellem forældrene, så hver får halvdelen. Begge forældre skal søge om deling via Digital Post til Udbetaling Danmark.",
  },
  {
    question: "Hvad får enlige forsørgere ekstra?",
    answer:
      "Enlige forsørgere kan få ordinært børnetilskud (ca. 6.300 kr/kvartal), ekstra børnetilskud (ca. 6.600 kr/kvartal, kun én gang uanset antal børn), og evt. særligt børnetilskud hvis anden forælder er død/ukendt.",
  },
  {
    question: "Er børnepenge skattefrie?",
    answer:
      "Ja, børne- og ungeydelsen er skattefri. Du skal ikke betale skat af beløbet, og det påvirker ikke din skattepligtige indkomst.",
  },
  {
    question: "Hvordan søger jeg om børnepenge?",
    answer:
      "Børneydelsen udbetales automatisk når dit barn får et CPR-nummer. Ved særlige forhold (delt bopæl, høj indkomst, enlig forsørger) kan du administrere ydelsen på borger.dk.",
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
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Børnepenge Beregner", url: `${baseUrl}/boernepenge` },
        ]}
      />

      <nav className="text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-blue-600">
          Forside
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Børnepenge Beregner</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Børnepenge Beregner 2026</h1>
      <p className="text-gray-600 mb-8">
        Beregn din børne- og ungeydelse baseret på dine børns alder og din
        husstandsindkomst. Opdateret med de officielle 2026-satser.
      </p>

      <BoernepengBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Om børne- og ungeydelse</h2>
        <p>
          Børne- og ungeydelsen (ofte kaldet &quot;børnepenge&quot; eller
          &quot;børnecheck&quot;) er en skattefri ydelse, som{" "}
          <strong>Udbetaling Danmark</strong> udbetaler til forældre med børn
          under 18 år.
        </p>

        <h3>Børnepenge satser 2026</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Alder</th>
                <th>Årligt</th>
                <th>Kvartalsvis/Månedlig</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0-2 år</td>
                <td>19.296 kr</td>
                <td>4.824 kr/kvartal</td>
              </tr>
              <tr>
                <td>3-6 år</td>
                <td>15.276 kr</td>
                <td>3.819 kr/kvartal</td>
              </tr>
              <tr>
                <td>7-14 år</td>
                <td>12.012 kr</td>
                <td>3.003 kr/kvartal</td>
              </tr>
              <tr>
                <td>15-17 år</td>
                <td>12.012 kr</td>
                <td>1.001 kr/måned</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Aftrapning for høje indkomster</h2>
        <p>
          Hvis husstandens samlede indkomst overstiger 961.100 kr. (2026),
          aftrappes ydelsen med 2% for hver 2.500 kr. over grænsen.
        </p>
        <p>Ved meget høje indkomster kan ydelsen blive fuldt aftrappet (0 kr.).</p>

        <h2>Delt bopæl</h2>
        <p>
          Hvis barnet har delt bopæl (7/7-ordning), deles ydelsen mellem
          forældrene:
        </p>
        <ul>
          <li>Hver forælder får halvdelen af ydelsen</li>
          <li>Kræver at begge forældre søger om deling</li>
          <li>Kan aftales via Digital Post til Udbetaling Danmark</li>
        </ul>

        <h2>Ekstra ydelser til enlige forsørgere</h2>
        <p>Enlige forsørgere kan derudover være berettiget til:</p>
        <ul>
          <li>
            <strong>Ordinært børnetilskud:</strong> Ca. 6.300 kr. pr. kvartal
          </li>
          <li>
            <strong>Ekstra børnetilskud:</strong> Ca. 6.600 kr. pr. kvartal (kun
            én gang)
          </li>
          <li>
            <strong>Særligt børnetilskud:</strong> Hvis den anden forælder er
            død/ukendt
          </li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Ansøg og administrer</p>
          <p className="text-blue-700">
            Du kan ansøge om og administrere din børneydelse på{" "}
            <a
              href="https://www.borger.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              borger.dk
            </a>
          </p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6 not-prose">
          <p className="font-medium text-green-800">Opdateret med 2026-satser</p>
          <p className="text-green-700">
            Satserne i denne beregner er de officielle 2026-satser fra
            Skatteministeriet og borger.dk.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/boernepenge" />
    </div>
  );
}
