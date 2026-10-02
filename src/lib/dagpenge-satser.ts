/**
 * Satserne på `/dagpenge` samlet ét sted — inklusive beløbet **efter skat**.
 *
 * Hvorfor modulet findes: «dagpenge sats 2026 nyuddannet» og «dagpenge sats
 * 2026 efter skat» er de to mest konkrete danske autocomplete-træffere under
 * «dagpenge» (målt 2/10 11:25 på `suggestqueries`, hl=da gl=dk — 10 af 10 under
 * «dagpenge nyuddannet», og «dagpenge sats 2026 efter skat» nr. 4 under «dagpenge
 * sats»). Siden havde **ét** beløb før skat og **nul** efter skat, selv om dens
 * egen `keywords` og FAQ lovede «dagpenge efter skat».
 *
 * Beløbet efter skat regnes med `estimerNettoMaaned` — samme funktion som
 * `/barselsdagpenge` bruger til barselsdagpenge — fordi dagpenge og
 * barselsdagpenge er begge offentlige ydelser uden AM-bidrag, der beskattes som
 * personindkomst. Funktionen årliger beløbet, så personfradrag og
 * beskæftigelsesfradrag vurderes på et realistisk niveau, og den bruger 2026's
 * gennemsnitlige kommunaleskat. Den er derfor et **vejledende** estimat, og
 * alle steder den bruges, skal sige det.
 *
 * De seks satser kommer fra `DAGPENGE_2026` (Beskæftigelsesministeriets
 * "Satser for 2026", læst 2026-09-26). De to tal herunder gør **ikke**: de stod
 * i brødteksten og i værktøjets egne konstanter, uden at nogen havde læst en
 * primærkilde. De er derfor deklareret med den mangel i stedet for med en
 * kildeangivelse, der ikke er læst — jf. punkt 11 og `❓` i
 * `IMPLEMENTATION_PLAN.md`.
 */

import { DAGPENGE_2026, SATSER_2026 } from "./satser-2026";
import { estimerNettoMaaned } from "./barsel/netto";
import { formatNumber } from "./format";
import type { Locale } from "./i18n";

/**
 * Beskæftigelsestillægget — det ekstra tillæg de første 3 måneders ledighed,
 * der hæver satsen til dette beløb.
 *
 * **Kilde: ingen læst.** `DAGPENGE_2026`'s docblock siger udtrykkeligt, at
 * ministeriet *ikke* oplyser beskæftigelsestillægget, så tallet må ikke læses
 * derfra. Det lå tidligere som `beskaeftigelsesTillaeg: 26198` i
 * `DagpengeBeregner.tsx` og som «Op til 26.198 kr» i to linjers brødtekst på
 * `/dagpenge`. Flyttet her, fordi det skal have ét sted at blive rettet i — ikke
 * fordi tallet er blevet verificeret.
 */
export const BESKAEFTIGELSESTILLAEG_2026 = 26198;

/**
 * Indkomstkravet for ret til dagpenge: den samlede indkomst over de seneste 3
 * år, som et medlem skal have haft for at blive dagpengeberettiget.
 *
 * **Kilde: ingen læst.** Tallet stod kun i brødteksten på `/dagpenge` («have
 * haft en samlet indkomst på mindst 263.232 kr inden for de seneste 3 år») og i
 * én FAQ-streng. Se `❓` om dagpengekrav i `IMPLEMENTATION_PLAN.md`.
 */
export const INDKOMSTKRAV_2026 = 263232;

/** Én række i sats-tabellen på `/dagpenge`. */
export interface DagpengeSats {
  /** Stabil nøgle, så rækkerne kan slås op i tests og bruges som liste-nøgle. */
  id: string;
  /** Rækkens navn, som den står i tabellen. */
  label: string;
  /** Satsen pr. måned før skat, i kroner. */
  belob: number;
  /** Betingelsen for satsen — kort nok til en tabelcelle. */
  note: string;
}

/**
 * Alle 2026-satserne i den rækkefølge, tabellen viser dem: fra det højeste
 * beløb til det laveste, så læseren kan se forskellen på nyuddannet og
 * forsørger.
 */
export const DAGPENGE_SATSER: readonly DagpengeSats[] = [
  {
    id: "beskaeftigelsestillaeg",
    label: "Med beskæftigelsestillæg",
    belob: BESKAEFTIGELSESTILLAEG_2026,
    note: "Kun de første 3 måneder, og kun hvis du opfylder beskæftigelseskravet.",
  },
  {
    id: "fuldtid",
    label: "Max dagpengesats, fuldtidsforsikret",
    belob: DAGPENGE_2026.fuldtid,
    note: "Dagsatsen for dig med den højeste løn de seneste 12 måneder.",
  },
  {
    id: "dimittend-forsorger",
    label: "Dimittend, fuldtid med forsørgelsespligt",
    belob: DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt,
    note: "Nyuddannet med børn eller andre under 18 år, du har forsørgelsespligt for.",
  },
  {
    id: "dimittend",
    label: "Dimittend, fuldtid uden forsørgelsespligt",
    belob: DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt,
    note: "Nyuddannet uden forsørgelsespligt.",
  },
  {
    id: "deltid",
    label: "Max dagpengesats, deltidsforsikret",
    belob: DAGPENGE_2026.deltid,
    note: "2/3 af fuldtidssatsen — du er forsikret for under 37 timer pr. uge.",
  },
  {
    id: "dimittend-deltid-forsorger",
    label: "Dimittend, deltid med forsørgelsespligt",
    belob: DAGPENGE_2026.dimittendDeltidMedForsorgerpligt,
    note: "Nyuddannet, deltidsforsikret, med forsørgelsespligt.",
  },
  {
    id: "dimittend-deltid",
    label: "Dimittend, deltid uden forsørgelsespligt",
    belob: DAGPENGE_2026.dimittendDeltidUdenForsorgerpligt,
    note: "Nyuddannet, deltidsforsikret, uden forsørgelsespligt.",
  },
];

/** Én række med både beløbet før og efter skat. */
export interface DagpengeEfterSkat {
  /** Satsen pr. måned før skat. */
  foerSkat: number;
  /** Den beregnede skat pr. måned. */
  skat: number;
  /** Beløbet tilbage på kontoen pr. måned. */
  efterSkat: number;
}

/**
 * Beregner, hvad en dagpengesats er værd efter skat.
 *
 * Dagpenge er skattepligtig personindkomst uden AM-bidrag, så `loen` er 0 og
 * hele beløbet er `ydelse`. Beløbet årliges internt af `estimerNettoMaaned`, så
 * ét års dagpenge vurderes mod personfradrag og de statslige skattegrænser i
 * 2026's skattemodel.
 *
 * Resultatet afhænger af kommunen og af din egen øvrige indkomst, og er derfor
 * et estimat — ikke et skattekort.
 */
export function dagpengeEfterSkat(
  belob: number,
  valg: { kommuneskat?: number; kirkeskat?: boolean } = {},
): DagpengeEfterSkat {
  const foerSkat = Math.max(0, belob || 0);
  const { skat, netto } = estimerNettoMaaned({
    loen: 0,
    ydelse: foerSkat,
    kommuneskat: valg.kommuneskat,
    kirkeskat: valg.kirkeskat,
  });
  return { foerSkat, skat, efterSkat: Math.max(0, netto) };
}
/** Kroner med dansk tusindtalsseparator — hele kroner, som dagpenge betales i. */
export const dagpengeKroner = (belob: number): string =>
  `${formatNumber(Math.round(belob), "da")} kr`;

/**
 * Et timetal med dansk tusindtalsseparator — **uden** «kr», fordi det er timer.
 * `DAGPENGE_2026.dagpengeperiodeTimer` er et timetal, ikke et beløb, og
 * formatteres derfor aldrig med `dagpengeKroner` (punkt 11).
 */
export const dagpengeTimer = (timer: number, locale: Locale = "da"): string =>
  formatNumber(Math.round(timer), locale);

/** svmn.dk's 2026-gennemsnit for kommuneskat, som procent med tre decimaler. */
export const KOMMUNESKAT_SNIT_PCT_DAGPENGE = formatNumber(
  SATSER_2026.kommuneskatSnit * 100,
  "da",
  { maximumFractionDigits: 3 },
);

/**
 * Svaret til «Hvad er dagpenge efter skat?».
 *
 * «dagpenge sats 2026 efter skat» er dansk autocomplete nr. 4 under «dagpenge
 * sats» og nr. 2 under «dagpenge sats 2026» (målt 2/10 11:25). Siden lovede det
 * i sin egen `keywords` og FAQ, men havde intet beløb — dette er det første.
 */
export function dagpengeEfterSkatFaqSvar(): string {
  const max = dagpengeEfterSkat(DAGPENGE_2026.fuldtid);
  const dimittend = dagpengeEfterSkat(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt);
  return (
    `Ja, dagpenge er skattepligtig indkomst. Regner man med ` +
    `${KOMMUNESKAT_SNIT_PCT_DAGPENGE} % i kommunaleskat og 2026's øvrige satser, er ` +
    `maxsatsen på ${dagpengeKroner(max.foerSkat)} før skat ca. ` +
    `${dagpengeKroner(max.efterSkat)} om måneden tilbage på kontoen. ` +
    `Dimittendsatsen på ${dagpengeKroner(dimittend.foerSkat)} før skat er ca. ` +
    `${dagpengeKroner(dimittend.efterSkat)} efter skat. Tallene er vejledende: din ` +
    `kommuneskat, din kirkeskat og din øvrige indkomst ændrer beløbet, så brug dit ` +
    `skattekort til det endelige tal.`
  );
}

/**
 * Svaret til «Hvad er dagpengesatsen for nyuddannet?».
 *
 * «dagpenge nyuddannet» har 10 af 10 danske autocomplete-træffere, og «dagpenge
 * sats 2026 nyuddannet» ligger først under både «dagpenge sats» og «dagpenge
 * 2026» (målt 2/10 11:25). Procentforholdene er regnet, ikke skrevet — de er
 * udledt af ministeriets egne tal.
 */
export function dagpengeNyuddannetFaqSvar(): string {
  const pct = (belob: number) =>
    `${formatNumber((belob / DAGPENGE_2026.fuldtid) * 100, "da", { maximumFractionDigits: 1 })} %`;
  return (
    `Er du nyuddannet — altså dimittend — får du ` +
    `${dagpengeKroner(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt)} pr. måned før ` +
    `skat uden forsørgelsespligt, og ` +
    `${dagpengeKroner(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt)} hvis du har ` +
    `forsørgelsespligt. Det er ${pct(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt)} ` +
    `hhv. ${pct(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt)} af maxsatsen på ` +
    `${dagpengeKroner(DAGPENGE_2026.fuldtid)}. Dimittendsatsen gælder, når din ` +
    `uddannelse har varet mindst ${DAGPENGE_2026.dimittendUddannelseMdr} måneder, og du ` +
    `skal tilmelde dig A-kassen senest ${DAGPENGE_2026.dimittendTilmeldingDage} dage ` +
    `efter, at uddannelsen er afsluttet.`
  );
}

/**
 * Svaret til «Hvor længe har nyuddannede ret til dagpenge?» — tredje af de tre
 * spørgsmål, «dagpenge nyuddannet» har ti svar på («… sats», «… efter skat»,
 * «… hvor længe» er nr. 1-3, målt 2/10 11:25).
 */
export function dagpengeNyuddannetPeriodeFaqSvar(): string {
  return (
    `Nyuddannede har samme ret til dagpenge som alle andre: normalt ` +
    `${formatNumber(DAGPENGE_2026.dagpengeperiodeTimer / DAGPENGE_2026.fuldtidTimerPerAar, "da")} ` +
    `år, svarende til ${dagpengeTimer(DAGPENGE_2026.dagpengeperiodeTimer)} timer ` +
    `fuldtid, inden for ${DAGPENGE_2026.indkomstkravAar} år. Dimittendsatsen gælder hele ` +
    `perioden, også hvis du først finder job bagefter.`
  );
}

/**
 * Hvert sprog har sin egen sætning om dagpengeperioden, så intet domæne
 * arver en andens sprog ved en faldlinje. Kun tallene (`aar`, `timer`) er
 * fælles, og de regnes begge fra `DAGPENGE_2026`.
 *
 * 2/10 13:15 (review-fund, MIDDEL): norsk lå i den danske sætning. Bokmål kan
 * godt sige «dagpengeperiode», «normalt», «år» og «timer», så den danske sætning
 * sagde ikke noget forkert i norsk — men den gjorde `no` til en faldlinje, og
 * porten «periodelinjen er samme sætning i tre sprog» dømte `no` på de danske
 * ord. Norsk har derfor sin egen sætning i «Du»-form, som den linje den følger
 * i informationsboksen også har («Du må være medlem av en A-kasse …»).
 */
const DAGPENGE_PERIODE_SAETNING: Record<
  Locale,
  (aar: string, timer: string) => string
> = {
  da: (aar, timer) => `Dagpengeperioden er normalt ${aar} år (${timer} timer)`,
  se: (aar, timer) => `Dagpenningperioden är normalt ${aar} år (${timer} timmar)`,
  no: (aar, timer) => `Du kan normalt ha dagpenge i ${aar} år (${timer} timer)`,
};

/**
 * Værktøjets og sidens linje om dagpengeperioden, i de tre sprog.
 *
 * Før 2/10 skrev `DagpengeBeregner.tsx` «normalt 2 år (3.848 timer)» tre gange,
 * en gang pr. sprog, med «2 år» og «3.848» håndskrevet hver gang — tre fund i
 * `regnestykker`-portens strengliste. Både årene og timerne regnes nu fra
 * `DAGPENGE_2026`, så portens liste for `DagpengeBeregner.tsx` er 0.
 */
export function dagpengePeriodeTekst(locale: Locale): string {
  return DAGPENGE_PERIODE_SAETNING[locale](
    dagpengeTimer(
      DAGPENGE_2026.dagpengeperiodeTimer / DAGPENGE_2026.fuldtidTimerPerAar,
      locale,
    ),
    dagpengeTimer(DAGPENGE_2026.dagpengeperiodeTimer, locale),
  );
}
