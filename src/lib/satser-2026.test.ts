import { describe, expect, test } from "vitest";
import { BARSEL_2026, BOLIGSTOETTE_2026, SATSER_2026 as S, SU_2026 } from "./satser-2026";

// These lock in the officially-verified 2026 figures (skm.dk / skat.dk).
// If SKAT changes a rate, update satser-2026.ts AND this test together.
describe("SATSER_2026 single source of truth", () => {
  test("income-tax model (personskattereform 2026)", () => {
    expect(S.amBidrag).toBe(0.08);
    expect(S.bundskat).toBe(0.1201);
    expect(S.mellemskat).toBe(0.075);
    expect(S.mellemskatGraense).toBe(641200);
    expect(S.topskat).toBe(0.075);
    expect(S.topskatGraense).toBe(777900);
    expect(S.topTopskat).toBe(0.05);
    expect(S.topTopskatGraense).toBe(2592700);
    expect(S.personfradrag).toBe(54100);
    expect(S.beskaeftigelsesfradragPct).toBe(0.1275);
    expect(S.beskaeftigelsesfradragMax).toBe(63300);
  });

  test("aktieindkomst", () => {
    expect(S.aktieProgressionsgraense).toBe(79400);
    expect(S.askLoft).toBe(174200);
    expect(S.aktieSatsLav).toBe(0.27);
    expect(S.aktieSatsHoej).toBe(0.42);
    expect(S.askSats).toBe(0.17);
  });

  test("arveafgift", () => {
    expect(S.arveBundfradrag).toBe(392300);
    expect(S.boafgift).toBe(0.15);
    expect(S.tillaegsboafgift).toBe(0.25);
  });

  test("kørselsfradrag og pension", () => {
    expect(S.koerselBundgraense).toBe(24);
    expect(S.koerselHoejGraense).toBe(120);
    expect(S.koerselSatsLav).toBe(3.17);
    expect(S.koerselSatsHoej).toBe(1.59);
    expect(S.koerselYderkommuneSats).toBe(3.51);
    expect(S.koerselEkstraFradragMax).toBe(30800);
    expect(S.koerselEkstraIndkomstGraense).toBe(391500);
    expect(S.koerselBroStorebaelt).toBe(110);
    expect(S.koerselBroOeresund).toBe(50);
    expect(S.ratepensionMax).toBe(68700);
    expect(S.aldersopsparingMax).toBe(9900);
  });

  test("barsel 2026", () => {
    expect(BARSEL_2026.maxWeeklyRate).toBe(5085);
    expect(BARSEL_2026.maxHourlyRate).toBe(137.43);
    expect(BARSEL_2026.fullTimeHours).toBe(37);
    expect(BARSEL_2026.earmarkedWeeks).toBe(9);
    expect(BARSEL_2026.firstTenWeeksAfterBirth).toBe(10);
    expect(BARSEL_2026.maxTransferableWeeks).toBe(13);
    expect(BARSEL_2026.maxHoursForEstimate).toBe(40);
    expect(BARSEL_2026.defaultWeeks).toBe(24);
    expect(BARSEL_2026.maxWeeks).toBe(52);
    expect(BARSEL_2026.afterBirthWeeks).toBe(24);
    expect(BARSEL_2026.applicationDeadlineWeeks).toBe(8);
    expect(BARSEL_2026.applicationProcessingDays).toBe(11);
    expect(BARSEL_2026.earmarkedModelStart).toBe("2. august 2022");
    expect(Math.round(BARSEL_2026.maxHourlyRate * BARSEL_2026.fullTimeHours)).toBe(
      BARSEL_2026.maxWeeklyRate
    );
    expect(
      BARSEL_2026.motherAtBirthWeeks +
        BARSEL_2026.motherEarlyAfterBirthWeeks +
        BARSEL_2026.earmarkedWeeks +
        BARSEL_2026.motherLateTransferableWeeks
    ).toBe(BARSEL_2026.afterBirthWeeks);
  });

  test("SU 2026", () => {
    expect(SU_2026.verifiedAt).toBe("2026-09-24");
    expect(SU_2026.parentalIncomeYear).toBe(2024);
    expect(SU_2026.currentHomewardSchemeStart).toBe("1. juli 2014");
    expect(SU_2026.rules.youthEducationAge).toBe(18);
    expect(SU_2026.rules.youthAwayApprovalMaxAge).toBe(19);
    expect(SU_2026.rules.youthAwayMinimumDistanceKm).toBe(20);
    expect(SU_2026.rules.youthAwayMinimumTravelMinutes).toBe(75);
    expect(SU_2026.rules.youthAwayRequiredPriorMonths).toBe(12);
    expect(SU_2026.rules.minimumLoanAge).toBe(18);
    expect(SU_2026.rules.finalLoanStandardMonths).toBe(12);
    expect(SU_2026.rules.finalLoanExtendedMonths).toBe(24);
    expect(SU_2026.udeboende).toBe(7426);
    expect(SU_2026.homewardBase).toBe(1154);
    expect(SU_2026.homewardMaximum).toBe(3202);
    expect(SU_2026.homewardMaximumSupplement).toBe(2048);
    expect(SU_2026.homewardLegacy).toBe(3692);
    expect(SU_2026.youthLegacy18To19Base).toBe(1643);
    expect(SU_2026.youthAway18To19Base).toBe(4764);
    expect(SU_2026.singleParentSupplement).toBe(7426);
    expect(SU_2026.disabilitySupplement.videregaaende).toBe(10562);
    expect(SU_2026.disabilitySupplement.erhverv).toBe(6624);
    expect(SU_2026.freeAllowance.youthWithSu).toBe(15297);
    expect(SU_2026.freeAllowance.videregaaendeWithSu).toBe(20749);
    expect(SU_2026.freeAllowance.enrolledWithoutSu).toBe(23598);
    expect(SU_2026.freeAllowance.notStudying).toBe(45420);
    expect(SU_2026.freeAllowance.disabilityMonth).toBe(3921);
    expect(SU_2026.loan.ordinaryMonthly).toBe(3799);
    expect(SU_2026.loan.parentMonthly).toBe(1900);
    expect(SU_2026.loan.combinedMonthly).toBe(5699);
    expect(SU_2026.loan.parentMonthly + SU_2026.loan.ordinaryMonthly).toBe(
      SU_2026.loan.combinedMonthly,
    );
    expect(SU_2026.loan.finalMonthly).toBe(9801);
    expect(SU_2026.loan.duringStudyRate).toBe(0.04);
    expect(SU_2026.loan.afterGraduationRate).toBe(0.0285);
    expect(SU_2026.loan.repaymentMinYears).toBe(7);
    expect(SU_2026.loan.repaymentMaxYears).toBe(15);
    expect(SU_2026.loan.repaymentFrequencyMonths).toBe(2);
    expect(SU_2026.loan.repaymentFirstBandMaxDebt).toBe(39999);
    expect(SU_2026.loan.repaymentLastBandMinDebt).toBe(180000);
    expect(SU_2026.suKlip).toBe(70);
    expect(SU_2026.suKlipExtraSupportMonths).toBe(12);
    expect(SU_2026.sources.parentalIncome).toBe(
      "https://www.su.dk/su/om-su-til-videregaaende-uddannelser/dine-foraeldres-indkomst-videregaaende-uddannelse/kun-en-foraelder",
    );
    expect(SU_2026.sources.loanRepayment).toBe(
      "https://www.su.dk/su-laan/naar-du-skal-betale-laan-tilbage",
    );
    expect(SU_2026.sources.youthHousing).toBe(
      "https://www.su.dk/su/om-su-til-ungdomsuddannelser/bopael-og-su-satser",
    );
    expect(SU_2026.homewardBase + SU_2026.homewardMaximumSupplement).toBe(
      SU_2026.homewardMaximum,
    );
  });

  test("boligstøtte 2026", () => {
    expect(BOLIGSTOETTE_2026.verifiedAt).toBe("2026-09-24");
    expect(BOLIGSTOETTE_2026.sources.officialCalculator).toBe(
      "https://www.boligstoette.dk/bos-selvbetjening/beregner/basisoplysninger",
    );
    expect(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner).toEqual({
      noChildren: 1194,
      oneToThreeChildren: 4201,
      fourPlusChildren: 5251,
    });
    expect(BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension).toEqual({
      noChildren: 4201,
      oneToThreeChildren: 4201,
      fourPlusChildren: 5251,
    });
    expect(BOLIGSTOETTE_2026.maximumMonthly.oldPension).toEqual({
      noChildren: 4969,
      oneToThreeChildren: 4969,
      fourPlusChildren: 6211,
    });
    expect(BOLIGSTOETTE_2026.wealth.considerationRates).toEqual({
      tenPercent: 0.1,
      twentyPercent: 0.2,
    });
    expect(BOLIGSTOETTE_2026.wealth.nonPensioner).toEqual({
      noEffect: 896400,
      tenPercent: 1793000,
    });
    expect(BOLIGSTOETTE_2026.wealth.pensioner).toEqual({
      noEffect: 1060300,
      tenPercent: 2120800,
    });
    expect(BOLIGSTOETTE_2026.sources.officialRules).toBe(
      "https://www.borger.dk/bolig-og-flytning/Boligstoette-oversigt/soeg-boligstoette",
    );
    expect(BOLIGSTOETTE_2026.rentExcludes).toEqual([
      "el",
      "varme",
      "varmt vand",
      "fællesantenne",
      "telefon, internet eller bredbånd",
      "leje betalt forud",
      "indskud og afdrag på indskud",
      "garage eller carport",
      "møbler i en møbleret bolig",
      "vaskeri",
    ]);
  });

  test("rates are internally consistent", () => {
    // brackets strictly increase
    expect(S.mellemskatGraense).toBeLessThan(S.topskatGraense);
    expect(S.topskatGraense).toBeLessThan(S.topTopskatGraense);
    // aktie progression doubles for couples handled in component; low < high rate
    expect(S.aktieSatsLav).toBeLessThan(S.aktieSatsHoej);
    // all rate fractions are between 0 and 1
    for (const k of ["amBidrag", "bundskat", "mellemskat", "topskat", "topTopskat", "askSats"] as const) {
      expect(S[k]).toBeGreaterThan(0);
      expect(S[k]).toBeLessThan(1);
    }
  });
});
