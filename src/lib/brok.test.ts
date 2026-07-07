import { describe, test, expect } from "vitest";
import { forkortBrok } from "./brok";

describe("forkortBrok", () => {
  test("returns null for zero denominator or non-integers", () => {
    expect(forkortBrok(1, 0)).toBeNull();
    expect(forkortBrok(1.5, 2)).toBeNull();
  });

  test("simplifies 50/100 to 1/2", () => {
    const r = forkortBrok(50, 100)!;
    expect(r.taeller).toBe(1);
    expect(r.naevner).toBe(2);
    expect(r.decimal).toBe(0.5);
    expect(r.procent).toBe(50);
  });

  test("simplifies 6/8 to 3/4", () => {
    const r = forkortBrok(6, 8)!;
    expect(r.taeller).toBe(3);
    expect(r.naevner).toBe(4);
    expect(r.procent).toBe(75);
  });

  test("already reduced fraction stays put", () => {
    const r = forkortBrok(3, 7)!;
    expect(r.taeller).toBe(3);
    expect(r.naevner).toBe(7);
  });

  test("normalises a negative denominator", () => {
    const r = forkortBrok(1, -2)!;
    expect(r.taeller).toBe(-1);
    expect(r.naevner).toBe(2);
    expect(r.decimal).toBe(-0.5);
  });

  test("handles an improper fraction", () => {
    const r = forkortBrok(10, 4)!;
    expect(r.taeller).toBe(5);
    expect(r.naevner).toBe(2);
    expect(r.decimal).toBe(2.5);
    expect(r.procent).toBe(250);
  });
});
