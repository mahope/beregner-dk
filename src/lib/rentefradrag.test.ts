import { describe, expect, test } from "vitest";
import { beregnRentefradrag, hojFradragsgraense } from "./rentefradrag";

describe("beregnRentefradrag", () => {
  test("beløb under grænsen bruger kun den høje sats", () => {
    const r = beregnRentefradrag(50_000, "single");
    expect(r.hoejAndel).toBe(50_000);
    expect(r.lavAndel).toBe(0);
    expect(r.besparelse).toBeCloseTo(16_800, 5);
    expect(r.effektivSats).toBeCloseTo(33.6, 5);
  });

  test("beløb over grænsen deles i to satser", () => {
    const r = beregnRentefradrag(80_000, "single");
    expect(r.hoejAndel).toBe(50_000);
    expect(r.lavAndel).toBe(30_000);
    expect(r.besparelse).toBeCloseTo(16_800 + 7_680, 5);
    expect(r.besparelse).toBeCloseTo(24_480, 5);
  });

  test("par har dobbelt grænse", () => {
    expect(hojFradragsgraense("single")).toBe(50_000);
    expect(hojFradragsgraense("couple")).toBe(100_000);
    const r = beregnRentefradrag(80_000, "couple");
    expect(r.lavAndel).toBe(0);
    expect(r.besparelse).toBeCloseTo(26_880, 5);
  });

  test("præcis på grænsen giver kun den høje sats", () => {
    const r = beregnRentefradrag(100_000, "couple");
    expect(r.hoejAndel).toBe(100_000);
    expect(r.lavAndel).toBe(0);
  });

  test("netto renteindtægter giver intet fradrag", () => {
    for (const belob of [0, -1, -50_000]) {
      const r = beregnRentefradrag(belob, "single");
      expect(r.besparelse).toBe(0);
      expect(r.effektivSats).toBe(0);
      expect(r.hoejAndel).toBe(0);
      expect(r.lavAndel).toBe(0);
    }
  });

  test("den lave sats kan aldrig overstige den høje", () => {
    const r = beregnRentefradrag(1_000_000, "single");
    expect(r.hoejAndel).toBe(50_000);
    expect(r.lavAndel).toBe(950_000);
    expect(r.effektivSats).toBeGreaterThan(25.6);
    expect(r.effektivSats).toBeLessThan(33.6);
  });
});
