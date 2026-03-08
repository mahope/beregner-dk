import { generatePageMetadata } from "@/lib/page-helpers";
import RentefradragBeregner from "@/components/RentefradragBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("rentefradrag");
}

const faqItems = [
  {
    question: "Hvad er rentefradrag?",
    answer:
      "Rentefradrag er et skattefradrag, du får for dine renteudgifter. Det reducerer din skattepligtige indkomst, så du betaler mindre i skat. Fradraget gælder for renter på boliglån, billån, forbrugslån og andre lån.",
  },
  {
    question: "Hvad er fradragsværdien i 2026?",
    answer:
      "I 2026 er den maksimale fradragsværdi ca. 33,6% for renteudgifter under 50.000 kr. (100.000 kr. for par). For beløb over denne grænse er fradragsværdien ca. 25,6%. Kommuneskatten påvirker den præcise værdi.",
  },
  {
    question: "Hvilke renter kan jeg få fradrag for?",
    answer:
      "Du kan få fradrag for renter på boliglån (realkreditlån og banklån), billån, studielån, forbrugslån, og kassekreditter. Renter på SU-lån giver også fradrag.",
  },
  {
    question: "Hvornår får jeg rentefradraget?",
    answer:
      "Rentefradraget indregnes automatisk i din forskudsopgørelse, hvis du har indberettet dine lån. Du får dermed lavere skat hen over året. Alternativt får du overskydende skat tilbage ved årsopgørelsen.",
  },
  {
    question: "Hvordan påvirker rentefradrag min boligøkonomi?",
    answer:
      "Rentefradraget gør det billigere at have lån, fordi staten betaler en del af dine renteudgifter via skatten. Det kan gøre det mere attraktivt at låne til bolig frem for at leje.",
  },
  {
    question: "Skal jeg gøre noget for at få rentefradrag?",
    answer:
      "Nej, banker og realkreditinstitutter indberetter automatisk dine renteudgifter til SKAT. Du skal dog kontrollere, at beløbene er korrekte i din forskudsopgørelse.",
  },
  {
    question: "Hvad er negativ kapitalindkomst?",
    answer:
      "Negativ kapitalindkomst opstår, når dine renteudgifter er større end dine kapitalindtægter (f.eks. renteindtægter fra opsparing). Det er den negative kapitalindkomst, du får fradrag for.",
  },
  {
    question: "Falder rentefradraget?",
    answer:
      "Ja, den høje fradragsværdi (over bundfradraget) er blevet reduceret over de seneste år og er nu ca. 25,6%. Den lave fradragsværdi (under bundfradraget) er relativt stabil omkring 33%.",
  },
];

const relatedCalculators = [
  { title: "Boliglån", href: "/boliglaan", description: "Beregn boliglån" },
  { title: "Låneberegner", href: "/laaneberegner", description: "Beregn lån" },
  { title: "Løn efter skat", href: "/loen-efter-skat", description: "Nettoløn" },
  { title: "Renteberegner", href: "/renteberegner", description: "Beregn rente" },
];

export default function RentefradragPage() {
  return (
    <div>
      <CalculatorSchema
        name="Rentefradrag beregner"
        description="Beregn din skattebesparelse fra rentefradrag på lån."
        url={`${baseUrl}/rentefradrag`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Rentefradrag", href: "/rentefradrag" }]} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Rentefradrag beregner 2026
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Se hvor meget du sparer i skat på dine renteudgifter. 
              Beregneren viser din skattebesparelse baseret på de aktuelle fradragssatser.
            </p>
          </header>

          <section className="mb-12">
            <RentefradragBeregner />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om rentefradrag
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                <strong>Rentefradrag</strong> er en af de mest værdifulde <strong>skattefordele</strong> for boligejere i Danmark.
                Når du betaler renter på dit lån, får du lov til at <strong>trække en del fra i skat</strong>.
                Det betyder, at staten reelt betaler en del af dine <strong>renteudgifter</strong>.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Fradragssatser 2026</h3>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Renteudgifter</th>
                    <th className="border p-3 text-left">Fradragsværdi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">Under 50.000 kr. (enlig) / 100.000 kr. (par)</td>
                    <td className="border p-3">Ca. 33,6%</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Over 50.000 kr. (enlig) / 100.000 kr. (par)</td>
                    <td className="border p-3">Ca. 25,6%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-2">
                * Den præcise fradragsværdi afhænger af din kommune.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Eksempel</h3>
              <p>
                Hvis du har <strong>80.000 kr. i årlige renteudgifter</strong> som enlig:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>De første 50.000 kr. giver fradrag: 50.000 × 33,6% = 16.800 kr.</li>
                <li>De næste 30.000 kr. giver fradrag: 30.000 × 25,6% = 7.680 kr.</li>
                <li><strong>Samlet skattebesparelse: 24.480 kr.</strong></li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ofte stillede spørgsmål
            </h2>
            <FAQ items={faqItems} />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Relaterede beregnere
            </h2>
            <RelatedCalculators calculators={relatedCalculators} />
          </section>
        </article>
      </main>
    </div>
  );
}
