import { describe, expect, test } from "vitest";
import { formatNumber } from "./format";
import {
  PROCENTPOINT_EKSEMPEL,
  PROCENTPOINT_START,
  procentpointForskel,
  procentpointForskelFaqSvar,
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

// Sætningen er Googles svar på "hvad er forskellen på procentpoint og
// procent", og den er publiceret på sitets største side (152.615 visninger).
// Den skrev "-2,4 procentpoint" og "-11,3 %" på hånden: det første er
// subtraction, det andet er (19,7 - 22,1) / 22,1 = -10,86 %, altså -10,9 %
// med den regel sætningen selv angiver. -11,3 % fås af ingen af de to
// regnestykker, så sætningen modsagde sin egen regel. Porten regner begge
// tal af de samme funktioner som tabellen ovenfor, så et håndskrevet tal
// falder her.
describe("FAQ-svaret på forskellen mellem procentpoint og procent", () => {
  const talDa = (v: number) => formatNumber(v, "da", { maximumFractionDigits: 1 });
  // Ingen normalisering af U+2212: `Intl` skriver det for sv-SE, og det er
  // præcis det tabellen på /procent skriver i sin tredje kolonne, så svaret
  // skal bære samme tegn som den side det læses fra.
  const talSe = (v: number) =>
    formatNumber(v, "se", { maximumFractionDigits: 1 }).replace(/\u00a0/g, " ");

  test.each(["da", "se"] as const)(
    "de to tal i svaret er regnet, ikke skrevet i hånden (%s)",
    (locale) => {
      const [fald] = PROCENTPOINT_EKSEMPEL.valg;
      const svar = procentpointForskelFaqSvar(locale);
      const tal = locale === "se" ? talSe : talDa;

      expect(svar).toContain(`${tal(fald.gammel)} %`);
      expect(svar).toContain(`${tal(fald.ny)} %`);
      expect(svar).toContain(tal(procentpointForskel(fald.gammel, fald.ny)));
      expect(svar).toContain(`${tal(procentpointRelativ(fald.gammel, fald.ny))} %`);
    }
  );

  test("-11,3 % kan ikke længere stå i svaret", () => {
    // Bevidst: den gamle fejl, låst som en streng så den ikke kan genindføres.
    expect(procentpointForskelFaqSvar("da")).not.toContain("11,3");
    expect(procentpointForskelFaqSvar("se")).not.toContain("11,3");
  });

  test("de to sprog er hvert sit sprog", () => {
    const da = procentpointForskelFaqSvar("da");
    const se = procentpointForskelFaqSvar("se");
    expect(da).not.toBe(se);
    expect(se).toContain("procentenheter");
    expect(se).not.toContain("procentpoint");
    expect(da).not.toContain("procentenhet");
  });
});
