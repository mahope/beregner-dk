import type { Metadata } from "next";
import TidszoneBeregner from "@/components/TidszoneBeregner";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Tidszoneberegner - Omregn tid mellem lande | MinBeregner.dk",
  description:
    "Gratis tidszoneberegner. Se hvad klokken er i andre lande og omregn tidspunkter mellem tidszoner. New York, Tokyo, Sydney og mange flere.",
  keywords: [
    "tidszoneberegner",
    "tidszone omregner",
    "hvad er klokken i",
    "tidsforskel",
    "konverter tid",
    "world clock",
    "mødetid international",
  ],
  openGraph: {
    title: "Tidszoneberegner - Hvad er klokken?",
    description: "Se hvad klokken er i andre lande og omregn mellem tidszoner.",
    url: `${baseUrl}/tidszone`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/tidszone`,
  },
};

const faqItems = [
  {
    question: "Hvad er tidsforskellen mellem Danmark og USA?",
    answer:
      "Det afhænger af hvilken del af USA. New York (østkyst) er typisk 6 timer bagud, mens Los Angeles (vestkyst) er 9 timer bagud. Dette kan variere under sommertid.",
  },
  {
    question: "Hvornår har Danmark sommertid?",
    answer:
      "Danmark skifter til sommertid (CEST, UTC+2) den sidste søndag i marts kl. 02:00. Vi skifter tilbage til normaltid (CET, UTC+1) den sidste søndag i oktober kl. 03:00.",
  },
  {
    question: "Hvad er UTC?",
    answer:
      "UTC (Coordinated Universal Time) er den internationale tidsstandard. Alle tidszoner defineres som et offset fra UTC. Danmark er UTC+1 (vinter) eller UTC+2 (sommer).",
  },
  {
    question: "Hvordan planlægger jeg internationale møder?",
    answer:
      "Find et tidspunkt der passer i alle tidszoner. Brug denne beregner til at se, hvad klokken vil være for alle deltagere. Undgå møder uden for normal arbejdstid (9-17).",
  },
  {
    question: "Hvorfor har nogle lande halve timer i tidszonen?",
    answer:
      "Nogle lande som Indien (UTC+5:30) og Nepal (UTC+5:45) har valgt tidszoner der ikke er hele timer fra UTC for at matche solen bedre geografisk.",
  },
  {
    question: "Hvad er jetlag og hvordan undgår jeg det?",
    answer:
      "Jetlag opstår når din biologiske ur er ude af sync med lokal tid. Tilpas dig gradvist ved at justere søvn før rejsen, drik vand, undgå alkohol, og kom ud i sollys på destinationen.",
  },
];

const relatedCalculators = [
  {
    title: "Aldersberegner",
    href: "/alder",
    description: "Beregn din præcise alder",
    icon: "🎂",
  },
  {
    title: "Procentberegner",
    href: "/procent",
    description: "Beregn procenter",
    icon: "➗",
  },
  {
    title: "Valutaberegner",
    href: "/valuta",
    description: "Omregn valutaer",
    icon: "💱",
  },
];

export default function TidszonePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <FAQSchema items={faqItems} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Tidszoneberegner
        </h1>
        <p className="text-lg text-gray-600">
          Se hvad klokken er i andre lande og omregn tidspunkter mellem tidszoner. 
          Perfekt til internationale møder, rejser og opkald til familie i udlandet.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <TidszoneBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Om tidszoner</h2>
        <p>
          Verden er opdelt i 24 tidszoner, der hver svarer til 15 graders længde på jordkloden. 
          Tidszoner gør det muligt at have en praktisk lokal tid, der nogenlunde følger solens gang.
        </p>
        
        <h3>Danmarks tidszone</h3>
        <p>
          Danmark bruger Central European Time (CET), som er UTC+1. Om sommeren bruger vi 
          Central European Summer Time (CEST), som er UTC+2. Sommertid blev indført for 
          at spare energi ved at udnytte dagslyset bedre.
        </p>

        <h3>Populære tidsforskelle fra Danmark</h3>
        <ul>
          <li><strong>London:</strong> 1 time bagud</li>
          <li><strong>New York:</strong> 6 timer bagud</li>
          <li><strong>Los Angeles:</strong> 9 timer bagud</li>
          <li><strong>Tokyo:</strong> 8 timer foran</li>
          <li><strong>Sydney:</strong> 9-10 timer foran</li>
        </ul>

        <h3>Tips til internationale møder</h3>
        <ul>
          <li>Brug et mødetidspunkt der er acceptabelt for alle tidszoner</li>
          <li>Angiv altid tidszonen tydeligt (fx "14:00 CET")</li>
          <li>Overvej at rotere mødetider så byrden deles</li>
          <li>Brug kalenderinvitation med automatisk tidszone-konvertering</li>
        </ul>
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
