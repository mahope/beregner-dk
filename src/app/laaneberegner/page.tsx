import type { Metadata } from "next";
import LaaneBeregner from "@/components/LaaneBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Låneberegner - Beregn lån og ydelse | MinBeregner.dk",
  description:
    "Gratis låneberegner. Beregn månedlig ydelse, samlede renter og sammenlign forskellige lån. Se afdragsplan og find det bedste lån.",
  keywords: [
    "låneberegner",
    "beregn lån",
    "lån ydelse beregner",
    "annuitetslån beregner",
    "sammenlign lån",
    "lån rente beregner",
    "afdragsplan",
    "ÅOP beregner",
  ],
  openGraph: {
    title: "Låneberegner - Beregn din låneydelse",
    description: "Beregn månedlig ydelse, renter og sammenlign lån. Gratis online beregner.",
    url: `${baseUrl}/laaneberegner`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/laaneberegner`,
  },
};

const faqItems = [
  {
    question: "Hvad er forskellen på annuitetslån og serielån?",
    answer:
      "Ved annuitetslån betaler du samme beløb hver måned. Ved serielån er afdraget fast, men ydelsen falder over tid fordi renten beregnes af mindre og mindre gæld. Annuitetslån er mest almindeligt.",
  },
  {
    question: "Hvad er ÅOP og hvorfor er det vigtigt?",
    answer:
      "ÅOP (Årlige Omkostninger i Procent) inkluderer alle låneomkostninger - rente, gebyrer, stiftelsesgebyr. Det giver dig det reelle billede af lånets pris og gør det muligt at sammenligne forskellige lån.",
  },
  {
    question: "Hvor meget kan jeg låne?",
    answer:
      "Det afhænger af din indkomst, faste udgifter og kreditvurdering. Som tommelfingerregel bør din samlede gæld ikke overstige 4-5 gange din årlige indkomst, og ydelser max 30-40% af din nettoløn.",
  },
  {
    question: "Er det bedre med kort eller lang løbetid?",
    answer:
      "Kort løbetid giver lavere samlede renteudgifter, men højere månedlig ydelse. Lang løbetid giver lavere ydelse, men flere renter totalt. Vælg ud fra hvad din økonomi kan bære.",
  },
  {
    question: "Hvad er effektiv rente?",
    answer:
      "Effektiv rente er den årlige rente inklusive renters rente (at renten tilskrives og der betales rente af renten). Den er højere end den nominelle rente og viser den reelle rentebyrde.",
  },
  {
    question: "Kan jeg indfri lånet før tid?",
    answer:
      "Ja, de fleste lån kan indfries før tid. Tjek om der er et indfrielsesgebyr. Ved at betale ekstra afdrag sparer du renter. Bed om en indfrielsesopgørelse fra din bank.",
  },
];

const relatedCalculators = [
  {
    title: "Renteberegner",
    href: "/renteberegner",
    description: "Beregn renter detaljeret",
    icon: "📊",
  },
  {
    title: "Boliglån",
    href: "/boliglaan",
    description: "Beregn dit boliglån",
    icon: "🏠",
  },
  {
    title: "Momsberegner",
    href: "/moms",
    description: "Beregn moms",
    icon: "🧾",
  },
];

export default function LaaneberegnerPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Låneberegner - Beregn lån og ydelse"
        description="Gratis låneberegner. Beregn månedlig ydelse, samlede renter og sammenlign forskellige lån."
        url={`${baseUrl}/laaneberegner`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Låneberegner", url: `${baseUrl}/laaneberegner` },
        ]}
      />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Låneberegner
        </h1>
        <p className="text-lg text-gray-600">
          Beregn din månedlige ydelse på et lån, se samlede renteudgifter og sammenlign 
          forskellige lånemuligheder. Virker til forbrugslån, billån og andre lån.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <LaaneBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Om låneberegning</h2>
        <p>
          Før du optager et lån, er det vigtigt at forstå de samlede omkostninger. 
          Vores låneberegner hjælper dig med at se, hvad lånet reelt koster - ikke 
          bare den månedlige ydelse, men også de samlede renter over lånets løbetid.
        </p>
        
        <h3>Typer af lån</h3>
        <ul>
          <li><strong>Forbrugslån:</strong> Til mindre køb, ofte 5-25% i rente</li>
          <li><strong>Billån:</strong> Til køb af bil, typisk 4-12% i rente</li>
          <li><strong>Boliglån:</strong> Til køb af bolig, lavest rente (1-5%)</li>
          <li><strong>Kviklån:</strong> Små hurtige lån, meget høj rente (100%+)</li>
        </ul>

        <h3>Sådan får du det bedste lån</h3>
        <ol>
          <li>Sammenlign ÅOP fra flere udbydere</li>
          <li>Tjek alle gebyrer (stiftelse, administration, indfrielse)</li>
          <li>Vurder om du kan klare ydelsen hvis renten stiger</li>
          <li>Overvej om du kan spare op i stedet for at låne</li>
          <li>Læs det med småt - er der binding eller gebyrer ved ekstra afdrag?</li>
        </ol>

        <h3>Hvornår giver det mening at låne?</h3>
        <p>
          Lån kan give mening til investeringer der øger din værdi (uddannelse, bolig) 
          eller nødvendige køb du ikke kan spare op til. Undgå at låne til forbrug 
          der hurtigt mister værdi (rejser, elektronik, tøj).
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
