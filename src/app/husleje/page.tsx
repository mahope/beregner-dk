import type { Metadata } from "next";
import HuslejeBudgetBeregner from "@/components/HuslejeBudgetBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Husleje Budget Beregner - Hvad har du råd til? | MinBeregner.dk",
  description:
    "Hvad har du råd til i husleje? Tjener du 25.000 kr netto → max ca. 7.500 kr/md (30% reglen). Beregn dit huslejebudget ud fra din indkomst og udgifter. Gratis beregner.",
  keywords: [
    "husleje beregner",
    "hvad har jeg råd til i husleje",
    "husleje budget",
    "30% reglen husleje",
    "bolig budget",
    "lejlighed budget",
    "hvad må husleje koste",
  ],
  openGraph: {
    title: "Husleje Budget Beregner - Find din max husleje",
    description: "Beregn hvor meget du kan bruge på husleje. Baseret på din indkomst og udgifter.",
    url: `${baseUrl}/husleje`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/husleje`,
  },
};

const faqItems = [
  {
    question: "Hvor meget af min løn bør gå til husleje?",
    answer:
      "Den klassiske tommelfingerregel er max 30% af din nettoindkomst. Nogle eksperter siger 33%. Husk at inkludere el, vand og varme i beregningen.",
  },
  {
    question: "Hvad inkluderer huslejen typisk?",
    answer:
      "Basis husleje inkluderer ofte kun lejen. A conto varme og vand kan være inkluderet. El betaler du næsten altid selv. Internet og TV er sjældent inkluderet.",
  },
  {
    question: "Hvor meget skal jeg have i depositum?",
    answer:
      "Typisk 1-3 måneders husleje i depositum + eventuelt forudbetalt husleje. Spar op til dette inden du begynder at lede efter bolig.",
  },
  {
    question: "Skal jeg have opsparing ud over husleje?",
    answer:
      "Ja, eksperter anbefaler at have 3-6 måneders udgifter i en nødfond. Plus løbende opsparing på mindst 10% af din indkomst til fremtiden.",
  },
  {
    question: "Er det bedre at leje eller købe?",
    answer:
      "Det afhænger af din situation. Leje giver fleksibilitet, køb opbygger formue. Som tommelfingerregel: Hvis du bliver 5+ år, kan køb ofte betale sig.",
  },
  {
    question: "Hvad er typiske boligudgifter ud over husleje?",
    answer:
      "El (ca. 300-600 kr/md), internet (ca. 300 kr/md), indboforsikring (ca. 100-200 kr/md). Varme og vand er ofte a conto i huslejen.",
  },
];

const relatedCalculators = [
  {
    title: "Løn efter skat",
    href: "/loen-efter-skat",
    description: "Beregn din nettoløn",
    icon: "💰",
  },
  {
    title: "Boliglån",
    href: "/boliglaan",
    description: "Beregn dit boliglån",
    icon: "🏠",
  },
  {
    title: "Elberegner",
    href: "/elberegner",
    description: "Beregn dit elforbrug",
    icon: "⚡",
  },
];

export default function HuslejePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Husleje Budget Beregner - Hvad har du råd til?"
        description="Gratis husleje beregner. Find ud af hvor meget du kan bruge på husleje baseret på din indkomst og udgifter."
        url={`${baseUrl}/husleje`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Bolig", href: "/kategori/bolig" }, { name: "Husleje Budget", href: "/husleje" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Husleje Budget Beregner
        </h1>
        <p className="text-lg text-gray-600">
          Find ud af hvor meget du kan bruge på husleje. Indtast din indkomst og udgifter, 
          og få et realistisk bud på din max husleje baseret på 30% reglen.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <HuslejeBudgetBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Hvor meget bør du bruge på husleje?</h2>
        <p>
          At finde den <strong>rigtige balance mellem husleje og andre udgifter</strong> er afgørende for
          en sund økonomi. Bruger du for meget på bolig, kan det gå ud over din <strong>livskvalitet</strong>
          og mulighed for <strong>opsparing</strong>.
        </p>
        
        <h3>30% reglen forklaret</h3>
        <p>
          Den mest udbredte tommelfingerregel siger, at din husleje (inkl. forbrugsudgifter)
          ikke bør overstige <strong>30% af din nettoindkomst</strong>. Nogle kilder siger 33%, men 30%
          giver mere <strong>buffer til uforudsete udgifter</strong>.
        </p>
        <p>
          <strong>Eksempel:</strong> Med en nettoløn på 25.000 kr bør din husleje max være 
          7.500 kr inkl. el, vand og varme.
        </p>

        <h3>Hvad inkluderer "husleje"?</h3>
        <p>
          Når du beregner dit <strong>boligbudget</strong>, skal du huske alle <strong>boligrelaterede udgifter</strong>:
        </p>
        <ul>
          <li>Grundleje/husleje</li>
          <li>A conto varme og vand</li>
          <li>Elektricitet</li>
          <li>Internet og TV</li>
          <li>Indboforsikring</li>
        </ul>

        <h3>Tips til at finde billigere bolig</h3>
        <ul>
          <li>Overvej delelejlighed eller roommate</li>
          <li>Kig udenfor de dyreste områder</li>
          <li>Vær fleksibel med størrelse og stand</li>
          <li>Tjek almene boliger (boligforeninger)</li>
          <li>Brug flere boligportaler og sociale medier</li>
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
