import { describe, test, expect } from "vitest";
import { MADVARER, madvareMedNavn } from "./kalorier-madvarer";
import {
  OPSKRIFT_EKSEMPLER,
  eksempelLinjer,
  makroAndel,
  opskriftLinje,
  opskriftPrPortion,
  opskriftTotal,
} from "./opskrift-kalorier";

const linje = (navn: string, gram: number) => {
  const madvare = madvareMedNavn(navn);
  if (!madvare) throw new Error(`ukendt madvare i testen: ${navn}`);
  return { madvare, gram };
};

/** 100 g af en vare skal give præcis rækkens eget tal — ellers kan
 * værktøjet og tabellen komme til at modsige hinanden. */
test("100 g af en ingrediens giver rækkens egne tal", () => {
  for (const madvare of MADVARER) {
    const n = opskriftLinje({ madvare, gram: 100 });
    expect(n.kcal, madvare.navn).toBe(madvare.kcal100g);
    expect(n.protein, madvare.navn).toBe(madvare.protein100g);
    expect(n.fedt, madvare.navn).toBe(madvare.fedt100g);
    expect(n.kulhydrat, madvare.navn).toBe(madvare.kulhydrat100g);
  }
});

describe("opskriftLinje", () => {
  test("regner gram om til næringsstoffer", () => {
    const n = opskriftLinje(linje("Smør", 50));
    expect(n.kcal).toBeCloseTo(717 / 2, 5);
    expect(n.fedt).toBeCloseTo(81.1 / 2, 5);
  });

  test("nul, negative tal og ikke-tal giver nul", () => {
    for (const gram of [0, -100, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(opskriftLinje(linje("Smør", gram)).kcal, String(gram)).toBe(0);
    }
  });
});

describe("opskriftTotal", () => {
  test("summerer alle ingredienser", () => {
    const total = opskriftTotal([linje("Nudler, tørrede", 320), linje("Skinke", 80)]);
    // 362 kcal/100 g → 1.158,4 kcal; 178 kcal/100 g → 142,4 kcal
    expect(total.kcal).toBeCloseTo(362 * 3.2 + 178 * 0.8, 5);
  });

  test("en tom opskrift giver nul", () => {
    expect(opskriftTotal([])).toEqual({ kcal: 0, protein: 0, fedt: 0, kulhydrat: 0 });
  });

  test("en ingrediens der tælles to gange tælles to gange", () => {
    const to = opskriftTotal([linje("Smør", 100), linje("Smør", 100)]);
    expect(to.kcal).toBeCloseTo(717 * 2, 5);
  });
});

describe("opskriftPrPortion", () => {
  const linjer = [linje("Nudler, tørrede", 400), linje("Gouda", 100)];

  test("deler totalen på antallet af portioner", () => {
    const prPortion = opskriftPrPortion(linjer, 4)!;
    expect(prPortion.kcal).toBeCloseTo((362 * 4 + 356) / 4, 5);
    expect(prPortion.protein).toBeCloseTo((13.5 * 4 + 24.9) / 4, 5);
  });

  test("en portion give hele retten", () => {
    expect(opskriftPrPortion(linjer, 1)!.kcal).toBeCloseTo(opskriftTotal(linjer).kcal, 5);
  });

  test("under én portion findes svaret ikke — hellere ingen værdi end nul", () => {
    // En ret til ingen personer kan ikke deles. Et svar på 0 kcal ville påstå,
    // at portionen er gratis; derfor gives intet svar.
    for (const portioner of [0, -2, Number.NaN]) {
      expect(opskriftPrPortion(linjer, portioner), String(portioner)).toBeNull();
    }
    expect(opskriftTotal(linjer).kcal).toBeGreaterThan(0);
  });

  test("halve portioner er tilladt", () => {
    expect(opskriftPrPortion(linjer, 0.5)).toBeNull();
    expect(opskriftPrPortion(linjer, 1.5)!.kcal).toBeCloseTo((362 * 4 + 356) / 1.5, 5);
  });
});

describe("makroAndel", () => {
  test("ren fedt giver 100 % af energien fra fedt", () => {
    const andel = makroAndel({ kcal: 900, protein: 0, fedt: 100, kulhydrat: 0 });
    expect(andel.fedt).toBeCloseTo(100, 5);
    expect(andel.protein).toBeCloseTo(0, 5);
    expect(andel.kulhydrat).toBeCloseTo(0, 5);
  });

  test("ren kulhydrat giver 100 % fra kulhydrat", () => {
    const andel = makroAndel({ kcal: 400, protein: 0, fedt: 0, kulhydrat: 100 });
    expect(andel.kulhydrat).toBeCloseTo(100, 5);
  });

  test("de tre andele summerer til 100", () => {
    const total = opskriftTotal(eksempelLinjer(OPSKRIFT_EKSEMPLER[0]));
    const andel = makroAndel(total);
    expect(andel.protein + andel.fedt + andel.kulhydrat).toBeCloseTo(100, 5);
  });

  test("uden energi er der ingen andele", () => {
    expect(makroAndel({ kcal: 0, protein: 0, fedt: 0, kulhydrat: 0 })).toEqual({
      protein: 0,
      fedt: 0,
      kulhydrat: 0,
    });
  });
});

describe("eksemplerne", () => {
  test("hvert eksempels ingredienser findes i tabellen", () => {
    for (const eksempel of OPSKRIFT_EKSEMPLER) {
      for (const { navn } of eksempel.ingredienser) {
        expect(madvareMedNavn(navn), `${eksempel.navn}: ${navn}`).toBeDefined();
      }
    }
  });

  test("eksempelLinjer beholdere alle rækker i rækkefølge", () => {
    const linjer = eksempelLinjer(OPSKRIFT_EKSEMPLER[0]);
    expect(linjer.map((l) => l.madvare.navn)).toEqual(
      OPSKRIFT_EKSEMPLER[0].ingredienser.map((i) => i.navn),
    );
  });

  test("carbonara-rettens kcal pr. portion er regnet ud fra tabellens egne tal", () => {
    // Nudler 362, æg 143, gouda 356, skinke 178 kcal pr. 100 g
    const forventet = (362 * 3.2 + 143 * 2 + 356 * 1 + 178 * 1.2) / 4;
    const prPortion = opskriftPrPortion(eksempelLinjer(OPSKRIFT_EKSEMPLER[0]), 4)!;
    expect(prPortion.kcal).toBeCloseTo(forventet, 5);
  });

  test("carbonara til 4 er en realistisk kerne-ret, ikke et tomt tal", () => {
    const prPortion = opskriftPrPortion(eksempelLinjer(OPSKRIFT_EKSEMPLER[0]), 4)!;
    expect(prPortion.kcal).toBeGreaterThan(400);
    expect(prPortion.kcal).toBeLessThan(700);
  });

  test("havregrød har to portioner", () => {
    expect(OPSKRIFT_EKSEMPLER[1].portioner).toBe(2);
    expect(opskriftPrPortion(eksempelLinjer(OPSKRIFT_EKSEMPLER[1]), 2)!.kcal).toBeCloseTo(
      (389 * 0.8 + 46 * 3 + 89) / 2,
      5,
    );
  });
});
