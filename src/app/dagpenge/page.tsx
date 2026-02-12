import type { Metadata } from "next";
import DagpengeBeregner from "@/components/DagpengeBeregner";
import { CalculatorSchema, FAQSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { FAQ } from "@/components/FAQ";
import { RelatedCalculators } from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Dagpengeberegner 2026 - Beregn dine dagpenge",
  description:
    "Beregn hvad du kan få i dagpenge i 2026. Se din månedlige, ugentlige og daglige sats baseret på din tidligere løn. Gratis dagpengeberegner.",
  keywords: [
    "dagpenge beregner",
    "dagpenge 2026",
    "beregn dagpenge",
    "dagpenge sats",
    "a-kasse beregner",
    "arbejdsløshedsdagpenge",
    "dagpenge efter skat",
    "max dagpenge 2026",
  ],
  alternates: {
    canonical: "https://minberegner.dk/dagpenge",
  },
  openGraph: {
    title: "Dagpengeberegner 2026 - Beregn dine dagpenge",
    description:
      "Beregn hvad du kan få i dagpenge i 2026. Gratis og nem dagpengeberegner.",
    url: "https://minberegner.dk/dagpenge",
    type: "website",
  },
};

const faqItems = [
  {
    question: "Hvordan beregnes dagpenge?",
    answer:
      "Dagpenge beregnes som udgangspunkt som 90% af din tidligere løn, dog højst maxsatsen på 20.359 kr/md i 2026. Din A-kasse ser på din gennemsnitlige indtægt de seneste 12 måneder.",
  },
  {
    question: "Hvad er maxsatsen for dagpenge i 2026?",
    answer:
      "I 2026 er den maksimale dagpengesats 20.359 kr/md før skat for fuldtidsforsikrede. Satsen reguleres årligt.",
  },
  {
    question: "Hvor længe kan jeg få dagpenge?",
    answer:
      "Dagpengeperioden er normalt 2 år (3.848 timer) inden for 3 år. Perioden kan forlænges ved arbejde eller uddannelse.",
  },
  {
    question: "Skal jeg betale skat af dagpenge?",
    answer:
      "Ja, dagpenge er skattepligtig indkomst. Der trækkes A-skat efter dit skattekort. Du kan bruge vores løn efter skat beregner til at estimere nettobeløbet.",
  },
  {
    question: "Hvornår har jeg ret til dagpenge?",
    answer:
      "Du skal have været medlem af en A-kasse i mindst 1 år, have haft en vis indkomst (indkomstkravet), og være aktivt jobsøgende og tilmeldt jobcentret.",
  },
];

const relatedCalcs = [
  { href: "/loen-efter-skat", title: "Løn efter skat", description: "Beregn din nettoløn" },
  { href: "/feriepenge", title: "Feriepenge", description: "Beregn dine feriepenge" },
  { href: "/su", title: "SU-beregner", description: "Beregn din SU" },
  { href: "/boernepenge", title: "Børnepenge", description: "Se børne- og ungeydelse" },
];

export default function DagpengePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Dagpengeberegner 2026"
        description="Beregn hvad du kan få i dagpenge baseret på din tidligere løn"
        url={`${baseUrl}/dagpenge`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Dagpengeberegner", url: `${baseUrl}/dagpenge` },
        ]}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Dagpengeberegner 2026
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find ud af hvad du kan få i dagpenge hvis du bliver ledig. Beregneren bruger 
          de aktuelle satser for 2026.
        </p>
      </div>

      {/* Calculator */}
      <DagpengeBeregner />

      {/* Info sektion */}
      <section className="mt-12 prose prose-blue max-w-none">
        <h2>Sådan fungerer dagpenge</h2>
        <p>
          Dagpenge er en økonomisk sikkerhed for dig, der er medlem af en A-kasse og 
          bliver ledig. Dagpengene giver dig mulighed for at fokusere på at finde et 
          nyt job uden at bekymre dig for meget om økonomien.
        </p>

        <h3>Hvad påvirker din dagpengesats?</h3>
        <ul>
          <li><strong>Din tidligere løn:</strong> Dagpenge beregnes som 90% af din gennemsnitlige løn</li>
          <li><strong>Maxsatsen:</strong> Uanset din løn kan du højst få 20.359 kr/md i 2026</li>
          <li><strong>Arbejdstid:</strong> Deltidsansatte får forholdsmæssigt mindre</li>
          <li><strong>A-kasse medlemskab:</strong> Du skal have været medlem i mindst 1 år</li>
        </ul>

        <h3>Indkomstkravet</h3>
        <p>
          For at få ret til dagpenge skal du opfylde et indkomstkrav. I 2026 skal du 
          have haft en samlet indkomst på mindst 263.232 kr inden for de seneste 3 år, 
          eller have haft fuldtidsarbejde i mindst 1.924 timer inden for de seneste 3 år.
        </p>

        <h3>Supplerende dagpenge</h3>
        <p>
          Hvis du arbejder på nedsat tid (under 37 timer), kan du få supplerende dagpenge. 
          Dog er der et loft på 30 ugers supplerende dagpenge inden for 104 uger.
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ofte stillede spørgsmål om dagpenge
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
