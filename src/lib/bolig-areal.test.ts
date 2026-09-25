import { describe, expect, it } from "vitest";
import { arealForskel, huslejePrM2, parseDanskTal } from "./bolig-areal";

describe("parseDanskTal", () => {
  it("reads plain and Danish formatted numbers", () => {
    expect(parseDanskTal("65")).toBe(65);
    expect(parseDanskTal("65,5")).toBe(65.5);
    expect(parseDanskTal("9.500")).toBe(9500);
    expect(parseDanskTal("65.5")).toBe(65.5);
    expect(parseDanskTal("9.500,50")).toBe(9500.5);
    expect(parseDanskTal(" 12 000 ")).toBe(12000);
  });

  it("returns null for empty or invalid input", () => {
    expect(parseDanskTal("")).toBeNull();
    expect(parseDanskTal("abc")).toBeNull();
  });
});

describe("huslejePrM2", () => {
  it("divides the monthly rent by the area and multiplies by 12 for the year", () => {
    expect(huslejePrM2(9_000, 60)).toEqual({ maaned: 150, aar: 1800 });
  });

  it("needs positive rent and area", () => {
    expect(huslejePrM2(9_000, 0)).toBeNull();
    expect(huslejePrM2(0, 60)).toBeNull();
    expect(huslejePrM2(null, 60)).toBeNull();
    expect(huslejePrM2(-1, 60)).toBeNull();
  });
});

describe("arealForskel", () => {
  it("is positive when your own measurement is larger than BBR's", () => {
    expect(arealForskel(140, 136)).toEqual({ m2: 4, procent: (4 / 136) * 100 });
    expect(arealForskel(120, 150)).toEqual({ m2: -30, procent: -20 });
  });

  it("needs both numbers", () => {
    expect(arealForskel(null, 136)).toBeNull();
    expect(arealForskel(140, null)).toBeNull();
  });
});
