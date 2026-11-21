import { describe, expect, it } from "vitest";
import {
  NATRIUM_ANBEFALING_MG,
  SALT_ANBEFALING_G,
  SALT_EKSEMPEL_NAVNE,
  SALT_MADVARER,
  SALT_KILDE,
  andelAfAnbefaling,
  natriumIgram,
  salt100g,
  saltEksempler,
  saltIgram,
  saltMetaBeskrivelse,
  saltMetaTitel,
  saltPer100Kcal,
  saltRangliste,
  saltTal,
  saltVareMedNavn,
  soegSaltvarer,
} from "./salt-i-madvarer";
import { MADVARER } from "./kalorier-madvarer";

const rugbrod = saltVareMedNavn("Rugbrød")!;
const smoer = saltVareMedNavn("Smør")!;
const skinke = saltVareMedNavn("Skinke")!;
const gouda = saltVareMedNavn("Gouda")!;
const rapsolie = saltVareMedNavn("Rapsolie")!;

describe("salt i madvarer", () => {
  it("dækker alle madvarer i kalorietabellen med et natriumtal", () => {
    expect(SALT_MADVARER.length).toBe(MADVARER.length);
    for (const vare of SALT_MADVARER) {
      expect(Number.isFinite(vare.natrium100g)).toBe(true);
      expect(vare.natrium100g).toBeGreaterThanOrEqual(0);
    }
  });

  it("læser kildens natriumtal for rugbrød", () => {
    // USDA FoodData Central, fdcId 172684, næringsstof 1058.
    expect(rugbrod.natrium100g).toBe(603);
  });

  it("regner natrium om til salt med faktoren 2,5", () => {
    // 603 mg natrium pr. 100 g: 603 × 2,5 / 1000 = 1,51 g salt.
    expect(salt100g(rugbrod)).toBeCloseTo(1.5075, 4);
    expect(saltTal(salt100g(rugbrod))).toBe("1,5");
    expect(salt100g(smoer)).toBeCloseTo(1.6075, 4);
    expect(salt100g(skinke)).toBeCloseTo(3.75, 4);
  });

  it("giver 0 g salt for en madvare uden natrium i kilden", () => {
    expect(rapsolie.natrium100g).toBe(0);
    expect(salt100g(rapsolie)).toBe(0);
    expect(saltIgram(rapsolie, 100)).toBe(0);
  });

  it("regner salt og natrium for en given mængde", () => {
    expect(saltIgram(rugbrod, 100)).toBeCloseTo(1.5075, 4);
    expect(saltIgram(rugbrod, 50)).toBeCloseTo(0.75375, 4);
    expect(saltIgram(rugbrod, 0)).toBe(0);
    expect(saltIgram(rugbrod, -10)).toBe(0);
    expect(saltIgram(rugbrod, Number.NaN)).toBe(0);
    expect(natriumIgram(rugbrod, 200)).toBe(1206);
  });

  it("regner hvor stor en del af WHO's anbefaling 100 g dækker", () => {
    // 1,51 g salt pr. 100 g rugbrød mod 5 g: ca. 30 %.
    expect(andelAfAnbefaling(rugbrod)).toBeCloseTo(30.15, 1);
    // Skinke dækker 100 g for 75 %.
    expect(andelAfAnbefaling(skinke)).toBeCloseTo(75, 1);
    expect(andelAfAnbefaling(rapsolie)).toBe(0);
  });

  it("holder sig til WHO's anbefaling, regnet fra natrium", () => {
    expect(NATRIUM_ANBEFALING_MG).toBe(2000);
    expect(SALT_ANBEFALING_G).toBe(5);
  });

  it("regner salt pr. 100 kcal", () => {
    // Smør: 1,61 g salt pr. 717 kcal = 0,22 g pr. 100 kcal.
    expect(saltPer100Kcal(smoer)).toBeCloseTo(0.2242, 2);
    // En madvare uden kalorier giver 0.
    expect(saltPer100Kcal(rugbrod)).toBeGreaterThan(0);
  });

  it("sorterer mest salt øverst", () => {
    const top = saltRangliste();
    expect(top[0].navn).toBe("Skinke");
    expect(top[1].navn).toBe("Feta");
    expect(top[2].navn).toBe("Gouda");
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].natrium100g).toBeGreaterThanOrEqual(top[i].natrium100g);
    }
  });

  it("finder rugbrød på søgningen, også uden æøå", () => {
    const fund = soegSaltvarer("rugbrod");
    expect(fund.length).toBeGreaterThan(0);
    expect(fund[0].navn).toBe("Rugbrød");
  });

  it("finder skinke på «skinke» og smør på «smør»", () => {
    expect(soegSaltvarer("skinke")[0].navn).toBe("Skinke");
    expect(soegSaltvarer("smør")[0].navn).toBe("Smør");
  });

  it("har de eksempler FAQ'en læser, i rækkefølgen", () => {
    expect(saltEksempler().map((m) => m.navn)).toEqual([...SALT_EKSEMPEL_NAVNE]);
    expect(gouda.natrium100g).toBe(819);
  });

  it("skriver tal med dansk komma i titel og beskrivelse", () => {
    expect(saltTal(1.5075)).toBe("1,5");
    expect(saltMetaTitel()).toContain("1,5");
    expect(saltMetaBeskrivelse()).toContain("1,6");
    expect(saltMetaBeskrivelse()).toContain(`${SALT_MADVARER.length} madvarer`);
  });

  it("opgiver hvilket næringsstof tallene kommer fra", () => {
    expect(SALT_KILDE.naeringsstof).toContain("Sodium");
    expect(SALT_KILDE.naeringsstof).toContain("1058");
  });
});
