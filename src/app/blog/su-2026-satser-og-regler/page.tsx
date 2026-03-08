import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "SU 2026: Nye satser og regler for studerende | MinBeregner.dk",
    description:
      "Komplet guide til SU i 2026: Satser for hjemmeboende og udeboende, fribeløb, SU-lån og nye regler. Se hvor meget du kan få.",
    keywords: [
      "SU 2026",
      "SU satser 2026",
      "SU udeboende 2026",
      "SU hjemmeboende 2026",
      "fribeløb 2026",
      "SU-lån 2026",
      "studerende økonomi",
    ],
    openGraph: {
      title: "SU 2026: Nye satser og regler for studerende",
      description: "Alt om SU i 2026 — satser, fribeløb, SU-lån og regler.",
      url: `${baseUrl}/blog/su-2026-satser-og-regler`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/su-2026-satser-og-regler`,
    },
  };
}

const faqItems = [
  {
    question: "Hvor meget får man i SU som udeboende i 2026?",
    answer:
      "Som udeboende studerende på en videregående uddannelse får du 6.397 kr/md (før skat) i SU i 2026.",
  },
  {
    question: "Hvad er fribeløbet for SU i 2026?",
    answer:
      "Det lave fribeløb i 2026 er ca. 15.586 kr/md og det høje fribeløb ca. 22.476 kr/md. Overstiger din indkomst fribeløbet, skal du betale SU tilbage.",
  },
  {
    question: "Kan man få SU-lån i 2026?",
    answer:
      "Ja, du kan låne op til 3.234 kr/md som SU-lån i 2026. Renten er 4% efter endt uddannelse. Under uddannelse er renten ca. 1%.",
  },
];

export default function SU2026GuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">SU 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Uddannelse & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            SU 2026: Nye satser og regler for studerende
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Statens Uddannelsesstøtte (SU) er en vigtig del af de fleste studerendes økonomi. I 2026 er
          satserne justeret, og der er kommet nye regler for fribeløb. Her får du det fulde overblik
          over alt, du skal vide om SU i 2026.
        </p>

        <h2>SU-satser 2026: Oversigt</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Beløb/md (før skat)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Udeboende, videregående</td>
                <td>6.397 kr</td>
              </tr>
              <tr>
                <td>Hjemmeboende, videregående</td>
                <td>2.968 kr</td>
              </tr>
              <tr>
                <td>Udeboende, ungdomsuddannelse (18+)</td>
                <td>6.397 kr</td>
              </tr>
              <tr>
                <td>Hjemmeboende, ungdomsuddannelse (18+)</td>
                <td>2.968 kr</td>
              </tr>
              <tr>
                <td>SU-lån (max tillæg)</td>
                <td>3.234 kr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Hvad er SU, og hvem kan få det?</h2>
        <p>
          SU er en månedlig ydelse fra staten til studerende, der er under uddannelse. For at få SU
          skal du:
        </p>
        <ul>
          <li>Være dansk statsborger (eller ligestillet)</li>
          <li>Være indskrevet på en SU-berettiget uddannelse</li>
          <li>Være studieaktiv (dvs. bestå dine eksamener)</li>
          <li>Være fyldt 18 år</li>
        </ul>
        <p>
          Du kan typisk få SU i op til 6 år (70 klip) på en videregående uddannelse. Klippene
          tildeles baseret på din uddannelses normerede varighed plus 12 ekstra klip.
        </p>

        <h2>Hjemmeboende vs. udeboende</h2>
        <p>
          Forskellen i SU-sats mellem hjemmeboende og udeboende er betydelig: <strong>3.429 kr/md mere</strong> som
          udeboende. For at blive betragtet som udeboende skal du:
        </p>
        <ul>
          <li>Have en selvstændig bolig (lejet eller ejet)</li>
          <li>Være folkeregistreret på en anden adresse end dine forældre</li>
          <li>Dokumentere din bopæl (lejekontrakt eller ejerbevis)</li>
        </ul>
        <p>
          SU-styrelsen kan kontrollere, om du reelt bor på den registrerede adresse. Hvis du bliver
          fundet i brud, skal du tilbagebetale forskellen.
        </p>

        <h2>Fribeløb: Hvor meget må du tjene?</h2>
        <p>
          Fribeløbet er det beløb, du må tjene ved siden af din SU uden at skulle betale SU tilbage.
          I 2026 er fribeløbene:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Beløb/md (2026)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lavt fribeløb (måneder med SU)</td>
                <td>ca. 15.586 kr</td>
              </tr>
              <tr>
                <td>Højt fribeløb (måneder uden SU)</td>
                <td>ca. 22.476 kr</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Fribeløbet opgøres som et årligt beløb. Det betyder, at du kan tjene mere i nogle måneder
          og mindre i andre, så længe det samlede beløb over året ikke overstiger summen af dine
          månedlige fribeløb. Mange studerende bruger strategien at fravælge SU-klip i måneder
          med høj indkomst (fx sommerferiejob).
        </p>

        <h2>SU-lån: Ekstra penge til studietiden</h2>
        <p>
          Ud over SU-stipendiet kan du optage et SU-lån på op til <strong>3.234 kr/md</strong> i 2026.
          Vilkårene er:
        </p>
        <ul>
          <li><strong>Rente under uddannelse:</strong> Ca. 1% (fastsat årligt)</li>
          <li><strong>Rente efter uddannelse:</strong> 4% (fastsat)</li>
          <li><strong>Tilbagebetaling:</strong> Starter 1 år efter endt uddannelse</li>
          <li><strong>Tilbagebetalingsperiode:</strong> Op til 15 år</li>
        </ul>
        <p>
          SU-lån er et af de billigste lån, du kan få. Men husk at gælden skal betales tilbage — og
          med 4% rente efter studietiden vokser den, hvis du ikke betaler rettidigt.
        </p>

        <h2>SU og skat</h2>
        <p>
          SU er skattepligtig indkomst. Det betyder, at du betaler skat af din SU ligesom af anden
          indkomst. Som studerende har du dog personfradrag (49.700 kr/år i 2026), der dækker en
          stor del af din SU, hvis du ikke har anden indkomst.
        </p>
        <p>
          I praksis betyder det, at mange studerende med lav samlet indkomst betaler meget lidt eller
          ingen skat. Brug vores{" "}
          <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">
            løn efter skat-beregner
          </Link>{" "}
          til at se, hvad du reelt får udbetalt.
        </p>

        <h2>Tips til studieøkonomien</h2>
        <ul>
          <li><strong>Planlæg dine SU-klip:</strong> Fravælg SU i måneder med højere løn</li>
          <li><strong>Hold øje med fribeløbet:</strong> Brug{" "}
            <Link href="/su" className="text-blue-600 hover:underline">SU-beregneren</Link> til at se dit fribeløb
          </li>
          <li><strong>Overvej SU-lån strategisk:</strong> Investering eller opsparing af SU-lån kan give mening pga. den lave rente</li>
          <li><strong>Søg boligstøtte:</strong> Som udeboende studerende kan du være berettiget til{" "}
            <Link href="/boligstoette" className="text-blue-600 hover:underline">boligstøtte</Link>
          </li>
          <li><strong>Tjek børnepenge:</strong> Har du børn? Se{" "}
            <Link href="/boernepenge" className="text-blue-600 hover:underline">børnepenge-satser</Link>
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn din SU</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores <Link href="/su" className="underline font-medium">SU-beregner</Link> til at se
            din SU-sats, fribeløb og samlede studieøkonomi for 2026.
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
          <Link href="/blog/boligstoette-2026-nye-regler" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Boligstøtte 2026: Nye regler →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
