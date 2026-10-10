import { describe, expect, it } from "vitest";
import {
  KALIUM_AI_MG,
  KALIUM_ANBEFALING_MG,
  KALIUM_AR_MG,
  KALIUM_EKSEMPEL_NAVNE,
  KALIUM_KILDE,
  KALIUM_MADVARER,
  KALIUM_UL_MG,
  andelAfAnbefaling,
  gramForAnbefaling,
  kalium100g,
  kaliumEksempler,
  kaliumIgram,
  kaliumMetaBeskrivelse,
  kaliumMetaTitel,
  kaliumPer100Kcal,
  kaliumRangliste,
  kaliumTal,
  kaliumVareMedNavn,
  soegKaliumvarer,
} from "./kalium-i-madvarer";
import { MADVARER } from "./kalorier-madvarer";

const banan = kaliumVareMedNavn("Banan")!;
const kartoffelBagt = kaliumVareMedNavn("Kartoffel, bagt")!;
const avocado = kaliumVareMedNavn("Avocado")!;
const spinat = kaliumVareMedNavn("Spinat")!;
const havregryn = kaliumVareMedNavn("Havregryn, tørrede")!;
const tomat = kaliumVareMedNavn("Tomat")!;
const rapsolie = kaliumVareMedNavn("Rapsolie")!;

describe("kalium i madvarer", () => {
  it("dækker alle madvarer i kalorietabellen med et kaliumtal", () => {
    expect(KALIUM_MADVARER.length).toBe(MADVARER.length);
    for (const vare of KALIUM_MADVARER) {
      expect(Number.isFinite(vare.kalium100g)).toBe(true);
      expect(vare.kalium100g).toBeGreaterThanOrEqual(0);
    }
  });

  it("læser kildens kaliumtal for banan, kartoffel, avocado og spinat", () => {
    // USDA FoodData Central, næringsstof 1092: banan 358 mg, bagt kartoffel
    // 535 mg, avocado 485 mg og spinat 558 mg pr. 100 g.
    expect(banan.kalium100g).toBe(358);
    expect(kartoffelBagt.kalium100g).toBe(535);
    expect(avocado.kalium100g).toBe(485);
    expect(spinat.kalium100g).toBe(558);
  });

  it("giver 0 mg kalium for en madvare uden kalium i kilden", () => {
    expect(rapsolie.kalium100g).toBe(0);
    expect(kalium100g(rapsolie)).toBe(0);
    expect(kaliumIgram(rapsolie, 100)).toBe(0);
    expect(andelAfAnbefaling(rapsolie)).toBe(0);
    expect(gramForAnbefaling(rapsolie)).toBe(0);
  });

  it("regner kalium for en given mængde", () => {
    expect(kaliumIgram(banan, 100)).toBeCloseTo(358, 4);
    expect(kaliumIgram(banan, 120)).toBeCloseTo(429.6, 4);
    expect(kaliumIgram(kartoffelBagt, 200)).toBeCloseTo(1070, 4);
    expect(kaliumIgram(avocado, 100)).toBeCloseTo(485, 4);
    expect(kaliumIgram(banan, 0)).toBe(0);
    expect(kaliumIgram(banan, -10)).toBe(0);
    expect(kaliumIgram(banan, Number.NaN)).toBe(0);
  });

  it("regner hvor stor en del af anbefalingen 100 g dækker", () => {
    // 535 mg pr. 100 g bagt kartoffel mod 3.500 mg: 15,3 %.
    expect(andelAfAnbefaling(kartoffelBagt)).toBeCloseTo(15.3, 1);
    // 429 mg havregryn dækker 12,3 %.
    expect(andelAfAnbefaling(havregryn)).toBeCloseTo(12.3, 1);
  });

  it("regner hvor mange gram der svarer til hele dages anbefaling", () => {
    // 100 × 3.500 / 358 ≈ 978 g banan.
    expect(gramForAnbefaling(banan)).toBeCloseTo(977.7, 0);
    // 100 × 3.500 / 429 ≈ 816 g havregryn.
    expect(gramForAnbefaling(havregryn)).toBeCloseTo(815.9, 0);
  });

  it("holder sig til NNR2023's anbefalinger", () => {
    expect(KALIUM_AR_MG).toBe(2800);
    expect(KALIUM_AI_MG).toBe(3500);
    expect(KALIUM_UL_MG).toBeNull();
    expect(KALIUM_ANBEFALING_MG).toBe(KALIUM_AI_MG);
  });

  it("regner kalium pr. 100 kcal", () => {
    // Spinat har mere kalium end energi målt pr. 100 kcal, så tallet er > 100.
    expect(kaliumPer100Kcal(spinat)).toBeGreaterThan(100);
    // En madvare uden kalium giver 0.
    expect(kaliumPer100Kcal(rapsolie)).toBe(0);
  });

  it("sorterer mest kalium øverst", () => {
    const top = kaliumRangliste();
    expect(top[0].navn).toBe("Banan, tørret");
    expect(top[1].navn).toBe("Druer, tørrede");
    expect(top[2].navn).toBe("Spinat");
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].kalium100g).toBeGreaterThanOrEqual(top[i].kalium100g);
    }
  });

  it("finder banan og kartoffel på søgningen, også uden æøå", () => {
    expect(soegKaliumvarer("banan")[0].navn).toBe("Banan");
    expect(soegKaliumvarer("kartoffel")[0].navn).toBe("Kartoffel, rå");
    expect(soegKaliumvarer("spinat")[0].navn).toBe("Spinat");
  });

  it("har de eksempler FAQ'en læser, i rækkefølgen", () => {
    expect(kaliumEksempler().map((m) => m.navn)).toEqual([
      ...KALIUM_EKSEMPEL_NAVNE,
    ]);
  });

  it("skriver tal med dansk komma i titel og beskrivelse", () => {
    expect(kaliumTal(358)).toBe("358");
    expect(kaliumTal(3500)).toBe("3.500");
    expect(kaliumMetaTitel()).toContain("kartoffel");
    expect(kaliumMetaTitel()).toContain("banan");
    expect(kaliumMetaBeskrivelse()).toContain(`${KALIUM_MADVARER.length} madvarer`);
  });

  it("opgiver hvilket næringsstof tallene kommer fra", () => {
    expect(KALIUM_KILDE.naeringsstof).toContain("Potassium");
    expect(KALIUM_KILDE.naeringsstof).toContain("1092");
  });
});
