import KalorieBeregner from "@/components/KalorieBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("kalorier");
}

const faqItems = [
  {
    question: "Hvad er forskellen på BMR og TDEE?",
    answer:
      "BMR (Basal Metabolic Rate) er de kalorier din krop brænder i hvile - bare for at holde dig i live. TDEE (Total Daily Energy Expenditure) er dit totale daglige forbrug inkl. al aktivitet. TDEE = BMR × aktivitetsfaktor.",
  },
  {
    question: "Hvor mange kalorier skal jeg spise for at tabe mig?",
    answer:
      "For at tabe ca. 0,5 kg om ugen, spis 500 kalorier under din TDEE. For 1 kg/uge, spis 1000 under (ikke anbefalet i længere perioder). Start med 500 kcal underskud for bæredygtigt vægttab.",
  },
  {
    question: "Hvor meget protein har jeg brug for?",
    answer:
      "Det afhænger af dit mål: Vedligehold: 0,8-1,2g per kg kropsvægt. Vægttab: 1,2-1,6g per kg (bevarer muskler). Muskelopbygning: 1,6-2,2g per kg. Protein mætter godt og bevarer muskelmasse.",
  },
  {
    question: "Er denne beregner præcis?",
    answer:
      "Beregneren bruger Mifflin-St Jeor formlen, som er den mest præcise formel for de fleste mennesker. Dog kan individuelle variationer være på 10-15%. Brug resultatet som udgangspunkt og justér baseret på dine resultater.",
  },
  {
    question: "Hvorfor taber jeg ikke vægt selvom jeg spiser under min TDEE?",
    answer:
      "Mulige årsager: 1) Du spiser mere end du tror (prøv at veje maden). 2) Din TDEE er lavere end beregnet. 3) Du har ikke givet det tid nok - vægten svinger naturligt. Prøv at reducere yderligere 200 kcal.",
  },
  {
    question: "Skal jeg spise mine trænede kalorier tilbage?",
    answer:
      "Det afhænger af dit mål. Ved vægttab: Spis ikke alle tilbage, men tilføj evt. 50% ved hård træning. Ved vedligehold/muskelopbygning: Ja, spis ekstra for at dække træningen. Din aktivitetsfaktor dækker allerede let-moderat træning.",
  },
  {
    question: "Hvor hurtigt kan jeg tabe mig sikkert?",
    answer:
      "En sikker og bæredygtig vægttabsrate er 0,5-1 kg per uge. Hurtigere vægttab kan føre til muskeltab, næringsmangel og metabolisk tilpasning. Tålmodighed giver bedre resultater på lang sigt.",
  },
  {
    question: "Hvad er en god makrofordeling?",
    answer:
      "En typisk fordeling er: Protein 25-30%, Fedt 25-30%, Kulhydrater 40-50%. Ved vægttab øges protein ofte til 30-35%. Fedt bør aldrig være under 20% af kalorierne pga. hormonbalance.",
  },
];

export default function KalorierPage() {
  return (
    <div>
      <CalculatorSchema
        name="Kalorieberegner"
        description="Gratis kalorieberegner. Beregn dit daglige kaloriebehov og få makrofordeling."
        url={`${baseUrl}/kalorier`}
        category="HealthApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Sundhed", href: "/kategori/sundhed" }, { name: "Kalorieberegner", href: "/kalorier" }]} />

      <h1 className="text-3xl font-bold mb-2">Kalorieberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn dit daglige kaloriebehov baseret på din krop og aktivitetsniveau.
        Få personlige anbefalinger til vægttab, vedligehold eller
        muskelopbygning.
      </p>

      <KalorieBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Forstå dit kaloriebehov</h2>
        <p>
          Dit <strong>kaloriebehov</strong> afhænger af flere faktorer: alder, køn, vægt, højde
          og hvor aktiv du er. Denne beregner bruger{" "}
          <strong>Mifflin-St Jeor formlen</strong>, som er den mest præcise
          metode til at estimere dit basalstofskifte.
        </p>

        <h2>BMR vs. TDEE</h2>

        <h3>BMR (Basal Metabolic Rate)</h3>
        <p>
          Dit <strong>basalstofskifte</strong> er antallet af kalorier din krop brænder bare for
          at holde dig i live — hjertet pumper, lungerne trækker vejret,
          cellerne fornyer sig. Selv hvis du lå stille i sengen hele dagen,
          ville du brænde disse kalorier.
        </p>

        <h3>TDEE (Total Daily Energy Expenditure)</h3>
        <p>
          <strong>TDEE</strong> er dit <strong>totale daglige kalorieforbrug</strong> — BMR plus alle de kalorier
          du brænder gennem aktivitet: gåture, træning, arbejde, selv at tænke
          bruger kalorier.
        </p>

        <h2>Vægttab og kalorieunderskud</h2>
        <p>
          For at tabe vægt skal du spise <strong>færre kalorier end du forbrænder</strong>. En
          god tommelfingerregel:
        </p>
        <ul>
          <li>
            <strong>500 kcal underskud/dag</strong> = ca. 0.5 kg tab/uge
          </li>
          <li>
            <strong>1000 kcal underskud/dag</strong> = ca. 1 kg tab/uge (ikke
            anbefalet længe)
          </li>
        </ul>

        <h2>Makronæringsstoffer</h2>

        <h3>Protein</h3>
        <p>
          <strong>Protein</strong> er essentielt for muskler, hår, hud og hundredvis af
          kropsprocesser.
        </p>
        <ul>
          <li>
            <strong>Vedligehold:</strong> 0.8-1.2g per kg kropsvægt
          </li>
          <li>
            <strong>Vægttab:</strong> 1.2-1.6g per kg (bevarer muskler)
          </li>
          <li>
            <strong>Muskelopbygning:</strong> 1.6-2.2g per kg
          </li>
        </ul>
        <p>1g protein = 4 kalorier</p>

        <h3>Fedt</h3>
        <p>
          <strong>Fedt</strong> er vigtigt for hormoner, vitaminoptagelse og cellestruktur.
          Minimum <strong>20-25% af kalorier</strong> bør komme fra fedt.
        </p>
        <p>1g fedt = 9 kalorier</p>

        <h3>Kulhydrater</h3>
        <p>
          <strong>Kulhydrater</strong> er kroppens <strong>foretrukne energikilde</strong>, især under træning.
          Mængden kan variere meget baseret på dine mål og præferencer.
        </p>
        <p>1g kulhydrat = 4 kalorier</p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på gennemsnitsværdier.
            Individuelle variationer kan være betydelige. Ved større
            vægtændringer eller helbredsproblemer, konsulter altid en læge eller
            diætist.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/kalorier" />
    </div>
  );
}
