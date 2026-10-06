import { describe, expect, test } from "vitest";
import {
  BROKOST_ANTAL_KATEGORIER,
  BROKOST_KATEGORIER,
  BROKOST_RABATTER,
  BROKOST_START,
  BROKOST_START_OVERFARTER,
  BROKOST_START_TURE,
  beregnBrokost,
  brokostAarsforskel,
  brokostForskel,
  brokostKategori,
  brokostPrisPrOverfart,
} from "./brokost";

const start = brokostKategori(BROKOST_START)!;

describe("Storebælts prisliste 2026", () => {
  test("ekspresprisen for en personbil 3-6 m er 205 kr., som kilden siger", () => {
    expect(start.eksprespris).toBe(205);
    expect(start.kortpris).toBe(235);
    expect(start.underSeksMeter).toBe(true);
  });

  test("kortprisen er dyrere end ekspresprisen for alle rækker, hvor den findes", () => {
    for (const k of BROKOST_KATEGORIER) {
      if (k.kortpris === null) continue;
      expect(k.kortpris, k.nokkel).toBeGreaterThan(k.eksprespris);
    }
  });

  test("autocamperaftalen har ingen kortpris, fordi kilden siger «Ikke mulig»", () => {
    const aftale = brokostKategori("autocamper-aftale")!;
    expect(aftale.kortpris).toBeNull();
    expect(brokostPrisPrOverfart(aftale, "kort")).toBeNull();
    expect(brokostPrisPrOverfart(aftale, "ekspres")).toBe(314);
  });

  test("der er ingen nøgle to gange, og alle nøgler er med i listen", () => {
    const noegle = BROKOST_KATEGORIER.map((k) => k.nokkel);
    expect(new Set(noegle).size).toBe(noegle.length);
    expect(BROKOST_ANTAL_KATEGORIER).toBe(noegle.length);
    expect(brokostKategori("findes-ikke")).toBeNull();
  });
});

describe("beregnBrokost", () => {
  const grund = {
    nokkel: BROKOST_START,
    betalingsform: "ekspres" as const,
    overfarter: BROKOST_START_OVERFARTER,
    ture: BROKOST_START_TURE,
    rabat: "ingen" as const,
  };

  test("tur/retur med eksprespris koster 410 kr. og 4.920 kr. om året", () => {
    const r = beregnBrokost(grund)!;
    expect(r.prisPrOverfart).toBe(205);
    expect(r.turFoerRabat).toBe(410);
    expect(r.rabatKr).toBe(0);
    expect(r.turEfterRabat).toBe(410);
    expect(r.prOverfartEfterRabat).toBe(205);
    expect(r.aarsforbrug).toBe(4920);
    expect(r.prMaaned).toBe(410);
  });

  test("kortbetaling lægger 30 kr. pr. overfart oveni", () => {
    const r = beregnBrokost({ ...grund, betalingsform: "kort" })!;
    expect(r.prisPrOverfart).toBe(235);
    expect(r.turEfterRabat).toBe(470);
    expect(r.aarsforbrug).toBe(5640);
  });

  test("aftenrabatten er en egen tur/retur-pris, ikke et fradrag", () => {
    const r = beregnBrokost({ ...grund, rabat: "aften" })!;
    expect(r.turEfterRabat).toBe(246);
    expect(r.rabatKr).toBe(164);
    expect(r.prOverfartEfterRabat).toBe(123);
    expect(r.rabatForbehold).toBeNull();
    expect(r.aarsforbrug).toBe(2952);
  });

  test("fritidsrabat kræver betalingsmiddel, under 6 m og tur/retur", () => {
    const kort = beregnBrokost({ ...grund, betalingsform: "kort", rabat: "weekend" })!;
    expect(kort.rabatKr).toBe(0);
    expect(kort.rabatForbehold).toBe("ikke-kort");

    const lang = beregnBrokost({
      ...grund,
      nokkel: "personbil-over-6",
      rabat: "weekend",
    })!;
    expect(lang.rabatKr).toBe(0);
    expect(lang.rabatForbehold).toBe("ikke-under-6-m");

    const enVej = beregnBrokost({ ...grund, overfarter: 1, rabat: "weekend" })!;
    expect(enVej.rabatKr).toBe(0);
    expect(enVej.rabatForbehold).toBe("ikke-tur-retur");
  });

  test("et køretøj over 6 m koster 314 kr. og 7.536 kr. om året", () => {
    const r = beregnBrokost({ ...grund, nokkel: "personbil-over-6" })!;
    expect(r.prisPrOverfart).toBe(314);
    expect(r.aarsforbrug).toBe(314 * 2 * BROKOST_START_TURE);
  });

  test("ugyldige tal holdes inden for grænserne", () => {
    const r = beregnBrokost({ ...grund, overfarter: 0, ture: 1000 })!;
    expect(r.overfarter).toBe(1);
    expect(r.ture).toBe(365);
    expect(r.turEfterRabat).toBe(205);
  });

  test("et køretøj uden kortpris giver intet svar i stedet for et forkert", () => {
    expect(beregnBrokost({ ...grund, nokkel: "autocamper-aftale", betalingsform: "kort" })).toBeNull();
  });

  test("ukendt køretøj giver null", () => {
    expect(beregnBrokost({ ...grund, nokkel: "cykel" })).toBeNull();
  });
});

describe("forskellen mellem kort- og eksprespris", () => {
  test("er 30 kr. for en personbil 3-6 m", () => {
    expect(brokostForskel(start)).toBe(30);
  });

  test("er 720 kr. om året ved 12 ture tur/retur", () => {
    expect(brokostAarsforskel(start, 2, BROKOST_START_TURE)).toBe(720);
  });

  test("er null for autocamperaftalen, hvor kortprisen ikke findes", () => {
    expect(brokostForskel(brokostKategori("autocamper-aftale")!)).toBeNull();
    expect(brokostAarsforskel(brokostKategori("autocamper-aftale")!, 2, 12)).toBeNull();
  });
});

describe("fritidsrabattene", () => {
  test("er 246 kr. for aften og 346 kr. for weekend og helligdag", () => {
    expect(BROKOST_RABATTER.aften).toBe(246);
    expect(BROKOST_RABATTER.weekend).toBe(346);
    expect(BROKOST_RABATTER.helligdag).toBe(346);
  });

  test("en bil på 3 m kan ikke tjene på fritidsbilletterne", () => {
    // 2 × 109 kr. = 218 kr. mod aftenbilletten på 246 kr. Billetten er dyrere,
    // så værktøjet skal sige det i stedet for at vise en «besparelse» på -28 kr.
    const r = beregnBrokost({
      nokkel: "personbil-op-til-3",
      betalingsform: "ekspres",
      overfarter: 2,
      ture: 1,
      rabat: "aften",
    })!;
    expect(r.turFoerRabat).toBe(218);
    expect(r.turEfterRabat).toBe(218);
    expect(r.rabatKr).toBe(0);
    expect(r.rabatForbehold).toBe("ikke-billigere");
  });

  test("et fritidsrabat giver aldrig en højere pris end de samme to overfarter", () => {
    for (const k of BROKOST_KATEGORIER) {
      for (const rabat of ["aften", "weekend", "helligdag"] as const) {
        const r = beregnBrokost({
          nokkel: k.nokkel,
          betalingsform: "ekspres",
          overfarter: 2,
          ture: 1,
          rabat,
        })!;
        expect(r.turEfterRabat, `${k.nokkel}/${rabat}`).toBeLessThanOrEqual(r.turFoerRabat);
        expect(r.turEfterRabat, `${k.nokkel}/${rabat}`).toBeGreaterThan(0);
      }
    }
  });
});
