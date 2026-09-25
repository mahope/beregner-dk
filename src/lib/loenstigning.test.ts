import { describe, test, expect } from "vitest";
import { beregnLoenstigning, beregnRealLoenstigning } from "./loenstigning";

describe("beregnLoenstigning", () => {
  test("returns null for non-positive old salary", () => {
    expect(beregnLoenstigning(0, 100)).toBeNull();
    expect(beregnLoenstigning(-10, 100)).toBeNull();
  });

  test("computes a raise", () => {
    const r = beregnLoenstigning(30000, 33000)!;
    expect(r.forskel).toBe(3000);
    expect(r.procent).toBe(10);
    expect(r.erStigning).toBe(true);
  });

  test("computes a pay cut", () => {
    const r = beregnLoenstigning(40000, 36000)!;
    expect(r.forskel).toBe(-4000);
    expect(r.procent).toBe(-10);
    expect(r.erStigning).toBe(false);
  });

  test("no change is zero percent", () => {
    const r = beregnLoenstigning(25000, 25000)!;
    expect(r.procent).toBe(0);
    expect(r.erStigning).toBe(true);
  });
});

describe("beregnRealLoenstigning", () => {
  test("10 % stigning med 2 % inflation er 7,84 % realt", () => {
    const r = beregnRealLoenstigning(30000, 33000, 2)!;
    expect(r.realProcent).toBeCloseTo(7.8431, 3);
    expect(r.realForskel).toBeCloseTo(33000 / 1.02 - 30000, 6);
  });

  test("stigning lig inflationen giver 0 % realt", () => {
    expect(beregnRealLoenstigning(30000, 30600, 2)!.realProcent).toBeCloseTo(0, 10);
  });

  test("uændret løn med inflation er en reallønsnedgang", () => {
    expect(beregnRealLoenstigning(30000, 30000, 2)!.realProcent).toBeLessThan(0);
  });

  test("ugyldigt input giver null", () => {
    expect(beregnRealLoenstigning(0, 30000, 2)).toBeNull();
    expect(beregnRealLoenstigning(30000, 33000, -100)).toBeNull();
    expect(beregnRealLoenstigning(30000, 33000, Number.NaN)).toBeNull();
  });
});
