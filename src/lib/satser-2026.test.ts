import { describe, test, expect } from "vitest";
import { BARSEL_2026, SATSER_2026 as S } from "./satser-2026";

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
