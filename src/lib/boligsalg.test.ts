import { describe, test, expect } from "vitest";
import { beregnBoligsalg, DEFAULT_VALUES } from "./boligsalg";

describe("beregnBoligsalg", () => {
  test("returns null for invalid (zero) salgspris", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 0 });
    expect(result).toBeNull();
  });

  test("returns null for invalid (negative) salgspris", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: -100 });
    expect(result).toBeNull();
  });

  test("returns null for NaN salgspris", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: NaN });
    expect(result).toBeNull();
  });

  test("calculates net proceeds correctly with default values (3M DKK, 4% mægler)", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 3000000 });
    expect(result).not.toBeNull();
    expect(result!.nettoProvenu).toBeGreaterThan(0);
    expect(result!.samledeOmkostninger).toBeGreaterThan(0);
    // Mægler: 4% of 3M = 120,000
    expect(result!.poster.find((p) => p.navn === "Ejendomsmægler")!.beloeb).toBe(120000);
  });

  test("uses fixed mægler fee when type is 'fast'", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 5000000, maeglerType: "fast", maeglerFast: 50000 });
    expect(result!.poster.find((p) => p.navn === "Ejendomsmægler")!.beloeb).toBe(50000);
  });

  test("tinglysning is not included when tinglysningInkluderet is false", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 3000000, tinglysningInkluderet: false });
    expect(result!.poster.find((p) => p.navn.startsWith("Tinglysning"))).toBeUndefined();
  });

  test("includes tinglysning when enabled with nyBoligPris", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 3000000, nyBoligPris: 3500000, tinglysningInkluderet: true });
    expect(result!.poster.find((p) => p.navn.startsWith("Tinglysning"))).toBeDefined();
    expect(result!.samledeOmkostninger).toBeGreaterThan(0);
  });

  test("does not include tinglysning when nyBoligPris is 0", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 3000000, nyBoligPris: 0, tinglysningInkluderet: true });
    expect(result!.poster.find((p) => p.navn.startsWith("Tinglysning"))).toBeUndefined();
  });

  test("includes 'Andre udgifter' when > 0", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 3000000, andre: 5000 });
    expect(result!.poster.find((p) => p.navn === "Andre udgifter")!.beloeb).toBe(5000);
  });

  test("omits 'Andre udgifter' when 0", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 3000000, andre: 0 });
    expect(result!.poster.find((p) => p.navn === "Andre udgifter")).toBeUndefined();
  });

  test("net proceeds = sales price - total costs", () => {
    const input = { ...DEFAULT_VALUES, salgspris: 2500000, maeglerType: "fast" as const, maeglerFast: 35000, andre: 0 };
    const result = beregnBoligsalg(input);
    expect(result!.nettoProvenu).toBe(2500000 - result!.samledeOmkostninger);
  });

  test("fordelinger sorted by amount descending", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 3000000, andre: 5000 });
    expect(result!.fordelinger[0].beloeb).toBeGreaterThanOrEqual(result!.fordelinger[1].beloeb);
  });

  test("high sales price still works", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 10000000 });
    expect(result).not.toBeNull();
    expect(result!.nettoProvenu).toBeGreaterThan(0);
  });

  test("low sales price still works", () => {
    const result = beregnBoligsalg({ ...DEFAULT_VALUES, salgspris: 500000 });
    expect(result).not.toBeNull();
    expect(result!.nettoProvenu).toBeLessThan(500000);
  });
});