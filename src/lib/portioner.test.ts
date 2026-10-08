import { describe, expect, test } from "vitest";
import {
  PORTIONER_KATEGORIER,
  PORTIONER_STANDARD_ANTAL,
  PORTIONER_VARER,
  beregnPortioner,
  formatPortion,
  vareVedId,
} from "./portioner";

describe("portioner — tabellen", () => {
  test("hver vare har et ordnet interval og en kendt kategori", () => {
    for (const v of PORTIONER_VARER) {
      expect(v.min).toBeGreaterThan(0);
      expect(v.max).toBeGreaterThanOrEqual(v.min);
      expect(PORTIONER_KATEGORIER).toContain(v.kategori);
    }
  });

  test("id'erne er unikke", () => {
    const ider = PORTIONER_VARER.map((v) => v.id);
    expect(new Set(ider).size).toBe(ider.length);
  });

  test("pasta, ris og kartofler står med kildens tal", () => {
    expect(vareVedId("pasta-toerret")).toMatchObject({ min: 75, max: 100, enhed: "g" });
    expect(vareVedId("pasta-frisk")).toMatchObject({ min: 125, max: 150, enhed: "g" });
    expect(vareVedId("kartofler")).toMatchObject({ min: 150, max: 250, enhed: "g" });
    expect(vareVedId("ris")).toMatchObject({ min: 1, max: 1, enhed: "dl" });
  });

  test("ukendt id giver undefined", () => {
    expect(vareVedId("findes-ikke")).toBeUndefined();
  });
});

describe("portioner — beregningen", () => {
  test("ganger den anbefalede mængde med antallet af personer", () => {
    const raekker = beregnPortioner(4);
    const pasta = raekker.find((r) => r.id === "pasta-toerret")!;
    expect(pasta.totalMin).toBe(300);
    expect(pasta.totalMax).toBe(400);
  });

  test("behandler nul, negative tal og ikke-tal som nul personer", () => {
    for (const antal of [0, -3, Number.NaN]) {
      const raekker = beregnPortioner(antal);
      expect(raekker.every((r) => r.totalMin === 0 && r.totalMax === 0)).toBe(true);
    }
  });

  test("antallet kan være et decimaltal", () => {
    const ris = beregnPortioner(2.5).find((r) => r.id === "ris")!;
    expect(ris.totalMin).toBe(2.5);
  });
});

describe("portioner — formatering", () => {
  test("skriver mængden med dansk talformat og enhed", () => {
    expect(formatPortion(1000, "g")).toBe("1.000 g");
    expect(formatPortion(4, "dl")).toBe("4 dl");
  });
});

describe("portioner — standardvalget", () => {
  test("starter på fire personer", () => {
    expect(PORTIONER_STANDARD_ANTAL).toBe(4);
  });
});
