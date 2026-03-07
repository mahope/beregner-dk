import type { Metadata } from "next";
import RejsebudgetBeregner from "@/components/RejsebudgetBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Rejsebudget Beregner - Hvad koster en ferie? | MinBeregner.dk",
  description:
    "Beregn dit rejsebudget til populære destinationer. Se estimerede udgifter til fly, hotel, mad og oplevelser for budget-, standard- og luksusrejser.",
  keywords: [
    "rejsebudget beregner",
    "hvad koster en ferie",
    "ferie budget",
    "rejse pris",
    "ferie beregner",
    "rejseudgifter",
    "feriebudget",
    "hvad koster en tur til",
  ],
  openGraph: {
    title: "Rejsebudget Beregner - Hvad koster en ferie?",
    description: "Beregn dit samlede rejsebudget med fly, hotel, mad og oplevelser.",
    url: `${baseUrl}/rejsebudget`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/rejsebudget`,
  },
};

const faqItems = [
  {
    question: "Hvad koster en uges ferie i Sydeuropa?",
    answer: "En uges ferie i Sydeuropa koster typisk 5.000-8.000 kr. pr. person for en standardrejse inkl. fly, hotel, mad og oplevelser. Budget-rejser kan klares for 3.500-5.000 kr., mens luksus koster 10.000-15.000 kr. pr. person.",
  },
  {
    question: "Hvornår er det billigst at rejse?",
    answer: "Lavest priser finder du typisk i lavsæsonen: januar-marts og november for Sydeuropa, september-november for Asien. Book fly 6-8 uger i forvejen og undgå skoleferier for de bedste priser.",
  },
  {
    question: "Hvor meget skal man budgettere til mad?",
    answer: "Madbudgettet varierer meget: I Sydøstasien kan du spise godt for 100-200 kr./dag, i Centraleuropa 200-400 kr./dag, og i Skandinavien/USA 300-600 kr./dag. Morgenmad på hotellet sparer penge.",
  },
  {
    question: "Skal jeg have rejseforsikring?",
    answer: "Ja, altid. Det blå EU-sygesikringskort dækker kun offentlig behandling i EU. En rejseforsikring dækker afbestilling, bagageforsinkelse, hjemtransport og privat behandling. Mange kreditkort inkluderer en.",
  },
  {
    question: "Hvordan sparer jeg på rejsebudgettet?",
    answer: "Book i god tid, vær fleksibel med datoer, brug prissammenligningssider, bo centralt (spar transport), spis lokalt (undgå turistfælder), og overvej lejlighed i stedet for hotel til længere ophold.",
  },
];

const relatedCalculators = [
  { title: "Valutaberegner", description: "Omregn valuta", href: "/valuta", icon: "💱" },
  { title: "Opsparingsberegner", description: "Spar op til rejsen", href: "/opsparing", icon: "📈" },
  { title: "Procentberegner", description: "Beregn rabatter", href: "/procent", icon: "📊" },
  { title: "Tidszone", description: "Se tidsforskel", href: "/tidszone", icon: "🌍" },
];

export default function RejsebudgetPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Rejsebudget Beregner"
          description="Beregn dit rejsebudget til populære destinationer med fly, hotel, mad og oplevelser."
          url={`${baseUrl}/rejsebudget`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Hverdag", href: "/kategori/hverdag" }, { name: "Rejsebudget Beregner", href: "/rejsebudget" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Rejsebudget Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn dit samlede rejsebudget baseret på destination, rejsetype og antal dage. Se estimerede udgifter til fly, hotel, mad, transport og oplevelser.
        </p>

        <RejsebudgetBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Planlæg dit rejsebudget</h2>
          <p>
            Et godt rejsebudget giver dig overblik over de samlede udgifter, så du kan spare op og undgå ubehagelige overraskelser. Beregneren giver dig et realistisk estimat baseret på gennemsnitspriser for populære destinationer.
          </p>

          <h2>De største udgiftsposter</h2>
          <p>
            <strong>Fly</strong> er ofte den største enkeltudgift ved oversøiske rejser. <strong>Overnatning</strong> er den største post ved europæiske rejser, og her kan du spare mest ved at vælge budget-muligheder som hostels eller Airbnb.
          </p>

          <h2>Sparetips til rejsen</h2>
          <ul>
            <li><strong>Book tidligt:</strong> Fly og hotel er billigst 6-10 uger før afrejse</li>
            <li><strong>Vær fleksibel:</strong> Afrejse tirsdag-torsdag er typisk billigst</li>
            <li><strong>Spis lokalt:</strong> Sidestrøgernes restauranter er billigere og ofte bedre</li>
            <li><strong>Gratis oplevelser:</strong> Mange byer har gratis museer, parker og walking tours</li>
            <li><strong>Rejsekort:</strong> Brug lokale dagskort til offentlig transport</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/rejsebudget" adSlotId="rejsebudget-sidebar" />
    </div>
  );
}
