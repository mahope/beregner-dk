import { describe, it, expect } from "vitest";
import {
  BARNETILSKUD_2026,
  BARNETILSKUD_2026_KILDE,
  barnetilskudSats,
  enligtilskudPrKvartal,
  flerlingBelob,
  pensionistNedaettelse,
} from "./barnetilskud";

describe("BARNETILSKUD_2026", () => {
  it("har beløbene fra borger.dk (2026)", () => {
    expect(BARNETILSKUD_2026.map((s) => [s.type, s.belob])).toEqual([
      ["ordinært", 1741],
      ["ekstra", 1774],
      ["særligt-adoption", 5025],
      ["flerlinger", 2874],
      ["pensionist-begge", 1741],
      ["pensionist-en", 4449],
    ]);
  });

  it("har en kilde og en verificeringsdato", () => {
    expect(BARNETILSKUD_2026_KILDE.source).toMatch(/^https:\/\/www\.borger\.dk\//);
    expect(BARNETILSKUD_2026_KILDE.source).toMatch(/boernetilskud$/);
    expect(BARNETILSKUD_2026_KILDE.verifiedAt).toBe("2026-09-25");
  });

  it("udbetaler alle beløb pr. kvartal", () => {
    for (const sats of BARNETILSKUD_2026) {
      expect(sats.interval).toBe("kvartal");
    }
  });

  it("markerer kun pensionistbeløbene som indkomstafhængige", () => {
    const afhaengige = BARNETILSKUD_2026.filter((s) => s.afhaengerAfIndkomst).map((s) => s.type);
    expect(afhaengige).toEqual(["pensionist-begge", "pensionist-en"]);
  });

  it("har skattefrit beløb for alle typer", () => {
    for (const sats of BARNETILSKUD_2026) {
      expect(sats.skattefrit).toBe(true);
    }
  });

  it("har kilder for frister, udbetalingsdatoer og enkeltårende erklæring", () => {
    expect(BARNETILSKUD_2026_KILDE.udbetaalingsdatoerNavn).toEqual([
      "20. januar",
      "20. april",
      "20. juli",
      "20. oktober",
    ]);
    expect(BARNETILSKUD_2026_KILDE.frister).toHaveLength(4);
    expect(BARNETILSKUD_2026_KILDE.frister[0]).toEqual({
      senest: "31. december",
      fra: "1. januar",
    });
    expect(BARNETILSKUD_2026_KILDE.enligErklaering.senest).toBe("5. november");
    expect(BARNETILSKUD_2026_KILDE.enligErklaering.stoppesFraAar).toBe(2027);
    expect(BARNETILSKUD_2026_KILDE.optjening.aar).toBe(6);
  });
});

describe("barnetilskudSats", () => {
  it("finder hver type", () => {
    expect(barnetilskudSats("ordinært").belob).toBe(1741);
    expect(barnetilskudSats("ekstra").belob).toBe(1774);
    expect(barnetilskudSats("særligt-adoption").belob).toBe(5025);
    expect(barnetilskudSats("flerlinger").belob).toBe(2874);
    expect(barnetilskudSats("pensionist-en").belob).toBe(4449);
  });

  it("kaster ved ukendt type", () => {
    expect(() => barnetilskudSats("ukendt" as never)).toThrow(/Ukendt børnetilskudstype/);
  });
});

describe("flerlingBelob", () => {
  it("giver intet for under to børn", () => {
    expect(flerlingBelob(1)).toBe(0);
    expect(flerlingBelob(0)).toBe(0);
    expect(flerlingBelob(-1)).toBe(0);
  });

  it("giver ét tilskud til tvillinger og to til trillinger", () => {
    expect(flerlingBelob(2)).toBe(2874);
    expect(flerlingBelob(3)).toBe(5748);
    expect(flerlingBelob(4)).toBe(8622);
  });

  it("giver 0 ved ugyldigt input", () => {
    expect(flerlingBelob(Number.NaN)).toBe(0);
  });
});

describe("enligtilskudPrKvartal", () => {
  it("lægger ordinært pr. barn sammen med det ene ekstra tilskud", () => {
    expect(enligtilskudPrKvartal(1)).toBe(1741 + 1774);
    expect(enligtilskudPrKvartal(2)).toBe(2 * 1741 + 1774);
    expect(enligtilskudPrKvartal(3)).toBe(3 * 1741 + 1774);
  });

  it("kun én ekstra udbetaling uanset antal børn", () => {
    expect(enligtilskudPrKvartal(5) - enligtilskudPrKvartal(4)).toBe(1741);
  });

  it("giver 0 uden børn", () => {
    expect(enligtilskudPrKvartal(0)).toBe(0);
    expect(enligtilskudPrKvartal(Number.NaN)).toBe(0);
  });
});

describe("pensionistNedaettelse", () => {
  const grænse = 66500;

  it("giver ingen nedsættelse under eller ved grænsen", () => {
    expect(pensionistNedaettelse(66500, grænse)).toBe(0);
    expect(pensionistNedaettelse(50000, grænse)).toBe(0);
  });

  it("nedsætter med 3 % af indkomsten over grænsen", () => {
    expect(pensionistNedaettelse(76500, grænse)).toBeCloseTo(300, 6);
    expect(pensionistNedaettelse(166500, grænse)).toBeCloseTo(3000, 6);
  });

  it("giver 0 ved ugyldigt input", () => {
    expect(pensionistNedaettelse(Number.NaN, grænse)).toBe(0);
    expect(pensionistNedaettelse(100000, Number.NaN)).toBe(0);
  });
});
