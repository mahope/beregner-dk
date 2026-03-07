import type { Metadata } from "next";
import dynamic from "next/dynamic";
const DatoBeregner = dynamic(() => import("@/components/DatoBeregner"));
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Datoberegner - Beregn dage mellem datoer gratis",
  description:
    "Gratis datoberegner. Beregn antal dage mellem to datoer, tilføj dage til en dato, beregn arbejdsdage, eller find din præcise alder.",
  keywords: [
    "datoberegner",
    "dage mellem datoer",
    "beregn dage",
    "arbejdsdage beregner",
    "tilføj dage til dato",
    "alder beregner",
    "hvor mange dage",
    "dato kalkulator",
  ],
  openGraph: {
    title: "Datoberegner - Beregn dage mellem datoer",
    description:
      "Beregn dage mellem datoer, arbejdsdage, eller din præcise alder. Gratis datoberegner.",
    url: `${baseUrl}/dato`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/dato`,
  },
};

const faqItems = [
  {
    question: "Hvordan beregner jeg dage mellem to datoer?",
    answer:
      "Vælg 'Dage mellem' og indtast start- og slutdato. Beregneren viser antal dage, uger, måneder, arbejdsdage og weekenddage.",
  },
  {
    question: "Tæller beregneren arbejdsdage korrekt?",
    answer:
      "Beregneren tæller hverdage (mandag-fredag) som arbejdsdage. Den tager ikke højde for helligdage, da disse varierer fra år til år og afhænger af din branche/arbejdsplads.",
  },
  {
    question: "Kan jeg trække dage fra en dato?",
    answer:
      "Ja! I 'Tilføj dage' tilstanden kan du indtaste et negativt tal for at gå tilbage i tid. F.eks. -30 for at finde datoen 30 dage før.",
  },
  {
    question: "Hvordan beregner jeg min præcise alder?",
    answer:
      "Vælg 'Alder' og indtast din fødselsdato. Du får din alder i år, måneder og dage, samt total antal dage og uger du har levet.",
  },
  {
    question: "Hvad er forskellen på 'Tilføj dage' og 'Arbejdsdage'?",
    answer:
      "'Tilføj dage' tæller alle kalenderdage (inkl. weekender). 'Arbejdsdage' springer weekender over og tæller kun hverdage.",
  },
  {
    question: "Tager beregneren højde for skudår?",
    answer:
      "Ja, beregneren håndterer skudår korrekt. Februar har 29 dage i skudår (år der er delelige med 4, undtagen hele århundreder der ikke er delelige med 400).",
  },
  {
    question: "Kan jeg bruge beregneren til projektplanlægning?",
    answer:
      "Ja! 'Arbejdsdage' funktionen er ideel til at beregne projektdeadlines. Indtast antal arbejdsdage, og se hvilken dato det svarer til.",
  },
  {
    question: "Hvorfor er 'ca. måneder' ikke helt præcis?",
    answer:
      "Måneder har forskellig længde (28-31 dage), så vi bruger gennemsnittet på 30,44 dage per måned. For præcis beregning, brug dage eller uger.",
  },
];

export default function DatoPage() {
  return (
    <div>
      <CalculatorSchema
        name="Datoberegner"
        description="Gratis datoberegner. Beregn dage mellem datoer, arbejdsdage, eller din præcise alder."
        url={`${baseUrl}/dato`}
        category="UtilitiesApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Praktisk", href: "/kategori/praktisk" }, { name: "Datoberegner", href: "/dato" }]} />

      <h1 className="text-3xl font-bold mb-2">Datoberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn antal dage mellem to datoer, tilføj dage til en dato, beregn
        arbejdsdage, eller find din præcise alder.
      </p>

      <DatoBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du datoberegneren</h2>
        <p>Datoberegneren har <strong>fire forskellige funktioner</strong>:</p>

        <h3>1. Dage mellem datoer</h3>
        <p>
          Beregn hvor mange <strong>dage der er mellem to datoer</strong>. Du får også antal
          uger, ca. måneder, arbejdsdage og weekenddage.
        </p>
        <ul>
          <li>Vælg startdato og slutdato</li>
          <li>Resultatet vises automatisk</li>
          <li>
            Negativt tal betyder at slutdato er før startdato
          </li>
        </ul>

        <h3>2. Tilføj dage</h3>
        <p>
          Find ud af hvilken dato det bliver om <strong>X dage</strong>, eller hvilken dato det
          var for X dage siden.
        </p>
        <ul>
          <li>Vælg en udgangsdato</li>
          <li>Indtast antal dage (brug minus for at gå tilbage)</li>
          <li>Se resultatet med ugedag og dato</li>
        </ul>

        <h3>3. Arbejdsdage</h3>
        <p>
          Beregn en dato baseret på antal <strong>arbejdsdage</strong>. Perfekt til
          <strong>projektplanlægning</strong> og deadline-beregning.
        </p>
        <ul>
          <li>Vælg startdato</li>
          <li>Indtast antal arbejdsdage</li>
          <li>Weekender springes automatisk over</li>
        </ul>

        <h3>4. Alder</h3>
        <p>
          Beregn din <strong>præcise alder</strong> i år, måneder og dage. Se også hvor mange
          dage du har levet, og hvornår du fylder år.
        </p>

        <h2>Nyttige datofakta</h2>
        <ul>
          <li>1 år = 365 dage (366 i skudår)</li>
          <li>1 måned = ca. 30,44 dage i gennemsnit</li>
          <li>1 uge = 7 dage</li>
          <li>1 arbejdsuge = typisk 5 dage</li>
          <li>1 år ≈ 52 uger</li>
          <li>1 år ≈ 260 arbejdsdage (uden helligdage)</li>
        </ul>

        <h2>Skudår</h2>
        <p>Et år er et <strong>skudår</strong> hvis:</p>
        <ul>
          <li>Året er deleligt med 4, OG</li>
          <li>Året er IKKE deleligt med 100, MED MINDRE</li>
          <li>Året er deleligt med 400</li>
        </ul>
        <p>
          Eksempel: 2024 er skudår (deleligt med 4). 2100 er ikke skudår
          (deleligt med 100). 2000 var skudår (deleligt med 400).
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip</p>
          <p className="text-blue-700">
            Beregneren tager ikke højde for helligdage ved beregning af
            arbejdsdage, da disse varierer fra år til år. Tilføj selv ekstra
            dage for helligdage i din periode.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/dato" />
    </div>
  );
}
