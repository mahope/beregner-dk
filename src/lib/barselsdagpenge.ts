import { BARSEL_2026 } from "./satser-2026";

const WEEKS_PER_MONTH = 4.33;
const ESTIMATED_TAX_RATE = 0.38;

export interface BarselsdagpengeInput {
  monthlyIncome: number;
  weeklyHours: number;
  weeks: number;
}

export interface BarselsdagpengeResult {
  weeklyRate: number;
  monthlyAmount: number;
  monthlyAfterTax: number;
  totalAmount: number;
  totalAfterTax: number;
  coveragePercent: number;
  monthlyLoss: number;
  isHourlyRateCapped: boolean;
}

export type BarselEmployment = "fulltime" | "parttime" | "selfemployed" | "unemployed";
export type BarselParent = "mor" | "far";

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

export function beregnBarselsdagpenge(
  input: BarselsdagpengeInput
): BarselsdagpengeResult | null {
  const { monthlyIncome, weeklyHours, weeks } = input;

  if (
    !Number.isFinite(monthlyIncome) ||
    monthlyIncome <= 0 ||
    !Number.isFinite(weeklyHours) ||
    weeklyHours <= 0 ||
    weeklyHours > BARSEL_2026.maxHoursForEstimate ||
    !Number.isInteger(weeks) ||
    weeks < 1 ||
    weeks > BARSEL_2026.maxWeeks
  ) {
    return null;
  }

  const monthlyHours = weeklyHours * WEEKS_PER_MONTH;
  const hourlyRate = monthlyIncome / monthlyHours;
  const calculatedWeeklyRate = hourlyRate * weeklyHours;
  const maxHourlyRate = BARSEL_2026.maxWeeklyRate / BARSEL_2026.fullTimeHours;
  const hourlyBenefitRate = Math.min(hourlyRate, maxHourlyRate);
  const weeklyRate = hourlyBenefitRate * weeklyHours;
  const monthlyAmount = weeklyRate * WEEKS_PER_MONTH;
  const totalAmount = weeklyRate * weeks;
  const monthlyAfterTax = monthlyAmount * (1 - ESTIMATED_TAX_RATE);
  const totalAfterTax = totalAmount * (1 - ESTIMATED_TAX_RATE);

  return {
    weeklyRate,
    monthlyAmount,
    monthlyAfterTax,
    totalAmount,
    totalAfterTax,
    coveragePercent: Math.min(100, (weeklyRate / calculatedWeeklyRate) * 100),
    monthlyLoss: monthlyIncome - monthlyAfterTax,
    isHourlyRateCapped: hourlyRate >= maxHourlyRate,
  };
}
