import { describe, expect, it } from "vitest";
import {
  MAGNESIUM_AI_KVINDE_MG,
  MAGNESIUM_AI_MAND_MG,
  MAGNESIUM_ANBEFALING_MG,
  MAGNESIUM_AR_KVINDE_MG,
  MAGNESIUM_AR_MAND_MG,
  MAGNESIUM_EKSEMPEL_NAVNE,
  MAGNESIUM_KILDE,
  MAGNESIUM_MADVARER,
  MAGNESIUM_UL_MG,
  andelAfAnbefaling,
  gramForAnbefaling,
  magnesium100g,
  magnesiumEksempler,
  magnesiumIgram,
  magnesiumMetaBeskrivelse,
  magnesiumMetaTitel,
  magnesiumPer100Kcal,
  magnesiumRangliste,
  magnesiumTal,
  magnesiumVareMedNavn,
  soegMagnesiumvarer,
} from "./magnesium-i-madvarer";
import { MADVARER } from "./kalorier-madvarer";

const havregryn = magnesiumVareMedNavn("Havregryn, tørrede")!;
const spinat = magnesiumVareMedNavn("Spinat")!;
const banan = magnesiumVareMedNavn("Banan")!;
const rugbrod = magnesiumVareMedNavn("Rugbrød")!;
const olivenolie = magnesiumVareMedNavn("Olivenolie")!;

describe("magnesium i madvarer", () => {
  it("dækker alle madvarer i kalorietabellen med et magnesiumtal", () => {
    expect(MAGNESIUM_MADVARER.length).toBe(MADVARER.length);
    for (const vare of MAGNESIUM_MADVARER) {
      expect(Number.isFinite(vare.magnesium100g)).toBe(true);
      expect(vare.magnesium100g).toBeGreaterThanOrEqual(0);
    }
  });

  it("læser kildens magnesiumtal for havregryn, spinat, banan og rugbrød", () => {
    // USDA FoodData Central, næringsstof 1090: havregryn 177 mg, spinat
    // 79 mg, banan 27 mg og rugbrød 40 mg pr. 100 g.
    expect(havregryn.magnesium100g).toBe(177);
    expect(spinat.magnesium100g).toBe(79);
    expect(banan.magnesium100g).toBe(27);
    expect(rugbrod.magnesium100g).toBe(40);
  });

  it("giver 0 mg magnesium for en madvare uden magnesium i kilden", () => {
    expect(olivenolie.magnesium100g).toBe(0);
    expect(magnesium100g(olivenolie)).toBe(0);
    expect(magnesiumIgram(olivenolie, 100)).toBe(0);
    expect(andelAfAnbefaling(olivenolie)).toBe(0);
    expect(gramForAnbefaling(olivenolie)).toBe(0);
  });

  it("regner magnesium for en given mængde", () => {
    expect(magnesiumIgram(havregryn, 100)).toBeCloseTo(177, 4);
    expect(magnesiumIgram(havregryn, 60)).toBeCloseTo(106.2, 4);
    expect(magnesiumIgram(spinat, 100)).toBeCloseTo(79, 4);
    expect(magnesiumIgram(banan, 120)).toBeCloseTo(32.4, 4);
    expect(magnesiumIgram(havregryn, 0)).toBe(0);
    expect(magnesiumIgram(havregryn, -10)).toBe(0);
    expect(magnesiumIgram(havregryn, Number.NaN)).toBe(0);
  });

  it("regner hvor stor en del af anbefalingen 100 g dækker", () => {
    // 177 mg pr. 100 g havregryn mod 350 mg: 50,6 %.
    expect(andelAfAnbefaling(havregryn)).toBeCloseTo(50.6, 1);
    // 100 g spinat (79 mg) dækker 22,6 %.
    expect(andelAfAnbefaling(spinat)).toBeCloseTo(22.6, 1);
  });

  it("regner hvor mange gram der svarer til hele dages anbefaling", () => {
    // 100 × 350 / 177 ≈ 198 g havregryn.
    expect(gramForAnbefaling(havregryn)).toBeCloseTo(197.7, 0);
    // Mod kvinders AI 300 mg: 100 × 300 / 177 ≈ 169 g havregryn.
    expect(gramForAnbefaling(havregryn, MAGNESIUM_AI_KVINDE_MG)).toBeCloseTo(169, 0);
  });

  it("holder sig til NNR2023's anbefalinger", () => {
    expect(MAGNESIUM_AI_KVINDE_MG).toBe(300);
    expect(MAGNESIUM_AI_MAND_MG).toBe(350);
    expect(MAGNESIUM_AR_KVINDE_MG).toBe(240);
    expect(MAGNESIUM_AR_MAND_MG).toBe(280);
    expect(MAGNESIUM_UL_MG).toBe(250);
    expect(MAGNESIUM_ANBEFALING_MG).toBe(MAGNESIUM_AI_MAND_MG);
  });

  it("regner magnesium pr. 100 kcal", () => {
    // Havregryn: 177 mg pr. 389 kcal = 45,5 mg pr. 100 kcal.
    expect(magnesiumPer100Kcal(havregryn)).toBeCloseTo(45.5013, 4);
    // Spinat: 79 mg pr. 23 kcal = 343,5 mg pr. 100 kcal.
    expect(magnesiumPer100Kcal(spinat)).toBeCloseTo(343.4783, 4);
    // En madvare uden kalorier giver 0.
    expect(magnesiumPer100Kcal(olivenolie)).toBe(0);
  });

  it("sorterer mest magnesium øverst", () => {
    const top = magnesiumRangliste();
    expect(top[0].navn).toBe("Havregryn, tørrede");
    expect(top[1].navn).toBe("Bulgur, tørret");
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].magnesium100g).toBeGreaterThanOrEqual(top[i].magnesium100g);
    }
  });

  it("finder havregryn og banan på søgningen, også uden æøå", () => {
    expect(soegMagnesiumvarer("havregryn")[0].navn).toBe("Havregryn, tørrede");
    expect(soegMagnesiumvarer("rugbrod")[0].navn).toBe("Rugbrød");
    expect(soegMagnesiumvarer("banan").length).toBeGreaterThan(0);
  });

  it("har de eksempler FAQ'en læser, i rækkefølgen", () => {
    expect(magnesiumEksempler().map((m) => m.navn)).toEqual([
      ...MAGNESIUM_EKSEMPEL_NAVNE,
    ]);
  });

  it("skriver tal med dansk komma i titel og beskrivelse", () => {
    expect(magnesiumTal(177)).toBe("177");
    expect(magnesiumTal(177.5)).toBe("177,5");
    expect(magnesiumMetaTitel()).toContain("havregryn");
    expect(magnesiumMetaTitel()).toContain("spinat");
    expect(magnesiumMetaBeskrivelse()).toContain(`${MAGNESIUM_MADVARER.length} madvarer`);
  });

  it("opgiver hvilket næringsstof tallene kommer fra", () => {
    expect(MAGNESIUM_KILDE.naeringsstof).toContain("Magnesium");
    expect(MAGNESIUM_KILDE.naeringsstof).toContain("1090");
  });
});
