import { describe, expect, test } from "vitest";
import {
  ACRE_I_M2,
  AREAL_ENHEDER,
  FOD_I_METER,
  KVADRATFOD_I_M2,
  OMREGNINGS_EKSEAMPLER,
  arealEnhed,
  erGyldigArealvaerdi,
  omregnAreal,
  omregnTilAlle,
  omregnTilM2,
  rundAreal,
  type ArealEnhedId,
} from "./areal-omregner";

/** Næsten lig med, fordi faktorerne er præcise binære brøker. */
const tætPå = (værdi: number, forventet: number, decimaler = 6) => {
  expect(værdi).toBeCloseTo(forventet, decimaler);
};

describe("areal-omregnerens enheder", () => {
  test("foden er præcis 0,3048 m, så kvadratfoden er præcis dens kvadrat", () => {
    expect(FOD_I_METER).toBe(0.3048);
    expect(KVADRATFOD_I_M2).toBe(0.3048 * 0.3048);
    expect(KVADRATFOD_I_M2).toBe(0.09290304);
  });

  test("en acre er 43.560 kvadratfod = 4.046,8564224 m²", () => {
    expect(ACRE_I_M2).toBe(43_560 * KVADRATFOD_I_M2);
    tætPå(ACRE_I_M2, 4046.8564224);
  });

  test("SI-præfiksene er 1 mod 10.000, 1 mod 1.000.000 og 1 mod 10.000", () => {
    expect(arealEnhed("cm2").faktorM2).toBe(0.0001);
    expect(arealEnhed("km2").faktorM2).toBe(1_000_000);
    expect(arealEnhed("hektar").faktorM2).toBe(10_000);
    expect(arealEnhed("m2").faktorM2).toBe(1);
  });

  test("enhederne er de seks, siden lover om, og m² står først", () => {
    expect(AREAL_ENHEDER.map((e) => e.id)).toEqual<ArealEnhedId[]>([
      "m2",
      "cm2",
      "km2",
      "hektar",
      "kvadratfod",
      "acre",
    ]);
  });

  test("ukendt enhed kaster, så en tastefejl ikke regner på 1 m²", () => {
    expect(() => arealEnhed("fod" as ArealEnhedId)).toThrow(/Ukendt arealenhed/);
  });
});

describe("omregning mellem enheder", () => {
  test("500 kvadratfod er 46,45 m² — den omregning brødteksten skriver", () => {
    tætPå(omregnTilM2(500, "kvadratfod"), 46.45152);
    expect(rundAreal(omregnTilM2(500, "kvadratfod"), "m2")).toBe(46.45);
  });

  test("100 m² er 1.076,39 kvadratfod", () => {
    tætPå(omregnAreal(100, "m2", "kvadratfod"), 1076.3910416709723, 4);
    expect(rundAreal(omregnAreal(100, "m2", "kvadratfod"), "kvadratfod")).toBe(1076.39);
  });

  test("en acre er 4,0468564224 m²", () => {
    expect(rundAreal(omregnAreal(1, "acre", "m2"), "m2")).toBe(4046.86);
  });

  test("en km² er 100 hektar og 1.000.000 m²", () => {
    expect(omregnAreal(1, "km2", "hektar")).toBe(100);
    expect(omregnTilM2(1, "km2")).toBe(1_000_000);
  });

  test("en m² er 10.000 cm²", () => {
    expect(omregnAreal(1, "m2", "cm2")).toBe(10_000);
  });

  test("kvadratcentimeter er 10.000 gange mindre end kvadratmeter", () => {
    expect(omregnTilM2(10_000, "cm2")).toBe(1);
  });

  test("at omregne samme vej frem og tilbage giver det indtastede tal", () => {
    for (const enhed of AREAL_ENHEDER) {
      tætPå(omregnAreal(omregnAreal(37.5, "m2", enhed.id), enhed.id, "m2"), 37.5, 4);
    }
  });
});

describe("gyldige værdier", () => {
  test("et areal kan ikke være negativt, tomt eller NaN", () => {
    expect(erGyldigArealvaerdi(0)).toBe(true);
    expect(erGyldigArealvaerdi(-1)).toBe(false);
    expect(erGyldigArealvaerdi(Number.NaN)).toBe(false);
    expect(erGyldigArealvaerdi(Number.POSITIVE_INFINITY)).toBe(false);
  });

  test("et ugyldigt tal giver NaN, så værktøjet kan skjule facit", () => {
    expect(Number.isNaN(omregnTilM2(-5, "m2"))).toBe(true);
    expect(Number.isNaN(omregnAreal(-5, "m2", "hektar"))).toBe(true);
  });
});

describe("alle enheder på én gang", () => {
  test("500 kvadratfod læses i alle seks enheder, og m² er præcis", () => {
    const alle = omregnTilAlle(500, "kvadratfod");
    tætPå(alle.m2, 46.45152);
    expect(rundAreal(alle.cm2, "cm2")).toBe(464_515);
    tætPå(alle.hektar, 0.004645152);
    tætPå(alle.km2, 0.00004645152);
    tætPå(alle.acre, 0.011478, 6);
    // Den enhed brugeren skrev, danner sig selv frem igen.
    expect(rundAreal(alle.kvadratfod, "kvadratfod")).toBe(500);
  });

  test("et ugyldigt tal giver NaN i alle seks, ikke kun i den valgte", () => {
    const alle = omregnTilAlle(-1, "kvadratfod");
    for (const enhed of AREAL_ENHEDER) {
      expect(Number.isNaN(alle[enhed.id])).toBe(true);
    }
  });
});

describe("brødtekstens tre eksempler", () => {
  test("de er præcis de tal, brødteksten skriver ud", () => {
    const [fod, acre, m2] = OMREGNINGS_EKSEAMPLER;
    expect(fod).toMatchObject({ vaerdi: 500, fra: "kvadratfod", til: "m2" });
    expect(rundAreal(omregnAreal(fod.vaerdi, fod.fra, fod.til), fod.til)).toBe(46.45);
    expect(acre).toMatchObject({ vaerdi: 1, fra: "acre", til: "m2" });
    expect(rundAreal(omregnAreal(acre.vaerdi, acre.fra, acre.til), acre.til)).toBe(4046.86);
    expect(m2).toMatchObject({ vaerdi: 100, fra: "m2", til: "kvadratfod" });
    expect(rundAreal(omregnAreal(m2.vaerdi, m2.fra, m2.til), m2.til)).toBe(1076.39);
  });
});

describe("afrunding", () => {
  test("rundAral følger enhedens egne decimaler", () => {
    expect(rundAreal(46.45152, "m2")).toBe(46.45);
    expect(rundAreal(46.4567, "cm2")).toBe(46);
    expect(rundAreal(0.000004645152, "km2")).toBe(0.000005);
    expect(rundAreal(0.011478, "acre")).toBe(0.011478);
  });
});