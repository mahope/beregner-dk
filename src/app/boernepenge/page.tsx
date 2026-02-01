import type { Metadata } from "next";
import BoernepengBeregner from "@/components/BoernepengBeregner";

export const metadata: Metadata = {
  title: "Børnepenge Beregner - Børne- og ungeydelse 2026 | Beregner.dk",
  description:
    "Beregn din børne- og ungeydelse (børnepenge) for 2026. Se hvad du får udbetalt baseret på dine børns alder og din indkomst.",
};

export default function BoernepengePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Børnepenge Beregner</h1>
      <p className="text-gray-600 mb-8">
        Beregn din børne- og ungeydelse baseret på dine børns alder og din husstandsindkomst.
      </p>

      <BoernepengBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Om børne- og ungeydelse</h2>
        <p>
          Børne- og ungeydelsen (ofte kaldet "børnepenge" eller "børnecheck") er en 
          skattefri ydelse, som <strong>Udbetaling Danmark</strong> udbetaler til forældre 
          med børn under 18 år.
        </p>

        <h3>Hvem kan få børneydelse?</h3>
        <ul>
          <li>Forældre med børn under 18 år</li>
          <li>Barnet skal bo i Danmark</li>
          <li>Mindst én forælder skal være dansk statsborger eller have haft bopæl i DK i min. 2 år</li>
          <li>Ydelsen udbetales til den forælder, barnet bor hos</li>
        </ul>

        <h3>Udbetaling</h3>
        <p>
          <strong>0-14 år:</strong> Udbetales kvartalsvis (januar, april, juli, oktober)<br />
          <strong>15-17 år:</strong> Udbetales månedligt direkte til den unge
        </p>

        <h2>Aftrapning for høje indkomster</h2>
        <p>
          Hvis husstandens samlede indkomst overstiger 961.100 kr. (2026), 
          aftrappes ydelsen med 2% for hver 2.500 kr. over grænsen.
        </p>
        <p>
          Ved meget høje indkomster kan ydelsen blive fuldt aftrappet (0 kr.).
        </p>

        <h2>Delt bopæl</h2>
        <p>
          Hvis barnet har delt bopæl (7/7-ordning), deles ydelsen mellem forældrene:
        </p>
        <ul>
          <li>Hver forælder får halvdelen af ydelsen</li>
          <li>Kræver at begge forældre søger om deling</li>
          <li>Kan aftales via Digital Post til Udbetaling Danmark</li>
        </ul>

        <h2>Ekstra ydelser til enlige forsørgere</h2>
        <p>
          Enlige forsørgere kan derudover være berettiget til:
        </p>
        <ul>
          <li><strong>Ordinært børnetilskud:</strong> Ca. 6.300 kr. pr. kvartal</li>
          <li><strong>Ekstra børnetilskud:</strong> Ca. 6.600 kr. pr. kvartal (kun én gang)</li>
          <li><strong>Særligt børnetilskud:</strong> Hvis den anden forælder er død/ukendt</li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
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

        <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
          <p className="font-medium text-green-800">Opdateret</p>
          <p className="text-green-700">
            Satserne i denne beregner er de officielle 2026-satser fra 
            Skatteministeriet og borger.dk.
          </p>
        </div>
      </div>
    </div>
  );
}
