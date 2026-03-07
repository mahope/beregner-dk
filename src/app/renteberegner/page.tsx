import type { Metadata } from "next";
import RenteBeregner from "@/components/RenteBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Renteberegner - Beregn lån og ydelse gratis",
  description:
    "Beregn dit lån hurtigt. Eksempel: 100.000 kr med 5% rente i 5 år = ca. 1.887 kr/md. Se månedlig ydelse, samlet rente og sammenlign annuitets- vs. serielån.",
  keywords: [
    "renteberegner",
    "lånberegner",
    "beregn lån",
    "månedlig ydelse",
    "annuitetslån",
    "serielån",
    "boliglån beregner",
    "billån beregner",
    "rente beregning",
    "afdrag beregner",
  ],
  openGraph: {
    title: "Renteberegner - Beregn lån og ydelse",
    description:
      "Beregn din månedlige ydelse og se hvad dit lån koster i alt. Gratis renteberegner.",
    url: `${baseUrl}/renteberegner`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/renteberegner`,
  },
};

const faqItems = [
  {
    question: "Hvad er forskellen på annuitetslån og serielån?",
    answer:
      "Ved annuitetslån er din månedlige ydelse fast, men fordelingen mellem rente og afdrag ændrer sig. Ved serielån er afdraget fast, så ydelsen falder over tid. Serielån giver lavere samlet rente, men højere startydelser.",
  },
  {
    question: "Hvordan beregnes den månedlige ydelse på et annuitetslån?",
    answer:
      "Ydelsen beregnes med annuitetsformlen: Y = H × r × (1+r)^n / ((1+r)^n - 1), hvor H er hovedstolen, r er den månedlige rente, og n er antal terminer. Formlen sikrer at ydelsen er konstant.",
  },
  {
    question: "Hvad påvirker hvor meget rente jeg betaler?",
    answer:
      "Den samlede rente afhænger af lånebeløbet, rentesatsen, løbetiden og låntypen. Længere løbetid giver lavere månedlig ydelse, men højere samlet rente. Serielån giver lavere samlet rente end annuitetslån.",
  },
  {
    question: "Hvad er en typisk boliglånsrente i 2026?",
    answer:
      "Renten på boliglån varierer afhængigt af lånetypen. Fastforrentede lån ligger typisk på 3-5%, mens variabelt forrentede lån (F-lån) kan være lavere. Banklån har ofte højere rente end realkreditlån.",
  },
  {
    question: "Kan jeg få fradrag for renteudgifter?",
    answer:
      "Ja, du kan få fradrag for renteudgifter på lån. Fradraget er ca. 33% af renteudgiften (negativ kapitalindkomst). Ved højere kapitalindkomst kan fradraget være op til 42%.",
  },
  {
    question: "Hvad er ÅOP, og hvorfor er den vigtig?",
    answer:
      "ÅOP (Årlige Omkostninger i Procent) inkluderer alle låneomkostninger - ikke kun renten, men også gebyrer og bidrag. ÅOP gør det nemmere at sammenligne lån fra forskellige udbydere.",
  },
  {
    question: "Bør jeg vælge kort eller lang løbetid?",
    answer:
      "Kort løbetid giver højere månedlig ydelse, men lavere samlet rente. Lang løbetid giver lavere ydelse, men du betaler mere i rente samlet. Vælg ud fra din økonomi og risikovillighed.",
  },
  {
    question: "Hvornår kan det betale sig at omlægge et lån?",
    answer:
      "Det kan betale sig at omlægge hvis renten er faldet væsentligt (typisk 0,5-1%), eller hvis du vil ændre fra variabel til fast rente. Husk at medregne omkostninger til omlægning.",
  },
];

export default function RenteberegnerPage() {
  return (
    <div>
      <CalculatorSchema
        name="Renteberegner - Lån og ydelse"
        description="Gratis renteberegner. Beregn din månedlige ydelse og samlet rente på lån."
        url={`${baseUrl}/renteberegner`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Renteberegner", href: "/renteberegner" }]} />

      <h1 className="text-3xl font-bold mb-2">Renteberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn din månedlige ydelse, samlet rente og tilbagebetaling på lån.
        Sammenlign annuitetslån og serielån for at finde den bedste løsning.
      </p>

      <RenteBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du renteberegneren</h2>
        <p>
          Med vores <strong>renteberegner</strong> kan du hurtigt beregne, hvad et lån vil koste
          dig:
        </p>
        <ol>
          <li>
            <strong>Indtast lånebeløbet</strong> - hvor meget vil du låne?
          </li>
          <li>
            <strong>Angiv renten</strong> - den årlige rentesats (ÅOP eller
            debitorrente)
          </li>
          <li>
            <strong>Vælg løbetid</strong> - hvor mange år skal lånet løbe?
          </li>
          <li>
            <strong>Vælg låntype</strong> - annuitetslån eller serielån
          </li>
        </ol>

        <h2>Annuitetslån vs. serielån</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Egenskab</th>
                <th>Annuitetslån</th>
                <th>Serielån</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Månedlig ydelse</td>
                <td>Fast</td>
                <td>Faldende over tid</td>
              </tr>
              <tr>
                <td>Afdrag</td>
                <td>Stigende over tid</td>
                <td>Fast</td>
              </tr>
              <tr>
                <td>Rente</td>
                <td>Faldende over tid</td>
                <td>Faldende over tid</td>
              </tr>
              <tr>
                <td>Samlet rente</td>
                <td>Højere</td>
                <td>Lavere</td>
              </tr>
              <tr>
                <td>Startydelse</td>
                <td>Lavere</td>
                <td>Højere</td>
              </tr>
              <tr>
                <td>Populær til</td>
                <td>Boliglån, billån</td>
                <td>Erhvervslån</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tips til at få et godt lån</h2>
        <ul>
          <li>
            <strong>Sammenlign ÅOP</strong> - ikke kun renten, men alle
            omkostninger
          </li>
          <li>
            <strong>Overvej løbetiden</strong> - kort løbetid = mindre rente i
            alt
          </li>
          <li>
            <strong>Tjek din kreditvurdering</strong> - påvirker den rente du
            kan få
          </li>
          <li>
            <strong>Undgå overtræk</strong> - kassekredit har ofte 15-20% i
            rente
          </li>
          <li>
            <strong>Prioriter dyre lån</strong> - afbetal lån med høj rente
            først
          </li>
        </ul>

        <h2>Skattefradrag for renter</h2>
        <p>
          I Danmark kan du få <strong>fradrag for renteudgifter</strong> på private lån.
          Fradraget er ca. <strong>33% af renteudgiften</strong>, hvilket reducerer din
          skattebetaling. Det betyder, at et lån med 5% rente reelt kun koster
          dig ca. <strong>3,35% efter skat</strong>.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip: Brug beregneren til at sammenligne</p>
          <p className="text-blue-700">
            Prøv at indtaste det samme lån med forskellig løbetid eller låntype
            for at se, hvordan det påvirker din samlede betaling.
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat. Faktiske lånetilbud kan afvige på
            grund af gebyrer, bidragssatser og din kreditvurdering. Kontakt
            altid din bank eller realkreditinstitut for præcise tilbud.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/renteberegner" />
    </div>
  );
}
