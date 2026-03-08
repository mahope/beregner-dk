import AlderBeregner from "@/components/AlderBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("alder");
}

const faqItems = [
  {
    question: "Hvordan beregnes min præcise alder?",
    answer:
      "Din alder beregnes ved at tælle hele år, måneder og dage fra din fødselsdato til i dag. Beregneren tager højde for forskellige månedslængder og skudår.",
  },
  {
    question: "Hvorfor er der forskel på alder i år og måneder?",
    answer:
      "Alder i år angiver kun hele afsluttede år. Alder i måneder tæller alle måneder du har levet. Fx er en person på 25 år og 6 måneder = 306 måneder gammel.",
  },
  {
    question: "Hvordan findes mit stjernetegn?",
    answer:
      "Dit stjernetegn bestemmes af din fødselsdato. Der er 12 stjernetegn, og hvert tegn dækker ca. en måned. Tegnene starter med Vædder (21. marts) og slutter med Fisk (20. marts).",
  },
  {
    question: "Kan jeg beregne alder på en bestemt dato?",
    answer:
      "Ja, du kan ændre beregningsdatoen til enhver dato i fortiden, nutiden eller fremtiden for at se, hvor gammel du var/vil være på den dato.",
  },
  {
    question: "Hvad er forskellen på kronologisk og biologisk alder?",
    answer:
      "Kronologisk alder er din faktiske alder målt i tid siden fødslen. Biologisk alder er et estimat af din krops tilstand sammenlignet med gennemsnittet - denne kan påvirkes af livsstil.",
  },
  {
    question: "Tæller beregneren med skudår?",
    answer:
      "Ja, beregneren tager automatisk højde for skudår (hvert 4. år har februar 29 dage) og varierende månedslængder for at give et præcist resultat.",
  },
];

const relatedCalculators = [
  {
    title: "BMI Beregner",
    href: "/bmi",
    description: "Beregn dit BMI",
    icon: "⚖️",
  },
  {
    title: "Kalorieberegner",
    href: "/kalorier",
    description: "Beregn dit kaloriebehov",
    icon: "🍎",
  },
  {
    title: "Pensionsberegner",
    href: "/pension",
    description: "Beregn din pension",
    icon: "👴",
  },
];

export default function AlderPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name="Aldersberegner - Beregn din præcise alder"
        description="Gratis aldersberegner. Beregn din præcise alder i år, måneder, uger, dage og timer."
        url={`${baseUrl}/alder`}
        category="UtilityApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Hverdag", href: "/kategori/hverdag" }, { name: "Aldersberegner", href: "/alder" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Aldersberegner
        </h1>
        <p className="text-lg text-gray-600">
          Beregn din præcise alder i år, måneder, uger, dage og timer. 
          Se også dit stjernetegn og hvor mange dage der er til din næste fødselsdag.
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <AlderBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      <div className="prose max-w-none mb-8">
        <h2>Om aldersberegning</h2>
        <p>
          At kende sin <strong>præcise alder</strong> kan være nyttigt i mange sammenhænge - fra <strong>juridiske dokumenter</strong>
          til <strong>sundhedsberegninger</strong>. Vores aldersberegner giver dig et detaljeret overblik over din alder
          i forskellige <strong>tidsenheder</strong>.
        </p>
        
        <h3>Alder i forskellige enheder</h3>
        <p>
          Din alder kan måles i mange enheder:
        </p>
        <ul>
          <li><strong>År</strong> - Den mest almindelige måde at angive alder</li>
          <li><strong>Måneder</strong> - Bruges ofte for småbørn</li>
          <li><strong>Uger</strong> - Bruges ved graviditet og for nyfødte</li>
          <li><strong>Dage</strong> - For præcise beregninger</li>
          <li><strong>Timer/Minutter</strong> - For sjov og kuriositet</li>
        </ul>

        <h3>Juridisk alder i Danmark</h3>
        <p>
          I Danmark har alder juridisk betydning ved flere milepæle:
        </p>
        <ul>
          <li>15 år - Seksuel lavalder</li>
          <li>18 år - Myndighedsalder, stemmeret, kørekort til bil</li>
          <li>21 år - Kan adoptere (med undtagelser)</li>
          <li>Pensionsalder - Afhænger af fødselsår (ca. 67-68 år)</li>
        </ul>

        <h3>Stjernetegn</h3>
        <p>
          <strong>Stjernetegnene</strong> er baseret på den <strong>vestlige astrologi</strong> og følger <strong>solens position</strong>
          i zodiakken på fødselstidspunktet. Der er <strong>12 tegn</strong>, hver med unikke karaktertræk
          ifølge astrologisk tradition.
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
