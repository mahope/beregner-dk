import { describe, expect, test } from "vitest";
import {
  MADVARER,
  MADVARER_KILDE,
  gramForProtein,
  madvareMedNavn,
  proteinEksempler,
  proteinIgram,
  proteinPer100Kcal,
  proteinRangliste,
  proteinTal,
} from "./protein-i-madvarer";

const aeg = madvareMedNavn("Æg, helt, råt")!;
const kylling = madvareMedNavn("Kylling, hel")!;

describe("proteinIgram", () => {
  test("100 g giver nøjagtig tabellens protein pr. 100 g", () => {
    expect(proteinIgram(aeg, 100)).toBe(aeg.protein100g);
    expect(proteinIgram(kylling, 100)).toBe(kylling.protein100g);
  });

  test("skalerer lineært og runder ikke", () => {
    expect(proteinIgram(aeg, 50)).toBeCloseTo(aeg.protein100g / 2, 10);
    expect(proteinIgram(kylling, 150)).toBeCloseTo(kylling.protein100g * 1.5, 10);
  });

  test("negativt, nul og ikke-tal giver 0", () => {
    expect(proteinIgram(aeg, 0)).toBe(0);
    expect(proteinIgram(aeg, -50)).toBe(0);
    expect(proteinIgram(aeg, Number.NaN)).toBe(0);
    expect(proteinIgram(aeg, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("gramForProtein", () => {
  test("den mængde der giver målet, giver målet tilbage", () => {
    const gram = gramForProtein(kylling, 20);
    expect(proteinIgram(kylling, gram)).toBeCloseTo(20, 10);
  });

  test("en madvare uden protein giver 0, ikke uendeligt", () => {
    const vand = { ...aeg, protein100g: 0 };
    expect(gramForProtein(vand, 20)).toBe(0);
  });

  test("negativt eller ikke-tal som mål giver 0", () => {
    expect(gramForProtein(kylling, 0)).toBe(0);
    expect(gramForProtein(kylling, -5)).toBe(0);
    expect(gramForProtein(kylling, Number.NaN)).toBe(0);
  });
});

describe("proteinPer100Kcal", () => {
  test("hytteost er mere proteintæt end gouda, selv om gouda har mere pr. 100 g", () => {
    const hytteost = madvareMedNavn("Hytteost")!;
    const gouda = madvareMedNavn("Gouda")!;
    expect(gouda.protein100g).toBeGreaterThan(hytteost.protein100g);
    expect(proteinPer100Kcal(hytteost)).toBeGreaterThan(proteinPer100Kcal(gouda));
  });

  test("en madvare uden kalorier giver 0", () => {
    const nul = { ...aeg, kcal100g: 0 };
    expect(proteinPer100Kcal(nul)).toBe(0);
  });
});

describe("proteinRangliste", () => {
  test("er sorteret faldende og indeholder alle madvarer", () => {
    const liste = proteinRangliste();
    expect(liste).toHaveLength(MADVARER.length);
    for (let i = 1; i < liste.length; i++) {
      expect(liste[i - 1].protein100g).toBeGreaterThanOrEqual(liste[i].protein100g);
    }
  });

  test("rører ikke den oprindelige tabel", () => {
    const forste = MADVARER[0];
    proteinRangliste();
    expect(MADVARER[0]).toBe(forste);
  });
});

describe("proteinEksempler", () => {
  test("finder alle de opslag danskerne gør, med protein over 0", () => {
    const eksempler = proteinEksempler();
    expect(eksempler).toHaveLength(6);
    for (const madvare of eksempler) {
      expect(madvare.protein100g).toBeGreaterThan(0);
    }
  });

  test("æg og kylling er blandt eksemplerne og har tabellens tal", () => {
    const eksempler = proteinEksempler();
    expect(eksempler).toContain(aeg);
    expect(eksempler).toContain(kylling);
  });
});

describe("proteinTal", () => {
  test("skriver dansk decimaltall", () => {
    expect(proteinTal(12.6, 1)).toBe("12,6");
    expect(proteinTal(21.4, 1)).toBe("21,4");
  });
});

describe("kilden", () => {
  test("peger på USDA FoodData Central, samme datasæt som /kalorier", () => {
    expect(MADVARER_KILDE.database).toBe("USDA FoodData Central");
    expect(MADVARER_KILDE.dataset).toBe("SR Legacy");
  });
});
