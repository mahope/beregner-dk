import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import { SATSER_2026, SKATTEFRADRAG_2026 } from "@/lib/satser-2026";

/**
 * Alle tal i artiklen læses fra SATSER_2026/SKATTEFRADRAG_2026, så de ikke kan
 * glide fra de beregnere, der bruger samme fil. Kilder og verificeringsdato
 * står i de enkelte felter.
 */
const da = (beloeb: number) => formatNumber(beloeb, "da");
const pct = (sats: number) => formatNumber(sats * 100, "da", { maximumFractionDigits: 3 });

/** Eksempel: 40.000 kr brutto pr. måned i en gennemsnitlig kommune. */
const BRUTTO_AAR = 480_000;
const AM_AAR = BRUTTO_AAR * SATSER_2026.amBidrag;
const EFTER_AM_AAR = BRUTTO_AAR - AM_AAR;
const BESKAEFTIGELSESFRADRAG_AAR = Math.min(
  EFTER_AM_AAR * SATSER_2026.beskaeftigelsesfradragPct,
  SATSER_2026.beskaeftigelsesfradragMax,
);
const SKATTEPLIGTIG_AAR = Math.max(
  0,
  EFTER_AM_AAR - SATSER_2026.personfradrag - BESKAEFTIGELSESFRADRAG_AAR,
);
const BUNDSKAT_AAR = SKATTEPLIGTIG_AAR * SATSER_2026.bundskat;
const KOMMUNESKAT_AAR = SKATTEPLIGTIG_AAR * SATSER_2026.kommuneskatSnit;
const KIRKESKAT_AAR = SKATTEPLIGTIG_AAR * SATSER_2026.kirkeskatSnit;
const NETTO_AAR =
  BRUTTO_AAR - AM_AAR - BUNDSKAT_AAR - KOMMUNESKAT_AAR - KIRKESKAT_AAR;
const md = (aar: number) => aar / 12;

/** Øverste statslige marginalskat: bundskat + mellemskat + topskat + top-topskat. */
const MAKS_STATSSKAT =
  SATSER_2026.bundskat + SATSER_2026.mellemskat + SATSER_2026.topskat + SATSER_2026.topTopskat;
/** Højeste samlede marginalskat med gennemsnitlig kommune- og kirkeskat. */
const MAKS_MARGINALSKAT =
  MAKS_STATSSKAT + SATSER_2026.kommuneskatSnit + SATSER_2026.kirkeskatSnit;

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;
  const title = `Skat 2026: personfradrag ${da(SATSER_2026.personfradrag)} kr, bundskat ${pct(SATSER_2026.bundskat)} %`;
  const description = `De vigtigste skattesatser for 2026: AM-bidrag ${pct(SATSER_2026.amBidrag)} %, personfradrag ${da(SATSER_2026.personfradrag)} kr, bundskat ${pct(SATSER_2026.bundskat)} %, topskat fra ${da(SATSER_2026.topskatGraense)} kr og beskæftigelsesfradrag ${pct(SATSER_2026.beskaeftigelsesfradragPct)} %. Med regneeksempel på 40.000 kr i løn.`;

  return {
    title,
    description,
    keywords: [
      "skat 2026",
      "skattesatser 2026",
      "personfradrag 2026",
      "topskat 2026",
      "kommuneskat 2026",
      "skatteændringer 2026",
      "AM-bidrag 2026",
      "beskæftigelsesfradrag 2026",
    ],
    openGraph: {
      title,
      description,
      url: `${baseUrl}/blog/skat-2026-alt-du-skal-vide`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/skat-2026-alt-du-skal-vide`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er personfradraget i 2026?",
    answer: `Personfradraget (bundfradraget) er ${da(SATSER_2026.personfradrag)} kr i 2026. Det betyder, at du ikke betaler statsskat af de første ${da(SATSER_2026.personfradrag)} kr af din indkomst efter AM-bidrag.`,
  },
  {
    question: "Hvornår betaler man topskat i 2026?",
    answer: `I 2026 er den gamle topskat delt i tre trin. Du betaler mellemskat (${pct(SATSER_2026.mellemskat)} %) over ${da(SATSER_2026.mellemskatGraense)} kr, topskat (yderligere ${pct(SATSER_2026.topskat)} %) over ${da(SATSER_2026.topskatGraense)} kr og top-topskat (${pct(SATSER_2026.topTopskat)} %) over ${da(SATSER_2026.topTopskatGraense)} kr — alle grænser målt efter AM-bidrag.`,
  },
  {
    question: "Hvor meget er AM-bidraget i 2026?",
    answer: `AM-bidraget (arbejdsmarkedsbidraget) er ${pct(SATSER_2026.amBidrag)} % i 2026. Det trækkes af din bruttoløn, før der beregnes skat.`,
  },
  {
    question: "Hvor meget er kommuneskatten i 2026?",
    answer: `Kommuneskatten varierer fra ca. 22,5 % til 27,8 % afhængigt af din kommune. Gennemsnittet for 2026 er ${pct(SATSER_2026.kommuneskatSnit)} % (SVMN), og kirkeskatten er i gennemsnit ${pct(SATSER_2026.kirkeskatSnit)} %.`,
  },
  {
    question: "Hvad kan jeg trække fra i skat?",
    answer: `Ud over de automatiske fradrag kan du trække rentefradrag, kørselsfradrag, fagforeningskontingent (op til ${da(SKATTEFRADRAG_2026.fagforeningMax)} kr) og A-kasse-kontingent (fuldt ud, uden loft). Håndværkerfradraget er højst ${da(SKATTEFRADRAG_2026.haandvaerkerMax)} kr pr. person pr. år, og servicefradraget har et særskilt loft på ${da(SKATTEFRADRAG_2026.servicefradragMax)} kr.`,
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
            Skat 2026: personfradrag {da(SATSER_2026.personfradrag)} kr, bundskat{" "}
            {pct(SATSER_2026.bundskat)} %
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>Opdateret 26. september 2026</span>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Hvert år justeres skattesatser og fradrag i Danmark. De vigtigste tal for 2026 er
          AM-bidrag {pct(SATSER_2026.amBidrag)} %, personfradrag{" "}
          {da(SATSER_2026.personfradrag)} kr og bundskat {pct(SATSER_2026.bundskat)} %.
          Denne guide giver dig et komplet overblik over satserne — og et regneeksempel, der
          viser hvad 40.000 kr i løn bliver til, før skat.
        </p>

        <h2>Oversigt: Skattesatser 2026</h2>
        <p>
          Her er de vigtigste skattesatser og beløbsgrænser for 2026. Fradragsgrænserne for
          mellemskat, topskat og top-topskat gælder for indkomsten <em>efter</em> AM-bidrag.
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
                <td>{pct(SATSER_2026.amBidrag)} %</td>
              </tr>
              <tr>
                <td>Personfradrag</td>
                <td>{da(SATSER_2026.personfradrag)} kr</td>
              </tr>
              <tr>
                <td>Bundskat</td>
                <td>{pct(SATSER_2026.bundskat)} %</td>
              </tr>
              <tr>
                <td>Mellemskat</td>
                <td>
                  {pct(SATSER_2026.mellemskat)} % (over{" "}
                  {da(SATSER_2026.mellemskatGraense)} kr)
                </td>
              </tr>
              <tr>
                <td>Topskat</td>
                <td>
                  {pct(SATSER_2026.topskat)} % (over {da(SATSER_2026.topskatGraense)} kr)
                </td>
              </tr>
              <tr>
                <td>Top-topskat</td>
                <td>
                  {pct(SATSER_2026.topTopskat)} % (over{" "}
                  {da(SATSER_2026.topTopskatGraense)} kr)
                </td>
              </tr>
              <tr>
                <td>Beskæftigelsesfradrag</td>
                <td>
                  {pct(SATSER_2026.beskaeftigelsesfradragPct)} %, loft{" "}
                  {da(SATSER_2026.beskaeftigelsesfradragMax)} kr
                </td>
              </tr>
              <tr>
                <td>Gennemsnitlig kommuneskat</td>
                <td>ca. {pct(SATSER_2026.kommuneskatSnit)} %</td>
              </tr>
              <tr>
                <td>Kirkeskat (gennemsnit)</td>
                <td>ca. {pct(SATSER_2026.kirkeskatSnit)} %</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Kilder:{" "}
          <a
            href="https://skat.dk/borger/om-skat/alle-satser-og-belob"
            className="underline"
            rel="noopener noreferrer"
          >
            skat.dk
          </a>
          ,{" "}
          <a
            href="https://www.skm.dk/aktuelt/tabeller-og-satser/"
            className="underline"
            rel="noopener noreferrer"
          >
            skm.dk
          </a>{" "}
          (personskatter, AM-bidrag, fradrag) og{" "}
          <a href="https://www.svmn.dk/" className="underline" rel="noopener noreferrer">
            SVMN
          </a>{" "}
          (kommune- og kirkeskatgennemsnit) — verificeret 25. september 2026. Kommuneskat og
          kirkeskat er gennemsnit: din egen sats afhænger af kommune og af om du er medlem
          af folkekirken.
        </p>

        <h2>AM-bidrag: Det første der trækkes</h2>
        <p>
          Arbejdsmarkedsbidraget (AM-bidraget) er det allerførste, der trækkes af din bruttoløn.
          I 2026 er AM-bidraget <strong>{pct(SATSER_2026.amBidrag)} %</strong>. Det gælder
          al lønindkomst og beregnes før alle andre skatter og fradrag.
        </p>
        <p>
          Tjener du fx 35.000 kr brutto om måneden, betaler du 2.800 kr i AM-bidrag. De
          resterende 32.200 kr er din personlige indkomst, som danner grundlag for den øvrige
          skatteberegning.
        </p>

        <h2>Personfradraget: Din skattefri bundgrænse</h2>
        <p>
          Personfradraget er det beløb, du kan tjene skattefrit. I 2026 er personfradraget{" "}
          <strong>{da(SATSER_2026.personfradrag)} kr om året</strong> for voksne.
        </p>
        <p>
          Personfradraget modregnes i din skat — ikke i din indkomst. Med en gennemsnitlig
          kommune- og kirkeskat svarer det til en skattebesparelse på ca.{" "}
          {da(Math.round((SATSER_2026.personfradrag * (SATSER_2026.bundskat + SATSER_2026.kommuneskatSnit + SATSER_2026.kirkeskatSnit)) / 100) * 100)}{" "}
          kr årligt.
        </p>

        <h2>Kommuneskat: Stor forskel på din adresse</h2>
        <p>
          Kommuneskatten fastsættes af din kommune og varierer fra kommune til kommune.
          Landsgennemsnittet for 2026 er ca.{" "}
          <strong>{pct(SATSER_2026.kommuneskatSnit)} %</strong>, og den gennemsnitlige
          kirkeskat er ca. {pct(SATSER_2026.kirkeskatSnit)} %. Er du ikke medlem af
          folkekirken, betaler du ingen kirkeskat.
        </p>
        <p>
          Forskellen mellem en billig og en dyr kommune kan betyde tusindvis af kroner om
          året.
        </p>
        <p>
          Vil du se den præcise forskel?{" "}
          <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">
            Prøv vores løn efter skat-beregner
          </Link>{" "}
          og sammenlign din nettoløn i forskellige kommuner.
        </p>

        <h2>Bundskat, mellemskat og topskat</h2>
        <p>
          <strong>Bundskattesatsen</strong> er {pct(SATSER_2026.bundskat)} % i 2026 og
          beregnes af din personlige indkomst efter AM-bidrag, minus personfradraget og
          beskæftigelsesfradraget.
        </p>
        <p>
          Den gamle topskat er i 2026 delt op i tre trin: <strong>mellemskat</strong> (
          {pct(SATSER_2026.mellemskat)} % over {da(SATSER_2026.mellemskatGraense)} kr efter
          AM-bidrag), <strong>topskat</strong> ({pct(SATSER_2026.topskat)} % over{" "}
          {da(SATSER_2026.topskatGraense)} kr) og <strong>top-topskat</strong> (
          {pct(SATSER_2026.topTopskat)} % over           {da(SATSER_2026.topTopskatGraense)} kr). Med gennemsnitlig kommune- og
          kirkeskat er den højeste marginalskat dermed ca.{" "}
          {pct(Math.round(MAKS_MARGINALSKAT * 1000) / 1000)} % — højere i de dyreste
          kommuner.

        </p>

        <h2>Beskæftigelsesfradrag</h2>
        <p>
          Beskæftigelsesfradraget gives automatisk til alle, der arbejder. I 2026 er det{" "}
          <strong>{pct(SATSER_2026.beskaeftigelsesfradragPct)} %</strong> af din
          arbejdsindkomst efter AM-bidrag, dog med et loft på{" "}
          <strong>{da(SATSER_2026.beskaeftigelsesfradragMax)} kr</strong>. Fradraget
          nedsætter skattegrundlaget for både statsskat og kommuneskat.
        </p>
        <p>
          Du behøver ikke gøre noget for at få fradraget — det beregnes automatisk af SKAT.
        </p>

        <h2>Skattefradrag du selv skal huske</h2>
        <p>
          Udover de automatiske fradrag er der en række fradrag, du selv skal sikre dig. Alle
          beløb nedenfor er 2026-loft:
        </p>
        <ul>
          <li>
            <strong>Rentefradrag:</strong> Fradrag for renter på lån (bolig, bil,
            forbrugslån). Værdien afhænger af beløbsgrænsen — brug vores{" "}
            <Link href="/rentefradrag" className="text-blue-600 hover:underline">
              rentefradrag-beregner
            </Link>
            .
          </li>
          <li>
            <strong>Kørselsfradrag:</strong> Fradrag for transport mellem hjem og arbejde over{" "}
            {SATSER_2026.koerselBundgraense} km dagligt ({" "}
            {SATSER_2026.koerselBundgraense / 2} km én vej), herefter{" "}
            {da(SATSER_2026.koerselSatsLav)} kr./km op til{" "}
            {da(SATSER_2026.koerselHoejGraense)} km og{" "}
            {da(SATSER_2026.koerselSatsHoej)} kr./km over det. Se{" "}
            <Link href="/befordringsfradrag" className="text-blue-600 hover:underline">
              befordringsfradraget
            </Link>{" "}
            eller{" "}
            <Link href="/skattefradrag" className="text-blue-600 hover:underline">
              alle skattefradrag
            </Link>
            .
          </li>
          <li>
            <strong>Fagforening og A-kasse:</strong> Fagforeningskontingent kan trækkes op
            til {da(SKATTEFRADRAG_2026.fagforeningMax)} kr, mens A-kasse-kontingent kan
            trækkes fuldt fra uden loft.
          </li>
          <li>
            <strong>Håndværkerfradrag:</strong> Op til{" "}
            {da(SKATTEFRADRAG_2026.haandvaerkerMax)} kr for ydelser i hjemmet i 2026.
            Serviceydelser har et særskilt loft på{" "}
            {da(SKATTEFRADRAG_2026.servicefradragMax)} kr. Fradragsværdien af begge er ca.{" "}
            {pct(SKATTEFRADRAG_2026.boligfradragSkattevaerdi)} % af beløbet.
          </li>
          <li>
            <strong>Pension:</strong> Indbetalinger til ratepension og livrente er
            fradragsberettigede.
          </li>
        </ul>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Håndværkerfradragets og servicefradragets loft er hentet fra{" "}
          <a
            href={SKATTEFRADRAG_2026.sources.haandvaerkerfradrag}
            className="underline"
            rel="noopener noreferrer"
          >
            borgerhaandbog.dk
          </a>{" "}
          — verificeret {SKATTEFRADRAG_2026.verifiedAt}, fordi loftet ikke står maskinel
          læsbart på skat.dk. Kørselsfradragets satser er hæftet til skat.dk, men skal
          betragtes som vejledende, fordi vi ikke har kunnet hente primærkilden maskinelt.
        </p>

        <h2>Sådan beregner du din skat trin for trin</h2>
        <p>
          Lad os tage et eksempel med en månedsløn på 40.000 kr i en kommune på gennemsnittet
          ({pct(SATSER_2026.kommuneskatSnit)} % i kommuneskat og{" "}
          {pct(SATSER_2026.kirkeskatSnit)} % i kirkeskat):
        </p>
        <ol>
          <li>
            <strong>AM-bidrag:</strong> 40.000 × {pct(SATSER_2026.amBidrag)} % ={" "}
            {da(Math.round(md(AM_AAR)))} kr
          </li>
          <li>
            <strong>Personlig indkomst:</strong> 40.000 − {da(Math.round(md(AM_AAR)))} ={" "}
            {da(Math.round(md(EFTER_AM_AAR)))} kr
          </li>
          <li>
            <strong>Beskæftigelsesfradrag:</strong> {da(Math.round(md(BESKAEFTIGELSESFRADRAG_AAR)))}{" "}
            kr, som nedsætter skattegrundlaget
          </li>
          <li>
            <strong>Skattepligtig indkomst:</strong> {da(SATSER_2026.personfradrag)} kr
            personfradrag og {da(Math.round(md(BESKAEFTIGELSESFRADRAG_AAR)))} kr
            beskæftigelsesfradrag giver {da(Math.round(md(SKATTEPLIGTIG_AAR)))} kr
          </li>
          <li>
            <strong>Bundskat:</strong> {da(Math.round(md(SKATTEPLIGTIG_AAR)))} ×{" "}
            {pct(SATSER_2026.bundskat)} % = {da(Math.round(md(BUNDSKAT_AAR)))} kr
          </li>
          <li>
            <strong>Kommuneskat + kirkeskat:</strong> {da(Math.round(md(SKATTEPLIGTIG_AAR)))}{" "}
            kr × {pct(SATSER_2026.kommuneskatSnit + SATSER_2026.kirkeskatSnit)} % ={" "}
            {da(Math.round(md(KOMMUNESKAT_AAR + KIRKESKAT_AAR)))} kr
          </li>
          <li>
            <strong>Nettoudbetaling:</strong> ca. {da(Math.round(md(NETTO_AAR)))} kr om
            måneden før pension og andre fradrag
          </li>
        </ol>
        <p>
          Er du i tvivl om din konkrete skat?{" "}
          <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">
            Brug vores løn efter skat-beregner
          </Link>{" "}
          til at få et præcist estimat med din egen kommune.
        </p>

        <h2>De vigtigste punkter for 2026</h2>
        <p>
          Sådan ser de kildeførte 2026-satser ud, og hvad de betyder i praksis:
        </p>
        <ul>
          <li>
            <strong>AM-bidraget er {pct(SATSER_2026.amBidrag)} %</strong> — det trækkes fra
            brutto, før nogen anden skat regnes.
          </li>
          <li>
            <strong>Personfradraget er {da(SATSER_2026.personfradrag)} kr</strong> — den
            skattefrie bundgrænse, som er grundlaget for både stats- og kommuneskat.
          </li>
          <li>
            <strong>Bundskatten er {pct(SATSER_2026.bundskat)} %</strong>, og den gamle topskat
            er delt op i mellemskat ({pct(SATSER_2026.mellemskat)} %), topskat (
            {pct(SATSER_2026.topskat)} %) og top-topskat ({pct(SATSER_2026.topTopskat)} %).
          </li>
          <li>
            <strong>Beskæftigelsesfradraget er {pct(SATSER_2026.beskaeftigelsesfradragPct)} %
            </strong> af arbejdsindkomsten efter AM-bidrag med loft på{" "}
            {da(SATSER_2026.beskaeftigelsesfradragMax)} kr.
          </li>
          <li>
            <strong>Kommuneskatten er et gennemsnit på {pct(SATSER_2026.kommuneskatSnit)} %
            </strong> — din egen sats kan ligge både over og under det.
          </li>
        </ul>
        <p>
          Vi sammenligner ikke her med 2025-tal, fordi vi ikke har kunnet hente dem fra en
          myndighedskilde. De tal, der står ovenfor, er derimod kildeført — se kilden under
          tabellen.
        </p>

        <h2>Tips til at optimere din skat</h2>
        <ul>
          <li><strong>Tjek din forskudsopgørelse:</strong> Log ind på skat.dk og sikr dig, at dine fradrag er korrekte</li>
          <li><strong>Indbetal til pension:</strong> Ratepension giver fradrag nu og beskattes lavere ved udbetaling</li>
          <li><strong>Udnyt rentefradraget:</strong> Har du boliglån? Sørg for at renter er korrekt indberettet</li>
          <li>
            <strong>Kørselsfradrag:</strong> Mange glemmer at opgive fradrag for lang transport
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn din skat</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores{" "}
            <Link href="/loen-efter-skat" className="underline font-medium">
              løn efter skat-beregner
            </Link>{" "}
            til at se præcist, hvad du får udbetalt med 2026-satser. Du kan også se dine{" "}
            <Link href="/skattefradrag" className="underline font-medium">
              skattefradrag
            </Link>{" "}
            samlet, beregne dit{" "}
            <Link href="/rentefradrag" className="underline font-medium">
              rentefradrag
            </Link>{" "}
            og se dine{" "}
            <Link href="/feriepenge" className="underline font-medium">
              feriepenge
            </Link>
            .
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
