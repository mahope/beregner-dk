/**
 * ValutaBeregner's currency `<select>` showed Danish names on beraknare.se and
 * beregner.no — "Britiske Pund", "Svenske Kroner", "Danske Kroner" — because
 * `VALUTA_METADATA` only ever held one name per code and `getValutaNavn` read
 * it unconditionally.
 *
 * The two traps this file exists to close:
 *  1. The names are read through a helper at the *display* site, not at a
 *     `locale === "…"` ternary, so `locale-leak.mjs` judges them out of scope.
 *     The leak was found by crawling the **built** server, not the source.
 *  2. "Euro", "Schweizerfranc" and "US Dollar" are spelled the same in Danish
 *     and Swedish. A test that asserted "no Danish word appears" would pass on
 *     master's code, because the Danish names it should have caught are all
 *     words the Swedish list also needs. So the lock is **per locale and per
 *     code**: the Swedish page must contain "Brittiska pund" and must not
 *     contain "Britiske Pund".
 */
process.env.TZ = "Europe/Copenhagen";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { LocaleProvider } from "./LocaleProvider";
import ValutaBeregner, { valutaNavn } from "./ValutaBeregner";
import { getDomainConfig } from "@/lib/domain-config";

const daDomain = getDomainConfig("localhost");
const seDomain = getDomainConfig("beraknare.se");
const noDomain = getDomainConfig("beregner.no");

function renderValuta(locale: "da" | "se" | "no") {
  const domainConfig =
    locale === "se" ? seDomain : locale === "no" ? noDomain : daDomain;
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <ValutaBeregner />
    </LocaleProvider>,
  );
}

/** The option labels of the "til" select, which is the one with the names. */
function valutaValg(): string[] {
  const selects = screen.getAllByRole("combobox");
  const options = selects[selects.length - 1].querySelectorAll("option");
  return Array.from(options, (o) => o.textContent ?? "");
}

describe("ValutaBeregner — valutanamn pr. sprog", () => {
  afterEach(cleanup);

  test("den svenska sidan visar Brittiska pund, inte Britiske Pund", () => {
    renderValuta("se");
    const valg = valutaValg().join(" | ");
    expect(valg).toContain("Brittiska pund");
    expect(valg).not.toContain("Britiske Pund");
    expect(valg).not.toContain("Svenske Kroner");
    expect(valg).toContain("Svenska kronor");
    expect(valg).toContain("Danska kronor");
    expect(valg).not.toContain("Danske Kroner");
  });

  test("den norska sidan bruker Pund sterling, ikke Britiske Pund", () => {
    renderValuta("no");
    const valg = valutaValg().join(" | ");
    expect(valg).toContain("Pund sterling");
    expect(valg).not.toContain("Britiske Pund");
  });

  test("dansk er uændret: de danske navn er stadig de danske", () => {
    renderValuta("da");
    const valg = valutaValg().join(" | ");
    expect(valg).toContain("Britiske Pund");
    expect(valg).toContain("Svenske Kroner");
    expect(valg).toContain("Danske Kroner");
  });

  test("valutaNavn() dækker alle 14 koder i alle tre sprog", () => {
    const koder = [
      "DKK", "EUR", "USD", "GBP", "SEK", "NOK", "CHF", "JPY",
      "PLN", "CZK", "TRY", "AUD", "CAD", "THB",
    ];
    for (const kode of koder) {
      for (const locale of ["da", "se", "no"]) {
        const navn = valutaNavn(kode, locale);
        expect(navn, `${kode}/${locale}`).toBeTruthy();
        // A name that fell through to the code would be a silent hole: the
        // dropdown would show "XXX" instead of a currency.
        expect(navn, `${kode}/${locale}`).not.toBe(kode);
      }
    }
  });

  test("den svenska listen har ingen danske endelser på de navn der adskiller sig", () => {
    renderValuta("se");
    const valg = valutaValg().join(" | ");
    // "…ske" is the Danish plural on the names that differ. Euro and
    // Schweizerfranc do not have it in Danish, so they cannot catch this.
    for (const dansk of [
      "Britiske Pund", "Svenske Kroner", "Norske Kroner", "Danske Kroner",
      "Japanske Yen", "Polske Zloty", "Tjekkiske Koruna", "Tyrkiske Lira",
      "Australske Dollar", "Canadiske Dollar", "Thailandske Baht",
    ]) {
      expect(valg, dansk).not.toContain(dansk);
    }
  });
});
