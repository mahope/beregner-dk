import type { Metadata } from "next";
import BruttoNettoBeregner from "@/components/BruttoNettoBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Brutto/Netto Beregner 2026 - Fra netto til brutto | MinBeregner.dk",
  description:
    "Beregn hvilken bruttoløn du skal have for at få en bestemt udbetaling. Perfekt til lønforhandling. Opdateret med 2026-skattesatser.",
  keywords: [
    "brutto netto beregner",
    "netto til brutto",
    "løn beregner",
    "hvad skal jeg tjene",
    "lønforhandling beregner",
    "bruttoløn beregner",
    "omvendt skatteberegning",
  ],
  openGraph: {
    title: "Brutto/Netto Beregner 2026",
    description: "Beregn hvilken bruttoløn du behøver for din ønskede udbetaling.",
    url: `${baseUrl}/brutto-netto`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/brutto-netto`,
  },
};

const faqItems = [
  {
    question: "Hvordan beregner jeg brutto fra netto?",
    answer: "Indtast din ønskede månedsløn efter skat, og beregneren finder den bruttoløn der giver dig netop denne udbetaling efter AM-bidrag, bundskat, kommuneskat og eventuel mellemskat/topskat.",
  },
  {
    question: "Hvad er forskellen på brutto og netto?",
    answer: "Bruttoløn er din løn før skat og afgifter. Nettoløn er det du faktisk får udbetalt. Forskellen er AM-bidrag (8%), bundskat (12,01%), kommuneskat (ca. 25%) og eventuel mellemskat/topskat.",
  },
  {
    question: "Hvor meget skal jeg tjene for at få 25.000 kr. udbetalt?",
    answer: "Med gennemsnitlig kommuneskat (25,07%) og uden kirkeskat skal du tjene ca. 40.000-42.000 kr. brutto for at få ca. 25.000 kr. udbetalt. Det præcise beløb afhænger af din kommune.",
  },
  {
    question: "Kan jeg bruge beregneren til lønforhandling?",
    answer: "Ja! Indtast den udbetaling du ønsker, og se hvilken bruttoløn du skal forhandle dig til. Husk at pension, fradrag og andre forhold også påvirker din udbetaling.",
  },
];

const relatedCalculators = [
  { title: "Løn efter skat", description: "Beregn netto fra brutto", href: "/loen-efter-skat", icon: "💰" },
  { title: "Topskat Beregner", description: "Betaler du topskat?", href: "/topskat", icon: "📊" },
  { title: "Pensionsberegner", description: "Beregn din pension", href: "/pension", icon: "🧓" },
  { title: "Timeprisberegner", description: "Find din timepris", href: "/timepris", icon: "⏱️" },
];

export default function BruttoNettoPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Brutto/Netto Beregner 2026"
          description="Beregn hvilken bruttoløn du behøver for at få din ønskede udbetaling. Opdateret med 2026-satser."
          url={`${baseUrl}/brutto-netto`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Brutto/Netto Beregner", href: "/brutto-netto" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Brutto/Netto Beregner 2026</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn hvilken bruttoløn du skal have for at få en bestemt udbetaling efter skat. Perfekt til lønforhandling og økonomisk planlægning.
        </p>

        <BruttoNettoBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Fra netto til brutto — den omvendte skatteberegning</h2>
          <p>
            Denne beregner gør det modsatte af en normal skatteberegning. I stedet for at taste din bruttoløn ind og se hvad du får udbetalt, taster du din <strong>ønskede udbetaling</strong> ind og ser hvad du skal tjene brutto.
          </p>

          <h2>Perfekt til lønforhandling</h2>
          <p>
            Når du forhandler løn, er det nyttigt at vide præcis hvad en <strong>lønforhøjelse</strong> betyder for din udbetaling — og omvendt. Hvis du fx ønsker 2.000 kr. mere udbetalt om måneden, skal du typisk forhandle dig til <strong>3.500-4.000 kr. mere i bruttoløn</strong> (afhængig af din skatteprocent).
          </p>

          <h2>Hvad trækkes fra din løn?</h2>
          <ul>
            <li><strong>AM-bidrag (8%):</strong> Trækkes af bruttolønnen før skat</li>
            <li><strong>Bundskat (12,01%):</strong> Betales af alle lønindkomster</li>
            <li><strong>Kommuneskat (ca. 25%):</strong> Varierer fra 22,8% til 27,8% afhængig af kommune</li>
            <li><strong>Kirkeskat (ca. 0,7%):</strong> Valgfri — kun for medlemmer af folkekirken</li>
            <li><strong>Mellemskat (7,5%):</strong> Over 641.200 kr./år efter AM-bidrag</li>
            <li><strong>Topskat (7,5%):</strong> Over 777.900 kr./år efter AM-bidrag</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/brutto-netto" adSlotId="brutto-netto-sidebar" />
    </div>
  );
}
