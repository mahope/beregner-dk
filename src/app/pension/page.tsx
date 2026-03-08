import { generatePageMetadata } from "@/lib/page-helpers";
import dynamic from "next/dynamic";
const PensionBeregner = dynamic(() => import("@/components/PensionBeregner"));
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export async function generateMetadata() {
  return generatePageMetadata("pension");
}

const pensionFaqItems = [
  {
    question: "Hvad er folkepensionen i 2026?",
    answer:
      "I 2026 er folkepensionens grundbeløb ca. 7.544 kr/md. Dertil kommer pensionstillæg på 8.729 kr/md for enlige eller 4.367 kr/md for samboende. Pensionstillægget modregnes i anden indkomst.",
  },
  {
    question: "Hvornår kan jeg gå på folkepension?",
    answer:
      "Folkepensionsalderen afhænger af dit fødselsår. For personer født 1963-1966 er den 68 år, for 1967-1970 er den 69 år, og for personer født efter 1970 forventes den at stige til 70+ år.",
  },
  {
    question: "Hvor meget skal jeg spare op til pension?",
    answer:
      "En tommelfingerregel er at spare 12-17% af din bruttoløn til pension. De fleste har brug for 60-80% af deres arbejdsindkomst som pensionist for at bevare deres levestandard.",
  },
  {
    question: "Hvad er forskellen på ratepension og aldersopsparing?",
    answer:
      "Ratepension giver fradrag ved indbetaling (op til 63.100 kr/år i 2026) men beskattes ved udbetaling. Aldersopsparing giver ikke fradrag, men udbetales skattefrit. Max indbetaling til aldersopsparing er 5.900 kr/år i 2026.",
  },
  {
    question: "Hvad er ATP pension?",
    answer:
      "ATP er en obligatorisk pension for alle lønmodtagere i Danmark. Den livslange udbetaling ligger typisk på 2.000-3.000 kr/md afhængig af dine indbetalinger gennem arbejdslivet.",
  },
  {
    question: "Kan jeg se alle mine pensioner ét sted?",
    answer:
      "Ja, på PensionsInfo.dk kan du logge ind med MitID og se et samlet overblik over alle dine pensionsordninger, herunder folkepension, ATP, arbejdsmarkedspension og private opsparinger.",
  },
  {
    question: "Beskattes pension ved udbetaling?",
    answer:
      "Det afhænger af pensionstypen. Ratepension og livrente beskattes som personlig indkomst. Aldersopsparing udbetales skattefrit. Folkepension beskattes som personlig indkomst.",
  },
  {
    question: "Hvad er en livrente?",
    answer:
      "En livrente er en pensionsordning der udbetales livslangt. Den beskytter mod at du 'løber tør' for penge. Til gengæld kan du ikke arve den resterende opsparing, som du kan med ratepension.",
  },
];

export default function PensionPage() {
  return (
    <div>
      <CalculatorSchema
        name="Pensionsberegner - Beregn din pension"
        description="Gratis pensionsberegner. Beregn hvad du kan få udbetalt som pensionist baseret på din opsparing, afkast og folkepension."
        url={`${baseUrl}/pension`}
        category="FinanceApplication"
      />
      <FAQSchema items={pensionFaqItems} />
      <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Pensionsberegner", href: "/pension" }]} />
      <h1 className="text-3xl font-bold mb-2">Pensionsberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn hvad du kan forvente at få udbetalt som pensionist baseret på din opsparing og de forventede afkast.
      </p>

      <PensionBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Pension i Danmark - et overblik</h2>
        <p>
          Det danske <strong>pensionssystem</strong> består af <strong>tre søjler</strong>:
        </p>
        <ol>
          <li><strong>Folkepension + ATP:</strong> Staten betaler til alle (ca. 13.000-15.000 kr/måned)</li>
          <li><strong>Arbejdsmarkedspension:</strong> Indbetalt via din arbejdsgiver (typisk 12-17% af løn)</li>
          <li><strong>Privat pension:</strong> Din egen opsparing (ratepension, aldersopsparing, frie midler)</li>
        </ol>

        <h2>Folkepension (2026)</h2>
        <p>
          Alle danske statsborgere med bopæl i Danmark har ret til <strong>folkepension</strong> fra <strong>folkepensionsalderen</strong> (pt. 68 år).
        </p>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Beløb/måned (ca.)</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Grundbeløb</td>
              <td>7.544 kr</td>
              <td>Afhænger af ophold i DK</td>
            </tr>
            <tr>
              <td>Pensionstillæg (enlig)</td>
              <td>8.729 kr</td>
              <td>Modregnes i anden indkomst</td>
            </tr>
            <tr>
              <td>Pensionstillæg (samboende)</td>
              <td>4.367 kr</td>
              <td>Modregnes i anden indkomst</td>
            </tr>
            <tr>
              <td>ATP livslang</td>
              <td>2.000-3.000 kr</td>
              <td>Afhænger af indbetalinger</td>
            </tr>
          </tbody>
        </table>

        <h2>Arbejdsmarkedspension</h2>
        <p>
          De fleste danskere har <strong>arbejdsmarkedspension</strong> via deres ansættelse. Typiske satser:
        </p>
        <ul>
          <li><strong>Arbejdsgiver:</strong> 8-12% af din løn</li>
          <li><strong>Din egen andel:</strong> 4-5% af din løn</li>
          <li><strong>Total:</strong> 12-17% af din bruttoløn</li>
        </ul>
        <p>
          <strong>Eksempel:</strong> Med <strong>40.000 kr/måned</strong> i løn og <strong>15% pension</strong> indbetales <strong>6.000 kr/måned</strong>.
        </p>

        <h2>Pensionstyper</h2>

        <h3>Ratepension</h3>
        <ul>
          <li>Udbetales over 10-30 år</li>
          <li>Beskattes som almindelig indkomst ved udbetaling</li>
          <li>Fradrag for indbetalinger (op til 63.100 kr/år i 2026)</li>
        </ul>

        <h3>Aldersopsparing</h3>
        <ul>
          <li>Udbetales skattefrit</li>
          <li>Ingen fradrag for indbetalinger</li>
          <li>Max 5.900 kr/år (2026)</li>
        </ul>

        <h3>Livrente</h3>
        <ul>
          <li>Livslang udbetaling</li>
          <li>Beskytter mod at "løbe tør"</li>
          <li>Beskattes som almindelig indkomst</li>
        </ul>

        <h2>Hvornår kan du gå på pension?</h2>
        <table>
          <thead>
            <tr>
              <th>Født</th>
              <th>Folkepensionsalder</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Før 1963</td>
              <td>65-67 år</td>
            </tr>
            <tr>
              <td>1963-1966</td>
              <td>68 år</td>
            </tr>
            <tr>
              <td>1967-1970</td>
              <td>69 år</td>
            </tr>
            <tr>
              <td>Efter 1970</td>
              <td>70+ år (forventes)</td>
            </tr>
          </tbody>
        </table>
        <p>
          Du kan typisk gå på <strong>tidlig pension</strong> (opsparingsbaseret) fra <strong>5 år før folkepensionsalderen</strong>,
          men <strong>folkepensionen</strong> starter først ved den officielle alder.
        </p>

        <h2>Tips til pensionsplanlægning</h2>
        <ul>
          <li><strong>Start tidligt:</strong> Renters rente virker bedst over mange år</li>
          <li><strong>Udnyt fradrag:</strong> Ratepension giver skattefradrag nu</li>
          <li><strong>Diversificer:</strong> Bland aktier og obligationer efter alder</li>
          <li><strong>Tjek dine pensioner:</strong> <a href="https://www.pensionsinfo.dk" target="_blank" rel="noopener">PensionsInfo.dk</a></li>
          <li><strong>Overvej tidlig pension:</strong> Kræver ekstra opsparing</li>
        </ul>

        <h2>Tommelfingerregler</h2>
        <ul>
          <li><strong>Hvor meget skal du spare?</strong> Ca. 12-17% af din løn</li>
          <li><strong>Hvad kan du leve af?</strong> De fleste har brug for 60-80% af deres arbejdsindkomst</li>
          <li><strong>Aktieandel:</strong> 100 minus din alder (30-årig = 70% aktier)</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat til orientering. Pensionsregler ændres løbende, og 
            individuelle forhold varierer. Kontakt din pensionskasse eller en rådgiver for 
            personlig vejledning.
          </p>
        </div>

        <h2>Nyttige links</h2>
        <ul>
          <li><a href="https://www.pensionsinfo.dk" target="_blank" rel="noopener">PensionsInfo.dk</a> - Se alle dine pensioner samlet</li>
          <li><a href="https://www.borger.dk/pension-og-efterloen" target="_blank" rel="noopener">Borger.dk</a> - Officiel info om pension</li>
          <li><a href="https://www.atp.dk" target="_blank" rel="noopener">ATP.dk</a> - Din ATP-pension</li>
        </ul>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ofte stillede spørgsmål om pension
        </h2>
        <FAQ items={pensionFaqItems} />
      </section>

      <section className="mt-12">
        <RelatedCalculators current="/pension" />
      </section>
    </div>
  );
}
