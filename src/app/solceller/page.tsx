import { generatePageMetadata } from "@/lib/page-helpers";
import SolcelleBeregner from "@/components/SolcelleBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("solceller");
}

const faqItems = [
  {
    question: "Hvad koster solceller i Danmark?",
    answer: "Et typisk solcelleanlæg til en villa koster 60.000-100.000 kr. for 4-8 kWp. Prisen pr. kWp ligger typisk på 10.000-14.000 kr. inkl. montering. Større anlæg har lavere pris pr. kWp.",
  },
  {
    question: "Hvor lang er tilbagebetalingstiden?",
    answer: "Med 2026-elpriser er tilbagebetalingstiden typisk 7-12 år for et gennemsnitligt villaanlæg. Herefter producerer solcellerne gratis strøm i den resterende levetid på 25-30 år.",
  },
  {
    question: "Hvad er nettoafregning?",
    answer: "Nettoafregning betyder, at du kan sælge overskudsstrøm til elnettet. Du modtager en afregningspris pr. kWh, som typisk er lavere end den pris du betaler for el. Nettoafregningsordningen har ændret sig — tjek aktuelle regler på energistyrelsen.dk.",
  },
  {
    question: "Hvor meget strøm producerer solceller i Danmark?",
    answer: "I Danmark producerer solceller ca. 850-1.000 kWh pr. kWp installeret effekt pr. år, afhængigt af tagretning, hældning og skyggeforhold. Et sydvendt tag med 30° hældning er optimalt.",
  },
  {
    question: "Skal jeg have batteri til mine solceller?",
    answer: "Et batteri kan øge din selvforsyningsgrad fra ca. 30% til 60-70%, da du kan lagre overskudsstrøm til aften og nat. Batterier koster ekstra og øger tilbagebetalingstiden, men kan give mening ved høje elpriser.",
  },
];

const relatedCalculators = [
  { title: "Elberegner", description: "Beregn elforbrug", href: "/elberegner", icon: "⚡" },
  { title: "Opsparingsberegner", description: "Beregn besparelse", href: "/opsparing", icon: "📈" },
  { title: "Boliglån", description: "Finansier solceller", href: "/boliglaan", icon: "🏠" },
  { title: "Ejendomsværdiskat", description: "Se boligskatter", href: "/ejendomsvaerdiskat", icon: "🏠" },
];

export default function SolcellerPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Solcelle Beregner"
          description="Beregn besparelse og tilbagebetalingstid for solcelleanlæg i Danmark."
          url={`${baseUrl}/solceller`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Bolig", href: "/kategori/bolig" }, { name: "Solcelle Beregner", href: "/solceller" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Solcelle Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn besparelse og tilbagebetalingstid for solceller. Se årlig produktion, egetforbrug vs. salg til nettet, og CO₂-reduktion.
        </p>

        <SolcelleBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Er solceller en god investering?</h2>
          <p>
            Med <strong>stigende elpriser</strong> er solceller en <strong>attraktiv investering</strong> for de fleste husejere. Tilbagebetalingstiden er typisk <strong>7-12 år</strong>, og herefter producerer anlægget gratis strøm i yderligere 15-20 år.
          </p>

          <h2>Sådan virker solceller</h2>
          <p>
            Solceller omdanner <strong>sollys til elektricitet</strong>. Den producerede strøm bruges først i dit eget hjem (<strong>egetforbrug</strong>). Overskuddet sælges til elnettet via <strong>nettoafregning</strong>. Om aftenen og natten køber du el fra nettet som normalt.
          </p>

          <h2>Hvad påvirker produktionen?</h2>
          <ul>
            <li><strong>Tagretning:</strong> Sydvendt er optimalt, øst/vest giver ca. 80% af optimal produktion</li>
            <li><strong>Taghældning:</strong> 30-40° er ideelt i Danmark</li>
            <li><strong>Skygge:</strong> Selv delvis skygge reducerer produktionen markant</li>
            <li><strong>Anlægsstørrelse:</strong> Vælg et anlæg, der matcher dit forbrug</li>
            <li><strong>Vedligeholdelse:</strong> Solceller kræver næsten ingen vedligeholdelse</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/solceller" adSlotId="solceller-sidebar" />
    </div>
  );
}
