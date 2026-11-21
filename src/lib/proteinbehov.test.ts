import { describe, test, expect } from "vitest";
import { beregnProteinbehov } from "./proteinbehov";

describe("beregnProteinbehov", () => {
  test("returns null for invalid weight", () => {
    expect(beregnProteinbehov(0, "stillesiddende")).toBeNull();
    expect(beregnProteinbehov(-10, "stillesiddende")).toBeNull();
    expect(beregnProteinbehov(501, "stillesiddende")).toBeNull();
  });

  test("70 kg sedentary = 56 g", () => {
    const r = beregnProteinbehov(70, "stillesiddende")!;
    expect(r.gram).toBe(56);
    expect(r.faktor).toBe(0.8);
  });

  test("70 kg moderately active = 91 g", () => {
    const r = beregnProteinbehov(70, "moderat-aktiv")!;
    expect(r.gram).toBe(91);
    expect(r.faktor).toBe(1.3);
  });

  test("80 kg very active = 128 g", () => {
    const r = beregnProteinbehov(80, "meget-aktiv")!;
    expect(r.gram).toBe(128);
    expect(r.faktor).toBe(1.6);
  });

  test("60 kg elite = 120 g", () => {
    const r = beregnProteinbehov(60, "ekstrem-aktiv")!;
    expect(r.gram).toBe(120);
    expect(r.faktor).toBe(2.0);
  });

  test("min/max range reflects lowest and highest factor", () => {
    const r = beregnProteinbehov(70, "moderat-aktiv")!;
    expect(r.min).toBe(56);
    expect(r.max).toBe(140);
  });

  test("light activity returns correct factor", () => {
    const r = beregnProteinbehov(75, "let-aktiv")!;
    expect(r.gram).toBe(75);
    expect(r.faktor).toBe(1.0);
  });
});