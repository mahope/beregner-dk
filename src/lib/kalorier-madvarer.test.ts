import { describe, expect, test } from "vitest";
import {
  kalorieIgram,
  MADVARE_GRUPPER,
  MADVARER,
  MADVARER_KILDE,
  madvareMedNavn,
  normaliserMadvar,
  soegMadvarer,
} from "./kalorier-madvarer";

describe("MADVARER", () => {
  // Tallene er hentet fra USDA FoodData Central, SR Legacy 2018-04. Porten
  // låser fire forskellige slags værdi: to kalorietal, en fedtandel og to
  // fødevarer der ligner hinanden. Uden den kunne en efterfølgende redigering
  // bytte "Kartoffel, kogt" og "Kartoffel, rå" uden at nogen mærkede det.
  test("værdierne er kildeførte og låst", () => {
    const aeg = madvareMedNavn("Æg, helt, råt");
    expect(aeg?.kcal100g).toBe(143);
    expect(aeg?.protein100g).toBe(12.6);
    expect(aeg?.fedt100g).toBe(9.5);

    const smor = madvareMedNavn("Smør");
    expect(smor?.kcal100g).toBe(717);
    expect(smor?.fedt100g).toBe(81.1);

    // Samme kartoffel, to tilberedningsformer: præcis den forskel, der gør
    // tabellen værd at have.
    expect(madvareMedNavn("Kartoffel, rå")?.kcal100g).toBe(77);
    expect(madvareMedNavn("Kartoffel, kogt")?.kcal100g).toBe(87);
  });

  test("hver madvar bærer sit fdc_id, så tallet kan efterprøves", () => {
    expect(MADVARER.length).toBeGreaterThanOrEqual(50);
    for (const madvare of MADVARER) {
      expect(madvare.fdcId).toBeGreaterThan(0);
      expect(madvare.kcal100g).toBeGreaterThan(0);
      expect(MADVARE_GRUPPER).toContain(madvare.gruppe);
    }
  });

  test("gruppenavne dækker alle grupper, så ingen gruppe vises tom", () => {
    const brugte = new Set(MADVARER.map((m) => m.gruppe));
    for (const gruppe of MADVARE_GRUPPER) expect(brugte.has(gruppe)).toBe(true);
  });

  test("kilden er nævnt med udgave, så tallene kan findes igen", () => {
    expect(MADVARER_KILDE.database).toContain("FoodData Central");
    expect(MADVARER_KILDE.dataset).toBe("SR Legacy");
    expect(MADVARER_KILDE.udgave).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe("kalorieIgram", () => {
  const aeg = madvareMedNavn("Æg, helt, råt")!;

  test("100 g giver præcis tabellens værdi", () => {
    expect(kalorieIgram(aeg, 100)).toBe(aeg.kcal100g);
  });

  test("60 g æg er 85,8 kcal", () => {
    expect(kalorieIgram(aeg, 60)).toBeCloseTo(85.8, 5);
  });

  test("en portion kan ikke have negativt eller ukendt indhold", () => {
    expect(kalorieIgram(aeg, 0)).toBe(0);
    expect(kalorieIgram(aeg, -50)).toBe(0);
    expect(kalorieIgram(aeg, Number.NaN)).toBe(0);
  });
});

describe("normaliserMadvar", () => {
  test("æ, ø og å bliver ae, oe og aa", () => {
    expect(normaliserMadvar("Rugbrød")).toBe("rugbroed");
    expect(normaliserMadvar("Æggeblomme")).toBe("aeggeblomme");
    expect(normaliserMadvar("Banan")).toBe("banan");
  });
});

describe("soegMadvarer", () => {
  test("et tomt felt giver hele tabellen", () => {
    expect(soegMadvarer("")).toHaveLength(MADVARER.length);
    expect(soegMadvarer("   ")).toHaveLength(MADVARER.length);
  });

  test("æg-søgningen finder æg, ikke bare madvarer der indeholder ordet", () => {
    const navne = soegMadvarer("æg").map((m) => m.navn);
    expect(navne).toContain("Æg, helt, råt");
    expect(navne).toContain("Æggeblomme");
    for (const navn of navne) expect(navn.toLowerCase()).toContain("æg");
  });

  test("søgning på ae og oe finder de samme madvarer som æ og ø", () => {
    expect(soegMadvarer("aeg")[0].navn).toBe("Æg, helt, råt");
    expect(soegMadvarer("rugbroed")[0].navn).toBe("Rugbrød");
  });

  test("et ø skrevet som o finder alligevar madvaren", () => {
    // Skrivefejlen i et søgefelt er ikke en fejl, læseren har lavet — den er
    // nødalternativet derfor for: "rugbrod" skal finde Rugbrød.
    expect(soegMadvarer("rugbrod")[0].navn).toBe("Rugbrød");
    expect(soegMadvarer("brod").map((m) => m.navn)).toContain("Rugbrød");
  });

  test("navne der begynder med søgningen kommer først", () => {
    const navne = soegMadvarer("banan").map((m) => m.navn);
    expect(navne[0]).toBe("Banan");
    expect(navne).toContain("Banan, tørret");
  });

  test("søgning på dansk griber det søgefelttet skriver", () => {
    expect(soegMadvarer("Kartoffel").map((m) => m.navn)).toContain("Kartoffel, kogt");
    expect(soegMadvarer("Havregryn").map((m) => m.navn)).toContain("Havregryn, tørrede");
  });

  test("et navn der ikke findes giver en tom liste, ikke en fejl", () => {
    expect(soegMadvarer("wok")).toEqual([]);
  });
});