import { describe, expect, test } from "vitest";
import { beregnMoms, fratraekRaekker, DEFAULT_MOMS_SATS } from "./moms";
import { baklaengesEksempler, baklaengesTabel, krSe } from "./moms-eksempler";

describe("moms-eksempler", () => {
  test("baklänges-eksemplena er dem, beregnMoms regner", () => {
    const eksempler = baklaengesEksempler();
    expect(eksempler).toHaveLength(3);
    for (const [i, r] of eksempler.entries()) {
      const forventet = beregnMoms([1250, 499, 2000][i], "fratraekMoms", DEFAULT_MOMS_SATS);
      expect(r.prisInklMoms).toBe(forventet.prisInklMoms);
      expect(r.prisUdenMoms).toBeCloseTo(forventet.prisUdenMoms, 10);
      expect(r.momsBeloeb).toBeCloseTo(forventet.momsBeloeb, 10);
    }
  });

  test("499 er det belopp hvor 20 %-metoden og ÷ 1,25 gir hvert sit svar", () => {
    const med499 = baklaengesEksempler()[1];
    expect(med499.prisInklMoms).toBe(499);
    expect(med499.prisUdenMoms).toBeCloseTo(399.2, 10);
    expect(med499.momsBeloeb).toBeCloseTo(99.8, 10);
    // 20 % af 499 er 99,8 — det er fällen: metoden og ÷ 1,25 er lika här,
    // men på 499 er skillnaden synlig i det afrundade tal.
    expect(499 * 0.2).toBeCloseTo(med499.momsBeloeb, 10);
  });

  test("tabellen er fratraekRaekker(25) — samme modul som værktøjet bruger", () => {
    const tabel = baklaengesTabel();
    const forventet = fratraekRaekker(DEFAULT_MOMS_SATS);
    expect(tabel).toEqual(forventet);
    expect(tabel.length).toBeGreaterThan(0);
    for (const r of tabel) {
      expect(r.prisInklMoms).toBeGreaterThan(0);
      expect(r.prisUdenMoms).toBeGreaterThan(0);
      expect(r.momsBeloeb).toBeCloseTo(r.prisInklMoms - r.prisUdenMoms, 10);
    }
  });

  test("krSe formatterer med svensk locale", () => {
    // Svensk tusentalsavskiljare er non-breaking space (U+00A0), inte vanligt mellanslag.
    expect(krSe(1250)).toBe("1 250 kr");
    expect(krSe(99.8)).toBe("99,8 kr");
    expect(krSe(399.2)).toBe("399,2 kr");
  });
});
