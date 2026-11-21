import { describe, expect, it } from "vitest";
import {
  CALCIUM_ANBEFALING_MG,
  CALCIUM_AR_MG,
  CALCIUM_EKSEMPEL_NAVNE,
  CALCIUM_KILDE,
  CALCIUM_MADVARER,
  CALCIUM_RI_MG,
  CALCIUM_UL_MG,
  andelAfAnbefaling,
  calcium100g,
  calciumEksempler,
  calciumIgram,
  calciumMetaBeskrivelse,
  calciumMetaTitel,
  calciumPer100Kcal,
  calciumRangliste,
  calciumTal,
  calciumVareMedNavn,
  gramForAnbefaling,
  soegCalciumvarer,
} from "./calcium-i-madvarer";
import { MADVARER } from "./kalorier-madvarer";

const letmaelk = calciumVareMedNavn("Mælk, letmælk 1,5 %")!;
const gouda = calciumVareMedNavn("Gouda")!;
const yoghurt = calciumVareMedNavn("Yoghurt, natur")!;
const rugbrod = calciumVareMedNavn("Rugbrød")!;
const rapsolie = calciumVareMedNavn("Rapsolie")!;

describe("calcium i madvarer", () => {
  it("dækker alle madvarer i kalorietabellen med et calciumtal", () => {
    expect(CALCIUM_MADVARER.length).toBe(MADVARER.length);
    for (const vare of CALCIUM_MADVARER) {
      expect(Number.isFinite(vare.calcium100g)).toBe(true);
      expect(vare.calcium100g).toBeGreaterThanOrEqual(0);
    }
  });

  it("læser kildens calciumtal for letmælk, gouda og yoghurt", () => {
    // USDA FoodData Central, næringsstof 1087: letmælk 125 mg, gouda
    // 700 mg, yoghurt 121 mg og rugbrød 73 mg pr. 100 g.
    expect(letmaelk.calcium100g).toBe(125);
    expect(gouda.calcium100g).toBe(700);
    expect(yoghurt.calcium100g).toBe(121);
    expect(rugbrod.calcium100g).toBe(73);
  });

  it("giver 0 mg calcium for en madvare uden calcium i kilden", () => {
    expect(rapsolie.calcium100g).toBe(0);
    expect(calcium100g(rapsolie)).toBe(0);
    expect(calciumIgram(rapsolie, 100)).toBe(0);
    expect(andelAfAnbefaling(rapsolie)).toBe(0);
    expect(gramForAnbefaling(rapsolie)).toBe(0);
  });

  it("regner calcium for en given mængde", () => {
    expect(calciumIgram(letmaelk, 100)).toBeCloseTo(125, 4);
    expect(calciumIgram(letmaelk, 200)).toBeCloseTo(250, 4);
    expect(calciumIgram(gouda, 30)).toBeCloseTo(210, 4);
    expect(calciumIgram(letmaelk, 0)).toBe(0);
    expect(calciumIgram(letmaelk, -10)).toBe(0);
    expect(calciumIgram(letmaelk, Number.NaN)).toBe(0);
  });

  it("regner hvor stor en del af anbefalingen 100 g dækker", () => {
    // 125 mg pr. 100 g letmælk mod 950 mg: 13,2 %.
    expect(andelAfAnbefaling(letmaelk)).toBeCloseTo(13.2, 1);
    // 100 g gouda (700 mg) dækker 73,7 %.
    expect(andelAfAnbefaling(gouda)).toBeCloseTo(73.7, 1);
  });

  it("regner hvor mange gram der svarer til hele dages anbefaling", () => {
    // 100 × 950 / 700 ≈ 136 g gouda.
    expect(gramForAnbefaling(gouda)).toBeCloseTo(135.7, 0);
    // Mod gennemsnitsbehovet 750 mg: 100 × 750 / 125 ≈ 600 g letmælk.
    expect(gramForAnbefaling(letmaelk, CALCIUM_AR_MG)).toBeCloseTo(600, 0);
  });

  it("holder sig til NNR2023's anbefalinger", () => {
    expect(CALCIUM_RI_MG).toBe(950);
    expect(CALCIUM_AR_MG).toBe(750);
    expect(CALCIUM_UL_MG).toBe(2500);
    expect(CALCIUM_ANBEFALING_MG).toBe(CALCIUM_RI_MG);
  });

  it("regner calcium pr. 100 kcal", () => {
    // Gouda: 700 mg pr. 356 kcal = 196,6 mg pr. 100 kcal.
    expect(calciumPer100Kcal(gouda)).toBeCloseTo(196.6292, 4);
    // En madvare uden kalorier giver 0.
    expect(calciumPer100Kcal(rapsolie)).toBe(0);
  });

  it("sorterer mest calcium øverst", () => {
    const top = calciumRangliste();
    expect(top[0].navn).toBe("Gouda");
    expect(top[1].navn).toBe("Feta");
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].calcium100g).toBeGreaterThanOrEqual(top[i].calcium100g);
    }
  });

  it("finder mælk og rugbrød på søgningen, også uden æøå", () => {
    expect(soegCalciumvarer("mælk").length).toBeGreaterThan(0);
    expect(soegCalciumvarer("maelk")[0].navn).toBe("Mælk, letmælk 1,5 %");
    expect(soegCalciumvarer("rugbrod")[0].navn).toBe("Rugbrød");
  });

  it("har de eksempler FAQ'en læser, i rækkefølgen", () => {
    expect(calciumEksempler().map((m) => m.navn)).toEqual([...CALCIUM_EKSEMPEL_NAVNE]);
  });

  it("skriver tal med dansk komma i titel og beskrivelse", () => {
    expect(calciumTal(700)).toBe("700");
    expect(calciumTal(125.5)).toBe("125,5");
    expect(calciumMetaTitel()).toContain("gouda");
    expect(calciumMetaTitel()).toContain("letmælk");
    expect(calciumMetaBeskrivelse()).toContain(`${CALCIUM_MADVARER.length} madvarer`);
  });

  it("opgiver hvilket næringsstof tallene kommer fra", () => {
    expect(CALCIUM_KILDE.naeringsstof).toContain("Calcium");
    expect(CALCIUM_KILDE.naeringsstof).toContain("1087");
  });
});
