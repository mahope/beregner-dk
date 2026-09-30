import { describe, expect, test } from "vitest";
import {
  PROCENT_10_AF_TAL,
  PROCENT_SKILLNAD_EKSEMPEL,
  procentAf,
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

describe("procentAf", () => {
  test("10 procent er tallet delt med 10", () => {
    expect(procentAf(250, 10)).toBe(25);
    expect(procentAf(100, 10)).toBe(10);
    expect(procentAf(500, 10)).toBe(50);
    expect(procentAf(1600, 10)).toBe(160);
  });

  test("et tal der ikke kan deles med 10 giver et decimaltal", () => {
    // 75 ligger i PROCENT_10_AF_TAL med vilje: det er det eneste målte tal,
    // hvis svar ikke er et helt tal, så formateringen skal kunne begge dele.
    expect(procentAf(75, 10)).toBe(7.5);
  });

  test("de andre satser bruger samme regel", () => {
    expect(procentAf(200, 25)).toBe(50);
    expect(procentAf(180, 50)).toBe(90);
    expect(procentAf(350, 1)).toBe(3.5);
  });

  test("0 procent er 0, og 100 procent er tallet selv", () => {
    expect(procentAf(500, 0)).toBe(0);
    expect(procentAf(500, 100)).toBe(500);
  });
});

describe("PROCENT_10_AF_TAL", () => {
  test("dækker de tal dansk og svensk autocomplete faktisk spørger om", () => {
    // Målt 2026-09-30 (hl=da&gl=dk / hl=se&gl=se). Listen er de viste tal,
    // ikke et udvalg — en række der mangler her, mangler også i tabellen.
    for (const tal of [75, 100, 200, 300, 400, 500, 600, 1000, 1600, 25000]) {
      expect(PROCENT_10_AF_TAL).toContain(tal);
    }
    for (const tal of [500, 1000, 2000, 10000, 1000000, 5000000]) {
      expect(PROCENT_10_AF_TAL).toContain(tal);
    }
  });

  test("hver række svarer til tallet delt med 10", () => {
    // Tallene er beregnet, ikke skrevet i hånden, så en forkert række er umulig
    // at få ind uden at denne test falder.
    for (const tal of PROCENT_10_AF_TAL) {
      expect(procentAf(tal, 10)).toBe(tal / 10);
    }
  });

  test("er stigende og uden dubletter", () => {
    expect(PROCENT_10_AF_TAL).toEqual([...PROCENT_10_AF_TAL].sort((a, b) => a - b));
    expect(new Set(PROCENT_10_AF_TAL).size).toBe(PROCENT_10_AF_TAL.length);
  });

  test("indeholder 75, fordi det er det eneste målte tal med komma i svaret", () => {
    const medDecimal = PROCENT_10_AF_TAL.filter((tal) => procentAf(tal, 10) % 1 !== 0);
    expect(medDecimal).toEqual([75]);
  });

  test("alle tal er positive heltal", () => {
    for (const tal of PROCENT_10_AF_TAL) {
      expect(Number.isInteger(tal)).toBe(true);
      expect(tal).toBeGreaterThan(0);
    }
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
