import type { Metadata } from "next";
import TimeprisBeregner from "@/components/TimeprisBeregner";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Timeprisberegner for freelancere | MinBeregner.dk",
  description:
    "Gratis timeprisberegner for freelancere og selvstændige. Beregn din timepris ud fra ønsket løn, eller se hvad du tjener med din nuværende timepris.",
  keywords: [
    "timeprisberegner",
    "freelance timepris",
    "beregn timepris",
    "konsulent timepris",
    "selvstændig timepris",
    "hvad skal jeg tage i timen",
    "timepris kalkulator",
    "freelancer løn",
  ],
  openGraph: {
    title: "Timeprisberegner - Find din freelance timepris",
    description: "Beregn den rigtige timepris som freelancer eller selvstændig. Gratis beregner.",
    url: `${baseUrl}/timepris`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/timepris`,
  },
};

const faqItems = [
  {
    question: "Hvordan beregner jeg min timepris som freelancer?",
    answer:
      "Start med din ønskede nettoløn, tillæg skat (ca. 45%), driftsomkostninger, ferie, sygdom og administrativ tid. Divider med dine fakturerbare timer. Vores beregner hjælper dig med dette.",
  },
  {
    question: "Hvad er en normal timepris for en konsulent?",
    answer:
      "Timepriser varierer meget efter branche og erfaring. IT-konsulenter tager typisk 800-1.500 kr/time, mens håndværkere ligger på 400-600 kr/time. Specialister kan tage betydeligt mere.",
  },
  {
    question: "Skal jeg lægge moms på min timepris?",
    answer:
      "Ja, hvis du er momsregistreret (omsætning over 50.000 kr/år), skal du lægge 25% moms oven i din timepris. Prisen du kommunikerer bør være ekskl. moms ved B2B-salg.",
  },
  {
    question: "Hvor mange timer kan jeg fakturere om måneden?",
    answer:
      "Realistisk set kan de fleste freelancere fakturere 100-130 timer/måned. Resten går til salg, administration, uddannelse og perioder uden opgaver. Start konservativt i dine beregninger.",
  },
  {
    question: "Hvorfor er min timepris højere end en fastansat?",
    answer:
      "Som freelancer har du ingen betalt ferie, pension, forsikringer eller garanteret arbejde. Du betaler selv for udstyr og software. Din timepris skal dække alle disse omkostninger.",
  },
  {
    question: "Kan jeg hæve min timepris over tid?",
    answer:
      "Ja, det er normalt at hæve timeprisen årligt (fx 3-5%) eller når du får mere erfaring. Det er lettere at starte med en fair pris end at hæve den drastisk senere.",
  },
];

const relatedCalculators = [
  {
    title: "Løn efter skat",
    href: "/loen-efter-skat",
    description: "Beregn din nettoløn",
    icon: "💰",
  },
  {
    title: "Momsberegner",
    href: "/moms",
    description: "Beregn moms på din timepris",
    icon: "🧾",
  },
  {
    title: "Feriepenge",
    href: "/feriepenge",
    description: "Beregn dine feriepenge",
    icon: "🏖️",
  },
];

export default function TimeprisPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <FAQSchema items={faqItems} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Timeprisberegner for Freelancere
        </h1>
        <p className="text-lg text-gray-600">
          Find den rigtige timepris som freelancer eller selvstændig. Beregn ud fra din ønskede løn, 
          eller se hvad du reelt tjener med din nuværende timepris.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <TimeprisBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Sådan finder du den rigtige timepris</h2>
        <p>
          At fastsætte sin timepris er en af de vigtigste beslutninger som freelancer. 
          Sætter du den for lavt, ender du med at arbejde for meget for for lidt. 
          Sætter du den for højt, risikerer du at miste kunder.
        </p>
        
        <h3>Faktorer der påvirker din timepris</h3>
        <ul>
          <li><strong>Erfaring og kompetencer</strong> - Jo mere specialist du er, jo højere pris</li>
          <li><strong>Branche</strong> - Nogle brancher har højere markedspriser</li>
          <li><strong>Geografi</strong> - København har typisk højere priser end provinsen</li>
          <li><strong>Kunde-type</strong> - Store virksomheder betaler ofte mere</li>
          <li><strong>Projekttype</strong> - Hasteopgaver og specialprojekter kan tage mere</li>
        </ul>

        <h3>Skjulte omkostninger som freelancer</h3>
        <p>
          Mange nye freelancere undervurderer deres omkostninger:
        </p>
        <ul>
          <li>Ingen betalt ferie (5-6 uger = 10-12% af din tid)</li>
          <li>Ingen pension fra arbejdsgiver</li>
          <li>Ingen løn under sygdom</li>
          <li>Software, udstyr og kontorudgifter</li>
          <li>Erhvervsforsikringer</li>
          <li>Bogføring og revisor</li>
          <li>Tid til salg, netværk og administration</li>
        </ul>

        <h3>Timepris vs. fastpris</h3>
        <p>
          Overvej også at tilbyde fastpriser på projekter. Det kan give dig bedre indtjening 
          når du bliver mere effektiv, og kunder foretrækker ofte at kende den samlede pris på forhånd.
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
