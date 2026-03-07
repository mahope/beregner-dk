import type { Metadata } from "next";
import Elberegner from "@/components/Elberegner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Elberegner - Beregn dit elforbrug og strømudgifter",
  description:
    "Gratis elberegner. Beregn dit elforbrug og se hvad dine apparater koster i strøm per dag, måned og år. Inkluderer watt-værdier for typiske apparater.",
  keywords: [
    "elberegner",
    "elforbrug",
    "beregn strøm",
    "strømforbrug",
    "kwh beregner",
    "elpris beregner",
    "hvad koster strøm",
    "elforbrug apparat",
    "watt til kr",
    "energiberegner",
  ],
  openGraph: {
    title: "Elberegner - Beregn dit elforbrug",
    description:
      "Se hvad dine apparater koster i strøm. Gratis elberegner med danske elpriser.",
    url: `${baseUrl}/elberegner`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/elberegner`,
  },
};

const faqItems = [
  {
    question: "Hvordan beregner jeg mit elforbrug?",
    answer:
      "Dit elforbrug beregnes ved at gange apparatets watt med antal timer det bruges, og dividere med 1000 for at få kWh. For eksempel bruger en 100W lampe tændt i 10 timer: 100W × 10t / 1000 = 1 kWh.",
  },
  {
    question: "Hvor finder jeg watt-tallet på mine apparater?",
    answer:
      "Watt-tallet findes typisk på mærkepladen bag på eller under apparatet, i brugsanvisningen under tekniske specifikationer, eller ved at søge efter modelnummeret online.",
  },
  {
    question: "Hvad koster 1 kWh i Danmark?",
    answer:
      "I 2026 ligger den gennemsnitlige elpris typisk mellem 2-3 kr/kWh inkl. alle afgifter (spotpris, nettarif, elafgift, moms). Tjek din seneste elregning for din præcise pris.",
  },
  {
    question: "Hvilke apparater bruger mest strøm?",
    answer:
      "De største strømslugere er typisk varmelegemer som tørretumblere (3000W), ovne (2500W), og elkedler (2000W). Men apparater der kører konstant som køleskabe og frysere bidrager også væsentligt til den årlige regning.",
  },
  {
    question: "Hvordan kan jeg spare på strømmen?",
    answer:
      "Du kan spare strøm ved at slukke for standby, vælge A+++-mærkede apparater, bruge LED-pærer, vaske ved 30°, og kun køre vaskemaskine og opvaskemaskine når de er fulde.",
  },
  {
    question: "Hvad bruger en computer i strøm?",
    answer:
      "En almindelig bærbar computer bruger ca. 50-100W, en stationær computer 150-300W, og en gaming PC kan bruge 400-700W under belastning. Standby-forbrug er typisk 1-5W.",
  },
  {
    question: "Hvad er forskellen på watt og kWh?",
    answer:
      "Watt (W) er en måleenhed for effekt - hvor meget energi et apparat bruger i øjeblikket. kWh (kilowatt-timer) er energi over tid - det du betaler for. 1 kWh = 1000W brugt i 1 time.",
  },
  {
    question: "Hvor meget strøm bruger et køleskab?",
    answer:
      "Et moderne A+++-køleskab bruger ca. 30-50W og kører ca. 8-10 timer aktivt per dag. Det giver et årligt forbrug på ca. 100-150 kWh, svarende til 250-375 kr ved 2,5 kr/kWh.",
  },
];

export default function ElberegnerPage() {
  return (
    <div>
      <CalculatorSchema
        name="Elberegner - Beregn elforbrug"
        description="Gratis elberegner. Beregn dit elforbrug og se hvad dine apparater koster i strøm."
        url={`${baseUrl}/elberegner`}
        category="UtilitiesApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Bolig", href: "/kategori/bolig" }, { name: "Elberegner", href: "/elberegner" }]} />

      <h1 className="text-3xl font-bold mb-2">Elberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn dit elforbrug og se hvad dine elektriske apparater koster i strøm
        per dag, måned og år. Tilføj dine apparater og få overblik over din
        elregning.
      </p>

      <Elberegner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du elberegneren</h2>
        <p>
          Med vores <strong>elberegner</strong> kan du nemt beregne, hvad dine elektriske
          apparater <strong>koster i strøm</strong>. Sådan gør du:
        </p>
        <ol>
          <li>
            <strong>Vælg et apparat</strong> fra dropdown-listen, eller skriv
            navnet selv
          </li>
          <li>
            <strong>Angiv watt</strong> - du kan finde det på apparatets
            mærkeplade
          </li>
          <li>
            <strong>Angiv timer per dag</strong> - hvor længe bruger du
            apparatet?
          </li>
          <li>
            <strong>Tilføj flere apparater</strong> for at se dit samlede
            forbrug
          </li>
        </ol>

        <h2>Typiske apparaters elforbrug</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Apparat</th>
                <th>Typisk watt</th>
                <th>Årlig pris*</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Køleskab</td>
                <td>40W (kører 24/7)</td>
                <td>~875 kr</td>
              </tr>
              <tr>
                <td>Computer</td>
                <td>150W</td>
                <td>~550 kr (4t/dag)</td>
              </tr>
              <tr>
                <td>TV</td>
                <td>100W</td>
                <td>~365 kr (4t/dag)</td>
              </tr>
              <tr>
                <td>Tørretumbler</td>
                <td>3000W</td>
                <td>~1095 kr (1t/dag)</td>
              </tr>
              <tr>
                <td>Gaming PC</td>
                <td>500W</td>
                <td>~1825 kr (4t/dag)</td>
              </tr>
              <tr>
                <td>LED lampe</td>
                <td>10W</td>
                <td>~45 kr (5t/dag)</td>
              </tr>
              <tr>
                <td>Glødepære</td>
                <td>60W</td>
                <td>~275 kr (5t/dag)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">
          *Beregnet med en elpris på 2,5 kr/kWh
        </p>

        <h2>Tips til at spare på strømmen</h2>
        <ul>
          <li>
            <strong>Sluk for standby</strong> - apparater på standby bruger
            stadig strøm (typisk 5-15W)
          </li>
          <li>
            <strong>Vælg energieffektive apparater</strong> - kig efter A+++
            mærkning
          </li>
          <li>
            <strong>LED-pærer</strong> - bruger op til 80% mindre strøm end
            glødepærer
          </li>
          <li>
            <strong>Vask på 30°</strong> - de fleste tøjtyper bliver rene ved
            lavere temperaturer
          </li>
          <li>
            <strong>Fyld maskinen</strong> - kør opvaskemaskine og vaskemaskine
            kun når de er fulde
          </li>
          <li>
            <strong>Brug timer</strong> - kør apparater når strømmen er billigst
            (typisk nat)
          </li>
        </ul>

        <h2>Om elpriser i Danmark</h2>
        <p>
          <strong>Elpriser i Danmark</strong> varierer afhængigt af tidspunkt, årstid og din
          elaftale. Den <strong>samlede pris</strong> du betaler inkluderer:
        </p>
        <ul>
          <li>
            <strong>Spotpris</strong> - varierer time for time baseret på udbud
            og efterspørgsel
          </li>
          <li>
            <strong>Nettarif</strong> - betaling for transport af strøm
          </li>
          <li>
            <strong>Elafgift</strong> - statsafgift på elektricitet
          </li>
          <li>
            <strong>Moms</strong> - 25% af den samlede pris
          </li>
          <li>
            <strong>Elselskabets tillæg</strong> - varierer mellem selskaber
          </li>
        </ul>

        <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6 not-prose">
          <p className="font-medium text-green-800">Tip til lavere elregning</p>
          <p className="text-green-700">
            Overvej en variabel elaftale og brug strøm når spotprisen er lav.
            Apps som Watts og Barry viser realtidspriser og kan hjælpe dig med
            at spare.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/elberegner" />
    </div>
  );
}
