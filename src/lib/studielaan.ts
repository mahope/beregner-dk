import { SU_2026 } from "./satser-2026";

export interface StudielaanInput {
  totalDebt: number;
  annualInterestRate: number;
  repaymentYears: number;
  extraMonthlyPayment: number;
  monthlyIncome: number;
}

export const DEFAULT_STUDIELAAN_INPUT: StudielaanInput = {
  totalDebt: 100000,
  annualInterestRate: SU_2026.loan.afterGraduationRate * 100,
  repaymentYears: SU_2026.loan.repaymentMinYears,
  extraMonthlyPayment: 0,
  monthlyIncome: 25000,
};

function validNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function normaliserStudielaanInputs(
  value: unknown,
  allowLegacyRepaymentYears = false,
): StudielaanInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_STUDIELAAN_INPUT };
  }

  const inputs = value as Record<string, unknown>;
  const repaymentYears = inputs.loebetid;
  const minimumRepaymentYears = allowLegacyRepaymentYears
    ? 1
    : SU_2026.loan.repaymentMinYears;

  return {
    totalDebt: validNumber(inputs.samletGaeld)
      ? inputs.samletGaeld
      : DEFAULT_STUDIELAAN_INPUT.totalDebt,
    annualInterestRate:
      validNumber(inputs.rente) && inputs.rente <= 15
        ? inputs.rente
        : DEFAULT_STUDIELAAN_INPUT.annualInterestRate,
    repaymentYears:
      validNumber(repaymentYears) &&
      Number.isInteger(repaymentYears) &&
      repaymentYears >= minimumRepaymentYears &&
      repaymentYears <= SU_2026.loan.repaymentMaxYears
        ? repaymentYears
        : DEFAULT_STUDIELAAN_INPUT.repaymentYears,
    extraMonthlyPayment: validNumber(inputs.ekstraAfdrag)
      ? inputs.ekstraAfdrag
      : DEFAULT_STUDIELAAN_INPUT.extraMonthlyPayment,
    monthlyIncome: validNumber(inputs.maanedligIndkomst)
      ? inputs.maanedligIndkomst
      : DEFAULT_STUDIELAAN_INPUT.monthlyIncome,
  };
}
