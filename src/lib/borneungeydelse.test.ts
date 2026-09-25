import { describe, it, expect } from "vitest";
import {
  BOERNE_SATSER_2026,
  BOERNEUNGEYDELSE_2026,
  aarligBelob,
  beregnAftrapning,
  satsForAlder,
  udbetalingerPrAar,
} from "./borneungeydelse";

describe("BOERNE_SATSER_2026", () => {
  it("har de officielle intervalbeløb fra borger.dk", () => {
    expect(BOERNE_SATSER_2026.map((s) => [s.alder, s.hel])).toEqual([
      ["0-2 år", 5370],
      ["3-6 år", 4248],
      ["7-14 år", 3342],
      ["15-17 år", 1114],
    ]);
  });

  it("har halvdelen som præcis halvdelen af hele beløbet", () => {
    for (const sats of BOERNE_SATSER_2026) {
      expect(sats.halv).toBe(sats.hel / 2);
    }
  });

  it("har aldersgrupper i stigende rækkefølge uden overlap", () => {
    for (let i = 1; i < BOERNE_SATSER_2026.length; i++) {
      expect(BOERNE_SATSER_2026[i].fraAar).toBeGreaterThan(
        BOERNE_SATSER_2026[i - 1].fraAar,
      );
    }
  });

  it("har en kilde og en verificeringsdato", () => {
    expect(BOERNEUNGEYDELSE_2026.source).toMatch(/^https:\/\/www\.borger\.dk\//);
    expect(BOERNEUNGEYDELSE_2026.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("udbetalingerPrAar", () => {
  it("regner kvartalsvis og månedligt", () => {
    expect(udbetalingerPrAar("kvartal")).toBe(4);
    expect(udbetalingerPrAar("maaned")).toBe(12);
  });
});

describe("satsForAlder", () => {
  it("finder den rigtige sats i hvert aldersinterval", () => {
    expect(satsForAlder(0)?.hel).toBe(5370);
    expect(satsForAlder(2)?.hel).toBe(5370);
    expect(satsForAlder(3)?.hel).toBe(4248);
    expect(satsForAlder(6)?.hel).toBe(4248);
    expect(satsForAlder(7)?.hel).toBe(3342);
    expect(satsForAlder(14)?.hel).toBe(3342);
    expect(satsForAlder(15)?.hel).toBe(1114);
    expect(satsForAlder(17)?.hel).toBe(1114);
  });

  it("skifter interval ved 15 år", () => {
    expect(satsForAlder(14)?.interval).toBe("kvartal");
    expect(satsForAlder(15)?.interval).toBe("maaned");
  });

  it("returnerer den højeste sats for børn over 18 år", () => {
    expect(satsForAlder(18)?.alder).toBe("15-17 år");
  });

  it("returnerer undefined for ugyldig alder", () => {
    expect(satsForAlder(-1)).toBeUndefined();
    expect(satsForAlder(Number.NaN)).toBeUndefined();
  });
});

describe("aarligBelob", () => {
  it("ganger kvartalsbeløb med 4 og månedlige med 12", () => {
    expect(aarligBelob(BOERNE_SATSER_2026[0])).toBe(21480);
    expect(aarligBelob(BOERNE_SATSER_2026[1])).toBe(16992);
    expect(aarligBelob(BOERNE_SATSER_2026[2])).toBe(13368);
    expect(aarligBelob(BOERNE_SATSER_2026[3])).toBe(13368);
  });
});

describe("beregnAftrapning", () => {
  const graense = BOERNEUNGEYDELSE_2026.aftrapning.graense;

  it("er 0 ved og under grænsen", () => {
    expect(beregnAftrapning(graense)).toBe(0);
    expect(beregnAftrapning(graense - 100000)).toBe(0);
    expect(beregnAftrapning(0)).toBe(0);
  });

  it("er 2 % af beløbet over grænsen", () => {
    expect(beregnAftrapning(graense + 138900)).toBeCloseTo(2778, 6);
    expect(beregnAftrapning(1100000)).toBeCloseTo(2778, 6);
  });

  it("er 0 for negative og ugyldige indkomster", () => {
    expect(beregnAftrapning(-1)).toBe(0);
    expect(beregnAftrapning(Number.NaN)).toBe(0);
  });
});
