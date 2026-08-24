import { describe, test, expect } from "vitest";
import { isoUge, antalUgerIIsoAar } from "./ugenummer";

describe("isoUge", () => {
  test("returns null for invalid input", () => {
    expect(isoUge("")).toBeNull();
    expect(isoUge("2026-13-01")).toBeNull();
    expect(isoUge("2026-02-30")).toBeNull();
    expect(isoUge(new Date("invalid"))).toBeNull();
  });

  test("ordinary mid-year date", () => {
    const r = isoUge("2026-02-23")!;
    expect(r.uge).toBe(9);
    expect(r.isoAar).toBe(2026);
  });

  test("Monday of a normal week (today's reference)", () => {
    const r = isoUge("2026-08-24")!;
    expect(r.uge).toBe(35);
    expect(r.ugedagNr).toBe(1);
  });

  test("Sunday has weekday number 7", () => {
    const r = isoUge("2026-08-30")!;
    expect(r.ugedagNr).toBe(7);
    expect(r.uge).toBe(35);
  });

  test("January 1 on a Thursday is week 1 of the same year", () => {
    const r = isoUge("2026-01-01")!;
    expect(r.uge).toBe(1);
    expect(r.isoAar).toBe(2026);
  });

  test("late Monday belongs to week 1 of the NEXT year", () => {
    const r = isoUge("2025-12-29")!;
    expect(r.uge).toBe(1);
    expect(r.isoAar).toBe(2026);
  });

  test("late Monday after leap year maps to week 1 of next year", () => {
    const r = isoUge("2024-12-30")!;
    expect(r.uge).toBe(1);
    expect(r.isoAar).toBe(2025);
  });

  test("January 1 on a Sunday belongs to week 52 of the PREVIOUS year", () => {
    const r = isoUge("2023-01-01")!;
    expect(r.uge).toBe(52);
    expect(r.isoAar).toBe(2022);
  });

  test("January 1 on a Friday belongs to week 53 of the previous year", () => {
    const r = isoUge("2021-01-01")!;
    expect(r.uge).toBe(53);
    expect(r.isoAar).toBe(2020);
  });

  test("December 31 in a 53-week year stays in week 53", () => {
    const r = isoUge("2020-12-31")!;
    expect(r.uge).toBe(53);
    expect(r.isoAar).toBe(2020);
  });

  test("Sunday early January can be week 53 of two years back", () => {
    const r = isoUge("2016-01-03")!;
    expect(r.uge).toBe(53);
    expect(r.isoAar).toBe(2015);
  });

  test("January 1 on a Saturday belongs to week 52 of the previous year", () => {
    const r = isoUge("2000-01-01")!;
    expect(r.uge).toBe(52);
    expect(r.isoAar).toBe(1999);
  });

  test("accepts Date objects identically to strings", () => {
    expect(isoUge(new Date(2026, 7, 24))).toEqual(isoUge("2026-08-24"));
  });
});

describe("antalUgerIIsoAar", () => {
  test("returns null for invalid input", () => {
    expect(antalUgerIIsoAar(0)).toBeNull();
    expect(antalUgerIIsoAar(-2026)).toBeNull();
    expect(antalUgerIIsoAar(2026.5)).toBeNull();
    expect(antalUgerIIsoAar(NaN)).toBeNull();
    expect(antalUgerIIsoAar(10000)).toBeNull();
  });

  test("years with 53 weeks", () => {
    // Jan 1 is a Thursday (2026) or Wednesday in a leap year (2020)
    expect(antalUgerIIsoAar(2026)).toBe(53);
    expect(antalUgerIIsoAar(2020)).toBe(53);
    expect(antalUgerIIsoAar(2015)).toBe(53);
  });

  test("normal years have 52 weeks", () => {
    expect(antalUgerIIsoAar(2024)).toBe(52);
    expect(antalUgerIIsoAar(2025)).toBe(52);
    expect(antalUgerIIsoAar(2027)).toBe(52);
  });

  test("week number never exceeds weeks-in-year for every day of 2026", () => {
    for (let d = new Date(2026, 0, 1); d.getFullYear() === 2026; d.setDate(d.getDate() + 1)) {
      const r = isoUge(new Date(d))!;
      expect(r.uge).toBeLessThanOrEqual(53);
      expect(r.uge).toBeGreaterThanOrEqual(1);
      if (r.isoAar === 2026) expect(r.uge).toBeLessThanOrEqual(antalUgerIIsoAar(2026)!);
    }
  });
});
