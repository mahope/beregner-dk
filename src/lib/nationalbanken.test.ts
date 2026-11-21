import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { parseNationalbankXml } from "./nationalbanken";

const fixture = readFileSync(path.join(__dirname, "__fixtures__", "nationalbanken-kurser.xml"), "utf-8");

describe("parseNationalbankXml", () => {
  test("læser dato og kurser pr. 1 enhed fra fixture (med BOM)", () => {
    const r = parseNationalbankXml(fixture)!;
    expect(r.dato).toBe("2026-09-24");
    expect(r.kurser.EUR).toBeCloseTo(7.4756, 6);
    expect(r.kurser.USD).toBeCloseTo(6.5766, 6);
    expect(r.kurser.SEK).toBeCloseTo(0.6636, 6);
    expect(r.kurser.IDR).toBeCloseTo(0.000367, 8);
    expect(r.kurser.DKK).toBeUndefined();
  });

  test("dækker alle valutaer, som beregneren viser", () => {
    const r = parseNationalbankXml(fixture)!;
    for (const k of ["EUR", "USD", "GBP", "SEK", "NOK", "CHF", "JPY", "PLN", "CZK", "TRY", "AUD", "CAD", "THB"]) {
      expect(r.kurser[k], k).toBeGreaterThan(0);
    }
  });

  test("håndterer tusindtalsseparator og springer ugyldige rækker over", () => {
    const xml =
      '<exchangerates type="Valutakurser" refcur="DKK" refamt="1"><dailyrates id="2026-01-02">' +
      '<currency code="XAU" desc="Guld" rate="1.234,50" /><currency code="EUR" desc="Euro" rate="-" />' +
      '<currency code="usd" rate="650,00" /></dailyrates></exchangerates>';
    expect(parseNationalbankXml(xml)).toEqual({ dato: "2026-01-02", kurser: { XAU: 12.345 } });
  });

  test("afviser HTML-fejlsider og tomme svar", () => {
    expect(parseNationalbankXml("<html><body>Fejl</body></html>")).toBeNull();
    expect(parseNationalbankXml("")).toBeNull();
    expect(
      parseNationalbankXml('<exchangerates refcur="DKK"><dailyrates id="2026-01-02"></dailyrates></exchangerates>'),
    ).toBeNull();
  });
});
