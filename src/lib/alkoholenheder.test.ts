import { describe, test, expect } from "vitest";
import { beregnAlkoholenheder } from "./alkoholenheder";

describe("beregnAlkoholenheder", () => {
  test("returns null for invalid volume", () => {
    expect(beregnAlkoholenheder(0, 4.6, 1)).toBeNull();
    expect(beregnAlkoholenheder(-1, 4.6, 1)).toBeNull();
    expect(beregnAlkoholenheder(501, 4.6, 1)).toBeNull();
  });

  test("returns null for invalid ABV", () => {
    expect(beregnAlkoholenheder(33, 0, 1)).toBeNull();
    expect(beregnAlkoholenheder(33, -5, 1)).toBeNull();
    expect(beregnAlkoholenheder(33, 101, 1)).toBeNull();
  });

  test("returns null for invalid antal", () => {
    expect(beregnAlkoholenheder(33, 4.6, 0)).toBeNull();
    expect(beregnAlkoholenheder(33, 4.6, -1)).toBeNull();
    expect(beregnAlkoholenheder(33, 4.6, 101)).toBeNull();
  });

  test("33 cl beer at 4.6% ABV ≈ 1 alcohol unit", () => {
    const r = beregnAlkoholenheder(33, 4.6, 1)!;
    expect(r.enhederPrDrink).toBeCloseTo(1.0, 0);
    expect(r.enhederTotal).toBeCloseTo(1.0, 0);
  });

  test("50 cl wine at 12% ABV ≈ 4 alcohol units", () => {
    const r = beregnAlkoholenheder(50, 12, 1)!;
    expect(r.enhederPrDrink).toBeCloseTo(3.9, 0);
    expect(r.enhederTotal).toBeCloseTo(3.9, 0);
  });

  test("4 cl spirits at 40% ABV = 1.05 units", () => {
    const r = beregnAlkoholenheder(4, 40, 1)!;
    expect(r.enhederPrDrink).toBeCloseTo(1.05, 1);
  });

  test("total = units per drink × antal", () => {
    const r = beregnAlkoholenheder(33, 4.6, 3)!;
    expect(r.enhederTotal).toBeCloseTo(r.enhederPrDrink * 3);
    expect(r.alkoholGramTotal).toBeCloseTo(r.alkoholGramPrDrink * 3);
  });

  test("gram alcohol is returned correctly", () => {
    const r = beregnAlkoholenheder(33, 4.6, 1)!;
    expect(r.alkoholGramPrDrink).toBeCloseTo(33 * 10 * 0.046 * 0.789, 2);
    expect(r.alkoholGramPrDrink).toBeCloseTo(r.enhederPrDrink * 12, 2);
  });

  test("works with small volumes and high ABV", () => {
    const r = beregnAlkoholenheder(2, 96, 1)!;
    expect(r.enhederPrDrink).toBeCloseTo(2 * 96 * 0.006575, 1);
  });

  test("works with fractional antal (share a bottle)", () => {
    const r = beregnAlkoholenheder(75, 14, 0.5)!;
    expect(r.enhederTotal).toBeCloseTo(r.enhederPrDrink * 0.5);
  });
});