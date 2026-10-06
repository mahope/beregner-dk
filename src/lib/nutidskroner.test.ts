import { describe, expect, test } from "vitest";
import {
  FORBRUGERPRISINDEKS_AARLIG,
  FORBRUGERPRISINDEKS_NU,
  NUTIDSKRONER_NU_AAR,
  NUTIDSKRONER_SENESTE_HELE_AAR,
  forbrugerprisindeks,
  nutidskroneAar,
  omregnTilNutidskroner,
} from "./nutidskroner";

describe("forbrugerprisindeks", () => {
  test("indeholder hele serien 1900-2025 fra Danmarks Statistik", () => {
    const aar = Object.keys(FORBRUGERPRISINDEKS_AARLIG).map(Number);
    expect(aar.length).toBe(126);
    expect(Math.min(...aar)).toBe(1900);
    expect(Math.max(...aar)).toBe(2025);
    // Alle 126 år skal være der — ingen huller i serien.
    for (let y = 1900; y <= 2025; y++) expect(FORBRUGERPRISINDEKS_AARLIG[y]).toBeTypeOf("number");
  });

  test("spotværdierne matcher StatBank PRIS8", () => {
    // Låst mod den rå CSV fra api.statbank.dk (hentet 7/10 2026), så en
    // fejltransskription fanges her og ikke i en brugerberegning.
    expect(FORBRUGERPRISINDEKS_AARLIG[1900]).toBe(100);
    expect(FORBRUGERPRISINDEKS_AARLIG[1970]).toBe(937);
    expect(FORBRUGERPRISINDEKS_AARLIG[2000]).toBe(5253);
    expect(FORBRUGERPRISINDEKS_AARLIG[2010]).toBe(6432);
    expect(FORBRUGERPRISINDEKS_AARLIG[2015]).toBe(6891);
    expect(FORBRUGERPRISINDEKS_AARLIG[2025]).toBe(8343);
  });

  test("2026-niveauet er PRIS01's august 2026 skaleret ind i PRIS8", () => {
    // PRIS01 har 2025 = 100, PRIS8 har 2025 = 8343, og august 2026 er 102,58.
    expect(FORBRUGERPRISINDEKS_NU).toBe(Math.round((8343 * 102.58) / 100));
    expect(forbrugerprisindeks(NUTIDSKRONER_NU_AAR)).toBe(FORBRUGERPRISINDEKS_NU);
    // Dagens niveau skal ligge over det seneste hele år, ellers er noget byttet om.
    expect(FORBRUGERPRISINDEKS_NU).toBeGreaterThan(FORBRUGERPRISINDEKS_AARLIG[NUTIDSKRONER_SENESTE_HELE_AAR]);
  });

  test("kender kun serien og nutidsåret", () => {
    expect(forbrugerprisindeks(1899)).toBeNull();
    expect(forbrugerprisindeks(2027)).toBeNull();
    expect(forbrugerprisindeks(2000)).toBe(5253);
  });
});

describe("omregnTilNutidskroner", () => {
  test("10.000 kr. i 2000 svarer til ca. 16.292 kr. i dag", () => {
    const r = omregnTilNutidskroner(10_000, 2000)!;
    expect(Math.round(r.beloeb)).toBe(16_292);
    expect(r.aendringPct).toBeCloseTo(62.92, 1);
    expect(r.tilAar).toBe(NUTIDSKRONER_NU_AAR);
  });

  test("100 kr. i 1900 bliver til dagens indeksværdi", () => {
    const r = omregnTilNutidskroner(100, 1900)!;
    expect(Math.round(r.beloeb)).toBe(FORBRUGERPRISINDEKS_NU);
    expect(r.aendringPct).toBeCloseTo((FORBRUGERPRISINDEKS_NU / 100 - 1) * 100, 6);
  });

  test("samme år giver uændret beløb", () => {
    const r = omregnTilNutidskroner(5_000, 2000, 2000)!;
    expect(r.beloeb).toBe(5_000);
    expect(r.faktor).toBe(1);
    expect(r.aendringPct).toBe(0);
  });

  test("den omvendte vej viser deflation", () => {
    const r = omregnTilNutidskroner(10_000, 2025, 2000)!;
    expect(r.beloeb).toBeLessThan(10_000);
    expect(r.aendringPct).toBeLessThan(0);
    // Forholdet er det samme på begge veje.
    const frem = omregnTilNutidskroner(10_000, 2000, 2025)!;
    expect(r.faktor * frem.faktor).toBeCloseTo(1, 10);
  });

  test("mellem to gamle år bruges indeksforholdet", () => {
    const r = omregnTilNutidskroner(1_000, 2000, 2010)!;
    expect(r.beloeb).toBeCloseTo(1000 * (6432 / 5253), 6);
  });

  test("afviser ukendte år og negative beløb", () => {
    expect(omregnTilNutidskroner(1_000, 1899)).toBeNull();
    expect(omregnTilNutidskroner(1_000, 2000, 2030)).toBeNull();
    expect(omregnTilNutidskroner(-1, 2000)).toBeNull();
    expect(omregnTilNutidskroner(Number.NaN, 2000)).toBeNull();
  });

  test("nul kroner bliver ved med at være nul", () => {
    const r = omregnTilNutidskroner(0, 1950)!;
    expect(r.beloeb).toBe(0);
    expect(r.aendringPct).toBeCloseTo((FORBRUGERPRISINDEKS_NU / 384 - 1) * 100, 6);
  });
});

describe("nutidskroneAar", () => {
  test("dækker hele serien plus nutidsåret", () => {
    const aar = nutidskroneAar();
    expect(aar[0]).toBe(1900);
    expect(aar[aar.length - 1]).toBe(NUTIDSKRONER_NU_AAR);
    expect(aar.length).toBe(127);
    expect(new Set(aar).size).toBe(aar.length);
  });
});
