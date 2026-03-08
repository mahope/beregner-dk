import { generatePageMetadata } from "@/lib/page-helpers";
import BarselBeregner from "@/components/BarselBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("barselsdagpenge");
}

const faqItems = [
  {
    question: "Hvad er barselsdagpenge?",
    answer:
      "Barselsdagpenge er en ydelse, du kan få fra Udbetaling Danmark, når du holder barselsorlov. Ydelsen erstatter din løn under barsel, hvis din arbejdsgiver ikke betaler fuld løn i perioden.",
  },
  {
    question: "Hvad er satsen for barselsdagpenge i 2026?",
    answer:
      "I 2026 er den maksimale barselsdagpengesats ca. 5.085 kr. om ugen (før skat) for fuldtidsansatte. Det svarer til ca. 22.000 kr. om måneden. Satsen reguleres årligt.",
  },
  {
    question: "Hvor længe kan jeg få barselsdagpenge?",
    answer:
      "Mor har ret til 4 ugers barsel før termin og 14 uger efter fødslen. Far/medmor har 2 ugers orlov efter fødslen. Derudover er der 32 uger til deling mellem forældrene. I alt op til 52 uger.",
  },
  {
    question: "Skal jeg betale skat af barselsdagpenge?",
    answer:
      "Ja, barselsdagpenge er skattepligtig indkomst. Der trækkes automatisk A-skat af udbetalingen. Du kan justere dit fradrag via Skattestyrelsen.",
  },
  {
    question: "Hvad er forskellen på barselsdagpenge og løn under barsel?",
    answer:
      "Mange overenskomster giver ret til fuld løn under barsel. I så fald modtager din arbejdsgiver barselsdagpengene som refusion. Har du ikke ret til løn, får du dagpengene direkte fra Udbetaling Danmark.",
  },
  {
    question: "Kan selvstændige få barselsdagpenge?",
    answer:
      "Ja, selvstændige kan få barselsdagpenge, hvis de har tegnet en frivillig forsikring hos A-kassen eller har haft et vist overskud i virksomheden. Kontakt Udbetaling Danmark for præcise betingelser.",
  },
  {
    question: "Hvordan ansøger jeg om barselsdagpenge?",
    answer:
      "Du ansøger via borger.dk. Din arbejdsgiver skal først indberette din orlov. Derefter modtager du besked om at udfylde din del af ansøgningen. Ansøg senest 8 uger efter orlovens start.",
  },
  {
    question: "Kan jeg arbejde deltid og stadig få barselsdagpenge?",
    answer:
      "Ja, du kan genoptage arbejdet delvist og få nedsatte barselsdagpenge for de timer, du ikke arbejder. Det kaldes fleksibel barsel og skal aftales med din arbejdsgiver.",
  },
];

const relatedCalculators = [
  { title: "Dagpenge", href: "/dagpenge", description: "Beregn dagpengesats" },
  { title: "Løn efter skat", href: "/loen-efter-skat", description: "Se din nettoløn" },
  { title: "Boligstøtte", href: "/boligstoette", description: "Beregn boligstøtte" },
  { title: "Børnepenge", href: "/boernepenge", description: "Se børne- og ungeydelse" },
];

export default function BarselPage() {
  return (
    <div>
      <CalculatorSchema
        name="Barselsdagpenge beregner"
        description="Beregn hvad du får udbetalt i barselsdagpenge under barselsorlov."
        url={`${baseUrl}/barselsdagpenge`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Familie", href: "/kategori/familie" }, { name: "Barselsdagpenge", href: "/barselsdagpenge" }]} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Barselsdagpenge beregner 2026
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Se hvad du kan forvente at få udbetalt i <strong>barselsdagpenge</strong> under din <strong>barselsorlov</strong>.
              Beregneren bruger de <strong>aktuelle satser for 2026</strong>.
            </p>
          </header>

          <section className="mb-12">
            <BarselBeregner />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om barselsdagpenge
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                <strong>Barselsdagpenge</strong> er en offentlig ydelse, der hjælper forældre økonomisk under <strong>barselsorlov</strong>.
                Ydelsen administreres af <strong>Udbetaling Danmark</strong> og erstatter din indkomst, når du holder pause
                fra arbejdet for at passe dit barn.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Hvem kan få barselsdagpenge?</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Lønmodtagere, der opfylder beskæftigelseskravet (mindst 160 timer inden for de seneste 4 måneder)</li>
                <li>Selvstændige med frivillig forsikring eller tilstrækkeligt overskud</li>
                <li>Ledige, der er medlem af en a-kasse</li>
                <li>Studerende med et vist antal arbejdstimer</li>
              </ul>
              <h3 className="text-xl font-semibold mt-6 mb-3">Barselsoversigt 2026</h3>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Periode</th>
                    <th className="border p-3 text-left">Mor</th>
                    <th className="border p-3 text-left">Far/medmor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">Før fødsel</td>
                    <td className="border p-3">4 uger</td>
                    <td className="border p-3">-</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Efter fødsel (øremærket)</td>
                    <td className="border p-3">10 uger</td>
                    <td className="border p-3">2 uger</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Øremærket til hver</td>
                    <td className="border p-3">9 uger</td>
                    <td className="border p-3">9 uger</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Til deling</td>
                    <td className="border p-3" colSpan={2}>13 uger</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ofte stillede spørgsmål
            </h2>
            <FAQ items={faqItems} />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Relaterede beregnere
            </h2>
            <RelatedCalculators calculators={relatedCalculators} />
          </section>
        </article>
      </main>
    </div>
  );
}
