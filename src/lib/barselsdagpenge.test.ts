import { describe, expect, test } from "vitest";
import {
  beregnBarselsdagpenge,
  isBarselEmployment,
  isBarselParent,
} from "./barselsdagpenge";
import { BARSEL_2026 } from "./satser-2026";

const weeksPerMonth = 4.33;

describe("barsel shared-state validation", () => {
  test("accepts current employment and parent values", () => {
    expect(isBarselEmployment("fulltime")).toBe(true);
    expect(isBarselEmployment("parttime")).toBe(true);
    expect(isBarselEmployment("selfemployed")).toBe(true);
    expect(isBarselEmployment("unemployed")).toBe(true);
    expect(isBarselParent("mor")).toBe(true);
    expect(isBarselParent("far")).toBe(true);
  });

  test("rejects malformed legacy values", () => {
    expect(isBarselEmployment("contractor")).toBe(false);
    expect(isBarselEmployment(null)).toBe(false);
    expect(isBarselParent("other")).toBe(false);
    expect(isBarselParent(1)).toBe(false);
  });
});

describe("beregnBarselsdagpenge", () => {
  test("returns null for invalid income, hours, or weeks", () => {
    expect(beregnBarselsdagpenge({ monthlyIncome: 0, weeklyHours: 37, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: -1, weeklyHours: 37, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: Number.NaN, weeklyHours: 37, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 0, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 41, weeks: 24 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 37, weeks: 0 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 37, weeks: 53 })).toBeNull();
    expect(beregnBarselsdagpenge({ monthlyIncome: 35000, weeklyHours: 37, weeks: 12.5 })).toBeNull();
  });

  test("uses the employee's hourly rate below the 2026 cap", () => {
    const result = beregnBarselsdagpenge({
      monthlyIncome: 100 * 20 * weeksPerMonth,
      weeklyHours: 20,
      weeks: 10,
    })!;

    expect(result.weeklyRate).toBeCloseTo(2000);
    expect(result.totalAmount).toBeCloseTo(20000);
    expect(result.isHourlyRateCapped).toBe(false);
  });

  test("caps the hourly rate for part-time workers", () => {
    const result = beregnBarselsdagpenge({
      monthlyIncome: 140 * 20 * weeksPerMonth,
      weeklyHours: 20,
      weeks: 24,
    })!;

    expect(result.weeklyRate).toBeCloseTo(
      (BARSEL_2026.maxWeeklyRate / BARSEL_2026.fullTimeHours) * 20,
      2
    );
    expect(result.isHourlyRateCapped).toBe(true);
  });

  test("reaches the 5,085 kr weekly maximum at 37 hours", () => {
    const result = beregnBarselsdagpenge({
      monthlyIncome: BARSEL_2026.maxWeeklyRate * weeksPerMonth,
      weeklyHours: BARSEL_2026.fullTimeHours,
      weeks: 24,
    })!;

    expect(result.weeklyRate).toBeCloseTo(BARSEL_2026.maxWeeklyRate, 2);
    expect(result.isHourlyRateCapped).toBe(true);
  });

  test("supports the official 40-hour example", () => {
    const result = beregnBarselsdagpenge({
      monthlyIncome: 110 * 40 * weeksPerMonth,
      weeklyHours: 40,
      weeks: 24,
    })!;

    expect(result.weeklyRate).toBeCloseTo(4400);
  });

  test("returns after-tax estimates and coverage", () => {
    const result = beregnBarselsdagpenge({
      monthlyIncome: 20000,
      weeklyHours: 37,
      weeks: 24,
    })!;

    expect(result.coveragePercent).toBe(100);
    expect(result.monthlyAfterTax).toBeCloseTo(result.monthlyAmount * 0.62);
    expect(result.totalAfterTax).toBeCloseTo(result.totalAmount * 0.62);
    expect(result.monthlyLoss).toBeCloseTo(20000 - result.monthlyAfterTax);
  });
});
