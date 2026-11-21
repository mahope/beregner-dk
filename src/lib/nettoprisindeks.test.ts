import { describe, it, expect } from "vitest";
import {
  FORBRUGERPRISINDEKS_2026M08,
  NETTOPRISINDEKS_2026M08,
  FAKTISK_HUSLEJE_2026M08,
  NETTOPRISINDEKS_MAANEDER,
  NETTOPRISINDELS_PERIODE,
  NETTOPRISINDELS_MAANED,
  KVARTER_MAANEDER,
  kvartalsgennemsnit,
  senesteKompletteKvartal,
  udregnNettoprisindeks,
  fraKvartalTilKvartal,
  beregnHuslejestigning,
} from "./nettoprisindeks";

describe("nettoprisindeks — data from Danmarks Statistik", () => {
  it("has the period and month name the page will render", () => {
    expect(NETTOPRISINDELS_PERIODE).toBe("2026M08");
    expect(NETTOPRISINDELS_MAANED).toBe("august 2026");
  });

  it("keeps each index's own published figure, so the page cannot mix them up", () => {
    // Lejeloven § 5 regulerer huslejen efter NETTOPRISINDEKSET (PRIS04).
    // Forbrugerprisindekset (PRIS01) indeholder de indirekte afgifter og er
    // ikke huslejereguleringens grundlag.
    expect(FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct).toBe(2.0);
    expect(NETTOPRISINDEKS_2026M08.aarsVaeksningPct).toBe(2.9);
    // DST's egen huslejegruppe ligger UNDER nettoprisindeksets hovedtal. Havde
    // siden blandet dem, ville den have løjet om sit eget indhold (C84's klasse).
    expect(FAKTISK_HUSLEJE_2026M08.aarsVaeksningPct).toBe(2.6);
    expect(FAKTISK_HUSLEJE_2026M08.aarsVaeksningPct).toBeLessThan(
      NETTOPRISINDEKS_2026M08.aarsVaeksningPct,
    );
  });

  it("keeps raw StatBank strings in Danish comma notation next to the parsed numbers", () => {
    // De rå strenge er kildebeviset. Tallene er parset fra dem, så en
    // redigering i den rå tekst uden tallet ville være en ubevidst løgn.
    // DST skriver altid to decimaler, så "2,00" er 2 — ikke to tegn der skal
    // sammenlignes som tekst.
    const somTal = (raw: string) => Number(raw.replace(",", "."));
    for (const s of [NETTOPRISINDEKS_2026M08, FORBRUGERPRISINDEKS_2026M08, FAKTISK_HUSLEJE_2026M08]) {
      expect(s.raav.indeks).toMatch(/^\d+,\d{2}$/);
      expect(s.raav.aarsVaeksning).toMatch(/^\d+,\d{2}$/);
      expect(somTal(s.raav.indeks)).toBe(s.indeks);
      expect(somTal(s.raav.aarsVaeksning)).toBe(s.aarsVaeksningPct);
    }
  });

  it("has DST's index level for the current month in the monthly table", () => {
    expect(NETTOPRISINDEKS_MAANEDER[NETTOPRISINDELS_PERIODE]).toBe(
      NETTOPRISINDEKS_2026M08.indeks,
    );
  });
});

describe("kvartalsgennemsnit", () => {
  it("averages the three months of 2026K2 from DST's own numbers", () => {
    // 101,49 + 102,13 + 102,38 = 306,00 -> 102,00
    expect(kvartalsgennemsnit("2026K2")).toBeCloseTo(102.0, 6);
  });

  it("returns null for a quarter DST has not finished publishing", () => {
    // September 2026 udkommer 2026-10-08. Et gennemsnit på to måneder ville
    // undervurdere stigningen, så kvartalet er bevidst ubrugbart.
    expect(kvartalsgennemsnit("2026K3")).toBeNull();
  });

  it("returns null for a quarter that never existed, rather than guessing", () => {
    expect(kvartalsgennemsnit("2099K1")).toBeNull();
    expect(kvartalsgennemsnit("2026M08")).toBeNull();
  });

  it("names the most recent complete quarter, which is not the current one", () => {
    expect(senesteKompletteKvartal()).toBe("2026K2");
  });

  it("only averages months DST has actually published", () => {
    for (const [kvartal, maaneder] of Object.entries(KVARTER_MAANEDER)) {
      for (const m of maaneder) {
        const vaerdi = kvartalsgennemsnit(kvartal);
        if (vaerdi === null) continue;
        for (const maaned of maaneder) {
          expect(NETTOPRISINDEKS_MAANEDER[maaned as keyof typeof NETTOPRISINDEKS_MAANEDER]).toBeTypeOf(
            "number",
          );
        }
      }
    }
  });
});

describe("fraKvartalTilKvartal", () => {
  it("steps back and forward a year", () => {
    expect(fraKvartalTilKvartal("2026K2", -4)).toBe("2025K2");
    expect(fraKvartalTilKvartal("2025K2", 4)).toBe("2026K2");
  });

  it("crosses the year boundary in both directions", () => {
    expect(fraKvartalTilKvartal("2026K1", -1)).toBe("2025K4");
    expect(fraKvartalTilKvartal("2025K4", 1)).toBe("2026K1");
  });

  it("leaves a malformed code alone instead of producing a wrong one", () => {
    expect(fraKvartalTilKvartal("2026K9", -4)).toBe("2026K9");
    expect(fraKvartalTilKvartal("august", -4)).toBe("august");
  });
});

describe("udregnNettoprisindeks", () => {
  it("gives the quarter-on-same-quarter rise, not the monthly one", () => {
    // 2. kvartal 2026 = 102,00 mod 2. kvartal 2025 = (99,37+99,43+99,73)/3 = 99,51
    const pct = udregnNettoprisindeks("2026K2");
    expect(pct).not.toBeNull();
    expect(pct!).toBeCloseTo(2.5, 2);
    // Den afviger fra DST's publicerede månedsstigning på 2,9 %. Siden skal derfor
    // sige hvilken af de to den viser, ellers er den ikke sammenlignelig.
    expect(pct!).toBeLessThan(NETTOPRISINDEKS_2026M08.aarsVaeksningPct);
  });

  it("refuses to derive a percentage from an incomplete quarter", () => {
    expect(udregnNettoprisindeks("2026K3")).toBeNull();
  });

  it("refuses when the year-earlier quarter is not in the table", () => {
    expect(udregnNettoprisindeks("2025K1")).toBeNull();
  });
});

describe("beregnHuslejestigning", () => {
  it("applies the published nettoprisindeks to a concrete rent", () => {
    // 8.000 kr x 2,9 % = 232 kr
    const r = beregnHuslejestigning(8000, 2.9);
    expect(r.foer).toBe(8000);
    expect(r.stigning).toBe(232);
    expect(r.efter).toBe(8232);
  });

  it("rounds the increase, not the total, because that is what a rent notice shows", () => {
    // 9.973 kr x 2,9 % = 289,217 -> 289 kr -> 10.262 kr
    const r = beregnHuslejestigning(9973, 2.9);
    expect(r.stigning).toBe(289);
    expect(r.efter).toBe(r.foer + r.stigning);
    expect(r.efter).toBe(10262);
  });

  it("keeps the two published percentages visibly different on the same rent", () => {
    // Samme husleje, to satser: det er hele forskellen på pristal og nettopris.
    expect(beregnHuslejestigning(8000, FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct).stigning).toBe(160);
    expect(beregnHuslejestigning(8000, NETTOPRISINDEKS_2026M08.aarsVaeksningPct).stigning).toBe(232);
    expect(beregnHuslejestigning(8000, FAKTISK_HUSLEJE_2026M08.aarsVaeksningPct).stigning).toBe(208);
  });

  it("gives zero for a zero rise, so the page can render the term without a branch", () => {
    expect(beregnHuslejestigning(8000, 0)).toEqual({ foer: 8000, stigning: 0, efter: 8000, pct: 0 });
  });

  it("always keeps efter = foer + stigning, whatever the input", () => {
    for (const husleje of [0, 1234, 7500.5, 12345.67, 99999]) {
      for (const pct of [0, 1.2, 2.6, 2.9, 3.5, 7.4]) {
        const r = beregnHuslejestigning(husleje, pct);
        expect(r.efter).toBe(r.foer + r.stigning);
        expect(r.stigning).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
