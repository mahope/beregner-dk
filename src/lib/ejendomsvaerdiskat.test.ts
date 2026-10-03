import { describe, expect, test } from "vitest";
import {
  beregnEjendomsvaerdiskat,
  EKSEMPEL,
  EKSEMPEL_INPUT,
  EKSEMPEL_TEKST,
  EJENDOMSVAERDISKAT,
  GRUNDSKYLD_KOMMUNER,
  grundskyldPromilleFor,
  kr,
  satsTilProcent,
  satsTilPromille,
} from "./ejendomsvaerdiskat";

const GRUNDL = 1000000;

describe("beregnEjendomsvaerdiskat", () => {
  test("kører med forsigtighedsfradraget: 80 % er beskatningsgrundlaget", () => {
    const r = beregnEjendomsvaerdiskat({
      ejendomsvaerdi: 3000000,
      grundvaerdi: 0,
      grundskyldPromille: 5.1,
    });
    expect(r.beskatningsgrundlag).toBe(2400000);
    expect(r.ejendomsvaerdiskat).toBe(12240);
    expect(r.overProgressionsgraensen).toBe(false);
  });

  test("ejendomsværdiskat er 5,1‰ op til progressionsgrænsen", () => {
    // Præcis på grænsen: 9.007.000 kr beskatningsgrundlag = 11.258.750 kr
    // ejendomsværdi. Helt på grænsen tæller 5,1‰, ikke 14‰.
    const r = beregnEjendomsvaerdiskat({
      ejendomsvaerdi: EJENDOMSVAERDISKAT.progressionsgraense / 0.8,
      grundvaerdi: 0,
      grundskyldPromille: 5.1,
    });
    expect(r.beskatningsgrundlag).toBe(9007000);
    expect(r.ejendomsvaerdiskat).toBe(Math.round(9007000 * 0.0051));
    expect(r.overProgressionsgraensen).toBe(false);
  });

  test("over grænsen: 5,1‰ under og 14‰ over — ikke 14‰ af hele beløbet", () => {
    const grundlag = 10000000;
    const r = beregnEjendomsvaerdiskat({
      ejendomsvaerdi: grundlag / 0.8,
      grundvaerdi: 0,
      grundskyldPromille: 5.1,
    });
    const forventet =
      EJENDOMSVAERDISKAT.progressionsgraense * 0.0051 +
      (grundlag - EJENDOMSVAERDISKAT.progressionsgraense) * 0.014;
    expect(r.ejendomsvaerdiskat).toBe(Math.round(forventet));
    // Fejlen porten skal fange: 14‰ af hele beløbet i stedet for kun over
    // grænsen.
    expect(r.ejendomsvaerdiskat).toBeLessThan(Math.round(grundlag * 0.014));
    expect(r.overProgressionsgraensen).toBe(true);
  });

  test("grundskyld er kommunens promille ganget med 80 % af grundværdien", () => {
    const r = beregnEjendomsvaerdiskat({
      ejendomsvaerdi: 0,
      grundvaerdi: GRUNDL,
      grundskyldPromille: 5.1,
    });
    expect(r.grundvaerdiBeskatning).toBe(800000);
    expect(r.grundskyld).toBe(4080);
    expect(r.ejendomsvaerdiskat).toBe(0);
  });

  test("nul ind — nul ud, og månedstallet er samlet / 12", () => {
    const r = beregnEjendomsvaerdiskat({
      ejendomsvaerdi: 0,
      grundvaerdi: 0,
      grundskyldPromille: 5.1,
    });
    expect(r).toMatchObject({
      beskatningsgrundlag: 0,
      ejendomsvaerdiskat: 0,
      grundskyld: 0,
      samlet: 0,
      maanedligt: 0,
    });
  });

  test("den højeste kommunes promille giver størst grundskyld", () => {
    const foer = beregnEjendomsvaerdiskat({
      ejendomsvaerdi: 0,
      grundvaerdi: GRUNDL,
      grundskyldPromille: grundskyldPromilleFor("frederiksberg", 6),
    });
    const foerHoej = beregnEjendomsvaerdiskat({
      ejendomsvaerdi: 0,
      grundvaerdi: GRUNDL,
      grundskyldPromille: grundskyldPromilleFor("bornholm", 6),
    });
    expect(foerHoej.grundskyld).toBeGreaterThan(foer.grundskyld);
    expect(foer.grundskyld).toBe(2480);
  });

  test("custom-promillen er brugerens egen, ukendt kommune falder tilbage", () => {
    expect(grundskyldPromilleFor("custom", 7.25)).toBe(7.25);
    // En ukendt kommune må ikke arve customPromillen — den kan komme fra
    // URL-state, så den skal falde tilbage på 6,0 som før.
    expect(grundskyldPromilleFor("findes-ikke", 7.25)).toBe(6.0);
    expect(grundskyldPromilleFor("findes-ikke", 7.25, 9)).toBe(9);
    expect(grundskyldPromilleFor("koebenhavn", 6)).toBe(
      GRUNDSKYLD_KOMMUNER.koebenhavn.promille,
    );
  });
});

describe("sidens eksempel", () => {
  test("beløbene er de tal, siden har vist siden boligskattereformen", () => {
    expect(EKSEMPEL).toMatchObject({
      beskatningsgrundlag: 2400000,
      ejendomsvaerdiskat: 12240,
      grundvaerdiBeskatning: 800000,
      grundskyld: 4080,
      samlet: 16320,
      maanedligt: 1360,
    });
  });

  test("regnestykkerne i teksten er de samme tal som beregningen", () => {
    // Hvis en sats ændres, skal denne test blive rød — den er erstatningen for
    // at have tallene håndskrevet i siden, hvor de ikke hang ved satsen.
    expect(EKSEMPEL_TEKST.ejendomsvaerdiskat).toBe(
      "3.000.000 × 80 % × 5,1‰ = 12.240 kr/år",
    );
    expect(EKSEMPEL_TEKST.grundskyld).toBe(
      "1.000.000 × 80 % × 5,1‰ = 4.080 kr/år",
    );
    expect(EKSEMPEL_TEKST.samlet).toBe("16.320 kr/år (1.360 kr/måned)");
  });

  test("hvert tal i teksten findes i beregningen", () => {
    for (const linje of Object.values(EKSEMPEL_TEKST)) {
      for (const belobTekst of linje.match(/[\d.]+ kr/g) ?? []) {
        const værdi = Number(belobTekst.replace(/\D/g, ""));
        const kendt = [
          EKSEMPEL.beskatningsgrundlag,
          EKSEMPEL.ejendomsvaerdiskat,
          EKSEMPEL.grundvaerdiBeskatning,
          EKSEMPEL.grundskyld,
          EKSEMPEL.samlet,
          EKSEMPEL.maanedligt,
          EKSEMPEL_INPUT.ejendomsvaerdi,
          EKSEMPEL_INPUT.grundvaerdi,
        ].includes(værdi);
        expect(kendt, `ukendt beløb i "${linje}": ${værdi}`).toBe(true);
      }
    }
  });

  test("progressionsgrænsen skrives med dansk tusindtalsseparator", () => {
    expect(kr(EJENDOMSVAERDISKAT.progressionsgraense)).toBe("9.007.000");
  });

  test("promillesatser beholder én decimal", () => {
    expect(satsTilPromille(EJENDOMSVAERDISKAT.lavSats * 1000)).toBe("5,1");
    expect(satsTilPromille(EJENDOMSVAERDISKAT.hoejSats * 1000)).toBe("14");
    expect(satsTilPromille(GRUNDSKYLD_KOMMUNER.odense.promille)).toBe("5,7");
    // Tabellen skrev «6,0» for Aarhus da tallene var håndskrevne.
    expect(satsTilPromille(GRUNDSKYLD_KOMMUNER.aarhus.promille, 1)).toBe("6,0");
    expect(satsTilPromille(GRUNDSKYLD_KOMMUNER.aarhus.promille)).toBe("6");
  });

  test("procentværdien i parentes stammer af samme sats som promillen", () => {
    expect(satsTilProcent(EJENDOMSVAERDISKAT.lavSats)).toBe("0,51");
    expect(satsTilProcent(EJENDOMSVAERDISKAT.hoejSats)).toBe("1,4");
    expect(
      Number(satsTilProcent(EJENDOMSVAERDISKAT.lavSats).replace(",", ".")),
    ).toBe(EJENDOMSVAERDISKAT.lavSats * 100);
  });
});
