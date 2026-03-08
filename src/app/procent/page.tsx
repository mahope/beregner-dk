import ProcentBeregner from "@/components/ProcentBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("procent");
}

const faqItems = [
  {
    question: "Hvordan beregner jeg procent af et tal?",
    answer:
      "For at beregne X% af et tal, gang tallet med X og divider med 100. Eksempel: 25% af 200 = 200 × 25 / 100 = 50.",
  },
  {
    question: "Hvordan finder jeg hvor mange procent noget er af noget andet?",
    answer:
      "Divider den del du vil finde procent af med heltallet, og gang med 100. Eksempel: 25 er hvor mange procent af 200? 25 / 200 × 100 = 12,5%.",
  },
  {
    question: "Hvordan beregner jeg procentvis stigning?",
    answer:
      "Procentvis stigning = ((Ny værdi - Gammel værdi) / Gammel værdi) × 100. Eksempel: Fra 100 til 125 = ((125-100) / 100) × 100 = 25% stigning.",
  },
  {
    question: "Hvordan beregner jeg procentvis fald?",
    answer:
      "Samme formel som stigning, men resultatet bliver negativt. Fra 100 til 80 = ((80-100) / 100) × 100 = -20% (altså 20% fald).",
  },
  {
    question: "Hvad er forskellen på procentpoint og procent?",
    answer:
      "Procentpoint er en absolut ændring i procent, mens procent er en relativ ændring. Hvis renten stiger fra 2% til 3%, er det en stigning på 1 procentpoint, men en relativ stigning på 50%.",
  },
  {
    question: "Hvordan regner jeg baglæns fra procent?",
    answer:
      "Hvis du ved at X er Y% af noget, så er heltallet = X × (100 / Y). Eksempel: Hvis 30 er 25% af noget, så er heltallet = 30 × (100/25) = 120.",
  },
  {
    question: "Hvordan lægger jeg procent til et tal?",
    answer:
      "Gang tallet med (1 + procent/100). Eksempel: Læg 20% til 150: 150 × 1,20 = 180. Eller beregn 20% af 150 (= 30) og læg til.",
  },
  {
    question: "Hvordan trækker jeg procent fra et tal?",
    answer:
      "Gang tallet med (1 - procent/100). Eksempel: Træk 25% fra 200: 200 × 0,75 = 150. Eller beregn 25% af 200 (= 50) og træk fra.",
  },
];

export default function ProcentPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name="Procentberegner"
        description="Gratis procentberegner. Beregn procent af et tal, find procentvis stigning/fald, eller regn baglæns."
        url={`${baseUrl}/procent`}
        category="UtilitiesApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Matematik", href: "/kategori/matematik" }, { name: "Procentberegner", href: "/procent" }]} />

      <h1 className="text-3xl font-bold mb-2">Procentberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn procent af et tal, find procentvis stigning eller fald, eller
        regn baglæns fra procent. Vælg den beregning du har brug for.
      </p>

      <ProcentBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du procentberegneren</h2>
        <p>
          Vores procentberegner kan hjælpe dig med fire forskellige typer
          beregninger:
        </p>
        <ol>
          <li>
            <strong>Find procent:</strong> Hvor mange procent er X af Y?
          </li>
          <li>
            <strong>Find resultat:</strong> Hvad er X% af Y?
          </li>
          <li>
            <strong>Find heltal:</strong> Hvis X er Y%, hvad er så 100%?
          </li>
          <li>
            <strong>Procentvis ændring:</strong> Hvor mange procent er
            stigningen/faldet fra X til Y?
          </li>
        </ol>

        <h2>Procentregning i hverdagen</h2>
        <p>Procent bruges overalt i hverdagen:</p>
        <ul>
          <li>
            <strong>Rabatter:</strong> 25% rabat på en vare til 400 kr = du
            sparer 100 kr
          </li>
          <li>
            <strong>Moms:</strong> 25% moms på 1000 kr = 250 kr i moms (1250 kr
            total)
          </li>
          <li>
            <strong>Renter:</strong> 5% rente på 10.000 kr = 500 kr i rente
          </li>
          <li>
            <strong>Lønstigninger:</strong> 3% stigning på 30.000 kr = 900 kr
            mere
          </li>
          <li>
            <strong>Skat:</strong> 37% skat af 40.000 kr = 14.800 kr i skat
          </li>
        </ul>

        <h2>Hurtige procent-tricks</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>For at finde...</th>
                <th>Gør dette</th>
                <th>Eksempel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10%</td>
                <td>Flyt kommaet én plads til venstre</td>
                <td>10% af 250 = 25</td>
              </tr>
              <tr>
                <td>5%</td>
                <td>Find 10% og halver</td>
                <td>5% af 250 = 12,5</td>
              </tr>
              <tr>
                <td>25%</td>
                <td>Divider med 4</td>
                <td>25% af 200 = 50</td>
              </tr>
              <tr>
                <td>50%</td>
                <td>Halver tallet</td>
                <td>50% af 180 = 90</td>
              </tr>
              <tr>
                <td>1%</td>
                <td>Divider med 100</td>
                <td>1% af 350 = 3,5</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Procentregningens formler</h2>
        <ul>
          <li>
            <strong>Find procent:</strong> Procent = (Del / Heltal) × 100
          </li>
          <li>
            <strong>Find del:</strong> Del = (Procent / 100) × Heltal
          </li>
          <li>
            <strong>Find heltal:</strong> Heltal = Del × (100 / Procent)
          </li>
          <li>
            <strong>Procentvis ændring:</strong> ((Ny - Gammel) / Gammel) × 100
          </li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip</p>
          <p className="text-blue-700">
            Husk at 50% af 40 er det samme som 40% af 50 - begge giver 20. Dette
            trick kan gøre hovedregning nemmere!
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/procent" />
      </div>
      <Sidebar currentHref="/procent" adSlotId="procent-sidebar" />
    </div>
  );
}
