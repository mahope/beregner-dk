import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Børnepenge 2026: Satser, regler og udbetaling | MinBeregner.dk",
    description:
      "Komplet guide til børnepenge (børne- og ungeydelse) i 2026: Satser for 0-2, 3-6, 7-14 og 15-17 år, aftrapning af høje indkomster, deling mellem forældre og ekstra tilskud til enlige.",
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
      title: "Børnepenge 2026: Satser, regler og udbetaling",
      description: "Alt om børne- og ungeydelse i 2026: satser pr. alder, aftrapning, deling mellem forældre og ekstra tilskud.",
      url: `${baseUrl}/blog/boernepenge-2026-satser-og-regler`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/boernepenge-2026-satser-og-regler`,
    },
  };
}

const faqItems = [
  {
    question: "Hvor meget får man i børnepenge 2026?",
    answer: "I 2026 får du 21.480 kr/år for børn 0-2 år (5.370 kr/kvartal), 17.004 kr/år for børn 3-6 år (4.251 kr/kvartal), og 13.380 kr/år for børn 7-17 år (3.345 kr/kvartal for 7-14 år, 1.115 kr/måned for 15-17 år). Beløbene er skattefri og udbetales automatisk af Udbetaling Danmark.",
  },
  {
    question: "Hvornår udbetales børnepenge 2026?",
    answer: "Børneydelsen (0-14 år) udbetales kvartalsvis forud den 20. i januar, april, juli og oktober. Ungeydelsen (15-17 år) udbetales månedligt den 20. direkte til den unge.",
  },
  {
    question: "Kan børnepenge blive nedsat ved høj indkomst?",
    answer: "Ja. Hvis din indkomst overstiger 961.100 kr. i 2026, nedsættes ydelsen med 2% af beløbet over grænsen. Tjener du 1.100.000 kr., bliver nedsættelsen 2.778 kr. årligt.",
  },
  {
    question: "Deles børnepenge automatisk mellem forældre?",
    answer: "Ja. Siden januar 2022 deles ydelsen automatisk ligeligt mellem forældre med fælles forældremyndighed. Bor barnet kun hos én forælder, kan der søges om fuld ydelse via borger.dk.",
  },
  {
    question: "Hvad kan enlige forsørgere få udover børnepenge?",
    answer: "Enlige forsørgere kan få ordinært børnetilskud (ca. 6.300 kr/kvartal pr. barn), ekstra børnetilskud (ca. 6.600 kr/kvartal, kun én gang uanset antal børn), og særligt børnetilskud hvis den anden forælder er død eller ukendt.",
  },
  {
    question: "Hvad er ungeydelse?",
    answer: "Ungeydelse er betegnelsen for børnepenge til unge mellem 15 og 17 år. Satsen er 13.380 kr/år (1.115 kr/måned) og udbetales månedligt den 20. direkte til den unge, ikke til forældrene.",
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
          Satserne er fastsat af Social- og Boligstyrelsen og gældende fra 1. januar 2026.
          Beløbene er skattefri og reguleres årligt efter satsreguleringsloven.
        </p>

        <table>
          <thead>
            <tr>
              <th>Alder</th>
              <th>Årligt</th>
              <th>Udbetaling</th>
              <th>Interval</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0-2 år</td>
              <td>21.480 kr</td>
              <td>5.370 kr</td>
              <td>Kvartalsvis</td>
            </tr>
            <tr>
              <td>3-6 år</td>
              <td>17.004 kr</td>
              <td>4.251 kr</td>
              <td>Kvartalsvis</td>
            </tr>
            <tr>
              <td>7-14 år</td>
              <td>13.380 kr</td>
              <td>3.345 kr</td>
              <td>Kvartalsvis</td>
            </tr>
            <tr>
              <td>15-17 år (ungeydelse)</td>
              <td>13.380 kr</td>
              <td>1.115 kr</td>
              <td>Månedligt</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Kilde: borger.dk — sidst verificeret februar 2026.
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
          <li><strong>Grænse:</strong> 961.100 kr. i personlig indkomst</li>
          <li><strong>Nedsættelse:</strong> 2% af beløbet over grænsen</li>
          <li>Ved fælles forældremyndighed gælder grænsen for <strong>hver forælder</strong></li>
        </ul>
        <p>
          <strong>Eksempel:</strong> Du tjener 1.100.000 kr. i 2026. Beløbet over grænsen er
          138.900 kr. Nedsættelsen bliver 2% × 138.900 kr. = 2.778 kr. årligt. Har du to børn
          på 0-2 år (21.480 kr × 2 = 42.960 kr.), får du udbetalt 40.182 kr.
        </p>
        <p>
          Bor du sammen med barnets anden forælder, vurderes jeres indkomster samlet. Er I
          skilmisseparatboende med fælles forældremyndighed, vurderes I hver for sig — hvilket
          ofte betyder at aftrapningen slår mindre igennem.
        </p>

        <h2>Deling mellem forældre</h2>
        <p>
          Siden <strong>januar 2022</strong> deles børneydelsen automatisk mellem forældre
          med <strong>fælles forældremyndighed</strong>. Det betyder:
        </p>
        <ul>
          <li>Hver forælder modtager halvdelen af ydelsen på deres egen NemKonto</li>
          <li>Det gælder uanset hvor barnet har folkeregisteradresse</li>
          <li>Bor barnet kun hos én forælder, kan denne søge om at få <strong>fuld ydelse</strong></li>
        </ul>
        <p>
          Ansøgning om fuld ydelse sker via borger.dk. Udbetaling Danmark vurderer derefter
          om betingelserne er opfyldt (primært: at barnet har fast bopæl hos én forælder
          uden delt ophold).
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
              <td>Ca. 6.300 kr/kvartal</td>
              <td>Pr. barn</td>
            </tr>
            <tr>
              <td>Ekstra børnetilskud</td>
              <td>Ca. 6.600 kr/kvartal</td>
              <td>Kun én gang uanset antal børn</td>
            </tr>
            <tr>
              <td>Særligt børnetilskud</td>
              <td>Særlig vurdering</td>
              <td>Ved død/ukendt forælder</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Beløbene er vejledende og reguleres årligt. Søg via borger.dk for præcise satser.
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
            <Link href="/boligstoette" className="text-blue-600 hover:underline">Boligstøtte</Link>
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
            <Link href="/boligstoette" className="text-blue-600 hover:underline">Beregn her →</Link>
          </li>
          <li>
            <strong>Barselsdagpenge:</strong> Ydelse under barselsorlov.{' '}
            <Link href="/barselsdagpenge" className="text-blue-600 hover:underline">Beregn her →</Link>
          </li>
        </ul>

        <h2>Ændringer i børnepenge 2026</h2>
        <p>
          Sammenlignet med 2025 er satserne reguleret med ca. 3,5% som følge af
          satsreguleringsloven. Den væsentligste ændring er:
        </p>
        <ul>
          <li>Alle satser er hævet med satsreguleringsprocenten</li>
          <li>Aftrapningsgrænsen er uændret i forhold til 2025 (961.100 kr.)</li>
          <li>Delingsreglerne mellem forældre fortsætter uændret fra 2022-reformen</li>
        </ul>
        <p>
          Borger.dk oplyser at der ikke er planlagt større ændringer i børnepenge-systemet
          for 2026 eller 2027. De næste justeringer forventes ved den årlige
          satsregulering pr. 1. januar 2027.
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
          <Link href="/boligstoette" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Boligstøtteberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se om du kan få boligstøtte i 2026</p>
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
            <span className="font-medium text-gray-900 dark:text-white">Boligstøtte 2026: Nye regler og satser →</span>
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