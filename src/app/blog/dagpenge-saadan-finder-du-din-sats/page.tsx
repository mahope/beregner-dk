import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import { DAGPENGE_2026, SATSER_2026 } from "@/lib/satser-2026";

const kr = (belob: number) => `${formatNumber(belob, "da")} kr`;

const VERIFICERET = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date(DAGPENGE_2026.verifiedAt));

const MAX = kr(DAGPENGE_2026.fuldtid);
const DELTID = kr(DAGPENGE_2026.deltid);
const DIMITTEND_MED = kr(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt);
const DIMITTEND_UDEN = kr(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt);

const DIMITTEND_MED_PCT = Math.round(
  (DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt / DAGPENGE_2026.fuldtid) * 100,
);
const DIMITTEND_UDEN_PCT = Math.round(
  (DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt / DAGPENGE_2026.fuldtid) * 100,
);

// Dagpenge = 90 % af løn efter AM-bidrag. Den maanedsløn, der netop rammer
// loftet, findes ved at løse 22.041 = løn × (1 − AM-bidrag) × 90 %.
const LOEN_FOR_MAX = Math.ceil(
  DAGPENGE_2026.fuldtid / (1 - SATSER_2026.amBidrag) / DAGPENGE_2026.dagpengeProcent,
);

function dagpengeForLøn(maanedsloen: number) {
  const grundlag = maanedsloen * (1 - SATSER_2026.amBidrag);
  const beregnet = grundlag * DAGPENGE_2026.dagpengeProcent;
  const rammerLoft = beregnet > DAGPENGE_2026.fuldtid;
  return { grundlag, beregnet, rammerLoft, sats: rammerLoft ? DAGPENGE_2026.fuldtid : beregnet };
}

const EKSEMPEL_UNDER_LOFT = dagpengeForLøn(20000);
const EKSEMPEL_OVER_LOFT = dagpengeForLøn(30000);

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Dagpenge 2026: Max sats er 22.041 kr. pr. måned",
    description: `Dagpenge 2026: max sats ${MAX} pr. måned for fuldtidsforsikrede og ${DELTID} for deltidsforsikrede. Dimittendsats ${DIMITTEND_UDEN}–${DIMITTEND_MED}. Se krav, periode og regneeksempler.`,
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
      title: "Dagpenge 2026: Max sats er 22.041 kr. pr. måned",
      description: `Max dagpenge 2026 er ${MAX} pr. måned. Dimittend, krav, periode og to regneeksempler.`,
      url: `${baseUrl}/blog/dagpenge-saadan-finder-du-din-sats`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/dagpenge-saadan-finder-du-din-sats`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er den maksimale dagpengesats i 2026?",
    answer: `Den maksimale dagpengesats i 2026 er ${MAX} pr. måned for fuldtidsforsikrede og ${DELTID} pr. måned for deltidsforsikrede. Beløbene er vist før skat.`,
  },
  {
    question: "Hvor lang tid kan man få dagpenge?",
    answer: `Du kan som hovedregel få dagpenge i op til 2 år, svarende til ${formatNumber(DAGPENGE_2026.dagpengeperiodeTimer, "da")} timer for en fuldtidsforsikret, inden for en 3-årig periode.`,
  },
  {
    question: "Hvad er dimittendsatsen i 2026?",
    answer: `Dimittendsatsen i 2026 er ${DIMITTEND_UDEN} pr. måned for fuldtidsforsikrede uden forsørgelsespligt (${DIMITTEND_UDEN_PCT} % af max) og ${DIMITTEND_MED} pr. måned med forsørgelsespligt (${DIMITTEND_MED_PCT} % af max). Deltidsforsikrede får 2/3 af begge beløb.`,
  },
  {
    question: "Hvornår rammer man maxsatsen?",
    answer: `Dagpenge er 90 % af lønnen efter 8 % AM-bidrag. Loftet på ${MAX} nås derfor ved en månedsløn på omkring ${kr(LOEN_FOR_MAX)} før skat.`,
  },
  {
    question: "Hvad er en G-dag?",
    answer: `En G-dag er en dag, hvor din arbejdsgiver betaler dagpengegodtgørelse til din A-kasse. Hel godtgørelse er ${kr(DAGPENGE_2026.gaDag)} pr. dag og halv godtgørelse ${kr(DAGPENGE_2026.gaDagHalv)} pr. dag i 2026.`,
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
            Dagpenge 2026: Max sats er 22.041 kr. pr. måned
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>7 min læsetid</span>
            <span>•</span>
            <span>Satser verificeret {VERIFICERET}</span>
          </div>
        </header>

        <p className="text-lg">
          Dagpenge er din økonomiske sikkerhedsnet, hvis du mister dit job. Men hvor meget kan du
          faktisk få? I denne guide gennemgår vi dagpengesatser, krav og beregning i 2026, så du
          ved præcist, hvad du har ret til.
        </p>

        <p>
          <strong>Kort svar:</strong> Den maksimale dagpengesats i 2026 er{" "}
          <strong>{MAX} pr. måned</strong> for fuldtidsforsikrede og{" "}
          <strong>{DELTID} pr. måned</strong> for deltidsforsikrede — begge beløb før skat.
          Nyuddannede uden tilstrækkelig arbejdserfaring får i stedet dimittendsats, som er{" "}
          {DIMITTEND_UDEN} pr. måned ({DIMITTEND_UDEN_PCT} % af max) uden forsørgelsespligt og{" "}
          {DIMITTEND_MED} pr. måned ({DIMITTEND_MED_PCT} % af max) med forsørgelsespligt.
          Tallene er verificeret mod Beskæftigelsesministeriets sats-tabel for 2026.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn din dagpengesats</p>
          <p className="text-blue-700 dark:text-blue-400">
            Vores <Link href="/dagpenge" className="underline font-medium">dagpengeberegner</Link>{" "}
            regner din sats ud fra din månedsløn og dit timetal, så du kan se dine{" "}
            {MAX} kroner i praksis.
          </p>
        </div>

        <h2>Dagpenge-satser 2026</h2>
        <p>
          Satserne gælder fra 1. januar 2026 og er oplyst af Beskæftigelsesministeriet, der
          henviser til Styrelsen for Arbejdsmarked og Rekruttering som primærkilde.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Sats 2026 (før skat)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Max dagpenge, fuldtidsforsikret</td>
                <td>{MAX} pr. md</td>
              </tr>
              <tr>
                <td>Max dagpenge, deltidsforsikret</td>
                <td>{DELTID} pr. md</td>
              </tr>
              <tr>
                <td>Dimittend, fuldtid, med forsørgelsespligt</td>
                <td>{DIMITTEND_MED} pr. md</td>
              </tr>
              <tr>
                <td>Dimittend, deltid, med forsørgelsespligt</td>
                <td>{kr(DAGPENGE_2026.dimittendDeltidMedForsorgerpligt)} pr. md</td>
              </tr>
              <tr>
                <td>Dimittend, fuldtid, uden forsørgelsespligt</td>
                <td>{DIMITTEND_UDEN} pr. md</td>
              </tr>
              <tr>
                <td>Dimittend, deltid, uden forsørgelsespligt</td>
                <td>{kr(DAGPENGE_2026.dimittendDeltidUdenForsorgerpligt)} pr. md</td>
              </tr>
              <tr>
                <td>G-dag, hel dagpengegodtgørelse</td>
                <td>{kr(DAGPENGE_2026.gaDag)} pr. dag</td>
              </tr>
              <tr>
                <td>G-dag, halv dagpengegodtgørelse</td>
                <td>{kr(DAGPENGE_2026.gaDagHalv)} pr. dag</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Sådan beregnes din dagpengesats</h2>
        <p>
          Dagpenge er <strong>{DAGPENGE_2026.dagpengeProcent * 100} % af din løn efter
          AM-bidrag</strong>. Beregningen ser sådan ud:
        </p>
        <ol>
          <li>Find din gennemsnitlige månedsindkomst fra de bedste 12 måneder inden for de seneste 24 måneder</li>
          <li>Træk 8 % AM-bidrag fra månedslønnen</li>
          <li>Gang resten med {DAGPENGE_2026.dagpengeProcent * 100} %</li>
          <li>Satsen kan aldrig overstige max på {MAX} pr. md for en fuldtidsforsikret</li>
        </ol>
        <p>
          <strong>Eksempel 1 — under loftet:</strong> Med en gennemsnitlig månedsløn på 20.000 kr
          er lønnen efter AM-bidrag {kr(EKSEMPEL_UNDER_LOFT.grundlag)}, og dagpengene bliver{" "}
          {kr(EKSEMPEL_UNDER_LOFT.beregnet)} pr. måned. Loftet rammer du ikke.
        </p>
        <p>
          <strong>Eksempel 2 — over loftet:</strong> Med en månedsløn på 30.000 kr er lønnen efter
          AM-bidrag {kr(EKSEMPEL_OVER_LOFT.grundlag)}, og 90 % af det er{" "}
          {kr(EKSEMPEL_OVER_LOFT.beregnet)} pr. måned. Det overstiger max, så du får{" "}
          {MAX} pr. måned.
        </p>
        <p>
          I praksis rammer de fleste fuldtidsbeskæftigede loftet ved en månedsløn på omkring{" "}
          {kr(LOEN_FOR_MAX)} før skat.
        </p>

        <h2>Krav til dagpenge</h2>
        <p>For at få dagpenge skal du opfylde en række betingelser:</p>
        <ul>
          <li><strong>A-kasse-medlemskab:</strong> Du skal have været medlem af en A-kasse i mindst {DAGPENGE_2026.aKasseMedlemskabMdr / 12} år</li>
          <li><strong>Beskæftigelseskrav:</strong> Du skal have haft fuldtidsarbejde i mindst {formatNumber(DAGPENGE_2026.indkomstkravTimer, "da")} timer inden for de seneste {DAGPENGE_2026.indkomstkravAar} år — alternativt opfylde dit A-kasses indkomstkrav</li>
          <li><strong>Tilmelding:</strong> Du skal tilmelde dig som ledig på Jobnet.dk den første ledighedsdag</li>
          <li><strong>Rådighed:</strong> Du skal stå til rådighed for arbejdsmarkedet og aktivt søge job</li>
        </ul>

        <h2>Dagpengeperioden</h2>
        <p>
          Du kan få dagpenge i op til <strong>2 år</strong>, svarende til{" "}
          {formatNumber(DAGPENGE_2026.dagpengeperiodeTimer, "da")} timer for en
          fuldtidsforsikret, inden for en 3-årig referenceperiode. Perioden tæller kun de timer,
          du modtager dagpenge for — ikke timer med arbejde, sygdom eller barsel.
        </p>
        <p>Finder du arbejde undervejs, forlænges din dagpengeperiode tilsvarende.</p>

        <h2>Dimittendsats for nyuddannede</h2>
        <p>
          Nyuddannede, der ikke har nok arbejdserfaring til at opfylde beskæftigelseskravet på{" "}
          {formatNumber(DAGPENGE_2026.indkomstkravTimer, "da")} timer, kan få dagpenge til
          dimittendsatsen. I 2026 er den:
        </p>
        <ul>
          <li><strong>Uden forsørgelsespligt, fuldtid:</strong> {DIMITTEND_UDEN} pr. md ({DIMITTEND_UDEN_PCT} % af max)</li>
          <li><strong>Med forsørgelsespligt, fuldtid:</strong> {DIMITTEND_MED} pr. md ({DIMITTEND_MED_PCT} % af max)</li>
          <li><strong>Deltidsforsikret:</strong> 2/3 af begge beløb</li>
        </ul>
        <p>
          For at få dimittendsats skal du have afsluttet en uddannelse af mindst{" "}
          {DAGPENGE_2026.dimittendUddannelseMdr} måneders varighed og tilmeldt dig A-kassen senest{" "}
          {DAGPENGE_2026.dimittendTilmeldingDage} dage efter uddannelsens afslutning.
        </p>

        <h2>Supplerende dagpenge</h2>
        <p>
          Arbejder du på deltid, kan du i visse tilfælde få supplerende dagpenge. Det kræver:
        </p>
        <ul>
          <li>Du skal arbejde under {DAGPENGE_2026.supplerendeTimestraenPerMdr} timer om måneden</li>
          <li>Din arbejdsgiver skal godkende, at du kan overtage fuldtidsarbejde med dags varsel</li>
          <li>Du kan kun få supplerende dagpenge i op til {DAGPENGE_2026.supplerendeUger} uger inden for {DAGPENGE_2026.supplerendePeriodeUger} uger</li>
        </ul>

        <h2>G-dag: hvad din arbejdsgiver betaler</h2>
        <p>
          En G-dag er en dag, hvor din arbejdsgiver betaler dagpengegodtgørelse til din A-kasse,
          fordi du er tilmeldt som arbejdssøgende. Hel godtgørelse er{" "}
          {kr(DAGPENGE_2026.gaDag)} pr. dag i 2026 og halv godtgørelse{" "}
          {kr(DAGPENGE_2026.gaDagHalv)} pr. dag. Det er en udgift for arbejdsgiveren, ikke en
          ydelse til dig.
        </p>

        <h2>Dagpenge vs. kontanthjælp</h2>
        <p>
          Dagpenge og kontanthjælp er to forskellige ydelser. Dagpenge kræver A-kasse-medlemskab
          og er typisk højere. Kontanthjælp er for borgere uden A-kasse-dækning og er
          behovsprøvet mod ægtefælles indkomst og formue.
        </p>

        <h2>Dagpenge og skat</h2>
        <p>
          Dagpenge er skattepligtig indkomst. Du betaler skat af dine dagpenge ligesom af
          almindelig løn — dog betales der ikke AM-bidrag af dagpenge. Vil du se, hvad du får
          udbetalt?{" "}
          <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">
            Prøv vores løn efter skat-beregner
          </Link>.
        </p>

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
