import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Skat 2026: Alt du skal vide om skatteændringer | MinBeregner.dk",
    description:
      "Komplet overblik over skat i 2026: Nye satser for personfradrag, topskat, AM-bidrag, kommuneskat og beskæftigelsesfradrag. Se hvad det betyder for din løn.",
    keywords: [
      "skat 2026",
      "skatteændringer 2026",
      "personfradrag 2026",
      "topskat 2026",
      "kommuneskat 2026",
      "skattesatser 2026",
      "AM-bidrag 2026",
      "beskæftigelsesfradrag 2026",
    ],
    openGraph: {
      title: "Skat 2026: Alt du skal vide om skatteændringer",
      description:
        "Komplet overblik over skat i 2026 — personfradrag, topskat, kommuneskat og mere.",
      url: `${baseUrl}/blog/skat-2026-alt-du-skal-vide`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/skat-2026-alt-du-skal-vide`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er personfradraget i 2026?",
    answer:
      "Personfradraget (bundfradraget) er 49.700 kr i 2026. Det betyder, at du ikke betaler skat af de første 49.700 kr af din indkomst.",
  },
  {
    question: "Hvornår betaler man topskat i 2026?",
    answer:
      "Du betaler topskat i 2026, når din personlige indkomst efter AM-bidrag overstiger 588.900 kr. Topskattesatsen er 15%.",
  },
  {
    question: "Hvor meget er AM-bidraget i 2026?",
    answer:
      "AM-bidraget (arbejdsmarkedsbidraget) er 8% i 2026. Det trækkes af din bruttoløn, før der beregnes skat.",
  },
];

export default function Skat2026GuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Skat 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Økonomi & Skat</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Skat 2026: Alt du skal vide om skatteændringer
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Hvert år justeres skattesatser og fradrag i Danmark. I 2026 er der sket flere ændringer, der påvirker
          din lønseddel. I denne guide giver vi dig et komplet overblik over de vigtigste skatteændringer, så du
          ved præcist, hvad du betaler — og hvad du kan trække fra.
        </p>

        <h2>Oversigt: Skattesatser 2026</h2>
        <p>
          Her er de vigtigste skattesatser og beløbsgrænser for 2026:
        </p>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Skat/fradrag</th>
                <th>Sats/beløb 2026</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AM-bidrag</td>
                <td>8%</td>
              </tr>
              <tr>
                <td>Personfradrag</td>
                <td>49.700 kr</td>
              </tr>
              <tr>
                <td>Bundskat</td>
                <td>12,09%</td>
              </tr>
              <tr>
                <td>Topskat</td>
                <td>15% (over 588.900 kr)</td>
              </tr>
              <tr>
                <td>Gennemsnitlig kommuneskat</td>
                <td>ca. 25,1%</td>
              </tr>
              <tr>
                <td>Beskæftigelsesfradrag (max)</td>
                <td>45.100 kr</td>
              </tr>
              <tr>
                <td>Kirkeskat (gennemsnit)</td>
                <td>ca. 0,88%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>AM-bidrag: Det første der trækkes</h2>
        <p>
          Arbejdsmarkedsbidraget (AM-bidraget) er det allerførste, der trækkes af din bruttoløn. I 2026 er
          AM-bidraget <strong>8%</strong>. Det gælder al lønindkomst og beregnes før alle andre skatter og fradrag.
        </p>
        <p>
          Tjener du fx 35.000 kr brutto om måneden, betaler du 2.800 kr i AM-bidrag. De resterende 32.200 kr
          er din personlige indkomst, som danner grundlag for den øvrige skatteberegning.
        </p>

        <h2>Personfradraget: Din skattefri bundgrænse</h2>
        <p>
          Personfradraget er det beløb, du kan tjene skattefrit. I 2026 er personfradraget <strong>49.700 kr
          om året</strong> for voksne over 18 år. For unge under 18 er fradraget lavere (39.300 kr).
        </p>
        <p>
          Personfradraget modregnes i din skat — ikke i din indkomst. Det svarer til en skattebesparelse
          på ca. 18.500 kr årligt (afhængigt af din kommune).
        </p>

        <h2>Kommuneskat: Stor forskel på din adresse</h2>
        <p>
          Kommuneskatten varierer fra ca. <strong>22,5% til 27,8%</strong> afhængigt af, hvilken kommune du
          bor i. Den gennemsnitlige kommuneskat i 2026 er ca. 25,1%.
        </p>
        <p>
          De billigste kommuner (fx Rudersdal, Gentofte) ligger omkring 22,5-23%, mens de dyreste (fx
          Langeland, Brønderslev) ligger over 27%. Forskellen kan betyde tusindvis af kroner om året.
        </p>
        <p>
          Vil du se den præcise forskel?{" "}
          <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">
            Prøv vores løn efter skat-beregner
          </Link>{" "}
          og sammenlign din nettoløn i forskellige kommuner.
        </p>

        <h2>Bundskat og topskat</h2>
        <p>
          <strong>Bundskattesatsen</strong> er 12,09% i 2026 og beregnes af din personlige indkomst efter
          AM-bidrag, minus personfradraget.
        </p>
        <p>
          <strong>Topskattegrænsen</strong> er 588.900 kr i 2026. Tjener du mere end dette beløb (efter
          AM-bidrag), betaler du 15% i topskat af det overskydende beløb. Det giver en effektiv
          marginalskat på ca. 52-56% for topskatte-ydere, afhængigt af kommune og kirkeskat.
        </p>

        <h2>Beskæftigelsesfradrag</h2>
        <p>
          Beskæftigelsesfradraget gives automatisk til alle, der arbejder. I 2026 er det <strong>10,65%</strong> af
          din arbejdsindkomst, dog med et loft på <strong>45.100 kr</strong>. Det svarer til en skattebesparelse
          på ca. 11.000-17.000 kr årligt afhængigt af indkomst og kommune.
        </p>
        <p>
          Du behøver ikke gøre noget for at få fradraget — det beregnes automatisk af SKAT.
        </p>

        <h2>Skattefradrag du selv skal huske</h2>
        <p>
          Udover de automatiske fradrag er der en række fradrag, du selv skal sikre dig:
        </p>
        <ul>
          <li><strong>Rentefradrag:</strong> Fradrag for renter på lån (bolig, bil, forbrugslån). Brug vores{" "}
            <Link href="/rentefradrag" className="text-blue-600 hover:underline">rentefradrag-beregner</Link>.
          </li>
          <li><strong>Kørselsfradrag:</strong> Fradrag for transport mellem hjem og arbejde over 24 km.</li>
          <li><strong>Fagforening og A-kasse:</strong> Kontingent kan fradrages (op til 7.000 kr for A-kasse).</li>
          <li><strong>Håndværkerfradrag:</strong> Op til 12.900 kr for serviceydelser i hjemmet.</li>
          <li><strong>Pension:</strong> Indbetalinger til ratepension og livrente er fradragsberettigede.</li>
        </ul>

        <h2>Sådan beregner du din skat trin for trin</h2>
        <p>
          Lad os tage et eksempel med en månedsløn på 40.000 kr i en gennemsnitlig kommune:
        </p>
        <ol>
          <li><strong>AM-bidrag:</strong> 40.000 × 8% = 3.200 kr</li>
          <li><strong>Personlig indkomst:</strong> 40.000 - 3.200 = 36.800 kr</li>
          <li><strong>Bundskat:</strong> (36.800 - 4.142*) × 12,09% ≈ 3.946 kr</li>
          <li><strong>Kommuneskat:</strong> (36.800 - 4.142*) × 25,1% ≈ 8.197 kr</li>
          <li><strong>Beskæftigelsesfradrag:</strong> Reducerer skatten med ca. 1.100 kr/md</li>
          <li><strong>Nettoudbetaling:</strong> ca. 26.000-27.000 kr</li>
        </ol>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          * Personfradrag 49.700 kr / 12 måneder = 4.142 kr/md
        </p>
        <p>
          Er du i tvivl om din konkrete skat?{" "}
          <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">
            Brug vores løn efter skat-beregner
          </Link>{" "}
          til at få et præcist estimat.
        </p>

        <h2>Hvad ændrede sig fra 2025 til 2026?</h2>
        <p>
          De fleste skattesatser reguleres årligt med satsreguleringsprocenten. Fra 2025 til 2026 er
          de vigtigste ændringer:
        </p>
        <ul>
          <li>Personfradraget er steget fra ca. 48.000 kr til 49.700 kr</li>
          <li>Topskattegrænsen er steget fra ca. 568.900 kr til 588.900 kr</li>
          <li>Beskæftigelsesfradragets loft er steget fra ca. 43.500 kr til 45.100 kr</li>
          <li>AM-bidraget er uændret 8%</li>
          <li>Bundskattesatsen er uændret 12,09%</li>
        </ul>
        <p>
          Samlet set betyder det en lille skattelettelse for de fleste lønmodtagere — typisk 200-500 kr
          mere udbetalt om måneden.
        </p>

        <h2>Tips til at optimere din skat</h2>
        <ul>
          <li><strong>Tjek din forskudsopgørelse:</strong> Log ind på skat.dk og sikr dig, at dine fradrag er korrekte</li>
          <li><strong>Indbetal til pension:</strong> Ratepension giver fradrag nu og beskattes lavere ved udbetaling</li>
          <li><strong>Udnyt rentefradraget:</strong> Har du boliglån? Sørg for at renter er korrekt indberettet</li>
          <li><strong>Kørselsfradrag:</strong> Mange glemmer at opgive fradrag for lang transport</li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn din skat</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores <Link href="/loen-efter-skat" className="underline font-medium">løn efter skat-beregner</Link> til
            at se præcist, hvad du får udbetalt med 2026-satser. Du kan også beregne dit{" "}
            <Link href="/rentefradrag" className="underline font-medium">rentefradrag</Link> og se dine{" "}
            <Link href="/feriepenge" className="underline font-medium">feriepenge</Link>.
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
          <Link href="/blog/guide-til-laan-og-renter" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Guide til lån og renter →</span>
          </Link>
          <Link href="/blog/saadan-beregner-du-din-reelle-timeloen" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Beregn din reelle timeløn →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
