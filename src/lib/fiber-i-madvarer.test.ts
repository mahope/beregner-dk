import { describe, expect, it } from "vitest";
import {
  FIBER_ANBEFALING_G,
  FIBER_EKSEMPEL_NAVNE,
  FIBER_KILDE,
  FIBER_MADVARER,
  andelAfAnbefaling,
  fiber100g,
  fiberEksempler,
  fiberIgram,
  fiberMetaBeskrivelse,
  fiberMetaTitel,
  fiberPer100Kcal,
  fiberRangliste,
  fiberTal,
  fiberVareMedNavn,
  gramForAnbefaling,
  soegFibervarer,
} from "./fiber-i-madvarer";
import { MADVARER } from "./kalorier-madvarer";

const havregryn = fiberVareMedNavn("Havregryn, tørrede")!;
const rugbrod = fiberVareMedNavn("Rugbrød")!;
const gulerod = fiberVareMedNavn("Gulerod")!;
const bulgur = fiberVareMedNavn("Bulgur, tørret")!;
const rapsolie = fiberVareMedNavn("Rapsolie")!;

describe("fiber i madvarer", () => {
  it("dækker alle madvarer i kalorietabellen med et fibertal", () => {
    expect(FIBER_MADVARER.length).toBe(MADVARER.length);
    for (const vare of FIBER_MADVARER) {
      expect(Number.isFinite(vare.fiber100g)).toBe(true);
      expect(vare.fiber100g).toBeGreaterThanOrEqual(0);
    }
  });

  it("læser kildens fibertal for havregryn og rugbrød", () => {
    // USDA FoodData Central, næringsstof 1079: havregryn 10,6 g, rugbrød 5,8 g.
    expect(havregryn.fiber100g).toBe(10.6);
    expect(rugbrod.fiber100g).toBe(5.8);
    expect(gulerod.fiber100g).toBe(2.8);
  });

  it("giver 0 g fiber for en madvare uden fiber i kilden", () => {
    expect(rapsolie.fiber100g).toBe(0);
    expect(fiber100g(rapsolie)).toBe(0);
    expect(fiberIgram(rapsolie, 100)).toBe(0);
    expect(andelAfAnbefaling(rapsolie)).toBe(0);
    expect(gramForAnbefaling(rapsolie)).toBe(0);
  });

  it("regner fiber for en given mængde", () => {
    expect(fiberIgram(havregryn, 100)).toBeCloseTo(10.6, 4);
    expect(fiberIgram(havregryn, 50)).toBeCloseTo(5.3, 4);
    expect(fiberIgram(rugbrod, 30)).toBeCloseTo(1.74, 4);
    expect(fiberIgram(havregryn, 0)).toBe(0);
    expect(fiberIgram(havregryn, -10)).toBe(0);
    expect(fiberIgram(havregryn, Number.NaN)).toBe(0);
  });

  it("regner hvor stor en del af WHO's anbefaling 100 g dækker", () => {
    // 10,6 g pr. 100 g havregryn mod 25 g: 42,4 %.
    expect(andelAfAnbefaling(havregryn)).toBeCloseTo(42.4, 1);
    // 100 g bulgur (12,5 g) dækker 50 %.
    expect(andelAfAnbefaling(bulgur)).toBeCloseTo(50, 1);
    expect(andelAfAnbefaling(gulerod)).toBeCloseTo(11.2, 1);
  });

  it("regner hvor mange gram der svarer til hele dages anbefaling", () => {
    // 100 × 25 / 10,6 ≈ 236 g havregryn.
    expect(gramForAnbefaling(havregryn)).toBeCloseTo(235.85, 1);
    expect(gramForAnbefaling(bulgur)).toBeCloseTo(200, 1);
  });

  it("holder sig til WHO's anbefaling", () => {
    expect(FIBER_ANBEFALING_G).toBe(25);
  });

  it("regner fiber pr. 100 kcal", () => {
    // Havregryn: 10,6 g fiber pr. 389 kcal = 2,72 g pr. 100 kcal.
    expect(fiberPer100Kcal(havregryn)).toBeCloseTo(2.725, 2);
    // En madvare uden kalorier giver 0.
    expect(fiberPer100Kcal(rapsolie)).toBe(0);
  });

  it("sorterer mest fiber øverst", () => {
    const top = fiberRangliste();
    expect(top[0].navn).toBe("Bulgur, tørret");
    expect(top[1].navn).toBe("Havregryn, tørrede");
    expect(top[2].navn).toBe("Nudler, tørrede");
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].fiber100g).toBeGreaterThanOrEqual(top[i].fiber100g);
    }
  });

  it("finder havregryn og rugbrød på søgningen, også uden æøå", () => {
    expect(soegFibervarer("havregryn")[0].navn).toBe("Havregryn, tørrede");
    const fund = soegFibervarer("rugbrod");
    expect(fund.length).toBeGreaterThan(0);
    expect(fund[0].navn).toBe("Rugbrød");
  });

  it("har de eksempler FAQ'en læser, i rækkefølgen", () => {
    expect(fiberEksempler().map((m) => m.navn)).toEqual([...FIBER_EKSEMPEL_NAVNE]);
  });

  it("skriver tal med dansk komma i titel og beskrivelse", () => {
    expect(fiberTal(10.6)).toBe("10,6");
    expect(fiberMetaTitel()).toContain("10,6");
    expect(fiberMetaTitel()).toContain("5,8");
    expect(fiberMetaBeskrivelse()).toContain("2,8");
    expect(fiberMetaBeskrivelse()).toContain(`${FIBER_MADVARER.length} madvarer`);
  });

  it("opgiver hvilket næringsstof tallene kommer fra", () => {
    expect(FIBER_KILDE.naeringsstof).toContain("Fiber");
    expect(FIBER_KILDE.naeringsstof).toContain("1079");
  });
});
