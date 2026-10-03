/**
 * De tal `/topskat` gentager i sin egen tekst — i `description` og
 * `metaDescription` samt i to af sine fem FAQ-svar — plus den omregning fra
 * grænse efter AM-bidrag til bruttoindkomst, som både brødteksten og
 * `TopskatBeregner` har brug for.
 *
 * Svarene var skrevet i hånden, og de håndskrevne tal var ikke bare den normale
 * drift. `TopskatBeregner` læser allerede `SATSER_2026`, så **søgeresultatet
 * og værktøjet var to uafhængige tal**: ændrede man en grænse i `satser-2026.ts`,
 * ville værktøjet vise den nye, mens `description`, `metaDescription` og
 * `FAQPage`-JSON-LD stod med den gamle. Sidens egen port (`regnestykker.test.ts`)
 * kan ikke se det: en streng med et tal er gyldig JSX.
 *
 * Alt læses nu fra {@link SATSER_2026} — samme modul som beregneren — gennem
 * `formatBelob`, så der er én skrivemåde for beløb og én for procenter.
 *
 * **Den fejl porten ikke kunne se.** De to bruttoindkomster i FAQ-svaret blev
 * skrevet i hånden efter sidens egen formel «grænse / (1 - AM-bidrag)», men
 * månedsbeløbet var en runde 100 kr. for lavt: `641.200 / 0,92 / 12` er
 * 58.079,7, som `bruttoGraense` runder op til **58.100**. Siden skrev
 * «58.000 kr./md» i sit FAQ-svar og «ca. 58.100 kr./md» i sin brødtekst, altså
 * to tal for det samme beløb på den samme side. Årstallet var derimod rigtigt
 * (697.000), og det er derfor fejlen lå lige så stille.
 *
 * Den eneste ændring i dansk tekst er desuden mellemrummet før procenttegnet og
 * et enkelt punktum: siden skrev «7,5%» og «5%», mens husets øvrige moduler
 * (`aktieskat-eksempler`, `efterloen-eksempler`, `loen-efter-skat-eksempler`)
 * skriver «7,5 %»; og beløbet før et komma skrives «641.200 kr,» uden punktum,
 * fordi `getCurrencySuffix("da")` er hele «kr.». Samme greb som på
 * `/loen-efter-skat` 3/10 — de to metadatafelter lå her oven i hinanden og
 * skrev begge «641.200 kr.,».
 *
 * {@link SKATTELOFT} er nu afledt af satserne. Det var **ikke** afledt: tallet
 * 52,07 var bevaret, fordi det stod der, og det lå lavere end summen af sit eget
 * modul (12,01 + 25,049 + 7,5 + 7,5 = 52,059 %), fordi optællingen sprang
 * top-topskattens 5 % over. Se {@link SKATTELOFT} og {@link marginalSkatPct}.
 */

import { formatBelob, getCurrencySuffix } from "./format";
import { SATSER_2026 } from "./satser-2026";

const DA = "da" as const;

/**
 * «641.200 kr. » minus det afsluttende punktum — altså «641.200 kr.».
 *
 * Samme deling som `loenBelob`/`loenBelobI`: `getCurrencySuffix("da")` er
 * «kr.» med punktum, fordi det er en forkortelse, og sat i **midten** af en
 * sætning giver «641.200 kr.,» — den dobbelte enhed og det dobbelte punktum,
 * som `pension-dobbelt-valuta` 2/10 kostede på `/pension`.
 */
export const topskatBelob = (belob: number) =>
  `${formatBelob(belob, DA)} ${getCurrencySuffix(DA)}`;

/** «641.200 kr» — til brug midt i en sætning. */
export const topskatBelobI = (belob: number) =>
  `${formatBelob(belob, DA)} ${getCurrencySuffix(DA).replace(/\.$/, "")}`;

const kr = topskatBelob;
const krI = topskatBelobI;

/**
 * To decimaler. `formatBelob`s standard er nul decimaler, så mellemskattens
 * `0,075 × 100 = 7,5` blev skrevet «8 %» — samme tal som AM-bidraget, og to
 * forskellige satser ville få samme skrivemåde. `loen-efter-skat-eksempler`
 * har den samme `pct` og samme grund.
 */
const pct = (sats: number) => `${formatBelob(sats * 100, DA, 2)} %`;

/** Mellemskattens sats, som FAQ-svaret om de tre trin skriver. */
export const MELLEMSKAT = pct(SATSER_2026.mellemskat);

/** AM-bidraget, som skatteloftssvaret skriver, fordi det tages med i den reelle marginalskat. */
export const AM_BIDRAG = pct(SATSER_2026.amBidrag);

/** Topskattens sats. */
export const TOPSKAT = pct(SATSER_2026.topskat);

/** Top-topskattens sats, som FAQ-svaret om det tredje trin skriver. */
export const TOPTOPSKAT = pct(SATSER_2026.topTopskat);

/** Grænsen for mellemskat, målt efter AM-bidrag. */
export const MELLEMSKAT_GRAENSE = SATSER_2026.mellemskatGraense;

/** Grænsen for topskat, målt efter AM-bidrag. */
export const TOPSKAT_GRAENSE = SATSER_2026.topskatGraense;

/** Grænsen for top-topskat, målt efter AM-bidrag. */
export const TOPTOPSKAT_GRAENSE = SATSER_2026.topTopskatGraense;

/**
 * Loftet for de fire statslige indkomstskatter — bundskat, kommuneskat,
 * mellemskat og topskat — som summerer til 52,059 %. Det er det højeste
 * marginalniveau **under top-topskat-grænsen**; over grænsen lægges
 * top-topskattens 5 % oveni. Navnet er sidens egen — «skatteloft» er
 * spørgsmålet i FAQ'en og overskriften i brødteksten — men tallet **er summen
 * af satser**, ikke en regel der kapper noget: se {@link marginalSkatPct}.
 *
 * Afledt af `SATSER_2026`, så en satsændring flytter tallet med. Tallet var
 * håndskrevet som 0,5207, altså «bevaret fordi det stod der» — og sin egen
 * docblock begrundede det med en optælling, der sprang top-topskattens 5 % over.
 * Kommuneskatten er gennemsnittet fra `satser-2026.ts`, fordi det er det samme
 * tal `TopskatBeregner` viser i sit resultatkort.
 */
export const SKATTELOFT =
  SATSER_2026.bundskat +
  SATSER_2026.kommuneskatSnit +
  SATSER_2026.mellemskat +
  SATSER_2026.topskat;

/** «ca. 52,06 %» */
export const SKATTELOFT_PCT = `ca. ${formatBelob(SKATTELOFT * 100, DA, 2)} %`;

/**
 * Den marginale skatteprocent — skatten af den sidst tjente krone — for en
 * indkomst **efter AM-bidrag**. AM-bidraget tages først, og resten af kronen
 * beskattes med indkomstskatterne. `kommuneskat` og `kirkeskat` er argumenter,
 * fordi de er kommunespecifikke; `TopskatBeregner` lægger begge ind i
 * indkomstskatterne, altså i det tal værktøjet viser.
 *
 * **Der kappes ikke.** Værktøjet havde før `Math.min(marginal, SKATTELOFT +
 * AM-bidrag)`, og det var forkert på to måder. For det første: `samletSkat`
 * beregnes trin for trin på hvert sit eget grundlag og blev aldrig kappet, så en
 * kappet procent kunne umulig være rigtig samtidig med beløbet i samme
 * resultatkort. For det andet: kappen kunne netop kun binde over
 * top-topskat-grænsen, fordi de fire satser under den er lavere end loftet —
 * så den gjorde skade netop ét sted: 1,01 procentpoint for lavt, idet den skrev
 * 60,07 % der de faktiske 61,08 % hørte hjemme. 2026-modellen har heller ingen
 * samlet grænse for marginalskatten at kappe ved: top-topskattens 5 % over
 * {@link TOPTOPSKAT_GRAENSE} er det nye mekanisme i stedet for et loft.
 *
 * Resultatet er rundet til én decimal, fordi det er det tal værktøjet viser.
 */
export function marginalSkatPct(
  indkomstEfterAm: number,
  kommuneskat: number,
  kirkeskat: number,
): number {
  let indkomstSkat = SATSER_2026.bundskat + kommuneskat + kirkeskat;
  if (indkomstEfterAm > MELLEMSKAT_GRAENSE) indkomstSkat += SATSER_2026.mellemskat;
  if (indkomstEfterAm > TOPSKAT_GRAENSE) indkomstSkat += SATSER_2026.topskat;
  if (indkomstEfterAm > TOPTOPSKAT_GRAENSE) indkomstSkat += SATSER_2026.topTopskat;

  const marginalSkat =
    SATSER_2026.amBidrag + (1 - SATSER_2026.amBidrag) * indkomstSkat;
  return Math.round(marginalSkat * 1000) / 10;
}

/**
 * Det samme niveau **med** AM-bidrag — altså den marginalskat, værktøjet
 * faktisk viser under top-topskat-grænsen. Tallet kommer fra
 * {@link marginalSkatPct} ved grænsen selv, med snit-kommuneskat og uden
 * kirkeskat, fordi det er det tilfælde brødteksten beskriver.
 *
 * **Hvorfor der er to tal.** Fundet 3/10 09:1x: brødteksten og FAQ-svaret
 * kaldte summen af de fire indkomstskatter «så højt **din marginalskat** kan
 * blive dér», men `marginalSkatPct` tager AM-bidraget først og lægger det ind i
 * tallet — 52,06 % mod 55,9 %. Den samme side viste altså 55,9 % i sit
 * resultatkort og lovede 52,06 % lige under. Sætningen læser derfor begge tal,
 * og ingen af dem er håndskrevet.
 */
export const SKATTELOFT_MED_AM = marginalSkatPct(
  TOPTOPSKAT_GRAENSE,
  SATSER_2026.kommuneskatSnit,
  0
);

/** «55,9 %» — marginalskatten under top-topskat-grænsen, med AM-bidrag. */
export const SKATTELOFT_MED_AM_PCT = `${formatBelob(SKATTELOFT_MED_AM, DA, 1)} %`;

/**
 * Den bruttoindkomst, hvor grænsen nås: mellem- og topskat beregnes af indkomsten
 * **efter** AM-bidrag, så grænsen nås ved `grænse / (1 - AM-bidrag)`. Det er
 * sidens egen betingelse, hævet fra `TopskatBeregner`, og den afrundes til nærmeste
 * hundrede — brødteksten siger «ca.», og et rundt tal kan ikke skrive sig væk fra
 * dets egen formel.
 *
 * `divider` er 12 til månedsbeløbet. Runden følger årstallet: 58.079,7 → 58.100,
 * 70.461,9 → 70.500. Det er den samme afrunding, der lå bag den gamle fejl.
 */
export const bruttoGraense = (graense: number, divider = 1) =>
  Math.round((graense / (1 - SATSER_2026.amBidrag)) / divider / 100) * 100;

/** Beskrivelsen til søgeresultatet og metadaten, der læser de samme tal. */
export function topskatBeskrivelse(): string {
  return (
    `Beregn om du betaler topskat i 2026. Ny skattemodel: mellemskat fra ` +
    `${krI(MELLEMSKAT_GRAENSE)}, topskat fra ${kr(TOPSKAT_GRAENSE)} Se din ` +
    `effektive og marginale skatteprocent gratis.`
  );
}

/**
 * De fem FAQ-svar. De tre uden tal er flyttet uændret, så hele listen dømmes ét
 * sted; kun det første og det fjerde læser tal fra modulet.
 */
export function topskatFaqItems(): { question: string; answer: string }[] {
  return [
    {
      question: "Hvornår betaler man topskat i 2026?",
      answer:
        `I 2026 er den gamle topskat erstattet af tre trin. Du betaler ` +
        `mellemskat (${MELLEMSKAT}) når din indkomst efter AM-bidrag overstiger ` +
        `${krI(MELLEMSKAT_GRAENSE)}, og topskat (yderligere ${TOPSKAT}) over ` +
        `${kr(TOPSKAT_GRAENSE)} Det svarer til en bruttoindkomst på ca. ` +
        `${kr(bruttoGraense(MELLEMSKAT_GRAENSE))}/år (ca. ` +
        `${kr(bruttoGraense(MELLEMSKAT_GRAENSE, 12))}/md) for mellemskat og ` +
        `${kr(bruttoGraense(TOPSKAT_GRAENSE))}/år (ca. ` +
        `${kr(bruttoGraense(TOPSKAT_GRAENSE, 12))}/md) for topskat.`,
    },
    {
      question: "Hvad er forskellen på effektiv skat og marginalskat?",
      answer:
        "Effektiv skat er den gennemsnitlige skatteprocent du betaler af hele " +
        "din indkomst. Marginalskat er skatten af den sidst tjente krone. " +
        "Marginalskatten er altid højere end den effektive skat, fordi de første " +
        "kroner beskattes lavere (pga. personfradrag og ingen mellemskat/topskat).",
    },
    {
      question: "Hvad er skatteloftet?",
      answer:
        `Under top-topskat-grænsen er de fire indkomstskatter — bundskat, ` +
        `kommuneskat, mellemskat og topskat — tilsammen ${SKATTELOFT_PCT} ` +
        `(ekskl. AM-bidrag og kirkeskat). Med AM-bidrag (${AM_BIDRAG}) er din ` +
        `marginalskat dér ${SKATTELOFT_MED_AM_PCT}, og over top-topskat-grænsen ` +
        `lægges yderligere ${TOPTOPSKAT} oveni.`,
    },
    {
      question: "Hvad er den nye top-topskat?",
      answer:
        `I 2026 er der indført en top-topskat på ${TOPTOPSKAT} for indkomster ` +
        `over ${krI(TOPTOPSKAT_GRAENSE)} (efter AM-bidrag). Den rammer kun de ` +
        `allerhøjeste indkomster og er et nyt tredje skattetrin.`,
    },
    {
      question: "Kan jeg undgå topskat?",
      answer:
        "Du kan reducere din skattepligtige indkomst via fradrag (rentefradrag, " +
        "befordringsfradrag, pensionsindbetalinger). Ekstra pensionsindbetalinger " +
        "er en populær måde at komme under topskattegrænsen.",
    },
  ];
}