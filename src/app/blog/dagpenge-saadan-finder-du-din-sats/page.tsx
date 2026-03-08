import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Dagpenge 2026: Sådan finder du din dagpengesats | MinBeregner.dk",
    description:
      "Komplet guide til dagpenge i 2026: Max dagpengesats, beregningsgrundlag, krav til optjening og dimittendsats. Se hvad du har ret til.",
    keywords: [
      "dagpenge 2026",
      "dagpengesats 2026",
      "max dagpenge 2026",
      "dagpenge beregner",
      "dagpenge krav",
      "dimittendsats 2026",
      "a-kasse dagpenge",
    ],
    openGraph: {
      title: "Dagpenge 2026: Sådan finder du din dagpengesats",
      description: "Alt om dagpenge i 2026 — satser, krav og beregning.",
      url: `${baseUrl}/blog/dagpenge-saadan-finder-du-din-sats`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/dagpenge-saadan-finder-du-din-sats`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er den maksimale dagpengesats i 2026?",
    answer:
      "Den maksimale dagpengesats i 2026 er 20.359 kr/md (952 kr/dag) for fuldtidsforsikrede. Det svarer til ca. 120 kr/time.",
  },
  {
    question: "Hvor lang tid kan man få dagpenge?",
    answer:
      "Du kan som hovedregel få dagpenge i op til 2 år (3.848 timer for fuldtidsforsikrede) inden for en 3-årig periode.",
  },
  {
    question: "Hvad er dimittendsatsen i 2026?",
    answer:
      "Dimittendsatsen for nyuddannede er ca. 71,5% af max dagpenge i de første 3 måneder (14.557 kr/md), derefter 13.437 kr/md.",
  },
];

export default function DagpengeGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Dagpenge 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Arbejde & Dagpenge</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Dagpenge 2026: Sådan finder du din dagpengesats
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>7 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Dagpenge er din økonomiske sikkerhedsnet, hvis du mister dit job. Men hvor meget kan du
          faktisk få? I denne guide gennemgår vi dagpengesatser, krav og beregning i 2026, så du
          ved præcist, hvad du har ret til.
        </p>

        <h2>Dagpengesatser 2026</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Sats (2026)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Max dagpenge (fuldtid)</td>
                <td>20.359 kr/md</td>
              </tr>
              <tr>
                <td>Max dagpenge (deltid)</td>
                <td>13.573 kr/md</td>
              </tr>
              <tr>
                <td>Dagpenge per time</td>
                <td>120 kr/time</td>
              </tr>
              <tr>
                <td>Dimittendsats (første 3 md)</td>
                <td>14.557 kr/md</td>
              </tr>
              <tr>
                <td>Dimittendsats (efter 3 md)</td>
                <td>13.437 kr/md</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Krav til dagpenge</h2>
        <p>
          For at få dagpenge skal du opfylde en række betingelser:
        </p>
        <ul>
          <li><strong>A-kasse-medlemskab:</strong> Du skal have været medlem af en A-kasse i mindst 1 år</li>
          <li><strong>Beskæftigelseskrav:</strong> Du skal have haft mindst 1.924 timers arbejde inden for de seneste 3 år (fuldtidsforsikret)</li>
          <li><strong>Tilmelding:</strong> Du skal tilmelde dig som ledig på Jobnet.dk den første ledighedsdag</li>
          <li><strong>Rådighed:</strong> Du skal stå til rådighed for arbejdsmarkedet og aktivt søge job</li>
        </ul>

        <h2>Sådan beregnes din dagpengesats</h2>
        <p>
          Din dagpengesats beregnes ud fra din hidtidige indkomst:
        </p>
        <ol>
          <li>Tag din gennemsnitlige månedsindkomst fra de bedste 12 måneder inden for de seneste 24 måneder</li>
          <li>Gang med 90% — det er din beregnede dagpengesats</li>
          <li>Dog kan satsen aldrig overstige max-satsen på 20.359 kr/md</li>
        </ol>
        <p>
          <strong>Eksempel:</strong> Har du haft en gennemsnitlig månedsløn på 35.000 kr, beregnes dagpengene
          som 35.000 × 90% = 31.500 kr. Da dette overstiger max-satsen, får du max-satsen på 20.359 kr/md.
        </p>
        <p>
          I praksis rammer de fleste fuldtidsbeskæftigede med en månedsløn over ca. 22.600 kr loftet.
        </p>

        <h2>Dagpengeperioden</h2>
        <p>
          Du kan få dagpenge i op til <strong>2 år</strong> (3.848 timer for fuldtidsforsikrede) inden for
          en 3-årig referenceperiode. Perioden tæller kun de timer, du modtager dagpenge — ikke timer
          med arbejde, sygdom eller barsel.
        </p>
        <p>
          Hvis du finder arbejde undervejs, forlænges din dagpengeperiode tilsvarende.
        </p>

        <h2>Dimittendsats for nyuddannede</h2>
        <p>
          Nyuddannede, der ikke har nok arbejdserfaring til at opfylde beskæftigelseskravet, kan
          få dagpenge til dimittendsatsen. I 2026 er denne:
        </p>
        <ul>
          <li><strong>Første 3 måneder:</strong> Ca. 14.557 kr/md (71,5% af max dagpenge)</li>
          <li><strong>Derefter:</strong> Ca. 13.437 kr/md (66% af max dagpenge)</li>
        </ul>
        <p>
          For at få dimittendsats skal du have afsluttet en uddannelse af mindst 18 måneders varighed
          og tilmeldt dig A-kassen senest 14 dage efter uddannelsens afslutning.
        </p>

        <h2>Supplerende dagpenge</h2>
        <p>
          Arbejder du på deltid, kan du i visse tilfælde få supplerende dagpenge. Det kræver:
        </p>
        <ul>
          <li>Du skal arbejde under 130 timer om måneden</li>
          <li>Din arbejdsgiver skal godkende, at du kan overtage fuldtidsarbejde med dags varsel</li>
          <li>Du kan kun få supplerende dagpenge i op til 30 uger inden for 104 uger</li>
        </ul>

        <h2>Dagpenge vs. kontanthjælp</h2>
        <p>
          Dagpenge og kontanthjælp er to forskellige ydelser. Dagpenge kræver A-kasse-medlemskab
          og er typisk højere. Kontanthjælp er for borgere uden A-kasse-dækning og er behovsprøvet
          mod ægtefælles indkomst og formue.
        </p>

        <h2>Dagpenge og skat</h2>
        <p>
          Dagpenge er skattepligtig indkomst. Du betaler skat af dine dagpenge ligesom af almindelig
          løn — dog betales der ikke AM-bidrag af dagpenge. Vil du se, hvad du får udbetalt?{" "}
          <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">
            Prøv vores løn efter skat-beregner
          </Link>.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn dine dagpenge</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores <Link href="/dagpenge" className="underline font-medium">dagpengeberegner</Link> til at
            se din sats. Se også vores <Link href="/efterloen" className="underline font-medium">efterlønsberegner</Link> og{" "}
            <Link href="/barselsdagpenge" className="underline font-medium">barselsdagpengeberegner</Link>.
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
          <Link href="/blog/skat-2026-alt-du-skal-vide" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Skat 2026: Alt du skal vide →</span>
          </Link>
          <Link href="/blog/guide-feriepenge-hvornaar-og-hvor-meget" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Guide: Feriepenge — hvornår og hvor meget? →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
