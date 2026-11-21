import { describe, test, expect } from "vitest";
import { beregnRygestopBesparelse } from "./rygestop";

describe("beregnRygestopBesparelse", () => {
  test("returns null for invalid cigarettes per day", () => {
    expect(beregnRygestopBesparelse(0, 60, 20)).toBeNull();
    expect(beregnRygestopBesparelse(-5, 60, 20)).toBeNull();
    expect(beregnRygestopBesparelse(101, 60, 20)).toBeNull();
  });

  test("returns null for invalid pack price", () => {
    expect(beregnRygestopBesparelse(15, 0, 20)).toBeNull();
    expect(beregnRygestopBesparelse(15, -60, 20)).toBeNull();
    expect(beregnRygestopBesparelse(15, 501, 20)).toBeNull();
  });

  test("returns null for invalid pack size", () => {
    expect(beregnRygestopBesparelse(15, 60, 0)).toBeNull();
    expect(beregnRygestopBesparelse(15, 60, -20)).toBeNull();
    expect(beregnRygestopBesparelse(15, 60, 101)).toBeNull();
  });

  test("15 cigarettes/day at 60 kr per 20-pack = 45 kr/day", () => {
    const r = beregnRygestopBesparelse(15, 60, 20)!;
    expect(r.dag).toBeCloseTo(45);
  });

  test("annual saving = daily × 365", () => {
    const r = beregnRygestopBesparelse(15, 60, 20)!;
    expect(r.aar).toBeCloseTo(45 * 365);
  });

  test("monthly saving × 12 = annual (365/12 day convention)", () => {
    const r = beregnRygestopBesparelse(15, 60, 20)!;
    expect(r.maaned * 12).toBeCloseTo(r.aar);
  });

  test("five-year saving = annual × 5", () => {
    const r = beregnRygestopBesparelse(15, 60, 20)!;
    expect(r.femAar).toBeCloseTo(r.aar * 5);
  });

  test("pack counts follow from smoking rate", () => {
    const r = beregnRygestopBesparelse(10, 55, 20)!;
    expect(r.pakkerPrDag).toBeCloseTo(0.5);
    expect(r.pakkerPrAar).toBeCloseTo(0.5 * 365);
  });

  test("a full pack a day equals the pack price daily", () => {
    const r = beregnRygestopBesparelse(20, 62.5, 20)!;
    expect(r.dag).toBeCloseTo(62.5);
  });

  test("19-cigarette packs give higher per-cigarette cost", () => {
    const standard = beregnRygestopBesparelse(19, 60, 19)!;
    const tyvePakke = beregnRygestopBesparelse(19, 60, 20)!;
    expect(standard.dag).toBeGreaterThan(tyvePakke.dag);
  });
});
