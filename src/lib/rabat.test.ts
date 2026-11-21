import { describe, test, expect } from "vitest";
import { prisEfterRabat, findRabatProcent } from "./rabat";

describe("prisEfterRabat", () => {
  test("returns null for negative price", () => {
    expect(prisEfterRabat(-1, 25)).toBeNull();
  });

  test("returns null for negative percentage", () => {
    expect(prisEfterRabat(100, -10)).toBeNull();
  });

  test("returns null for percentage over 100", () => {
    expect(prisEfterRabat(100, 101)).toBeNull();
  });

  test("0% rabat gives no saving", () => {
    const r = prisEfterRabat(400, 0)!;
    expect(r.besparelse).toBe(0);
    expect(r.prisEfterRabat).toBe(400);
  });

  test("25% rabat on 400 kr", () => {
    const r = prisEfterRabat(400, 25)!;
    expect(r.besparelse).toBe(100);
    expect(r.prisEfterRabat).toBe(300);
    expect(r.besparelseProcent).toBe(25);
  });

  test("100% rabat gives free", () => {
    const r = prisEfterRabat(500, 100)!;
    expect(r.besparelse).toBe(500);
    expect(r.prisEfterRabat).toBe(0);
  });

  test("handles decimal percentages", () => {
    const r = prisEfterRabat(200, 12.5)!;
    expect(r.besparelse).toBe(25);
    expect(r.prisEfterRabat).toBe(175);
  });

  test("handles 0 price", () => {
    const r = prisEfterRabat(0, 50)!;
    expect(r.besparelse).toBe(0);
    expect(r.prisEfterRabat).toBe(0);
  });
});

describe("findRabatProcent", () => {
  test("returns null for zero original price", () => {
    expect(findRabatProcent(0, 100)).toBeNull();
  });

  test("returns null for negative final price", () => {
    expect(findRabatProcent(100, -1)).toBeNull();
  });

  test("returns null when final price exceeds original", () => {
    expect(findRabatProcent(100, 150)).toBeNull();
  });

  test("200 -> 150 is 25% rabat", () => {
    const r = findRabatProcent(200, 150)!;
    expect(r.besparelse).toBe(50);
    expect(r.prisEfterRabat).toBe(150);
    expect(r.besparelseProcent).toBeCloseTo(25);
  });

  test("400 -> 300 is 25% rabat", () => {
    const r = findRabatProcent(400, 300)!;
    expect(r.besparelse).toBe(100);
    expect(r.besparelseProcent).toBeCloseTo(25);
  });

  test("no discount when prices are equal", () => {
    const r = findRabatProcent(250, 250)!;
    expect(r.besparelse).toBe(0);
    expect(r.besparelseProcent).toBeCloseTo(0);
  });

  test("handles free (100% rabat)", () => {
    const r = findRabatProcent(500, 0)!;
    expect(r.besparelse).toBe(500);
    expect(r.besparelseProcent).toBeCloseTo(100);
  });
});