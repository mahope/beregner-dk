import { describe, expect, test } from "vitest";
import {
  MADVARER,
  MADVARER_KILDE,
  gramForKulhydrat,
  kulhydratEksempler,
  kulhydratIgram,
  kulhydratPer100Kcal,
  kulhydratRangliste,
  kulhydratTal,
  madvareMedNavn,
} from "./kulhydrater-i-madvarer";

const banan = madvareMedNavn("Banan")!;
const kartoffel = madvareMedNavn("Kartoffel, kogt")!;

describe("kulhydratIgram", () => {
  test("100 g giver nøjagtig tabellens kulhydrat pr. 100 g", () => {
    expect(kulhydratIgram(banan, 100)).toBe(banan.kulhydrat100g);
    expect(kulhydratIgram(kartoffel, 100)).toBe(kartoffel.kulhydrat100g);
  });

  test("skalerer lineært og runder ikke", () => {
    expect(kulhydratIgram(banan, 50)).toBeCloseTo(banan.kulhydrat100g / 2, 10);
    expect(kulhydratIgram(kartoffel, 150)).toBeCloseTo(kartoffel.kulhydrat100g * 1.5, 10);
  });

  test("negativt, nul og ikke-tal giver 0", () => {
    expect(kulhydratIgram(banan, 0)).toBe(0);
    expect(kulhydratIgram(banan, -50)).toBe(0);
    expect(kulhydratIgram(banan, Number.NaN)).toBe(0);
    expect(kulhydratIgram(banan, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("gramForKulhydrat", () => {
  test("den mængde der giver målet, giver målet tilbage", () => {
    const gram = gramForKulhydrat(kartoffel, 50);
    expect(kulhydratIgram(kartoffel, gram)).toBeCloseTo(50, 10);
  });

  test("en madvare uden kulhydrat giver 0, ikke uendeligt", () => {
    const olie = madvareMedNavn("Olivenolie")!;
    expect(olie.kulhydrat100g).toBe(0);
    expect(gramForKulhydrat(olie, 50)).toBe(0);
  });

  test("negativt eller ikke-tal som mål giver 0", () => {
    expect(gramForKulhydrat(kartoffel, 0)).toBe(0);
    expect(gramForKulhydrat(kartoffel, -5)).toBe(0);
    expect(gramForKulhydrat(kartoffel, Number.NaN)).toBe(0);
  });
});

describe("kulhydratPer100Kcal", () => {
  test("sukker giver mere kulhydrat pr. 100 kcal end chokolade, fordi chokolade også er fedt", () => {
    const sukker = madvareMedNavn("Sukker")!;
    const chokolade = madvareMedNavn("Chokolade, mælke")!;
    expect(kulhydratPer100Kcal(sukker)).toBeGreaterThan(kulhydratPer100Kcal(chokolade));
  });

  test("en madvare uden kalorier giver 0", () => {
    const nul = { ...banan, kcal100g: 0 };
    expect(kulhydratPer100Kcal(nul)).toBe(0);
  });
});

describe("kulhydratRangliste", () => {
  test("er sorteret faldende og indeholder alle madvarer", () => {
    const liste = kulhydratRangliste();
    expect(liste).toHaveLength(MADVARER.length);
    for (let i = 1; i < liste.length; i++) {
      expect(liste[i - 1].kulhydrat100g).toBeGreaterThanOrEqual(liste[i].kulhydrat100g);
    }
  });

  test("rører ikke den oprindelige tabel", () => {
    const forste = MADVARER[0];
    kulhydratRangliste();
    expect(MADVARER[0]).toBe(forste);
  });
});

describe("kulhydratEksempler", () => {
  test("finder alle de opslag danskerne gør, med kulhydrat over 0", () => {
    const eksempler = kulhydratEksempler();
    expect(eksempler).toHaveLength(6);
    for (const madvare of eksempler) {
      expect(madvare.kulhydrat100g).toBeGreaterThan(0);
    }
  });

  test("banan og kartoffel er blandt eksemplerne og har tabellens tal", () => {
    const eksempler = kulhydratEksempler();
    expect(eksempler).toContain(banan);
    expect(eksempler).toContain(kartoffel);
  });
});

describe("kulhydratTal", () => {
  test("skriver dansk decimaltall", () => {
    expect(kulhydratTal(22.8, 1)).toBe("22,8");
    expect(kulhydratTal(48.3, 1)).toBe("48,3");
  });
});

describe("kilden", () => {
  test("peger på USDA FoodData Central, samme datasæt som /kalorier", () => {
    expect(MADVARER_KILDE.database).toBe("USDA FoodData Central");
    expect(MADVARER_KILDE.dataset).toBe("SR Legacy");
  });
});
