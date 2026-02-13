import type { Metadata } from "next";
import ArveafgiftBeregner from "@/components/ArveafgiftBeregner";
import {
  CalculatorSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Arveafgift beregner - Beregn arveafgift i Danmark | Beregner.dk",
  description:
    "Beregn arveafgift i Danmark. Se hvor meget du skal betale i boafgift baseret på din relation til afdøde. Gratis beregner med 2026 satser og regler.",
  keywords: "arveafgift beregner, boafgift, arveskat, dansk arveafgift",
};

export default function ArveafgiftPage() {
  return (
    <div>
      <CalculatorSchema
        name="Arveafgift beregner - Beregn arveafgift i Danmark"
        description="Gratis arveafgift beregner. Beregn boafgift baseret på din relation: ægtefælle (fritaget), børn (15%), søskende (15% + 25% tillægsafgift)."
        url={`${baseUrl}/arveafgift`}
        category="FinanceApplication"
      />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Arveafgift beregner", url: `${baseUrl}/arveafgift` },
        ]}
      />
      <h1 className="text-3xl font-bold mb-2">Arveafgift beregner</h1>
      <p className="text-gray-600 mb-8">
        Beregn arveafgift i Danmark baseret på din relation til afdøde og størrelsen af arven.
      </p>

      <ArveafgiftBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Arveafgift i Danmark</h2>
        <p>
          Arveafgift (også kaldet boafgift) er en skat, der betales af arvinger 
          efter en persons død. Reglerne varierer afhængigt af din relation til afdøde.
        </p>

        <h2>Bundfradrag og satser (2026)</h2>
        <table>
          <thead>
            <tr>
              <th>Relation</th>
              <th>Boafgift</th>
              <th>Tillægsafgift</th>
              <th>Bundfradrag</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ægtefælle</td>
              <td>0% (fritaget)</td>
              <td>0%</td>
              <td>Ubegrænset</td>
            </tr>
            <tr>
              <td>Børn, børnebørn, forældre</td>
              <td>15%</td>
              <td>0%</td>
              <td>321.700 kr</td>
            </tr>
            <tr>
              <td>Søskende</td>
              <td>15%</td>
              <td>25% af boafgiften</td>
              <td>321.700 kr</td>
            </tr>
            <tr>
              <td>Andre (venner, fjern familie)</td>
              <td>15%</td>
              <td>25% af boafgiften</td>
              <td>321.700 kr</td>
            </tr>
          </tbody>
        </table>

        <h2>Hvem betaler arveafgift?</h2>
        
        <h3>Ægtefælle</h3>
        <p>
          Ægtefæller er <strong>helt fritaget</strong> for arveafgift i Danmark. 
          Dette gælder uanset størrelsen af arven. Ægtefællen arver alt boet 
          afgiftsfrit.
        </p>

        <h3>Børn, børnebørn og forældre</h3>
        <p>
          Nærmeste familie betaler 15% i boafgift af beløbet over bundfradraget 
          på 321.700 kr. Der er ingen tillægsafgift for denne gruppe.
        </p>
        <ul>
          <li><strong>Børn:</strong> Arv fra forældre</li>
          <li><strong>Børnebarn:</strong> Arv fra bedsteforældre</li>
          <li><strong>Forældre:</strong> Arv fra voksne børn (hvis der ikke er ægtefælle eller børn)</li>
        </ul>

        <h3>Søskende</h3>
        <p>
          Søskende betaler 15% boafgift plus 25% tillægsafgift af boafgiften. 
          Det giver en effektiv sats på 18,75% af det overskydende beløb.
        </p>

        <h3>Andre arvinger</h3>
        <p>
          Venner, fjern familie og andre uden direkte familiemæssig tilknytning 
          betaler samme sats som søskende: 15% boafgift + 25% tillægsafgift.
        </p>

        <h2>Bundfradraget</h2>
        <p>
          Bundfradraget på 321.700 kr (2026) gælder for alle arvinger undtagen 
          ægtefæller. Det betyder, at de første 321.700 kr af arven er 
          afgiftsfri — uanset hvem der arver.
        </p>
        <p>
          <strong>Eksempel:</strong> Et barn arver 1.000.000 kr. Arveafgiften 
          beregnes således: (1.000.000 - 321.700) × 15% = 101.745 kr i afgift.
        </p>

        <h2>Hvornår skal arveafgift betales?</h2>
        <p>
          Arveafgiften skal betales til Skattestyrelsen inden 1 år efter dødsfaldet. 
          Boet afvikles typisk gennem en bobestyrer eller advokat, som sørger 
          for at beregne og afregne afgifterne.
        </p>

        <h2>Ofte stillede spørgsmål</h2>
        <h3>Kan ægtefæller undgå arveafgift?</h3>
        <p>
          Ja, ægtefæller er fuldstændig fritaget for arveafgift. Det anbefales 
          ofte at oprette ægtepagt, så den længstlevende ægtefælle sikres bedst 
          muligt.
        </p>

        <h3>Hvad er tillægsafgift?</h3>
        <p>
          Tillægsafgift er en ekstra afgift på 25% af boafgiften (ikke af 
          arvebeløbet). Den gælder for søskende og andre arvinger, der ikke 
          er i direkte op- eller nedstigende linje.
        </p>

        <h3>Har børnebarn samme rettigheder som børn?</h3>
        <p>
          Ja, børnebarn betaler samme sats som biologiske børn: 15% boafgift 
          uden tillægsafgift. Der er dog en undtagelse, hvis barnets forældre 
          stadig lever — i så fald arver bedsteforældrenes formue typisk gennem 
          forældrene først.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på gældende 2026-satser. 
            De faktiske afgifter kan variere afhængigt af boets specifikke 
            forhold. Vi anbefaler at kontakte en bobestyrer eller advokat 
            for præcis beregning.
          </p>
        </div>
      </div>
    </div>
  );
}
