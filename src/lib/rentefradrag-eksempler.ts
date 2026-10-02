/**
 * The numbers /rentefradrag repeats in its own metadata and its FAQ answers.
 *
 * `RENTEFRADRAG_2026` (satser-2026.ts) is the single source for the 2026 rates
 * and the two limits — highRate 33,6 %, lowRate 25,6 %, 50.000 kr. for a single
 * and 100.000 kr. for a couple — and `beregnRentefradrag` is what the tool
 * itself runs. The sentences in `page-data.ts` had all of it written out by
 * hand, which is the drift the quality rules call out: in 2027 a limit moves in
 * the module, the calculator moves with it, and the search result keeps
 * promising last year's figure. These answers are not only body text —
 * `FAQSchema` publishes them as JSON-LD, so Google quotes them.
 *
 * Every figure below is `formatBelob` over those same constants, and every
 * worked example is a `beregnRentefradrag` call, so a sentence cannot quote a
 * product the calculator does not produce. The Danish wording is byte-identical
 * to what the page said before, with one exception: "Skal par fordele
 * rentefradraget mellem sig?" claimed that a couple with 80.000 kr. in interest
 * gets *exactly the same* saving as a single person with 80.000 kr. It does
 * not — the couple's limit is double, so all 80.000 kr. is at the high rate
 * (26.880 kr. against 24.480 kr.). `page.tsx` has said the right thing about
 * the same pair of examples all along, so the FAQ contradicted its own page.
 */

import { formatBelob } from "./format";
import { beregnRentefradrag } from "./rentefradrag";
import { RENTEFRADRAG_2026 } from "./satser-2026";

/** The Danish reader, so the module has one separator and the page has one too. */
const DA = "da" as const;

const kr = (vaerdi: number) => formatBelob(vaerdi, DA);
/** «33,6 %» — the rate in running text, with a comma and a space. */
const pct = (vaerdi: number) => `${formatBelob(vaerdi, DA, 1)} %`;
/** «50.000 kr.» — the unit the sentences write after a limit or a limit's total. */
const krDot = (vaerdi: number) => `${kr(vaerdi)} kr.`;
/** «50.000 kr» — the same figure where the unit carries no full stop. */
const krBare = (vaerdi: number) => `${kr(vaerdi)} kr`;

const HOEJ = RENTEFRADRAG_2026.highRate * 100;
const LAV = RENTEFRADRAG_2026.lowRate * 100;
const ENLIG_GRÆNSE = RENTEFRADRAG_2026.highRateLimitSingle;
const PAR_GRÆNSE = RENTEFRADRAG_2026.highRateLimitCouple;

/**
 * The interest amount the page's own worked example uses, both for the single
 * person above the limit and for the couple inside the doubled one. The body
 * text declares it as `LOFT_EKSEMPEL_BELOEB` and runs the same
 * `beregnRentefradrag`; the answers quote the results rather than retyping them.
 */
export const RENTEFRADRAG_LOFT_EKSEMPEL = 80_000;

/** The single person at the high limit — the example the metadata leads with. */
const vedGrænsen = beregnRentefradrag(ENLIG_GRÆNSE, "single");
/** The same amount for a couple, whose limit is double. */
const enligLoft = beregnRentefradrag(RENTEFRADRAG_LOFT_EKSEMPEL, "single");
const parLoft = beregnRentefradrag(RENTEFRADRAG_LOFT_EKSEMPEL, "couple");

export function rentefradragDescription(): string {
  return `Hvad sparer du i skat? Fradragsværdi 2026: ${pct(HOEJ)} på de første ${krDot(ENLIG_GRÆNSE)} renter. Eksempel: ${krBare(ENLIG_GRÆNSE)} renter = ${krBare(vedGrænsen.besparelse)} i skattebesparelse. Beregn dit rentefradrag på boliglån og andre lån.`;
}

export function rentefradragMetaDescription(): string {
  return `Hvad sparer du i skat? Fradragsværdi 2026: ${pct(HOEJ)} på de første ${krDot(ENLIG_GRÆNSE)} renter. ${krBare(ENLIG_GRÆNSE)} renter sparer ${krBare(vedGrænsen.besparelse)} i skat. Beregn dit rentefradrag.`;
}

/**
 * The FAQ answers that quote a rate, a limit or a worked example, keyed by the
 * question they belong to. The answers with no figures stay hand-written in
 * `page-data.ts`, so this list only has to hold the ones that can drift.
 */
export const RENTEFRADRAG_FAQ_SVAR = {
  fradragsvaerdi: () =>
    `I 2026 er fradragsværdien ${pct(HOEJ)} for de første ${krDot(ENLIG_GRÆNSE)} renteudgifter (${krDot(PAR_GRÆNSE)} for par) og ${pct(LAV)} for beløbet derudover. Værdien afhænger altså af beløbsgrænsen — ikke af din kommune og ikke af om du betaler topskat.`,
  falder: () =>
    `I 2026 er den høje fradragsværdi ${pct(HOEJ)} for de første ${krDot(ENLIG_GRÆNSE)} (${krDot(PAR_GRÆNSE)} for par), og beløbet over grænsen har den lave værdi på ${pct(LAV)}. Satserne og grænserne står i RENTEFRADRAG_2026 med kilde til skat.dk, verificeret ${RENTEFRADRAG_2026.verifiedAt}.`,
  loft: () =>
    `Nej. Du kan trække fra alle dine renteudgifter — der er intet loft på selve beløbet. Det, der er begrænset, er kun hvor stor en andel der giver den høje fradragsværdi på ${pct(HOEJ)}: de første ${krDot(ENLIG_GRÆNSE)} (${krDot(PAR_GRÆNSE)} for par). Resten giver ${pct(LAV)}.`,
  effektiv: () =>
    `For en enlig med ${krDot(RENTEFRADRAG_LOFT_EKSEMPEL)} i renteudgifter er den effektive sats ${pct(enligLoft.effektivSats)}, fordi kun de første ${krDot(ENLIG_GRÆNSE)} giver ${pct(HOEJ)}. Bliver renterne højere, falder den effektive sats yderligere.`,
  par: () =>
    `Som udgangspunkt nej. Den fælles grænse er dobbelt så stor som den enkelte, så et par med ${krDot(RENTEFRADRAG_LOFT_EKSEMPEL)} i renter får ${krDot(parLoft.besparelse)} — ${krDot(parLoft.besparelse - enligLoft.besparelse)} mere end en enlig med samme beløb, fordi hele beløbet er under den fælles grænse på ${krDot(PAR_GRÆNSE)} og derfor får den høje sats. Begge parter får præcis samme besparelse, uanset om beløbet står på den ene eller deles i to lige dele. Fordeling hjælper først, når renterne er ujævnt fordelt.`,
} as const;

export type RentefradragFaqNavn = keyof typeof RENTEFRADRAG_FAQ_SVAR;

/**
 * The answers in the order `page-data.ts` asks for them. A wrong key is a
 * `never` at compile time rather than an empty sentence in production.
 */
export function rentefradragFaqSvar(...navne: RentefradragFaqNavn[]): string[] {
  return navne.map((navn) => RENTEFRADRAG_FAQ_SVAR[navn]());
}
