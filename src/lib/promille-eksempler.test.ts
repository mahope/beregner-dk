import { describe, test, expect } from "vitest";
import {
  PROMILLE_EKSEAMPLER,
  formatGenstande,
  formatGram,
  formatPromille,
  formatTimer,
} from "./promille-eksempler";
import { PROMILLEGRANSE, timerTilGraense } from "./promille";

describe("PROMILLE_EKSEAMPLER", () => {
  test("er ikke tom — en test der er grøn paa en tom liste er vaerd intet", () => {
    expect(PROMILLE_EKSEAMPLER.length).toBe(4);
  });

  test("tallene i rækkerne er de, opgaven beskriver", () => {
    const [fuld, toTimer, kvinde, seks] = PROMILLE_EKSEAMPLER;
    expect(fuld.promille).toBe(0.88);
    expect(fuld.timerTilGraenseDa).toBe(2.6);
    expect(fuld.timerTilGraenseSe).toBe(4.6);
    expect(fuld.timerTilNul).toBe(5.9);
    expect(toTimer.promille).toBe(0.58);
    expect(toTimer.timerTilGraenseDa).toBe(0.6);
    expect(toTimer.timerTilGraenseSe).toBe(2.6);
    expect(kvinde.promille).toBe(0.73);
    expect(kvinde.timerTilGraenseDa).toBe(1.6);
    expect(kvinde.timerTilGraenseSe).toBe(3.6);
    expect(seks.promille).toBe(1.51);
    expect(seks.timerTilGraenseDa).toBe(6.8);
    expect(seks.timerTilGraenseSe).toBe(8.8);
    expect(seks.timerTilNul).toBe(10.1);
  });

  test("hver række bærer en bemærkning på begge sprog", () => {
    for (const r of PROMILLE_EKSEAMPLER) {
      expect(r.bemaerkning.da.length).toBeGreaterThan(20);
      expect(r.bemaerkning.se.length).toBeGreaterThan(20);
      expect(r.bemaerkning.da).not.toBe(r.bemaerkning.se);
    }
  });

  test("ingen dansk tekst kan lække til svensk, og omvendt", () => {
    const danskeOrd = ["genstande", "hvor", "timer", "ud", "du er", "køre", "højere", "danske", "helt ædru"];
    const svenskaOrd = ["standardglas", "hur", "timmar", "du är", "köra", "högre", "svenska", "helt nykter"];
    for (const r of PROMILLE_EKSEAMPLER) {
      for (const ord of danskeOrd) expect(r.bemaerkning.se).not.toContain(ord);
      for (const ord of svenskaOrd) expect(r.bemaerkning.da).not.toContain(ord);
    }
  });

  test("den svenske grænse giver altid længere tid end den danske", () => {
    for (const r of PROMILLE_EKSEAMPLER) {
      expect(r.timerTilGraenseSe).toBeGreaterThanOrEqual(r.timerTilGraenseDa);
      expect(r.timerTilGraenseDa).toBeLessThanOrEqual(r.timerTilNul);
      expect(r.timerTilGraenseSe).toBeLessThanOrEqual(r.timerTilNul);
    }
  });
});

describe("formatering", () => {
  test("promille og timer bruger komma i begge sprog", () => {
    expect(formatPromille(0.88)).toBe("0,88");
    expect(formatPromille(1)).toBe("1,00");
    expect(formatTimer(2.6, "da")).toBe("2,6 timer");
    expect(formatTimer(2.6, "se")).toBe("2,6 timmar");
  });

  test("timer bruger ental ved 1", () => {
    expect(formatTimer(1, "da")).toBe("1,0 time");
    expect(formatTimer(1, "se")).toBe("1,0 timme");
  });

  test("genstande og gram", () => {
    expect(formatGenstande(4, "da")).toEqual({ antal: "4", enhed: "genstande" });
    expect(formatGenstande(4, "se")).toEqual({ antal: "4", enhed: "standardglas" });
    expect(formatGram(4)).toBe("48 g");
  });
});

describe("grænsen kommer fra domænet, ikke fra modulet", () => {
  test("PROMILLEGRANSE matcher lovene i Danmark, Sverige og Norge", () => {
    expect(PROMILLEGRANSE.da).toBe(0.5);
    expect(PROMILLEGRANSE.se).toBe(0.2);
    expect(PROMILLEGRANSE.no).toBe(0.2);
  });

  test("timerTilGraense ruller op, aldrig ned", () => {
    // 0,64 − 0,5 = 0,14 -> 0,14 / 0,15 = 0,933 t, rundet OP til 1,0 time
    expect(timerTilGraense(0.64, 0.5)).toBe(1);
    expect(timerTilGraense(0.5, 0.5)).toBe(0);
    expect(timerTilGraense(0.4, 0.5)).toBe(0);
  });
});
