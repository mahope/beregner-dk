import type { Metadata } from "next";
import TopskatBeregner from "@/components/TopskatBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Topskat Beregner 2026 - Betaler du topskat? | MinBeregner.dk",
  description:
    "Beregn om du betaler topskat i 2026. Ny skattemodel: mellemskat fra 641.200 kr., topskat fra 777.900 kr. Se din effektive og marginale skatteprocent gratis.",
  keywords: [
    "topskat beregner",
    "betaler jeg topskat",
    "topskat 2026",
    "topskattegrænse",
    "mellemskat 2026",
    "effektiv skat",
    "marginalskat",
    "skatteberegner",
  ],
  openGraph: {
    title: "Topskat Beregner 2026",
    description: "Beregn om du betaler mellemskat eller topskat med 2026-satser.",
    url: `${baseUrl}/topskat`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/topskat`,
  },
};

const faqItems = [
  {
    question: "Hvornår betaler man topskat i 2026?",
    answer: "I 2026 er den gamle topskat erstattet af tre trin. Du betaler mellemskat (7,5%) når din indkomst efter AM-bidrag overstiger 641.200 kr., og topskat (yderligere 7,5%) over 777.900 kr. Det svarer til en bruttoindkomst på ca. 697.000 kr./år (58.000 kr./md) for mellemskat og 845.500 kr./år (70.500 kr./md) for topskat.",
  },
  {
    question: "Hvad er forskellen på effektiv skat og marginalskat?",
    answer: "Effektiv skat er den gennemsnitlige skatteprocent du betaler af hele din indkomst. Marginalskat er skatten af den sidst tjente krone. Marginalskatten er altid højere end den effektive skat, fordi de første kroner beskattes lavere (pga. personfradrag og ingen mellemskat/topskat).",
  },
  {
    question: "Hvad er skatteloftet?",
    answer: "Skatteloftet sikrer at din samlede marginalskat (ekskl. AM-bidrag og kirkeskat) ikke overstiger ca. 52,07%. Med AM-bidrag (8%) og kirkeskat kan den reelle marginalskat dog være højere.",
  },
  {
    question: "Hvad er den nye top-topskat?",
    answer: "I 2026 er der indført en top-topskat på 5% for indkomster over 2.592.700 kr. (efter AM-bidrag). Den rammer kun de allerhøjeste indkomster og er et nyt tredje skattetrin.",
  },
  {
    question: "Kan jeg undgå topskat?",
    answer: "Du kan reducere din skattepligtige indkomst via fradrag (rentefradrag, befordringsfradrag, pensionsindbetalinger). Ekstra pensionsindbetalinger er en populær måde at komme under topskattegrænsen.",
  },
];

const relatedCalculators = [
  { title: "Løn efter skat", description: "Se hvad du får udbetalt", href: "/loen-efter-skat", icon: "💰" },
  { title: "Pensionsberegner", description: "Beregn din pension", href: "/pension", icon: "🧓" },
  { title: "Rentefradrag", description: "Beregn din skattebesparelse", href: "/rentefradrag", icon: "🏦" },
  { title: "Aktieskat", description: "Beregn skat på aktier", href: "/aktieskat", icon: "📈" },
];

export default function TopskatPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Topskat Beregner 2026"
          description="Beregn om du betaler mellemskat eller topskat med 2026-satser. Se effektiv og marginal skatteprocent."
          url={`${baseUrl}/topskat`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Topskat Beregner", href: "/topskat" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Topskat Beregner 2026</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn om du betaler mellemskat eller topskat med de nye 2026-skattetrin. Se din effektive skatteprocent, marginalskat og en detaljeret skatteberegning.
        </p>

        <TopskatBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Topskat i Danmark 2026 — ny skattemodel</h2>
          <p>
            I 2026 er det danske skattesystem ændret med en ny skattemodel. Den gamle topskat er erstattet af <strong>tre progressive skattetrin</strong>:
          </p>
          <ul>
            <li><strong>Mellemskat (7,5%):</strong> Betales af indkomst over 641.200 kr. (efter AM-bidrag)</li>
            <li><strong>Topskat (7,5%):</strong> Betales af indkomst over 777.900 kr. (efter AM-bidrag)</li>
            <li><strong>Top-topskat (5%):</strong> Betales af indkomst over 2.592.700 kr. (efter AM-bidrag)</li>
          </ul>

          <h2>Hvem betaler topskat?</h2>
          <p>
            Omregnet til bruttoindkomst (før AM-bidrag) betaler du mellemskat fra ca. <strong>697.000 kr./år</strong> (ca. 58.100 kr./md) og topskat fra ca. <strong>845.500 kr./år</strong> (ca. 70.500 kr./md).
          </p>
          <p>
            Ca. 10-15% af alle danske lønmodtagere betaler topskat. Det inkluderer typisk ledere, specialister, læger og andre med høj indkomst.
          </p>

          <h2>Effektiv skat vs. marginalskat</h2>
          <p>
            Din <strong>effektive skatteprocent</strong> er den gennemsnitlige skat du betaler af hele din indkomst. Den er altid lavere end marginalskatten, fordi de første kroner du tjener beskattes med en lavere sats (pga. personfradrag).
          </p>
          <p>
            Din <strong>marginalskat</strong> er skatten af den sidst tjente krone. Hvis du betaler topskat, er din marginalskat ca. 52-56% (inkl. AM-bidrag). Det betyder at af en lønforhøjelse på 1.000 kr. beholder du kun ca. 440-480 kr.
          </p>

          <h2>Sådan reducerer du din topskat</h2>
          <p>
            Den mest effektive måde at reducere topskat er via <strong>ekstra pensionsindbetalinger</strong>. Indbetalinger til ratepension eller livrente fratrækkes i den skattepligtige indkomst og kan bringe dig under topskattegrænsen. Du betaler først skat af pengene når du hæver dem som pensionist — typisk til en lavere sats.
          </p>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/topskat" adSlotId="topskat-sidebar" />
    </div>
  );
}
