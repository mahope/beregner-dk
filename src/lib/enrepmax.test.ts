import { describe, test, expect } from "vitest";
import { beregn1RM, vaegtVedProcent } from "./enrepmax";

describe("beregn1RM", () => {
  test("returns null for invalid input", () => {
    expect(beregn1RM(0, 5)).toBeNull();
    expect(beregn1RM(100, 0)).toBeNull();
  });

  test("single rep returns the lifted weight", () => {
    const r = beregn1RM(120, 1)!;
    expect(r.oneRM).toBe(120);
    expect(r.epley).toBe(120);
    expect(r.brzycki).toBe(120);
  });

  test("Epley: 100 kg x 5 reps", () => {
    const r = beregn1RM(100, 5)!;
    // Epley = 100 * (1 + 5/30) = 116.67
    expect(r.epley).toBeCloseTo(116.667, 2);
    // Brzycki = 100 * 36 / 32 = 112.5
    expect(r.brzycki).toBeCloseTo(112.5, 2);
    expect(r.oneRM).toBeCloseTo((116.667 + 112.5) / 2, 1);
  });

  test("above 36 reps only Epley is used", () => {
    const r = beregn1RM(50, 40)!;
    expect(r.brzycki).toBeNull();
    expect(r.oneRM).toBe(r.epley);
  });

  test("more reps at same weight means a higher 1RM", () => {
    const a = beregn1RM(100, 3)!;
    const b = beregn1RM(100, 8)!;
    expect(b.oneRM).toBeGreaterThan(a.oneRM);
  });
});

describe("vaegtVedProcent", () => {
  test("computes training weight at a percentage", () => {
    expect(vaegtVedProcent(120, 80)).toBe(96);
    expect(vaegtVedProcent(200, 50)).toBe(100);
  });
});
