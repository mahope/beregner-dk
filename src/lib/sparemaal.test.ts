import { describe, test, expect } from "vitest";
import { beregnSparemaal } from "./sparemaal";

describe("beregnSparemaal", () => {
  test("returns null for invalid input", () => {
    expect(beregnSparemaal(0, 5, 3, 0)).toBeNull();
    expect(beregnSparemaal(100000, 0, 3, 0)).toBeNull();
  });

  test("zero interest splits the goal evenly", () => {
    const r = beregnSparemaal(120000, 10, 0, 0)!;
    // 120000 / 120 months = 1000
    expect(r.maanedligOpsparing).toBeCloseTo(1000, 5);
    expect(r.renterTjent).toBeCloseTo(0, 5);
  });

  test("interest lowers the required deposit", () => {
    const noInterest = beregnSparemaal(120000, 10, 0, 0)!;
    const withInterest = beregnSparemaal(120000, 10, 5, 0)!;
    expect(withInterest.maanedligOpsparing).toBeLessThan(noInterest.maanedligOpsparing);
    expect(withInterest.renterTjent).toBeGreaterThan(0);
  });

  test("annuity formula: 100000 over 5 years at 6%", () => {
    // i = 0.005, N = 60, factor = (1.005^60 - 1)/0.005 = 69.770...
    const r = beregnSparemaal(100000, 5, 6, 0)!;
    const i = 0.06 / 12;
    const expected = (100000 * i) / (Math.pow(1 + i, 60) - 1);
    expect(r.maanedligOpsparing).toBeCloseTo(expected, 4);
  });

  test("a large starting balance can cover the goal", () => {
    const r = beregnSparemaal(100000, 5, 6, 100000)!;
    expect(r.maanedligOpsparing).toBe(0);
  });
});
