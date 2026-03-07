import type { Metadata } from "next";
import VaegttabBeregner from "@/components/VaegttabBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Vægttab Beregner - Beregn dit kalorieunderskud | MinBeregner.dk",
  description:
    "Beregn dit daglige kaloriemål for vægttab. Se hvor mange kalorier du skal spise for at tabe dig sundt og realistisk.",
  keywords: [
    "vægttab beregner",
    "kalorieunderskud",
    "tab dig",
    "kalorier vægttab",
    "vægttab plan",
    "kalorieberegner vægttab",
    "sundt vægttab",
    "kg pr uge",
  ],
  openGraph: {
    title: "Vægttab Beregner - Beregn dit kalorieunderskud",
    description: "Beregn dagligt kaloriemål for vægttab baseret på din vægt, højde og aktivitetsniveau.",
    url: `${baseUrl}/vaegttab`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/vaegttab`,
  },
};

const faqItems = [
  {
    question: "Hvor hurtigt kan man tabe sig sundt?",
    answer: "Et sundt vægttab er 0,5-1 kg pr. uge. Det svarer til et kalorieunderskud på ca. 500-1.000 kcal pr. dag. Langsommere vægttab er nemmere at fastholde og reducerer risikoen for muskeltab.",
  },
  {
    question: "Hvad er kalorieunderskud?",
    answer: "Kalorieunderskud betyder, at du spiser færre kalorier, end din krop forbrænder. Dit daglige energiforbrug (TDEE) minus dit kalorieindtag giver dit underskud. 7.700 kcal underskud svarer til ca. 1 kg vægttab.",
  },
  {
    question: "Hvor mange kalorier skal jeg mindst spise?",
    answer: "Mænd bør ikke gå under 1.500 kcal/dag og kvinder ikke under 1.200 kcal/dag uden lægelig vejledning. For lavt kalorieindtag kan føre til næringsmangel, muskeltab og nedsat stofskifte.",
  },
  {
    question: "Hvorfor taber jeg mig ikke selvom jeg er i underskud?",
    answer: "Vægten kan svinge 1-2 kg dag-til-dag pga. væskebalance, salt, kost og hormoner. Mål din vægt på samme tidspunkt og brug et ugentligt gennemsnit. Plateu kan også skyldes tilpasning — prøv at justere aktivitetsniveauet.",
  },
  {
    question: "Er det bedst at spise mindre eller motionere mere?",
    answer: "En kombination er mest effektiv. Kost er vigtigst for selve vægttabet, mens motion bevarer muskelmasse, forbedrer sundhed og øger dit energiforbrug. Styrketræning er særligt gavnligt under vægttab.",
  },
];

const relatedCalculators = [
  { title: "Kalorieberegner", description: "Beregn dagligt kaloriebehov", href: "/kalorier", icon: "🍎" },
  { title: "BMI Beregner", description: "Beregn dit BMI", href: "/bmi", icon: "⚖️" },
  { title: "Tidsberegner", description: "Beregn tid mellem datoer", href: "/tidsberegner", icon: "⏱️" },
  { title: "Procentberegner", description: "Beregn procenter", href: "/procent", icon: "📊" },
];

export default function VaegttabPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Vægttab Beregner"
          description="Beregn dit daglige kaloriemål for vægttab baseret på din vægt, højde, alder og aktivitetsniveau."
          url={`${baseUrl}/vaegttab`}
          category="HealthApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Sundhed", href: "/kategori/sundhed" }, { name: "Vægttab Beregner", href: "/vaegttab" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Vægttab Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn dit daglige kaloriemål for at nå din målvægt. Se kalorieunderskud, vægttab pr. uge og få advarsel ved for hurtigt tempo.
        </p>

        <VaegttabBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan taber du dig sundt</h2>
          <p>
            Vægttab handler grundlæggende om at spise færre kalorier, end din krop forbrænder. Men tempoet er afgørende — for hurtigt vægttab fører ofte til muskeltab, nedsat stofskifte og jo-jo-effekt.
          </p>

          <h2>Den gyldne regel: 0,5-1 kg pr. uge</h2>
          <p>
            Sundhedsstyrelsen og de fleste ernæringseksperter anbefaler et vægttab på <strong>0,5-1 kg pr. uge</strong>. Det svarer til et dagligt kalorieunderskud på 500-1.000 kcal og er et tempo, de fleste kan fastholde.
          </p>

          <h2>Beregningen bag</h2>
          <p>
            Beregneren bruger <strong>Mifflin-St Jeor formlen</strong> til at beregne dit basalstofskifte (BMR), som ganges med en aktivitetsfaktor for at finde dit daglige energiforbrug (TDEE). Dit kaloriemål er TDEE minus det nødvendige underskud.
          </p>

          <h2>Tips til vægttab</h2>
          <ul>
            <li><strong>Spis proteinrigt:</strong> Protein mætter og bevarer muskelmasse under vægttab</li>
            <li><strong>Styrketræn:</strong> Bevar og opbyg muskler, som holder dit stofskifte oppe</li>
            <li><strong>Sov nok:</strong> Søvnmangel øger sult og gør vægttab sværere</li>
            <li><strong>Vej dig ugentligt:</strong> Brug gennemsnittet, ikke daglige svingninger</li>
            <li><strong>Vær tålmodig:</strong> Varige resultater kræver varige ændringer</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/vaegttab" adSlotId="vaegttab-sidebar" />
    </div>
  );
}
