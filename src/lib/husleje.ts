/**
 * The housing-cost rule behind /husleje, and the budget model the calculator
 * runs on. Single source so the page's answer-first example, the meta
 * description and the tool's own default state cannot drift apart — they did:
 * the page promised "25.000 kr netto -> max ca. 7.500 kr/md" while the tool
 * started at 28.000 kr and showed 8.400 kr.
 *
 * The rule itself is a tommelfingerregel, not a law: the 30 % share of net
 * income is the most widely used Danish guideline, and 33 % is the looser
 * variant some advisers use. The page keeps that framing; the calculator shows
 * both so the claim is answerable rather than asserted.
 */

/** Primary share of net income the housing budget may take. */
export const HUSLEJE_REGNEL_30 = 0.3;

/** The looser variant the page and FAQ mention ("nogle kilder siger 33 %"). */
export const HUSLEJE_REGNEL_33 = 0.33;

export interface HuslejeInput {
  /** Own net salary per month. */
  maanedligNettoLoen: number;
  /** Partner's / roommate's net income, if the housing budget is shared. */
  partnerLoen?: number;
  /** SU, child benefit, pension, other income. */
  andreIndkomster?: number;
  /** Recurring costs excluding rent AND excluding boligforbrug. */
  madOgDagligvarer?: number;
  transport?: number;
  forsikringer?: number;
  mobilOgInternet?: number;
  abonnementer?: number;
  andreUdgifter?: number;
  /** Electricity, water and heating. 0 when they are included in the rent. */
  boligforbrug?: number;
  /** Share of income set aside, in percent. */
  opsparingProcent?: number;
}

export type HuslejeVurdering = "god" | "ok" | "risikabel";

export interface HuslejeResultat {
  samletIndkomst: number;
  /** Recurring costs excluding rent and boligforbrug. */
  fasteUdgifter: number;
  opsparingBeloeb: number;
  /** The rule's ceiling on rent + electricity + water + heating. */
  maxBoligudgifter: number;
  /** The same ceiling under the 33 % variant. */
  maxBoligudgifter33: number;
  /** What is left for rent when nothing is capped. Can be negative. */
  tilHusleje: number;
  /** The recommended rent, never below 0. */
  anbefaletHusleje: number;
  /** Rent + electricity + water + heating at the recommended rent. */
  anbefaletBoligudgifter: number;
  vurdering: HuslejeVurdering;
}

const sum = (...values: number[]) => values.reduce((total, v) => total + v, 0);

/**
 * The housing budget: what a given income, cost level and savings rate allows as
 * rent, with the 30 % rule applied to rent *and* electricity/water/heating — the
 * way the page and the FAQ describe it ("husleje inkl. el, vand og varme").
 */
export function beregnHusleje(input: HuslejeInput): HuslejeResultat {
  const samletIndkomst = sum(
    input.maanedligNettoLoen,
    input.partnerLoen ?? 0,
    input.andreIndkomster ?? 0,
  );
  const fasteUdgifter = sum(
    input.madOgDagligvarer ?? 0,
    input.transport ?? 0,
    input.forsikringer ?? 0,
    input.mobilOgInternet ?? 0,
    input.abonnementer ?? 0,
    input.andreUdgifter ?? 0,
  );
  const boligforbrug = input.boligforbrug ?? 0;
  const opsparingBeloeb = samletIndkomst * ((input.opsparingProcent ?? 0) / 100);

  const maxBoligudgifter = samletIndkomst * HUSLEJE_REGNEL_30;
  const maxBoligudgifter33 = samletIndkomst * HUSLEJE_REGNEL_33;
  const tilHusleje = samletIndkomst - fasteUdgifter - opsparingBeloeb - boligforbrug;

  // The rule caps rent + boligforbrug together, so the cap on rent alone is the
  // rule's ceiling minus the electricity/water/heating already accounted for.
  const pladsUnderRegel = maxBoligudgifter - boligforbrug;
  const anbefaletHusleje = Math.max(0, Math.min(tilHusleje, pladsUnderRegel));

  // Uden indkomst er der intet budget, så vurderingen kan ikke være "god" — den
  // gamle logik sagde "god" fordi 0 >= 0.
  let vurdering: HuslejeVurdering = "god";
  if (samletIndkomst <= 0) vurdering = "risikabel";
  else if (anbefaletHusleje < pladsUnderRegel * 0.8) vurdering = "risikabel";
  else if (anbefaletHusleje < pladsUnderRegel) vurdering = "ok";

  return {
    samletIndkomst,
    fasteUdgifter,
    opsparingBeloeb,
    maxBoligudgifter,
    maxBoligudgifter33,
    tilHusleje,
    anbefaletHusleje,
    anbefaletBoligudgifter: anbefaletHusleje + boligforbrug,
    vurdering,
  };
}

/**
 * The tool's default state, which is also the example the page and the meta
 * description quote. The default expenses are a single, modest household —
 * 9.000 kr excluding rent — so the 30 % rule is what decides the answer.
 */
export const HUSLEJE_STANDARD = {
  maanedligNettoLoen: 25000,
  partnerLoen: 0,
  andreIndkomster: 0,
  madOgDagligvarer: 4000,
  transport: 2000,
  forsikringer: 1000,
  mobilOgInternet: 500,
  abonnementer: 500,
  andreUdgifter: 1000,
  /** 0 because electricity and heating are often paid through a rent statement. */
  boligforbrug: 0,
  opsparingProcent: 10,
} as const satisfies HuslejeInput;

/** What the default state answers: 25.000 kr net -> 7.500 kr per month. */
export const HUSLEJE_EKSEMPEL = beregnHusleje(HUSLEJE_STANDARD);

/**
 * The sub-example the page works through: a household that also pays for
 * electricity and heating. The 1.800 kr is an illustration ("if you pay…"),
 * not a claim about what Danish households average.
 */
export const HUSLEJE_EKSEMPEL_FORBRUG = 1800;

export const HUSLEJE_EKSEMPEL_MED_FORBRUG = beregnHusleje({
  ...HUSLEJE_STANDARD,
  boligforbrug: HUSLEJE_EKSEMPEL_FORBRUG,
});
