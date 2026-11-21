import { describe, test, expect } from "vitest";
import { konverterLoen } from "./loen-konverter";

describe("konverterLoen", () => {
  test("returns null for invalid input", () => {
    expect(konverterLoen(0, "time", 37)).toBeNull();
    expect(konverterLoen(200, "time", 0)).toBeNull();
    expect(konverterLoen(-5, "aar", 37)).toBeNull();
  });

  test("hourly to yearly at 37 h/week", () => {
    const r = konverterLoen(200, "time", 37)!;
    // 200 * 37 * 52 = 384800
    expect(r.aar).toBe(384800);
    expect(r.maaned).toBeCloseTo(384800 / 12, 2);
  });

  test("monthly to hourly at 40 h/week", () => {
    const r = konverterLoen(40000, "maaned", 40)!;
    expect(r.aar).toBe(480000);
    // 480000 / (40*52) = 230.77
    expect(r.time).toBeCloseTo(480000 / (40 * 52), 2);
  });

  test("yearly stays put and derives the rest", () => {
    const r = konverterLoen(600000, "aar", 37)!;
    expect(r.aar).toBe(600000);
    expect(r.maaned).toBe(50000);
    expect(r.time).toBeCloseTo(600000 / (37 * 52), 2);
  });

  test("round trip is stable", () => {
    const a = konverterLoen(250, "time", 37)!;
    const b = konverterLoen(a.maaned, "maaned", 37)!;
    expect(b.time).toBeCloseTo(250, 6);
  });
});
