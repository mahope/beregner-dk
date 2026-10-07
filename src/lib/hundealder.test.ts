import { describe, expect, test } from "vitest";
import {
  AAR_1_I_MENNESKEAAR,
  AAR_2_I_MENNESKEAAR,
  HUNDEALDER_EKSEMPEL,
  HUNDE_STORRELSER,
  HUNDE_STORRELSE_ORDER,
  MAX_HUNDE_AAR,
  MIN_HUNDE_AAR,
  hundealderFaqSvar,
  hundealderSvar,
  livsfase,
  menneskeAar,
  regnestykke,
  type HundeStorrelse,
} from "./hundealder";

/**
 * Porten dømmer på **tal**, ikke på at der står «menneskeår» i markup'en.
 * Forventningerne er læst af den offentliggjorte AVMA/AKC-tabel, så en fejl i
 * et af de tre led (15, 9 eller 4-7) giver et *andet* tal:
 *
 * | alder | lille | mellem | stor | kæmpe |
 * |-------|-------|--------|------|-------|
 * | 1     | 15    | 15     | 15   | 15    |
 * | 2     | 24    | 24     | 24   | 24    |
 * | 3     | 28    | 29     | 30   | 31    |
 * | 10    | 56    | 64     | 72   | 80    |
 *
 * Række 1 og 2 er fælles for alle størrelser — falder de, er det de to første
 * led der er skrevet forkert. Række 3 og 10 skiller størrelserne ad, så et
 * byttet `aarEfterTo` (fx 4 for alle) giver et andet tal for stor og kæmpe.
 */

describe("menneskeAar — de to første år", () => {
  test("et hundår er 15 menneskeår for alle størrelser", () => {
    for (const storrelse of HUNDE_STORRELSE_ORDER) {
      expect(menneskeAar(1, storrelse)).toBe(AAR_1_I_MENNESKEAAR);
    }
  });

  test("to hundår er 24 menneskeår — det andet år lægger 9 til", () => {
    for (const storrelse of HUNDE_STORRELSE_ORDER) {
      expect(menneskeAar(2, storrelse)).toBe(AAR_2_I_MENNESKEAAR);
    }
  });

  test("et halvt år er 7,5 menneskeår — lineært i det første år", () => {
    expect(menneskeAar(0.5, "mellem")).toBe(7.5);
  });

  test("halvandet år er 19,5 — lineært mellem 15 og 24", () => {
    expect(menneskeAar(1.5, "mellem")).toBe(19.5);
  });

  test("nul år er nul menneskeår", () => {
    expect(menneskeAar(0, "stor")).toBe(0);
  });
});

describe("menneskeAar — efter to år, pr. størrelse", () => {
  test("den offentliggjorte tabel stemmer", () => {
    // [hundAar, lille, mellem, stor, kæmpe]
    const tabel: [number, number, number, number, number][] = [
      [3, 28, 29, 30, 31],
      [5, 36, 39, 42, 45],
      [10, 56, 64, 72, 80],
    ];
    for (const [aar, lille, mellem, stor, kaempe] of tabel) {
      expect(menneskeAar(aar, "lille")).toBe(lille);
      expect(menneskeAar(aar, "mellem")).toBe(mellem);
      expect(menneskeAar(aar, "stor")).toBe(stor);
      expect(menneskeAar(aar, "kaempe")).toBe(kaempe);
    }
  });

  test("en stor hund på 10 år er 72, en lille er 56 — 16 års forskel", () => {
    const lille = menneskeAar(10, "lille");
    const stor = menneskeAar(10, "stor");
    expect(stor - lille).toBe(16);
  });

  test("hvert år efter to lægger præcis aarEfterTo til", () => {
    for (const storrelse of HUNDE_STORRELSE_ORDER) {
      const rate = HUNDE_STORRELSER[storrelse].aarEfterTo;
      expect(menneskeAar(5, storrelse) - menneskeAar(4, storrelse)).toBe(rate);
    }
  });

  test("en kæmpehund ældes hurtigst — 7 menneskeår pr. hundår efter to", () => {
    expect(HUNDE_STORRELSER.kaempe.aarEfterTo).toBe(7);
    expect(menneskeAar(3, "kaempe")).toBe(31);
  });
});

describe("menneskeAar — grænser", () => {
  test("kaster på en alder over maksimum", () => {
    expect(() => menneskeAar(MAX_HUNDE_AAR + 1, "mellem")).toThrow();
  });

  test("kaster på en negativ alder", () => {
    expect(() => menneskeAar(MIN_HUNDE_AAR - 1, "mellem")).toThrow();
  });

  test("kaster på en ukendt størrelse", () => {
    expect(() => menneskeAar(5, "kaempel" as HundeStorrelse)).toThrow();
  });
});

describe("livsfase", () => {
  test("hvalp det første år, unghund det andet", () => {
    expect(livsfase(0.5, "mellem")).toBe("hvalp");
    expect(livsfase(1.5, "mellem")).toBe("unghund");
  });

  test("små og mellemstore hunde er seniorer ved 7 år", () => {
    expect(livsfase(6.9, "mellem")).toBe("voksen");
    expect(livsfase(7, "mellem")).toBe("senior");
    expect(livsfase(7, "lille")).toBe("senior");
  });

  test("store hunde er seniorer ved 6 og kæmpehunde ved 5", () => {
    expect(livsfase(5.9, "stor")).toBe("voksen");
    expect(livsfase(6, "stor")).toBe("senior");
    expect(livsfase(4.9, "kaempe")).toBe("voksen");
    expect(livsfase(5, "kaempe")).toBe("senior");
  });
});

describe("hundealderSvar", () => {
  test("samler alder og livsfase", () => {
    const svar = hundealderSvar(7, "mellem");
    expect(svar.menneskeAar).toBe(49);
    expect(svar.livsfase).toBe("senior");
  });
});

describe("regnestykke", () => {
  test("viser de tre led for en hund over to år", () => {
    expect(regnestykke(7, "mellem")).toBe("15 + 9 + 5 × 5 = 49");
  });

  test("viser det andet led for en hund på halvandet år", () => {
    expect(regnestykke(1.5, "mellem")).toBe("15 + 9 × 0,5 = 19,5");
  });

  test("viser det første led for en hvalp", () => {
    expect(regnestykke(0.5, "mellem")).toBe("15 × 0,5 = 7,5");
  });
});

describe("hundealderFaqSvar", () => {
  test("nævner både alderen, størrelsen og regnestykket", () => {
    const svar = hundealderFaqSvar(7, "mellem");
    expect(svar).toContain("49");
    expect(svar).toContain("mellem");
    expect(svar).toContain("15 + 9 + 5 × 5 = 49");
  });
});

describe("HUNDEALDER_EKSEMPEL", () => {
  test("er regnet fra samme funktion som værktøjet", () => {
    expect(HUNDEALDER_EKSEMPEL.menneskeAar).toBe(
      menneskeAar(HUNDEALDER_EKSEMPEL.hundAar, HUNDEALDER_EKSEMPEL.storrelse)
    );
    expect(HUNDEALDER_EKSEMPEL.menneskeAar).toBe(49);
  });
});
