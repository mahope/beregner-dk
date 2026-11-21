import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import { NaesteSkridt } from "@/components/BlogNaesteSkridt";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import { OG_IMAGE } from "@/lib/page-helpers";
import {
  BOERNEBIDRAG_AAR,
  BOERNEBIDRAG_2026,
  BOERNEBIDRAG_KILDE,
  FRADRAGSVAERDI_PCT,
  INDKOMSTNIVEUER_2026,
  MAX_ANTAL_BOERN,
  SKATTEFRADRAG_NORMALBIDRAG_MAANED,
  beregnBoernebidrag,
  indkomstNiveauRækker,
} from "@/lib/boernebidrag";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: { absolute: titel },
    description: beskrivelse,
    keywords: [
      "børnebidrag 2026",
      "børnebidrag sats 2026",
      "børnebidrag beregner",
      "forhøjet børnebidrag",
      "hvor meget skal man betale i børnebidrag",
      "børnebidrag fradrag",
      "normalbidrag",
    ],
    openGraph: {
      images: OG_IMAGE,
      title: titel,
      description: beskrivelse,
      url: `${baseUrl}/blog/boernebidrag-2026-satser-og-regler`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/boernebidrag-2026-satser-og-regler`,
    },
  };
}

const da = (beloeb: number) => formatNumber(beloeb, "da");

const satser = BOERNEBIDRAG_2026;
const normalbidragAar = satser.grundbeloebAar + satser.tillaegAar;

/**
 * Eksemplet er Familieretshusets eget: én bidragsbetaler på 610.000 kr. med
 * ét barn. Alt i teksten læses af dette resultat, så ingen beløb, nedsættelse
 * eller fradrag i artiklen er skrevet ind med hånden.
 */
const eksempel = beregnBoernebidrag({ antalBorn: 1, aarligIndomst: 610_000 });
const eksempelFradragVaerdi = Math.round(
  (eksempel.skattefradragMaaned * FRADRAGSVAERDI_PCT) / 100,
);
const eksempelFradragVaerdiAar = eksempelFradragVaerdi * 12;
/**
 * Det forkerte regnestykke, artiklen adskiller sig fra: samme procentsats
 * regnet af hele normalbidraget. Forskellen er tillægget, og den er stor nok
 * til at ændre en aftale.
 */
const eksempelForkertGrundlag =
  satser.normalbidragMaaned +
  (satser.normalbidragMaaned * eksempel.niveauPct) / 100;
const eksempelForskel = eksempelForkertGrundlag - eksempel.bidragPrBarnMaaned;

/** Kolonnerne i indkomsttabellen: indkomstoversigten har én kolonne pr. antal børn. */
const antalBorn = Array.from({ length: MAX_ANTAL_BOERN }, (_, i) => i + 1);

/**
 * Titel og beskrivelse dannes af satserne, så de aldrig kan stå i modstrid
 * med tabellen og med beregneren på /boernebidrag.
 */
const titel = `Børnebidrag ${BOERNEBIDRAG_AAR}: ${da(satser.normalbidragMaaned)} kr. pr. måned og forhøjet bidrag`;

const beskrivelse =
  `Normalbidraget i ${BOERNEBIDRAG_AAR} er ${da(satser.normalbidragMaaned)} kr. pr. måned. ` +
  `Se hvordan forhøjet bidrag beregnes, de vejledende indkomstgrænser og skattefradraget.`;

const faqItems = [
  {
    question: `Hvor meget er børnebidrag i ${BOERNEBIDRAG_AAR}?`,
    answer:
      `Normalbidraget er ${da(satser.normalbidragMaaned)} kr. pr. måned i ${BOERNEBIDRAG_AAR}. ` +
      `Det består af et grundbeløb på ${da(satser.grundbeloebMaaned)} kr. og et tillæg på ${da(satser.tillaegMaaned)} kr. ` +
      `Regnet om til et helt år er det ${da(normalbidragAar)} kr. Har du en høj indkomst, bliver bidraget forhøjet med en procentsats af grundbeløbet.`,
  },
  {
    question: "Hvordan beregnes et forhøjet bidrag?",
    answer:
      `Et forhøjet bidrag er altid normalbidraget plus en procentsats af *grundbeløbet* — ikke af hele normalbidraget. ` +
      `Ved 100 % til et barn er det ${da(satser.grundbeloebMaaned)} + ${da(satser.grundbeloebMaaned)} + ${da(satser.tillaegMaaned)} = ${da(eksempel.bidragPrBarnMaaned)} kr. pr. måned. ` +
      `Din indkomst afgør, om procentsatsen bliver 100, 200 eller 300 %.`,
  },
  {
    question: "Hvornår skal man betale forhøjet børnebidrag?",
    answer:
      `Der er ingen fast grænse i loven. Familieretshuset arbejder med de vejledende indkomstbeløb, Social- og Boligministeriet udgiver. ` +
      `I ${BOERNEBIDRAG_AAR} udløser en indkomst fra ca. ${da(INDKOMSTNIVEUER_2026[100][0])} kr. 100 % ved ét barn, fra ${da(INDKOMSTNIVEUER_2026[200][0])} kr. 200 % og fra ${da(INDKOMSTNIVEUER_2026[300][0])} kr. 300 %. ` +
      `Grænserne stiger med antallet af børn. Du eller forældrene kan også aftale et højere bidrag.`,
  },
  {
    question: "Hvor meget får jeg i skat tilbage for børnebidrag?",
    answer:
      `Betaler du normalbidraget, er fradraget ${da(SKATTEFRADRAG_NORMALBIDRAG_MAANED)} kr. pr. måned — altså grundbeløbet. ` +
      `Er bidraget aftalt i stedet, er fradraget beløbet minus tillægget på ${da(satser.tillaegMaaned)} kr. ` +
      `Skattestyrelsen regner med en fradragsværdi på ca. ${FRADRAGSVAERDI_PCT} %, så fradraget i eksemplet her svarer til ca. ${da(eksempelFradragVaerdi)} kr. pr. måned.`,
  },
  {
    question: "Er tallene fra beregneren bindende?",
    answer:
      `Nej. Normalbidraget er et fast beløb, men indkomstgrænserne for forhøjet bidrag er vejledende, og det endelige bidrag fastsættes af Familieretshuset eller aftales mellem forældrene. ` +
      `Tallene giver dig et solidt udgangspunkt for en aftale eller en sag.`,
  },
  {
    question: "Regner beregneren med alt, jeg betaler?",
    answer:
      `Nej. Bidragsberegneren regner kun med antal børn under 18 og din årlige indkomst. ` +
      `Samvær, boligudgifter, hjemmetilskud og dine øvrige forpligtelser indgår ikke — de kan du have med, når du skal vurdere et samlet beløb.`,
  },
];

export default function BoernebidragBlogPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BlogArticleSchema
        slug="boernebidrag-2026-satser-og-regler"
        title={titel}
        description={beskrivelse}
        category="Familie"
      />

      <nav className="text-sm mb-4 text-gray-600 dark:text-gray-400">
        <Link href="/" className="hover:underline">
          Forside
        </Link>
        {" / "}
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
        {" / "}
        <span>Børnebidrag {BOERNEBIDRAG_AAR}</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <h1>Børnebidrag {BOERNEBIDRAG_AAR}: satser, regler og hvad du får i skat</h1>
        <p className="lead">
          Børnebidrag er det bidrag, den ene forælder betaler til den anden, når
          barnet bor fast hos hende eller ham. Når der ikke er aftalt noget andet,
          er beløbet <strong>normalbidraget</strong> på{" "}
          {da(satser.normalbidragMaaned)} kr.
          pr. måned. Her får du satsen, regnestykket bag et forhøjet bidrag, de
          vejledende indkomstgrænser og skattefradraget.
        </p>

        <h2>Normalbidraget i {BOERNEBIDRAG_AAR}</h2>
        <p>
          Normalbidraget består af to beløb, og det er nemmest at holde styr på
          dem hver for sig — især fordi skattefradraget følger grundbeløbet alene.
        </p>
        <table>
          <thead>
            <tr>
              <th>Del</th>
              <th>Pr. måned</th>
              <th>Pr. år</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Grundbeløb</td>
              <td>{da(satser.grundbeloebMaaned)} kr.</td>
              <td>{da(satser.grundbeloebAar)} kr.</td>
            </tr>
            <tr>
              <td>Tillæg</td>
              <td>{da(satser.tillaegMaaned)} kr.</td>
              <td>{da(satser.tillaegAar)} kr.</td>
            </tr>
            <tr>
              <td>
                <strong>Normalbidrag i alt</strong>
              </td>
              <td>
                <strong>{da(satser.normalbidragMaaned)} kr.</strong>
              </td>
              <td>
                <strong>{da(normalbidragAar)} kr.</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          Beløbet gælder pr. barn og reguleres hvert år den 1. januar. For flere
          børn lægges bidraggene sammen, barn for barn.
        </p>

        <h2>Sådan beregnes et forhøjet bidrag</h2>
        <p>
          Har bidragsbetaleren en høj indkomst, bliver bidraget forhøjet med et
          procenttillæg. Her er den detalje, de fleste får forkert: procentsatsen
          regnes af <strong>grundbeløbet</strong> på {da(satser.grundbeloebMaaned)}{" "}
          kr. — ikke af hele normalbidraget på {da(satser.normalbidragMaaned)} kr.
          Familieretshuset skriver direkte, at et forhøjet bidrag altid udgør
          normalbidraget plus en procentsats af normalbidragets grundbeløb.
        </p>
        <p>
          <strong>Eksempel:</strong> Én forælder med en årlig indkomst på{" "}
          {da(eksempel.aarligIndomst)} kr. og ét barn. Indkomsten er over den
          vejledende grænse på {da(INDKOMSTNIVEUER_2026[100][0])} kr., så bidraget
          forhøjes med 100 % af grundbeløbet:
        </p>
        <ul>
          <li>
            Grundbeløb: {da(satser.grundbeloebMaaned)} kr.
          </li>
          <li>
            Tillæg: {da(satser.tillaegMaaned)} kr.
          </li>
          <li>
            100 % af grundbeløbet: {da(eksempel.procentsTillaegMaaned)} kr.
          </li>
          <li>
            <strong>
              Bidrag pr. måned: {da(eksempel.bidragPrBarnMaaned)} kr.
            </strong>{" "}
            ({da(eksempel.bidragSamletAar)} kr. om året)
          </li>
        </ul>
        <p>
          Var procentsatsen i stedet regnet af hele normalbidraget, ville bidraget
          i eksemplet blive {da(satser.normalbidragMaaned)} +{" "}
          {da(satser.normalbidragMaaned)} = {da(eksempelForkertGrundlag)} kr. pr.
          måned — altså {da(eksempelForskel)} kr. mere. Derfor er detaljen med
          grundbeløbet værd at kende, før du aftaler et beløb.
        </p>

        <h2>De vejledende indkomstgrænser for {BOERNEBIDRAG_AAR}</h2>
        <p>
          Familieretshuset arbejder med vejledende indkomstbeløb fra
          indkomstoversigten, som Social- og Boligministeriet udgiver for{" "}
          {BOERNEBIDRAG_AAR}. Tallene i rækkerne er den årlige indkomst, hvor
          niveauet begynder, og de stiger med antallet af børn:
        </p>
        <table>
          <thead>
            <tr>
              <th>Procenttillæg</th>
              {antalBorn.map((n) => (
                <th key={n}>
                  {n} {n === 1 ? "barn" : "børn"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indkomstNiveauRækker().map((niveau) => (
              <tr key={niveau.niveauPct}>
                <td>{niveau.niveauPct} %</td>
                {niveau.grae.map((grae, index) => (
                  <td key={index}>{da(grae)} kr.</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Tallene er vejledende og ikke en afgørelse. Forældrene kan aftale et
          andet beløb, og det er først når sagen kommer for
          Familieretshuset, at beløbet bliver fastsat.
        </p>

        <h2>Hvad du får tilbage i skat</h2>
        <p>
          Børnebidrag er fradragsberettiget for den, der betaler. Der er to
          regler, og de dækkes af ét regnestykke, fordi normalbidraget minus
          tillægget netop er grundbeløbet:
        </p>
        <ul>
          <li>
            <strong>Betaler du normalbidraget:</strong> fradrag på{" "}
            {da(SKATTEFRADRAG_NORMALBIDRAG_MAANED)} kr. pr. måned.
          </li>
          <li>
            <strong>Er bidraget aftalt:</strong> fradrag for beløbet minus tillægget
            på {da(satser.tillaegMaaned)} kr.
          </li>
        </ul>
        <p>
          I eksemplet herover bliver fradraget derfor {da(eksempel.skattefradragMaaned)}{" "}
          kr. pr. måned. Skattestyrelsen regner med en fradragsværdi på ca.{" "}
          {FRADRAGSVAERDI_PCT} %, så det svarer til ca. {da(eksempelFradragVaerdi)}{" "}
          kr. om måneden i lavere skat — eller ca.{" "}
          {da(eksempelFradragVaerdiAar)} kr. om året. Er du ikke
          topskattepligtig, er værdien mindre.
        </p>
        <p>
          Fradraget slår igennem på din{" "}
          <Link href="/skattefradrag" className="text-blue-600 hover:underline">
            årsopgørelse
          </Link>
          , og du kan samtidig få fradrag for andre poster. Vil du se din samlede
          skat, kan du regne på din{" "}
          <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">
            løn efter skat
          </Link>
          .
        </p>

        <h2>Hvad beregneren ikke tager med</h2>
        <p>
          Beregneren på{" "}
          <Link href="/boernebidrag" className="text-blue-600 hover:underline">
            /boernebidrag
          </Link>{" "}
          bruger to tal: antal børn under 18 og din årlige indkomst. Det er de
          to tal, regnestykket hos Familieretshuset bygger på. Samværsordninger,
          boligudgifter, hjemmetilskud, øvrige børnebidrag og dine andre
          forpligtelser indgår ikke, og de spiller alligevel ind, når der skal
          vurderes et samlet beløb. Se også{" "}
          <Link href="/boernepenge" className="text-blue-600 hover:underline">
            børnepengeberegneren
          </Link>
          , hvis du vil have den ydelse, der automatisk udbetales til begge
          forældre.
        </p>

        <h2>Kilder</h2>
        <ul>
          <li>
            Normalbidragets størrelse og procentsatsen ved forhøjet bidrag:{" "}
            <a href={BOERNEBIDRAG_KILDE.beregning} className="underline" rel="noopener noreferrer">
              familieretshuset.dk
            </a>
            .
          </li>
          <li>
            De vejledende indkomstbeløb for {BOERNEBIDRAG_AAR}: indkomstoversigten
            fra Social- og Boligministeriet,{" "}
            <a href={BOERNEBIDRAG_KILDE.indkomstoversigt} className="underline" rel="noopener noreferrer">
              retsinformation.dk
            </a>
            .
          </li>
          <li>
            Skattefradrag for børnebidrag:{" "}
            <a href={BOERNEBIDRAG_KILDE.skat} className="underline" rel="noopener noreferrer">
              skat.dk
            </a>
            .
          </li>
        </ul>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Alle tal i artiklen læses af modulet bag beregneren, så siden, tabellerne
          og værktøjet ikke kan komme til at stå med forskellige beløb. Verificeret{" "}
          {BOERNEBIDRAG_KILDE.verifiedAt}.
        </p>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.question}</h3>
            <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
          </div>
        ))}
      </article>

      <FAQSchema items={faqItems} />

      <NaesteSkridt
        href="/boernebidrag"
        handling="Beregn dit børnebidrag"
        beskrivelse="Læg antal børn og din indkomst ind, og få normalbidrag, forhøjet bidrag og skattefradraget ud med 2026-satserne."
        sekundaer={{ href: "/skattefradrag", handling: "Sammenlign med dine øvrige skattefradrag" }}
      />

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede beregnere</h2>
        <div className="grid gap-4">
          <Link href="/boernebidrag" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Børnebidragsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn normalbidrag, forhøjet bidrag og skattefradrag</p>
          </Link>
          <Link href="/boernepenge" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Børnepengeberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se hvad du får i børne- og ungeydelse i 2026</p>
          </Link>
          <Link href="/skattefradrag" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Skattefradragsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Læg alle dine fradrag sammen og se værdien</p>
          </Link>
          <Link href="/brutto-netto" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Brutto-netto beregner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Hvad du har tilbage, når bidraget og skatten er trukket fra</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/boernepenge-2026-satser-og-regler" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Børnepenge 2026: satser og regler →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Hvad du får udbetalt, og hvornår pengene står på konto</p>
          </Link>
          <Link href="/blog/fradrag-2026-komplet-guide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Fradrag 2026: komplet guide →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Alle fradragene på ét sted, med satser for 2026</p>
          </Link>
          <Link href="/blog/skat-2026-alt-du-skal-vide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Skat 2026: alt du skal vide →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ændringer i skatten, og hvad de betyder for din lønseddel</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
