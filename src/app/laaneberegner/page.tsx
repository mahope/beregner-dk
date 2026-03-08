import { generatePageMetadata } from "@/lib/page-helpers";
import dynamic from "next/dynamic";
const LaaneBeregner = dynamic(() => import("@/components/LaaneBeregner"));
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("laaneberegner");
}

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
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name="Låneberegner - Beregn lån og ydelse"
        description="Gratis låneberegner. Beregn månedlig ydelse, samlede renter og sammenlign forskellige lån."
        url={`${baseUrl}/laaneberegner`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Lån", href: "/kategori/laan" }, { name: "Låneberegner", href: "/laaneberegner" }]} />
      
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
          Før du optager et lån, er det vigtigt at forstå de <strong>samlede omkostninger</strong>.
          Vores <strong>låneberegner</strong> hjælper dig med at se, hvad lånet reelt koster - ikke
          bare den <strong>månedlige ydelse</strong>, men også de <strong>samlede renter</strong> over lånets løbetid.
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
          Lån kan give mening til <strong>investeringer</strong> der øger din værdi (<strong>uddannelse</strong>, <strong>bolig</strong>)
          eller nødvendige køb du ikke kan spare op til. Undgå at låne til <strong>forbrug</strong>
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
      <Sidebar currentHref="/laaneberegner" adSlotId="laaneberegner-sidebar" />
    </div>
  );
}
