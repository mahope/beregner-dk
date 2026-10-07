import { describe, expect, test } from "vitest";
import {
  AREAL_EKSEMPEL,
  AREAL_FELT,
  AREAL_FORMEL,
  KVADRATCENTIMETER_PR_KVADRATMETER,
  MAX_MAAL_M,
  MIN_MAAL_M,
  areal,
  arealSvar,
  type ArealFigur,
  type ArealInput,
} from "./areal";

/**
 * Porten dømmer på **tal**, ikke på at der står «m²» i markup'en. Derfor er
 * hver formel dømt mod et håndregnet tal, og de er valgt, så en fejl i π,
 * diameterens halvering eller ½-faktoren giver et *andet* tal:
 *
 * | figur         | mål                 | forventet        |
 * |---------------|---------------------|------------------|
 * | cirkel        | d = 1 m             | π/4 ≈ 0,7854 m²  |
 * | trekant       | g = 2, h = 3 m      | 3 m²             |
 * | rektangel     | 2 × 3 m             | 6 m²             |
 * | kvadrat       | s = 2 m             | 4 m²             |
 * | trapez        | a = 2, b = 4, h = 3 | 9 m²             |
 * | parallelogram | g = 2, h = 3 m      | 6 m²             |
 * | rombe         | d₁ = 2, d₂ = 3 m    | 3 m²             |
 *
 * Cirklen er valgt, fordi diameter-for-radius-fejlen giver π i stedet for π/4 —
 * fire gange for stort. Trapezet er valgt, fordi middeltallet af siderne er det,
 * der let glemmes. Rombe og trekant deler begge ½, så en manglende halvering
 * giver et dobbelt så stort tal.
 */

const TOL = 1e-9;

describe("areal", () => {
  test("cirkel med diameter 1 er pi/4", () => {
    expect(areal("cirkel", { cirkel: { diameter: 1 } })).toBeCloseTo(Math.PI / 4, 9);
  });

  test("cirkel med diameter 2 er pi — r = 1 m", () => {
    expect(areal("cirkel", { cirkel: { diameter: 2 } })).toBeCloseTo(Math.PI, 9);
  });

  test("cirkel med diameter 3 er 2,25pi — kvadratet i diameteren", () => {
    // r = 1,5 m, så π × 1,5² = 2,25π. Læses diameteren som radius, brister
    // forventningen.
    expect(areal("cirkel", { cirkel: { diameter: 3 } })).toBeCloseTo(2.25 * Math.PI, 9);
  });

  test("trekant er præcis halvdelen af rektanglet med samme grundlinje og højde", () => {
    const trekant = areal("trekant", { trekant: { grundlinje: 4, hoejde: 5 } })!;
    const rektangel = areal("rektangel", { rektangel: { laengde: 4, bredde: 5 } })!;
    expect(trekant * 2).toBeCloseTo(rektangel, 9);
    expect(trekant).toBe(10);
  });

  test("rektangel er længde × bredde", () => {
    expect(areal("rektangel", { rektangel: { laengde: 2, bredde: 3 } })).toBe(6);
    expect(areal("rektangel", { rektangel: { laengde: 3, bredde: 4 } })).toBe(12);
  });

  test("kvadrat er siden i anden", () => {
    expect(areal("kvadrat", { kvadrat: { side: 2 } })).toBe(4);
    expect(areal("kvadrat", { kvadrat: { side: 3 } })).toBe(9);
  });

  test("trapez er middeltallet af de parallelle sider gange højden", () => {
    expect(areal("trapez", { trapez: { sideA: 2, sideB: 4, hoejde: 3 } })).toBe(9);
    expect(areal("trapez", { trapez: { sideA: 3, sideB: 5, hoejde: 2 } })).toBe(8);
  });

  test("parallelogram er grundlinje × højde — ikke sidelængden", () => {
    expect(areal("parallelogram", { parallelogram: { grundlinje: 2, hoejde: 3 } })).toBe(6);
  });

  test("rombe er halvdelen af rektanglet over diagonalerne", () => {
    const rombe = areal("rombe", { rombe: { diagonal1: 2, diagonal2: 3 } })!;
    expect(rombe).toBe(3);
    expect(areal("rombe", { rombe: { diagonal1: 4, diagonal2: 6 } })).toBe(12);
  });

  test("en figur slet ikke i inputtet giver undefined, ikke NaN eller 0", () => {
    expect(areal("cirkel", {})).toBeUndefined();
    expect(arealSvar("trekant", {})).toBeUndefined();
    expect(areal("kvadrat", { cirkel: { diameter: 1 } })).toBeUndefined();
  });

  test("et felt der mangler i et rektangel kaster, så NaN aldrig vises som 0 m²", () => {
    // Uden denne tjek giver `laengde * bredde` med bredde undefined NaN, og en
    // formatteret NaN læses som «0 m²» — rigtigt udseende, værdiløst.
    expect(() =>
      areal("rektangel", { rektangel: { laengde: 2 } as never })
    ).toThrow(/Bredden/);
  });

  test("mål under bunden og over loftet afvises, så et felt ikke viser 0 m²", () => {
    const for_lille = { kvadrat: { side: MIN_MAAL_M / 2 } };
    const for_stort = { cirkel: { diameter: MAX_MAAL_M * 2 } };
    expect(() => areal("kvadrat", for_lille)).toThrow();
    expect(() => areal("cirkel", for_stort)).toThrow();
    expect(() =>
      areal("kvadrat", { kvadrat: { side: Number.NaN } })
    ).toThrow();
  });

  test("grænsen selv er gyldig, så et felt ikke låses ude med sin egen minimum", () => {
    expect(areal("cirkel", { cirkel: { diameter: MIN_MAAL_M } })).toBeGreaterThan(0);
    expect(areal("kvadrat", { kvadrat: { side: MAX_MAAL_M } })).toBe(MAX_MAAL_M ** 2);
  });
});

describe("kvadratcentimeter", () => {
  test("1 m² er 10.000 cm²", () => {
    expect(KVADRATCENTIMETER_PR_KVADRATMETER).toBe(10000);
  });

  test("svaret bærer begge enheder, og de er samme tal ganget", () => {
    const svar = arealSvar("rektangel", { rektangel: { laengde: 2, bredde: 3 } })!;
    expect(svar.kvadratmeter).toBe(6);
    expect(svar.kvadratcentimeter).toBe(60000);
  });

  test("cirklen med diameter 1 er ca. 7.854 cm²", () => {
    expect(
      arealSvar("cirkel", { cirkel: { diameter: 1 } })!.kvadratcentimeter
    ).toBeCloseTo(7853.98163397, 5);
  });
});

describe("eksempler og formler", () => {
  test("hvert eksempel i AREAL_EKSEMPEL er det, siden faktisk regner", () => {
    // Eksemplerne bruges i metaTitle, FAQ og brødtekst. Mutér en formel, så
    // falder denne test rød — det er derfor de ikke er håndskrevne tal.
    const cases: { input: ArealInput; figur: ArealFigur }[] = [
      { input: { cirkel: { diameter: 1 } }, figur: "cirkel" },
      { input: { trekant: { grundlinje: 2, hoejde: 3 } }, figur: "trekant" },
      { input: { rektangel: { laengde: 2, bredde: 3 } }, figur: "rektangel" },
      { input: { kvadrat: { side: 2 } }, figur: "kvadrat" },
      { input: { trapez: { sideA: 2, sideB: 4, hoejde: 3 } }, figur: "trapez" },
      { input: { parallelogram: { grundlinje: 2, hoejde: 3 } }, figur: "parallelogram" },
      { input: { rombe: { diagonal1: 2, diagonal2: 3 } }, figur: "rombe" },
    ];
    for (const { input, figur } of cases) {
      const svar = arealSvar(figur, input)!;
      const gemt = AREAL_EKSEMPEL[figur].svar;
      expect(svar.kvadratmeter, figur).toBeCloseTo(gemt.kvadratmeter, 9);
      expect(svar.kvadratcentimeter, figur).toBeCloseTo(gemt.kvadratcentimeter, 9);
    }
  });

  test("alle syv figurer har en formel med et gange- eller dividere tegn", () => {
    for (const [figur, formel] of Object.entries(AREAL_FORMEL)) {
      expect(formel, figur).toMatch(/[×÷]/);
      expect(formel, figur).not.toMatch(/Math\.|\*\*|undefined/);
    }
  });

  test("kvadratet har kun ét felt — det har hverken højde eller bredde", () => {
    expect(AREAL_FELT.kvadrat.map((f) => f.nogle)).toEqual(["side"]);
    expect(AREAL_FELT.rombe.map((f) => f.nogle)).toEqual(["diagonal1", "diagonal2"]);
    expect(AREAL_FELT.trapez.map((f) => f.nogle)).toEqual(["sideA", "sideB", "hoejde"]);
  });

  test("alle felter har en dansk og en svensk etiket", () => {
    for (const felter of Object.values(AREAL_FELT)) {
      for (const felt of felter) {
        expect(felt.da.length, felt.nogle).toBeGreaterThan(0);
        expect(felt.se.length, felt.nogle).toBeGreaterThan(0);
      }
    }
  });

  test("trekanten og rektanglet beskrives forskelligt, så de ikke ligner hinanden", () => {
    expect(AREAL_EKSEMPEL.trekant.beskrivelseDa).not.toBe(
      AREAL_EKSEMPEL.rektangel.beskrivelseDa
    );
  });

  test("trapez-eksemplet er ikke det samme som trekant-eksemplet", () => {
    expect(AREAL_EKSEMPEL.trapez.svar.kvadratmeter).not.toBe(
      AREAL_EKSEMPEL.trekant.svar.kvadratmeter
    );
  });
});
