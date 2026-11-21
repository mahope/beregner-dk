import { describe, test, expect } from "vitest";
import { parseTal, beregnStatistik } from "./gennemsnit";

describe("parseTal", () => {
  test("parses space-separated numbers", () => {
    expect(parseTal("1 2 3")).toEqual([1, 2, 3]);
  });

  test("parses comma and newline separated numbers", () => {
    expect(parseTal("10, 20\n30")).toEqual([10, 20, 30]);
  });

  test("treats comma between digits as a decimal separator", () => {
    expect(parseTal("3,5 2,5")).toEqual([3.5, 2.5]);
  });

  test("handles negatives and ignores junk", () => {
    expect(parseTal("-5 abc 5")).toEqual([-5, 5]);
  });

  test("returns empty array for empty input", () => {
    expect(parseTal("")).toEqual([]);
    expect(parseTal("   ")).toEqual([]);
  });
});

describe("beregnStatistik", () => {
  test("returns null for empty list", () => {
    expect(beregnStatistik([])).toBeNull();
  });

  test("computes stats for odd-length list", () => {
    const r = beregnStatistik([1, 2, 3, 4, 5])!;
    expect(r.antal).toBe(5);
    expect(r.sum).toBe(15);
    expect(r.gennemsnit).toBe(3);
    expect(r.median).toBe(3);
    expect(r.min).toBe(1);
    expect(r.max).toBe(5);
  });

  test("median averages the two middle values for even-length list", () => {
    const r = beregnStatistik([1, 2, 3, 4])!;
    expect(r.median).toBe(2.5);
    expect(r.gennemsnit).toBe(2.5);
  });

  test("median is order-independent", () => {
    const r = beregnStatistik([5, 1, 3, 2, 4])!;
    expect(r.median).toBe(3);
  });

  test("single value", () => {
    const r = beregnStatistik([42])!;
    expect(r.gennemsnit).toBe(42);
    expect(r.median).toBe(42);
    expect(r.min).toBe(42);
    expect(r.max).toBe(42);
  });
});
