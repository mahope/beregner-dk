import { BARSEL_2026, SATSER_2026 } from "./satser-2026";
import { ugesats } from "./barsel/oekonomi";
import { estimerNettoMaaned } from "./barsel/netto";
import type { Beskaeftigelse } from "./barsel/types";

const UGER_PR_AAR = 52;
const MAANEDER_PR_AAR = 12;

export type BarselEmployment = "fulltime" | "parttime" | "selfemployed" | "unemployed";
export type BarselParent = "mor" | "far";

export interface BarselsdagpengeInput {
  /**
   * Fulltime/parttime: gross monthly salary. Self-employed: monthly profit
   * before tax. Unemployed: monthly a-dagpenge (the barselsdagpenge rate is
   * the same as the unemployment rate, barselsloven § 36).
   */
  monthlyIncome: number;
  weeklyHours: number;
  /** Weeks of leave in total (also the weeks where the employer pays salary). */
  weeks: number;
  /** Defaults to a full-time employee. */
  employment?: BarselEmployment;
  /** Weeks of leave where the employer pays salary (employees only). */
  employerWeeks?: number;
  /** Share of the salary the employer pays in those weeks, 1-100. */
  employerPercent?: number;
}

export interface BarselsdagpengeResult {
  weeklyRate: number;
  monthlyAmount: number;
  monthlyAfterTax: number;
  /** Benefit before tax for the weeks without salary from the employer. */
  totalAmount: number;
  /** Net income over the whole leave: salary from the employer plus benefits. */
  totalAfterTax: number;
  /** Net income per month, averaged over the whole leave. */
  averageMonthlyAfterTax: number;
  /** Weeks paid by the employer, and weeks paid by Udbetaling Danmark. */
  employerWeeks: number;
  benefitWeeks: number;
  /** Net monthly income while the employer pays salary (0 without employer pay). */
  employerMonthlyAfterTax: number;
  /** Benefit as a share of the usual gross pay, 0-100. */
  coveragePercent: number;
  /** Usual net pay per month minus net pay on benefits (never negative). */
  monthlyLoss: number;
  isHourlyRateCapped: boolean;
  /** Benefit per week is cut by the weekly maximum (self-employed, unemployed). */
  isWeeklyRateCapped: boolean;
}

export function isBarselEmployment(value: unknown): value is BarselEmployment {
  return (
    value === "fulltime" ||
    value === "parttime" ||
    value === "selfemployed" ||
    value === "unemployed"
  );
}

export function isBarselParent(value: unknown): value is BarselParent {
  return value === "mor" || value === "far";
}

function toBeskaeftigelse(employment: BarselEmployment): Beskaeftigelse {
  switch (employment) {
    case "selfemployed":
      return "selvstaendig";
    case "unemployed":
      return "ledig";
    default:
      return "loenmodtager";
  }
}

export function beregnBarselsdagpenge(
  input: BarselsdagpengeInput
): BarselsdagpengeResult | null {
  const { monthlyIncome, weeklyHours, weeks } = input;
  const employment = input.employment ?? "fulltime";
  const employerWeeks = input.employerWeeks ?? 0;
  const employerPercent = input.employerPercent ?? 100;
  const isEmployee = employment === "fulltime" || employment === "parttime";

  if (
    !Number.isFinite(monthlyIncome) ||
    monthlyIncome <= 0 ||
    !Number.isFinite(weeklyHours) ||
    weeklyHours <= 0 ||
    weeklyHours > BARSEL_2026.maxHoursForEstimate ||
    !Number.isInteger(weeks) ||
    weeks < 1 ||
    weeks > BARSEL_2026.maxWeeks ||
    !Number.isInteger(employerWeeks) ||
    employerWeeks < 0 ||
    employerWeeks > weeks ||
    !Number.isFinite(employerPercent) ||
    employerPercent <= 0 ||
    employerPercent > 100 ||
    (!isEmployee && employerWeeks > 0)
  ) {
    return null;
  }

  const hours = employment === "parttime" ? weeklyHours : BARSEL_2026.fullTimeHours;
  const weeklyRate = ugesats({
    beskaeftigelse: toBeskaeftigelse(employment),
    maanedsloen: monthlyIncome,
    ugentligeTimer: hours,
    ydelseMaaned: monthlyIncome,
  });

  const usualWeekly = (monthlyIncome * MAANEDER_PR_AAR) / UGER_PR_AAR;
  const monthlyAmount = (weeklyRate * UGER_PR_AAR) / MAANEDER_PR_AAR;
  const benefitWeeks = weeks - employerWeeks;
  const monthsPerWeek = MAANEDER_PR_AAR / UGER_PR_AAR;

  const benefitNet = estimerNettoMaaned({ loen: 0, ydelse: monthlyAmount }).netto;
  // Unemployed people already get a benefit, so their usual pay is that benefit.
  const usualNet =
    employment === "unemployed"
      ? estimerNettoMaaned({ loen: 0, ydelse: monthlyIncome }).netto
      : estimerNettoMaaned({ loen: monthlyIncome, ydelse: 0 }).netto;
  // The employer's refund is capped at the salary paid (barselsloven § 39), so the
  // employee gets the benefit when it exceeds the partial salary: max of the two.
  const employerNet =
    employerWeeks > 0
      ? Math.max(
          estimerNettoMaaned({ loen: (monthlyIncome * employerPercent) / 100, ydelse: 0 }).netto,
          benefitNet
        )
      : 0;

  const totalNet =
    benefitNet * benefitWeeks * monthsPerWeek + employerNet * employerWeeks * monthsPerWeek;
  const averageMonthlyAfterTax = totalNet / (weeks * monthsPerWeek);

  const isHourlyRateCapped =
    isEmployee &&
    ((monthlyIncome * MAANEDER_PR_AAR) / UGER_PR_AAR / hours) * (1 - SATSER_2026.amBidrag) >=
      BARSEL_2026.maxWeeklyRate / BARSEL_2026.fullTimeHours;
  const isWeeklyRateCapped = !isEmployee && usualWeekly > BARSEL_2026.maxWeeklyRate;

  return {
    weeklyRate,
    monthlyAmount,
    monthlyAfterTax: benefitNet,
    totalAmount: weeklyRate * benefitWeeks,
    totalAfterTax: totalNet,
    averageMonthlyAfterTax,
    employerWeeks,
    benefitWeeks,
    employerMonthlyAfterTax: employerNet,
    coveragePercent: Math.min(
      100,
      ((weeklyRate * benefitWeeks +
        Math.max((usualWeekly * employerPercent) / 100, weeklyRate) * employerWeeks) /
        (usualWeekly * weeks)) *
        100
    ),
    monthlyLoss: Math.max(0, usualNet - averageMonthlyAfterTax),
    isHourlyRateCapped,
    isWeeklyRateCapped,
  };
}

export interface BarselsUger {
  /** Weeks with benefits before the birth (mother only). */
  beforeBirth: number;
  /** Weeks with benefits after the birth before any transfer. */
  afterBirth: number;
  /** Earmarked weeks that cannot be transferred: 2 + 9 (barselsloven § 7 and § 21, stk. 3). */
  earmarked: number;
  /** Most weeks the parent can hand over to the other parent. */
  transferable: number;
  /** Weeks handed over (positive) or taken over (negative), clamped to the limit. */
  transferred: number;
  /** The parent's own weeks after the transfer, including weeks before the birth. */
  total: number;
  /** The other parent's weeks after the transfer. */
  partnerTotal: number;
}

/**
 * How the benefit weeks are split between two parents who live together
 * (children born from 2 August 2022). `transferred` is positive when this
 * parent hands weeks to the partner and negative when taking weeks over.
 * Earmarked weeks stay with the parent, so only the 13 shareable weeks move.
 */
export function fordelBarselsUger(parent: BarselParent, transferred = 0): BarselsUger {
  const limit = BARSEL_2026.maxTransferableWeeks;
  const moved = Math.max(-limit, Math.min(limit, Math.trunc(transferred) || 0));
  const beforeBirth = parent === "mor" ? BARSEL_2026.motherBeforeBirthWeeks : 0;
  const partnerBeforeBirth = parent === "mor" ? 0 : BARSEL_2026.motherBeforeBirthWeeks;
  const atBirth =
    parent === "mor" ? BARSEL_2026.motherAtBirthWeeks : BARSEL_2026.fatherAtBirthWeeks;
  const earmarked = atBirth + BARSEL_2026.earmarkedWeeks;

  return {
    beforeBirth,
    afterBirth: BARSEL_2026.afterBirthWeeks,
    earmarked,
    transferable: limit,
    transferred: moved,
    total: beforeBirth + BARSEL_2026.afterBirthWeeks - moved,
    partnerTotal: partnerBeforeBirth + BARSEL_2026.afterBirthWeeks + moved,
  };
}
