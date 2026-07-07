import { describe, test, expect } from "vitest";
import { konverterEnhed, ENHEDER } from "./enheder";

describe("konverterEnhed", () => {
  test("km to miles", () => {
    const r = konverterEnhed(10, "laengde", "km", "mile")!;
    expect(r).toBeCloseTo(6.2137, 3);
  });

  test("miles to km", () => {
    const r = konverterEnhed(1, "laengde", "mile", "km")!;
    expect(r).toBeCloseTo(1.609344, 5);
  });

  test("inch to cm", () => {
    const r = konverterEnhed(1, "laengde", "inch", "cm")!;
    expect(r).toBeCloseTo(2.54, 5);
  });

  test("kg to pounds", () => {
    const r = konverterEnhed(1, "vaegt", "kg", "pound")!;
    expect(r).toBeCloseTo(2.2046, 3);
  });

  test("pounds to kg", () => {
    const r = konverterEnhed(150, "vaegt", "pound", "kg")!;
    expect(r).toBeCloseTo(68.0389, 3);
  });

  test("litre to US gallon", () => {
    const r = konverterEnhed(1, "volumen", "l", "gallon")!;
    expect(r).toBeCloseTo(0.264172, 5);
  });

  test("same unit returns same value", () => {
    expect(konverterEnhed(5, "laengde", "m", "m")).toBe(5);
  });

  test("returns null for NaN or unknown unit", () => {
    expect(konverterEnhed(Number.NaN, "laengde", "m", "km")).toBeNull();
    expect(konverterEnhed(1, "laengde", "m", "lightyear")).toBeNull();
  });

  test("every group has at least two units", () => {
    for (const group of Object.values(ENHEDER)) {
      expect(group.length).toBeGreaterThanOrEqual(2);
    }
  });
});
