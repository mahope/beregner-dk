import { SATSER_2026, SU_2026 } from "./satser-2026";

export type SuEducation = "videregaaende" | "ungdom";
export type SuYouthAgeGroup = "18to19" | "20plus";
export type SuHousing = "udeboende" | "hjemmeboende";
export type SuHomewardScheme = "current" | "legacy";
export type SuNonSuStatus = "enrolled" | "notStudying";
export type SuDisabilityType = "none" | "videregaaende" | "erhverv";

export interface SuInput {
  education: SuEducation;
  youthAgeGroup: SuYouthAgeGroup;
  housing: SuHousing;
  homewardScheme: SuHomewardScheme;
  youthAwayApproved: boolean;
  monthlyWorkIncome: number;
  suMonths: number;
  nonSuStatus: SuNonSuStatus;
  disabilityType: SuDisabilityType;
  hasChildUnder18: boolean;
  singleParentEligible: boolean;
}

export interface SuResult {
  basisSU: number;
  disabilitySupplement: number;
  parentSupplement: number;
  monthlyGross: number;
  annualGross: number;
  monthlyFreeAllowanceWithSu: number;
  monthlyFreeAllowanceWithoutSu: number;
  childFreeAllowanceAddition: number;
  annualFreeAllowance: number;
  annualWorkIncomeAfterAM: number;
  excess: number;
  studyLoan: number;
  isParentalIncomeEstimate: boolean;
  maximumParentalIncomeSU: number | null;
  isLegacyEstimate: boolean;
  youthAwayApprovalMissing: boolean;
}

export const DEFAULT_SU_INPUT: SuInput = {
  education: "videregaaende",
  youthAgeGroup: "20plus",
  housing: "udeboende",
  homewardScheme: "current",
  youthAwayApproved: false,
  monthlyWorkIncome: 5000,
  suMonths: 12,
  nonSuStatus: "enrolled",
  disabilityType: "none",
  hasChildUnder18: false,
  singleParentEligible: false,
};

export function normaliserSuInputs(value: unknown): SuInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_SU_INPUT };
  }

  const inputs = value as Record<string, unknown>;
  const education =
    inputs.uddannelse === "ungdom" || inputs.uddannelse === "videregaaende"
      ? inputs.uddannelse
      : DEFAULT_SU_INPUT.education;
  const legacyParentState = inputs.boligstatus === "foraelder";
  const housing =
    inputs.boligstatus === "hjemmeboende" ? "hjemmeboende" : "udeboende";
  const youthAgeGroup =
    inputs.youthAgeGroup === "18to19" || inputs.youthAgeGroup === "20plus"
      ? inputs.youthAgeGroup
      : DEFAULT_SU_INPUT.youthAgeGroup;
  const homewardScheme =
    inputs.homewardScheme === "current" || inputs.homewardScheme === "legacy"
      ? inputs.homewardScheme
      : education === "videregaaende" && housing === "hjemmeboende"
        ? "legacy"
        : DEFAULT_SU_INPUT.homewardScheme;
  const youthAwayApproved =
    inputs.youthAwayApproved === true
      ? true
      : DEFAULT_SU_INPUT.youthAwayApproved;
  const monthlyWorkIncome =
    typeof inputs.arbejdsindkomst === "number" &&
    Number.isFinite(inputs.arbejdsindkomst) &&
    inputs.arbejdsindkomst >= 0
      ? inputs.arbejdsindkomst
      : DEFAULT_SU_INPUT.monthlyWorkIncome;
  const suMonths =
    typeof inputs.antalMaaneder === "number" &&
    Number.isInteger(inputs.antalMaaneder) &&
    inputs.antalMaaneder >= 0 &&
    inputs.antalMaaneder <= 12
      ? inputs.antalMaaneder
      : DEFAULT_SU_INPUT.suMonths;
  const nonSuStatus =
    inputs.nonSuStatus === "notStudying"
      ? "notStudying"
      : DEFAULT_SU_INPUT.nonSuStatus;
  const compatibleDisabilityType =
    education === "ungdom" ? "erhverv" : "videregaaende";
  const requestedDisabilityType =
    inputs.handicapType === "videregaaende" ||
    inputs.handicapType === "erhverv" ||
    inputs.handicapType === "none"
      ? inputs.handicapType
      : inputs.harHandicap === true
        ? compatibleDisabilityType
        : DEFAULT_SU_INPUT.disabilityType;
  const disabilityType =
    requestedDisabilityType === "none" ||
    requestedDisabilityType === compatibleDisabilityType
      ? requestedDisabilityType
      : "none";
  const hasChildUnder18 =
    inputs.harBarnUnder18 === true ||
    inputs.erEnligForsorger === true ||
    legacyParentState;
  const singleParentEligible =
    hasChildUnder18 && inputs.erEnligForsorger === true;

  return {
    education,
    youthAgeGroup,
    housing,
    homewardScheme,
    youthAwayApproved,
    monthlyWorkIncome,
    suMonths,
    nonSuStatus,
    disabilityType,
    hasChildUnder18,
    singleParentEligible,
  };
}

export function beregnSu(input: SuInput): SuResult | null {
  if (
    !Number.isFinite(input.monthlyWorkIncome) ||
    input.monthlyWorkIncome < 0 ||
    !Number.isInteger(input.suMonths) ||
    input.suMonths < 0 ||
    input.suMonths > 12
  ) {
    return null;
  }

  const isYouth18To19 =
    input.education === "ungdom" && input.youthAgeGroup === "18to19";
  const usesLegacyHomewardScheme =
    input.housing === "hjemmeboende" && input.homewardScheme === "legacy";
  const usesCurrentHomewardScheme =
    input.housing === "hjemmeboende" && input.homewardScheme === "current";
  const isYouthAwayBaseEstimate =
    input.housing === "udeboende" &&
    isYouth18To19 &&
    !input.hasChildUnder18 &&
    input.youthAwayApproved;
  const isCurrentHomewardBaseEstimate =
    usesCurrentHomewardScheme && !input.hasChildUnder18;
  const isYouthLegacyBaseEstimate =
    input.education === "ungdom" &&
    isYouth18To19 &&
    usesLegacyHomewardScheme &&
    !input.hasChildUnder18;
  const isLegacyEstimate = usesLegacyHomewardScheme;
  const youthAwayApprovalMissing =
    input.housing === "udeboende" &&
    isYouth18To19 &&
    !input.hasChildUnder18 &&
    !input.youthAwayApproved;
  const isParentalIncomeEstimate =
    isYouthAwayBaseEstimate ||
    isCurrentHomewardBaseEstimate ||
    isYouthLegacyBaseEstimate ||
    youthAwayApprovalMissing;
  const maximumParentalIncomeSU = isParentalIncomeEstimate
    ? isYouthAwayBaseEstimate
      ? SU_2026.udeboende
      : isYouthLegacyBaseEstimate
        ? SU_2026.homewardLegacy
        : SU_2026.homewardMaximum
    : null;

  let basisSU: number;
  if (input.housing === "udeboende") {
    basisSU =
      isYouth18To19 && input.youthAwayApproved && !input.hasChildUnder18
        ? SU_2026.youthAway18To19Base
        : isYouth18To19 && !input.hasChildUnder18
          ? SU_2026.homewardBase
          : SU_2026.udeboende;
  } else if (usesLegacyHomewardScheme) {
    basisSU = isYouthLegacyBaseEstimate
      ? SU_2026.youthLegacy18To19Base
      : SU_2026.homewardLegacy;
  } else if (input.hasChildUnder18) {
    basisSU = SU_2026.homewardMaximum;
  } else {
    basisSU = SU_2026.homewardBase;
  }

  const disabilitySupplement =
    input.disabilityType === "videregaaende"
      ? SU_2026.disabilitySupplement.videregaaende
      : input.disabilityType === "erhverv"
        ? SU_2026.disabilitySupplement.erhverv
        : 0;
  const parentSupplement = input.singleParentEligible
    ? SU_2026.singleParentSupplement
    : 0;
  const monthlyGross =
    input.suMonths > 0 ? basisSU + disabilitySupplement + parentSupplement : 0;
  const standardFreeAllowanceWithSu =
    (input.education === "ungdom"
      ? SU_2026.freeAllowance.youthWithSu
      : SU_2026.freeAllowance.videregaaendeWithSu) +
    (maximumParentalIncomeSU ? maximumParentalIncomeSU - basisSU : 0);
  const monthlyFreeAllowanceWithSu =
    input.disabilityType === "none"
      ? standardFreeAllowanceWithSu
      : SU_2026.freeAllowance.disabilityMonth;
  const monthlyFreeAllowanceWithoutSu =
    input.nonSuStatus === "notStudying"
      ? SU_2026.freeAllowance.notStudying
      : SU_2026.freeAllowance.enrolledWithoutSu;
  const childFreeAllowanceAddition = input.hasChildUnder18
    ? SU_2026.freeAllowance.childUnder18Annual
    : 0;
  const annualFreeAllowance =
    monthlyFreeAllowanceWithSu * input.suMonths +
    monthlyFreeAllowanceWithoutSu * (12 - input.suMonths) +
    childFreeAllowanceAddition;
  const annualWorkIncomeAfterAM =
    input.monthlyWorkIncome * 12 * (1 - SATSER_2026.amBidrag);
  const studyLoan =
    input.suMonths > 0
      ? input.hasChildUnder18
        ? SU_2026.loan.combinedMonthly
        : SU_2026.loan.ordinaryMonthly
      : 0;

  return {
    basisSU,
    disabilitySupplement,
    parentSupplement,
    monthlyGross,
    annualGross: monthlyGross * input.suMonths,
    monthlyFreeAllowanceWithSu,
    monthlyFreeAllowanceWithoutSu,
    childFreeAllowanceAddition,
    annualFreeAllowance,
    annualWorkIncomeAfterAM,
    excess: Math.max(0, annualWorkIncomeAfterAM - annualFreeAllowance),
    studyLoan,
    isParentalIncomeEstimate,
    maximumParentalIncomeSU,
    isLegacyEstimate,
    youthAwayApprovalMissing,
  };
}
