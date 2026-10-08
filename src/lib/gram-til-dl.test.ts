import { describe, expect, test } from "vitest";
import {
  GRAM_TIL_DL_EKSEMPEL,
  GRAM_TIL_DL_VARER,
  beregnGramTilDl,
  dlTilGram,
  formatGramTilDl,
  gramTilDl,
  gramTilDlEksempel,
  vareVedId,
} from "./gram-til-dl";

describe("gram-til-dl — tabellen", () => {
  test("hver vare har et positivt antal gram pr. dl", () => {
    for (const vare of GRAM_TIL_DL_VARER) {
      expect(vare.gramPrDl).toBeGreaterThan(0);
    }
  });

  test("ingen vare-id'er eller navne er dubletter", () => {
    const ider = GRAM_TIL_DL_VARER.map((v) => v.id);
    const navne = GRAM_TIL_DL_VARER.map((v) => v.navn);
    expect(new Set(ider).size).toBe(ider.length);
    expect(new Set(navne).size).toBe(navne.length);
  });

  test("de mest søgte varer er med", () => {
    for (const id of ["hvedemel", "sukker", "havregryn", "brun-farin", "ris"]) {
      expect(vareVedId(id)).toBeDefined();
    }
  });

  test("værdierne matcher kildens tabel", () => {
    // Illustreret Videnskab: 1 dl = X g.
    expect(vareVedId("hvedemel")?.gramPrDl).toBe(60);
    expect(vareVedId("sukker")?.gramPrDl).toBe(85);
    expect(vareVedId("havregryn")?.gramPrDl).toBe(30);
    expect(vareVedId("brun-farin")?.gramPrDl).toBe(60);
    expect(vareVedId("ris")?.gramPrDl).toBe(80);
    expect(vareVedId("vaeske")?.gramPrDl).toBe(100);
  });

  test("ukendt id giver undefined", () => {
    expect(vareVedId("finnes-ikke")).toBeUndefined();
  });
});

describe("gram-til-dl — omregningen", () => {
  test("150 g hvedemel er 2,5 dl", () => {
    expect(gramTilDl(150, 60)).toBeCloseTo(2.5, 10);
  });

  test("2 dl sukker er 170 g", () => {
    expect(dlTilGram(2, 85)).toBeCloseTo(170, 10);
  });

  test("en væske med tætheden 100 giver samme tal i gram og dl", () => {
    expect(gramTilDl(250, 100)).toBeCloseTo(2.5, 10);
    expect(dlTilGram(2.5, 100)).toBeCloseTo(250, 10);
  });

  test("de to retninger ophæver hinanden", () => {
    for (const vare of GRAM_TIL_DL_VARER) {
      const gram = 175;
      const dl = gramTilDl(gram, vare.gramPrDl);
      expect(dlTilGram(dl, vare.gramPrDl)).toBeCloseTo(gram, 8);
    }
  });

  test("ugyldig eller negativ tæthed giver 0, ikke uendeligt eller NaN", () => {
    expect(gramTilDl(100, 0)).toBe(0);
    expect(gramTilDl(100, -5)).toBe(0);
    expect(gramTilDl(100, Number.NaN)).toBe(0);
    expect(dlTilGram(1, 0)).toBe(0);
    expect(dlTilGram(Number.POSITIVE_INFINITY, 60)).toBe(0);
  });

  test("negativ mængde giver 0", () => {
    expect(gramTilDl(-10, 60)).toBeLessThanOrEqual(0);
  });
});

describe("gram-til-dl — valg og svar", () => {
  test("gram-til-dl svarer i dl", () => {
    const svar = beregnGramTilDl({ vareId: "hvedemel", maengde: 150, retning: "gram-til-dl" });
    expect(svar.svar).toBeCloseTo(2.5, 10);
    expect(svar.svarEnhed).toBe("dl");
    expect(svar.maengdeEnhed).toBe("g");
  });

  test("dl-til-gram svarer i gram", () => {
    const svar = beregnGramTilDl({ vareId: "sukker", maengde: 2, retning: "dl-til-gram" });
    expect(svar.svar).toBeCloseTo(170, 10);
    expect(svar.svarEnhed).toBe("g");
    expect(svar.maengdeEnhed).toBe("dl");
  });

  test("ukendt vare falder tilbage til den første i tabellen", () => {
    const svar = beregnGramTilDl({ vareId: "finnes-ikke", maengde: 60, retning: "gram-til-dl" });
    expect(svar.vare.id).toBe(GRAM_TIL_DL_VARER[0].id);
  });

  test("eksemplet er 150 g hvedemel = 2,5 dl", () => {
    const svar = gramTilDlEksempel();
    expect(GRAM_TIL_DL_EKSEMPEL.vareId).toBe("hvedemel");
    expect(svar.svar).toBeCloseTo(2.5, 10);
    expect(svar.svarEnhed).toBe("dl");
  });
});

describe("gram-til-dl — formatering", () => {
  test("dansk komma og højst to decimaler", () => {
    expect(formatGramTilDl(2.5)).toBe("2,5");
    expect(formatGramTilDl(1.666666)).toBe("1,67");
    expect(formatGramTilDl(170, 0)).toBe("170");
  });
});
