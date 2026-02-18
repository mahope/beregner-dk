import type { Metadata } from "next";
import ForbrugslaanBeregner from "@/components/ForbrugslaanBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Forbrugslån beregner - Beregn forbrugslån og ydelse | MinBeregner.dk",
  description:
    "Gratis forbrugslån beregner. Beregn månedlig ydelse, samlede renter og find det bedste forbrugslån. Sammenlign renter og ÅOP fra flere udbydere.",
  keywords: [
    "forbrugslån beregner",
    "beregn forbrugslån",
    "forbrugslån ydelse",
    "lån uden sikkerhed",
    "sammenlign forbrugslån",
    "billigt forbrugslån",
    "forbrugslån rente",
  ],
  openGraph: {
    title: "Forbrugslån beregner - Beregn din låneydelse",
    description: "Beregn månedlig ydelse, renter og sammenlign forbrugslån. Gratis online beregner.",
    url: `${baseUrl}/forbrugslaan`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/forbrugslaan`,
  },
};

const faqItems = [
  {
    question: "Hvad er et forbrugslån?",
    answer:
      "Et forbrugslån er et lån uden sikkerhed i bolig eller bil. Du kan bruge pengene til hvad du vil - rejser, elektronik, renovation eller andre formål. Renten er typisk højere end boliglån, men lavere end kviklån.",
  },
  {
    question: "Hvad er ÅOP og hvorfor er det vigtigt?",
    answer:
      "ÅOP (Årlige Omkostninger i Procent) inkluderer alle låneomkostninger - rente, stiftelsesgebyr og alle andre gebyrer. Det giver dig det reelle billede af lånets pris og gør det nemt at sammenligne forskellige lån.",
  },
  {
    question: "Hvor meget kan jeg låne som forbrugslån?",
    answer:
      "Typisk kan du låne mellem 10.000 og 350.000 kr som forbrugslån. Det præcise beløb afhænger af din indkomst, kreditvurdering og gæld. Som tommelfingerregel bør ydelsen ikke overstige 30-40% af din rådighedsbeløb.",
  },
  {
    question: "Hvad er typisk rente på forbrugslån?",
    answer:
      "Renter på forbrugslån varierer typisk mellem 7% og 20% afhængigt af lånebeløb, løbetid og din kreditvurdering. Bank Norwegian og andre网上银行 tilbyder ofte de laveste renter, mens traditionelle banker kan kræve højere rente.",
  },
  {
    question: "Kan jeg indfri forbrugslån før tid?",
    answer:
      "Ja, de fleste forbrugslån kan indfries før tid. Tjek om der er et indfrielsesgebyr. Ved at betale ekstra afdrag sparer du renter. Nogle udbydere tilbyder også mulighed for afdragsfrihed i perioder.",
  },
  {
    question: "Er forbrugslån det samme som kviklån?",
    answer:
      "Nej, der er forskel. Forbrugslån har typisk lavere rente (7-20%), længere løbetid og mere seriøse vilkår. Kviklån har ofte meget høj rente (100%+) og kortere løbetid. Forbrugslån er reguleret af forbrugerombudsmanden, mens kviklån ikke er det.",
  },
];

const relatedCalculators = [
  {
    title: "Låneberegner",
    href: "/laaneberegner",
    description: "Generel låneberegner",
    icon: "💰",
  },
  {
    title: "Billån",
    href: "/billaan",
    description: "Beregn dit billån",
    icon: "🚗",
  },
  {
    title: "Boliglån",
    href: "/boliglaan",
    description: "Beregn dit boliglån",
    icon: "🏠",
  },
];

export default function ForbrugslaanPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Forbrugslån beregner - Beregn lån og ydelse"
        description="Gratis forbrugslån beregner. Beregn månedlig ydelse, samlede renter og find det bedste forbrugslån."
        url={`${baseUrl}/forbrugslaan`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Lån", href: "/kategori/laan" }, { name: "Forbrugslån", href: "/forbrugslaan" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Forbrugslån beregner
        </h1>
        <p className="text-lg text-gray-600">
          Beregn din månedlige ydelse på et forbrugslån, se samlede renteudgifter og 
          find det bedste lån. Forbrugslån er lån uden sikkerhed, som du kan bruge 
          til hvad du vil - fra rejser til større køb.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <ForbrugslaanBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Om forbrugslån</h2>
        <p>
          Forbrugslån er en populær finansieringsløsning for danskere, der ønsker 
          fleksibilitet i deres økonomi. I modsætning til boliglån eller billån er 
          forbrugslån ikke knyttet til en specifik aktiv, hvilket giver frihed til at 
          bruge pengene efter eget ønske.
        </p>
        
        <h3>Typer af forbrugslån</h3>
        <ul>
          <li><strong>Banklån:</strong> Traditionelle banker tilbyder ofte de bedste vilkår for kunder med god økonomi</li>
          <li><strong>Online banker:</strong> Bank Norwegian, Lunar og lignende tilbyder nem online ansøgning</li>
          <li><strong>Sammenligningstjenester:</strong> Samlino og Mybanker hjælper dig med at finde den bedste rente</li>
          <li><strong>Creditforeninger:</strong> Nogle creditforeninger tilbyder forbrugslån med fordelagtige vilkår</li>
        </ul>

        <h3>Sådan får du det bedste forbrugslån</h3>
        <ol>
          <li><strong>Sammenlign flere udbydere:</strong> Brug vores beregner og sammenlign ÅOP fra flere banker</li>
          <li><strong>Tjek alle gebyrer:</strong> Stiftelsesgebyr og administration kan gøre stor forskel</li>
          <li><strong>Vurder løbetid:</strong> Kortere løbetid = lavere samlede renter, men højere ydelse</li>
          <li><strong>Overvej din rådighedsbeløb:</strong> Sørg for at ydelsen passer til din økonomi</li>
          <li><strong>Læs det med småt:</strong> Tjek for gebyrer ved tidlig indfrielse og ekstra indbetalinger</li>
        </ol>

        <h3>Hvornår giver forbrugslån mening?</h3>
        <p>
          Forbrugslån kan være fornuftige til større investeringer som renovation af bolig, 
          køb af bil, uddannelse eller andre formål hvor opsparing ikke er mulig. Det er 
          vigtigt at låne ansvarligt og kun det beløb, du har råd til at betale tilbage.
        </p>
        <p>
          Undgå at låne til forbrug der hurtigt mister værdi, som rejser, elektronik eller 
          tøj. I disse tilfælde kan det være bedre at spare op først.
        </p>
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
