import { FAQSchema } from "@/components/StructuredData";
import { formatNumber } from "@/lib/format";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { BOLIGSTOETTE_2026 } from "@/lib/satser-2026";
import type { Metadata } from "next";
import Link from "next/link";

const kr = (value: number) => value.toLocaleString("da-DK");
const tenPercent = formatNumber(BOLIGSTOETTE_2026.wealth.considerationRates.tenPercent * 100, "da");
const twentyPercent = formatNumber(
  BOLIGSTOETTE_2026.wealth.considerationRates.twentyPercent * 100,
  "da",
);

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Boligstøtte 2026: Maksima, formue og beregning",
    description:
       "Se boligstøtte-standardmaksima for 2026, formuegrænser og hvilke oplysninger Udbetaling Danmark bruger. Beregn et screeningestimat og fortsæt hos myndigheden.",
    keywords: [
      "boligstøtte 2026",
      "boligstøtte nye regler",
      "boligstøtte satser 2026",
      "boligsikring 2026",
      "boligydelse 2026",
      "udbetaling danmark boligstøtte",
      "husleje tilskud 2026",
      "boligstøtte beregning",
      "boligstøtte formue",
    ],
    openGraph: {
      title: "Boligstøtte 2026: Maksima, formue og beregning",
      description: "Officielle nøgletal og en tydelig næste handling, når du vil screen din boligstøtte.",
      url: `${baseUrl}/blog/boligstoette-2026-nye-regler`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/boligstoette-2026-nye-regler`,
    },
  };
}

const faqItems = [
  {
     question: "Hvad er boligstøtte-standardmaksima i 2026?",
     answer: `For lejere uden pension er standardmaksimum ${kr(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.noChildren)} kr. pr. måned uden børn, ${kr(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.oneToThreeChildren)} kr. med 1-3 børn og ${kr(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.fourPlusChildren)} kr. med 4 eller flere børn. Det er standardbeløb, ikke automatiske ydelser; særlige ordninger og enkelte boligforhold kan give højere satser.`,
  },
  {
    question: "Hvem kan få boligstøtte?",
    answer:
      "Boligstøtte gælder som udgangspunkt lejere i en egnet bolig med eget køkken, der bor fast i boligen. Udbetaling Danmark vurderer også indkomst, formue, antal børn og voksne, husleje og areal. Særlige situationer kan give andre ordninger.",
  },
  {
    question: "Er MinBeregners resultat en officiel beregning?",
    answer:
       "Nej. Værktøjet er et screeningestimat, der viser et interval ud fra standardmaksimum og formuegrænserne. Det beregner ikke din endelige ret, fordi Udbetaling Danmarks regler tager flere oplysninger og særlige tilfælde med.",
  },
  {
    question: "Hvordan påvirker formue boligstøtten?",
    answer: `Der er ingen øvre grænse for retten til boligstøtte. For ikke-pensionister og førtidspensionister efter nye regler regnes ${tenPercent} procent af formuen fra ${kr(BOLIGSTOETTE_2026.wealth.nonPensioner.noEffect)} kr. og derover med i vurderingen, og ${twentyPercent} procent regnes med fra ${kr(BOLIGSTOETTE_2026.wealth.nonPensioner.tenPercent)} kr. For folkepensionister og førtidspensionister før 2003 gælder tilsvarende grænser på ${kr(BOLIGSTOETTE_2026.wealth.pensioner.noEffect)} og ${kr(BOLIGSTOETTE_2026.wealth.pensioner.tenPercent)} kr.`,
  },
  {
    question: "Hvilke udgifter skal trækkes fra huslejen?",
    answer:
      "Udbetaling Danmark oplyser, at el, varme, varmt vand, fællesantenne, telefon, internet eller bredbånd, garage eller carport, indskud og afdrag på indskud, forudbetalt leje, møbler i en møbleret bolig og vaskeri normalt ikke tæller med i huslejen til beregningen.",
  },
  {
    question: "Hvad er forskellen på boligstøtte og boligydelse?",
    answer:
      "Boligstøtte er den almindelige ordning for lejere. Folkepensionister og nogle førtidspensionister kan være berettiget til boligydelse, som er en særlig ordning med andre regler. Den officielle beregner viser, hvilken ordning der skal bruges.",
  },
];

export default function Boligstoette2026Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <FAQSchema items={faqItems} />

      <nav className="mb-6 text-sm">
        <Link href="/blog" className="text-blue-600 hover:underline dark:text-blue-400">
          Blog
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 dark:text-gray-400">Boligstøtte 2026</span>
      </nav>

      <article className="prose prose-lg max-w-none dark:prose-invert">
        <header className="not-prose mb-8">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Bolig & Økonomi</span>
          <h1 className="mt-2 mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
             Boligstøtte 2026: standardmaksima, formue og beregning
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <time dateTime="2026-09-24">Opdateret 24. september 2026</time>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          Boligstøtte kan lette huslejen for lejere med en lavere husstandsindkomst, men det
          præcise beløb afhænger af flere oplysninger end huslejen alene. Her er de
          dokumenterede 2026-nøgletal, og hvad du skal bruge den officielle beregner til.
        </p>

        <div className="not-prose my-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
          <p className="font-semibold text-blue-900">Vil du se en konkret beregning?</p>
          <p className="mt-1 text-blue-800">
            Udbetaling Danmarks officielle beregner kan fortsættes uden login. Den bruger
            blandt andet husleje, indkomst, formue, beboere og areal.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href={BOLIGSTOETTE_2026.sources.officialCalculator}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Åbn officiel beregning
            </a>
            <Link
              href="/boligstoette"
              className="rounded-lg bg-white px-4 py-2 font-medium text-blue-800 ring-1 ring-blue-300 hover:bg-blue-100"
            >
              Lav lokalt screeningestimat
            </Link>
          </div>
        </div>

        <h2>Standardmaksimumsbeløb i 2026</h2>
        <p>
          Borger.dk oplyser følgende standardsatser pr. måned for 2026. Særlige ordninger og
          enkelte boligforhold kan give højere beløb, og beløbet er ikke automatisk til enhver.
        </p>

        <a
          href="#boligstoette-standardmaksima"
          className="sr-only focus:not-sr-only focus:my-2 focus:inline-block focus:underline"
        >
          Spring til standardmaksimum
        </a>
        <div
          id="boligstoette-standardmaksima"
          className="not-prose my-6 overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          role="region"
          aria-label="Standardmaksimum for boligstøtte i 2026"
          tabIndex={-1}
        >
          <table className="w-full text-sm">
            <caption className="sr-only">
              Standardmaksimum pr. måned i 2026 efter pensionstatus og antal børn
            </caption>
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th scope="col" className="py-2 text-left">Situation</th>
                <th scope="col" className="py-2 text-left">0 børn</th>
                <th scope="col" className="py-2 text-left">1-3 børn</th>
                <th scope="col" className="py-2 text-left">4+ børn</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <th scope="row" className="py-2 text-left font-normal">Lejer, ikke-pensionist</th>
                <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.noChildren)} kr.</td>
                <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.oneToThreeChildren)} kr.</td>
                <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.fourPlusChildren)} kr.</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <th scope="row" className="py-2 text-left font-normal">Førtidspension efter nye regler</th>
                <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension.noChildren)} kr.</td>
                <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension.oneToThreeChildren)} kr.</td>
                <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension.fourPlusChildren)} kr.</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 text-left font-normal">Folkepension eller førtidspension før 2003</th>
                <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.oldPension.noChildren)} kr.</td>
                <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.oldPension.oneToThreeChildren)} kr.</td>
                <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.oldPension.fourPlusChildren)} kr.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Kilde:{" "}
          <a
            href={BOLIGSTOETTE_2026.sources.officialRules}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Udbetaling Danmarks søgning på boligstøtte
          </a>
          , verificeret {BOLIGSTOETTE_2026.verifiedAt}.
        </p>
        <p>
          Pensionsrækkerne er en ordningsafklaring, ikke et krav på boligstøtte. Nogle
          pensionister kan være berettiget til boligydelse, som følger andre regler; den
          officielle beregner afgør, hvilken ordning der gælder.
        </p>

        <h2>Formue påvirker beregningen</h2>
        <p>
          Der er ingen øvre grænse for, hvor stor formue du kan have og fortsætte få
          boligstøtte. Formuen påvirker dog, hvor meget der regnes med som indkomst:
        </p>
        <a
          href="#boligstoette-formuegraenser"
          className="sr-only focus:not-sr-only focus:my-2 focus:inline-block focus:underline"
        >
          Spring til formuegrænser
        </a>
        <div
          id="boligstoette-formuegraenser"
          className="not-prose my-6 overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          role="region"
          aria-label="Formuegrænser for boligstøtte i 2026"
          tabIndex={-1}
        >
          <table className="w-full text-sm">
            <caption className="sr-only">
              Hvordan formue påvirker vurderingen af boligstøtte i 2026
            </caption>
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th scope="col" className="py-2 text-left">Gruppe</th>
                <th scope="col" className="py-2 text-left">Under fribeløb</th>
                <th scope="col" className="py-2 text-left">{tenPercent} % med</th>
                <th scope="col" className="py-2 text-left">{twentyPercent} % med</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <th scope="row" className="py-2 text-left font-normal">Ikke-pensionister og førtidspensionister efter nye regler</th>
                <td>Under {kr(BOLIGSTOETTE_2026.wealth.nonPensioner.noEffect)} kr.</td>
                <td>Fra {kr(BOLIGSTOETTE_2026.wealth.nonPensioner.noEffect)} kr.</td>
                <td>Fra {kr(BOLIGSTOETTE_2026.wealth.nonPensioner.tenPercent)} kr.</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 text-left font-normal">Folkepensionister og førtidspensionister før 2003</th>
                <td>Under {kr(BOLIGSTOETTE_2026.wealth.pensioner.noEffect)} kr.</td>
                <td>Fra {kr(BOLIGSTOETTE_2026.wealth.pensioner.noEffect)} kr.</td>
                <td>Fra {kr(BOLIGSTOETTE_2026.wealth.pensioner.tenPercent)} kr.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Vurderingen kan også regne med andre forhold. Læs derfor ikke formuegrænserne som
          en selvstændig beregning, men som et signal om, hvornår du bør bruge den officielle
          beregner.
        </p>

        <h2>Hvilke oplysninger skal du bruge?</h2>
        <ul>
          <li>Husstands samlede indkomst.</li>
          <li>Formue, som Udbetaling Danmark kan regne med i vurderingen.</li>
          <li>Antal børn og voksne i boligen.</li>
          <li>Boligens areal og om den er lejet.</li>
          <li>Pensionstatus og eventuelle særlige forhold.</li>
        </ul>
        <p>Træk følgende udgifter fra huslejen, når du bruger den officielle beregner:</p>
        <ul>
          {BOLIGSTOETTE_2026.rentExcludes.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p>
          Betaler du særskilt for forbedringer som et nyt køkken eller bad, skal beløbet
          lægges til huslejen.
        </p>

        <h2>Sådan bruger du screeningen</h2>
        <p>
           Vores <Link href="/boligstoette">boligstøtte-screening</Link> viser et interval fra
           0 kr. til standardmaksimum for det valgte antal børn, men aldrig højere end
            den angivne husleje. Den bruger også de
            dokumenterede formuegrænser til at markere, når {tenPercent} eller {twentyPercent} procent af formuen kan
            regnes med. Areal og husstandens øvrige sammensætning indgår i den officielle
            beregning, men ikke i det lokale interval. Den er bevidst ikke en efterligning af
            Udbetaling Danmarks fulde ansøgningsberegning.
        </p>
        <p>
          Brug resultatet til at se, om det kan være relevant at søge. Gå videre med den
          officielle beregning, når du vil have en vurdering af din konkrete situation.
        </p>

        <h2>Boligstøtte og boligydelse</h2>
        <p>
          Boligstøtte er den almindelige ordning for lejere. Folkepensionister og visse
          førtidspensionister kan være berettiget til boligydelse, som er en særlig ordning
          med andre regler og ofte andre dokumentationskrav. Den officielle beregner er det
          rette sted at få den konkrete vurdering.
        </p>

        <h2>Sådan søger du boligstøtte</h2>
        <p>
          Når du har brugt den officielle beregning, kan du fortsætte ansøgningen derfra.
          Udbetaling Danmark behandler ansøgningen og sender besked om det endelige beløb.
          Husk at oplyse ændringer i indkomst, husstand eller husleje.
        </p>

        <div className="not-prose my-6 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
          <p className="font-medium text-blue-900">Anden næste handling</p>
          <p className="mt-1 text-blue-800">
            Vil du se, hvad du har råd til i husleje? Brug{" "}
            <Link href="/husleje" className="underline">
              huslejeberegneren
            </Link>{" "}
            eller læs vores guide til{" "}
            <Link href="/blog/30-procent-reglen-husleje" className="underline">
              30-procent-reglen
            </Link>
            .
          </p>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item) => (
          <div key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 border-t pt-8 dark:border-gray-700">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Relaterede beregnere</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/boligstoette"
            className="rounded-lg bg-gray-50 p-4 text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <span className="font-medium">Boligstøtte-screening →</span>
             <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Se standardmaksimum 2026 for din profil.</p>
          </Link>
          <Link
            href="/husleje"
            className="rounded-lg bg-gray-50 p-4 text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <span className="font-medium">Husleje budget →</span>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Se, hvad du har råd til efter huslejen.</p>
          </Link>
          <Link
            href="/loen-efter-skat"
            className="rounded-lg bg-gray-50 p-4 text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <span className="font-medium">Løn efter skat →</span>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Se, hvad der er tilbage af løn og andre indkomster efter skat.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
