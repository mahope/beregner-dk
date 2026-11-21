import { describe, test, expect } from "vitest";
import { beregnAfkast } from "./afkast";

describe("beregnAfkast", () => {
  test("returns null for non-positive start", () => {
    expect(beregnAfkast(0, 100, 1)).toBeNull();
    expect(beregnAfkast(-10, 100, 1)).toBeNull();
  });

  test("computes gain and ROI%", () => {
    const r = beregnAfkast(10000, 13000, 0)!;
    expect(r.gevinst).toBe(3000);
    expect(r.afkastProcent).toBe(30);
    expect(r.aarligProcent).toBeNull();
  });

  test("computes annualised return (CAGR)", () => {
    const r = beregnAfkast(10000, 13000, 3)!;
    // (1.3)^(1/3) - 1 = 9.14%
    expect(r.aarligProcent).toBeCloseTo(9.139, 2);
  });

  test("handles a loss", () => {
    const r = beregnAfkast(10000, 8000, 2)!;
    expect(r.gevinst).toBe(-2000);
    expect(r.afkastProcent).toBe(-20);
    expect(r.aarligProcent).toBeCloseTo(-10.557, 2);
  });

  test("doubling in one year is 100%", () => {
    const r = beregnAfkast(5000, 10000, 1)!;
    expect(r.afkastProcent).toBe(100);
    expect(r.aarligProcent).toBeCloseTo(100, 5);
  });
});
