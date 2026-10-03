/**
 * De tal `/aktieskat` gentager i sin egen tekst — i metadata, i schema og i fire
 * af sine seks FAQ-svar — plus de fem beløb, sidens brødtekst skriver i
 * `page.tsx`.
 *
 * Svarene var skrevet i hånden, og de håndskrevne tal var ikke bare den normale
 * drift. `AktieskatBeregner` læste allerede `SATSER_2026`, så **søgeresultatet
 * og beregneren var to uafhængige tal**: ændrede grænsen i `satser-2026.ts`, ville
 * værktøjet vise den nye sats, mens titel, beskrivelse, `FAQPage`-JSON-LD og
 * brødtekst stod med den gamle — og sidens egen port (`regnestykker.test.ts`)
 * kan ikke se det, fordi en streng med et tal er gyldig JSX.
 *
 * Alt læses nu fra {@link SATSER_2026}, som er det samme modul beregneren
 * bruger, gennem `formatBelob` — så der er én skrivemåde for beløb og én for
 * procenter.
 *
 * Den eneste ændring i dansk tekst er mellemrummet før procenttegnet: siden
 * skrev «27%», «42%» og «17%», mens husets øvrige moduler
 * (`efterloen-eksempler`, `pension-eksempler`, `kvadratmeter-eksempler`) skriver
 * «27 %». Samme forskel som blev rettet på `/efterloen` 3/10.
 *
 * {@link AKTIE_GRAENSE_AEGTEPAR} er **dobbeltgrænsen for ægtepar**, som kun
 * findes i teksten — beregneren regner kun det enkelte depot. Den er derfor
 * afledt af {@link AKTIE_GRAENSE} i stedet for at stå som sit eget håndskrevet
 * tal, så de to ikke kan glide fra hinanden, når grænsen ændrer sig. *Reglen
 * selv* — at grænsen fordobles for ægtepar — har ingen kilde i repoet og er
 * heller ikke slået op her (punkt 11); den er sideens eksisterende påstand og
 * er bevaret uændret, kun tallet er nu afledt.
 */

import { formatBelob, getCurrencySuffix } from "./format";
import { SATSER_2026 } from "./satser-2026";

const DA = "da" as const;

/** «79.400 kr.» — sidens egen `getCurrencySuffix`, så der sker én skrivemåde. */
export const aktieBelob = (belob: number) =>
  `${formatBelob(belob, DA)} ${getCurrencySuffix(DA)}`;

const kr = aktieBelob;
const pct = (sats: number) => `${formatBelob(sats * 100, DA)} %`;

/** «27/42%» — den korte form, to sætninger bruger. */
const pctKompakt = (sats: number) => `${formatBelob(sats * 100, DA)}%`;

/** Progressionsgrænsen for aktieindkomst i frit depot (2026). */
export const AKTIE_GRAENSE = SATSER_2026.aktieProgressionsgraense;

/** Dobbeltgrænsen for ægtepar — se modulens docblock. */
export const AKTIE_GRAENSE_AEGTEPAR = AKTIE_GRAENSE * 2;

/** Satsen under grænsen, som brødteksten skriver. */
export const AKTIE_SATS_LAV = pct(SATSER_2026.aktieSatsLav);

/** Satsen over grænsen, som brødteksten skriver. */
export const AKTIE_SATS_HOEJ = pct(SATSER_2026.aktieSatsHoej);

/** Satsen på en aktiesparekonto. */
export const ASK_SATS = pct(SATSER_2026.askSats);

/** Den korte «27/42%»-form af de to frit-depot-satser. */
export const AKTIE_SATS_KOMPAKT = pctKompakt(SATSER_2026.aktieSatsLav);

/** Den korte form af satsen over grænsen. */
export const AKTIE_SATS_HOEJ_KOMPAKT = pctKompakt(SATSER_2026.aktieSatsHoej);

/** Maksimalt indskud på en aktiesparekonto (2026). */
export const ASK_LOFT = SATSER_2026.askLoft;

/** Metadata-beskrivelsen, der både `description` og `metaDescription` læser. */
export function aktieskatBeskrivelse(): string {
  return (
    `Beregn aktieskat 2026: ${AKTIE_SATS_LAV} under ${kr(AKTIE_GRAENSE)}, ` +
    `${AKTIE_SATS_HOEJ} over. Sammenlign frit depot vs. aktiesparekonto ` +
    `(ASK, ${ASK_SATS}). Se din skat og besparelse gratis.`
  );
}

/** Kort beskrivelse til Open Graph. */
export function aktieskatOgBeskrivelse(): string {
  return (
    `Beregn din aktieskat gratis. Sammenlign frit depot ` +
    `(${AKTIE_SATS_KOMPAKT}/${AKTIE_SATS_HOEJ_KOMPAKT}) med ` +
    `aktiesparekonto (${ASK_SATS}).`
  );
}

/** Schema-beskrivelsen til `CalculatorSchema`. */
export function aktieskatSchemaBeskrivelse(): string {
  return (
    `Beregn skat på aktieindkomst i 2026. Sammenlign frit depot ` +
    `(${AKTIE_SATS_KOMPAKT}/${AKTIE_SATS_HOEJ_KOMPAKT}) med ` +
    `aktiesparekonto (${ASK_SATS}).`
  );
}

/**
 * De otte beløb og procenter, sidens brødtekst skriver — de fem, `page.tsx`
 * før skrev i hånden, plus de tre, der kun står i sætninger om forskellen.
 */
export function aktieskatFaqItems(): { question: string; answer: string }[] {
  return [
    {
      question: "Hvor meget skat betaler jeg af aktiegevinst i 2026?",
      answer:
        `I 2026 beskattes aktieindkomst i frit depot med ${AKTIE_SATS_LAV} af de ` +
        `første ${kr(AKTIE_GRAENSE)} (${kr(AKTIE_GRAENSE_AEGTEPAR)} for ægtepar) ` +
        `og ${AKTIE_SATS_HOEJ} af beløb derover. I en aktiesparekonto (ASK) er ` +
        `satsen kun ${ASK_SATS}.`,
    },
    {
      question: "Hvad er forskellen på frit depot og aktiesparekonto?",
      answer:
        `I frit depot beskattes du ved realisationsbeskatning ` +
        `(${AKTIE_SATS_KOMPAKT}/${AKTIE_SATS_HOEJ_KOMPAKT} når du sælger). I en aktiesparekonto (ASK) beskattes du med ${ASK_SATS} ` +
        `lagerbeskatning (skat af urealiserede gevinster årligt). ASK har max ` +
        `indskud på ${kr(ASK_LOFT)} i 2026.`,
    },
    {
      question: "Hvad er progressionsgrænsen for aktieskat i 2026?",
      answer:
        `Progressionsgrænsen er ${kr(AKTIE_GRAENSE)} i 2026. Aktieindkomst ` +
        `under denne grænse beskattes med ${AKTIE_SATS_LAV}, og beløb over ` +
        `grænsen beskattes med ${AKTIE_SATS_HOEJ}. For ægtepar er grænsen ` +
        `${kr(AKTIE_GRAENSE_AEGTEPAR)} samlet.`,
    },
    {
      question: "Kan jeg modregne tab i aktiegevinster?",
      answer:
        "Ja, tab på aktier kan modregnes i gevinster. Har du et nettotab, kan " +
        "det fremføres til modregning i fremtidige aktiegevinster. Tab i frit " +
        "depot kan kun modregnes i gevinster fra frit depot.",
    },
    {
      question: "Hvad er lagerbeskatning?",
      answer:
        `Lagerbeskatning betyder at du betaler skat af årets urealiserede ` +
        `gevinst — altså stigningen i værdi, selv om du ikke har solgt. ` +
        `Aktiesparekontoen bruger lagerbeskatning med en sats på ${ASK_SATS}.`,
    },
    {
      question: "Hvornår skal jeg betale aktieskat?",
      answer:
        "For frit depot betaler du skat i det år du sælger aktierne " +
        "(realisationsbeskatning). For ASK betaler du skat årligt af årets " +
        "værdistigning (lagerbeskatning). Skatten indberettes automatisk af din bank.",
    },
  ];
}