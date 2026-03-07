import type { Metadata } from "next";
import GaeldsfriBeregner from "@/components/GaeldsfriBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Gældsfri Beregner - Beregn din vej ud af gæld | MinBeregner.dk",
  description:
    "Beregn hvor lang tid det tager at blive gældsfri. Sammenlign lavine- og snebold-metoden. Se effekten af ekstra afdrag på din gæld.",
  keywords: [
    "gældsfri beregner",
    "gældsafvikling",
    "gæld beregner",
    "blive gældsfri",
    "lavine metode",
    "snebold metode",
    "afbetal gæld",
    "gældsplan",
  ],
  openGraph: {
    title: "Gældsfri Beregner - Beregn din vej ud af gæld",
    description: "Beregn afviklingstid og sammenlign lavine vs. snebold metoden.",
    url: `${baseUrl}/gaeldsfri`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/gaeldsfri`,
  },
};

const faqItems = [
  {
    question: "Hvad er lavine-metoden?",
    answer: "Lavine-metoden prioriterer gælden med den højeste rente. Ekstra afdrag går til den dyreste gæld først. Det er matematisk den billigste metode og sparer dig mest i renter over tid.",
  },
  {
    question: "Hvad er snebold-metoden?",
    answer: "Snebold-metoden prioriterer den mindste gæld. Du betaler den mindste gæld helt ud først, hvilket giver hurtige sejre og motivation. Metoden koster lidt mere i renter, men kan være nemmere at holde fast i.",
  },
  {
    question: "Hvor meget ekstra skal jeg betale af?",
    answer: "Selv små ekstra afdrag gør en stor forskel. 500-1.000 kr. ekstra om måneden kan forkorte din afviklingstid med flere år og spare tusindvis af kroner i renter. Brug beregneren til at se den præcise effekt.",
  },
  {
    question: "Skal jeg spare op eller betale gæld?",
    answer: "Som tommelfingerregel: Hvis renten på din gæld er højere end afkastet på din opsparing, bør du prioritere gældsafvikling. Forbrugslån med 8-20% rente bør altid afvikles før du investerer.",
  },
  {
    question: "Kan jeg forhandle min rente ned?",
    answer: "Ja, kontakt din bank eller låneudbyder. Ved at samle lån (gældskonsolidering) kan du ofte opnå lavere rente. Overvej også at omlægge dyre forbrugslån til billigere boliglån hvis muligt.",
  },
];

const relatedCalculators = [
  { title: "Forbrugslån", description: "Beregn ydelse på forbrugslån", href: "/forbrugslaan", icon: "💳" },
  { title: "Låneberegner", description: "Sammenlign lån", href: "/laaneberegner", icon: "🏦" },
  { title: "Renteberegner", description: "Beregn rente og tilbagebetaling", href: "/renteberegner", icon: "📊" },
  { title: "Opsparingsberegner", description: "Beregn renters rente", href: "/opsparing", icon: "📈" },
];

export default function GaeldsfriPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Gældsfri Beregner"
          description="Beregn hvor lang tid det tager at blive gældsfri. Sammenlign lavine- og snebold-metoden."
          url={`${baseUrl}/gaeldsfri`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Lån", href: "/kategori/laan" }, { name: "Gældsfri Beregner", href: "/gaeldsfri" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Gældsfri Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn hvor lang tid det tager at blive gældsfri og se effekten af ekstra afdrag. Sammenlign lavine-metoden (billigst) og snebold-metoden (mest motiverende).
        </p>

        <GaeldsfriBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan bliver du gældsfri hurtigere</h2>
          <p>
            At blive gældsfri kræver en plan. Det vigtigste skridt er at betale mere end minimumsafdraget — selv små ekstra beløb gør en enorm forskel over tid takket være renters rente-effekten.
          </p>

          <h2>Lavine vs. snebold — hvilken metode er bedst?</h2>
          <p>
            <strong>Lavine-metoden</strong> er matematisk optimal. Du retter ekstra afdrag mod gælden med den højeste rente, hvilket minimerer dine samlede renteomkostninger.
          </p>
          <p>
            <strong>Snebold-metoden</strong> retter ekstra afdrag mod den mindste gæld. Når den er betalt ud, går alle penge videre til den næstmindste. De hyppige &quot;sejre&quot; kan motivere dig til at holde fast — og den bedste metode er den du faktisk følger.
          </p>

          <h2>Tips til gældsafvikling</h2>
          <ul>
            <li><strong>Lav et budget:</strong> Find ud af hvad du kan afsætte ekstra til gældsafvikling</li>
            <li><strong>Forhandl renten:</strong> Kontakt din bank — du kan ofte få lavere rente</li>
            <li><strong>Undgå ny gæld:</strong> Brug kontanter eller debit i stedet for kredit</li>
            <li><strong>Automatiser:</strong> Sæt automatiske overførsler til gældsafvikling</li>
            <li><strong>Nødfond først:</strong> Hav 1-2 måneders udgifter som buffer, så du ikke optager ny gæld ved uventede udgifter</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/gaeldsfri" adSlotId="gaeldsfri-sidebar" />
    </div>
  );
}
