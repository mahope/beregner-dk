import { describe, expect, test } from "vitest";
import {
  MAX_MAAL_M,
  MIN_MAAL_M,
  RETVINKLET_EKSEMPEL,
  RETVINKLET_FELT,
  RETVINKLET_FORMEL,
  loesRetvinklet,
  pythagoras,
} from "./retvinklet-trekant";

/**
 * Porten dømmer på **tal**, ikke på at der står «m» i markup'en. Hver side er
 * derfor dømt mod en kendt pythagoræisk triple, hvor en glemt kvadratrod eller
 * et glemt kvadrat giver et *andet* tal:
 *
 * | kendt                 | forventet |
 * |-----------------------|-----------|
 * | a = 3, b = 4          | c = 5     |
 * | a = 5, b = 12         | c = 13    |
 * | a = 8, b = 15         | c = 17    |
 * | a = 1, b = 1          | c = √2    |
 */

describe("loesRetvinklet — to kateter giver hypotenusen", () => {
  test("3-4-5", () => {
    const svar = loesRetvinklet({ a: 3, b: 4 })!;
    expect(svar.c).toBeCloseTo(5, 9);
    expect(svar.udregnet).toBe("c");
  });

  test("5-12-13", () => {
    expect(loesRetvinklet({ a: 5, b: 12 })!.c).toBeCloseTo(13, 9);
  });

  test("8-15-17", () => {
    expect(loesRetvinklet({ a: 8, b: 15 })!.c).toBeCloseTo(17, 9);
  });

  test("en ligebenet retvinklet trekant: 1-1-√2", () => {
    const svar = loesRetvinklet({ a: 1, b: 1 })!;
    expect(svar.c).toBeCloseTo(Math.SQRT2, 9);
  });

  test("rækkefølgen af a og b betyder ikke noget for hypotenusen", () => {
    expect(loesRetvinklet({ a: 4, b: 3 })!.c).toBeCloseTo(5, 9);
  });
});

describe("loesRetvinklet — katete og hypotenuse giver den anden katete", () => {
  test("a = 3, c = 5 giver b = 4", () => {
    const svar = loesRetvinklet({ a: 3, c: 5 })!;
    expect(svar.b).toBeCloseTo(4, 9);
    expect(svar.udregnet).toBe("b");
  });

  test("b = 4, c = 5 giver a = 3", () => {
    const svar = loesRetvinklet({ b: 4, c: 5 })!;
    expect(svar.a).toBeCloseTo(3, 9);
    expect(svar.udregnet).toBe("a");
  });

  test("5-12-13 den anden vej: c = 13, b = 12 giver a = 5", () => {
    expect(loesRetvinklet({ b: 12, c: 13 })!.a).toBeCloseTo(5, 9);
  });
});

describe("loesRetvinklet — areal, omkreds og vinkler", () => {
  test("3-4-5: areal 6, omkreds 12", () => {
    const svar = loesRetvinklet({ a: 3, b: 4 })!;
    expect(svar.areal).toBeCloseTo(6, 9);
    expect(svar.omkreds).toBeCloseTo(12, 9);
  });

  test("3-4-5: den rette vinkel og de to spidse vinkler", () => {
    const svar = loesRetvinklet({ a: 3, b: 4 })!;
    expect(svar.vinkelC).toBe(90);
    expect(svar.vinkelA).toBeCloseTo(36.8699, 3);
    expect(svar.vinkelB).toBeCloseTo(53.1301, 3);
    expect(svar.vinkelA + svar.vinkelB).toBeCloseTo(90, 9);
  });

  test("den ligebenede har to vinkler på 45 grader", () => {
    const svar = loesRetvinklet({ a: 1, b: 1 })!;
    expect(svar.vinkelA).toBeCloseTo(45, 9);
    expect(svar.vinkelB).toBeCloseTo(45, 9);
  });

  test("areal og omkreds regnes af de sider, der blev fundet — ikke af inputtet", () => {
    const svar = loesRetvinklet({ a: 3, c: 5 })!;
    expect(svar.b).toBeCloseTo(4, 9);
    expect(svar.areal).toBeCloseTo(6, 9);
    expect(svar.omkreds).toBeCloseTo(12, 9);
  });
});

describe("loesRetvinklet — tre sider og umulige trekanter", () => {
  test("alle tre sider der passer med Pythagoras accepteres", () => {
    const svar = loesRetvinklet({ a: 3, b: 4, c: 5 })!;
    expect(svar.c).toBeCloseTo(5, 9);
  });

  test("tre sider der ikke passer kaster, så et forkert svar ikke vises", () => {
    expect(() => loesRetvinklet({ a: 3, b: 4, c: 6 })).toThrow(/Pythagoras/);
  });

  test("en hypotenuse der ikke er længst kaster", () => {
    expect(() => loesRetvinklet({ a: 5, c: 3 })).toThrow(/længere/);
    expect(() => loesRetvinklet({ b: 5, c: 5 })).toThrow(/længere/);
  });

  test("færre end to sider giver undefined, ikke NaN eller 0", () => {
    expect(loesRetvinklet({})).toBeUndefined();
    expect(loesRetvinklet({ a: 3 })).toBeUndefined();
    expect(loesRetvinklet({ c: 5 })).toBeUndefined();
  });

  test("en side uden for grænserne afvises", () => {
    expect(() => loesRetvinklet({ a: MIN_MAAL_M / 2, b: 4 })).toThrow();
    expect(() => loesRetvinklet({ a: 3, b: MAX_MAAL_M * 2 })).toThrow();
    expect(() => loesRetvinklet({ a: Number.NaN, b: 4 })).toThrow();
  });

  test("grænsen selv er gyldig", () => {
    expect(loesRetvinklet({ a: MIN_MAAL_M, b: MIN_MAAL_M })!.c).toBeGreaterThan(0);
    expect(loesRetvinklet({ a: MAX_MAAL_M, b: MAX_MAAL_M })!.c).toBeCloseTo(
      MAX_MAAL_M * Math.SQRT2,
      9
    );
  });
});

describe("regnestykket", () => {
  test("3-4-5 viser kvadraterne og kvadratroden", () => {
    expect(loesRetvinklet({ a: 3, b: 4 })!.regnestykke).toBe("3² + 4² = 25, √25 = 5");
  });

  test("a og c viser en subtraktion", () => {
    expect(loesRetvinklet({ a: 3, c: 5 })!.regnestykke).toBe("5² − 3² = 16, √16 = 4");
  });

  test("der står ikke `Math`, `**` eller `undefined` i regnestykket", () => {
    for (const input of [{ a: 3, b: 4 }, { a: 3, c: 5 }, { b: 12, c: 13 }]) {
      expect(loesRetvinklet(input)!.regnestykke).not.toMatch(/Math\.|\*\*|undefined|NaN/);
    }
  });
});

describe("pythagoras og formler", () => {
  test("pythagoras er hypotenusen af to kateter", () => {
    expect(pythagoras(3, 4)).toBeCloseTo(5, 9);
    expect(pythagoras(5, 12)).toBeCloseTo(13, 9);
  });

  test("alle formler er brødtekst uden Math eller programmeringssyntaks", () => {
    for (const [navn, formel] of Object.entries(RETVINKLET_FORMEL)) {
      expect(formel, navn).toMatch(/[=²√×÷−+]/);
      expect(formel, navn).not.toMatch(/Math\.|\*\*|undefined/);
    }
  });
});

describe("felter og eksempel", () => {
  test("de tre felter er katete a, katete b og hypotenuse c — i den rækkefølge", () => {
    expect(RETVINKLET_FELT.map((f) => f.nogle)).toEqual(["a", "b", "c"]);
  });

  test("hypotenusen er mærket som den længste side", () => {
    const hypotenuse = RETVINKLET_FELT.find((f) => f.nogle === "c")!;
    expect(hypotenuse.da).toMatch(/hypotenuse/i);
    expect(hypotenuse.hjaelpDa).toMatch(/længste/i);
    expect(hypotenuse.hjaelpSe).toMatch(/längsta/i);
  });

  test("alle felter har en dansk og en svensk etiket og hjælpetekst", () => {
    for (const felt of RETVINKLET_FELT) {
      expect(felt.da.length, felt.nogle).toBeGreaterThan(0);
      expect(felt.se.length, felt.nogle).toBeGreaterThan(0);
      expect(felt.hjaelpDa.length, felt.nogle).toBeGreaterThan(0);
      expect(felt.hjaelpSe.length, felt.nogle).toBeGreaterThan(0);
    }
  });

  test("eksemplet er den 3-4-5-trekant, siden viser", () => {
    const svar = loesRetvinklet(RETVINKLET_EKSEMPEL.input)!;
    expect(svar.c).toBeCloseTo(RETVINKLET_EKSEMPEL.svar.c, 9);
    expect(RETVINKLET_EKSEMPEL.svar.c).toBeCloseTo(5, 9);
    expect(RETVINKLET_EKSEMPEL.svar.areal).toBeCloseTo(6, 9);
  });
});
