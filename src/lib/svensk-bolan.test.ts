import { describe, test, expect } from "vitest";
import {
  amorteringstaktForBelaningsgrad,
  beregnRanteavdrag,
  beregnSvenskBolan,
} from "./svensk-bolan";

// Rules verified against the amortisation requirement in force from 1 April 2026.
describe("amorteringstakt (2026, LTV-based)", () => {
  test("over 70% LTV requires 2%", () => {
    expect(amorteringstaktForBelaningsgrad(0.8)).toBe(0.02);
    expect(amorteringstaktForBelaningsgrad(0.71)).toBe(0.02);
  });
  test("50-70% LTV requires 1%", () => {
    expect(amorteringstaktForBelaningsgrad(0.6)).toBe(0.01);
    expect(amorteringstaktForBelaningsgrad(0.7)).toBe(0.01);
  });
  test("50% or below requires no amortisation", () => {
    expect(amorteringstaktForBelaningsgrad(0.5)).toBe(0);
    expect(amorteringstaktForBelaningsgrad(0.3)).toBe(0);
  });
});

describe("beregnRanteavdrag", () => {
  test("30% up to 100 000 kr interest", () => {
    expect(beregnRanteavdrag(96000)).toBe(28800);
  });
  test("21% on interest above 100 000 kr", () => {
    // 100000*0.30 + 50000*0.21 = 30000 + 10500
    expect(beregnRanteavdrag(150000)).toBe(40500);
  });
});

describe("beregnSvenskBolan", () => {
  test("returns null for invalid input", () => {
    expect(beregnSvenskBolan(0, 100000, 4)).toBeNull();
    expect(beregnSvenskBolan(1000000, 0, 4)).toBeNull();
  });

  test("80% LTV: 2% amortisation, correct monthly cost", () => {
    const r = beregnSvenskBolan(3000000, 2400000, 4)!;
    expect(r.belaningsgrad).toBeCloseTo(0.8, 5);
    expect(r.amorteringstakt).toBe(0.02);
    expect(r.manadsAmortering).toBe(4000); // 48 000/12
    expect(r.manadsRanta).toBe(8000); // 96 000/12
    expect(r.manadskostnadBrutto).toBe(12000);
    // after ränteavdrag: (96000 - 28800 + 48000)/12 = 9600
    expect(r.manadskostnadEfterAvdrag).toBe(9600);
    expect(r.overBolanetak).toBe(false);
    expect(r.maxLan).toBe(2700000);
  });

  test("45% LTV: no mandatory amortisation", () => {
    const r = beregnSvenskBolan(4000000, 1800000, 4)!;
    expect(r.amorteringstakt).toBe(0);
    expect(r.manadsAmortering).toBe(0);
    expect(r.manadskostnadBrutto).toBe(r.manadsRanta);
  });

  test("flags loans above the 90% mortgage cap", () => {
    const r = beregnSvenskBolan(3000000, 2800000, 4)!;
    expect(r.overBolanetak).toBe(true); // 2.8M > 2.7M (90%)
  });

  test("kontantinsats is value minus loan", () => {
    const r = beregnSvenskBolan(3000000, 2400000, 4)!;
    expect(r.kontantinsats).toBe(600000);
  });
});
