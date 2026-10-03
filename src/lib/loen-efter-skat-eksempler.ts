/**
 * De tal `/loen-efter-skat` gentager i sin egen tekst — i `description`,
 * `metaDescription` og i fire af sine otte FAQ-svar. Alle er skrevet i hånden,
 * og de håndskrevne tal var ikke bare den normale drift:
 * `BruttoNettoBeregner` læser allerede `SATSER_2026`, så **søgeresultatet og
 * værktøjet var to uafhængige tal**. Ændrede man en sats i `satser-2026.ts`,
 * ville lønberegneren vise den nye, mens titel, beskrivelse og `FAQPage`-JSON-LD
 * stod med den gamle. Sidens egen port (`regnestykker.test.ts`) kan ikke se
 * det: en streng med et tal er gyldig JSX.
 *
 * Alt læses nu fra {@link SATSER_2026} — samme modul som beregneren — og fra
 * `KOMMUNER`, gennem `formatBelob`, så der er én skrivemåde for beløb og én for
 * procenter.
 *
 * Den eneste ændring i dansk tekst er mellemrummet før procenttegnet: siden
 * skrev «8%», «7,5%» og «15%», mens husets øvrige moduler (`aktieskat-eksempler`,
 * `efterloen-eksempler`, `pension-eksempler`) skriver «8 %». Samme forskel som
 * blev rettet på `/efterloen` 3/10 og `/aktieskat` 3/10 — og her stod de to
 * metadatafelter oven i hinanden: `description` skrev «AM-bidrag (8%)» mens
 * `metaDescription` skrev «AM-bidrag (8 %)», altså modsagde søgeresultatet sig
 * selv i samme søgeresultat.
 *
 * {@link TOPTOPSKAT_GRAENSE} og {@link PERSONFRADRAG_2026} læses fra
 * modulet. Det gør **ikke** {@link GAMMEL_TOPSKAT_PCT} — den afskaffede sats på
 * 15 % har ingen kilde i repoet og er ikke slået op her (punkt 11); den er
 * sidens eksisterende påstand og er bevaret uændret, kun skrevet med mellemrum.
 * «49.700 kr» i personfradragssvaret er for samme grund bevaret som tekst: det er
 * *sidens* påstand om 2025-satsen, ikke noget modulet regner med.
 *
 * Kommuneskattens laveste og højeste sats er **afledt** af `KOMMUNER` i stedet
 * for at stå håndskrevet med «22,5 % (Rundersdal)» og «27,8 % (Langeland)»,
 * for tabellen er det eneste sted de to tal findes. Beregnerens forudindstillede
 * sats er stadig svmn.dk's gennemsnit og **ikke** tabellens uvægtede middeltal —
 * det er samme forskel som på `/dagpenge`, og de to tal skal ikke byttes om.
 */

import { formatBelob, getCurrencySuffix } from "./format";
import { KOMMUNER } from "./kommuner";
import { SATSER_2026 } from "./satser-2026";

const DA = "da" as const;

/**
 * «54.100 kr. » minus det afsluttende punktum — altså «54.100 kr.».
 *
 * `getCurrencySuffix("da")` er selve «kr.» med punktum, fordi det er en
 * forkortelse. Sætter man den i **midten** af en sætning og skriver bagefter
 * komma eller parentes, får man «641.200 kr.,» og «49.700 kr).» — altså den
 * dobbelte enhed og det dobbelte punktum, som `pension-dobbelt-valuta` 2/10
 * kostede på `/pension`. Derfor er der to varianter: {@link loenBelob} til
 * sidens og {@link loenBelobI} til løbende tekst.
 */
export const loenBelob = (belob: number) =>
  `${formatBelob(belob, DA)} ${getCurrencySuffix(DA)}`;

/** «54.100 kr» — til brug midt i en sætning. */
export const loenBelobI = (belob: number) =>
  `${formatBelob(belob, DA)} ${getCurrencySuffix(DA).replace(/\.$/, "")}`;

const kr = loenBelob;
const krI = loenBelobI;

/**
 * Procenter med to decimaler. `formatBelob`'s standard er nul decimaler, så
 * mellemskattens `0.075 × 100 = 7.5` blev skrevet «8 %» — to forskellige
 * satser ville få samme tal. `aktieskat-eksempler` har den samme `pct`, men
 * dens satser er 27/42/17, som er hele tal, så fejlen har aldrig kunnet vise
 * sig der. Derfor får den her sine egne to decimaler.
 */
const pct = (sats: number) => `${formatBelob(sats * 100, DA, 2)} %`;

/** Arbejdsmarkedsbidraget, som metadata og to FAQ-svar skriver. */
export const AM_BIDRAG = pct(SATSER_2026.amBidrag);

/** Mellemskattens sats, som to FAQ-svar skriver. */
export const MELLEMSKAT = pct(SATSER_2026.mellemskat);

/** Topskattens sats, som to FAQ-svar skriver. */
export const TOPSKAT = pct(SATSER_2026.topskat);

/** Top-topskattens sats, som FAQ-svaret om det nye tredje trin skriver. */
export const TOPTOPSKAT = pct(SATSER_2026.topTopskat);

/** Den afskaffede topskat. Kun i teksten — se modulens docblock. */
export const GAMMEL_TOPSKAT_PCT = "15 %";

/** Grænsen for mellemskat, målt efter AM-bidrag. */
export const MELLEMSKAT_GRAENSE = SATSER_2026.mellemskatGraense;

/** Grænsen for topskat, målt efter AM-bidrag. */
export const TOPSKAT_GRAENSE = SATSER_2026.topskatGraense;

/** Grænsen for top-topskat, målt efter AM-bidrag. */
export const TOPTOPSKAT_GRAENSE = SATSER_2026.topTopskatGraense;

/** Personfradraget for 2026. */
export const PERSONFRADRAG_2026 = SATSER_2026.personfradrag;

/** Den laveste kommunalskat i `KOMMUNER`, med kommunens navn. */
const lavsteKommuneskat = KOMMUNER.reduce((laveste, k) =>
  k.kommuneskat < laveste.kommuneskat ? k : laveste
);

/** Den højeste kommunalskat i `KOMMUNER`, med kommunens navn. */
const hoejesteKommuneskat = KOMMUNER.reduce((hoejeste, k) =>
  k.kommuneskat > hoejeste.kommuneskat ? k : hoejeste
);

/** «fra ca. 22,5 % (Rundersdal)» — samme sætning hver gang siden skriver den. */
export const KOMMUNESKAT_LAVESTE =
  `ca. ${formatBelob(lavsteKommuneskat.kommuneskat, DA, 1)} % (${lavsteKommuneskat.navn})`;

/** «til 27,8 % (Langeland)» */
export const KOMMUNESKAT_HOEJESTE =
  `${formatBelob(hoejesteKommuneskat.kommuneskat, DA, 1)} % (${hoejesteKommuneskat.navn})`;

/** Beskrivelsen til Open Graph, der læser de samme tal som `description`. */
export function loenEfterSkatOgBeskrivelse(): string {
  return (
    `Se hvad du får udbetalt efter skat. Gratis lønberegner med 2026 satser: ` +
    `AM-bidrag ${AM_BIDRAG}, personfradrag ${kr(PERSONFRADRAG_2026)} ` +
    `mellemskat fra ${krI(MELLEMSKAT_GRAENSE)} og topskat fra ` +
    `${kr(TOPSKAT_GRAENSE)}`
  );
}

/**
 * De otte FAQ-svar, hvoraf de fire med tal læses fra modulet. `kommuneskatSnit`
 * er svmn.dk's 2026-gennemsnit — beregnerens forudindstillede sats — og bliver
 * skrevet ind af kaldende side, fordi sætningen siger, hvilken af de to
 * gennemsnit der er tale om.
 */
export function loenEfterSkatFaqItems(
  kommuneskatSnit: string
): { question: string; answer: string }[] {
  return [
    {
      question: "Hvordan beregnes min løn efter skat?",
      answer:
        `Din nettoløn beregnes ved først at trække AM-bidrag (${AM_BIDRAG}) fra ` +
        `bruttolønnen. Derefter trækkes bundskat, kommuneskat og eventuel ` +
        `kirkeskat fra den skattepligtige indkomst efter fradrag. Tjener du over ` +
        `topskattegrænsen, betales der i 2026 mellemskat ${MELLEMSKAT} og ` +
        `topskat ${TOPSKAT} — den gamle topskat på ${GAMMEL_TOPSKAT_PCT} er ` +
        `afskaffet.`,
    },
    {
      question: "Hvad er AM-bidrag?",
      answer:
        `AM-bidrag (arbejdsmarkedsbidrag) er ${AM_BIDRAG} af din bruttoløn før ` +
        `andre fradrag. Bidraget går til at finansiere dagpenge, efterløn og ` +
        `andre arbejdsmarkedsordninger. AM-bidrag trækkes før skat beregnes.`,
    },
    {
      question: "Hvornår skal jeg betale mellemskat eller topskat i 2026?",
      answer:
        `I 2026 er der indført et nyt skattesystem: Mellemskat på ` +
        `${MELLEMSKAT} af indkomst over ${krI(MELLEMSKAT_GRAENSE)}, topskat på ` +
        `${TOPSKAT} over ${krI(TOPSKAT_GRAENSE)}, og top-topskat på ` +
        `${TOPTOPSKAT} over ${krI(TOPTOPSKAT_GRAENSE)} (alle efter AM-bidrag). ` +
        `Den gamle topskat på ${GAMMEL_TOPSKAT_PCT} er afskaffet.`,
    },
    {
      question: "Hvad er personfradraget i 2026?",
      answer:
        `Personfradraget i 2026 er ${krI(PERSONFRADRAG_2026)} (op fra 49.700 ` +
        `kr). Det betyder, at du ikke betaler skat af de første ` +
        `${krI(PERSONFRADRAG_2026)} af din årlige indkomst (efter AM-bidrag). Alle ` +
        `skatteydere får automatisk dette fradrag.`,
    },
    {
      question: "Hvorfor varierer kommuneskatten?",
      answer:
        `Hver kommune fastsætter sin egen skatteprocent baseret på kommunens ` +
        `økonomi og serviceniveau. I 2026 varierer kommuneskatten fra ` +
        `${KOMMUNESKAT_LAVESTE} til ${KOMMUNESKAT_HOEJESTE}. Beregnerens ` +
        `forudindstillede sats er et andet gennemsnit end tabellens: ` +
        `${kommuneskatSnit} % ifølge svmn.dk's 2026-gennemsnit.`,
    },
    {
      question: "Hvad er forskellen på brutto og netto?",
      answer:
        "Bruttoløn er din løn før skat og bidrag. Nettoløn er det beløb, du " +
        "faktisk får udbetalt på kontoen efter alle fradrag. Forskellen udgøres " +
        "af AM-bidrag, skat, pension og eventuelle andre fradrag.",
    },
    {
      question: "Hvordan påvirker pension min skat?",
      answer:
        "Arbejdsgiverbetalt pension trækkes fra bruttolønnen før AM-bidrag " +
        "beregnes, hvilket reducerer din skattepligtige indkomst. Det betyder, at " +
        "du betaler mindre i skat nu, men skal betale skat når du hæver pensionen.",
    },
    {
      question: "Er denne beregner præcis?",
      answer:
        "Beregneren giver et godt estimat baseret på gennemsnitlige satser. " +
        "Din faktiske nettoløn kan variere afhængigt af dine specifikke fradrag, " +
        "kommune og situation. For præcis beregning, brug Skattestyrelsens " +
        "officielle værktøjer.",
    },
  ];
}
