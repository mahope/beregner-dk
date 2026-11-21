import { describe, expect, test } from "vitest";
import {
  CENTIMETER_PR_METER,
  MAX_MAAL_M,
  MIN_MAAL_M,
  OMKREDS_EKSEMPEL,
  OMKREDS_FELT,
  OMKREDS_FORMEL,
  omkreds,
  omkredsSvar,
  type OmkredsFigur,
  type OmkredsInput,
} from "./omkreds";

/**
 * Porten dømmer på **tal**, ikke på at der står «m» i markup'en. Hver formel er
 * derfor dømt mod et håndregnet tal, og de er valgt, så en glemt faktor giver
 * et *andet* tal:
 *
 * | figur         | mål                  | forventet |
 * |---------------|----------------------|-----------|
 * | cirkel        | d = 1 m              | π ≈ 3,14 m |
 * | kvadrat       | s = 2 m              | 8 m       |
 * | rektangel     | 2 × 3 m              | 10 m      |
 * | trekant       | a = 3, b = 4, c = 5  | 12 m      |
 * | trapez        | a = 2, b = 4, c = 3, d = 3 | 12 m |
 * | parallelogram | a = 3, b = 2         | 10 m      |
 * | rombe         | s = 2 m              | 8 m       |
 *
 * Cirklen er valgt, fordi radius-for-diameter-fejlen giver 2π i stedet for π.
 * Rektanglet er valgt, fordi en glemt faktor 2 giver 5 m i stedet for 10 m.
 */

describe("omkreds", () => {
  test("cirkel med diameter 1 er pi", () => {
    expect(omkreds("cirkel", { cirkel: { diameter: 1 } })).toBeCloseTo(Math.PI, 9);
  });

  test("cirkel med diameter 2 er 2pi — læses diameteren som radius, bliver det 4pi", () => {
    expect(omkreds("cirkel", { cirkel: { diameter: 2 } })).toBeCloseTo(2 * Math.PI, 9);
  });

  test("kvadrat er fire sider", () => {
    expect(omkreds("kvadrat", { kvadrat: { side: 2 } })).toBe(8);
    expect(omkreds("kvadrat", { kvadrat: { side: 3 } })).toBe(12);
  });

  test("rektangel er 2 × (længde + bredde) — ikke længde + bredde", () => {
    expect(omkreds("rektangel", { rektangel: { laengde: 2, bredde: 3 } })).toBe(10);
    expect(omkreds("rektangel", { rektangel: { laengde: 4, bredde: 5 } })).toBe(18);
  });

  test("trekant er summen af de tre sider", () => {
    expect(omkreds("trekant", { trekant: { sideA: 3, sideB: 4, sideC: 5 } })).toBe(12);
    expect(omkreds("trekant", { trekant: { sideA: 2, sideB: 2, sideC: 3 } })).toBe(7);
  });

  test("trapez er summen af alle fire sider", () => {
    expect(
      omkreds("trapez", { trapez: { sideA: 2, sideB: 4, sideC: 3, sideD: 3 } })
    ).toBe(12);
    expect(
      omkreds("trapez", { trapez: { sideA: 1, sideB: 2, sideC: 3, sideD: 4 } })
    ).toBe(10);
  });

  test("parallelogram er 2 × (a + b)", () => {
    expect(omkreds("parallelogram", { parallelogram: { sideA: 3, sideB: 2 } })).toBe(10);
    expect(omkreds("parallelogram", { parallelogram: { sideA: 5, sideB: 4 } })).toBe(18);
  });

  test("rombe er fire lige sider", () => {
    expect(omkreds("rombe", { rombe: { side: 2 } })).toBe(8);
    expect(omkreds("rombe", { rombe: { side: 5 } })).toBe(20);
  });

  test("en figur slet ikke i inputtet giver undefined, ikke NaN eller 0", () => {
    expect(omkreds("cirkel", {})).toBeUndefined();
    expect(omkredsSvar("trekant", {})).toBeUndefined();
    expect(omkreds("kvadrat", { cirkel: { diameter: 1 } })).toBeUndefined();
  });

  test("et felt der mangler i et rektangel kaster, så NaN aldrig vises som 0 m", () => {
    expect(() =>
      omkreds("rektangel", { rektangel: { laengde: 2 } as never })
    ).toThrow(/Bredden/);
  });

  test("et felt der mangler i en trekant kaster", () => {
    expect(() =>
      omkreds("trekant", { trekant: { sideA: 3, sideB: 4 } as never })
    ).toThrow(/Side c/);
  });

  test("mål under bunden og over loftet afvises, så et felt ikke viser 0 m", () => {
    const for_lille = { kvadrat: { side: MIN_MAAL_M / 2 } };
    const for_stort = { cirkel: { diameter: MAX_MAAL_M * 2 } };
    expect(() => omkreds("kvadrat", for_lille)).toThrow();
    expect(() => omkreds("cirkel", for_stort)).toThrow();
    expect(() => omkreds("kvadrat", { kvadrat: { side: Number.NaN } })).toThrow();
  });

  test("grænsen selv er gyldig, så et felt ikke låses ude med sin egen minimum", () => {
    expect(omkreds("cirkel", { cirkel: { diameter: MIN_MAAL_M } })).toBeGreaterThan(0);
    expect(omkreds("kvadrat", { kvadrat: { side: MAX_MAAL_M } })).toBe(4 * MAX_MAAL_M);
  });
});

describe("centimeter", () => {
  test("1 m er 100 cm", () => {
    expect(CENTIMETER_PR_METER).toBe(100);
  });

  test("svaret bærer begge enheder, og de er samme tal ganget", () => {
    const svar = omkredsSvar("rektangel", { rektangel: { laengde: 2, bredde: 3 } })!;
    expect(svar.meter).toBe(10);
    expect(svar.centimeter).toBe(1000);
  });

  test("cirklen med diameter 1 er ca. 314,16 cm", () => {
    expect(
      omkredsSvar("cirkel", { cirkel: { diameter: 1 } })!.centimeter
    ).toBeCloseTo(314.15926536, 5);
  });
});

describe("eksempler og formler", () => {
  test("hvert eksempel i OMKREDS_EKSEMPEL er det, siden faktisk regner", () => {
    const cases: { input: OmkredsInput; figur: OmkredsFigur }[] = [
      { input: { cirkel: { diameter: 1 } }, figur: "cirkel" },
      { input: { kvadrat: { side: 2 } }, figur: "kvadrat" },
      { input: { rektangel: { laengde: 2, bredde: 3 } }, figur: "rektangel" },
      { input: { trekant: { sideA: 3, sideB: 4, sideC: 5 } }, figur: "trekant" },
      { input: { trapez: { sideA: 2, sideB: 4, sideC: 3, sideD: 3 } }, figur: "trapez" },
      { input: { parallelogram: { sideA: 3, sideB: 2 } }, figur: "parallelogram" },
      { input: { rombe: { side: 2 } }, figur: "rombe" },
    ];
    for (const { input, figur } of cases) {
      const svar = omkredsSvar(figur, input)!;
      const gemt = OMKREDS_EKSEMPEL[figur].svar;
      expect(svar.meter, figur).toBeCloseTo(gemt.meter, 9);
      expect(svar.centimeter, figur).toBeCloseTo(gemt.centimeter, 9);
    }
  });

  test("alle syv figurer har en formel med et gange- eller plusstegn", () => {
    for (const [figur, formel] of Object.entries(OMKREDS_FORMEL)) {
      expect(formel, figur).toMatch(/[×+]/);
      expect(formel, figur).not.toMatch(/Math\.|\*\*|undefined/);
    }
  });

  test("kvadratet og romben har kun ét felt", () => {
    expect(OMKREDS_FELT.kvadrat.map((f) => f.nogle)).toEqual(["side"]);
    expect(OMKREDS_FELT.rombe.map((f) => f.nogle)).toEqual(["side"]);
    expect(OMKREDS_FELT.rektangel.map((f) => f.nogle)).toEqual(["laengde", "bredde"]);
  });

  test("alle felter har en dansk og en svensk etiket", () => {
    for (const felter of Object.values(OMKREDS_FELT)) {
      for (const felt of felter) {
        expect(felt.da.length, felt.nogle).toBeGreaterThan(0);
        expect(felt.se.length, felt.nogle).toBeGreaterThan(0);
      }
    }
  });

  test("trekanten og trapezet beskrives forskelligt, så de ikke ligner hinanden", () => {
    expect(OMKREDS_EKSEMPEL.trekant.beskrivelseDa).not.toBe(
      OMKREDS_EKSEMPEL.trapez.beskrivelseDa
    );
  });
});
