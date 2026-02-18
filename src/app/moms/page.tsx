import type { Metadata } from "next";
import MomsBeregner from "@/components/MomsBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Momsberegner - Beregn moms online | MinBeregner.dk",
  description:
    "Beregn dansk moms (25%) hurtigt. Eksempel: 1.000 kr × 1,25 = 1.250 kr inkl. moms. Tillæg moms, fratræk moms eller find momsandelen. Gratis momsberegner 2026.",
  keywords: [
    "momsberegner",
    "beregn moms",
    "moms beregner",
    "tillæg moms",
    "fratræk moms",
    "moms 25%",
    "dansk moms",
    "mva beregner",
    "moms kalkulator",
  ],
  openGraph: {
    title: "Momsberegner - Beregn dansk moms",
    description: "Beregn moms nemt. Tillæg eller fratræk 25% moms med vores gratis beregner.",
    url: `${baseUrl}/moms`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/moms`,
  },
};

const faqItems = [
  {
    question: "Hvad er den danske momssats?",
    answer:
      "Den danske momssats (moms/VAT) er 25%. Det betyder, at når du køber varer eller ydelser i Danmark, betaler du 25% i moms oveni prisen uden moms.",
  },
  {
    question: "Hvordan beregner man moms?",
    answer:
      "For at tillægge moms: Gange prisen uden moms med 1,25. For at fratrække moms: Dividér prisen inkl. moms med 1,25. Eksempel: 100 kr uden moms = 125 kr inkl. moms.",
  },
  {
    question: "Hvad er momsandelen i en pris inkl. moms?",
    answer:
      "Momsandelen i en pris inkl. moms er 20% (ikke 25%). Det skyldes at momsen beregnes af prisen uden moms. Regnestykket: 25/125 = 0,20 = 20%.",
  },
  {
    question: "Skal alle betale moms i Danmark?",
    answer:
      "De fleste varer og ydelser er momspligtige i Danmark. Dog er visse ydelser momsfritaget, fx sundhedsydelser, undervisning, og finansielle tjenesteydelser.",
  },
  {
    question: "Hvad er forskellen på moms og afgift?",
    answer:
      "Moms er en generel omsætningsafgift på 25% af de fleste varer og ydelser. Afgifter er specifikke skatter på bestemte produkter som fx biler, cigaretter og alkohol, og kommer oveni momsen.",
  },
  {
    question: "Hvornår kan virksomheder trække moms fra?",
    answer:
      "Momsregistrerede virksomheder kan trække moms fra på deres erhvervsmæssige indkøb (købsmoms). De opkræver moms fra kunder (salgsmoms) og afregner forskellen med SKAT.",
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
    title: "Procentberegner",
    href: "/procent",
    description: "Beregn procenter nemt",
    icon: "➗",
  },
  {
    title: "Renteberegner",
    href: "/renteberegner",
    description: "Beregn renter på lån",
    icon: "📊",
  },
];

export default function MomsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Momsberegner - Beregn dansk moms"
        description="Gratis momsberegner. Tillæg moms, fratræk moms eller find momsandelen i et beløb. Dansk moms 25%."
        url={`${baseUrl}/moms`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Momsberegner", href: "/moms" }]} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Momsberegner
        </h1>
        <p className="text-lg text-gray-600">
          Beregn dansk moms nemt og hurtigt. Tillæg moms, fratræk moms, eller find momsandelen i et beløb.
          Den danske momssats er 25%.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <MomsBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Om moms i Danmark (2026)</h2>
        <p>
          Moms (merværdiafgift, eng. VAT) er en generel forbrugsafgift på varer og tjenesteydelser i Danmark.
          Med en momssats på <strong>25%</strong> har Danmark en af de højeste momssatser i verden.
          Momsen har været 25% siden 1992, og der er ingen planlagte ændringer for 2026.
        </p>

        <h3>Sådan beregner du moms</h3>
        <p>
          Der er tre typiske beregninger, når du arbejder med moms:
        </p>
        <ul>
          <li><strong>Tillæg moms:</strong> Gang beløbet med 1,25. Eksempel: 1.000 kr &times; 1,25 = 1.250 kr inkl. moms</li>
          <li><strong>Fratræk moms:</strong> Divider beløbet med 1,25. Eksempel: 1.250 kr &divide; 1,25 = 1.000 kr ekskl. moms</li>
          <li><strong>Find momsandelen:</strong> Gang beløbet inkl. moms med 0,20. Eksempel: 1.250 kr &times; 0,20 = 250 kr i moms</li>
        </ul>
        <p>
          Bemærk at momsandelen i en pris <em>inklusiv</em> moms er 20% (ikke 25%), fordi momsen
          beregnes af prisen uden moms: 25 / 125 = 0,20.
        </p>

        <h3>Momsfrie varer og ydelser</h3>
        <p>
          Ikke alle varer og ydelser er momspligtige i Danmark. Momsfritaget er bl.a.:
        </p>
        <ul>
          <li>Sundhedsydelser (læge, tandlæge, psykolog)</li>
          <li>Undervisning og uddannelse</li>
          <li>Finansielle tjenesteydelser (bank, forsikring)</li>
          <li>Udlejning af fast ejendom (bolig)</li>
          <li>Personbefordring (bus, tog, fly inden for DK)</li>
          <li>Aviser og tidsskrifter (0% moms)</li>
        </ul>

        <h3>Momsregistrering for virksomheder (2026)</h3>
        <p>
          Virksomheder med en årlig omsætning over <strong>50.000 kr</strong> skal momsregistreres hos
          Erhvervsstyrelsen. Registrerede virksomheder opkræver moms af deres salg (salgsmoms) og kan
          fradrage moms på erhvervsmæssige indkøb (købsmoms). Forskellen mellem salgsmoms og købsmoms
          afregnes med Skattestyrelsen.
        </p>
        <p>
          Momsperioden afhænger af din omsætning:
        </p>
        <ul>
          <li><strong>Under 5 mio. kr/år:</strong> Afregning hvert halvår</li>
          <li><strong>5-50 mio. kr/år:</strong> Afregning hvert kvartal</li>
          <li><strong>Over 50 mio. kr/år:</strong> Afregning hver måned</li>
        </ul>

        <h3>Moms i EU og ved handel med udlandet</h3>
        <p>
          EU-momssatserne varierer fra 17% (Luxembourg) til 27% (Ungarn). Danmarks 25% ligger i den
          høje ende. Ved køb af varer fra udlandet gælder:
        </p>
        <ul>
          <li><strong>Inden for EU:</strong> Privatpersoner betaler normalt momsen i sælgerlandet. Virksomheder kan bruge reverse charge</li>
          <li><strong>Uden for EU:</strong> Du betaler dansk moms (25%) + eventuel told ved import over 1.150 kr</li>
        </ul>

        <h3>Moms på digitale ydelser</h3>
        <p>
          Køber du digitale tjenester som streaming, software eller e-bøger fra udenlandske
          udbydere, skal de opkræve dansk moms (25%) via EU&apos;s One Stop Shop-ordning.
          Du betaler altså allerede dansk moms når du køber fra fx Netflix, Spotify eller Apple.
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
