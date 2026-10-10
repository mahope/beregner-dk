import { describe, expect, it } from "vitest";
import {
  JERN_ANBEFALING_MG,
  JERN_AR_KVINDE_MG,
  JERN_AR_MAND_MG,
  JERN_EKSEMPEL_NAVNE,
  JERN_KILDE,
  JERN_MADVARER,
  JERN_RI_KVINDE_MG,
  JERN_RI_MAND_MG,
  JERN_UL_MG,
  andelAfAnbefaling,
  gramForAnbefaling,
  jern100g,
  jernEksempler,
  jernIgram,
  jernMetaBeskrivelse,
  jernMetaTitel,
  jernPer100Kcal,
  jernRangliste,
  jernTal,
  jernVareMedNavn,
  soegJernvarer,
} from "./jern-i-madvarer";
import { MADVARER } from "./kalorier-madvarer";

const havregryn = jernVareMedNavn("Havregryn, tørrede")!;
const spinat = jernVareMedNavn("Spinat")!;
const aeg = jernVareMedNavn("Æg, helt, råt")!;
const rugbrod = jernVareMedNavn("Rugbrød")!;
const rapsolie = jernVareMedNavn("Rapsolie")!;

describe("jern i madvarer", () => {
  it("dækker alle madvarer i kalorietabellen med et jerntal", () => {
    expect(JERN_MADVARER.length).toBe(MADVARER.length);
    for (const vare of JERN_MADVARER) {
      expect(Number.isFinite(vare.jern100g)).toBe(true);
      expect(vare.jern100g).toBeGreaterThanOrEqual(0);
    }
  });

  it("læser kildens jerntal for havregryn, spinat og æg", () => {
    // USDA FoodData Central, næringsstof 1089: havregryn 4,72 mg, spinat
    // 2,71 mg, æg 1,75 mg pr. 100 g.
    expect(havregryn.jern100g).toBe(4.72);
    expect(spinat.jern100g).toBe(2.71);
    expect(aeg.jern100g).toBe(1.75);
    expect(rugbrod.jern100g).toBe(2.83);
  });

  it("giver 0 mg jern for en madvare uden jern i kilden", () => {
    expect(rapsolie.jern100g).toBe(0);
    expect(jern100g(rapsolie)).toBe(0);
    expect(jernIgram(rapsolie, 100)).toBe(0);
    expect(andelAfAnbefaling(rapsolie)).toBe(0);
    expect(gramForAnbefaling(rapsolie)).toBe(0);
  });

  it("regner jern for en given mængde", () => {
    expect(jernIgram(havregryn, 100)).toBeCloseTo(4.72, 4);
    expect(jernIgram(havregryn, 50)).toBeCloseTo(2.36, 4);
    expect(jernIgram(spinat, 200)).toBeCloseTo(5.42, 4);
    expect(jernIgram(havregryn, 0)).toBe(0);
    expect(jernIgram(havregryn, -10)).toBe(0);
    expect(jernIgram(havregryn, Number.NaN)).toBe(0);
  });

  it("regner hvor stor en del af anbefalingen 100 g dækker", () => {
    // 4,72 mg pr. 100 g havregryn mod 15 mg: 31,5 %.
    expect(andelAfAnbefaling(havregryn)).toBeCloseTo(31.5, 1);
    // 100 g spinat (2,71 mg) dækker 18,1 %.
    expect(andelAfAnbefaling(spinat)).toBeCloseTo(18.1, 1);
  });

  it("regner hvor mange gram der svarer til hele dages anbefaling", () => {
    // 100 × 15 / 4,72 ≈ 318 g havregryn.
    expect(gramForAnbefaling(havregryn)).toBeCloseTo(317.8, 0);
    // Mod mænds 9 mg: 100 × 9 / 4,72 ≈ 191 g.
    expect(gramForAnbefaling(havregryn, JERN_RI_MAND_MG)).toBeCloseTo(190.7, 0);
  });

  it("holder sig til NNR2023's anbefalinger", () => {
    expect(JERN_RI_KVINDE_MG).toBe(15);
    expect(JERN_RI_MAND_MG).toBe(9);
    expect(JERN_AR_KVINDE_MG).toBe(9);
    expect(JERN_AR_MAND_MG).toBe(7);
    expect(JERN_UL_MG).toBe(60);
    expect(JERN_ANBEFALING_MG).toBe(JERN_RI_KVINDE_MG);
  });

  it("regner jern pr. 100 kcal", () => {
    // Havregryn: 4,72 mg pr. 389 kcal = 1,21 mg pr. 100 kcal.
    expect(jernPer100Kcal(havregryn)).toBeCloseTo(1.2134, 4);
    // En madvare uden kalorier giver 0.
    expect(jernPer100Kcal(rapsolie)).toBe(0);
  });

  it("sorterer mest jern øverst", () => {
    const top = jernRangliste();
    expect(top[0].navn).toBe("Havregryn, tørrede");
    expect(top[1].navn).toBe("Franskbrød");
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].jern100g).toBeGreaterThanOrEqual(top[i].jern100g);
    }
  });

  it("finder havregryn og rugbrød på søgningen, også uden æøå", () => {
    expect(soegJernvarer("havregryn")[0].navn).toBe("Havregryn, tørrede");
    const fund = soegJernvarer("rugbrod");
    expect(fund.length).toBeGreaterThan(0);
    expect(fund[0].navn).toBe("Rugbrød");
  });

  it("har de eksempler FAQ'en læser, i rækkefølgen", () => {
    expect(jernEksempler().map((m) => m.navn)).toEqual([...JERN_EKSEMPEL_NAVNE]);
  });

  it("skriver tal med dansk komma i titel og beskrivelse", () => {
    expect(jernTal(4.72)).toBe("4,72");
    expect(jernTal(0.13)).toBe("0,13");
    expect(jernMetaTitel()).toContain("4,72");
    expect(jernMetaTitel()).toContain("2,71");
    expect(jernMetaBeskrivelse()).toContain("1,75");
    expect(jernMetaBeskrivelse()).toContain(`${JERN_MADVARER.length} madvarer`);
  });

  it("opgiver hvilket næringsstof tallene kommer fra", () => {
    expect(JERN_KILDE.naeringsstof).toContain("Iron");
    expect(JERN_KILDE.naeringsstof).toContain("1089");
  });
});
