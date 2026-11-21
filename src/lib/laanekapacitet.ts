/**
 * Lånekapacitet — hvor meget kan du låne til bolig, og hvad kan du købe for?
 *
 * Værktøjet regner ud fra de to grænser, bankerne selv bruger, og viser
 * hvilken af dem der binder først:
 *
 * 1. **Gældsfaktoren.** Samlet gæld delt med husstandens årlige bruttoindkomst.
 *    Finanstilsynet anser som udgangspunkt en gældsfaktor på mere end fire for
 *    høj — det er ikke et loft, men en trappe, hvor långiver skal kunne
 *    begrunde lånet bedre, jo højere faktoren er. Derfor kan brugeren vælge
 *    3,5, 4 eller 5, og 4 er standard.
 * 2. **Udbetalingen.** Finanstilsynet bruger 5 % af købesummen som udgangspunkt
 *    for en passende udbetaling. Er der mindre, bliver det udbetalingen, ikke
 *    gældsfaktoren, der sætter grænsen.
 *
 * Realkredit kan dække op til 80 % af boligens værdi, og de næste 15 % er
 * typisk et dyrere banklån, så de sidste 5 % er udbetalingen. Værktøjet viser
 * den fordeling på den pris, der binder.
 *
 * **Ingen tal er skrevet i teksten.** Alt regnes her, så siden og værktøjet
 * ikke kan glide fra hinanden (punkt 11). Satserne står i `LAANEKAPACITET_KILDE`
 * med læsedato, så en ændring i reglerne er ét sted at rette.
 */

export const LAANEKAPACITET_KILDE = {
  /** Bekendtgørelse om god skik for boligkredit (gældende 1. januar 2026). */
  gaeldsfaktor: "https://www.retsinformation.dk/eli/lta/2025/1443",
  /** Finanstilsynets vejledning: 5 % udbetaling og gældsfaktor over fire. */
  udbetaling: "https://www.retsinformation.dk/api/pdf/237994",
  /** Finansdanmark: realkreditlovens lånegrænser. */
  realkredit:
    "https://finansdanmark.dk/gode-raad/forstaa-dit-realkreditlaan/laanegraenser-loebetider-og-afdragsfrihed",
  verifiedAt: "2026-10-07",
} as const;

/** Gældsfaktoren værktøjet starter på — Finanstilsynets referencepunkt. */
export const GAELDSFAKTOR_STANDARD = 4;

/** De gældsfaktorer brugeren kan vælge. */
export const GAELDSFAKTOR_VALG = [3.5, 4, 5] as const;

/** Udbetalingens mindste andel af købesummen, i procent. */
export const UDBETALING_MIN_PCT = 5;

/** Realkreditlånets maksimale andel af boligens værdi, i procent. */
export const REALKREDIT_MAKS_PCT = 80;

function positiv(tal: number | undefined): number {
  return typeof tal === "number" && Number.isFinite(tal) && tal > 0 ? tal : 0;
}

export interface LaanekapacitetInput {
  /** Husstandens samlede årsindkomst før skat, i kr. */
  husstandsindkomst: number;
  /** Opsparing der kan lægges som udbetaling, i kr. */
  udbetaling: number;
  /** Eksisterende gæld (billån, studielån, kassekredit m.m.), i kr. */
  eksisterendeGaeld?: number;
  /** Den gældsfaktor banken tillader. Standard 4. */
  gaeldsfaktor?: number;
}

export type BindendeGraense = "gaeldsfaktor" | "udbetaling";

export interface LaanekapacitetResultat {
  husstandsindkomst: number;
  gaeldsfaktor: number;
  udbetaling: number;
  eksisterendeGaeld: number;
  /** Gældsfaktor × husstandsindkomst — den samlede gæld der er plads til. */
  maksSamletGaeld: number;
  /** Det nye lån der er plads til, når eksisterende gæld er trukket fra. */
  laaneramme: number;
  /** Boligpris hvis gældsfaktoren binder. */
  maksPrisEfterGaeldsfaktor: number;
  /** Boligpris hvis 5 %-udbetalingen binder. */
  maksPrisEfterUdbetaling: number;
  /** Den pris der faktisk binder — den laveste af de to. */
  maksBoligpris: number;
  /** Hvilken af de to grænser der sætter maksBoligpris. */
  bindendeGraense: BindendeGraense;
  /** De 5 % af maksBoligpris der skal lægges kontant. */
  kraevUdbetaling: number;
  /** Lånet ved maksBoligpris (95 % af prisen). */
  laanVedMaks: number;
  /** Realkreditdelen ved maksBoligpris (80 %). */
  realkreditDel: number;
  /** Banklånsdelen ved maksBoligpris (15 %). */
  banklaanDel: number;
  /** Gældsfaktoren på den pris, der binder. */
  gaeldsfaktorVedMaks: number;
}

/**
 * Regner lånekapaciteten ud fra indkomst, udbetaling og gældsfaktor.
 *
 * Med 500.000 kr. i husstandsindkomst, 300.000 kr. i udbetaling og
 * gældsfaktor 4 giver `4 × 500.000 = 2.000.000` kr. i lån. Det er
 * `2.000.000 ÷ 0,95 = 2.105.263` kr., når udbetalingen er 5 %, og udbetalingen
 * alene ville række til `300.000 ÷ 0,05 = 6.000.000` kr. — så gældsfaktoren
 * binder, og svaret er 2.105.263 kr.
 */
export function beregnLaanekapacitet(
  input: LaanekapacitetInput
): LaanekapacitetResultat {
  const husstandsindkomst = positiv(input.husstandsindkomst);
  const udbetaling = positiv(input.udbetaling);
  const eksisterendeGaeld = positiv(input.eksisterendeGaeld);
  const gaeldsfaktor = positiv(input.gaeldsfaktor) || GAELDSFAKTOR_STANDARD;

  const maksSamletGaeld = gaeldsfaktor * husstandsindkomst;
  const laaneramme = Math.max(0, maksSamletGaeld - eksisterendeGaeld);

  const maksPrisEfterGaeldsfaktor = laaneramme / (1 - UDBETALING_MIN_PCT / 100);
  const maksPrisEfterUdbetaling = udbetaling / (UDBETALING_MIN_PCT / 100);
  const maksBoligpris = Math.min(
    maksPrisEfterGaeldsfaktor,
    maksPrisEfterUdbetaling
  );
  const bindendeGraense: BindendeGraense =
    maksPrisEfterGaeldsfaktor <= maksPrisEfterUdbetaling
      ? "gaeldsfaktor"
      : "udbetaling";

  const kraevUdbetaling = maksBoligpris * (UDBETALING_MIN_PCT / 100);
  const laanVedMaks = maksBoligpris * (1 - UDBETALING_MIN_PCT / 100);
  const realkreditDel = Math.min(
    laanVedMaks,
    maksBoligpris * (REALKREDIT_MAKS_PCT / 100)
  );
  const banklaanDel = Math.max(0, laanVedMaks - realkreditDel);
  const gaeldsfaktorVedMaks =
    husstandsindkomst > 0
      ? (laanVedMaks + eksisterendeGaeld) / husstandsindkomst
      : 0;

  return {
    husstandsindkomst,
    gaeldsfaktor,
    udbetaling,
    eksisterendeGaeld,
    maksSamletGaeld,
    laaneramme,
    maksPrisEfterGaeldsfaktor,
    maksPrisEfterUdbetaling,
    maksBoligpris,
    bindendeGraense,
    kraevUdbetaling,
    laanVedMaks,
    realkreditDel,
    banklaanDel,
    gaeldsfaktorVedMaks,
  };
}

/** Standardtilstanden værktøjet og brødteksten regner på. */
export const LAANEKAPACITET_EKSEMPEL: LaanekapacitetInput = {
  husstandsindkomst: 500000,
  udbetaling: 300000,
  eksisterendeGaeld: 0,
  gaeldsfaktor: GAELDSFAKTOR_STANDARD,
};

/** Indkomster eksempeltabellen viser, med samme udbetaling og gældsfaktor. */
export const LAANEKAPACITET_EKSEMPEL_INDKOMSTER = [
  400000, 500000, 600000, 750000, 900000,
] as const;

/** Eksempeltabellens rækker — regnet, aldrig skrevet. */
export function laanekapacitetEksempelRækker(): LaanekapacitetResultat[] {
  return LAANEKAPACITET_EKSEMPEL_INDKOMSTER.map((husstandsindkomst) =>
    beregnLaanekapacitet({ ...LAANEKAPACITET_EKSEMPEL, husstandsindkomst })
  );
}
