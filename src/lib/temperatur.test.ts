import { describe, test, expect } from "vitest";
import { konverterTemperatur } from "./temperatur";

describe("konverterTemperatur", () => {
  test("returns null for NaN", () => {
    expect(konverterTemperatur(Number.NaN, "celsius")).toBeNull();
  });

  test("water freezing point from Celsius", () => {
    const r = konverterTemperatur(0, "celsius")!;
    expect(r.fahrenheit).toBe(32);
    expect(r.kelvin).toBeCloseTo(273.15, 2);
  });

  test("water boiling point from Celsius", () => {
    const r = konverterTemperatur(100, "celsius")!;
    expect(r.fahrenheit).toBe(212);
    expect(r.kelvin).toBeCloseTo(373.15, 2);
  });

  test("body temperature from Fahrenheit", () => {
    const r = konverterTemperatur(98.6, "fahrenheit")!;
    expect(r.celsius).toBeCloseTo(37, 4);
  });

  test("from Kelvin", () => {
    const r = konverterTemperatur(300, "kelvin")!;
    expect(r.celsius).toBeCloseTo(26.85, 2);
    expect(r.fahrenheit).toBeCloseTo(80.33, 2);
  });

  test("-40 is the same in Celsius and Fahrenheit", () => {
    const r = konverterTemperatur(-40, "celsius")!;
    expect(r.fahrenheit).toBe(-40);
  });
});
