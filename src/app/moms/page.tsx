import type { Metadata } from "next";
import MomsBeregner from "@/components/MomsBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Momsberegner - Beregn moms online | MinBeregner.dk",
  description:
    "Beregn dansk moms (25%) hurtigt. Eksempel: 1.000 kr × 1,25 = 1.250 kr inkl. moms. Tillæg moms, fratræk moms eller find momsandelen. Gratis momsberegner 2026.",
  keywords: [
    "momsberegner",
    "beregn moms",
    "moms beregner",
    "tillæg moms",
    "fratræk moms",
    "moms 25%",
    "dansk moms",
    "mva beregner",
    "moms kalkulator",
  ],
  openGraph: {
    title: "Momsberegner - Beregn dansk moms",
    description: "Beregn moms nemt. Tillæg eller fratræk 25% moms med vores gratis beregner.",
    url: `${baseUrl}/moms`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/moms`,
  },
};

const faqItems = [
  {
    question: "Hvad er den danske momssats?",
    answer:
      "Den danske momssats (moms/VAT) er 25%. Det betyder, at når du køber varer eller ydelser i Danmark, betaler du 25% i moms oveni prisen uden moms.",
  },
  {
    question: "Hvordan beregner man moms?",
    answer:
      "For at tillægge moms: Gange prisen uden moms med 1,25. For at fratrække moms: Dividér prisen inkl. moms med 1,25. Eksempel: 100 kr uden moms = 125 kr inkl. moms.",
  },
  {
    question: "Hvad er momsandelen i en pris inkl. moms?",
    answer:
      "Momsandelen i en pris inkl. moms er 20% (ikke 25%). Det skyldes at momsen beregnes af prisen uden moms. Regnestykket: 25/125 = 0,20 = 20%.",
  },
  {
    question: "Skal alle betale moms i Danmark?",
    answer:
      "De fleste varer og ydelser er momspligtige i Danmark. Dog er visse ydelser momsfritaget, fx sundhedsydelser, undervisning, og finansielle tjenesteydelser.",
  },
  {
    question: "Hvad er forskellen på moms og afgift?",
    answer:
      "Moms er en generel omsætningsafgift på 25% af de fleste varer og ydelser. Afgifter er specifikke skatter på bestemte produkter som fx biler, cigaretter og alkohol, og kommer oveni momsen.",
  },
  {
    question: "Hvornår kan virksomheder trække moms fra?",
    answer:
      "Momsregistrerede virksomheder kan trække moms fra på deres erhvervsmæssige indkøb (købsmoms). De opkræver moms fra kunder (salgsmoms) og afregner forskellen med SKAT.",
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
    title: "Procentberegner",
    href: "/procent",
    description: "Beregn procenter nemt",
    icon: "➗",
  },
  {
    title: "Renteberegner",
    href: "/renteberegner",
    description: "Beregn renter på lån",
    icon: "📊",
  },
];

export default function MomsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Momsberegner - Beregn dansk moms"
        description="Gratis momsberegner. Tillæg moms, fratræk moms eller find momsandelen i et beløb. Dansk moms 25%."
        url={`${baseUrl}/moms`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Momsberegner", url: `${baseUrl}/moms` },
        ]}
      />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Momsberegner
        </h1>
        <p className="text-lg text-gray-600">
          Beregn dansk moms nemt og hurtigt. Tillæg moms, fratræk moms, eller find momsandelen i et beløb.
          Den danske momssats er 25%.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <MomsBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Om moms i Danmark</h2>
        <p>
          Moms (merværdiafgift) er en generel forbrugsafgift på varer og tjenesteydelser i Danmark. 
          Med en momssats på <strong>25%</strong> har Danmark en af de højeste momssatser i verden.
        </p>
        
        <h3>Sådan fungerer moms</h3>
        <p>
          Når du køber en vare til 100 kr uden moms, betaler du 125 kr i alt (100 kr + 25 kr moms). 
          Virksomheder opkræver momsen og afregner den til SKAT. Momsregistrerede virksomheder kan 
          trække momsen fra på deres indkøb.
        </p>

        <h3>Momsfrie ydelser</h3>
        <p>
          Ikke alle varer og ydelser er momspligtige. Momsfritaget er bl.a.:
        </p>
        <ul>
          <li>Sundhedsydelser (læge, tandlæge)</li>
          <li>Undervisning og uddannelse</li>
          <li>Finansielle tjenesteydelser</li>
          <li>Udlejning af fast ejendom</li>
          <li>Personbefordring</li>
        </ul>

        <h3>Momsregistrering for virksomheder</h3>
        <p>
          Virksomheder med en årlig omsætning over 50.000 kr skal momsregistreres. 
          De skal opkræve moms af deres salg og kan til gengæld trække moms fra på deres indkøb.
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
