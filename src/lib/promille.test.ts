import { describe, test, expect } from "vitest";
import { beregnPromille, GRAM_PR_GENSTAND } from "./promille";

describe("beregnPromille", () => {
  test("returns null for invalid input", () => {
    expect(beregnPromille(0, 80, "mand", 0)).toBeNull();
    expect(beregnPromille(3, 0, "mand", 0)).toBeNull();
    expect(beregnPromille(-1, 80, "mand", 0)).toBeNull();
  });

  test("computes grams of alcohol from standard drinks", () => {
    const r = beregnPromille(3, 80, "mand", 0)!;
    expect(r.gramAlkohol).toBe(3 * GRAM_PR_GENSTAND);
  });

  test("man, 3 drinks, 80 kg, 0 hours matches Widmark", () => {
    // A = 36 g, r = 0.68, m = 80 -> 36 / 54.4 = 0.6618 ‰
    const r = beregnPromille(3, 80, "mand", 0)!;
    expect(r.promille).toBeCloseTo(0.66, 2);
  });

  test("woman has higher BAC than man at same weight/drinks", () => {
    const man = beregnPromille(3, 70, "mand", 0)!;
    const woman = beregnPromille(3, 70, "kvinde", 0)!;
    expect(woman.promille).toBeGreaterThan(man.promille);
  });

  test("elimination reduces BAC over time", () => {
    const now = beregnPromille(4, 80, "mand", 0)!;
    const later = beregnPromille(4, 80, "mand", 3)!;
    expect(later.promille).toBeLessThan(now.promille);
    // 3 hours removes ~0.45 ‰
    expect(now.promille - later.promille).toBeCloseTo(0.45, 2);
  });

  test("never returns negative promille", () => {
    const r = beregnPromille(1, 90, "mand", 24)!;
    expect(r.promille).toBe(0);
  });

  test("maaKoere is false above 0.5 and true below", () => {
    const high = beregnPromille(4, 70, "kvinde", 0)!;
    expect(high.promille).toBeGreaterThanOrEqual(0.5);
    expect(high.maaKoere).toBe(false);
    const low = beregnPromille(1, 90, "mand", 5)!;
    expect(low.maaKoere).toBe(true);
  });

  test("timerTilNul is zero when sober", () => {
    const r = beregnPromille(1, 90, "mand", 24)!;
    expect(r.timerTilNul).toBe(0);
  });
});
