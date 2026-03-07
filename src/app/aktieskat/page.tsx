import type { Metadata } from "next";
import AktieskatBeregner from "@/components/AktieskatBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Aktieskat Beregner 2026 - Beregn skat på aktier | MinBeregner.dk",
  description:
    "Beregn aktieskat 2026: 27% under 61.000 kr., 42% over. Sammenlign frit depot vs. aktiesparekonto (ASK, 17%). Se din skat og besparelse gratis.",
  keywords: [
    "aktieskat beregner",
    "skat på aktier",
    "aktieindkomst skat",
    "aktiesparekonto",
    "ASK skat",
    "27 procent aktieskat",
    "42 procent aktieskat",
    "progressionsgrænse aktier",
    "lagerbeskatning",
    "realisationsbeskatning",
  ],
  openGraph: {
    title: "Aktieskat Beregner 2026 - Frit depot vs. ASK",
    description: "Beregn din aktieskat gratis. Sammenlign frit depot (27/42%) med aktiesparekonto (17%).",
    url: `${baseUrl}/aktieskat`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/aktieskat`,
  },
};

const faqItems = [
  {
    question: "Hvor meget skat betaler jeg af aktiegevinst i 2026?",
    answer: "I 2026 beskattes aktieindkomst i frit depot med 27% af de første 61.000 kr. (122.000 kr. for ægtepar) og 42% af beløb derover. I en aktiesparekonto (ASK) er satsen kun 17%.",
  },
  {
    question: "Hvad er forskellen på frit depot og aktiesparekonto?",
    answer: "I frit depot beskattes du ved realisationsbeskatning (27/42% når du sælger). I en aktiesparekonto (ASK) beskattes du med 17% lagerbeskatning (skat af urealiserede gevinster årligt). ASK har max indskud på 135.300 kr. i 2026.",
  },
  {
    question: "Hvad er progressionsgrænsen for aktieskat i 2026?",
    answer: "Progressionsgrænsen er 61.000 kr. i 2026. Aktieindkomst under denne grænse beskattes med 27%, og beløb over grænsen beskattes med 42%. For ægtepar er grænsen 122.000 kr. samlet.",
  },
  {
    question: "Kan jeg modregne tab i aktiegevinster?",
    answer: "Ja, tab på aktier kan modregnes i gevinster. Har du et nettotab, kan det fremføres til modregning i fremtidige aktiegevinster. Tab i frit depot kan kun modregnes i gevinster fra frit depot.",
  },
  {
    question: "Hvad er lagerbeskatning?",
    answer: "Lagerbeskatning betyder at du betaler skat af årets urealiserede gevinst — altså stigningen i værdi, selv om du ikke har solgt. Aktiesparekontoen bruger lagerbeskatning med en sats på 17%.",
  },
  {
    question: "Hvornår skal jeg betale aktieskat?",
    answer: "For frit depot betaler du skat i det år du sælger aktierne (realisationsbeskatning). For ASK betaler du skat årligt af årets værdistigning (lagerbeskatning). Skatten indberettes automatisk af din bank.",
  },
];

const relatedCalculators = [
  { title: "Opsparingsberegner", description: "Beregn renters rente på din opsparing", href: "/opsparing", icon: "📈" },
  { title: "Rentefradrag", description: "Beregn din skattebesparelse på renter", href: "/rentefradrag", icon: "🏦" },
  { title: "Løn efter skat", description: "Se hvad du får udbetalt", href: "/loen-efter-skat", icon: "💰" },
  { title: "Pensionsberegner", description: "Beregn din fremtidige pension", href: "/pension", icon: "🧓" },
];

export default function AktieskatPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Aktieskat Beregner 2026"
          description="Beregn skat på aktieindkomst i 2026. Sammenlign frit depot (27/42%) med aktiesparekonto (17%)."
          url={`${baseUrl}/aktieskat`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Aktieskat Beregner", href: "/aktieskat" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Aktieskat Beregner 2026</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn hvor meget du skal betale i skat af dine aktiegevinster. Sammenlign beskatning i frit depot (27/42%) med aktiesparekonto (17%).
        </p>

        <AktieskatBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Aktieskat i Danmark 2026</h2>
          <p>
            Når du sælger aktier med gevinst i Danmark, skal du betale skat af gevinsten. Skatten afhænger af om du investerer via et <strong>frit depot</strong> eller en <strong>aktiesparekonto (ASK)</strong>.
          </p>

          <h2>Frit depot — realisationsbeskatning</h2>
          <p>
            I et <strong>frit depot</strong> beskattes du kun når du <strong>realiserer en gevinst</strong> (sælger aktier med overskud). Skattesatsen i 2026 er:
          </p>
          <ul>
            <li><strong>27%</strong> af de første 61.000 kr. i aktieindkomst</li>
            <li><strong>42%</strong> af aktieindkomst over 61.000 kr.</li>
          </ul>
          <p>
            For <strong>ægtepar</strong> er progressionsgrænsen det dobbelte: <strong>122.000 kr.</strong> samlet. Uudnyttet progressionsgrænse kan <strong>overføres mellem ægtefæller</strong>.
          </p>

          <h2>Aktiesparekonto (ASK) — lagerbeskatning</h2>
          <p>
            En <strong>aktiesparekonto</strong> beskattes med kun <strong>17%</strong>, men der er <strong>lagerbeskatning</strong>. Det betyder at du betaler skat af årets værdistigning — også selvom du ikke har solgt. Til gengæld er satsen markant lavere.
          </p>
          <p>
            I 2026 er det maksimale indskud på en ASK <strong>135.300 kr.</strong> Gevinster ud over indskuddet kan forblive på kontoen, men du kan ikke indsætte mere end loftet.
          </p>

          <h2>Hvornår er ASK bedst?</h2>
          <p>
            ASK er typisk en fordel når:
          </p>
          <ul>
            <li>Du investerer langsigtet og forventer gevinst</li>
            <li>Din aktieindkomst overstiger progressionsgrænsen (61.000 kr.)</li>
            <li>Du kan leve med lagerbeskatning (skat årligt, ikke kun ved salg)</li>
          </ul>
          <p>
            For store porteføljer kan forskellen mellem <strong>42% skat</strong> (frit depot over grænsen) og <strong>17%</strong> (ASK) betyde <strong>tusindvis af kroner i besparelse</strong> årligt.
          </p>

          <h2>Tabsmodregning</h2>
          <p>
            <strong>Tab på aktier</strong> kan modregnes i gevinster inden for samme depot-type. Har du et <strong>nettotab</strong> i et år, kan det <strong>fremføres til modregning</strong> i fremtidige gevinster. Vær opmærksom på at tab i frit depot <strong>ikke kan modregnes</strong> i ASK-gevinster og omvendt.
          </p>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/aktieskat" adSlotId="aktieskat-sidebar" />
    </div>
  );
}
