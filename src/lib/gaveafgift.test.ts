import { describe, expect, test } from "vitest";
import { GAVE_EKSEMPLER, GAVE_RELATIONER, beregnGaveafgift } from "./gaveafgift";

/**
 * Tallene er Skattestyrelsens egne regneeksempler fra
 * skat.dk/borger/gaver-gevinster-og-legater/gaver-saa-meget-maa-du-give
 * (læst 7/10-2026). Hvis en sats eller et bundfradrag ændrer sig, skal de
 * officielle eksempler opdateres samtidig — derfor står de her som port.
 */
describe("gaveafgift 2026 — nær familie (80.600 kr, 15 %)", () => {
  test("bundfradraget er 80.600 kr", () => {
    expect(GAVE_RELATIONER.naer.bundfradrag).toBe(80_600);
    expect(GAVE_RELATIONER.naer.sats).toBe(0.15);
  });

  test("80.600 kr giver 0 kr i afgift", () => {
    const r = beregnGaveafgift(80_600, "naer")!;
    expect(r.grundlag).toBe(0);
    expect(r.afgift).toBe(0);
    expect(r.modtager).toBe(80_600);
  });

  test("100.000 kr giver 19.400 kr i grundlag og 2.910 kr i afgift", () => {
    const r = beregnGaveafgift(100_000, "naer")!;
    expect(r.grundlag).toBe(19_400);
    expect(r.afgift).toBe(2_910);
  });

  test("500.000 kr giver 419.400 kr i grundlag og 62.910 kr i afgift", () => {
    const r = beregnGaveafgift(500_000, "naer")!;
    expect(r.grundlag).toBe(419_400);
    expect(r.afgift).toBe(62_910);
  });

  test("1.000.000 kr giver 919.400 kr i grundlag og 137.910 kr i afgift", () => {
    const r = beregnGaveafgift(1_000_000, "naer")!;
    expect(r.grundlag).toBe(919_400);
    expect(r.afgift).toBe(137_910);
  });
});

describe("gaveafgift 2026 — svigerbørn (28.200 kr, 15 %)", () => {
  test("28.200 kr giver 0 kr i afgift", () => {
    const r = beregnGaveafgift(28_200, "svigerboern")!;
    expect(r.bundfradrag).toBe(28_200);
    expect(r.afgift).toBe(0);
  });

  test("100.000 kr giver 71.800 kr i grundlag og 10.770 kr i afgift", () => {
    const r = beregnGaveafgift(100_000, "svigerboern")!;
    expect(r.grundlag).toBe(71_800);
    expect(r.afgift).toBe(10_770);
  });
});

describe("gaveafgift 2026 — bedsteforældre og stedforældre (36,25 %)", () => {
  test("satsen er 36,25 % af beløbet over 80.600 kr", () => {
    expect(GAVE_RELATIONER.bedsteforaeldre.bundfradrag).toBe(80_600);
    expect(GAVE_RELATIONER.bedsteforaeldre.sats).toBe(0.3625);
    const r = beregnGaveafgift(100_000, "bedsteforaeldre")!;
    expect(r.afgift).toBe(19_400 * 0.3625);
  });
});

describe("gaveafgift — kant-tilfælde", () => {
  test("tomt eller negativt beløb giver ingen beregning", () => {
    expect(beregnGaveafgift(0, "naer")).toBeNull();
    expect(beregnGaveafgift(-100, "naer")).toBeNull();
    expect(beregnGaveafgift(Number.NaN, "naer")).toBeNull();
  });

  test("en gave under bundfradraget bliver ikke negativ", () => {
    const r = beregnGaveafgift(10_000, "naer")!;
    expect(r.grundlag).toBe(0);
    expect(r.afgift).toBe(0);
  });

  test("modtager + afgift er altid hele gaven", () => {
    for (const e of GAVE_EKSEMPLER) {
      expect(e.resultat.modtager + e.resultat.afgift).toBeCloseTo(e.beloeb, 6);
    }
  });
});
