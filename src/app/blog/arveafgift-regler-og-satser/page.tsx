import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Arveafgift i Danmark: Regler, satser og eksempler | MinBeregner.dk",
    description:
      "Komplet guide til arveafgift (boafgift) i 2026: Bundfradrag, satser for nære og fjerne arvinger, tillægsafgift og beregningseksempler.",
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
      title: "Arveafgift i Danmark: Regler, satser og eksempler",
      description: "Alt om arveafgift i 2026 — satser, bundfradrag og beregning.",
      url: `${baseUrl}/blog/arveafgift-regler-og-satser`,
      type: "article",
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
      "Boafgiften er 15% for nære arvinger (børn, børnebørn, forældre) og 15% + 25% tillægsafgift for fjerne arvinger (søskende, venner). Ægtefæller betaler ingen arveafgift.",
  },
  {
    question: "Hvad er bundfradraget for arveafgift i 2026?",
    answer:
      "Bundfradraget (det afgiftsfri beløb) er 392.300 kr i 2026. Det gælder per bo, ikke per arving. Boafgift beregnes kun af beløbet over bundfradraget.",
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
            Arveafgift i Danmark: Regler, satser og eksempler
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
                <td>15%</td>
                <td>0%</td>
                <td>15%</td>
              </tr>
              <tr>
                <td>Stedbørn, svigerbørn</td>
                <td>15%</td>
                <td>0%</td>
                <td>15%</td>
              </tr>
              <tr>
                <td>Søskende, niecer, nevøer</td>
                <td>15%</td>
                <td>25%</td>
                <td>36,25%</td>
              </tr>
              <tr>
                <td>Venner, andre</td>
                <td>15%</td>
                <td>25%</td>
                <td>36,25%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Bundfradraget</h2>
        <p>
          I 2026 er bundfradraget <strong>392.300 kr per bo</strong>. Det betyder, at der først skal
          betales boafgift af den del af arven, der overstiger 392.300 kr. Bundfradraget gælder
          for hele boet — ikke per arving.
        </p>

        <h2>Sådan beregnes arveafgiften</h2>
        <h3>Eksempel 1: Arv til børn</h3>
        <p>
          En forælder efterlader 1.500.000 kr til sine to børn:
        </p>
        <ol>
          <li>Bobeholdning: 1.500.000 kr</li>
          <li>Bundfradrag: -392.300 kr</li>
          <li>Afgiftspligtigt beløb: 1.107.700 kr</li>
          <li>Boafgift (15%): 166.155 kr</li>
          <li>Til fordeling mellem børn: 1.333.845 kr (666.923 kr hver)</li>
        </ol>

        <h3>Eksempel 2: Arv til søskende</h3>
        <p>
          En person efterlader 800.000 kr til sin bror:
        </p>
        <ol>
          <li>Bobeholdning: 800.000 kr</li>
          <li>Bundfradrag: -392.300 kr</li>
          <li>Afgiftspligtigt beløb: 407.700 kr</li>
          <li>Boafgift (15%): 61.155 kr</li>
          <li>Rest efter boafgift: 346.545 kr</li>
          <li>Tillægsafgift (25% af rest): 86.636 kr</li>
          <li>Samlet afgift: 147.791 kr</li>
          <li>Arving modtager: 652.209 kr</li>
        </ol>

        <h2>Ægtefæller: Ingen arveafgift</h2>
        <p>
          Ægtefæller er helt fritaget for arveafgift. Derudover kan en efterlevende ægtefælle
          sidde i uskiftet bo, hvilket udskyder arveopgøret og dermed afgiften.
        </p>

        <h2>Gaver i levende live</h2>
        <p>
          Du kan give afgiftsfri gaver til nære familiemedlemmer op til en vis grænse hvert år:
        </p>
        <ul>
          <li><strong>Børn og børnebørn:</strong> Op til 74.100 kr/år (2026) afgiftsfrit</li>
          <li><strong>Svigerbørn:</strong> Op til 26.600 kr/år (2026) afgiftsfrit</li>
          <li><strong>Ægtefæller:</strong> Ubegrænset afgiftsfrit</li>
        </ul>
        <p>
          Gaver over disse beløb beskattes med 15% gaveafgift.
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
