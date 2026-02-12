import type { Metadata } from "next";
import TidsBeregner from "@/components/TidsBeregner";
import { RelatedCalculators } from "@/components/RelatedCalculators";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Tidsberegner - Beregn timer og minutter mellem tidspunkter",
  description:
    "Beregn tid hurtigt. Eksempel: 08:30 til 16:45 = 8 timer 15 min (8,25 decimal). Perfekt til arbejdstid, timeregistrering og møder. Gratis tidsberegner.",
  keywords: [
    "tidsberegner",
    "timer mellem tidspunkter",
    "arbejdstid beregner",
    "tid beregner",
    "timer og minutter",
    "timeregistrering",
  ],
  openGraph: {
    title: "Tidsberegner - Timer og minutter mellem tidspunkter",
    description: "Beregn tid mellem to tidspunkter. Gratis og let at bruge.",
    url: `${baseUrl}/tidsberegner`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/tidsberegner`,
  },
};

const faqItems = [
  {
    question: "Hvordan beregner jeg arbejdstid?",
    answer:
      "Indtast dit mødetidspunkt som starttid og fyraftenstid som sluttid. Husk at trække din frokostpause fra i pausefeltet.",
  },
  {
    question: "Hvad er decimal timer?",
    answer:
      "Decimal timer viser tiden som et tal med decimaler i stedet for timer:minutter. 1,5 timer = 1 time og 30 minutter. Bruges ofte til timeregistrering og fakturering.",
  },
  {
    question: "Kan jeg beregne tid over midnat?",
    answer:
      "Ja! Hvis sluttidspunktet er før starttidspunktet, antager beregneren automatisk at det går over midnat. F.eks. 22:00 til 06:00 = 8 timer.",
  },
  {
    question: "Hvad med arbejdsdage?",
    answer:
      "Arbejdsdage beregnes ud fra 8 timer = 1 arbejdsdag. Så 16 timer = 2 arbejdsdage. Nyttigt til projektplanlægning.",
  },
];

const relatedCalculators = [
  {
    title: "Datoberegner",
    href: "/dato",
    description: "Beregn dage mellem datoer",
  },
  {
    title: "Timeprisberegner",
    href: "/timepris",
    description: "Find din timepris",
  },
  {
    title: "Tidszoneberegner",
    href: "/tidszone",
    description: "Se tid i andre lande",
  },
];

export default function TidsberegnerPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Tidsberegner - Timer og minutter"
        description="Gratis tidsberegner. Beregn antal timer og minutter mellem to tidspunkter."
        url={`${baseUrl}/tidsberegner`}
        category="UtilityApplication"
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Tidsberegner", url: `${baseUrl}/tidsberegner` },
        ]}
      />
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        ⏱️ Tidsberegner
      </h1>
      <p className="text-gray-600 mb-8 text-lg">
        Beregn antal timer og minutter mellem to tidspunkter. Perfekt til
        arbejdstid, møder og timeregistrering.
      </p>

      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
        <TidsBeregner />
      </div>

      {/* SEO Content */}
      <div className="prose max-w-none mb-8">
        <h2>Sådan bruger du tidsberegneren</h2>
        <p>
          Vores tidsberegner hjælper dig med at beregne den præcise tid mellem
          to tidspunkter. Den er ideel til:
        </p>
        <ul>
          <li>
            <strong>Arbejdstidsregistrering</strong> - beregn dine timer til
            lønseddel
          </li>
          <li>
            <strong>Mødetid</strong> - se hvor lang tid et møde varede
          </li>
          <li>
            <strong>Projektplanlægning</strong> - estimer tid til opgaver
          </li>
          <li>
            <strong>Nattevagter</strong> - beregn tid over midnat
          </li>
        </ul>

        <h2>Decimal timer vs. timer:minutter</h2>
        <p>
          Mange virksomheder bruger decimal timer til timeregistrering. Her er
          en hurtig reference:
        </p>
        <ul>
          <li>15 min = 0,25 timer</li>
          <li>30 min = 0,50 timer</li>
          <li>45 min = 0,75 timer</li>
          <li>1 time 15 min = 1,25 timer</li>
        </ul>

        <h2>Tips til præcis timeregistrering</h2>
        <p>
          Husk altid at fratrække pauser fra din arbejdstid. De fleste har 30
          minutters frokostpause, som ikke tælles med i den betalte arbejdstid.
        </p>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators calculators={relatedCalculators} />
    </div>
  );
}
