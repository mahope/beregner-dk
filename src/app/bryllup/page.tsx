import type { Metadata } from "next";
import BryllupBeregner from "@/components/BryllupBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Bryllupsbudget Beregner - Hvad koster et bryllup? | MinBeregner.dk",
  description:
    "Beregn dit bryllupsbudget. Se udgifter til venue, mad, fotograf, musik, kjole og ringe. Gennemsnitlige danske bryllupspriser 2026.",
  keywords: [
    "bryllupsbudget",
    "hvad koster et bryllup",
    "bryllup pris",
    "bryllup beregner",
    "bryllupsbudget beregner",
    "bryllup udgifter",
    "gennemsnit bryllup Danmark",
  ],
  openGraph: {
    title: "Bryllupsbudget Beregner - Hvad koster et bryllup?",
    description: "Beregn dit samlede bryllupsbudget med venue, catering, fotograf og alle udgiftsposter.",
    url: `${baseUrl}/bryllup`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/bryllup`,
  },
};

const faqItems = [
  {
    question: "Hvad koster et gennemsnitligt bryllup i Danmark?",
    answer: "Et gennemsnitligt dansk bryllup koster 80.000-150.000 kr. med 80-100 gæster. De største poster er mad/drikke (40-50%), venue (10-15%) og fotograf (5-10%). Budget-bryllupper kan klares for under 50.000 kr.",
  },
  {
    question: "Hvad er den største udgiftspost?",
    answer: "Mad og drikke er næsten altid den største post og udgør typisk 40-50% af det samlede budget. Regn med 350-1.100 kr. pr. person afhængigt af niveau. Venue/lokale er den næststørste post.",
  },
  {
    question: "Hvornår er det billigst at holde bryllup?",
    answer: "Vinterbryllupper (november-marts) er typisk 20-30% billigere end sommerbryllupper. Fredag og søndag er billigere end lørdag. Book venue 12-18 måneder i forvejen for bedste pris og udvalg.",
  },
  {
    question: "Skal man betale for vielsen i kirken?",
    answer: "Nej, vielse i folkekirken er gratis for medlemmer. Borgerlig vielse er også gratis. Du betaler kun for evt. ekstra kirketjenester som organist-tillæg eller ekstra pynt.",
  },
  {
    question: "Hvordan sparer man på bryllupsbudgettet?",
    answer: "Hold festen på en hverdagsaften eller udenfor højsæson, vælg buffet i stedet for servering, brug DIY-dekoration, vælg en DJ i stedet for live band, og overvej at låne/leje brudekjole.",
  },
];

const relatedCalculators = [
  { title: "Opsparingsberegner", description: "Spar op til brylluppet", href: "/opsparing", icon: "📈" },
  { title: "Huslejebudget", description: "Beregn boligbudget", href: "/husleje", icon: "🏠" },
  { title: "Forbrugslån", description: "Finansier brylluppet", href: "/forbrugslaan", icon: "💳" },
  { title: "Procentberegner", description: "Beregn procenter", href: "/procent", icon: "📊" },
];

export default function BryllupPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Bryllupsbudget Beregner"
          description="Beregn dit samlede bryllupsbudget med venue, catering, fotograf og alle udgiftsposter."
          url={`${baseUrl}/bryllup`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Familie", href: "/kategori/familie" }, { name: "Bryllupsbudget", href: "/bryllup" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Bryllupsbudget Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn dit samlede bryllupsbudget. Vælg venue, madniveau og juster alle udgiftsposter for at se den samlede pris og pris pr. gæst.
        </p>

        <BryllupBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Planlæg dit bryllupsbudget</h2>
          <p>
            Et bryllup er en af livets største fester — og en af de dyreste. Ved at planlægge budgettet tidligt kan du prioritere det, der betyder mest for jer, og undgå ubehagelige overraskelser.
          </p>

          <h2>Typiske udgiftsposter</h2>
          <p>
            <strong>Mad og drikke</strong> er den klart største post. <strong>Venue</strong> varierer enormt — fra gratis i en privat have til 35.000+ kr. for et slot. <strong>Fotograf</strong> er en investering i minder og bør ikke spares væk.
          </p>

          <h2>Sparetips til brylluppet</h2>
          <ul>
            <li><strong>Vælg lavsæson:</strong> Vinter og hverdage er markant billigere</li>
            <li><strong>DIY-dekoration:</strong> Blomster fra haven og hjemmelavet pynt sparer tusindvis</li>
            <li><strong>Buffet:</strong> Billigere og mere afslappet end serveret middag</li>
            <li><strong>DJ over band:</strong> En DJ koster 3.000-5.000 kr. vs. 15.000+ for et band</li>
            <li><strong>Prioritér:</strong> Vælg 2-3 ting der virkelig betyder noget, og spar på resten</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/bryllup" adSlotId="bryllup-sidebar" />
    </div>
  );
}
