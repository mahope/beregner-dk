import { describe, expect, test } from "vitest";
import { beregnSu as calculateSu, normaliserSuInputs, type SuInput } from "./su";

const baseInput: SuInput = {
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

describe("beregnSu", () => {
  test("beregner udeboende VU og ungdom 20+ før skat", () => {
    expect(calculateSu(baseInput)).toMatchObject({
      basisSU: 7426,
      disabilitySupplement: 0,
      parentSupplement: 0,
      monthlyGross: 7426,
      annualGross: 89112,
      annualFreeAllowance: 248988,
      annualWorkIncomeAfterAM: 55200,
      studyLoan: 3799,
    });
    expect(calculateSu({ ...baseInput, education: "ungdom" })).toMatchObject({
      basisSU: 7426,
      monthlyGross: 7426,
    });
  });

  test("beregner aktuel hjemmeboende som et eksplicit grundsats-scenarie", () => {
    const result = calculateSu({ ...baseInput, housing: "hjemmeboende" });

    expect(result).toMatchObject({
      basisSU: 1154,
      monthlyGross: 1154,
      monthlyFreeAllowanceWithSu: 22797,
      annualFreeAllowance: 273564,
      isParentalIncomeEstimate: true,
      maximumParentalIncomeSU: 3202,
      isLegacyEstimate: false,
    });
  });

  test("bevarer den gamle faste VU-hjemmeboende ordning i gamle delelinks", () => {
    expect(
      calculateSu({
        ...baseInput,
        housing: "hjemmeboende",
        homewardScheme: "legacy",
      }),
    ).toMatchObject({
      basisSU: 3692,
      monthlyGross: 3692,
      monthlyFreeAllowanceWithSu: 20749,
      isParentalIncomeEstimate: false,
      maximumParentalIncomeSU: null,
      isLegacyEstimate: true,
    });
    expect(
      calculateSu({
        ...baseInput,
        housing: "hjemmeboende",
        homewardScheme: "legacy",
        hasChildUnder18: true,
      }),
    ).toMatchObject({ basisSU: 3692, monthlyGross: 3692, isLegacyEstimate: true });
  });

  test("modellerer de to gamle ungdomsordninger fra før 1. juli 2014", () => {
    expect(
      calculateSu({
        ...baseInput,
        education: "ungdom",
        youthAgeGroup: "18to19",
        housing: "hjemmeboende",
        homewardScheme: "legacy",
      }),
    ).toMatchObject({
      basisSU: 1643,
      monthlyFreeAllowanceWithSu: 17346,
      isParentalIncomeEstimate: true,
      maximumParentalIncomeSU: 3692,
      isLegacyEstimate: true,
    });
    expect(
      calculateSu({
        ...baseInput,
        education: "ungdom",
        youthAgeGroup: "18to19",
        housing: "hjemmeboende",
        homewardScheme: "legacy",
        hasChildUnder18: true,
      }),
    ).toMatchObject({ basisSU: 3692, isLegacyEstimate: true });
    expect(
      calculateSu({
        ...baseInput,
        education: "ungdom",
        youthAgeGroup: "20plus",
        housing: "hjemmeboende",
        homewardScheme: "legacy",
        hasChildUnder18: true,
      }),
    ).toMatchObject({
      basisSU: 3692,
      isParentalIncomeEstimate: false,
      isLegacyEstimate: true,
    });
  });

  test("kræver godkendelse for en 18-19-årig udeboende ungdomsstuderende", () => {
    const youth = {
      ...baseInput,
      education: "ungdom" as const,
      youthAgeGroup: "18to19" as const,
    };

    expect(calculateSu(youth)).toMatchObject({
      basisSU: 1154,
      youthAwayApprovalMissing: true,
      isParentalIncomeEstimate: true,
      maximumParentalIncomeSU: 3202,
    });
    expect(
      calculateSu({ ...youth, youthAwayApproved: true }),
    ).toMatchObject({
      basisSU: 4764,
      youthAwayApprovalMissing: false,
      isParentalIncomeEstimate: true,
      maximumParentalIncomeSU: 7426,
      monthlyFreeAllowanceWithSu: 17959,
    });
  });

  test("giver 18-19-årige med barn fuld udeboendesats uden godkendelse", () => {
    expect(
      calculateSu({
        ...baseInput,
        education: "ungdom",
        youthAgeGroup: "18to19",
        hasChildUnder18: true,
      }),
    ).toMatchObject({
      basisSU: 7426,
      youthAwayApprovalMissing: false,
      isParentalIncomeEstimate: false,
      maximumParentalIncomeSU: null,
    });
  });

  test("adskiller barnets sats fra forsørgertillægget", () => {
    expect(
      calculateSu({
        ...baseInput,
        housing: "hjemmeboende",
        hasChildUnder18: true,
      }),
    ).toMatchObject({
      basisSU: 3202,
      parentSupplement: 0,
      monthlyGross: 3202,
      childFreeAllowanceAddition: 34129,
    });
    expect(
      calculateSu({
        ...baseInput,
        housing: "hjemmeboende",
        hasChildUnder18: true,
        singleParentEligible: true,
      }),
    ).toMatchObject({
      basisSU: 3202,
      parentSupplement: 7426,
      monthlyGross: 10628,
      childFreeAllowanceAddition: 34129,
      studyLoan: 5699,
    });
  });

  test("anvender handicaptillæggets nedsatte fribeløb kun i valgte SU-måneder", () => {
    expect(
      calculateSu({
        ...baseInput,
        disabilityType: "videregaaende",
        suMonths: 6,
      }),
    ).toMatchObject({
      disabilitySupplement: 10562,
      monthlyGross: 17988,
      monthlyFreeAllowanceWithSu: 3921,
      monthlyFreeAllowanceWithoutSu: 23598,
      annualFreeAllowance: 165114,
    });
    expect(
      calculateSu({
        ...baseInput,
        education: "ungdom",
        disabilityType: "erhverv",
      }),
    ).toMatchObject({
      disabilitySupplement: 6624,
      monthlyGross: 14050,
      annualFreeAllowance: 47052,
    });
    expect(
      calculateSu({
        ...baseInput,
        disabilityType: "videregaaende",
        suMonths: 0,
      }),
    ).toMatchObject({ monthlyGross: 0, studyLoan: 0, annualFreeAllowance: 283176 });
  });

  test("beregner årligt fribeløb fra SU- og ikke-SU-måneder", () => {
    expect(
      calculateSu({ ...baseInput, suMonths: 6 }),
    ).toMatchObject({ annualFreeAllowance: 266082 });
    expect(
      calculateSu({ ...baseInput, education: "ungdom", suMonths: 6 }),
    ).toMatchObject({ annualFreeAllowance: 233370 });
    expect(
      calculateSu({ ...baseInput, suMonths: 0, nonSuStatus: "enrolled" }),
    ).toMatchObject({ annualFreeAllowance: 283176 });
    expect(
      calculateSu({ ...baseInput, suMonths: 0, nonSuStatus: "notStudying" }),
    ).toMatchObject({ annualFreeAllowance: 545040 });
  });

  test("normaliserer bruttoarbejdsindkomst til efter AM-bidrag", () => {
    expect(
      calculateSu({ ...baseInput, monthlyWorkIncome: 30000 }),
    ).toMatchObject({
      annualWorkIncomeAfterAM: 331200,
      excess: 82212,
    });
  });

  test("afviser ugyldige tal", () => {
    expect(calculateSu({ ...baseInput, monthlyWorkIncome: -1 })).toBeNull();
    expect(calculateSu({ ...baseInput, monthlyWorkIncome: Number.NaN })).toBeNull();
    expect(calculateSu({ ...baseInput, suMonths: 13 })).toBeNull();
    expect(calculateSu({ ...baseInput, suMonths: 1.5 })).toBeNull();
  });
});

describe("normaliserSuInputs", () => {
  test("bevarer gyldige nuværende delestatsfelter", () => {
    expect(
      normaliserSuInputs({
        uddannelse: "ungdom",
        boligstatus: "hjemmeboende",
        homewardScheme: "current",
        youthAgeGroup: "18to19",
        youthAwayApproved: true,
        arbejdsindkomst: 4200,
        antalMaaneder: 9,
        nonSuStatus: "notStudying",
        harBarnUnder18: true,
        harHandicap: true,
        handicapType: "erhverv",
        erEnligForsorger: false,
      }),
    ).toEqual({
      education: "ungdom",
      youthAgeGroup: "18to19",
      housing: "hjemmeboende",
      homewardScheme: "current",
      youthAwayApproved: true,
      monthlyWorkIncome: 4200,
      suMonths: 9,
      nonSuStatus: "notStudying",
      disabilityType: "erhverv",
      hasChildUnder18: true,
      singleParentEligible: false,
    });
  });

  test("bevarer gamle hjemmeboende-links som legacy", () => {
    expect(
      normaliserSuInputs({
        uddannelse: "videregaaende",
        boligstatus: "hjemmeboende",
        arbejdsindkomst: 5000,
        antalMaaneder: 12,
        harHandicap: false,
        erEnligForsorger: false,
      }),
    ).toMatchObject({
      education: "videregaaende",
      housing: "hjemmeboende",
      homewardScheme: "legacy",
    });
    expect(
      normaliserSuInputs({
        uddannelse: "ungdom",
        boligstatus: "hjemmeboende",
      }),
    ).toMatchObject({ education: "ungdom", homewardScheme: "current" });
  });

  test("migrerer legacy foraelder til udeboende med barn og bevarer forsørger-state", () => {
    expect(
      normaliserSuInputs({
        uddannelse: "videregaaende",
        boligstatus: "foraelder",
        arbejdsindkomst: 5000,
        antalMaaneder: 12,
        harHandicap: false,
        erEnligForsorger: false,
      }),
    ).toMatchObject({
      housing: "udeboende",
      hasChildUnder18: true,
      singleParentEligible: false,
    });
    expect(
      normaliserSuInputs({
        uddannelse: "videregaaende",
        boligstatus: "foraelder",
        arbejdsindkomst: 5000,
        antalMaaneder: 12,
        harHandicap: false,
        erEnligForsorger: true,
      }),
    ).toMatchObject({
      housing: "udeboende",
      hasChildUnder18: true,
      singleParentEligible: true,
    });
  });

  test("afviser handicaptillæg fra den forkerte uddannelse", () => {
    expect(
      normaliserSuInputs({
        uddannelse: "videregaaende",
        handicapType: "erhverv",
      }).disabilityType,
    ).toBe("none");
    expect(
      normaliserSuInputs({
        uddannelse: "ungdom",
        handicapType: "videregaaende",
      }).disabilityType,
    ).toBe("none");
  });

  test("erstatter malformed legacy-værdier med sikre defaults", () => {
    expect(normaliserSuInputs(null)).toEqual(baseInput);
    expect(normaliserSuInputs([])).toEqual(baseInput);
    expect(
      normaliserSuInputs({
        uddannelse: "bogstav",
        boligstatus: "ukendt",
        arbejdsindkomst: -200,
        antalMaaneder: 13,
        harHandicap: "ja",
        erEnligForsorger: 1,
      }),
    ).toEqual(baseInput);
  });
});
