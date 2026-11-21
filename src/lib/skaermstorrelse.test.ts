import { describe, test, expect } from "vitest";
import {
  SEERAFSTAND_FJERN_GRAD,
  SEERAFSTAND_NAER_GRAD,
  SKARM_FORMATER,
  SKARM_STANDARD_FORMAT,
  SKARM_TABEL_TOMMER,
  TOMME_I_CM,
  beregnSeerafstand,
  beregnSkarmMaal,
  seerafstandCm,
} from "./skaermstorrelse";

describe("TOMME_I_CM", () => {
  test("én tomme er præcis 2,54 cm", () => {
    expect(TOMME_I_CM).toBe(2.54);
  });
});

describe("beregnSkarmMaal", () => {
  test("55 tommer i 16:9 giver 139,7 cm diagonalt og 121,8 × 68,5 cm", () => {
    const r = beregnSkarmMaal(55, "16:9")!;
    expect(r.diagonalCm).toBeCloseTo(139.7, 6);
    expect(r.breddeCm).toBeCloseTo(121.759, 3);
    expect(r.hoejdeCm).toBeCloseTo(68.4896, 3);
  });

  test("32 tommer i 16:9 giver 70,8 × 39,8 cm", () => {
    const r = beregnSkarmMaal(32, "16:9")!;
    expect(r.diagonalCm).toBeCloseTo(81.28, 6);
    expect(r.breddeCm).toBeCloseTo(70.8416, 3);
    expect(r.hoejdeCm).toBeCloseTo(39.8485, 3);
  });

  test("4:3 er 3-4-5-trekanten: 55 tommer giver 111,76 × 83,82 cm", () => {
    const r = beregnSkarmMaal(55, "4:3")!;
    expect(r.breddeCm).toBeCloseTo(111.76, 6);
    expect(r.hoejdeCm).toBeCloseTo(83.82, 6);
  });

  test("bredde og højde står i det format, der er valgt", () => {
    const bred = beregnSkarmMaal(50, "16:9")!;
    const ultra = beregnSkarmMaal(50, "21:9")!;
    // Ultrawide er bredere og lavere end 16:9 for samme diagonal.
    expect(ultra.breddeCm).toBeGreaterThan(bred.breddeCm);
    expect(ultra.hoejdeCm).toBeLessThan(bred.hoejdeCm);
    // Diagonalen er den samme, uanset format.
    expect(ultra.diagonalCm).toBeCloseTo(bred.diagonalCm, 9);
  });

  test("diagonalen er altid Pythagoras' læresætning på bredde og højde", () => {
    for (const format of SKARM_FORMATER.map((f) => f.id)) {
      const r = beregnSkarmMaal(65, format)!;
      expect(Math.hypot(r.breddeCm, r.hoejdeCm)).toBeCloseTo(r.diagonalCm, 6);
    }
  });

  test("arealet er bredde gange højde i m²", () => {
    const r = beregnSkarmMaal(55, "16:9")!;
    expect(r.arealM2).toBeCloseTo((r.breddeCm * r.hoejdeCm) / 10_000, 9);
    // Et 55-tommers tv dækker lidt over 0,8 m².
    expect(r.arealM2).toBeGreaterThan(0.8);
    expect(r.arealM2).toBeLessThan(0.85);
  });

  test("tomt, nul eller negativt felt giver intet svar", () => {
    expect(beregnSkarmMaal(0)).toBeNull();
    expect(beregnSkarmMaal(-10)).toBeNull();
    expect(beregnSkarmMaal(Number.NaN)).toBeNull();
    expect(beregnSkarmMaal(Number.POSITIVE_INFINITY)).toBeNull();
  });

  test("uden format bruges 16:9", () => {
    expect(beregnSkarmMaal(55)!.format).toBe(SKARM_STANDARD_FORMAT);
  });
});

describe("seerafstandCm", () => {
  test("en 55-tommers skærm skal ses fra 1,7-2,3 m", () => {
    const { breddeCm } = beregnSkarmMaal(55, "16:9")!;
    const afstand = beregnSeerafstand(breddeCm);
    expect(afstand.naerCm).toBeCloseTo(167.3, 0);
    expect(afstand.fjernCm).toBeCloseTo(227.2, 0);
  });

  test("en mindre synsvinkel giver en længere afstand", () => {
    const bredde = 100;
    expect(seerafstandCm(bredde, SEERAFSTAND_NAER_GRAD)).toBeLessThan(
      seerafstandCm(bredde, SEERAFSTAND_FJERN_GRAD),
    );
  });

  test("afstanden følger formlen bredde ÷ 2 ÷ tan(vinkel ÷ 2)", () => {
    const bredde = 121.759;
    const forventet = bredde / 2 / Math.tan(((35 * Math.PI) / 180) / 2);
    expect(seerafstandCm(bredde, 35)).toBeCloseTo(forventet, 9);
  });

  test("nul bredde giver nul afstand frem for uendelig", () => {
    expect(seerafstandCm(0, 30)).toBe(0);
  });
});

describe("eksempeltabellen", () => {
  test("alle størrelser giver positive mål i 16:9", () => {
    for (const tommer of SKARM_TABEL_TOMMER) {
      const r = beregnSkarmMaal(tommer, "16:9")!;
      expect(r.breddeCm, `${tommer}"`).toBeGreaterThan(0);
      expect(r.hoejdeCm, `${tommer}"`).toBeGreaterThan(0);
      // Bredden vokser med diagonalen.
      expect(r.breddeCm).toBeGreaterThan(tommer * 2);
    }
  });

  test("tabellen er sorteret og uden dubletter", () => {
    const sorteret = [...SKARM_TABEL_TOMMER].sort((a, b) => a - b);
    expect(SKARM_TABEL_TOMMER).toEqual(sorteret);
    expect(new Set(SKARM_TABEL_TOMMER).size).toBe(SKARM_TABEL_TOMMER.length);
  });
});
