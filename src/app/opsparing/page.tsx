import type { Metadata } from "next";
import OpsparingsBeregner from "@/components/OpsparingsBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Opsparingsberegner - Renters rente beregner",
  description:
    "Gratis opsparingsberegner. Beregn hvad din opsparing vokser til med renters rente. Se udviklingen år for år og forstå effekten af løbende indbetalinger.",
  keywords: [
    "opsparingsberegner",
    "renters rente",
    "beregn opsparing",
    "renteberegner opsparing",
    "compound interest",
    "investering beregner",
    "opsparing med rente",
    "fremtidig værdi",
    "pensionsopsparing beregner",
  ],
  openGraph: {
    title: "Opsparingsberegner - Renters rente",
    description:
      "Beregn hvad din opsparing vokser til med renters rente. Gratis opsparingsberegner.",
    url: `${baseUrl}/opsparing`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/opsparing`,
  },
};

const faqItems = [
  {
    question: "Hvad er renters rente?",
    answer:
      "Renters rente (compound interest) betyder, at du tjener rente ikke kun på dit oprindelige indskud, men også på den rente du allerede har tjent. Over tid accelererer dette din opsparing markant.",
  },
  {
    question: "Hvor meget skal jeg spare op om måneden?",
    answer:
      "En tommelfingerregel er at spare 10-20% af din indkomst. Men selv små beløb vokser over tid. 500 kr/md i 30 år med 5% rente bliver til over 400.000 kr.",
  },
  {
    question: "Hvornår skal jeg starte med at spare op?",
    answer:
      "Jo før jo bedre! Tid er den vigtigste faktor ved renters rente. En 25-årig der sparer 1.000 kr/md i 40 år ender med mere end en 35-årig der sparer 2.000 kr/md i 30 år (ved samme rente).",
  },
  {
    question: "Hvad er en realistisk rente at regne med?",
    answer:
      "Historisk har aktiemarkedet givet ca. 7% årligt i gennemsnit (før inflation). Obligationer giver typisk 2-4%. Bankkonti giver ofte under 1%. Vælg ud fra din risikoprofil.",
  },
  {
    question: "Skal jeg betale skat af min opsparing?",
    answer:
      "Ja, afkast beskattes typisk som kapitalindkomst (ca. 42%) eller aktieindkomst (27%/42%). Pension beskattes anderledes. Denne beregner viser beløb før skat.",
  },
  {
    question: "Hvad er forskellen på månedlig og årlig rentetilskrivning?",
    answer:
      "Ved månedlig tilskrivning får du rente 12 gange om året, og renters rente-effekten er lidt større. Forskellen er dog minimal - typisk under 0,5% om året.",
  },
  {
    question: "Hvordan påvirker inflation min opsparing?",
    answer:
      "Inflation reducerer købekraften af dine penge. Med 2% inflation og 5% rente er din reelle rente kun ca. 3%. Husk at justere dine forventninger for inflation.",
  },
  {
    question: "Er det bedre at betale gæld eller spare op?",
    answer:
      "Generelt bør du betale dyr gæld (over 5-6% rente) af først. Billig gæld (boliglån) kan ofte løbe parallelt med opsparing, især hvis afkastet overstiger lånerenten.",
  },
];

export default function OpsparingPage() {
  return (
    <div>
      <CalculatorSchema
        name="Opsparingsberegner - Renters rente"
        description="Gratis opsparingsberegner. Beregn hvad din opsparing vokser til med renters rente."
        url={`${baseUrl}/opsparing`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Opsparingsberegner", url: `${baseUrl}/opsparing` },
        ]}
      />

      <nav className="text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-blue-600">
          Forside
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Opsparingsberegner</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Opsparingsberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn hvad din opsparing vokser til med renters rente. Se hvordan
        løbende indbetalinger og tid får din formue til at vokse.
      </p>

      <OpsparingsBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du opsparingsberegneren</h2>
        <p>
          Med vores opsparingsberegner kan du se, hvordan din opsparing vokser
          over tid med renters rente:
        </p>
        <ol>
          <li>
            <strong>Startbeløb:</strong> Hvor meget har du at starte med?
          </li>
          <li>
            <strong>Månedlig indbetaling:</strong> Hvor meget vil du spare op
            hver måned?
          </li>
          <li>
            <strong>Årlig rente:</strong> Hvilken rente/afkast forventer du?
          </li>
          <li>
            <strong>Periode:</strong> Hvor mange år vil du spare op?
          </li>
        </ol>

        <h2>Kraften i renters rente</h2>
        <p>
          Renters rente er en af de mest kraftfulde kræfter inden for økonomi.
          Albert Einstein sagde angiveligt, at &quot;renters rente er verdens
          ottende vidunder&quot;.
        </p>
        <p>Her er et eksempel på forskellen:</p>
        <ul>
          <li>
            <strong>Uden renters rente:</strong> 10.000 kr med 5% simpel rente i
            30 år = 25.000 kr
          </li>
          <li>
            <strong>Med renters rente:</strong> 10.000 kr med 5% renters rente i
            30 år = 43.219 kr
          </li>
        </ul>
        <p>Det er næsten det dobbelte!</p>

        <h2>Typiske afkast på forskellige opsparingstyper</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Typisk årligt afkast</th>
                <th>Risiko</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bankkonto</td>
                <td>0-1%</td>
                <td>Ingen</td>
              </tr>
              <tr>
                <td>Obligationer</td>
                <td>2-4%</td>
                <td>Lav</td>
              </tr>
              <tr>
                <td>Blandede fonde</td>
                <td>4-6%</td>
                <td>Medium</td>
              </tr>
              <tr>
                <td>Aktiefonde</td>
                <td>6-8%</td>
                <td>Høj</td>
              </tr>
              <tr>
                <td>Enkeltaktier</td>
                <td>Varierende</td>
                <td>Meget høj</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tips til effektiv opsparing</h2>
        <ul>
          <li>
            <strong>Start tidligt:</strong> Tid er vigtigere end beløb. Selv
            små beløb vokser enormt over 30-40 år.
          </li>
          <li>
            <strong>Automatiser:</strong> Sæt en fast overførsel op, så du
            sparer automatisk hver måned.
          </li>
          <li>
            <strong>Øg gradvist:</strong> Hver gang du får lønforhøjelse, øg
            din opsparing.
          </li>
          <li>
            <strong>Diversificer:</strong> Spred din opsparing på flere typer
            investeringer.
          </li>
          <li>
            <strong>Hold omkostninger lave:</strong> Vælg fonde med lave
            årlige omkostninger (ÅOP).
          </li>
        </ul>

        <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6 not-prose">
          <p className="font-medium text-green-800">Eksempel: Tid vs. beløb</p>
          <p className="text-green-700">
            Person A starter med 25 år og sparer 1.000 kr/md i 40 år (5% rente) = <strong>1,5 mio kr</strong><br />
            Person B starter med 35 år og sparer 2.000 kr/md i 30 år (5% rente) = <strong>1,7 mio kr</strong><br />
            Person A indbetaler kun 480.000 kr, Person B indbetaler 720.000 kr - men forskellen er minimal!
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner viser beløb før skat og inflation. Faktisk afkast
            kan variere betydeligt. Historiske afkast er ingen garanti for
            fremtidige afkast.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/opsparing" />
    </div>
  );
}
