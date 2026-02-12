import type { Metadata } from "next";
import BoligstoetteBeregner from "@/components/BoligstoetteBeregner";
import { CalculatorSchema, FAQSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { FAQ } from "@/components/FAQ";
import { RelatedCalculators } from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Boligstøtte beregner 2026 - Beregn din boligstøtte",
  description:
    "Beregn hvor meget du kan få i boligstøtte i 2026. Gratis beregner til lejere - se din månedlige støtte baseret på husleje og indkomst.",
  keywords: [
    "boligstøtte beregner",
    "boligstøtte 2026",
    "beregn boligstøtte",
    "boligsikring",
    "huslejetilskud",
    "boligydelse",
    "boligstøtte satser",
    "udbetaling danmark boligstøtte",
  ],
  alternates: {
    canonical: "https://minberegner.dk/boligstoette",
  },
  openGraph: {
    title: "Boligstøtte beregner 2026 - Beregn din boligstøtte",
    description:
      "Find ud af hvor meget boligstøtte du kan få. Gratis online beregner med 2026-satser.",
    url: "https://minberegner.dk/boligstoette",
    type: "website",
  },
};

const faqItems = [
  {
    question: "Hvem kan få boligstøtte?",
    answer:
      "Du kan søge boligstøtte hvis du bor til leje i en helårsbolig, er fyldt 18 år, og har en indkomst under visse grænser. Både danske og udenlandske statsborgere kan søge, hvis de har lovligt ophold.",
  },
  {
    question: "Hvordan søger jeg boligstøtte?",
    answer:
      "Du søger boligstøtte på borger.dk med MitID. Udbetaling Danmark behandler ansøgningen og beregner det præcise beløb. Støtten udbetales direkte til din NemKonto.",
  },
  {
    question: "Hvornår får jeg boligstøtte udbetalt?",
    answer:
      "Boligstøtte udbetales månedsvist forud, typisk omkring den 1. i måneden. Fra ansøgningsdatoen kan du få støtte med tilbagevirkende kraft op til 2 måneder.",
  },
  {
    question: "Påvirker min formue boligstøtten?",
    answer:
      "Ja, hvis din formue overstiger fribeløbet (ca. 800.000 kr for enlige, 1.600.000 kr for par), nedsættes boligstøtten. Visse formuetyper som pensionsopsparinger tæller ikke med.",
  },
  {
    question: "Hvad sker der hvis min indkomst ændrer sig?",
    answer:
      "Du skal give Udbetaling Danmark besked om ændringer i indkomst, husstandens størrelse eller husleje. De beregner så et nyt beløb. Ved årets slutning foretages en efterregulering.",
  },
];

const relatedCalcs = [
  { href: "/husleje", title: "Husleje budget", description: "Hvad har du råd til?" },
  { href: "/loen-efter-skat", title: "Løn efter skat", description: "Beregn din nettoløn" },
  { href: "/dagpenge", title: "Dagpenge", description: "Beregn dagpenge ved ledighed" },
  { href: "/boernepenge", title: "Børnepenge", description: "Børne- og ungeydelse" },
];

export default function BoligstoettePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Boligstøtte beregner 2026"
        description="Beregn hvor meget du kan få i boligstøtte baseret på husleje og indkomst"
        url={`${baseUrl}/boligstoette`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Boligstøtte beregner", url: `${baseUrl}/boligstoette` },
        ]}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Boligstøtte beregner 2026
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find ud af hvor meget boligstøtte du kan få til din husleje. 
          Beregneren giver et estimat baseret på de aktuelle regler.
        </p>
      </div>

      {/* Calculator */}
      <BoligstoetteBeregner />

      {/* Info sektion */}
      <section className="mt-12 prose prose-blue max-w-none">
        <h2>Hvad er boligstøtte?</h2>
        <p>
          Boligstøtte er et skattefrit tilskud fra staten til din husleje. 
          Formålet er at hjælpe lejere med lave og mellemstore indkomster 
          med at kunne betale deres bolig.
        </p>

        <h3>Hvad tæller med i beregningen?</h3>
        <ul>
          <li><strong>Husstandens indkomst:</strong> Al indkomst for alle over 18 år tæller med</li>
          <li><strong>Huslejens størrelse:</strong> Der er et loft over, hvor meget husleje der indgår</li>
          <li><strong>Boligens størrelse:</strong> Store boliger kan give reduceret støtte</li>
          <li><strong>Antal personer:</strong> Flere personer giver højere indkomstgrænse</li>
          <li><strong>Formue:</strong> Høj formue reducerer eller fjerner støtten</li>
        </ul>

        <h3>Boligstøtte vs. boligydelse</h3>
        <p>
          Boligstøtte er for almindelige lejere. Boligydelse er en særlig ordning 
          for folkepensionister og førtidspensionister, som typisk giver et 
          højere beløb.
        </p>

        <h3>Sådan maksimerer du din boligstøtte</h3>
        <ul>
          <li>Søg tidligt - du kan kun få støtte fra ansøgningsdatoen</li>
          <li>Opdater dine oplysninger løbende for at undgå efterregulering</li>
          <li>Tjek om din varmeudgift kan medregnes i huslejen</li>
          <li>Ved flytning: Søg igen - beløbet kan ændre sig</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ofte stillede spørgsmål om boligstøtte
        </h2>
        <FAQ items={faqItems} />
      </section>

      {/* Related */}
      <section className="mt-12">
        <RelatedCalculators calculators={relatedCalcs} />
      </section>
    </div>
  );
}
