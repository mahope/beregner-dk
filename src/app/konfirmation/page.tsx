import KonfirmationBeregner from "@/components/KonfirmationBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("konfirmation");
}

const faqItems = [
  {
    question: "Hvad koster en konfirmation i gennemsnit?",
    answer: "En gennemsnitlig konfirmation koster mellem 8.000 og 25.000 kr. afhængigt af antal gæster, festtype og ønsker. De største poster er typisk mad og drikke, konfirmandtøj og lokale.",
  },
  {
    question: "Hvor meget giver man i konfirmationsgave?",
    answer: "Forældre giver typisk 2.000-5.000 kr., bedsteforældre 1.000-2.000 kr., øvrig familie 500-1.000 kr. og venner 200-500 kr. Beløbene varierer efter relation og økonomi.",
  },
  {
    question: "Hvornår er konfirmation i Danmark?",
    answer: "Konfirmationer afholdes typisk i april-maj. Den præcise dato afhænger af kirken og sognet. De fleste konfirmationer finder sted om søndagen.",
  },
  {
    question: "Skal man betale for kirken?",
    answer: "Nej, selve konfirmationen i kirken er gratis. Det er en del af folkekirkens tilbud. Du betaler kun for den efterfølgende fest og fejring.",
  },
  {
    question: "Hvordan sparer man på konfirmationsfesten?",
    answer: "Hold festen hjemme, lav maden selv, brug sæsonblomster til pynt, lån pynt fra venner, og overvej buffet i stedet for servering. En hjemmefest kan koste under det halve af en restaurantfest.",
  },
];

const relatedCalculators = [
  { title: "Huslejebudget", description: "Beregn dit boligbudget", href: "/husleje", icon: "🏠" },
  { title: "Børnepenge", description: "Se børne- og ungeydelse", href: "/boernepenge", icon: "👶" },
  { title: "Opsparingsberegner", description: "Spar op til festen", href: "/opsparing", icon: "📈" },
  { title: "Procentberegner", description: "Beregn procenter", href: "/procent", icon: "📊" },
];

export default function KonfirmationPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Konfirmationsbudget Beregner"
          description="Beregn dit budget til konfirmation med udgifter og forventede gaver."
          url={`${baseUrl}/konfirmation`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Familie", href: "/kategori/familie" }, { name: "Konfirmationsbudget", href: "/konfirmation" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Konfirmationsbudget Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn hvad konfirmationen koster. Se udgifter til mad, lokale, tøj og fotograf, og beregn forventede gaveindtægter fra familie og venner.
        </p>

        <KonfirmationBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan planlægger du konfirmationsbudgettet</h2>
          <p>
            En konfirmation er en stor dag — både for konfirmanden og familien. Ved at <strong>planlægge budgettet tidligt</strong> undgår du ubehagelige overraskelser og kan fokusere på det vigtigste: at fejre dagen.
          </p>

          <h2>De største udgiftsposter</h2>
          <p>
            <strong>Mad og drikke</strong> er typisk den største post og kan variere fra 150-200 kr./person hjemme til 400-700 kr./person på restaurant. <strong>Konfirmandtøj</strong> koster typisk 1.500-4.000 kr., og en <strong>fotograf</strong> ligger omkring 1.000-3.000 kr.
          </p>

          <h2>Gennemsnitlige konfirmationsgaver 2026</h2>
          <p>
            Gavebeløbet afhænger af <strong>relationen til konfirmanden</strong>. Forældre giver typisk mest, efterfulgt af bedsteforældre. Mange konfirmander modtager samlet set mellem <strong>10.000 og 25.000 kr.</strong> i gaver.
          </p>

          <h2>Sparetips til konfirmationen</h2>
          <ul>
            <li><strong>Hold festen hjemme:</strong> Spar tusindvis af kroner på lokaleleje</li>
            <li><strong>Lav maden selv:</strong> En buffet er billigere og nemmere end servering</li>
            <li><strong>Køb tøj i god tid:</strong> Undgå sæsontillæg ved at købe tidligt</li>
            <li><strong>Del fotograf:</strong> Gå sammen med en anden konfirmandfamilie</li>
            <li><strong>Brug naturen:</strong> Blomster og grene fra haven er flot og gratis pynt</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/konfirmation" adSlotId="konfirmation-sidebar" />
    </div>
  );
}
