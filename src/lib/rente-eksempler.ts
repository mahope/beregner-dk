/**
 * Worked examples for the annuity-formula section on /renteberegner.
 *
 * The annuity payment is computed with the *same* formula
 * `RenteBeregner` uses, so the page cannot print a number the tool would
 * not produce — the rule C84's `metaDescription` fund and C94's
 * `literPr100km()` coupling established.
 */

export interface AnnuitetsEksempel {
  /** Lånebeløb i kronor. */
  hovedstol: number;
  /** Årlig nominel rente i procent. */
  aarsrente: number;
  /** Løbetid i år. */
  loebetid: number;
  /** Den månedlige rentesats som eksemplet regnes med. */
  maanedligRente: number;
  /** Antal måneder. */
  antalMaaneder: number;
  /** Den faste månedsbetalning. */
  maanedligBetalning: number;
  /** Hvad der betales i alt. */
  samletBetaling: number;
  /** Hvad der betales i ränta. */
  samletRante: number;
}

/** Lånebeløbet eksemplet regner med. */
export const EKSEMPEL_HOVEDSTOL = 200_000;
/** Den årlige rente i procent. */
export const EKSEMPEL_AARSRENTE = 4;
/** Løbetiden i år. */
export const EKSEMPEL_LOEBETID = 20;

/**
 * Den faste månedsbetalning i et annuitetslån. Samlet formel som
 * `RenteBeregner` bruger — kun hovedstol, månedlig rente og antal
 * måneder.
 */
export function annuitetsBetalning(
  hovedstol: number,
  maanedligRente: number,
  antalMaaneder: number,
): number {
  return (
    (hovedstol * maanedligRente * Math.pow(1 + maanedligRente, antalMaaneder)) /
    (Math.pow(1 + maanedligRente, antalMaaneder) - 1)
  );
}

/** Eksemplet siden og værktøjet begge regner på. */
export function annuitetsEksempel(): AnnuitetsEksempel {
  const maanedligRente = EKSEMPEL_AARSRENTE / 100 / 12;
  const antalMaaneder = EKSEMPEL_LOEBETID * 12;
  const maanedligBetalning = annuitetsBetalning(
    EKSEMPEL_HOVEDSTOL,
    maanedligRente,
    antalMaaneder,
  );
  const samletBetaling = maanedligBetalning * antalMaaneder;

  return {
    hovedstol: EKSEMPEL_HOVEDSTOL,
    aarsrente: EKSEMPEL_AARSRENTE,
    loebetid: EKSEMPEL_LOEBETID,
    maanedligRente,
    antalMaaneder,
    maanedligBetalning,
    samletBetaling,
    samletRante: samletBetaling - EKSEMPEL_HOVEDSTOL,
  };
}

/**
 * Den effektive årliga rente, når den nominelle er månedligt forrendt.
 * Samme to trin som den danske side skriver i "Månedlig rente til årlig
 * rente", så de to sprog ikke kan glide fra hinanden.
 */
export function effektivAarsrente(maanedligRente: number): number {
  return Math.pow(1 + maanedligRente, 12) - 1;
}

/** 1 % pr. måned — det eksempel, effektiv ränta forklares med. */
export const MAANEDLIG_ONE_PROCENT = 0.01;
/** 4 % om året — det andet eksempel. */
export const AARS_FIRE_PROCENT = 0.04;
