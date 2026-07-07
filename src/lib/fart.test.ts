import { describe, test, expect } from "vitest";
import { beregnFart } from "./fart";

describe("beregnFart", () => {
  test("returns null when required inputs are missing", () => {
    expect(beregnFart("fart", 0, 0, 2)).toBeNull();
    expect(beregnFart("distance", 0, 10, 2)).toBeNull();
    expect(beregnFart("tid", 0, 10, 0)).toBeNull();
  });

  test("computes speed from distance and time", () => {
    const r = beregnFart("fart", 0, 100, 2)!;
    expect(r.fart).toBe(50);
    expect(r.paceMinPrKm).toBeCloseTo(1.2, 4);
  });

  test("computes distance from speed and time", () => {
    const r = beregnFart("distance", 60, 0, 1.5)!;
    expect(r.distance).toBe(90);
  });

  test("computes time from speed and distance", () => {
    const r = beregnFart("tid", 40, 100, 0)!;
    expect(r.tid).toBe(2.5);
  });

  test("running pace: 10 km/h is 6 min/km", () => {
    const r = beregnFart("fart", 0, 10, 1)!;
    expect(r.fart).toBe(10);
    expect(r.paceMinPrKm).toBe(6);
  });
});
