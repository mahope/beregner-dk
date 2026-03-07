import type { Metadata } from "next";
import dynamic from "next/dynamic";
const SkattefradragBeregner = dynamic(() => import("@/components/SkattefradragBeregner"));
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Skattefradrag Beregner - Beregn alle fradrag 2026 | MinBeregner.dk",
  description:
    "Beregn din samlede skattebesparelse fra kørselsfradrag, rentefradrag, håndværkerfradrag, fagforening og a-kasse. Se 2026-satser og grænser.",
  keywords: [
    "skattefradrag beregner",
    "fradrag 2026",
    "kørselsfradrag",
    "rentefradrag",
    "håndværkerfradrag",
    "fagforening fradrag",
    "a-kasse fradrag",
    "skattebesparelse",
    "boligjobordning",
  ],
  openGraph: {
    title: "Skattefradrag Beregner - Beregn alle fradrag 2026",
    description: "Beregn din samlede skattebesparelse fra kørsel, renter, håndværker, fagforening og a-kasse.",
    url: `${baseUrl}/skattefradrag`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/skattefradrag`,
  },
};

const faqItems = [
  {
    question: "Hvad er kørselsfradrag?",
    answer: "Kørselsfradrag (befordringsfradrag) er et fradrag for transport mellem hjem og arbejde. Du kan få fradrag for kørsel over 24 km dagligt (12 km hver vej), uanset om du kører bil, cykel eller bruger offentlig transport. Satsen er 2,23 kr./km for 25-120 km og 1,12 kr./km derover.",
  },
  {
    question: "Hvad er rentefradrag?",
    answer: "Rentefradrag er et fradrag for renteudgifter på lån — fx boliglån, billån og SU-lån. Fradragsværdien er ca. 25,6% af renteudgifterne. Det betyder, at du sparer ca. 256 kr. i skat for hver 1.000 kr. du betaler i renter.",
  },
  {
    question: "Hvad dækker håndværkerfradraget?",
    answer: "Boligjobordningen (håndværkerfradraget) dækker arbejdsløn til håndværkerydelser (maling, VVS, el mv.) op til 12.400 kr. og serviceydelser (rengøring, havearbejde mv.) op til 6.200 kr. pr. person i 2026. Kun arbejdsløn — ikke materialer — kan fradrages.",
  },
  {
    question: "Kan jeg trække fagforening fra i skat?",
    answer: "Ja, du kan trække kontingent til fagforening fra op til 7.000 kr. årligt i 2026. A-kasse-kontingent kan trækkes fuldt fra uden loft. Begge fradrages som ligningsmæssige fradrag.",
  },
  {
    question: "Hvornår skal jeg indberette fradrag?",
    answer: "De fleste fradrag indberettes automatisk af din arbejdsgiver, bank eller fagforening. Kørselsfradrag og håndværkerfradrag skal du selv indberette via skat.dk. Fristen er typisk 1. maj for årsopgørelsen.",
  },
];

const relatedCalculators = [
  { title: "Løn efter skat", description: "Beregn nettoløn", href: "/loen-efter-skat", icon: "💰" },
  { title: "Rentefradrag", description: "Beregn rentefradrag", href: "/rentefradrag", icon: "📊" },
  { title: "Topskat", description: "Beregn topskat", href: "/topskat", icon: "📈" },
  { title: "Moms", description: "Beregn moms", href: "/moms", icon: "🧮" },
];

export default function SkattefradragPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Skattefradrag Beregner"
          description="Beregn din samlede skattebesparelse fra alle fradrag: kørsel, renter, håndværker, fagforening og a-kasse."
          url={`${baseUrl}/skattefradrag`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Skattefradrag Beregner", href: "/skattefradrag" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Skattefradrag Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn din samlede skattebesparelse for 2026. Indtast dine fradrag for kørsel, renter, håndværker, fagforening og a-kasse og se hvad du sparer.
        </p>

        <SkattefradragBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Oversigt over danske skattefradrag 2026</h2>
          <p>
            Der er mange fradrag, du kan bruge til at reducere din skat. De vigtigste er kørselsfradrag, rentefradrag, håndværkerfradrag og fradrag for fagforening og a-kasse.
          </p>

          <h2>Kørselsfradrag (befordringsfradrag)</h2>
          <p>
            Du kan få fradrag for transport mellem hjem og arbejde, uanset om du kører bil, tager bus eller cykler. Fradraget gælder for den del af afstanden, der overstiger 24 km dagligt (12 km hver vej). Satsen er 2,23 kr./km for 25-120 km og 1,12 kr./km over 120 km.
          </p>

          <h2>Boligjobordningen (håndværkerfradrag)</h2>
          <p>
            Du kan trække <strong>arbejdsløn</strong> til håndværkerydelser fra i skat — op til 12.400 kr. pr. person i 2026. Serviceydelser som rengøring og havearbejde har et særskilt loft på 6.200 kr. Materialekøb kan ikke fradrages.
          </p>

          <h2>Tips til fradrag</h2>
          <ul>
            <li><strong>Tjek din forskudsopgørelse:</strong> Sørg for at alle fradrag er registreret korrekt</li>
            <li><strong>Gem kvitteringer:</strong> Særligt for håndværkerydelser og donationer</li>
            <li><strong>Betal elektronisk:</strong> Håndværkerfradrag kræver elektronisk betaling</li>
            <li><strong>Tjek automatiske fradrag:</strong> Renter og fagforening indberettes normalt automatisk</li>
            <li><strong>Husk kørselsfradrag:</strong> Det er det mest oversete fradrag — mange glemmer det</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/skattefradrag" adSlotId="skattefradrag-sidebar" />
    </div>
  );
}
