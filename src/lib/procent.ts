import { DEFAULT_MOMS_SATS } from "./moms";

/**
 * The two ways to compare two numbers in percent.
 *
 * Swedish searches ask for both: "procent skillnad mellan två tal" is the
 * number 1 completion under "procent skillnad" (autocomplete hl=se, 2026-09-28),
 * while "räkna ut procent mellan två tal" and "räkna ut procent av två tal"
 * are two of ten completions under "räkna ut procent". They are not the same
 * question, so the page has to answer both instead of picking one.
 */

/**
 * Percent change from `gammal` to `ny`: ((ny - gammal) / gammal) × 100.
 *
 * The old figure is always the whole. This is the formula the calculator
 * already teaches, so the examples below use it too.
 */
export function procentForskel(ny: number, gammal: number): number {
  if (gammal === 0) return 0;
  return ((ny - gammal) / gammal) * 100;
}

/**
 * Symmetric percent difference: |a - b| / ((a + b) / 2) × 100.
 *
 * The mean is the whole, so the answer is the same whichever of the two
 * numbers you start from. That is why it is called a difference rather than a
 * change, and why science and statistics use it.
 */
export function procentDifferens(a: number, b: number): number {
  const gennemsnit = (a + b) / 2;
  if (gennemsnit === 0) return 0;
  return (Math.abs(a - b) / gennemsnit) * 100;
}

/**
 * The two figure pairs the Swedish page works with.
 *
 * Both are pairs the page already promises elsewhere — the salary 33 000 mot
 * 30 000 = 10 procent in its FAQ, and 10 000 till 12 500 = 25 in its Excel
 * table — so the new prose cannot drift away from the numbers already indexed.
 */
export const PROCENT_SKILLNAD_EKSEMPEL = [
  { gammal: 30000, ny: 33000 },
  { gammal: 10000, ny: 12500 },
];

/**
 * Both answers to «procentvis forskel mellem to tal», from one pair of numbers.
 *
 * The question has two correct answers and the page has to hand out both,
 * because the reader cannot tell in advance which one the other person meant —
 * that is the whole reason the pair exists. Returning only one of them leaves
 * half the searches answered, and returning the wrong one teaches the formula
 * for the other question.
 *
 * `aendring` is the move from `gammel` to `ny`, so the old figure is the whole.
 * `differens` is the symmetric difference on the mean, so the answer is the
 * same whichever number you start from. Both are read straight off the two
 * functions above rather than re-derived, so a change to either formula cannot
 * leave the tool quoting an old number.
 *
 * `udefineret` is true when the mean is zero — the pair 100 and −100 — where
 * the symmetric difference is a division by zero. It is reported rather than
 * returned as 0 %, because "0 % forskel" on 100 and −100 is the one answer the
 * reader must not get.
 */
export interface ProcentForskelSvar {
  /** Percent change from `gammel` to `ny`, signed. 0 when `gammel` is 0. */
  aendring: number;
  /** Symmetric percent difference on the mean. 0 when the mean is 0. */
  differens: number;
  /** The mean the symmetric difference divides by. */
  middel: number;
  /** True when the mean is 0 and the symmetric difference does not exist. */
  udefineret: boolean;
}

/** Both answers to the same pair of numbers, in one call. */
export function procentForskelMellemTal(gammel: number, ny: number): ProcentForskelSvar {
  const middel = (gammel + ny) / 2;
  return {
    aendring: procentForskel(ny, gammel),
    differens: procentDifferens(gammel, ny),
    middel,
    udefineret: middel === 0,
  };
}

/** The direction a percent move went, as the word the sentence needs. */
export type ProcentRetning = "stigning" | "fald" | "uaendret";

/**
 * Which way {@link ProcentForskelSvar.aendring} points.
 *
 * A change of exactly 0 % is `uaendret` and not a fall, so a table of "de tal
 * der faldt" cannot list a pair that stood still.
 */
export function procentRetning(aendring: number): ProcentRetning {
  if (aendring > 0) return "stigning";
  if (aendring < 0) return "fald";
  return "uaendret";
}

/**
 * Percent fall from `gammal` to `ny`: ((gammal - ny) / gammal) × 100.
 *
 * The same arithmetic as `procentForskel` with the direction reversed, but the
 * answer belongs positive: a price that drops by a fifth is "a fall of 20 %",
 * not "-20 %". The old figure is the whole, exactly as in the rise, so the two
 * are the same formula read the other way round.
 *
 * Why this exists: Danish autocomplete (hl=da&gl=dk, 2026-10-02) answers
 * "procent beregner" with "procent fald beregner" as completion 5 of 10 and
 * "procent besparelse beregner" as completion 6 of 10, and Swedish autocomplete
 * (hl=se&gl=se, same date) answers "procent fald" with ten completions about
 * fall ("procent fald mellem to tal", "procent fald formel", "procent stigning
 * och fald") and "procent minskning" with ten about decrease. /procent had
 * neither word in either language.
 */
export function procentFald(gammal: number, ny: number): number {
  if (gammal === 0) return 0;
  return ((gammal - ny) / gammal) * 100;
}

/**
 * What a fall of `faldProcent` saves on `belob`, in kroner: the part that is
 * gone, not the part that is left.
 *
 * This is the "besparelse" side of the autocomplete cluster — the question is
 * asked in kroner, not in percent ("hvor meget sparer jeg, når prisen falder
 * 20 %"), and answering it in percent alone leaves the search unanswered. It
 * is `procentAf` on purpose, so "20 % fald på 1.000 kr." is 200 kr. saved
 * everywhere on the page, and the price afterwards is the same call minus
 * this one.
 */
export function procentBesparelse(belob: number, faldProcent: number): number {
  return procentAf(belob, faldProcent);
}

/**
 * The fall pairs both languages show.
 *
 * Both are figures the page already promises elsewhere — 30 000 kr is the
 * salary in the FAQ and in `lonEksempel`, and 1 000 kr is `RABAT_BELOEB` in the
 * discount section — and each pair falls by a round percent, so the table
 * cannot show 9,09 % next to a "10 procent" somewhere else. That the salary
 * falls 10 % from 30 000 while it *rises* 11,1 % from 27 000 is the point of
 * the section: heltalet er det tal, bevægelsen starter fra.
 */
export const PROCENTFALD_EKSEMPEL = [
  { gammal: 30000, ny: 27000 },
  { gammal: 1000, ny: 800 },
];

/**
 * The whole numbers people ask "10 procent af" about, in both languages.
 *
 * Measured, not guessed: GSC lists "10 procent af" as the third largest query
 * on /procent (53 visninger, pos. 6, 2026-08-30 → 2026-09-27), and Danish
 * autocomplete (hl=da&gl=dk, 2026-09-30) answers it with nine numbers out of
 * ten — 100, 200, 75, 1 600, 25 000, 500, 300, 600, 400. Swedish autocomplete
 * (hl=se&gl=se, same date) answers "10 procent av" with 10 000, 500, 1 000,
 * 2 000 and four round million figures. The two lists are kept in one constant
 * so both domains answer the same cluster from a single source, the way
 * MINUTTER_TILL_TIMMAR does for /tidsberegner.
 *
 * The answers are *computed* by {@link procentAf}, never written out by hand:
 * 10 % is the number divided by ten, and a table that drifts from that rule
 * would be a wrong answer rather than a stale one. 75 is in the list on
 * purpose — it is the only measured number whose answer has a decimal
 * (7,5), so the table has to format a fraction correctly.
 */
export const PROCENT_10_AF_TAL = [75, 100, 200, 300, 400, 500, 600, 1000, 1600, 2000, 10000, 25000, 1000000, 2000000, 3000000, 4000000, 5000000];

/**
 * The number both languages' FAQ answers ask "10 procent of", named.
 *
 * 1 600 is in {@link PROCENT_10_AF_TAL} because the table shows it, but the
 * table is a *list* and a list cannot be addressed from a sentence: the Danish
 * and Swedish FAQ both answer "Vad är 10 procent av 1 600?" in running text,
 * and 2/10 those two sentences carried the amount as a hand-written literal.
 * A list member typed twice is two numbers that can disagree, so the one the
 * FAQ quotes is named here and the answer is computed by {@link procentAf}.
 *
 * Both domains ask it: Danish autocomplete (hl=da&gl=dk, 2026-09-30) answers
 * "10 procent af" with 1 600 as completion 4 of 10, and the Swedish FAQ asks
 * the same figure, so one constant answers both.
 */
export const PROCENT_10_AF_FAQ = 1600;

/**
 * The one worked example the Norwegian page quotes in its meta description:
 * "15% av 2 500 kr = 375 kr".
 *
 * A meta description is what Google shows under the result, so the arithmetic
 * in it is a claim to every visitor who searches. It was a hand-written
 * literal until 2/10, and `procentAf(2500, 15)` is the only thing that can say
 * whether it is still true.
 */
export const PROCENT_15_AV_BELOEB = { sats: 15, belob: 2500 };

/**
 * A given percent of a number: (tal × procent) / 100.
 *
 * The single rule behind every example on the page — the 10 % table, the
 * "Hurtige procent-tricks" rows and the calculator itself. Written once so the
 * table cannot disagree with the tool that produced the query.
 */
export function procentAf(tal: number, procent: number): number {
  return (tal * procent) / 100;
}

/**
 * A price cut as a positive percent of the normal price.
 *
 * Same rule as {@link procentForskel} — the price the item had before the cut
 * is the whole — but always positive, because nobody asks how big a discount
 * is and expects a minus sign. The absolute value is part of the rule, not a
 * formatting decision, so it lives here and not in the prose.
 *
 * What it does *not* carry is which of the two prices was higher. It measures
 * the gap on the normal price and drops the sign, so it can only ever produce
 * 12,5 for the pair below — never the 14,3 the reader gets by dividing with
 * the sale price, which is a different question answered by
 * {@link procentForskel} with the arguments the other way round. That is why
 * the prose names the divisor instead of leaving it to the reader.
 */
export function rabatProcent(normalPris: number, nedsatPris: number): number {
  return Math.abs(procentForskel(nedsatPris, normalPris));
}

/**
 * The two prices behind the question Google has registered for this page as
 * "en telefon er sat 1125 kr. ned. normalt koster den 9000 kr. hvor stor er
 * rabatten i procent?" (56 visninger, pos. 6, 2026-08-31 → 2026-09-28).
 *
 * Both figures are the reader's own, so the answer the page gives is the one
 * the query asks for. Every number in the rabat section is computed from this
 * pair — the discount, the new price and the 14,3 % the reader gets if they
 * divide by the sale price instead — so none of them can be typed wrong or
 * drift away from the sentence beside it.
 */
export const RABAT_EKSEMPEL = { normalPris: 9000, nedsatPris: 7875 };

/**
 * Both answers a reader needs after typing their own two prices into the rabat
 * tool: the rate in percent and the amount saved in kroner.
 *
 * The rate comes from {@link rabatProcent}, so it is the same 12,5 % the prose
 * and the FAQ give for {@link RABAT_EKSEMPEL}. `besparelse` is the plain
 * difference of the two prices and `erRabat` says which of them was higher —
 * a pair where the second price is higher is not a discount, and a reader who
 * gets "12,5 % rabat" for 9 000 → 10 125 has been told the wrong thing.
 */
export interface ProcentRabatSvar {
  /** The discount as a percent of the price before the cut. 0 when that price is 0. */
  rabat: number;
  /** The amount saved: `normalPris - nedsatPris`. Negative when the price rose. */
  besparelse: number;
  /** True when the new price is lower than the old one. */
  erRabat: boolean;
}

/** The discount in percent and the amount saved, from two prices the reader typed. */
export function procentRabat(normalPris: number, nedsatPris: number): ProcentRabatSvar {
  return {
    rabat: rabatProcent(normalPris, nedsatPris),
    besparelse: normalPris - nedsatPris,
    erRabat: nedsatPris < normalPris,
  };
}

/**
 * The price the "what does X % off cost" rows are worked out from.
 *
 * A round figure, because the rows are about the *rate*, not about a product:
 * 20 % off a 1 000 kr item is 800 kr whatever the item costs.
 */
export const RABAT_BELOEB = 1000;

/**
 * The one rate the prose argues about, named because two sentences on the page
 * make a claim about it: 33 % is not a third, so the "buy three, pay for two"
 * offer really costs 670 kr of a 1 000 kr item and not the 666,67 kr a third
 * would. Without a name the only way to write that claim is to type 33, which
 * is how the number and the sentence would drift apart.
 */
export const RABAT_SATS_UDLAET = 33;

/**
 * The discount rates a Danish or Swedish price tag actually carries, in the
 * order a shopper meets them.
 *
 * These are the rates the page could already document — 10 % and 25 % stand in
 * the "Procentregning i hverdagen" bullet and in the quick-trick table, and
 * 20 % is the standard "udsal" in Danish retail — so the table adds rows
 * rather than claims. {@link RABAT_SATS_UDLAET} is the odd one out on purpose:
 * it is the rate behind "køb tre, betal for to" style offers, and it is the
 * only row whose answer is not a round hundred, so it shows the rounding the
 * reader would otherwise have to guess.
 */
export const RABAT_SATS = [10, 20, 25, RABAT_SATS_UDLAET, 50];

/**
 * The four "percent in everyday life" figures, as `{ rate, amount }`.
 *
 * These are the worked examples in the bullet list under "Procentregning i
 * hverdagen": a 25 % discount on a 400 kr item, 25 % VAT on 1 000 kr, 5 % on
 * 10 000 kr, and a 3 % raise on 30 000 kr. They are *examples*, not rates —
 * nobody has to look them up, which is why the page may show them at all — but
 * every number in the sentence has to come from one of them, so the sentence
 * cannot state a discount that is not 25 % of 400 kr.
 *
 * The VAT rate is {@link DEFAULT_MOMS_SATS} rather than a number typed again,
 * because that one *is* a real rate and it already has an owner: if Danish
 * VAT ever moves off 25 %, this list follows it instead of contradicting
 * {@link DEFAULT_MOMS_SATS} one screen up.
 */
export interface HverdagsEksempel {
  /** The percentage the example applies. */
  sats: number;
  /** The amount the percentage is applied to, in kronor. */
  beloeb: number;
}

export const HVERDAG_RABAT: HverdagsEksempel = { sats: 25, beloeb: 400 };
export const HVERDAG_MOMS: HverdagsEksempel = { sats: DEFAULT_MOMS_SATS, beloeb: 1000 };
export const HVERDAG_RENTE: HverdagsEksempel = { sats: 5, beloeb: 10000 };
export const HVERDAG_LOENSTIGNING: HverdagsEksempel = { sats: 3, beloeb: 30000 };

/**
 * The two numbers behind the Excel table's first two rows.
 *
 * Row one is "how many percent is A1 of B1" — the share, not a change, so it
 * is `A1/B1*100` and nothing in the existing helpers produces it: the
 * calculator divides inline. Row two is the other direction,
 * {@link procentAf}. Both used to be written out in the table as
 * "2.500 af 10.000 = 25" and "10 procent af 10.000 = 1.000", so the answers
 * were typed rather than computed — the same class of mistake as a stale
 * rate, in a table the reader is told to copy into a spreadsheet.
 */
export const EXCEL_ANDEL = { del: 2500, heltal: 10000 };
export const EXCEL_PROCENT_AF = { sats: 10, heltal: 10000 };

/**
 * The amount and rate the "læg til / træk fra procent" mode opens on.
 *
 * 150 kr. and 20 % are the two numbers the page's own FAQ already quotes
 * ("Læg 20 % til 150: 150 × 1,20 = 180"), so the tool opens on the example the
 * prose answers instead of a fresh pair the page would then have to explain.
 */
export const PROCENT_TILLAEG_EKSEMPEL = { beloeb: 150, sats: 20 };

/**
 * A percentage added to an amount: beløb × (1 + procent/100).
 *
 * The question searchers ask most often about this tool — Danish autocomplete
 * (hl=da&gl=dk, 2026-10-07) answers "lægge procent til et tal" with ten
 * completions and "trække procent fra et tal" with ten more — and the one the
 * page's FAQ answers in words but the tool could not do. `procentAf` is the
 * single rule behind it, so the tool and the 10 %-table cannot disagree.
 */
export function laegProcentTil(beloeb: number, procent: number): number {
  return beloeb + procentAf(beloeb, procent);
}

/**
 * A percentage taken off an amount: beløb × (1 − procent/100).
 *
 * Same rule as {@link laegProcentTil} with the sign flipped, so "20 % fra
 * 1.000 kr." is 800 kr. everywhere and not a second formula that can drift.
 */
export function traekProcentFra(beloeb: number, procent: number): number {
  return beloeb - procentAf(beloeb, procent);
}

