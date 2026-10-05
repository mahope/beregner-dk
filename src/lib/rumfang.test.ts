import { describe, expect, test } from "vitest";
import {
  LITER_PR_KUBIKMETER,
  MAX_MAAL_M,
  MIN_MAAL_M,
  RUMFANG_EKSEMPEL,
  RUMFANG_FELT,
  RUMFANG_FORMEL,
  rumfang,
  rumfangSvar,
  type RumfangInput,
  type Rummelig,
} from "./rumfang";

/**
 * Porten dømmer på **tal**, ikke på at der står «m³» i markup'en. Derfor er
 * hver formel dømt mod et håndregnet tal, og de er valgt, så en fejl i π,
 * diameterens halvering eller ⅓-faktoren giver et *andet* tal:
 *
 * | figur    | mål                    | forventet          |
 * |----------|------------------------|--------------------|
 * | kasse    | 2 × 1 × 0,5 m          | 1 m³               |
 * | cylinder | d = 1 m, h = 2 m       | π/2 ≈ 1,5708 m³    |
 * | kugle    | d = 1 m                | π/6 ≈ 0,5236 m³    |
 * | kegle    | d = 1 m, h = 2 m       | π/6 ≈ 0,5236 m³    |
 * | pyramide | s = 2 m, h = 3 m       | 4 m³               |
 *
 * Kuglen og keglen er valgt, fordi de er lige: π/6 hver. Mutér keglens ⅓ til
 * 1/1, så er svaret π/2 og to tests bliver røde. Mutér kuglens diameter til
 * radius, så forventningen på 0,5236 brister.
 */

const TOL = 1e-9;

describe("rumfang", () => {
  test("kasse er længde × bredde × højde", () => {
    expect(rumfang("kasse", { kasse: { laengde: 2, bredde: 1, hoejde: 0.5 } })).toBe(1);
  });

  test("kasse på 3 x 4 x 5 m er 60 m³", () => {
    expect(rumfang("kasse", { kasse: { laengde: 3, bredde: 4, hoejde: 5 } })).toBe(60);
  });

  test("cylinder med diameter 1 og højde 2 er pi/2", () => {
    expect(rumfang("cylinder", { cylinder: { diameter: 1, hoejde: 2 } })).toBeCloseTo(Math.PI / 2, 9);
  });

  test("cylinderens diameter halveres, så r = 1 m giver 2π m³", () => {
    expect(rumfang("cylinder", { cylinder: { diameter: 2, hoejde: 2 } })).toBeCloseTo(2 * Math.PI, 9);
  });

  test("kugle med diameter 1 er pi/6", () => {
    expect(rumfang("kugle", { kugle: { diameter: 1 } })).toBeCloseTo(Math.PI / 6, 9);
  });

  test("kugle med diameter 3 er 4,5pi — terningen i diameteren", () => {
    // r = 1,5 m, så (4/3) × π × 1,5³ = 4,5π. Mutér formlen til at læse
    // diameteren som radius, og forventningen på 4,5π brister.
    expect(rumfang("kugle", { kugle: { diameter: 3 } })).toBeCloseTo(4.5 * Math.PI, 9);
  });

  test("kegle er præcis en tredjedel af samme cylinder", () => {
    const cylinder = rumfang("cylinder", { cylinder: { diameter: 1, hoejde: 2 } })!;
    const kegle = rumfang("kegle", { kegle: { diameter: 1, hoejde: 2 } })!;
    expect(kegle * 3).toBeCloseTo(cylinder, 9);
  });

  test("pyramide er en tredjedel af firkantet prisme med samme grund og højde", () => {
    expect(rumfang("pyramide", { pyramide: { grundside: 2, hoejde: 3 } })).toBe(4);
  });

  test("en figur slet ikke i inputtet giver undefined, ikke NaN eller 0", () => {
    expect(rumfang("kugle", {})).toBeUndefined();
    expect(rumfangSvar("cylinder", {})).toBeUndefined();
    expect(rumfang("pyramide", { kasse: { laengde: 1, bredde: 1, hoejde: 1 } })).toBeUndefined();
  });

  test("et felt der mangler i en kasse kaster, så NaN aldrig vises som 0 m³", () => {
    // Uden denne tjek giver `laengde * bredde * hoejde` med hoejde undefined
    // NaN, og en formatteret NaN læses som «0 m³» — rigtigt udseende, værdiløst.
    expect(() => rumfang("kasse", { kasse: { laengde: 2, bredde: 1 } as never })).toThrow(/Højden/);
  });

  test("mål under bunden og over loftet afvises, så et felt ikke viser 0 m³", () => {
    const for_lille = { kasse: { laengde: MIN_MAAL_M / 2, bredde: 1, hoejde: 1 } };
    const for_stort = { kugle: { diameter: MAX_MAAL_M * 2 } };
    expect(() => rumfang("kasse", for_lille)).toThrow();
    expect(() => rumfang("kugle", for_stort)).toThrow();
    expect(() => rumfang("kasse", { kasse: { laengde: Number.NaN, bredde: 1, hoejde: 1 } })).toThrow();
  });

  test("grænsen selv er gyldig, så et felt kan ikke låses ude med sin egen minimum", () => {
    expect(rumfang("kugle", { kugle: { diameter: MIN_MAAL_M } })).toBeGreaterThan(0);
    expect(rumfang("kasse", { kasse: { laengde: MAX_MAAL_M, bredde: 1, hoejde: 1 } })).toBe(MAX_MAAL_M);
  });
});

describe("liter", () => {
  test("1 m³ er 1.000 liter", () => {
    expect(LITER_PR_KUBIKMETER).toBe(1000);
  });

  test("svaret bærer begge enheder, og de er samme tal ganget", () => {
    const svar = rumfangSvar("kasse", { kasse: { laengde: 2, bredde: 1, hoejde: 0.5 } })!;
    expect(svar.kubikmeter).toBe(1);
    expect(svar.liter).toBe(1000);
  });

  test("kuglen med diameter 1 er ca. 524 liter", () => {
    expect(rumfangSvar("kugle", { kugle: { diameter: 1 } })!.liter).toBeCloseTo(523.5987756, 6);
  });
});

describe("eksempler og formler", () => {
  test("hvert eksempel i RUMFANG_EKSEMPEL er det, siden faktisk regner", () => {
    // Eksemplerne bruges i metaTitle, FAQ og brødtekst. Mutér en formel, så
    // falder denne test rød — det er derfor de ikke er håndskrevet tal.
    const cases: { input: RumfangInput; figur: Rummelig }[] = [
      { input: { kasse: { laengde: 2, bredde: 1, hoejde: 0.5 } }, figur: "kasse" },
      { input: { cylinder: { diameter: 1, hoejde: 2 } }, figur: "cylinder" },
      { input: { kugle: { diameter: 1 } }, figur: "kugle" },
      { input: { kegle: { diameter: 1, hoejde: 2 } }, figur: "kegle" },
      { input: { pyramide: { grundside: 2, hoejde: 3 } }, figur: "pyramide" },
    ];
    for (const { input, figur } of cases) {
      const svar = rumfangSvar(figur, input)!;
      const gemt = RUMFANG_EKSEMPEL[figur].svar;
      expect(svar.kubikmeter, figur).toBeCloseTo(gemt.kubikmeter, 9);
      expect(svar.liter, figur).toBeCloseTo(gemt.liter, 9);
    }
  });

  test("alle fem figurer har en formel med et gange- eller dividere tegn", () => {
    for (const [figur, formel] of Object.entries(RUMFANG_FORMEL)) {
      expect(formel, figur).toMatch(/[×÷]/);
      expect(formel, figur).not.toMatch(/Math\.|\*\*|undefined/);
    }
  });

  test("kuglen har ingen højdefelt — den er den fejl, der giver dobbelt så stort tal", () => {
    expect(RUMFANG_FELT.kugle.map((f) => f.nogle)).toEqual(["diameter"]);
    expect(RUMFANG_FELT.cylinder.map((f) => f.nogle)).toEqual(["diameter", "hoejde"]);
    expect(RUMFANG_FELT.kugle.some((f) => f.nogle === "hoejde")).toBe(false);
  });

  test("alle felter har en dansk og en svensk etiket", () => {
    for (const felter of Object.values(RUMFANG_FELT)) {
      for (const felt of felter) {
        expect(felt.da.length, felt.nogle).toBeGreaterThan(0);
        expect(felt.se.length, felt.nogle).toBeGreaterThan(0);
      }
    }
  });

  test("keglen og kuglen beskrives forskelligt, så de ikke ligner hinanden i teksten", () => {
    expect(RUMFANG_EKSEMPEL.kegle.beskrivelseDa).not.toBe(RUMFANG_EKSEMPEL.kugle.beskrivelseDa);
  });
});