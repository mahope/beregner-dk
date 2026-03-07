import type { Metadata } from "next";
import TerminBeregner from "@/components/TerminBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Terminsdato Beregner - Beregn din terminsdato gratis | MinBeregner.dk",
  description:
    "Beregn din terminsdato gratis. Indtast første dag i sidste menstruation og se forventet fødselsdato, uge-for-uge milepæle og barselstart.",
  keywords: [
    "terminsdato beregner",
    "graviditetsberegner",
    "beregn terminsdato",
    "hvornår er jeg i termin",
    "graviditetsuge beregner",
    "fødselsdato beregner",
    "termin beregner",
  ],
  openGraph: {
    title: "Terminsdato Beregner - Beregn din terminsdato",
    description: "Gratis terminsdato beregner. Se forventet fødselsdato og graviditetsuge.",
    url: `${baseUrl}/termin`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/termin`,
  },
};

const faqItems = [
  {
    question: "Hvordan beregnes terminsdatoen?",
    answer: "Terminsdatoen beregnes ved at lægge 280 dage (40 uger) til første dag i din sidste menstruation. Dette er den mest udbredte metode og bruges også af læger og jordmødre.",
  },
  {
    question: "Hvor præcis er terminsdatoen?",
    answer: "Kun ca. 5% af børn fødes præcis på terminsdatoen. De fleste fødes inden for 2 uger før eller efter. En graviditet regnes som fuldbåren fra uge 37, og de fleste fødes mellem uge 38 og 42.",
  },
  {
    question: "Hvornår starter barsel i Danmark?",
    answer: "Mor har ret til barsel fra 4 uger før terminsdatoen. Samlet har forældrene ret til 52 ugers orlov med barselsdagpenge. 11 uger er øremærket til hver forælder, og resten kan deles.",
  },
  {
    question: "Hvad er de tre trimestre?",
    answer: "1. trimester er uge 1-12 (organer dannes), 2. trimester er uge 13-26 (barnet vokser hurtigt), og 3. trimester er uge 27-40 (barnet modnes og gør sig klar til fødsel).",
  },
  {
    question: "Hvornår kan man tage en graviditetstest?",
    answer: "De fleste graviditetstests kan give et pålideligt resultat fra ca. uge 4-5 — altså ca. 1 uge efter udeblivende menstruation. En blodprøve hos lægen kan påvise graviditet endnu tidligere.",
  },
];

const relatedCalculators = [
  { title: "Barselsdagpenge", description: "Beregn barselsdagpenge og orlov", href: "/barselsdagpenge", icon: "👶" },
  { title: "Børnepenge", description: "Se børne- og ungeydelse 2026", href: "/boernepenge", icon: "👶" },
  { title: "Datoberegner", description: "Beregn dage mellem datoer", href: "/dato", icon: "📅" },
  { title: "Aldersberegner", description: "Beregn præcis alder", href: "/alder", icon: "🎂" },
];

export default function TerminPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Terminsdato Beregner"
          description="Beregn din forventede terminsdato og se graviditetsuge, milepæle og barselstart."
          url={`${baseUrl}/termin`}
          category="HealthApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Familie", href: "/kategori/familie" }, { name: "Terminsdato Beregner", href: "/termin" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Terminsdato Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn din forventede terminsdato ud fra første dag i din sidste menstruation. Se hvilken graviditetsuge du er i, milepæle og hvornår barslen starter.
        </p>

        <TerminBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan beregnes din terminsdato</h2>
          <p>
            Terminsdatoen beregnes ved at lægge <strong>280 dage (40 uger)</strong> til første dag i din sidste menstruation (Naegeles regel). Denne metode bruges af læger og jordmødre verden over og er den mest udbredte beregningsmetode.
          </p>
          <p>
            Bemærk at beregningen antager en <strong>cyklus på 28 dage</strong> og at ægløsningen sker på dag 14. Hvis din cyklus er kortere eller længere, kan terminsdatoen justeres af din læge ved <strong>scanningen i uge 12</strong>.
          </p>

          <h2>Graviditetens tre trimestre</h2>
          <ul>
            <li><strong>1. trimester (uge 1-12):</strong> Alle organer dannes. Risikoen for spontan abort er størst i denne periode. Nakkefoldscanning tilbydes i uge 11-14.</li>
            <li><strong>2. trimester (uge 13-26):</strong> Barnet vokser hurtigt. De fleste oplever øget energi. Misdannelsesscanning tilbydes i uge 18-20.</li>
            <li><strong>3. trimester (uge 27-40):</strong> Barnet modnes og gør sig klar til fødsel. Fra uge 37 regnes barnet som fuldbårent.</li>
          </ul>

          <h2>Barsel i Danmark 2026</h2>
          <p>
            Mor har ret til barsel fra <strong>4 uger før terminsdatoen</strong>. Samlet har forældrene ret til 52 ugers barselsorlov med barselsdagpenge. I 2026 er reglerne:
          </p>
          <ul>
            <li>2 uger øremærket til mor før fødsel</li>
            <li>2 uger øremærket til far/medmor ved fødsel</li>
            <li>8 uger øremærket til mor efter fødsel</li>
            <li>9 uger øremærket til far/medmor (kan ikke overdrages)</li>
            <li>Resten kan deles frit mellem forældrene</li>
          </ul>
          <p>
            Brug vores <a href="/barselsdagpenge">barselsdagpenge-beregner</a> for at se hvad du kan få udbetalt under barsel.
          </p>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/termin" adSlotId="termin-sidebar" />
    </div>
  );
}
