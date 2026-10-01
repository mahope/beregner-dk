import { describe, expect, test } from "vitest";
import {
  PROCENTPOINT_EKSEMPEL,
  PROCENTPOINT_START,
  procentpointForskel,
  procentpointRelativ,
  procentpointRetning,
} from "./procentpoint";

describe("procentpointForskel", () => {
  test("er den absolutte forskel mellem to procenttal", () => {
    expect(procentpointForskel(2, 3)).toBe(1);
    expect(procentpointForskel(4.8, 6.4)).toBeCloseTo(1.6, 10);
  });

  test("et fald er negativt", () => {
    expect(procentpointForskel(3, 2)).toBe(-1);
  });

  test("ingen ændring er 0 procentpoint", () => {
    expect(procentpointForskel(1.75, 1.75)).toBe(0);
  });

  test("et procenttal på 0 er gyldigt: 0 til 2,5 er 2,5 procentpoint", () => {
    expect(procentpointForskel(0, 2.5)).toBe(2.5);
  });
});

describe("procentpointRelativ", () => {
  test("2 % til 3 % er 1 procentpoint men 50 procent", () => {
    expect(procentpointForskel(2, 3)).toBe(1);
    expect(procentpointRelativ(2, 3)).toBe(50);
  });

  test("point forskellen er den samme, den relative ændring er ikke", () => {
    // Ét procentpoint betyder 5 % hævet på 20, men 50 % hævet på 2.
    expect(procentpointForskel(20, 21)).toBe(1);
    expect(procentpointRelativ(20, 21)).toBe(5);
    expect(procentpointForskel(2, 3)).toBe(1);
    expect(procentpointRelativ(2, 3)).toBe(50);
  });

  test("et procenttal på 0 kan ikke være heltal, så der kommer intet svar", () => {
    expect(procentpointRelativ(0, 2.5)).toBe(0);
  });
});

describe("procentpointRetning", () => {
  const ord = { stigning: "stigning", fald: "fald", uændret: "uændret" };

  test("et højere tal er en stigning", () => {
    expect(procentpointRetning(2, 3, ord)).toBe("stigning");
  });

  test("et lavere tal er et fald", () => {
    expect(procentpointRetning(3, 2, ord)).toBe("fald");
  });

  test("det samme tal to gange er uændret", () => {
    expect(procentpointRetning(1.75, 1.75, ord)).toBe("uændret");
  });
});

describe("eksemplerne på siden", () => {
  test("renteserien består af +1 procentpoint i hvert trin", () => {
    for (const trin of PROCENTPOINT_EKSEMPEL.rente) {
      expect(procentpointForskel(trin.gammel, trin.ny)).toBe(1);
    }
  });

  test("valgserien har både en stigning på 1,6 og et fald på 2,4", () => {
    const [fald, stigning] = PROCENTPOINT_EKSEMPEL.valg;
    expect(procentpointForskel(stigning.gammel, stigning.ny)).toBeCloseTo(1.6, 10);
    expect(procentpointForskel(fald.gammel, fald.ny)).toBeCloseTo(-2.4, 10);
  });

  test("alle tal i eksemplerne er procent mellem 0 og 100", () => {
    for (const serie of Object.values(PROCENTPOINT_EKSEMPEL)) {
      for (const par of serie) {
        expect(par.gammel).toBeGreaterThanOrEqual(0);
        expect(par.gammel).toBeLessThanOrEqual(100);
        expect(par.ny).toBeGreaterThanOrEqual(0);
        expect(par.ny).toBeLessThanOrEqual(100);
      }
    }
  });

  test("værktøjet åbner med 2 % til 3 %, denklassiskeste forveksling", () => {
    expect(PROCENTPOINT_START.gammel).toBe(2);
    expect(PROCENTPOINT_START.ny).toBe(3);
  });
});
