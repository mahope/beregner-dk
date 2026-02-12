import type { Metadata } from "next";
import BraendstofBeregner from "@/components/BraendstofBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Brændstofberegner - Beregn benzin, diesel og el | MinBeregner.dk",
  description:
    "Gratis brændstofberegner. Beregn pris for benzin, diesel eller el-bil. Se hvad en tur koster, pris pr. km og dit årlige brændstofforbrug.",
  keywords: [
    "brændstofberegner",
    "benzin beregner",
    "diesel beregner",
    "el bil beregner",
    "pris pr km",
    "brændstofforbrug",
    "tur pris beregner",
    "km pris bil",
  ],
  openGraph: {
    title: "Brændstofberegner - Benzin, diesel og el",
    description: "Beregn hvad det koster at køre bil. Sammenlign benzin, diesel og el.",
    url: `${baseUrl}/braendstof`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/braendstof`,
  },
};

const faqItems = [
  {
    question: "Hvordan beregner jeg brændstofudgifter for en tur?",
    answer:
      "Tag turens distance, divider med din bils km/liter, og gang med literprisen. Eksempel: 200 km ÷ 15 km/l × 13 kr/l = 173 kr.",
  },
  {
    question: "Hvad er en normal km/liter for en bil?",
    answer:
      "En typisk benzinbil kører 12-18 km/l, diesel 15-22 km/l. Nyere biler er mere effektive. El-biler bruger typisk 15-20 kWh/100 km.",
  },
  {
    question: "Er el-biler billigere at køre end benzinbiler?",
    answer:
      "Ja, el-biler er typisk 50-70% billigere pr. km i brændstof. Men el-biler har højere indkøbspris, så det afhænger af hvor meget du kører.",
  },
  {
    question: "Hvordan finder jeg min bils forbrug?",
    answer:
      "Nulstil triptæller ved fuld tank. Kør normalt. Ved næste tankning, divider km kørt med liter tanket. Det giver km/liter.",
  },
  {
    question: "Hvad påvirker brændstofforbruget?",
    answer:
      "Kørestil (aggressiv kørsel bruger mere), hastighed (forbrug stiger ved høj fart), vejr, dæktryk, aircondition, last i bilen og trafikforhold.",
  },
  {
    question: "Hvad koster det at lade en el-bil?",
    answer:
      "Hjemmeladning: ca. 2-4 kr/kWh. Offentlige ladestandere: 3-6 kr/kWh. Hurtiglading: 4-8 kr/kWh. En fuld opladning (60 kWh) koster 120-480 kr.",
  },
];

const relatedCalculators = [
  {
    title: "Bilberegner",
    href: "/bil",
    description: "Beregn samlede biludgifter",
    icon: "🚗",
  },
  {
    title: "Elberegner",
    href: "/elberegner",
    description: "Beregn dit elforbrug",
    icon: "⚡",
  },
  {
    title: "Procentberegner",
    href: "/procent",
    description: "Beregn procenter",
    icon: "➗",
  },
];

export default function BraendstofPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Brændstofberegner - Benzin, diesel og el"
        description="Gratis brændstofberegner. Beregn pris for benzin, diesel eller el-bil. Se hvad en tur koster og pris pr. km."
        url={`${baseUrl}/braendstof`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Brændstofberegner", url: `${baseUrl}/braendstof` },
        ]}
      />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Brændstofberegner
        </h1>
        <p className="text-lg text-gray-600">
          Beregn hvad det koster at køre bil - benzin, diesel eller el. 
          Se pris for en tur, pris pr. kilometer og dit årlige brændstofforbrug.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <BraendstofBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Om brændstofforbrug</h2>
        <p>
          At forstå dit brændstofforbrug hjælper dig med at budgettere bilkørsel 
          og vælge den rigtige bil. Forbruget varierer betydeligt mellem biltyper, 
          kørestil og kørselsforhold.
        </p>
        
        <h3>Typiske forbrug</h3>
        <ul>
          <li><strong>Benzin:</strong> 12-18 km/l (5,5-8,3 l/100km)</li>
          <li><strong>Diesel:</strong> 15-22 km/l (4,5-6,7 l/100km)</li>
          <li><strong>El:</strong> 15-20 kWh/100km (svarer til 60-80 km/kWh)</li>
          <li><strong>Hybrid:</strong> 18-25 km/l (benzin-ækvivalent)</li>
        </ul>

        <h3>Sådan reducerer du forbruget</h3>
        <ul>
          <li>Kør jævnt - undgå hård acceleration og opbremsning</li>
          <li>Hold jævn hastighed på motorvejen (optimal 80-100 km/t)</li>
          <li>Tjek dæktryk regelmæssigt (for lavt tryk øger forbrug)</li>
          <li>Fjern unødvendig vægt og tagboks</li>
          <li>Brug klimaanlæg med måde</li>
          <li>Planlæg ruter for at undgå kø</li>
        </ul>

        <h3>Benzin vs. Diesel vs. El</h3>
        <p>
          Ved valg af brændstoftype bør du overveje:
        </p>
        <ul>
          <li><strong>Benzin:</strong> Lavere indkøbspris, højere km-pris</li>
          <li><strong>Diesel:</strong> Bedre for lange afstande, højere afgifter</li>
          <li><strong>El:</strong> Lavest km-pris, men højere indkøbspris og behov for ladeinfrastruktur</li>
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
