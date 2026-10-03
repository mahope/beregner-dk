import { describe, test, expect } from "vitest";
import { BROK_OPERATIONER, forkortBrok, regnMedBroker } from "./brok";

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

describe("regnMedBroker", () => {
  test("plus uses the least common denominator: 1/2 + 1/3 = 5/6", () => {
    const r = regnMedBroker(1, 2, 1, 3, "plus")!;
    expect(r.taeller).toBe(5);
    expect(r.naevner).toBe(6);
    expect(r.fællesNaevner).toBe(6);
    expect(r.brugteFællesNaevner).toBe(true);
    expect(r.decimal).toBeCloseTo(5 / 6, 10);
  });

  test("plus needs no common denominator when they already match: 3/4 + 1/4 = 1", () => {
    const r = regnMedBroker(3, 4, 1, 4, "plus")!;
    expect(r.taeller).toBe(1);
    expect(r.naevner).toBe(1);
    expect(r.brugteFællesNaevner).toBe(false);
  });

  test("plus keeps the least common multiple, not the product: 1/2 + 1/4", () => {
    const r = regnMedBroker(1, 2, 1, 4, "plus")!;
    expect(r.taeller).toBe(3);
    expect(r.naevner).toBe(4);
    expect(r.fællesNaevner).toBe(4);
  });

  test("minus reduces the result: 3/4 - 1/4 = 1/2", () => {
    const r = regnMedBroker(3, 4, 1, 4, "minus")!;
    expect(r.taeller).toBe(1);
    expect(r.naevner).toBe(2);
  });

  test("minus can go negative: 1/5 - 1/3", () => {
    const r = regnMedBroker(1, 5, 1, 3, "minus")!;
    expect(r.taeller).toBe(-2);
    expect(r.naevner).toBe(15);
    expect(r.decimal).toBeCloseTo(-2 / 15, 10);
  });

  test("gange multiplies both parts and reduces: 1/2 x 2/3 = 1/3", () => {
    const r = regnMedBroker(1, 2, 2, 3, "gange")!;
    expect(r.taeller).toBe(1);
    expect(r.naevner).toBe(3);
    expect(r.brugteFællesNaevner).toBe(false);
  });

  test("dele flips the second fraction: 1/2 : 2/3 = 3/4", () => {
    const r = regnMedBroker(1, 2, 2, 3, "dele")!;
    expect(r.taeller).toBe(3);
    expect(r.naevner).toBe(4);
    expect(r.brugteFællesNaevner).toBe(false);
  });

  test("dele reduces rather than just flipping: 2/3 : 4/9 = 3/2", () => {
    // (2·9)/(3·4) = 18/12, so an unreduced flip would have said 18/12.
    const r = regnMedBroker(2, 3, 4, 9, "dele")!;
    expect(r.taeller).toBe(3);
    expect(r.naevner).toBe(2);
  });

  test("dele is 1 when the second fraction is the same number", () => {
    const r = regnMedBroker(3, 4, 6, 8, "dele")!;
    expect(r.taeller).toBe(1);
    expect(r.naevner).toBe(1);
  });

  test("procent is the decimal times 100, so 1/3 is 33.333…", () => {
    const r = regnMedBroker(1, 2, 1, 6, "plus")!;
    expect(r.taeller).toBe(2);
    expect(r.naevner).toBe(3);
    expect(r.procent).toBeCloseTo((2 / 3) * 100, 10);
  });

  test("rejects a zero denominator on either side, for every operation", () => {
    for (const operation of BROK_OPERATIONER) {
      expect(regnMedBroker(1, 0, 1, 2, operation)).toBeNull();
      expect(regnMedBroker(1, 2, 1, 0, operation)).toBeNull();
    }
  });

  test("rejects division by a zero numerator instead of returning infinity", () => {
    expect(regnMedBroker(1, 2, 0, 3, "dele")).toBeNull();
    expect(regnMedBroker(1, 2, 0, 3, "gange")).not.toBeNull();
  });

  test("rejects non-integers", () => {
    expect(regnMedBroker(1.5, 2, 1, 3, "plus")).toBeNull();
    expect(regnMedBroker(1, 2, 1, 2.5, "gange")).toBeNull();
  });

  test("dividing by zero is rejected even when it would reduce to zero", () => {
    expect(regnMedBroker(1, 2, 0, 3, "dele")).toBeNull();
    expect(regnMedBroker(0, 3, 1, 2, "dele")).not.toBeNull();
  });
});
