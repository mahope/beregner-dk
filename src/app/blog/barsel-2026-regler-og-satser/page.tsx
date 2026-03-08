import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Barsel 2026: Nye regler for barselsdagpenge og orlov | MinBeregner.dk",
    description:
      "Komplet guide til barsel i 2026: Øremærket barsel, barselsdagpenge-satser, orlovsperioder for mor og far, og nye regler. Se hvad du har ret til.",
    keywords: [
      "barsel 2026",
      "barselsdagpenge 2026",
      "barselsorlov 2026",
      "øremærket barsel",
      "barsel far 2026",
      "barsel mor 2026",
      "barselsdagpenge sats",
    ],
    openGraph: {
      title: "Barsel 2026: Nye regler for barselsdagpenge og orlov",
      description: "Alt om barsel i 2026 — satser, orlovsperioder og nye regler.",
      url: `${baseUrl}/blog/barsel-2026-regler-og-satser`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/barsel-2026-regler-og-satser`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er barselsdagpengesatsen i 2026?",
    answer:
      "Max barselsdagpenge i 2026 er 4.695 kr/uge (ca. 20.345 kr/md) for fuldtidsbeskæftigede. Satsen svarer til max dagpengesats.",
  },
  {
    question: "Hvor lang tid kan man holde barselsorlov?",
    answer:
      "Den samlede barselsorlov er 52 uger: 4 uger før fødsel (mor), 2 uger efter fødsel (mor), 2 uger efter fødsel (far), 11 uger øremærket til hver forælder, og 22 uger til fri fordeling.",
  },
  {
    question: "Hvad er øremærket barsel?",
    answer:
      "Øremærket barsel betyder, at 11 uger er reserveret til hver forælder og ikke kan overdrages. Bruger du dem ikke, bortfalder de. Reglen gælder fra august 2022.",
  },
];

export default function BarselGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Barsel 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Familie & Barsel</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Barsel 2026: Nye regler for barselsdagpenge og orlov
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Barselsorlov og barselsdagpenge er vigtige rettigheder for nye forældre i Danmark. Med
          de øremærkede barselsregler fra 2022 er der kommet nye krav til, hvordan orloven
          fordeles. Her er din komplette guide til barsel i 2026.
        </p>

        <h2>Barselsdagpenge-satser 2026</h2>
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
                <td>Max barselsdagpenge (fuldtid)</td>
                <td>4.695 kr/uge</td>
              </tr>
              <tr>
                <td>Max barselsdagpenge (månedlig)</td>
                <td>ca. 20.345 kr/md</td>
              </tr>
              <tr>
                <td>Beregning (lønmodtager)</td>
                <td>100% af løn, max dagpengesats</td>
              </tr>
              <tr>
                <td>Beregning (selvstændig)</td>
                <td>Baseret på årsopgørelse</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Barselsorlovens perioder</h2>
        <p>
          Den samlede barselsorlov er 52 uger med barselsdagpenge, fordelt således:
        </p>

        <h3>Mor</h3>
        <ul>
          <li><strong>4 uger før fødsel:</strong> Graviditetsorlov (valgfri)</li>
          <li><strong>2 uger efter fødsel:</strong> Pligtbarsel (obligatorisk)</li>
          <li><strong>11 uger øremærket:</strong> Kun for mor, kan ikke overdrages</li>
        </ul>

        <h3>Far/medmor</h3>
        <ul>
          <li><strong>2 uger efter fødsel:</strong> Fædreorlov (inden for de første 10 uger)</li>
          <li><strong>11 uger øremærket:</strong> Kun for far/medmor, kan ikke overdrages</li>
        </ul>

        <h3>Fælles fordeling</h3>
        <ul>
          <li><strong>22 uger:</strong> Kan fordeles frit mellem forældrene</li>
        </ul>

        <h2>Øremærket barsel: Hvad betyder det?</h2>
        <p>
          Siden august 2022 har hver forælder <strong>11 ugers øremærket barsel</strong>. Det betyder:
        </p>
        <ul>
          <li>Ugerne kan <strong>ikke overdrages</strong> til den anden forælder</li>
          <li>Bruger du dem ikke, <strong>bortfalder de</strong></li>
          <li>Reglen gælder for lønmodtagere (selvstændige har andre regler)</li>
          <li>Formålet er at fremme ligedeling af barsel</li>
        </ul>
        <p>
          I praksis betyder det, at far/medmor skal holde mindst 11 ugers barselsorlov for at
          familien udnytter den fulde barsel.
        </p>

        <h2>Hvem har ret til barselsdagpenge?</h2>
        <p>
          For at få barselsdagpenge skal du opfylde ét af disse krav:
        </p>
        <ul>
          <li>Være lønmodtager og have arbejdet mindst 160 timer inden for de seneste 4 måneder</li>
          <li>Være selvstændig og have drevet virksomhed i mindst 6 måneder (heraf 1 måned lige før barsel)</li>
          <li>Modtage dagpenge fra A-kasse</li>
          <li>Være under uddannelse med SU</li>
        </ul>

        <h2>Fuld løn under barsel?</h2>
        <p>
          Mange arbejdsgivere betaler fuld løn under barsel (typisk 3-6 måneder for mor, 2-4 uger
          for far). Det afhænger af din overenskomst eller individuelle aftale. Arbejdsgiveren
          modtager barselsdagpengene som refusion fra Udbetaling Danmark.
        </p>
        <p>
          Tjek din ansættelseskontrakt eller spørg din HR-afdeling om, hvad du er dækket af.
        </p>

        <h2>Barsel for selvstændige</h2>
        <p>
          Som selvstændig har du også ret til barselsdagpenge, men reglerne er lidt anderledes:
        </p>
        <ul>
          <li>Beregnes ud fra din seneste årsopgørelse</li>
          <li>Max dagpengesats gælder stadig</li>
          <li>Øremærkningsreglerne er mere fleksible</li>
          <li>Du kan overdrage op til 22 uger til din partner</li>
        </ul>

        <h2>Tips til barselsplanlægning</h2>
        <ul>
          <li><strong>Planlæg tidligt:</strong> Lav en barselsplan med din partner og arbejdsgiver</li>
          <li><strong>Tjek overenskomst:</strong> Mange overenskomster giver bedre vilkår end loven</li>
          <li><strong>Udnyt øremærket barsel:</strong> Planlæg at begge forældre bruger deres 11 uger</li>
          <li><strong>Beregn økonomien:</strong> Brug vores{" "}
            <Link href="/barselsdagpenge" className="text-blue-600 hover:underline">barselsdagpenge-beregner</Link>
          </li>
          <li><strong>Søg børnepenge:</strong> Du kan søge{" "}
            <Link href="/boernepenge" className="text-blue-600 hover:underline">børnepenge</Link> fra barnets fødsel
          </li>
          <li><strong>Tjek boligstøtte:</strong> Lavere indkomst under barsel kan give ret til{" "}
            <Link href="/boligstoette" className="text-blue-600 hover:underline">boligstøtte</Link>
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn dine barselsdagpenge</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores <Link href="/barselsdagpenge" className="underline font-medium">barselsdagpenge-beregner</Link> til at
            se din sats. Se også{" "}
            <Link href="/dagpenge" className="underline font-medium">dagpengeberegneren</Link> og{" "}
            <Link href="/boernepenge" className="underline font-medium">børnepenge-satser</Link>.
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
          <Link href="/blog/guide-feriepenge-hvornaar-og-hvor-meget" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Guide: Feriepenge — hvornår og hvor meget? →</span>
          </Link>
          <Link href="/blog/dagpenge-saadan-finder-du-din-sats" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Dagpenge: Sådan finder du din sats →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
