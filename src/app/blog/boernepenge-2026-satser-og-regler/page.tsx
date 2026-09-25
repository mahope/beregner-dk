import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import {
  BOERNE_SATSER_2026,
  BOERNEUNGEYDELSE_2026,
  aarligBelob,
  beregnAftrapning,
} from "@/lib/borneungeydelse";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Børnepenge 2026: 5.370 kr./kvartal (0-2 år)",
    description:
      "Børnepenge 2026: 5.370 kr./kvartal (0-2 år), 4.248 (3-6 år), 3.342 (7-14 år) og 1.114 kr./måned (15-17 år). Sådan deles ydelsen mellem jer.",
    keywords: [
      "børnepenge 2026",
      "børne- og ungeydelse 2026",
      "børnecheck 2026",
      "børnepenge satser 2026",
      "ungeydelse 2026",
      "børnetilskud enlig forsørger",
      "børneydelse udbetaling",
      "børnepenge aftrapning",
    ],
    openGraph: {
      title: "Børnepenge 2026: 5.370 kr./kvartal (0-2 år)",
      description:
        "Børnepenge 2026: 5.370 kr./kvartal (0-2 år), 4.248 (3-6 år), 3.342 (7-14 år) og 1.114 kr./måned (15-17 år). Sådan deles ydelsen mellem jer.",
      url: `${baseUrl}/blog/boernepenge-2026-satser-og-regler`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/boernepenge-2026-satser-og-regler`,
    },
  };
}

const da = (beloeb: number) => formatNumber(beloeb, "da");

const satsOversigt = BOERNE_SATSER_2026.map(
  (sats) => `${sats.alder}: ${da(sats.hel)} kr. pr. ${sats.intervalNavn}`,
).join(", ");

const satsAarligt = BOERNE_SATSER_2026.map(
  (sats) => `${sats.alder}: ${da(aarligBelob(sats))} kr./år`,
).join(", ");

const faqItems = [
  {
    question: "Hvor meget får man i børnepenge 2026?",
    answer: `De officielle satser for børne- og ungeydelse i 2026 er: ${satsOversigt}. Beløbene er skattefri og udbetales automatisk af Udbetaling Danmark. Regnet om til hele år svarer det til ${satsAarligt}. Har I fælles forældremyndighed, får hver af jer halvdelen: ${da(BOERNE_SATSER_2026[0].halv)} kr. pr. kvartal for et barn fra 0-2 år.`,
  },
  {
    question: "Hvornår udbetales børnepenge 2026?",
    answer: "Børneydelsen (under 15 år) udbetales kvartalsvis forud den 20. i januar, april, juli og oktober. Ungeydelsen (15-17 år) udbetales månedligt den 20. direkte til den unge. Hvis udbetalingsdagen falder på en helligdag eller i en weekend, udbetales pengene hverdagen inden.",
  },
  {
    question: "Kan børnepenge blive nedsat ved høj indkomst?",
    answer: `Ja. Er dit indtægtsgrundlag over ${da(BOERNEUNGEYDELSE_2026.aftrapning.graense)} kr. i 2026, nedsættes ydelsen med 2 % af beløbet over grænsen. Tjener du 1.100.000 kr., bliver nedsættelsen ${da(beregnAftrapning(1100000))} kr. årligt. Siden 1. januar 2022 regnes der kun med din egen indkomst, også hvis I bor sammen.`,
  },
  {
    question: "Deles børnepenge automatisk mellem forældre?",
    answer: "Ja. Siden januar 2022 får begge forældre som udgangspunkt en halvdel hver, hvis I har fælles forældremyndighed. Det kan I ikke ændre, hvis I bor sammen. Bor I hver for sig, kan den ene af jer overlade hele ydelsen til den anden ved at logge ind på borger.dk — deling på andre måder, fx 70/30, er ikke mulig.",
  },
  {
    question: "Hvad er forskellen på børnepenge og barnetilskud?",
    answer: "Børne- og ungeydelsen (børnepenge) får alle forældre automatisk. Barnetilskud får enlige forsørgere oveni: et ordinært børnetilskud pr. barn, et ekstra børnetilskud (kun én gang uanset antal børn) og i særlige tilfælde et særligt børnetilskud. Beløbene står på borger.dk under Børnetilskud.",
  },
  {
    question: "Hvad er ungeydelse?",
    answer: "Ungeydelse er betegnelsen for børnepenge til unge mellem 15 og 17 år. Satsen er 1.114 kr. pr. måned (13.368 kr. om året) og udbetales den 20. hver måned direkte til den unge, ikke til forældrene.",
  },
];

export default function Boernepenge2026Page() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span>Børnepenge 2026</span>
      </nav>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="not-prose mb-8">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Familie & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">Børnepenge 2026: Satser, regler og udbetaling</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">24. august 2026 · 8 min læsetid</p>
        </header>

        <p className="lead">
          Børne- og ungeydelsen — i daglig tale børnepenge — er en skattefri ydelse som
          Udbetaling Danmark udbetaler til forældre med børn under 18 år. Ydelsen er
          automatisk og kræver ingen ansøgning, men satserne ændrer sig årligt, og der er
          flere regler du bør kende for at få det maksimale beløb. Her er komplet overblik
          for 2026.
        </p>

        <h2>Børnepenge satser 2026 (officielle)</h2>
        <p>
          Satserne gælder fra 1. januar 2026 og er fastsat af Social- og Boligstyrelsen.
          Beløbene er skattefri og reguleres årligt efter satsreguleringsloven. Årsbeløbet
          er her regnet ud fra det officielle intervalbeløb.
        </p>

        <table>
          <thead>
            <tr>
              <th>Alder</th>
              <th>Pr. udbetaling</th>
              <th>Halvdelen</th>
              <th>Årligt</th>
            </tr>
          </thead>
          <tbody>
            {BOERNE_SATSER_2026.map((sats) => (
              <tr key={sats.alder}>
                <td>{sats.alder}</td>
                <td>
                  {da(sats.hel)} kr pr. {sats.intervalNavn}
                </td>
                <td>{da(sats.halv)} kr</td>
                <td>{da(aarligBelob(sats))} kr</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Kilde:{" "}
          <a href={BOERNEUNGEYDELSE_2026.source} className="underline" rel="noopener noreferrer">
            borger.dk
          </a>{" "}
          — verificeret {BOERNEUNGEYDELSE_2026.verifiedAt}. Halvdelen er det beløb, hver
          forælder får, når I har fælles forældremyndighed.
        </p>

        <h3>Børneydelse (0-14 år)</h3>
        <p>
          Børneydelsen udbetales <strong>kvartalsvis forud</strong> den 20. i januar, april, juli og oktober.
          Satsen falder når barnet fylder 3 år og igen ved 7 år. Størrelsen afhænger kun af
          barnets alder — ikke af forældrenes indkomst eller formue (dog med aftrapning ved
          meget høje indkomster, se nedenfor).
        </p>

        <h3>Ungeydelse (15-17 år)</h3>
        <p>
          Når barnet fylder 15 år, skifter ydelsen navn til <strong>ungeydelse</strong> og
          udbetales <strong>månedligt den 20.</strong>. Beløbet udbetales direkte til den
          unge, ikke til forældrene. Det betyder at unge fra 15 år selv modtager pengene på
          deres egen konto — med mindre forældrene har aftalt andet ved at søge om at få
          ydelsen udbetalt til sig selv via borger.dk.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores børnepengeberegner</strong> til at se præcis hvad du får i
            børne- og ungeydelse i 2026.{' '}
            <Link href="/boernepenge" className="text-blue-600 hover:underline font-medium">Gå til Børnepengeberegner →</Link>
          </p>
        </div>

        <h2>Aftrapning for høje indkomster</h2>
        <p>
          Selvom børnepenge som udgangspunkt er uafhængig af indkomst, er der en
          <strong>aftrapning</strong> for forældre med meget høje indkomster. I 2026 er
          reglerne:
        </p>
        <ul>
          <li>
            <strong>Grænse:</strong> {da(BOERNEUNGEYDELSE_2026.aftrapning.graense)} kr. i
            dit eget indtægtsgrundlag
          </li>
          <li><strong>Nedsættelse:</strong> 2 % af beløbet over grænsen</li>
          <li>
            Kun din egen indkomst tæller med — også hvis I bor sammen. Den anden
            forælders indkomst påvirker ikke din halvdel.
          </li>
        </ul>
        <p>
          <strong>Eksempel:</strong> Dit indtægtsgrundlag er 1.100.000 kr. i 2026. Beløbet
          over grænsen er 138.900 kr. Nedsættelsen bliver 2 % × 138.900 kr. ={" "}
          {da(beregnAftrapning(1100000))} kr. årligt. Har du to børn på 0-2 år (21.480 kr ×
          2 = 42.960 kr.), får du udbetalt{" "}
          {da(21480 * 2 - beregnAftrapning(1100000))} kr.
        </p>
        <p>
          Nedsættelsen beregnes på dit indtægtsgrundlag, som hos Udbetaling Danmark svarer
          til beskatningsgrundlaget for mellemskat. Den laves for ét kvartal ad gangen og
          genberegnes, når din årsopgørelse er klar.
        </p>

        <h2>Deling mellem forældre</h2>
        <p>
          Siden <strong>januar 2022</strong> får begge forældre som udgangspunkt en halvdel
          hver, hvis I har <strong>fælles forældremyndighed</strong>. Det betyder:
        </p>
        <ul>
          <li>Hver forælder modtager halvdelen af ydelsen på deres egen NemKonto</li>
          <li>Kan I ikke ændre det, hvis I bor sammen</li>
          <li>
            Bor I hver for sig, kan den ene overlade hele ydelsen til den anden — det kan
            ikke deles på andre måder, fx 70/30
          </li>
          <li>Har du fuld forældremyndighed, får du hele ydelsen</li>
        </ul>
        <p>
          Ændringen laves ved, at den forælder der vil overlade ydelsen logger ind på
          borger.dk og oplyser det. Det kan ske ved en aftale, ved at barnet flytter adresse
          eller ved at sende dokumentation for samværsordningen. Ændringen gælder tidligst
          fra perioden efter, den er behandlet.
        </p>

        <h2>Ekstra ydelser til enlige forsørgere</h2>
        <p>
          Er du enlig forsørger, kan du ud over den almindelige børneydelse være berettiget til:
        </p>

        <table>
          <thead>
            <tr>
              <th>Ydelse</th>
              <th>Beløb</th>
              <th>Bemærkning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ordinært børnetilskud</td>
              <td>Se borger.dk</td>
              <td>Pr. barn, gives automatisk</td>
            </tr>
            <tr>
              <td>Ekstra børnetilskud</td>
              <td>Se borger.dk</td>
              <td>Kun én gang uanset antal børn</td>
            </tr>
            <tr>
              <td>Særligt børnetilskud</td>
              <td>Særlig vurdering</td>
              <td>Kræver ansøgning</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Børnetilskuddene fastsættes og reguleres hvert år. De ligger uden for
          børne- og ungeydelsen, så de står på en egen side hos{" "}
          <a
            href="https://www.borger.dk/familie-og-boern/familieydelser-oversigt/barnetilskud"
            className="underline"
            rel="noopener noreferrer"
          >
            borger.dk
          </a>
          . Brug beregneren ovenfor til børne- og ungeydelsen.
        </p>
        <p>
          Det <strong>ordinære børnetilskud</strong> gives automatisk til enlige forsørgere
          og kræver ikke ansøgning. Det <strong>ekstra børnetilskud</strong> gives også
          automatisk, men kun til én udbetaling pr. husstand — uanset om du har ét eller
          flere børn. Det <strong>særlige børnetilskud</strong> kræver en ansøgning og
          vurderes individuelt.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores beregnere til at få overblik over din familieøkonomi:</strong>{' '}
            <Link href="/boernepenge" className="text-blue-600 hover:underline">Børnepengeberegner</Link>
            {' · '}
            <Link href="/barselsdagpenge" className="text-blue-600 hover:underline">Barselsdagpenge</Link>
            {' · '}
             <Link href="/boligstoette" className="text-blue-600 hover:underline">Boligstøtte-standardinterval</Link>
            {' · '}
            <Link href="/budget" className="text-blue-600 hover:underline">Budgetberegner</Link>
            {' · '}
            <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">Løn efter skat</Link>
          </p>
        </div>

        <h2>Børnepenge i forhold til andre familietydelser</h2>
        <p>
          Børne- og ungeydelsen er én af flere familietydelser i Danmark. Her er et kort
          overblik:
        </p>
        <ul>
          <li>
            <strong>Børne- og ungeydelse:</strong> Automatisk ydelse til alle forældre med
            børn under 18 år. Sats efter alder.{' '}
            <Link href="/boernepenge" className="text-blue-600 hover:underline">Beregn her →</Link>
          </li>
          <li>
            <strong>Børnetilskud (enlige):</strong> Ekstra ydelse til enlige forsørgere,
            automatisk udbetalt.
          </li>
          <li>
            <strong>Boligstøtte:</strong> Huslejetilskud til familier med lav indkomst.{' '}
             <Link href="/boligstoette" className="text-blue-600 hover:underline">Se standardintervallet →</Link>
          </li>
          <li>
            <strong>Barselsdagpenge:</strong> Ydelse under barselsorlov.{' '}
            <Link href="/barselsdagpenge" className="text-blue-600 hover:underline">Beregn her →</Link>
          </li>
        </ul>

        <h2>Ændringer i børnepenge 2026</h2>
        <p>
          Den konkrete regelændring i 2026 handler om <em>hvor</em> pengene udbetales,
          ikke om hvor meget. Tidligere kunne Udbetaling Danmark alene udbetale ydelsen
          til barnet eller den unge selv.
        </p>
        <ul>
          <li>
            <strong>Ud fra 1. januar 2026</strong> kan Udbetaling Danmark udbetale
            børne- og ungeydelsen helt eller delvist <strong>til barnet eller den unge
            selv</strong>, hvis de vurderer, at det er den bedste løsning for barnet.
          </li>
          <li>
            Det påvirker også <strong>supplerende grøn check</strong>: hvis den unge får
            den anden halvdel, udbetales hele den grønne check til forældremyndighedsindehaveren.
            Får barnet eller den unge hele ydelsen, udbetales den grønne check ikke.
          </li>
          <li>
            Delingsreglerne fra 2022 fortsætter uændret, og nedsættelsen er stadig
            udelukkende baseret på din egen indkomst.
          </li>
        </ul>
        <p>
          Satserne og aftrapningsgrænsen reguleres hvert år efter satsreguleringsloven og
          offentliggøres af Social- og Boligstyrelsen, så de næste justering forventes
          pr. 1. januar 2027.
        </p>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.question}</h3>
            <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede beregnere</h2>
        <div className="grid gap-4">
          <Link href="/boernepenge" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Børnepengeberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se præcis hvad du får i børne- og ungeydelse 2026</p>
          </Link>
          <Link href="/barselsdagpenge" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Barselsdagpengeberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn dine barselsdagpenge med 2026-satser</p>
          </Link>
          <Link href="/barselsplanlaegger" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Barselsplanlægger →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Planlæg jeres barsel uge for uge med kalender og økonomi</p>
          </Link>
          <Link href="/boligstoette" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
             <span className="font-medium text-gray-900 dark:text-white">Boligstøtte-standardinterval →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se standardmaksima og formuegrænser for boligstøtte i 2026</p>
          </Link>
          <Link href="/budget" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Budgetberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Lav et komplet budget for din husstand</p>
          </Link>
          <Link href="/su" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">SU-beregner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se SU-satser og fribeløb for 2026</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/barsel-2026-regler-og-satser" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Barsel 2026: Nye regler for barselsdagpenge og orlov →</span>
          </Link>
          <Link href="/blog/boligstoette-2026-nye-regler" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Boligstøtte 2026: Maksima, formue og beregning →</span>
          </Link>
          <Link href="/blog/fradrag-2026-komplet-guide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Fradrag 2026: Komplet guide →</span>
          </Link>
          <Link href="/blog/skat-2026-alt-du-skal-vide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Skat 2026: Alt du skal vide →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}