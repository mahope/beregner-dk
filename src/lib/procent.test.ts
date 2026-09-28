import { describe, expect, test } from "vitest";
import {
  PROCENT_SKILLNAD_EKSEMPEL,
  procentDifferens,
  procentForskel,
} from "./procent";

describe("procentForskel", () => {
  test("procentvis ændring fra gammal til ny", () => {
    expect(procentForskel(12500, 10000)).toBe(25);
    expect(procentForskel(33000, 30000)).toBe(10);
  });

  test("et fald er negativt", () => {
    expect(procentForskel(10000, 12500)).toBe(-20);
  });

  test("ingen ændring er 0 procent", () => {
    expect(procentForskel(10000, 10000)).toBe(0);
  });

  test("et gammelt tal på 0 giver ingen division med 0", () => {
    expect(procentForskel(10000, 0)).toBe(0);
  });
});

describe("procentDifferens", () => {
  test("er symmetrisk: samme svar uanset hvilken vej man regner", () => {
    expect(procentDifferens(10000, 12500)).toBeCloseTo(22.222, 3);
    expect(procentDifferens(12500, 10000)).toBeCloseTo(22.222, 3);
  });

  test("de to eksempler er 22,2 og 9,5 procent", () => {
    const [lon, belob] = PROCENT_SKILLNAD_EKSEMPEL;
    expect(procentDifferens(belob.gammal, belob.ny)).toBeCloseTo(22.222, 3);
    expect(procentDifferens(lon.gammal, lon.ny)).toBeCloseTo(9.5238, 3);
  });

  test("giver altid et positivt tal", () => {
    expect(procentDifferens(10000, 12500)).toBeGreaterThan(0);
    expect(procentDifferens(12500, 10000)).toBeGreaterThan(0);
  });

  test("to ens tal er 0 procent", () => {
    expect(procentDifferens(10000, 10000)).toBe(0);
  });

  test("to tal der summerer til 0 giver ingen division med 0", () => {
    expect(procentDifferens(10000, -10000)).toBe(0);
  });
});

describe("de to formler er ikke det samme", () => {
  test("de samme to tal giver 25 procent ændring, men 22,2 procent forskel", () => {
    const [, belob] = PROCENT_SKILLNAD_EKSEMPEL;
    expect(procentForskel(belob.ny, belob.gammal)).toBe(25);
    expect(procentDifferens(belob.gammal, belob.ny)).toBeCloseTo(22.222, 3);
    // Det er hele fælden ved "procent skillnad mellan två tal": samme tal,
    // to svar. Formlen skal derfor aldrig kunne forveksles i teksten.
    expect(procentDifferens(belob.gammal, belob.ny)).not.toBe(
      procentForskel(belob.ny, belob.gammal)
    );
  });

  test("løn-eksemplet er 10 procent ændring, men 9,5 procent forskel", () => {
    const [lon] = PROCENT_SKILLNAD_EKSEMPEL;
    expect(procentForskel(lon.ny, lon.gammal)).toBe(10);
    expect(procentDifferens(lon.gammal, lon.ny)).toBeCloseTo(9.5238, 3);
  });

  test("eksemplerne er de tal siden allerede lover andre steder", () => {
    // 33 000 mot 30 000 = 10 procent står i FAQ'en, og 10 000 till 12 500 = 25
    // står i Excel-tabellen. En ny tekst må ikke give andre tal for de samme par.
    for (const { gammal, ny } of PROCENT_SKILLNAD_EKSEMPEL) {
      expect(procentForskel(ny, gammal)).toBeCloseTo(
        ((ny - gammal) / gammal) * 100,
        10
      );
    }
    expect(PROCENT_SKILLNAD_EKSEMPEL[0]).toMatchObject({ gammal: 30000, ny: 33000 });
    expect(PROCENT_SKILLNAD_EKSEMPEL[1]).toMatchObject({ gammal: 10000, ny: 12500 });
  });
});
