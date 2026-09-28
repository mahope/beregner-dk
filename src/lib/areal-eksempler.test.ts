import { describe, expect, test } from "vitest";
import { AREAL_EKSEEMPLER, PI_TO_DECIMALER, PRIS_EKSEMPEL, arealEksempel } from "./areal-eksempler";

describe("areal-eksempler", () => {
  test("de fire eksempler er præcis de tal, der står trykt på siden", () => {
    // Regnestykkerne i /kvadratmeters "metoden med tal" — begge sproggrene.
    expect(arealEksempel("rektangel").areal).toBe(5 * 4);
    expect(arealEksempel("cirkel").areal).toBeCloseTo(PI_TO_DECIMALER * 3 * 3, 10);
    expect(arealEksempel("trekant").areal).toBe((6 * 4) / 2);
    expect(arealEksempel("trapez").areal).toBe(((4 + 6) / 2) * 3);
  });

  test("de afrundes til de facit, der står i teksten", () => {
    // Én decimal i cirkel-eksemplet, resten er heltal — det er de tal, læseren
    // skal kunne efterprøve på egen hånd.
    expect(arealEksempel("cirkel").areal.toFixed(1)).toBe("28.3");
    for (const id of ["rektangel", "trekant", "trapez"] as const) {
      expect(Number.isInteger(arealEksempel(id).areal)).toBe(true);
    }
  });

  test("rækkefølgen er den samme i begge sproggrene", () => {
    expect(AREAL_EKSEEMPLER.map((eksempel) => eksempel.id)).toEqual([
      "rektangel",
      "cirkel",
      "trekant",
      "trapez",
    ]);
  });

  test("priseksemplet er 20 m² til 150 kr = 3.000 kr", () => {
    expect(PRIS_EKSEMPEL.pris).toBe(PRIS_EKSEMPEL.areal * PRIS_EKSEMPEL.prisPrM2);
    expect(PRIS_EKSEMPEL.pris).toBe(3000);
  });

  test("en ukendt id er en fejl, ikke et tomt eksempel", () => {
    // @ts-expect-error — bevidst ugyldig id
    expect(() => arealEksempel("femkant")).toThrow(/Ukendt arealeksempel/);
  });
});
