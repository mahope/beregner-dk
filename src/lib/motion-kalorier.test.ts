import { describe, test, expect } from "vitest";
import { beregnMotionKalorier, findAktivitet, AKTIVITETER } from "./motion-kalorier";

describe("beregnMotionKalorier", () => {
  test("returns null for invalid input", () => {
    expect(beregnMotionKalorier(0, 70, 30)).toBeNull();
    expect(beregnMotionKalorier(8, 0, 30)).toBeNull();
    expect(beregnMotionKalorier(8, 70, 0)).toBeNull();
  });

  test("running (9.8 MET), 70 kg, 30 min", () => {
    // 9.8 * 70 * 0.5 = 343
    const r = beregnMotionKalorier(9.8, 70, 30)!;
    expect(r).toBeCloseTo(343, 5);
  });

  test("scales linearly with duration", () => {
    const half = beregnMotionKalorier(7.5, 80, 30)!;
    const full = beregnMotionKalorier(7.5, 80, 60)!;
    expect(full).toBeCloseTo(half * 2, 5);
  });

  test("findAktivitet returns known activity", () => {
    expect(findAktivitet("loeb")?.met).toBe(9.8);
    expect(findAktivitet("ukendt")).toBeUndefined();
  });

  test("all activities have positive MET", () => {
    for (const a of AKTIVITETER) {
      expect(a.met).toBeGreaterThan(0);
    }
  });
});
