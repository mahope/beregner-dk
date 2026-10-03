import BlogArticleSchema from "@/components/BlogArticleSchema";
import { NaesteSkridt } from "@/components/BlogNaesteSkridt";
import { FAQSchema } from "@/components/StructuredData";
import { EKSEMPEL_BARN, EKSEMPLER_GUIDE } from "@/lib/arveafgift";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";
import { SATSER_2026 } from "@/lib/satser-2026";
import type { Metadata } from "next";
import Link from "next/link";

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

/**
 * Hele kroner i dansk skrivemåde.
 *
 * Beløbene i brødteksten er bruttotaler — bundfradraget trækkes fra først, og
 * tillægsafgiften af *resten* efter boafgift giver derfor altid brøkdele. De
 * skrives med `Math.round` fordi artiklen hele vejen regner i hele kroner, så
 * læseren kan læge tallene sammen: 800.000 − 245.866 = 554.134.
 */
const kr = (belob: number) => Math.round(belob).toLocaleString("da-DK");

/** Procent med dansk decimalkomma. Uden den skrev sats-tabellen `36.25%`. */
const pct = (andel: number) => andel.toLocaleString("da-DK");

/**
 * «1 mio. kr.», så titel og beskrivelse ikke skriver arvebeløbet for sig. Den
 * afledes af `EKSEMPEL_BARN.arv`, så et nyt eksempelbeløb ikke kan efterlade en
 * «1 mio. kr.» der ikke længere passer.
 */
const krMio = (belob: number) => `${Math.round(belob / 1_000_000)} mio. kr.`;

// Arvbeløbene i de to regneeksempler nedenfor. `/arveafgift`s guideboks lover at
// indlægget viser «to fulde regneeksempler på 1.500.000 kr til børn og 800.000
// kr til en søskende», så beløbene har samme ejer som den påstand.
const GUIDE_BARN_TEKST = EKSEMPLER_GUIDE.barn.arv.toLocaleString("da-DK");
const GUIDE_SOESKENDE_TEKST = EKSEMPLER_GUIDE.soeskende.arv.toLocaleString("da-DK");

// Det beløb, der er tilbage når boafgiften er betalt. Regnestykket for
// søskende har den som sit eget led («Beløb efter boafgift»), og tillægsafgiften
// er netop 25 % af *dette* — ikke af afgiftsgrundlaget.
const SOESKENDE_EFTER_BOAFGIFT = EKSEMPLER_GUIDE.soeskende.arv - EKSEMPLER_GUIDE.soeskende.boafgift;

// Titel og beskrivelse er de strenge Google får, så de læses fra de samme tal
// som brødteksten. De skal være byte-uændrede — de er rigtige — men de må ikke
// blive stående, når bundfradraget stiger.
const TITEL = `Arveafgift 2026: ${krMio(EKSEMPEL_BARN.arv)} til børn koster ${kr(EKSEMPEL_BARN.boafgift)} kr.`;
const BESKRIVELSE =
  `Arveafgift (boafgift) 2026: Et barn arver ${krMio(EKSEMPEL_BARN.arv)} og betaler ` +
  `${kr(EKSEMPEL_BARN.boafgift)} kr. Se bundfradrag på ${BUND_FAEDRET} kr, ` +
  `${pct(BOAFGIFT_PCT)} % for nære arvinger og ${pct(EFFEKTIV_PCT)} % for søskende.`;

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: { absolute: TITEL },
    description: BESKRIVELSE,
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
      images: OG_IMAGE,
      title: TITEL,
      description:
        `Arveafgift 2026: ${kr(EKSEMPEL_BARN.boafgift)} kr for et barn der arver ` +
        `${krMio(EKSEMPEL_BARN.arv)} Bundfradrag, satser og to regneeksempler.`,
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
    answer: `Boafgiften er ${pct(BOAFGIFT_PCT)} % for nære arvinger (børn, børnebørn, forældre). Søskende og andre fjere arvinger betaler ${pct(BOAFGIFT_PCT)} % boafgift plus ${pct(TILLAEGS_PCT)} % tillægsafgift af beløbet efter boafgift, svarende til ${pct(EFFEKTIV_PCT)} % af afgiftsgrundlaget. Ægtefæller betaler ingen arveafgift.`,
  },
  {
    question: "Hvad er bundfradraget for arveafgift i 2026?",
    answer: `Bundfradraget (det afgiftsfri beløb) er ${BUND_FAEDRET} kr i 2026. Det gælder per bo, ikke per arving. Boafgift beregnes kun af beløbet over bundfradraget.`,
  },
  {
    question: `Hvad koster arveafgiften, hvis et barn arver ${kr(EKSEMPEL_BARN.arv)} kr?`,
    answer: `Barnet arver ${kr(EKSEMPEL_BARN.arv)} kr. Bundfradraget er ${BUND_FAEDRET} kr, så afgiftsgrundlaget er ${kr(EKSEMPEL_BARN.grundlag)} kr. Afgiften er ${pct(BOAFGIFT_PCT)} % = ${kr(EKSEMPEL_BARN.boafgift)} kr, og barnet modtager ${kr(EKSEMPEL_BARN.modtager)} kr.`,
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
      <BlogArticleSchema
        slug="arveafgift-regler-og-satser"
        title={TITEL}
        description={BESKRIVELSE}
      />
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
            {TITEL}
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
          <strong>Kort svar:</strong> Et barn, der arver {kr(EKSEMPEL_BARN.arv)} kr, betaler{" "}
          <strong>{kr(EKSEMPEL_BARN.boafgift)} kr i arveafgift</strong> — fordi bundfradraget er{" "}
          {BUND_FAEDRET} kr, og resten ({kr(EKSEMPEL_BARN.grundlag)} kr) beskattes med {pct(BOAFGIFT_PCT)} %.
          Søskende og andre fjere arvinge betaler {pct(BOAFGIFT_PCT)} % boafgift plus{" "}
          {pct(TILLAEGS_PCT)} % tillægsafgift af beløbet efter boafgift, svarende til{" "}
          {pct(EFFEKTIV_PCT)} % af afgiftsgrundlaget. Ægtefæller betaler ingen arveafgift.
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
                <td>{pct(BOAFGIFT_PCT)} %</td>
                <td>0%</td>
                <td>{pct(BOAFGIFT_PCT)} %</td>
              </tr>
              <tr>
                <td>Stedbørn, svigerbørn</td>
                <td>{pct(BOAFGIFT_PCT)} %</td>
                <td>0%</td>
                <td>{pct(BOAFGIFT_PCT)} %</td>
              </tr>
              <tr>
                <td>Søskende, niecer, nevøer</td>
                <td>{pct(BOAFGIFT_PCT)} %</td>
                <td>{pct(TILLAEGS_PCT)} % af beløbet efter boafgift</td>
                <td>{pct(EFFEKTIV_PCT)} %</td>
              </tr>
              <tr>
                <td>Venner, andre</td>
                <td>{pct(BOAFGIFT_PCT)} %</td>
                <td>{pct(TILLAEGS_PCT)} % af beløbet efter boafgift</td>
                <td>{pct(EFFEKTIV_PCT)} %</td>
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
          En forælder efterlader {GUIDE_BARN_TEKST} kr til sine to børn:
        </p>
        <ol>
          <li>Bobeholdning: {GUIDE_BARN_TEKST} kr</li>
          <li>Bundfradrag: −{BUND_FAEDRET} kr</li>
          <li>Afgiftspliktigt beløb: {kr(EKSEMPLER_GUIDE.barn.grundlag)} kr</li>
          <li>Boafgift ({pct(BOAFGIFT_PCT)} %): {kr(EKSEMPLER_GUIDE.barn.boafgift)} kr</li>
          <li>
            Til fordeling mellem børn: {kr(EKSEMPLER_GUIDE.barn.modtager)} kr (ca.{" "}
            {kr(EKSEMPLER_GUIDE.barn.modtager / 2)} kr hver)
          </li>
        </ol>

        <h3>Eksempel 2: Arv til søskende</h3>
        <p>
          En person efterlader {GUIDE_SOESKENDE_TEKST} kr til sin bror. Søskende betaler boafgift{" "}
          {pct(BOAFGIFT_PCT)} % og tillægsafgift {pct(TILLAEGS_PCT)} % af beløbet <em>efter</em> boafgift. Der
          er intet bundfradrag for tillægsafgiften:
        </p>
        <ol>
          <li>Bobeholdning: {GUIDE_SOESKENDE_TEKST} kr</li>
          <li>Bundfradrag: −{BUND_FAEDRET} kr</li>
          <li>Afgiftspliktigt beløb: {kr(EKSEMPLER_GUIDE.soeskende.grundlag)} kr</li>
          <li>Boafgift ({pct(BOAFGIFT_PCT)} %): {kr(EKSEMPLER_GUIDE.soeskende.boafgift)} kr</li>
          <li>Beløb efter boafgift: {kr(SOESKENDE_EFTER_BOAFGIFT)} kr</li>
          <li>Tillægsafgift ({pct(TILLAEGS_PCT)} %): {kr(EKSEMPLER_GUIDE.soeskende.tillaeg)} kr</li>
          <li>Samlet afgift: {kr(EKSEMPLER_GUIDE.soeskende.iAlt)} kr</li>
          <li>Arving modtager: {kr(EKSEMPLER_GUIDE.soeskende.modtager)} kr</li>
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

      <NaesteSkridt
        href="/arveafgift"
        handling="Beregn arveafgiften"
        beskrivelse="Sæt værdien af arven og arvingerne ind, og se afgiften fordelt på arvingerne."
      />

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
