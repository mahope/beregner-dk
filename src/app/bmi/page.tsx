import dynamic from "next/dynamic";
const BMIBeregner = dynamic(() => import("@/components/BMIBeregner"));
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { InlineAd } from "@/components/ads/AdBanner";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("bmi");
}

const faqItems = [
  {
    question: "Hvad er en normal BMI?",
    answer:
      "En normal BMI ligger mellem 18,5 og 24,9. Under 18,5 regnes som undervægt, 25-29,9 som overvægt, og over 30 som fedme. Husk at BMI ikke tager højde for muskelmasse.",
  },
  {
    question: "Er BMI pålidelig for alle?",
    answer:
      "BMI er et godt screeningsværktøj, men har begrænsninger. Meget muskuløse personer kan have høj BMI uden at være overvægtige. Ældre og gravide bør også tage resultaterne med forbehold.",
  },
  {
    question: "Hvordan beregnes BMI?",
    answer:
      "BMI beregnes ved at dividere din vægt i kg med din højde i meter i anden. Formlen er: BMI = vægt (kg) / højde² (m). En person på 75 kg og 175 cm har BMI = 75 / 1,75² = 24,5.",
  },
  {
    question: "Hvad er min idealvægt?",
    answer:
      "Din idealvægt er det vægtinterval hvor din BMI ligger mellem 18,5 og 24,9. For en person på 175 cm er idealvægten cirka 57-76 kg. Brug beregneren ovenfor for at se dit interval.",
  },
  {
    question: "Gælder BMI for børn?",
    answer:
      "Denne beregner er for voksne (18+). For børn og unge bruges alders- og kønsspecifikke BMI-percentiler, da kroppen ændrer sig under vækst. Tal med en læge om børns vægt.",
  },
  {
    question: "Hvad kan jeg gøre for at forbedre min BMI?",
    answer:
      "Ved overvægt: Fokuser på varige livsstilsændringer som mere bevægelse og sundere kost. Ved undervægt: Spis hyppige, næringsrige måltider og overvej styrketræning. Konsulter altid en læge ved bekymringer.",
  },
];

export default function BMIPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content - Left Column */}
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name="BMI Beregner"
        description="Gratis BMI beregner. Beregn dit Body Mass Index og se om din vægt er sund."
        url={`${baseUrl}/bmi`}
        category="HealthApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Sundhed", href: "/kategori/sundhed" }, { name: "BMI Beregner", href: "/bmi" }]} />

      <h1 className="text-3xl font-bold mb-2">BMI Beregner</h1>
      <p className="text-gray-600 mb-8">
        Beregn dit Body Mass Index (BMI) og se om din vægt er inden for det
        sunde område. BMI er et nyttigt værktøj til at vurdere din vægt i
        forhold til din højde.
      </p>

      <BMIBeregner />
      
      {/* Inline Ad - Between calculator and content */}
      <InlineAd slotId="bmi-after-calculator" />

      <div className="mt-12 prose max-w-none">
        <h2>Hvad er BMI?</h2>
        <p>
          BMI står for <strong>Body Mass Index</strong> og er et tal, der bruges
          til at vurdere, om din vægt er passende i forhold til din højde. BMI
          beregnes ved at dividere din <strong>vægt i kilogram</strong> med din <strong>højde i meter</strong> i
          anden potens.
        </p>
        <p>
          <strong>Formlen er:</strong> BMI = vægt (kg) / højde² (m)
        </p>

        <h2>BMI kategorier ifølge WHO</h2>
        <p>
          Verdenssundhedsorganisationen (WHO) har defineret følgende BMI
          kategorier for voksne:
        </p>
        <ul>
          <li>
            <strong>Under 18,5:</strong> Undervægt
          </li>
          <li>
            <strong>18,5 - 24,9:</strong> Normalvægt
          </li>
          <li>
            <strong>25,0 - 29,9:</strong> Overvægt
          </li>
          <li>
            <strong>30,0 - 34,9:</strong> Fedme klasse I
          </li>
          <li>
            <strong>35,0 - 39,9:</strong> Fedme klasse II
          </li>
          <li>
            <strong>40+:</strong> Fedme klasse III (svær fedme)
          </li>
        </ul>

        <h2>Er BMI en pålidelig måling?</h2>
        <p>BMI er et nyttigt screeningsværktøj, men det har begrænsninger:</p>
        <ul>
          <li>
            <strong>Muskelmasse:</strong> Meget muskuløse personer kan have højt
            BMI uden at være overvægtige
          </li>
          <li>
            <strong>Alder:</strong> Ældre voksne kan have lavere muskelmasse,
            hvilket påvirker BMI
          </li>
          <li>
            <strong>Fedtfordeling:</strong> BMI fortæller ikke hvor fedtet
            sidder (mavefedme er mere risikabelt)
          </li>
          <li>
            <strong>Køn:</strong> Kvinder har naturligt mere fedtvæv end mænd
          </li>
        </ul>

        <h2>Andre vigtige sundhedsmål</h2>
        <p>
          Ud over BMI kan disse målinger give et <strong>bedre billede af din sundhed</strong>:
        </p>
        <ul>
          <li>
            <strong>Taljemål:</strong> Under 94 cm for mænd, under 80 cm for
            kvinder
          </li>
          <li>
            <strong>Talje-hofte-ratio:</strong> Under 0,9 for mænd, under 0,85
            for kvinder
          </li>
          <li>
            <strong>Fedtprocent:</strong> Måles med specialudstyr
          </li>
          <li>
            <strong>Blodtryk og kolesterol:</strong> Vigtige for hjertesundhed
          </li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner er kun til informationsformål og erstatter ikke
            professionel medicinsk rådgivning. Konsulter altid en læge ved
            bekymringer om din vægt eller sundhed.
          </p>
        </div>
      </div>

      <InlineAd slotId="bmi-before-faq" />

      <FAQ items={faqItems} />

      <RelatedCalculators current="/bmi" />
      </div>

      {/* Sidebar - Right Column (Desktop only) */}
      <Sidebar currentHref="/bmi" adSlotId="bmi-sidebar" />
    </div>
  );
}
