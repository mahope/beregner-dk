import { describe, expect, it } from "vitest";
import {
  ZINK_ANBEFALING_MG,
  ZINK_AR_KVINDE_MG,
  ZINK_AR_MAND_MG,
  ZINK_EKSEMPEL_NAVNE,
  ZINK_KILDE,
  ZINK_MADVARER,
  ZINK_RI_KVINDE_MG,
  ZINK_RI_MAND_MG,
  ZINK_UL_MG,
  andelAfAnbefaling,
  gramForAnbefaling,
  zink100g,
  zinkEksempler,
  zinkIgram,
  zinkMetaBeskrivelse,
  zinkMetaTitel,
  zinkPer100Kcal,
  zinkRangliste,
  zinkTal,
  zinkVareMedNavn,
  soegZinkvarer,
} from "./zink-i-madvarer";
import { MADVARER } from "./kalorier-madvarer";

const havregryn = zinkVareMedNavn("Havregryn, tørrede")!;
const oksekod = zinkVareMedNavn("Oksekød, mørbrad")!;
const gouda = zinkVareMedNavn("Gouda")!;
const kylling = zinkVareMedNavn("Kylling, hel")!;
const rugbrod = zinkVareMedNavn("Rugbrød")!;
const olivenolie = zinkVareMedNavn("Olivenolie")!;

describe("zink i madvarer", () => {
  it("dækker alle madvarer i kalorietabellen med et zinktal", () => {
    expect(ZINK_MADVARER.length).toBe(MADVARER.length);
    for (const vare of ZINK_MADVARER) {
      expect(Number.isFinite(vare.zink100g)).toBe(true);
      expect(vare.zink100g).toBeGreaterThanOrEqual(0);
    }
  });

  it("læser kildens zinktal for havregryn, oksekød, gouda og kylling", () => {
    // USDA FoodData Central, næringsstof 1095: havregryn 3,97 mg, oksekød
    // (mørbrad) 3,32 mg, gouda 3,9 mg og kylling 1,54 mg pr. 100 g.
    expect(havregryn.zink100g).toBe(3.97);
    expect(oksekod.zink100g).toBe(3.32);
    expect(gouda.zink100g).toBe(3.9);
    expect(kylling.zink100g).toBe(1.54);
  });

  it("giver 0 mg zink for en madvare uden zink i kilden", () => {
    expect(olivenolie.zink100g).toBe(0);
    expect(zink100g(olivenolie)).toBe(0);
    expect(zinkIgram(olivenolie, 100)).toBe(0);
    expect(andelAfAnbefaling(olivenolie)).toBe(0);
    expect(gramForAnbefaling(olivenolie)).toBe(0);
  });

  it("regner zink for en given mængde", () => {
    expect(zinkIgram(havregryn, 100)).toBeCloseTo(3.97, 4);
    expect(zinkIgram(havregryn, 60)).toBeCloseTo(2.382, 4);
    expect(zinkIgram(oksekod, 150)).toBeCloseTo(4.98, 4);
    expect(zinkIgram(gouda, 30)).toBeCloseTo(1.17, 4);
    expect(zinkIgram(havregryn, 0)).toBe(0);
    expect(zinkIgram(havregryn, -10)).toBe(0);
    expect(zinkIgram(havregryn, Number.NaN)).toBe(0);
  });

  it("regner hvor stor en del af anbefalingen 100 g dækker", () => {
    // 3,97 mg pr. 100 g havregryn mod 13 mg: 30,5 %.
    expect(andelAfAnbefaling(havregryn)).toBeCloseTo(30.5, 1);
    // 100 g oksekød (3,32 mg) dækker 25,5 %.
    expect(andelAfAnbefaling(oksekod)).toBeCloseTo(25.5, 1);
  });

  it("regner hvor mange gram der svarer til hele dages anbefaling", () => {
    // 100 × 13 / 3,97 ≈ 327 g havregryn.
    expect(gramForAnbefaling(havregryn)).toBeCloseTo(327.5, 0);
    // Mod kvinders RI 10 mg: 100 × 10 / 3,97 ≈ 252 g havregryn.
    expect(gramForAnbefaling(havregryn, ZINK_RI_KVINDE_MG)).toBeCloseTo(251.9, 0);
  });

  it("holder sig til NNR2023's anbefalinger", () => {
    expect(ZINK_AR_KVINDE_MG).toBe(8);
    expect(ZINK_AR_MAND_MG).toBe(11);
    expect(ZINK_RI_KVINDE_MG).toBe(10);
    expect(ZINK_RI_MAND_MG).toBe(13);
    expect(ZINK_UL_MG).toBe(25);
    expect(ZINK_ANBEFALING_MG).toBe(ZINK_RI_MAND_MG);
  });

  it("regner zink pr. 100 kcal", () => {
    // Havregryn: 3,97 mg pr. 389 kcal = 1,02 mg pr. 100 kcal.
    expect(zinkPer100Kcal(havregryn)).toBeCloseTo(1.0206, 4);
    // Oksekød: 3,32 mg pr. 249 kcal = 1,33 mg pr. 100 kcal.
    expect(zinkPer100Kcal(oksekod)).toBeCloseTo(1.3333, 4);
    // En madvare uden kalorier giver 0.
    expect(zinkPer100Kcal(olivenolie)).toBe(0);
  });

  it("sorterer mest zink øverst", () => {
    const top = zinkRangliste();
    expect(top[0].navn).toBe("Havregryn, tørrede");
    expect(top[1].navn).toBe("Gouda");
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].zink100g).toBeGreaterThanOrEqual(top[i].zink100g);
    }
  });

  it("finder havregryn og oksekød på søgningen, også uden æøå", () => {
    expect(soegZinkvarer("havregryn")[0].navn).toBe("Havregryn, tørrede");
    expect(soegZinkvarer("rugbrod")[0].navn).toBe("Rugbrød");
    expect(soegZinkvarer("oksekod")[0].navn).toBe("Oksekød, mørbrad");
  });

  it("har de eksempler FAQ'en læser, i rækkefølgen", () => {
    expect(zinkEksempler().map((m) => m.navn)).toEqual([
      ...ZINK_EKSEMPEL_NAVNE,
    ]);
  });

  it("skriver tal med dansk komma i titel og beskrivelse", () => {
    expect(zinkTal(3.97)).toBe("3,97");
    expect(zinkTal(13)).toBe("13");
    expect(zinkMetaTitel()).toContain("havregryn");
    expect(zinkMetaTitel()).toContain("oksekød");
    expect(zinkMetaBeskrivelse()).toContain(`${ZINK_MADVARER.length} madvarer`);
  });

  it("opgiver hvilket næringsstof tallene kommer fra", () => {
    expect(ZINK_KILDE.naeringsstof).toContain("Zinc");
    expect(ZINK_KILDE.naeringsstof).toContain("1095");
  });
});
