import { describe, expect, test } from "vitest";
import {
  MADVARER,
  MADVARER_KILDE,
  SUKKER_MADVARER,
  SUKKER_UDEN_KILDE_NAVN,
  gramForSukker,
  madvareMedNavn,
  sukkerEksempler,
  sukkerIgram,
  sukkerPer100Kcal,
  sukkerRangliste,
  sukkerTal,
  sukkerVareMedNavn,
} from "./sukker-i-madvarer";

const banan = sukkerVareMedNavn("Banan")!;
const aeble = sukkerVareMedNavn("Æble")!;
const kylling = sukkerVareMedNavn("Kylling, hel")!;
const chokolade = sukkerVareMedNavn("Chokolade, mælke")!;
const vandmelon = sukkerVareMedNavn("Vandmelon")!;

describe("sukkerIgram", () => {
  test("100 g giver nøjagtig tabellens sukker pr. 100 g", () => {
    expect(sukkerIgram(banan, 100)).toBe(banan.sukker100g);
    expect(sukkerIgram(aeble, 100)).toBe(aeble.sukker100g);
  });

  test("skalerer lineært og runder ikke", () => {
    expect(sukkerIgram(banan, 50)).toBeCloseTo(banan.sukker100g / 2, 10);
    expect(sukkerIgram(banan, 150)).toBeCloseTo(banan.sukker100g * 1.5, 10);
  });

  test("negativt, nul og ikke-tal giver 0", () => {
    expect(sukkerIgram(banan, 0)).toBe(0);
    expect(sukkerIgram(banan, -50)).toBe(0);
    expect(sukkerIgram(banan, Number.NaN)).toBe(0);
    expect(sukkerIgram(banan, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("gramForSukker", () => {
  test("den mængde der giver målet, giver målet tilbage", () => {
    const gram = gramForSukker(banan, 20);
    expect(sukkerIgram(banan, gram)).toBeCloseTo(20, 10);
  });

  test("en madvare uden sukker giver 0, ikke uendeligt", () => {
    expect(kylling.sukker100g).toBe(0);
    expect(gramForSukker(kylling, 20)).toBe(0);
  });

  test("negativt eller ikke-tal som mål giver 0", () => {
    expect(gramForSukker(banan, 0)).toBe(0);
    expect(gramForSukker(banan, -5)).toBe(0);
    expect(gramForSukker(banan, Number.NaN)).toBe(0);
  });
});

describe("sukkerPer100Kcal", () => {
  test("chokoladens energi kommer mest fra fedt, så vandmelon har mere sukker pr. 100 kcal", () => {
    // Chokolade har 51,5 g sukker pr. 100 g mod vandmelons 6,2 g — men
    // chokoladen har også 535 kcal mod vandmelons 30, så pr. 100 kcal vender
    // forholdet. Det er netop det, kolonnen skal vise.
    expect(sukkerPer100Kcal(vandmelon)).toBeGreaterThan(
      sukkerPer100Kcal(chokolade)
    );
  });

  test("ren sukker har mere sukker pr. 100 kcal end olivenolie", () => {
    expect(sukkerPer100Kcal(sukkerVareMedNavn("Sukker")!)).toBeGreaterThan(
      sukkerPer100Kcal(sukkerVareMedNavn("Olivenolie")!)
    );
  });

  test("en madvare uden kalorier giver 0", () => {
    const nul = { ...banan, kcal100g: 0 };
    expect(sukkerPer100Kcal(nul)).toBe(0);
  });
});

describe("sukkerRangliste", () => {
  test("er sorteret faldende og indeholder alle madvarer med sukker", () => {
    const liste = sukkerRangliste();
    expect(liste).toHaveLength(SUKKER_MADVARER.length);
    for (let i = 1; i < liste.length; i++) {
      expect(liste[i - 1].sukker100g).toBeGreaterThanOrEqual(
        liste[i].sukker100g
      );
    }
  });

  test("sukker står øverst og kød nederst", () => {
    const liste = sukkerRangliste();
    expect(liste[0].navn).toBe("Sukker");
    expect(liste[liste.length - 1].sukker100g).toBe(0);
  });

  test("rører ikke den oprindelige tabel", () => {
    const forste = SUKKER_MADVARER[0];
    sukkerRangliste();
    expect(SUKKER_MADVARER[0]).toBe(forste);
  });
});

describe("sukkerEksempler", () => {
  test("finder de opslag danskerne gør", () => {
    expect(sukkerEksempler()).toHaveLength(6);
  });

  test("banan og æble er blandt eksemplerne og har tabellens tal", () => {
    const eksempler = sukkerEksempler();
    expect(eksempler).toContain(banan);
    expect(eksempler).toContain(aeble);
  });
});

describe("dataenes oprindelse", () => {
  test("hver sukkerrække findes i kaloriernes egen tabel", () => {
    const fdcIds = new Set(MADVARER.map((m) => m.fdcId));
    for (const madvare of SUKKER_MADVARER) {
      expect(fdcIds.has(madvare.fdcId)).toBe(true);
      expect(Number.isFinite(madvare.sukker100g)).toBe(true);
      expect(madvare.sukker100g).toBeGreaterThanOrEqual(0);
    }
  });

  test("havregryn er udeladt, fordi kilden ikke opgiver sukker for den", () => {
    expect(
      SUKKER_MADVARER.some((m) => m.navn === SUKKER_UDEN_KILDE_NAVN)
    ).toBe(false);
    expect(madvareMedNavn(SUKKER_UDEN_KILDE_NAVN)).toBeDefined();
    expect(SUKKER_MADVARER.length).toBe(MADVARER.length - 1);
  });

  test("i frugt og grønt er sukkerindholdet en del af kulhydrattallet", () => {
    // Madvarer hvor sukker indgår i kulhydrattallet i kilden. Mælkesukker
    // (laktose) er undtaget, fordi USDA opgiver kulhydrat «by difference».
    for (const navn of ["Banan", "Æble", "Vindrue", "Jordbær", "Gulerod"]) {
      const m = sukkerVareMedNavn(navn)!;
      expect(m.sukker100g).toBeLessThan(m.kulhydrat100g);
    }
  });

  test("peger på USDA FoodData Central, samme datasæt som /kalorier", () => {
    expect(MADVARER_KILDE.database).toBe("USDA FoodData Central");
    expect(MADVARER_KILDE.dataset).toBe("SR Legacy");
  });
});

describe("sukkerTal", () => {
  test("skriver dansk decimaltall", () => {
    expect(sukkerTal(12.23, 1)).toBe("12,2");
    expect(sukkerTal(65.7, 1)).toBe("65,7");
    expect(sukkerTal(0, 1)).toBe("0");
  });
});
