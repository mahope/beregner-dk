import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { SATSER_2026 } from "@/lib/satser-2026";

const BUNDFRADRAG = SATSER_2026.arveBundfradrag;
const BOAFGIFT_PCT = Math.round(SATSER_2026.boafgift * 100);
const TILLAEGS_PCT = Math.round(SATSER_2026.tillaegsboafgift * 100);
const BUND_FAEDRET = new Intl.NumberFormat("da-DK").format(BUNDFRADRAG);
// 15 % boafgift + 25 % tillægsafgift af resten = 36,25 % af afgiftsgrundlaget
const EFFEKTIV_PCT = Math.round(
  (SATSER_2026.boafgift +
    SATSER_2026.tillaegsboafgift * (1 - SATSER_2026.boafgift)) *
    10000,
) / 100;

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.",
    description:
      "Arveafgift (boafgift) 2026: Et barn arver 1 mio. kr. og betaler 91.155 kr. Se bundfradrag på 392.300 kr, 15 % for nære arvinger og 36,25 % for søskende.",
    keywords: [
      "arveafgift 2026",
      "boafgift 2026",
      "arveafgift satser",
      "bundfradrag arv",
      "tillægsafgift",
      "arv skat",
      "arveafgift beregner",
      "boafgift beregning",
    ],
    openGraph: {
      title: "Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.",
      description:
        "Arveafgift 2026: 91.155 kr for et barn der arver 1 mio. kr. Bundfradrag, satser og to regneeksempler.",
      url: `${baseUrl}/blog/arveafgift-regler-og-satser`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/arveafgift-regler-og-satser`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er arveafgiften i Danmark i 2026?",
    answer:
      "Boafgiften er 15 % for nære arvinger (børn, børnebørn, forældre). Søskende og andre fjere arvinger betaler 15 % boafgift plus 25 % tillægsafgift af beløbet efter boafgift, svarende til 36,25 % af afgiftsgrundlaget. Ægtefæller betaler ingen arveafgift.",
  },
  {
    question: "Hvad er bundfradraget for arveafgift i 2026?",
    answer: `Bundfradraget (det afgiftsfri beløb) er ${BUND_FAEDRET} kr i 2026. Det gælder per bo, ikke per arving. Boafgift beregnes kun af beløbet over bundfradraget.`,
  },
  {
    question: "Hvad koster arveafgiften, hvis et barn arver 1.000.000 kr?",
    answer: `Barnet arver 1.000.000 kr. Bundfradraget er ${BUND_FAEDRET} kr, så afgiftsgrundlaget er 607.700 kr. Afgiften er 15 % = 91.155 kr, og barnet modtager 908.845 kr.`,
  },
  {
    question: "Betaler ægtefæller arveafgift?",
    answer:
      "Nej, ægtefæller er fritaget for arveafgift. En ægtefælle kan arve ubegrænset uden at betale boafgift eller tillægsafgift.",
  },
];

export default function ArveafgiftGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Arveafgift</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Arv & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Når en person dør i Danmark, skal der betales afgift af arven — den såkaldte boafgift
          (populært kaldet arveafgift). Reglerne kan virke komplicerede, men i denne guide
          gennemgår vi satserne, bundfradraget og giver konkrete beregningseksempler.
        </p>

        <p>
          <strong>Kort svar:</strong> Et barn, der arver 1.000.000 kr, betaler{" "}
          <strong>91.155 kr i arveafgift</strong> — fordi bundfradraget er{" "}
          {BUND_FAEDRET} kr, og resten (607.700 kr) beskattes med {BOAFGIFT_PCT} %.
          Søskende og andre fjere arvinge betaler {BOAFGIFT_PCT} % boafgift plus{" "}
          {TILLAEGS_PCT} % tillægsafgift af beløbet efter boafgift, svarende til{" "}
          {EFFEKTIV_PCT} % af afgiftsgrundlaget. Ægtefæller betaler ingen arveafgift.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn arveafgiften for dit bo</p>
          <p className="text-blue-700 dark:text-blue-400">
            <Link href="/arveafgift" className="underline font-medium">Arveafgift-beregneren</Link>{" "}
            regner bundfradrag, boafgift og tillægsafgift for præcis den arvingstype, du vælger.
          </p>
        </div>

        <h2>Arveafgift-satser 2026</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Arving</th>
                <th>Boafgift</th>
                <th>Tillægsafgift</th>
                <th>Samlet afgift</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ægtefælle</td>
                <td>0%</td>
                <td>0%</td>
                <td>0%</td>
              </tr>
              <tr>
                <td>Børn, børnebørn, forældre</td>
                <td>{BOAFGIFT_PCT}%</td>
                <td>0%</td>
                <td>{BOAFGIFT_PCT}%</td>
              </tr>
              <tr>
                <td>Stedbørn, svigerbørn</td>
                <td>{BOAFGIFT_PCT}%</td>
                <td>0%</td>
                <td>{BOAFGIFT_PCT}%</td>
              </tr>
              <tr>
                <td>Søskende, niecer, nevøer</td>
                <td>{BOAFGIFT_PCT}%</td>
                <td>{TILLAEGS_PCT}% af beløbet efter boafgift</td>
                <td>{EFFEKTIV_PCT}%</td>
              </tr>
              <tr>
                <td>Venner, andre</td>
                <td>{BOAFGIFT_PCT}%</td>
                <td>{TILLAEGS_PCT}% af beløbet efter boafgift</td>
                <td>{EFFEKTIV_PCT}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Bundfradraget</h2>
        <p>
          I 2026 er bundfradraget <strong>{BUND_FAEDRET} kr per bo</strong>. Det betyder, at der først skal
          betales boafgift af den del af arven, der overstiger {BUND_FAEDRET} kr. Bundfradraget gælder
          for hele boet — ikke per arving.
        </p>

        <h2>Sådan beregnes arveafgiften</h2>
        <h3>Eksempel 1: Arv til børn</h3>
        <p>
          En forælder efterlader 1.500.000 kr til sine to børn:
        </p>
        <ol>
          <li>Bobeholdning: 1.500.000 kr</li>
          <li>Bundfradrag: −{BUND_FAEDRET} kr</li>
          <li>Afgiftspligtigt beløb: 1.107.700 kr</li>
          <li>Boafgift ({BOAFGIFT_PCT}%): 166.155 kr</li>
          <li>Til fordeling mellem børn: 1.333.845 kr (ca. 666.923 kr hver)</li>
        </ol>

        <h3>Eksempel 2: Arv til søskende</h3>
        <p>
          En person efterlader 800.000 kr til sin bror. Søskende betaler boafgift{" "}
          {BOAFGIFT_PCT} % og tillægsafgift {TILLAEGS_PCT} % af beløbet <em>efter</em> boafgift. Der
          er intet bundfradrag for tillægsafgiften:
        </p>
        <ol>
          <li>Bobeholdning: 800.000 kr</li>
          <li>Bundfradrag: −{BUND_FAEDRET} kr</li>
          <li>Afgiftspligtigt beløb: 407.700 kr</li>
          <li>Boafgift ({BOAFGIFT_PCT}%): 61.155 kr</li>
          <li>Beløb efter boafgift: 738.845 kr</li>
          <li>Tillægsafgift ({TILLAEGS_PCT}%): 184.711 kr</li>
          <li>Samlet afgift: 245.866 kr</li>
          <li>Arving modtager: 554.134 kr</li>
        </ol>

        <h2>Ægtefæller: Ingen arveafgift</h2>
        <p>
          Ægtefæller er helt fritaget for arveafgift. Derudover kan en efterlevende ægtefælle
          sidde i uskiftet bo, hvilket udskyder arveopgøret og dermed afgiften.
        </p>

        <h2>Gaver i levende live</h2>
        <p>
          Gaver til nære familiemedlemmer kan gives afgiftsfrit op til en vis grænse hvert år:
        </p>
        <ul>
          <li><strong>Børn og børnebørn:</strong> Op til 74.100 kr/år (2026) afgiftsfrit</li>
          <li><strong>Svigerbørn:</strong> Op til 26.600 kr/år (2026) afgiftsfrit</li>
          <li><strong>Ægtefæller:</strong> Ubegrænset afgiftsfrit</li>
        </ul>
        <p>
          Gavegrænserne og reglerne for gaver <em>over</em> grænsen fastsættes af
          Skattestyrelsen og ændrer sig ikke på samme måde som boafgiftssatserne. Tjek deres
          side om gaveafgift, før du regner på en gave over grænsen.
        </p>

        <h2>Pensioner og forsikringer</h2>
        <p>
          Visse pensioner og forsikringer indgår ikke i boet, men udbetales direkte til
          begunstigede. De beskattes efter pensionsbeskatningsreglerne (typisk 40% afgift)
          i stedet for boafgiftsreglerne. Tjek din{" "}
          <Link href="/pension" className="text-blue-600 hover:underline">pensionsordning</Link> for
          at se, hvem der er begunstiget.
        </p>

        <h2>Bobehandling: Privat skifte vs. bobestyrer</h2>
        <ul>
          <li><strong>Privat skifte:</strong> Arvingerne håndterer selv boet. Billigere, men kræver enighed.</li>
          <li><strong>Bobestyrer:</strong> En advokat udpeget af skifteretten håndterer boet. Dyrere, men nemmere ved uenighed.</li>
        </ul>

        <h2>Tips til planlægning</h2>
        <ul>
          <li><strong>Giv gaver løbende:</strong> Udnyt den årlige afgiftsfri gavegrænse for at reducere boet</li>
          <li><strong>Lav testamente:</strong> Sikr at din arv fordeles som ønsket</li>
          <li><strong>Tjek pensionsbegunstigede:</strong> Sørg for at de rigtige er indsat som begunstigede</li>
          <li><strong>Overvej uskiftet bo:</strong> Kan give den efterlevende ægtefælle økonomisk ro</li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn arveafgift</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores <Link href="/arveafgift" className="underline font-medium">arveafgift-beregner</Link> til at
            se den præcise afgift for din situation. Se også{" "}
            <Link href="/pension" className="underline font-medium">pensionsberegneren</Link> og{" "}
            <Link href="/opsparing" className="underline font-medium">opsparingsberegneren</Link>.
          </p>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/pension-hvor-meget-skal-du-spare-op" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Pension: Hvor meget skal du spare op? →</span>
          </Link>
          <Link href="/blog/fradrag-2026-komplet-guide" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Fradrag 2026: Komplet guide →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
