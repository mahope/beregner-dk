import KvadratmeterBeregner from "@/components/KvadratmeterBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("kvadratmeter");
}

const faqItems = [
  {
    question: "Hvordan beregner jeg kvadratmeter?",
    answer:
      "For et rektangulært rum: Gange længde med bredde. Et rum på 5m x 4m = 20 m². For andre former bruges specifikke formler (cirkel: π×r², trekant: grundlinje×højde/2).",
  },
  {
    question: "Hvad er forskellen på m² og m?",
    answer:
      "Meter (m) måler længde/afstand. Kvadratmeter (m²) måler areal/flade. 1 m² er arealet af en firkant med sider på 1 meter.",
  },
  {
    question: "Hvordan omregner jeg m² til andre enheder?",
    answer:
      "1 m² = 10.000 cm². 10.000 m² = 1 hektar. 1 m² ≈ 10,76 kvadratfod. Vores beregner viser automatisk omregninger.",
  },
  {
    question: "Hvordan beregner jeg areal af et L-formet rum?",
    answer:
      "Del rummet op i to rektangler, beregn arealet af hver del, og læg dem sammen. Eksempel: Del L'et i to dele, beregn begge, og summer.",
  },
  {
    question: "Hvad koster gulv pr. m²?",
    answer:
      "Priser varierer meget: Laminat 80-200 kr/m², trægulv 300-800 kr/m², fliser 200-500 kr/m². Læg arbejdsløn oveni (typisk 150-300 kr/m²).",
  },
  {
    question: "Hvor mange m² er en typisk dansk bolig?",
    answer:
      "En gennemsnitlig dansk bolig er ca. 110-120 m². Lejligheder typisk 60-90 m², parcelhuse 120-180 m².",
  },
];

const relatedCalculators = [
  {
    title: "Elberegner",
    href: "/elberegner",
    description: "Beregn dit elforbrug",
    icon: "⚡",
  },
  {
    title: "Boliglån",
    href: "/boliglaan",
    description: "Beregn dit boliglån",
    icon: "🏠",
  },
  {
    title: "Procentberegner",
    href: "/procent",
    description: "Beregn procenter",
    icon: "➗",
  },
];

export default function KvadratmeterPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Kvadratmeterberegner - Beregn areal"
        description="Gratis kvadratmeterberegner. Beregn areal af rektangler, cirkler, trekanter og trapez."
        url={`${baseUrl}/kvadratmeter`}
        category="UtilityApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Bolig", href: "/kategori/bolig" }, { name: "Kvadratmeterberegner", href: "/kvadratmeter" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Kvadratmeterberegner
        </h1>
        <p className="text-lg text-gray-600">
          Beregn areal af rum, haver, grunde og andre flader. Vælg mellem forskellige former 
          og få arealet i kvadratmeter samt andre enheder.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <KvadratmeterBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Om arealberegning</h2>
        <p>
          Areal måles i <strong>kvadratmeter (m²)</strong> og angiver størrelsen af en flade.
          Det er vigtigt at kunne beregne areal ved mange lejligheder — fra <strong>gulvlægning</strong>
          og <strong>maling</strong> til køb af bolig.
        </p>
        
        <h3>Almindelige anvendelser</h3>
        <ul>
          <li><strong>Bolig:</strong> Beregn boligareal, værelsesstørrelser</li>
          <li><strong>Have:</strong> Planlæg græsplæne, terrasse, bede</li>
          <li><strong>Renovering:</strong> Beregn materialer til gulv, væg, loft</li>
          <li><strong>Ejendomshandel:</strong> Forstå grundstørrelse og BBR-areal</li>
        </ul>

        <h3>BBR-areal vs. boligareal</h3>
        <p>
          Ved <strong>boligkøb</strong> skelner man mellem:
        </p>
        <ul>
          <li><strong>Boligareal:</strong> De faktiske beboelige rum</li>
          <li><strong>BBR-areal:</strong> Det registrerede areal inkl. vægge</li>
          <li><strong>Grundareal:</strong> Hele grundens størrelse</li>
          <li><strong>Bebygget areal:</strong> Bygningens fodaftryk</li>
        </ul>

        <h3>Materialeberegning</h3>
        <p>
          Når du skal købe materialer, læg altid <strong>5-10% til for spild</strong>:
        </p>
        <ul>
          <li>Gulvbrædder: +10% for tilskæring</li>
          <li>Maling: Ca. 8-10 m² pr. liter (tjek produktet)</li>
          <li>Fliser: +5-10% for tilskæring og knækkede</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators calculators={relatedCalculators} />
    </div>
  );
}
