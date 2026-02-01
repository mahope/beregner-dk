import type { Metadata } from "next";
import LoenBeregner from "@/components/LoenBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Løn efter skat 2026 - Beregn din nettoløn gratis",
  description:
    "Gratis lønberegner 2026. Se hvad du får udbetalt efter skat, AM-bidrag og pension. Beregn din nettoløn med aktuelle danske skattesatser.",
  keywords: [
    "løn efter skat",
    "lønberegner",
    "nettoløn",
    "beregn løn efter skat",
    "hvad får jeg udbetalt",
    "skat beregner",
    "bruttoløn til nettoløn",
    "løn 2026",
    "skatteberegner",
    "am-bidrag",
  ],
  openGraph: {
    title: "Løn efter skat 2026 - Beregn din nettoløn",
    description:
      "Se hvad du får udbetalt efter skat. Gratis lønberegner med 2026 satser.",
    url: `${baseUrl}/loen-efter-skat`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/loen-efter-skat`,
  },
};

const faqItems = [
  {
    question: "Hvordan beregnes min løn efter skat?",
    answer:
      "Din nettoløn beregnes ved først at trække AM-bidrag (8%) fra bruttolønnen. Derefter trækkes bundskat, kommuneskat og eventuel kirkeskat fra den skattepligtige indkomst efter fradrag. Tjener du over topskattegrænsen, betales også 15% topskat.",
  },
  {
    question: "Hvad er AM-bidrag?",
    answer:
      "AM-bidrag (arbejdsmarkedsbidrag) er 8% af din bruttoløn før andre fradrag. Bidraget går til at finansiere dagpenge, efterløn og andre arbejdsmarkedsordninger. AM-bidrag trækkes før skat beregnes.",
  },
  {
    question: "Hvornår skal jeg betale topskat?",
    answer:
      "I 2026 skal du betale topskat på 15%, hvis din indkomst efter AM-bidrag overstiger ca. 588.900 kr årligt. Det svarer til en månedsløn på omkring 53.000 kr før skat.",
  },
  {
    question: "Hvad er personfradraget i 2026?",
    answer:
      "Personfradraget i 2026 er 49.700 kr. Det betyder, at du ikke betaler skat af de første 49.700 kr af din årlige indkomst (efter AM-bidrag). Alle skatteydere får automatisk dette fradrag.",
  },
  {
    question: "Hvorfor varierer kommuneskatten?",
    answer:
      "Hver kommune fastsætter sin egen skatteprocent baseret på kommunens økonomi og serviceniveau. I 2026 varierer kommuneskatten fra ca. 22,5% (Rudersdal) til 27,8% (Langeland). Landsgennemsnittet er omkring 24,94%.",
  },
  {
    question: "Hvad er forskellen på brutto og netto?",
    answer:
      "Bruttoløn er din løn før skat og bidrag. Nettoløn er det beløb, du faktisk får udbetalt på kontoen efter alle fradrag. Forskellen udgøres af AM-bidrag, skat, pension og eventuelle andre fradrag.",
  },
  {
    question: "Hvordan påvirker pension min skat?",
    answer:
      "Arbejdsgiverbetalt pension trækkes fra bruttolønnen før AM-bidrag beregnes, hvilket reducerer din skattepligtige indkomst. Det betyder, at du betaler mindre i skat nu, men skal betale skat når du hæver pensionen.",
  },
  {
    question: "Er denne beregner præcis?",
    answer:
      "Beregneren giver et godt estimat baseret på gennemsnitlige satser. Din faktiske nettoløn kan variere afhængigt af dine specifikke fradrag, kommune og situation. For præcis beregning, brug SKAT's officielle værktøjer.",
  },
];

export default function LoenPage() {
  return (
    <div>
      <CalculatorSchema
        name="Lønberegner - Løn efter skat"
        description="Gratis lønberegner. Se hvad du får udbetalt efter skat, AM-bidrag og pension."
        url={`${baseUrl}/loen-efter-skat`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Løn efter skat", url: `${baseUrl}/loen-efter-skat` },
        ]}
      />

      <nav className="text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-blue-600">
          Forside
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Løn efter skat</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Løn efter skat 2026</h1>
      <p className="text-gray-600 mb-8">
        Beregn din nettoløn og se hvad du får udbetalt efter skat, AM-bidrag og
        pension. Opdateret med de nyeste danske skattesatser for 2026.
      </p>

      <LoenBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan beregnes din skat i Danmark</h2>
        <p>
          I Danmark betaler vi skat af vores indkomst i flere lag. Her er en
          oversigt over hvordan din løn beskattes i 2026:
        </p>

        <h3>1. AM-bidrag (8%)</h3>
        <p>
          Først trækkes <strong>arbejdsmarkedsbidraget</strong> på 8% fra din
          bruttoløn. Dette bidrag går til dagpenge, efterløn og andre
          arbejdsmarkedsordninger.
        </p>

        <h3>2. Personfradrag (49.700 kr)</h3>
        <p>
          Alle har ret til et <strong>personfradrag</strong> på 49.700 kr i
          2026. Du betaler ikke skat af dette beløb.
        </p>

        <h3>3. Beskæftigelsesfradrag</h3>
        <p>
          Som lønmodtager får du et ekstra fradrag på 10,65% af din lønindkomst
          (efter AM-bidrag), dog maks. ca. 45.100 kr i 2026.
        </p>

        <h3>4. Bundskat (12,22%)</h3>
        <p>
          Alle betaler <strong>bundskat</strong> af den skattepligtige indkomst
          (efter fradrag).
        </p>

        <h3>5. Kommuneskat (varierer)</h3>
        <p>
          <strong>Kommuneskatten</strong> varierer fra kommune til kommune.
          Landsgennemsnittet er ca. 24,94% i 2026. De billigste kommuner ligger
          omkring 22%, mens de dyreste er over 27%.
        </p>

        <h3>6. Kirkeskat (valgfri)</h3>
        <p>
          Medlemmer af folkekirken betaler <strong>kirkeskat</strong> på ca.
          0,6-1% (gennemsnit 0,68%).
        </p>

        <h3>7. Topskat (15%)</h3>
        <p>
          Tjener du over ca. 588.900 kr årligt (efter AM-bidrag), betaler du
          <strong> topskat</strong> på 15% af beløbet over grænsen.
        </p>

        <h2>Kommuner med lavest og højest skat (2026)</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Laveste skatteprocent</th>
                <th>Højeste skatteprocent</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rudersdal (22,5%)</td>
                <td>Langeland (27,8%)</td>
              </tr>
              <tr>
                <td>Gentofte (22,8%)</td>
                <td>Ishøj (27,2%)</td>
              </tr>
              <tr>
                <td>Allerød (23,3%)</td>
                <td>Brøndby (27,1%)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tips til at optimere din skat</h2>
        <ul>
          <li>
            <strong>Kørselsfradrag:</strong> Bor du langt fra arbejde, kan du få
            fradrag for transport over 24 km hver vej.
          </li>
          <li>
            <strong>Håndværkerfradrag:</strong> Få fradrag for serviceydelser i
            hjemmet.
          </li>
          <li>
            <strong>Pensionsindbetalinger:</strong> Ratepension og livrente
            giver fradrag.
          </li>
          <li>
            <strong>Fagforeningskontingent:</strong> Op til 7.000 kr kan
            fratrækkes (2026).
          </li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip</p>
          <p className="text-blue-700">
            Tjek din forskudsopgørelse på{" "}
            <a
              href="https://skat.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              skat.dk
            </a>{" "}
            for at se dine præcise fradrag og skatteprocenter.
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på gennemsnitlige satser.
            Din faktiske skat afhænger af din specifikke situation, fradrag og
            kommune. For præcis beregning, brug SKAT's officielle værktøjer.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/loen-efter-skat" />
    </div>
  );
}
