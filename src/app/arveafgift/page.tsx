import type { Metadata } from "next";
import ArveafgiftBeregner from "@/components/ArveafgiftBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Arveafgift beregner - Beregn arveafgift i Danmark | Beregner.dk",
  description:
    "Beregn arveafgift i Danmark. Se hvor meget du skal betale i boafgift baseret på din relation til afdøde. Gratis beregner med 2026 satser og regler.",
  keywords: "arveafgift beregner, boafgift, arveskat, dansk arveafgift",
};

const arveafgiftFaqItems = [
  {
    question: "Hvad er arveafgiften i Danmark i 2026?",
    answer:
      "I 2026 betaler nærmeste familie (børn, børnebørn, forældre) 15% boafgift af arv over bundfradraget på 392.300 kr. Ægtefæller er helt fritaget. Søskende og andre betaler 15% boafgift plus 25% tillægsafgift af arven efter boafgiften.",
  },
  {
    question: "Kan ægtefæller undgå arveafgift?",
    answer:
      "Ja, ægtefæller er fuldstændig fritaget for arveafgift i Danmark uanset beløbets størrelse. Det anbefales ofte at oprette ægtepagt, så den længstlevende ægtefælle sikres bedst muligt.",
  },
  {
    question: "Hvad er tillægsafgift på arv?",
    answer:
      "Tillægsafgift er en ekstra afgift på 25% af arven efter fradrag af boafgiften. Der er intet bundfradrag for tillægsafgiften. Den gælder for søskende (indtil 2027) og andre arvinger, der ikke er i direkte op- eller nedstigende linje.",
  },
  {
    question: "Hvad er bundfradraget for arveafgift i 2026?",
    answer:
      "Bundfradraget er 392.300 kr i 2026. Det betyder, at de første 392.300 kr af arven er afgiftsfri for alle arvinger undtagen ægtefæller (som er helt fritaget).",
  },
  {
    question: "Betaler børnebørn samme arveafgift som børn?",
    answer:
      "Ja, børnebørn betaler samme sats som biologiske børn: 15% boafgift uden tillægsafgift. Der er dog en undtagelse, hvis barnets forældre stadig lever — i så fald arver bedsteforældrenes formue typisk gennem forældrene først.",
  },
  {
    question: "Hvornår skal arveafgift betales?",
    answer:
      "Arveafgiften skal betales til Skattestyrelsen inden 1 år efter dødsfaldet. Boet afvikles typisk gennem en bobestyrer eller advokat, som sørger for at beregne og afregne afgifterne.",
  },
  {
    question: "Ændres reglerne for søskende i 2027?",
    answer:
      "Ja, fra 1. januar 2027 afskaffes tillægsafgiften for søskende. Det betyder at søskende fremover kun betaler 15% boafgift i stedet for den nuværende effektive sats på op til 36,25%.",
  },
  {
    question: "Skal man betale arveafgift af forsikringer?",
    answer:
      "Forsikringsudbetalinger der tilfalder en navngiven begunstiget (fx livsforsikring) indgår som udgangspunkt ikke i boet og er dermed ikke underlagt boafgift. Men beløbet kan i stedet være omfattet af afgiftspligt efter forsikringsaftalelovens regler.",
  },
];

export default function ArveafgiftPage() {
  return (
    <div>
      <CalculatorSchema
        name="Arveafgift beregner - Beregn arveafgift i Danmark"
        description="Gratis arveafgift beregner. Beregn boafgift baseret på din relation: ægtefælle (fritaget), børn (15%), søskende (15% + 25% tillægsafgift)."
        url={`${baseUrl}/arveafgift`}
        category="FinanceApplication"
      />
      <FAQSchema items={arveafgiftFaqItems} />
      <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Arveafgift beregner", href: "/arveafgift" }]} />
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
              <td>392.300 kr</td>
            </tr>
            <tr>
              <td>Søskende</td>
              <td>15%</td>
              <td>25% af arv efter boafgift</td>
              <td>392.300 kr</td>
            </tr>
            <tr>
              <td>Andre (venner, fjern familie)</td>
              <td>15%</td>
              <td>25% af arv efter boafgift</td>
              <td>392.300 kr</td>
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
          på 392.300 kr. Der er ingen tillægsafgift for denne gruppe.
        </p>
        <ul>
          <li><strong>Børn:</strong> Arv fra forældre</li>
          <li><strong>Børnebarn:</strong> Arv fra bedsteforældre</li>
          <li><strong>Forældre:</strong> Arv fra voksne børn (hvis der ikke er ægtefælle eller børn)</li>
        </ul>

        <h3>Søskende</h3>
        <p>
          Søskende betaler 15% boafgift plus 25% tillægsafgift af arven efter
          boafgift. Den effektive marginale sats nærmer sig 36,25% for store arvebeløb.
          <strong>Bemærk:</strong> Fra 1. januar 2027 afskaffes tillægsafgiften for
          søskende, så de fremover kun betaler 15% boafgift.
        </p>

        <h3>Andre arvinger</h3>
        <p>
          Venner, fjern familie og andre uden direkte familiemæssig tilknytning
          betaler 15% boafgift + 25% tillægsafgift af arven efter boafgift.
          Der er intet bundfradrag for tillægsafgiften.
        </p>

        <h2>Bundfradraget</h2>
        <p>
          Bundfradraget på 392.300 kr (2026) gælder for alle arvinger undtagen 
          ægtefæller. Det betyder, at de første 392.300 kr af arven er 
          afgiftsfri — uanset hvem der arver.
        </p>
        <p>
          <strong>Eksempel:</strong> Et barn arver 1.000.000 kr. Arveafgiften
          beregnes således: (1.000.000 − 392.300) × 15% = 91.155 kr i afgift.
        </p>

        <h2>Hvornår skal arveafgift betales?</h2>
        <p>
          Arveafgiften skal betales til Skattestyrelsen inden 1 år efter dødsfaldet. 
          Boet afvikles typisk gennem en bobestyrer eller advokat, som sørger 
          for at beregne og afregne afgifterne.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på gældende 2026-satser.
            De faktiske afgifter kan variere afhængigt af boets specifikke
            forhold. Vi anbefaler at kontakte en bobestyrer eller advokat
            for præcis beregning.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ofte stillede spørgsmål om arveafgift
        </h2>
        <FAQ items={arveafgiftFaqItems} />
      </section>

      <section className="mt-12">
        <RelatedCalculators current="/arveafgift" />
      </section>
    </div>
  );
}
