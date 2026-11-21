import { describe, test, expect } from "vitest";
import { beregnVandbehov } from "./vandbehov";

describe("beregnVandbehov", () => {
  test("returns null for invalid weight", () => {
    expect(beregnVandbehov(0, 0)).toBeNull();
    expect(beregnVandbehov(-5, 0)).toBeNull();
  });

  test("70 kg without exercise ~ 2.45 L", () => {
    const r = beregnVandbehov(70, 0)!;
    expect(r.liter).toBeCloseTo(2.45, 2);
    expect(r.glas).toBe(Math.round(2450 / 250));
  });

  test("exercise adds fluid", () => {
    const base = beregnVandbehov(70, 0)!;
    const active = beregnVandbehov(70, 60)!;
    // 60 min -> +1.0 L
    expect(active.liter - base.liter).toBeCloseTo(1.0, 2);
  });

  test("negative exercise treated as zero", () => {
    const a = beregnVandbehov(80, -30)!;
    const b = beregnVandbehov(80, 0)!;
    expect(a.liter).toBe(b.liter);
  });
});
