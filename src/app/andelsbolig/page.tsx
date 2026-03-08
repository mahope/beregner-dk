import { generatePageMetadata } from "@/lib/page-helpers";
import AndelsboligBeregner from "@/components/AndelsboligBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("andelsbolig");
}

const faqItems = [
  {
    question: "Hvad er en andelsbolig?",
    answer: "En andelsbolig er en bolig i en andelsboligforening, hvor du køber en andel af foreningen — ikke selve lejligheden. Du betaler en andelpris ved køb og en månedlig boligafgift, der dækker foreningens drift og fælleslån.",
  },
  {
    question: "Hvad er andelskronen?",
    answer: "Andelskronen er en faktor, der bestemmer boligens værdi i forhold til den oprindelige indskudsværdi. En andelskrone på 1,0 betyder pålydende værdi. Over 1,0 betyder at boligen er steget i værdi. Andelskronen fastsættes årligt på generalforsamlingen.",
  },
  {
    question: "Hæfter jeg for fælleslånet?",
    answer: "Ja, som andelshaver hæfter du solidarisk for foreningens fælleslån. Det betyder, at du i yderste konsekvens kan blive ansvarlig for andre andelshaveres andel af gælden. Tjek foreningens gæld og økonomi grundigt før køb.",
  },
  {
    question: "Kan jeg få lån til andelsbolig?",
    answer: "Ja, de fleste banker tilbyder andelslån. Du kan typisk låne op til 95% af købesummen. Renten er ofte lidt højere end på boliglån, da andelsboliger ikke kan belånes med realkreditlån.",
  },
  {
    question: "Er andelsbolig billigere end ejerbolig?",
    answer: "Andelsboliger er typisk billigere at købe, men du betaler en løbende boligafgift. Den samlede månedlige udgift kan være lavere end en tilsvarende ejerbolig, men du opbygger ikke egenkapital på samme måde.",
  },
];

const relatedCalculators = [
  { title: "Boliglån", description: "Beregn boliglån", href: "/boliglaan", icon: "🏠" },
  { title: "Huslejebudget", description: "Beregn huslejebudget", href: "/husleje", icon: "🏘️" },
  { title: "Boligstøtte", description: "Beregn boligstøtte", href: "/boligstoette", icon: "💶" },
  { title: "Låneberegner", description: "Sammenlign lån", href: "/laaneberegner", icon: "🏦" },
];

export default function AndelsboligPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Andelsbolig Beregner"
          description="Beregn månedlige omkostninger ved køb af andelsbolig og sammenlign med lejebolig."
          url={`${baseUrl}/andelsbolig`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Bolig", href: "/kategori/bolig" }, { name: "Andelsbolig Beregner", href: "/andelsbolig" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Andelsbolig Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn de månedlige omkostninger ved køb af andelsbolig. Se boligafgift, lånydelse, andelskroneværdi og sammenlign med leje.
        </p>

        <AndelsboligBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvad koster det at købe andelsbolig?</h2>
          <p>
            Prisen på en andelsbolig består af <strong>andelprisen</strong> (din andel af foreningens formue) plus evt. <strong>forbedringer</strong> (køkken, bad mv.) foretaget af den tidligere ejer. Derudover betaler du en <strong>månedlig boligafgift</strong>.
          </p>

          <h2>Boligafgift forklaret</h2>
          <p>
            <strong>Boligafgiften</strong> dækker foreningens driftsudgifter og omfatter typisk:
          </p>
          <ul>
            <li><strong>Ejendomsskat</strong> og forsikring</li>
            <li><strong>Vedligeholdelse</strong> af ejendommen</li>
            <li>Vand og renovation</li>
            <li>Afdrag på <strong>fælleslån</strong></li>
          </ul>
          <p>
            En høj boligafgift kan betyde stor <strong>fællesgæld</strong> — men også at du betaler en lavere <strong>andelpris</strong>.
          </p>

          <h2>Tjekliste før du køber andelsbolig</h2>
          <ul>
            <li><strong>Gennemgå årsrapporten:</strong> Se foreningens økonomi, gæld og vedligeholdelsesplan</li>
            <li><strong>Tjek fællesgælden:</strong> Høj gæld pr. m² kan være et risikotegn</li>
            <li><strong>Forstå andelskronen:</strong> En høj andelskrone giver højere pris, men kan falde</li>
            <li><strong>Se vedligeholdelsesplanen:</strong> Store kommende renoveringer kan betyde stigende boligafgift</li>
            <li><strong>Undersøg udlejningsregler:</strong> Mange foreninger begrænser fremleje</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/andelsbolig" adSlotId="andelsbolig-sidebar" />
    </div>
  );
}
