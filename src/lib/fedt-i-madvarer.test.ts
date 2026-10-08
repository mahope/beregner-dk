import { describe, expect, test } from "vitest";
import {
  MADVARER,
  MADVARER_KILDE,
  fedtEksempler,
  fedtIgram,
  fedtPer100Kcal,
  fedtRangliste,
  fedtTal,
  gramForFedt,
  madvareMedNavn,
} from "./fedt-i-madvarer";

const aeg = madvareMedNavn("Æg, helt, råt")!;
const avocado = madvareMedNavn("Avocado")!;
const sukker = madvareMedNavn("Sukker")!;
const olie = madvareMedNavn("Olivenolie")!;

describe("fedtIgram", () => {
  test("100 g giver nøjagtig tabellens fedt pr. 100 g", () => {
    expect(fedtIgram(aeg, 100)).toBe(aeg.fedt100g);
    expect(fedtIgram(avocado, 100)).toBe(avocado.fedt100g);
  });

  test("skalerer lineært og runder ikke", () => {
    expect(fedtIgram(aeg, 50)).toBeCloseTo(aeg.fedt100g / 2, 10);
    expect(fedtIgram(avocado, 150)).toBeCloseTo(avocado.fedt100g * 1.5, 10);
  });

  test("negativt, nul og ikke-tal giver 0", () => {
    expect(fedtIgram(aeg, 0)).toBe(0);
    expect(fedtIgram(aeg, -50)).toBe(0);
    expect(fedtIgram(aeg, Number.NaN)).toBe(0);
    expect(fedtIgram(aeg, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("gramForFedt", () => {
  test("den mængde der giver målet, giver målet tilbage", () => {
    const gram = gramForFedt(avocado, 20);
    expect(fedtIgram(avocado, gram)).toBeCloseTo(20, 10);
  });

  test("en madvare uden fedt giver 0, ikke uendeligt", () => {
    expect(sukker.fedt100g).toBe(0);
    expect(gramForFedt(sukker, 20)).toBe(0);
  });

  test("negativt eller ikke-tal som mål giver 0", () => {
    expect(gramForFedt(avocado, 0)).toBe(0);
    expect(gramForFedt(avocado, -5)).toBe(0);
    expect(gramForFedt(avocado, Number.NaN)).toBe(0);
  });
});

describe("fedtPer100Kcal", () => {
  test("ren olie giver mere fedt pr. 100 kcal end avocado, som også er kulhydrat", () => {
    expect(fedtPer100Kcal(olie)).toBeGreaterThan(fedtPer100Kcal(avocado));
  });

  test("en madvare uden kalorier giver 0", () => {
    const nul = { ...aeg, kcal100g: 0 };
    expect(fedtPer100Kcal(nul)).toBe(0);
  });
});

describe("fedtRangliste", () => {
  test("er sorteret faldende og indeholder alle madvarer", () => {
    const liste = fedtRangliste();
    expect(liste).toHaveLength(MADVARER.length);
    for (let i = 1; i < liste.length; i++) {
      expect(liste[i - 1].fedt100g).toBeGreaterThanOrEqual(liste[i].fedt100g);
    }
  });

  test("rører ikke den oprindelige tabel", () => {
    const forste = MADVARER[0];
    fedtRangliste();
    expect(MADVARER[0]).toBe(forste);
  });
});

describe("fedtEksempler", () => {
  test("finder alle de opslag danskerne gør, med fedt over 0", () => {
    const eksempler = fedtEksempler();
    expect(eksempler).toHaveLength(6);
    for (const madvare of eksempler) {
      expect(madvare.fedt100g).toBeGreaterThan(0);
    }
  });

  test("æg og avocado er blandt eksemplerne og har tabellens tal", () => {
    const eksempler = fedtEksempler();
    expect(eksempler).toContain(aeg);
    expect(eksempler).toContain(avocado);
  });
});

describe("fedtTal", () => {
  test("skriver dansk decimaltall", () => {
    expect(fedtTal(9.5, 1)).toBe("9,5");
    expect(fedtTal(81.1, 1)).toBe("81,1");
  });
});

describe("kilden", () => {
  test("peger på USDA FoodData Central, samme datasæt som /kalorier", () => {
    expect(MADVARER_KILDE.database).toBe("USDA FoodData Central");
    expect(MADVARER_KILDE.dataset).toBe("SR Legacy");
  });
});
