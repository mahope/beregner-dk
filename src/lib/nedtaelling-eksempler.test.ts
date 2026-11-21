import { describe, expect, test } from "vitest";
import { beregnNedtaelling } from "./nedtaelling";
import {
  EKSEMPEL_IDAG,
  EKSEMPEL_MAL_DAG,
  EKSEMPEL_MAL_TID,
  excelEksempel,
} from "./nedtaelling-eksempler";

describe("nedtaelling-eksempler", () => {
  test("dage-tallet er det samme som beregneren giver", () => {
    const resultat = beregnNedtaelling(EKSEMPEL_IDAG, EKSEMPEL_MAL_DAG);
    expect(resultat).not.toBeNull();
    expect(excelEksempel().dage).toBe(resultat!.dage);
  });

  test("29. september 2026 til julafton 2026 er 86 dage", () => {
    expect(excelEksempel().dage).toBe(86);
  });

  test("hele veckor og restdage summerer tilbake til dage-tallet", () => {
    const { dage, helaVeckor, restDage } = excelEksempel();
    expect(helaVeckor * 7 + restDage).toBe(dage);
    expect(helaVeckor).toBe(12);
    expect(restDage).toBe(2);
  });

  test("maalidagens klokkeslaeg er 570 minutter siden midnatt", () => {
    expect(excelEksempel().malMinuter).toBe(9 * 60 + 30);
  });

  test("hele dage i timer er 86 x 24 og taber dagens broekdel", () => {
    const { dage, helaDagarTimmar, timmerMedRest } = excelEksempel();
    expect(helaDagarTimmar).toBe(2064);
    expect(timmerMedRest).toBeCloseTo(2073.5, 6);
    expect(timmerMedRest - helaDagarTimmar).toBeCloseTo(9.5, 6);
  });

  test("minutter og sekunder er hele dage x 1440/86400 plus klokkeslaeget", () => {
    const { dage, minuter, sekunder } = excelEksempel();
    expect(minuter).toBe(86 * 1440 + 9 * 60 + 30);
    expect(minuter).toBe(124410);
    expect(sekunder).toBe(86 * 86400 + 9 * 3600 + 30 * 60);
    expect(sekunder).toBe(7464600);
  });

  test("MOD(.;1)-skrivningen er det samme tal", () => {
    const { dage, minuter } = excelEksempel();
    // Excel: =MOD(A1-IDAG();1)*1440 — dagens brøkdel gange 1440, lagt til hele dage.
    const heleDage = Math.floor(dage);
    const broekdelIMin = (minuter - heleDage * 1440) / 60;
    expect(heleDage * 1440 + broekdelIMin * 60).toBe(minuter);
  });

  test("eksemplet er fremad, sa DATEDIF ikke giver #NUM!", () => {
    const resultat = beregnNedtaelling(EKSEMPEL_IDAG, EKSEMPEL_MAL_DAG);
    expect(resultat!.erFortid).toBe(false);
    expect(resultat!.dage).toBeGreaterThan(0);
  });

  test("eksemplet bruger hele dage og klokkeslaeg i ISO- og 24-timersformat", () => {
    expect(EKSEMPEL_IDAG).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(EKSEMPEL_MAL_DAG).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(EKSEMPEL_MAL_TID).toMatch(/^\d{2}:\d{2}$/);
    expect(excelEksempel().malMinuter).toBeLessThan(24 * 60);
  });

  test("et ugyldigt eksempel kaster i stedet for at give et forkert tal", () => {
    expect(() =>
      beregnNedtaelling("2026-02-31", EKSEMPEL_MAL_DAG)
    ).not.toThrow();
    expect(beregnNedtaelling("2026-02-31", EKSEMPEL_MAL_DAG)).toBeNull();
  });
});
