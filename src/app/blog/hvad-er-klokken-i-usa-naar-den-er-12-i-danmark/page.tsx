import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

const SLUG = "hvad-er-klokken-i-usa-naar-den-er-12-i-danmark";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Hvad er klokken i USA, når den er 12 i Danmark?",
    description:
      "Når det er 12 i Danmark, er det 06 i New York, 05 i Chicago, 04 i Denver og 03 i Los Angeles. Se hele tabellen for USA og resten af verden — med sommertid.",
    keywords: [
      "hvad er klokken i usa når den er 12 i danmark",
      "tidszoner",
      "tidsforskel danmark usa",
      "tidszone beregner",
      "hvad er klokken i usa",
      "forskel på tid danmark usa",
    ],
    openGraph: {
      title: "Hvad er klokken i USA, når den er 12 i Danmark?",
      description:
        "Hele tabellen: 06 i New York, 05 i Chicago, 04 i Denver og 03 i Los Angeles — plus tidsforskelen til resten af verden.",
      url: `${baseUrl}/blog/${SLUG}`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${SLUG}`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er klokken i USA, når den er 12 i Danmark?",
    answer:
      "Når det er 12 i Danmark, er det 06 i New York og Miami (østkysten), 05 i Chicago (midtvesten), 04 i Denver (bjergbælterne) og 03 i Los Angeles (stillehavskysten). I Alaska er det 02, og på Hawaii 01.",
  },
  {
    question: "Hvor mange timer er Danmark foran USA?",
    answer:
      "Danmark er 6 timer foran østkysten, 7 timer foran Chicago, 8 timer foran Denver og 9 timer foran Los Angeles. Hawaii ligger 11 timer bagud Danmark om vinteren og 12 om sommeren, fordi Hawaii ikke har sommertid.",
  },
  {
    question: "Er der altid 6 timers forskel til New York?",
    answer:
      "Ja. Danmark og USA skifter begge til sommertid, men på hver sin dato, så den samlede forskel til New York er 6 timer hele året. I de få uger, hvor kun den ene side har skiftet, kan den være 5 eller 7 timer.",
  },
  {
    question: "Hvornår skifter Danmark til sommertid i 2026?",
    answer:
      "Søndag 29. marts 2026 kl. 03:00 går uret en time frem, og søndag 25. oktober 2026 kl. 03:00 går det en time tilbage. Det er den sidste søndag i marts og den sidste søndag i oktober.",
  },
  {
    question: "Hvorfor har nogle byer en halv times tidsforskel?",
    answer:
      "Fordi deres tidszone ikke ligger midt i et helt timeinterval. Indien ligger på UTC+5:30, så Mumbai er 4,5 time foran Danmark om vinteren. Nepal ligger på UTC+5:45.",
  },
  {
    question: "Hvornår kan man mødes med USA uden at stå op midt i natten?",
    answer:
      "Tidspunktet 15-17 dansk tid svarer til 09-11 i New York, 08-10 i Chicago og 07-09 i Los Angeles, hvilket er arbejdstid på alle tre kyster. 14 dansk er 08 i New York — tidlig morgen.",
  },
];

export default function TidszoneUsaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm mb-6" aria-label="Brødkrumme">
        <Link href="/blog" className="text-blue-600 hover:underline">
          Blog
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">
          Hvad er klokken i USA, når den er 12 i Danmark?
        </span>
      </nav>

      <article className="prose prose-lg max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 font-medium">Praktisk &amp; Rejse</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Hvad er klokken i USA, når den er 12 i Danmark?
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>26. september 2026</span>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          Når det er <strong>12 i Danmark</strong>, er det <strong>06 i New York</strong>,
          05 i Chicago, 04 i Denver og 03 i Los Angeles. I Alaska er det 02, og på Hawaii
          01. Danmark ligger på CET (UTC+1) om vinteren og CEST (UTC+2) om sommeren,
          og USA har sin egen tidszone for hver kyst. Her er hele tabellen — også for
          kl. 14, 16 og 21 dansk, som er de tidspunkter, de fleste søger på.
        </p>

        <h2>Når det er 12 i Danmark</h2>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 text-left">
                <th className="py-2 pr-4">Tidszone i USA</th>
                <th className="py-2 pr-4">12 dansk — vintertid</th>
                <th className="py-2">12 dansk — somertid</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">
                  Østkysten — New York, Miami, Boston (EST/EDT)
                </td>
                <td className="py-2 pr-4">06:00</td>
                <td className="py-2">06:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Midtvesten — Chicago, Houston (CST/CDT)</td>
                <td className="py-2 pr-4">05:00</td>
                <td className="py-2">05:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Bjergbælterne — Denver (MST/MDT)</td>
                <td className="py-2 pr-4">04:00</td>
                <td className="py-2">04:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Stillehavskysten — Los Angeles, Seattle (PST/PDT)</td>
                <td className="py-2 pr-4">03:00</td>
                <td className="py-2">03:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Alaska — Anchorage (AKST/AKDT)</td>
                <td className="py-2 pr-4">02:00</td>
                <td className="py-2">02:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Hawaii — Honolulu (HST)</td>
                <td className="py-2 pr-4">01:00</td>
                <td className="py-2">00:00</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">
                  Arizona — Phoenix (MST hele året, ingen sommertid)
                </td>
                <td className="py-2 pr-4">04:00</td>
                <td className="py-2">03:00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>De to kolonner er ens for alle undtagen Arizona og Hawaii.</strong> Det er
          ikke en fejl: Danmark og USA skifter begge til sommertid, men på hver sin dato,
          så de to forskydninger ophæver hinanden. Arizona og Hawaii har derimod
          afskaffet sommertiden, og derfor står de to tal forskelligt.
        </p>

        <h2>Kl. 14, 16 og 21 dansk — de andre tidspunkter folk søger på</h2>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 text-left">
                <th className="py-2 pr-4">Tidszone i USA</th>
                <th className="py-2 pr-4">14 dansk</th>
                <th className="py-2 pr-4">16 dansk</th>
                <th className="py-2">21 dansk</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Østkysten — New York, Miami</td>
                <td className="py-2 pr-4">08:00</td>
                <td className="py-2 pr-4">10:00</td>
                <td className="py-2">15:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Midtvesten — Chicago</td>
                <td className="py-2 pr-4">07:00</td>
                <td className="py-2 pr-4">09:00</td>
                <td className="py-2">14:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Bjergbælterne — Denver</td>
                <td className="py-2 pr-4">06:00</td>
                <td className="py-2 pr-4">08:00</td>
                <td className="py-2">13:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Stillehavskysten — Los Angeles</td>
                <td className="py-2 pr-4">05:00</td>
                <td className="py-2 pr-4">07:00</td>
                <td className="py-2">12:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Alaska — Anchorage</td>
                <td className="py-2 pr-4">04:00</td>
                <td className="py-2 pr-4">06:00</td>
                <td className="py-2">11:00</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Hawaii — Honolulu</td>
                <td className="py-2 pr-4">03:00</td>
                <td className="py-2 pr-4">05:00</td>
                <td className="py-2">10:00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Kolonnerne her er vist i vintertid for USA. I USA's egen somertid er tallene på
          østkysten, midtvesten, bjergbælterne og stillehavskysten de samme, fordi Danmark
          også er skiftet — kun Hawaii og Arizona står en time tidligere.
        </p>

        <h2>Tidsforskelen til resten af verden</h2>
        <p>
          Tabellen her regner fra Danmark. Fortegnet er fra <strong>dansk tid</strong>, så
          minus betyder, at byen ligger bagud.
        </p>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 text-left">
                <th className="py-2 pr-4">By eller land</th>
                <th className="py-2 pr-4">Vintertid</th>
                <th className="py-2 pr-4">Sommertid</th>
                <th className="py-2">Kl. 14 dansk — vintertid</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">London</td>
                <td className="py-2 pr-4">1 time bagud</td>
                <td className="py-2 pr-4">1 time bagud</td>
                <td className="py-2">13:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Nuuk, Grønland</td>
                <td className="py-2 pr-4">3 timer bagud</td>
                <td className="py-2 pr-4">3 timer bagud</td>
                <td className="py-2">11:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">New York</td>
                <td className="py-2 pr-4">6 timer bagud</td>
                <td className="py-2 pr-4">6 timer bagud</td>
                <td className="py-2">08:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Chicago</td>
                <td className="py-2 pr-4">7 timer bagud</td>
                <td className="py-2 pr-4">7 timer bagud</td>
                <td className="py-2">07:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Denver</td>
                <td className="py-2 pr-4">8 timer bagud</td>
                <td className="py-2 pr-4">8 timer bagud</td>
                <td className="py-2">06:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Los Angeles</td>
                <td className="py-2 pr-4">9 timer bagud</td>
                <td className="py-2 pr-4">9 timer bagud</td>
                <td className="py-2">05:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">São Paulo</td>
                <td className="py-2 pr-4">4 timer bagud</td>
                <td className="py-2 pr-4">5 timer bagud</td>
                <td className="py-2">10:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Berlin, Paris, Madrid</td>
                <td className="py-2 pr-4">Samme tid</td>
                <td className="py-2 pr-4">Samme tid</td>
                <td className="py-2">14:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Kreta og Athen</td>
                <td className="py-2 pr-4">1 time foran</td>
                <td className="py-2 pr-4">1 time foran</td>
                <td className="py-2">15:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Tyrkiet (Ankara)</td>
                <td className="py-2 pr-4">2 timer foran</td>
                <td className="py-2 pr-4">1 time foran</td>
                <td className="py-2">16:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Dubai</td>
                <td className="py-2 pr-4">3 timer foran</td>
                <td className="py-2 pr-4">2 timer foran</td>
                <td className="py-2">17:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Mumbai (Indien)</td>
                <td className="py-2 pr-4">4,5 time foran</td>
                <td className="py-2 pr-4">3,5 time foran</td>
                <td className="py-2">18:30</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Bangkok (Thailand)</td>
                <td className="py-2 pr-4">6 timer foran</td>
                <td className="py-2 pr-4">5 timer foran</td>
                <td className="py-2">20:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Kina, Singapore og Bali</td>
                <td className="py-2 pr-4">7 timer foran</td>
                <td className="py-2 pr-4">6 timer foran</td>
                <td className="py-2">21:00</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Tokyo</td>
                <td className="py-2 pr-4">8 timer foran</td>
                <td className="py-2 pr-4">7 timer foran</td>
                <td className="py-2">22:00</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Sydney</td>
                <td className="py-2 pr-4">9 timer foran</td>
                <td className="py-2 pr-4">9 timer foran</td>
                <td className="py-2">23:00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Læg mærke til de par rækker, hvor forskellen <em>ikke</em> ændrer sig med
          sommertiden: London, Nuuk, hele USA's kyster, Berlin, Kreta og Sydney. De skifter
          enten sammen med Danmark eller slet ikke.Og Mumbai ligger 4,5 time foran, fordi
          Indien ligger på UTC+5:30 — en tidszone der ikke går i hele time.
        </p>

        <h2>Sådan regner du det ud selv</h2>
        <p>
          Der er kun to tal at regne med: <strong>din egen forskel til UTC</strong> og{" "}
          <strong>byens forskel til UTC</strong>. Forskellen mellem dem er svaret.
        </p>
        <ul>
          <li>
            Danmark om vinteren er CET = <strong>UTC+1</strong>, og New York er EST ={" "}
            <strong>UTC-5</strong>. Forskellen er 1 + 5 = <strong>6 timer</strong> — New
            York er altså 6 timer bagud.
          </li>
          <li>
            Danmark om sommeren er CEST = <strong>UTC+2</strong>, og New York er EDT ={" "}
            <strong>UTC-4</strong>. Forskelsen er 2 + 4 = <strong>6 timer</strong> — igen
            6 timer.
          </li>
          <li>
            Tokyo er JST = <strong>UTC+9</strong> hele året. Danmark om vinteren er 9 − 1 ={" "}
            <strong>8 timer foran</strong>, og om sommeren 9 − 2 = <strong>7 timer
            foran</strong>.
          </li>
        </ul>
        <p>
          Er tallet negativt, ligger byen bagud Danmark. Er det 12, går dagen over
          midnat, og du skal huske at skifte dato.
        </p>

        <h2>Sommertid i 2026 — de præcise datoer</h2>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 text-left">
                <th className="py-2 pr-4">Land</th>
                <th className="py-2 pr-4">Sommertid starter</th>
                <th className="py-2 pr-4">Sommertid slutter</th>
                <th className="py-2">Regel</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Danmark og EU</td>
                <td className="py-2 pr-4">29. marts 2026</td>
                <td className="py-2 pr-4">25. oktober 2026</td>
                <td className="py-2">Sidste søndag i marts og oktober</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">USA</td>
                <td className="py-2 pr-4">8. marts 2026</td>
                <td className="py-2 pr-4">1. november 2026</td>
                <td className="py-2">Anden søndag i marts og første søndag i november</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">Sydney, New South Wales</td>
                <td className="py-2 pr-4">4. oktober 2026</td>
                <td className="py-2 pr-4">5. april 2026</td>
                <td className="py-2">Første søndag i oktober og april</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Ingen sommertid</td>
                <td className="py-2 pr-4">—</td>
                <td className="py-2 pr-4">—</td>
                <td className="py-2">
                  Arizona, Hawaii, Japan, Singapore, Dubai, Indien og Brasilien
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Danmark har haft sommertid siden 1916, og i de seneste 57 år har den været
          afbrudt i 1980. Fordi EU og USA ikke skifter samme dag, er der hvert år to
          korte perioder, hvor forskellen er en time større eller mindre end normalt:
          fra 8. til 29. marts og fra 25. oktober til 1. november 2026 er Danmark
          <strong>7 timer foran</strong> New York i stedet for 6.
        </p>

        <h2>Hvornår kan du mødes med USA?</h2>
        <p>
          Arbejdstid i USA er typisk kl. 09-17. Omregnet til dansk tid er det:
        </p>
        <ul>
          <li>
            <strong>New York:</strong> 15-23 dansk tid. 16 dansk er 10 i New York — det
            bedste tidspunkt.
          </li>
          <li>
            <strong>Chicago:</strong> 16-24 dansk tid. 17 dansk er 11 i Chicago.
          </li>
          <li>
            <strong>Los Angeles:</strong> 17-01 dansk tid. 19 dansk er 11 i Los Angeles.
          </li>
        </ul>
        <p>
          Skal et møde dække både Danmark og USA's østkyst, er 16-18 dansk tid det eneste
          realistiske vindue. Med Los Angeles er det 19-21 dansk. Skriv altid tidszonen
          på invitationen, så spørgsmålet "hvilken tid er det egentlig?" ikke behøver at
          blive stillet.
        </p>

        <h2>Regn det ud med værktøjet</h2>
        <p>
          <Link href="/tidszone" className="text-blue-600 hover:underline">
            Tidszoneberegneren
          </Link>{" "}
          regner et vilkårligt tidspunkt om til en vilkårlig by og fortæller, hvad
          forskellen er, og om det er dagen før eller dagen efter. Den bruger
          standardtidsforskellene, så tjek altid datoen op mod tabellen ovenfor, hvis dit
          møde ligger i marts eller oktober.
        </p>

        <div className="not-prose my-8">
          <Link
            href="/tidszone"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Åbn tidszoneberegneren →
          </Link>
        </div>

        <h2>Kilder</h2>
        <ul>
          <li>
            <a
              href="https://www.law.cornell.edu/uscode/text/15/260a"
              rel="noreferrer nofollow noopener"
              target="_blank"
            >
              15 U.S. Code § 260a
            </a>{" "}
            — USA's lov om sommertid: klokken flyttes fra kl. 02:00 den anden søndag i
            marts til kl. 02:00 den første søndag i november. Ændret fra 2005 af
            Energy Policy Act.
          </li>
          <li>
            <a
              href="https://www.law.cornell.edu/uscode/text/15/263"
              rel="noreferrer nofollow noopener"
              target="_blank"
            >
              15 U.S. Code § 263
            </a>{" "}
            — navnene på USA's ni standardtidszoner, fra Atlantic til Chamorro.
          </li>
          <li>
            <a
              href="https://www.timeanddate.com/time/zones/"
              rel="noreferrer nofollow noopener"
              target="_blank"
            >
              timeanddate.com — tidszoner verden
            </a>{" "}
            — UTC-forskellene for alle forkortelser i tabellerne: EST UTC−5, EDT UTC−4,
            AKST UTC−9, HST UTC−10, CET UTC+1, CEST UTC+2, JST UTC+9, IST UTC+5:30,
            ICT UTC+7, TRT UTC+3 med flere. Verificeret 26. september 2026.
          </li>
          <li>
            <a
              href="https://www.timeanddate.com/time/change/denmark?year=2026"
              rel="noreferrer nofollow noopener"
              target="_blank"
            >
              timeanddate.com — Danmarks klokkeændringer 2026
            </a>{" "}
            — 29. marts 2026 kl. 03:00 frem og 25. oktober 2026 kl. 03:00 tilbage.
            Danmarks første sommertid var i 1916. Verificeret 26. september 2026.
          </li>
          <li>
            <a
              href="https://www.timeanddate.com/time/change/australia/sydney?year=2026"
              rel="noreferrer nofollow noopener"
              target="_blank"
            >
              timeanddate.com — Australiens klokkeændringer 2026
            </a>{" "}
            — Sydney: 4. oktober 2026 kl. 02:00 frem og 5. april 2026 kl. 03:00
            tilbage. Verificeret 26. september 2026.
          </li>
        </ul>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4 not-prose">
            <h3 className="text-lg">{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link
            href="/tidszone"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium dark:text-white">
              Tidszoneberegneren: konverter et tidspunkt →
            </span>
          </Link>
          <Link
            href="/tidsberegner"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium dark:text-white">
              Tidsberegneren: hvor lang tid tager det →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
