import type { Metadata } from "next";
import SygedagpengeBeregner from "@/components/SygedagpengeBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Sygedagpenge Beregner - Beregn din sats 2026 | MinBeregner.dk",
  description:
    "Beregn dine sygedagpenge for 2026. Se din ugentlige sats, arbejdsgiverperiode, kommunal udbetaling og løntab ved sygdom.",
  keywords: [
    "sygedagpenge beregner",
    "sygedagpenge 2026",
    "sygedagpenge sats",
    "sygdom løn",
    "sygemelding",
    "arbejdsgiverperiode",
    "mulighedserklæring",
    "sygedagpenge selvstændig",
  ],
  openGraph: {
    title: "Sygedagpenge Beregner - Beregn din sats 2026",
    description: "Beregn sygedagpenge, se arbejdsgiverperiode og løntab ved sygdom.",
    url: `${baseUrl}/sygedagpenge`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/sygedagpenge`,
  },
};

const faqItems = [
  {
    question: "Hvad er sygedagpenge?",
    answer: "Sygedagpenge er en ydelse, der erstatter din løn, når du er syg og ikke kan arbejde. Lønmodtagere, selvstændige og ledige kan modtage sygedagpenge, hvis de opfylder beskæftigelseskravet.",
  },
  {
    question: "Hvor meget får jeg i sygedagpenge?",
    answer: "Sygedagpenge beregnes som 90% af din timeløn gange dit ugentlige timetal, dog højst 4.750 kr. pr. uge i 2026. Mange arbejdsgivere supplerer op til fuld løn ifølge overenskomst.",
  },
  {
    question: "Hvad er arbejdsgiverperioden?",
    answer: "Arbejdsgiverperioden er de første 30 kalenderdage af sygefraværet, hvor din arbejdsgiver betaler sygedagpengene. Herefter overtager kommunen udbetalingen.",
  },
  {
    question: "Hvad er en mulighedserklæring?",
    answer: "En mulighedserklæring er et dokument, som din arbejdsgiver kan bede om fra dag 1 af dit sygefravær. Den beskriver dine muligheder for at arbejde helt eller delvist under sygdommen og udfyldes af dig, din arbejdsgiver og din læge.",
  },
  {
    question: "Hvor længe kan jeg få sygedagpenge?",
    answer: "Kommunen revurderer din sag efter 22 uger inden for de seneste 9 måneder. Sygedagpengene kan forlænges, f.eks. hvis du afventer behandling, er under revalidering, eller der afventes afklaring til fleksjob eller førtidspension.",
  },
  {
    question: "Kan selvstændige få sygedagpenge?",
    answer: "Ja, selvstændige kan få sygedagpenge efter 2 ugers sygdom (med mindre de har tegnet en sygedagpengeforsikring, der giver ret fra 1. eller 3. fraværsdag). Satsen beregnes ud fra den seneste årsopgørelse.",
  },
];

const relatedCalculators = [
  { title: "Dagpenge", description: "Beregn dagpengesats", href: "/dagpenge", icon: "💼" },
  { title: "Løn efter skat", description: "Beregn nettoløn", href: "/loen-efter-skat", icon: "💰" },
  { title: "Barselsdagpenge", description: "Beregn barselsdagpenge", href: "/barselsdagpenge", icon: "👶" },
  { title: "Feriepenge", description: "Beregn feriepenge", href: "/feriepenge", icon: "🌴" },
];

export default function SygedagpengePage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Sygedagpenge Beregner"
          description="Beregn dine sygedagpenge for 2026. Se ugentlig sats, arbejdsgiverperiode og løntab."
          url={`${baseUrl}/sygedagpenge`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Sygedagpenge Beregner", href: "/sygedagpenge" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Sygedagpenge Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn dine sygedagpenge for 2026. Se din ugentlige og månedlige sats, periodefordeling mellem arbejdsgiver og kommune, og dit samlede løntab.
        </p>

        <SygedagpengeBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan fungerer sygedagpenge</h2>
          <p>
            Når du bliver syg og ikke kan arbejde, har du ret til <strong>sygedagpenge</strong>. De første <strong>30 kalenderdage</strong> betaler din arbejdsgiver (<strong>arbejdsgiverperioden</strong>). Herefter overtager <strong>kommunen</strong> udbetalingen via <strong>Udbetaling Danmark</strong>.
          </p>

          <h2>Hvem har ret til sygedagpenge?</h2>
          <ul>
            <li><strong>Lønmodtagere:</strong> Du skal have været ansat i mindst 8 uger og arbejdet mindst 74 timer hos samme arbejdsgiver</li>
            <li><strong>Selvstændige:</strong> Du skal have drevet selvstændig virksomhed i mindst 6 måneder (heraf 1 måned lige før sygdommen)</li>
            <li><strong>Ledige:</strong> Du skal være dagpengeberettiget medlem af en a-kasse</li>
          </ul>

          <h2>Arbejdsgiverens pligter</h2>
          <p>
            Din arbejdsgiver skal anmelde dit fravær til kommunen senest <strong>5 uger</strong> efter din første sygedag. Arbejdsgiveren kan fra <strong>dag 1</strong> anmode om en <strong>mulighedserklæring</strong>, der beskriver, hvad du evt. kan arbejde med under din sygdom.
          </p>

          <h2>Revurdering efter 22 uger</h2>
          <p>
            Kommunen skal senest ved <strong>uge 22</strong> tage stilling til, om dine sygedagpenge kan <strong>forlænges</strong>. Forlængelse sker typisk ved afventning af <strong>behandling</strong>, <strong>revalidering</strong>, afklaring til <strong>fleksjob</strong> eller <strong>ressourceforløb</strong>.
          </p>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/sygedagpenge" adSlotId="sygedagpenge-sidebar" />
    </div>
  );
}
