import { BOLIGSTOETTE_2026 } from "./satser-2026";

export type BoligstoettePensionStatus =
  | "ingen"
  | "foertidspension"
  | "folkepension";

export type BoligstoetteWealthConsideration =
  | "ingen"
  | "10-procent"
  | "20-procent";

export function isBoligstoettePensionStatus(
  value: unknown,
): value is BoligstoettePensionStatus {
  return value === "ingen" || value === "foertidspension" || value === "folkepension";
}

export interface BoligstoetteInput {
  monthlyRent: number;
  annualIncome: number;
  householdSize: number;
  children: number;
  wealth: number | null;
  area: number;
  pensionStatus: BoligstoettePensionStatus;
}

export interface BoligstoetteResult {
  maximumMonthly: number;
  screeningLowMonthly: number;
  screeningHighMonthly: number;
  maximumShareOfRent: number;
  wealthConsideration: BoligstoetteWealthConsideration | null;
  wealthIncomeEquivalent: number | null;
  wealthAdjustedIncome: number | null;
  area: number;
}

export const DEFAULT_BOLIGSTOETTE_INPUT: BoligstoetteInput = {
  monthlyRent: 0,
  annualIncome: 0,
  householdSize: 1,
  children: 0,
  wealth: null,
  area: 65,
  pensionStatus: "ingen",
};

export const MINIMUM_BOLIGSTOETTE_RENT = 0.01;

export function parseBoligstoetteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const normalized = value.trim();
  let candidate = normalized;
  if (normalized.includes(",") && normalized.includes(".")) {
    candidate = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    candidate = normalized.replace(",", ".");
  } else if (/^[+-]?[1-9]\d*(?:\.\d{3})+$/.test(normalized)) {
    candidate = normalized.replace(/\./g, "");
  }

  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : null;
}

function nonNegativeNumber(value: unknown, fallback: number): number {
  const parsed = parseBoligstoetteNumber(value);
  return parsed !== null && parsed >= 0 ? parsed : fallback;
}

function optionalNonNegativeNumber(value: unknown): number | null {
  const parsed = parseBoligstoetteNumber(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}

function truncateToCents(value: number): number {
  const [mantissa, exponentText] = value.toString().toLowerCase().split("e");
  const exponent = exponentText ? Number(exponentText) : 0;
  const [whole, fraction = ""] = mantissa.split(".");
  const digits = `${whole}${fraction}`;
  const decimalIndex = whole.length + exponent;

  if (decimalIndex <= 0) return 0;
  const wholePart = digits.slice(0, decimalIndex);
  const cents = digits.slice(decimalIndex, decimalIndex + 2).padEnd(2, "0");
  return Number(`${wholePart}.${cents}`);
}

function boundedInteger(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsed = parseBoligstoetteNumber(value);
  return parsed !== null && Number.isSafeInteger(parsed) && parsed >= minimum
    ? Math.min(parsed, maximum)
    : fallback;
}

export function normaliserBoligstoetteInputs(value: unknown): BoligstoetteInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_BOLIGSTOETTE_INPUT };
  }

  const inputs = value as Record<string, unknown>;
  const householdSize = boundedInteger(inputs.antalPersoner, 1, 1, 7);
  const requestedChildren = boundedInteger(inputs.antalBorn, 0, 0, 4);
  const children = Math.min(
    requestedChildren,
    householdSize === 7 ? 4 : Math.max(0, householdSize - 1),
  );
  const pensionStatus = isBoligstoettePensionStatus(inputs.pensionStatus)
    ? inputs.pensionStatus
    : "ingen";

  return {
    monthlyRent: nonNegativeNumber(inputs.maanedligHusleje, 0),
    annualIncome: nonNegativeNumber(inputs.husstandsindkomst, 0),
    householdSize,
    children,
    wealth: optionalNonNegativeNumber(inputs.formue),
    area: nonNegativeNumber(inputs.areal, 65),
    pensionStatus,
  };
}

function officialMaximumMonthly(
  pensionStatus: BoligstoettePensionStatus,
  children: number,
): number {
  if (pensionStatus === "folkepension") {
    if (children === 0) {
      return BOLIGSTOETTE_2026.maximumMonthly.oldPension.noChildren;
    }
    return children < 4
      ? BOLIGSTOETTE_2026.maximumMonthly.oldPension.oneToThreeChildren
      : BOLIGSTOETTE_2026.maximumMonthly.oldPension.fourPlusChildren;
  }

  if (pensionStatus === "foertidspension") {
    if (children === 0) {
      return BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension.noChildren;
    }
    return children < 4
      ? BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension.oneToThreeChildren
      : BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension.fourPlusChildren;
  }

  if (children === 0) {
    return BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.noChildren;
  }

  return children < 4
    ? BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.oneToThreeChildren
    : BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.fourPlusChildren;
}

function wealthConsideration(
  pensionStatus: BoligstoettePensionStatus,
  wealth: number | null,
): {
  rate: BoligstoetteWealthConsideration | null;
  equivalent: number | null;
} {
  if (wealth === null) {
    return { rate: null, equivalent: null };
  }

  const thresholds =
    pensionStatus === "folkepension"
      ? BOLIGSTOETTE_2026.wealth.pensioner
      : BOLIGSTOETTE_2026.wealth.nonPensioner;
  const considerationRates = BOLIGSTOETTE_2026.wealth.considerationRates;

  if (wealth <= thresholds.noEffect) {
    return { rate: "ingen", equivalent: 0 };
  }

  if (wealth < thresholds.tenPercent) {
    return {
      rate: "10-procent",
      equivalent:
        (wealth - thresholds.noEffect) * considerationRates.tenPercent,
    };
  }

  return {
    rate: "20-procent",
    equivalent:
      (thresholds.tenPercent - thresholds.noEffect) *
        considerationRates.tenPercent +
      (wealth - thresholds.tenPercent) * considerationRates.twentyPercent,
  };
}

export function beregnBoligstoette(
  input: BoligstoetteInput | null | undefined,
): BoligstoetteResult | null {
  if (
    !input ||
    typeof input !== "object" ||
    !Number.isFinite(input.monthlyRent) ||
    input.monthlyRent < MINIMUM_BOLIGSTOETTE_RENT ||
    !Number.isFinite(input.annualIncome) ||
    input.annualIncome < 0 ||
    !Number.isSafeInteger(input.householdSize) ||
    input.householdSize < 1 ||
    !Number.isInteger(input.children) ||
    input.children < 0 ||
    input.children > 4 ||
    (input.householdSize < 5 && input.children >= input.householdSize) ||
    (input.wealth !== null &&
      (!Number.isFinite(input.wealth) || input.wealth < 0)) ||
    !isBoligstoettePensionStatus(input.pensionStatus) ||
    !Number.isFinite(input.area) ||
    input.area <= 0
  ) {
    return null;
  }

  const maximumMonthly = officialMaximumMonthly(input.pensionStatus, input.children);
  const wealthResult = wealthConsideration(input.pensionStatus, input.wealth);
  const wealthAdjustedIncome =
    wealthResult.equivalent === null ? null : input.annualIncome + wealthResult.equivalent;
  if (wealthAdjustedIncome !== null && !Number.isFinite(wealthAdjustedIncome)) {
    return null;
  }

  const screeningHighMonthly = truncateToCents(
    Math.min(maximumMonthly, input.monthlyRent),
  );
  const exactMaximumShareOfRent =
    (screeningHighMonthly / input.monthlyRent) * 100;
  const maximumShareOfRent = Math.round(exactMaximumShareOfRent);

  return {
    maximumMonthly,
    screeningLowMonthly: 0,
    screeningHighMonthly,
    maximumShareOfRent,
    wealthConsideration: wealthResult.rate,
    wealthIncomeEquivalent: wealthResult.equivalent,
    wealthAdjustedIncome,
    area: input.area,
  };
}
