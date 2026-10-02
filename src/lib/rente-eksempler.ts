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
 * Det eksempel, **titlen, metadataen og FAQ'en** regner på: 100.000 kr i 5 år
 * til 5 %.
 *
 * Før 2/10 stod de fire tal (100.000, 5, 1.887, 13.227, 60) håndskrevet i 19
 * felter spredt over `daPages`, `noPages` og `sePages` — og `FAQSchema` læser
 * præcis `faqItems`, så de var ikke bare brødtekst men tal i Googles rich
 * resultat, som ingen port kunne se. De læses nu herfra, så et eksempel der
 * ændrer sig, ændrer sig ét sted.
 */
export const EKSEMPEL_100K_HOVEDSTOL = 100_000;
/** Den årlige rente i procent i eksemplet titlen bruger. */
export const EKSEMPEL_100K_AARSRENTE = 5;
/** Løbetiden i år i eksemplet titlen bruger. */
export const EKSEMPEL_100K_LOEBETID = 5;

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

/** Et annuitetslån regnet på de tre tal, siderne læser. */
export function beregnAnnuitetslån(
  hovedstol: number,
  aarsrente: number,
  loebetid: number,
): AnnuitetsEksempel {
  const maanedligRente = aarsrente / 100 / 12;
  const antalMaaneder = loebetid * 12;
  const maanedligBetalning = annuitetsBetalning(
    hovedstol,
    maanedligRente,
    antalMaaneder,
  );
  const samletBetaling = maanedligBetalning * antalMaaneder;

  return {
    hovedstol,
    aarsrente,
    loebetid,
    maanedligRente,
    antalMaaneder,
    maanedligBetalning,
    samletBetaling,
    samletRante: samletBetaling - hovedstol,
  };
}

/** Eksemplet siden og værktøjet begge regner på. */
export function annuitetsEksempel(): AnnuitetsEksempel {
  return beregnAnnuitetslån(
    EKSEMPEL_HOVEDSTOL,
    EKSEMPEL_AARSRENTE,
    EKSEMPEL_LOEBETID,
  );
}

/**
 * Eksemplet i titlen, metadataen og FAQ'en: 100.000 kr i 5 år til 5 %.
 *
 * Samme formel som {@link annuitetsEksempel} og som `RenteBeregner` bruger, så
 * de to eksempler på siden aldrig kan regnes på to forskellige måder.
 */
export function hovedEksempel(): AnnuitetsEksempel {
  return beregnAnnuitetslån(
    EKSEMPEL_100K_HOVEDSTOL,
    EKSEMPEL_100K_AARSRENTE,
    EKSEMPEL_100K_LOEBETID,
  );
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
