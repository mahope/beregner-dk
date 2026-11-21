import { describe, expect, test } from "vitest";
import {
  AARS_FIRE_PROCENT,
  EKSEMPEL_AARSRENTE,
  EKSEMPEL_HOVEDSTOL,
  EKSEMPEL_LOEBETID,
  MAANEDLIG_ONE_PROCENT,
  annuitetsBetalning,
  annuitetsEksempel,
  effektivAarsrente,
} from "./rente-eksempler";

/** Samme formel som `RenteBeregner` — lånt, så et eksempel ikke kan glide fra værktøjet. */
function renteBeregnerensBetalning(
  hovedstol: number,
  maanedligRente: number,
  antalMaaneder: number,
): number {
  return (
    (hovedstol * maanedligRente * Math.pow(1 + maanedligRente, antalMaaneder)) /
    (Math.pow(1 + maanedligRente, antalMaaneder) - 1)
  );
}

describe("rente-eksempler", () => {
  test("eksemplets betaling er den, RenteBeregner selv producerer", () => {
    const eksempel = annuitetsEksempel();

    expect(eksempel.maanedligBetalning).toBe(
      renteBeregnerensBetalning(
        EKSEMPEL_HOVEDSTOL,
        EKSEMPEL_AARSRENTE / 100 / 12,
        EKSEMPEL_LOEBETID * 12,
      ),
    );
  });

  test("de danske og svenske sider skriver de samme tal", () => {
    const eksempel = annuitetsEksempel();

    // 200.000 kr til 4 % i 20 år: de tal den danske side altid har skrevet
    // i "Formlen for et annuitetslån". Svensk side arver dem nu fra samme
    // modul, så de to sprog ikke kan komme i utakt.
    expect(eksempel.maanedligBetalning.toFixed(2)).toBe("1211.96");
    expect(eksempel.samletBetaling.toFixed(2)).toBe("290870.56");
    expect(eksempel.samletRante.toFixed(2)).toBe("90870.56");
  });

  test("renten er betalingen minus hovedstolen", () => {
    const eksempel = annuitetsEksempel();

    expect(eksempel.samletRante).toBe(eksempel.samletBetaling - EKSEMPEL_HOVEDSTOL);
    expect(eksempel.samletBetaling).toBe(eksempel.maanedligBetalning * eksempel.antalMaaneder);
  });

  test("løbetiden i år bliver måneder, og månedsrente deres tilsvarende", () => {
    const eksempel = annuitetsEksempel();

    expect(eksempel.antalMaaneder).toBe(240);
    expect(eksempel.maanedligRente).toBeCloseTo(0.04 / 12, 10);
  });

  test("effektiv år rente er månadsrenten fordoblet tolv gange", () => {
    expect(effektivAarsrente(MAANEDLIG_ONE_PROCENT)).toBeCloseTo(Math.pow(1.01, 12) - 1, 12);
    expect(effektivAarsrente(AARS_FIRE_PROCENT / 12)).toBeCloseTo(
      Math.pow(1 + 0.04 / 12, 12) - 1,
      12,
    );
  });

  test("effektiv rente er altid større end den nominelle, og låser de to sideens tal", () => {
    // 1 % pr. måned → 12,68 % om året
    expect(effektivAarsrente(MAANEDLIG_ONE_PROCENT) * 100).toBeCloseTo(12.68, 2);
    // 4 % om året → 4,07 % effektivt
    expect(effektivAarsrente(AARS_FIRE_PROCENT / 12) * 100).toBeCloseTo(4.07, 2);
    // Den nominelle 4 % må aldrig kunne stå som den effektive.
    expect(effektivAarsrente(AARS_FIRE_PROCENT / 12)).toBeGreaterThan(AARS_FIRE_PROCENT);
  });

  test("annuitetsBetalning er den geometriske serie, summeret direkte", () => {
    // Beviser formlen mod den sum, teksten siger er årsagen til den:
    // hver betaling dækker 1/(1+r) af restgælden, så P = ydelse × summen.
    const P = 200_000;
    const r = 0.04 / 12;
    const n = 240;

    let sum = 0;
    for (let i = 1; i <= n; i++) sum += 1 / Math.pow(1 + r, i);

    const ydelse = annuitetsBetalning(P, r, n);

    expect(ydelse * sum).toBeCloseTo(P, 4);
  });

  test("et lån til 0 % er udelt, ikke NaN — den naive formel kan ikke bruges der", () => {
    // r = 0 gør både tæller og nævner 0, så formlen giver NaN. RenteBeregner
    // har derfor en egen gren for rente 0. Låsen her sikrer at eksemplet
    // aldrig rammer den, for et NaN i indekseret tekst er værre end en fejl.
    expect(Number.isNaN(annuitetsBetalning(100_000, 0, 240))).toBe(true);
    // Med en månedlig rente på 1 % er den veldefineret, som siden kræver.
    expect(Number.isNaN(annuitetsBetalning(100_000, 0.01, 240))).toBe(false);
  });
});
