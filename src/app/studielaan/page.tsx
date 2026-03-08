import { generatePageMetadata } from "@/lib/page-helpers";
import StudielaanBeregner from "@/components/StudielaanBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("studielaan");
}

const faqItems = [
  {
    question: "Hvornår skal jeg begynde at betale SU-lån tilbage?",
    answer: "Tilbagebetalingen starter 1 år efter, at du afslutter eller afbryder din uddannelse. Du modtager en tilbagebetalingsplan fra Udbetaling Danmark ca. 6 måneder før tilbagebetaling starter.",
  },
  {
    question: "Hvad er renten på SU-lån?",
    answer: "Renten på SU-lån er variabel og fastsættes årligt. Under uddannelsen er renten typisk lavere (diskontoen + 1%). Efter uddannelsen stiger renten (diskontoen + tillæg). Se aktuelle satser på su.dk.",
  },
  {
    question: "Kan jeg betale SU-lån hurtigere tilbage?",
    answer: "Ja, du kan til enhver tid betale ekstra af på dit SU-lån uden gebyr. Ekstra afdrag reducerer din restgæld og dermed din samlede renteomkostning. Selv små ekstra beløb gør en forskel.",
  },
  {
    question: "Hvad sker der, hvis jeg ikke kan betale?",
    answer: "Kontakt Udbetaling Danmark hurtigst muligt. Du kan søge om nedsat ydelse eller midlertidigt betalingsstop, hvis du har lav indkomst. Ignorer ikke problemet — gælden vokser med renter.",
  },
  {
    question: "Hvor lang tid har jeg til at betale SU-lån?",
    answer: "Standard løbetiden er 7 år, men den kan forlænges til op til 15 år, hvis du har behov for lavere månedlige ydelser. Husk at en længere løbetid betyder flere renteomkostninger.",
  },
];

const relatedCalculators = [
  { title: "SU Beregner", description: "Beregn din SU-sats", href: "/su", icon: "🎓" },
  { title: "Løn efter skat", description: "Beregn nettoløn", href: "/loen-efter-skat", icon: "💰" },
  { title: "Gældsfri Beregner", description: "Beregn gældsafvikling", href: "/gaeldsfri", icon: "🎯" },
  { title: "Opsparingsberegner", description: "Beregn renters rente", href: "/opsparing", icon: "📈" },
];

export default function StudielaanPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Studielån Beregner"
          description="Beregn månedlig ydelse og tilbagebetalingstid for SU-lån."
          url={`${baseUrl}/studielaan`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Uddannelse", href: "/kategori/uddannelse" }, { name: "Studielån Beregner", href: "/studielaan" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Studielån Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn din månedlige ydelse på SU-lån, se den samlede tilbagebetaling og effekten af ekstra afdrag. Få overblik over din afdragsplan.
        </p>

        <StudielaanBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Tilbagebetaling af SU-lån</h2>
          <p>
            SU-lån er et af de <strong>billigste lån</strong>, du kan have. Tilbagebetalingen starter <strong>1 år efter endt uddannelse</strong>, og du har typisk 7 år til at betale lånet ud — med mulighed for forlængelse til 15 år.
          </p>

          <h2>Fordele ved ekstra afdrag</h2>
          <p>
            Selvom renten på SU-lån er lav, kan <strong>ekstra afdrag</strong> stadig spare dig penge. Jo hurtigere du betaler ned, jo mindre <strong>rente</strong> betaler du samlet. Brug beregneren til at se den præcise effekt.
          </p>

          <h2>Tips til studielån</h2>
          <ul>
            <li><strong>Betal mindst minimumsydelsen:</strong> Undgå rykkere og ekstra gebyrer</li>
            <li><strong>Overvej ekstra afdrag:</strong> Selv 500 kr./md. ekstra gør en forskel</li>
            <li><strong>Prioriter dyr gæld først:</strong> Har du forbrugslån, betal dem først — de har højere rente</li>
            <li><strong>Brug rentefradraget:</strong> Renter på SU-lån er fradragsberettigede (ca. 25% fradragsværdi)</li>
            <li><strong>Søg nedsat ydelse:</strong> Ved lav indkomst kan du få reduceret din ydelse</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/studielaan" adSlotId="studielaan-sidebar" />
    </div>
  );
}
