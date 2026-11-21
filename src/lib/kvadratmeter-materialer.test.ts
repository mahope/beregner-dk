import { describe, expect, test } from "vitest";
import {
  MATERIALER,
  beregnMaterialbehov,
  beregnMaterialpris,
  materialeVedId,
  STANDARD_SPILD_PCT,
} from "./kvadratmeter-materialer";

const gulv = materialeVedId("gulv");
const fliser = materialeVedId("fliser");
const maling = materialeVedId("maling");
const tapet = materialeVedId("tapet");

describe("materialeVedId", () => {
  test("kategorierne er de fire forventede", () => {
    expect(MATERIALER.map((m) => m.id)).toEqual(["gulv", "fliser", "maling", "tapet"]);
  });

  test("ukendte id'er og tomme værdier falder tilbage til gulv", () => {
    expect(materialeVedId("gulv")).toBe(gulv);
    expect(materialeVedId("fliser")).toBe(fliser);
    for (const ukendt of ["gulvv", "", null, undefined]) {
      expect(materialeVedId(ukendt).id).toBe("gulv");
    }
  });

  test("alle kategorier bruger den samme standard for spild", () => {
    for (const kategori of MATERIALER) {
      expect(kategori.spildPct).toBe(STANDARD_SPILD_PCT);
    }
  });
});

describe("beregnMaterialbehov", () => {
  test("10 m² gulv med 10 % spild er 11 m² at købe", () => {
    const b = beregnMaterialbehov(10, gulv);
    expect(b.samletArealM2).toBe(10);
    expect(b.spildM2).toBeCloseTo(1, 10);
    expect(b.arealMedSpildM2).toBeCloseTo(11, 10);
  });

  test("20 m² fliser med 10 % spild er 22 m²", () => {
    const b = beregnMaterialbehov(20, fliser, { spildPct: 10 });
    expect(b.spildM2).toBeCloseTo(2, 10);
    expect(b.arealMedSpildM2).toBeCloseTo(22, 10);
  });

  test("antallet ens felter ganges ind, før spild lægges ovenpå", () => {
    const b = beregnMaterialbehov(20, gulv, { antalFelter: 3, spildPct: 10 });
    expect(b.samletArealM2).toBe(60);
    expect(b.spildM2).toBeCloseTo(6, 10);
    expect(b.arealMedSpildM2).toBeCloseTo(66, 10);
  });

  test("maling rundes altid op i hele liter", () => {
    const b = beregnMaterialbehov(60, maling, { spildPct: 10 });
    expect(b.arealMedSpildM2).toBeCloseTo(66, 10);
    expect(b.enheder).toBe(7);
  });

  test("10 m² maling er 11 m², som kræver 2 liter", () => {
    const b = beregnMaterialbehov(10, maling, { spildPct: 10 });
    expect(b.enheder).toBe(2);
  });

  test("præcis et helt antal enheder kræver ikke flere", () => {
    // 66 m² med 10 % spild = 66 m² dækning → 66/11 = 6 liter
    const b = beregnMaterialbehov(60, maling, { spildPct: 10, daekningPrEnhedM2: 11 });
    expect(b.enheder).toBe(6);
  });

  test("tapet sælges pr. 5 m² pr. rulle", () => {
    const b = beregnMaterialbehov(40, tapet, { spildPct: 10 });
    expect(b.arealMedSpildM2).toBeCloseTo(44, 10);
    expect(b.enheder).toBe(9);
  });

  test("gulv og fliser sælges pr. m², så der er ingen enheder", () => {
    expect(beregnMaterialbehov(20, gulv).enheder).toBeNull();
    expect(beregnMaterialbehov(20, fliser).enheder).toBeNull();
  });

  test("spild på 0 % giver præcis arealet", () => {
    const b = beregnMaterialbehov(37.5, gulv, { spildPct: 0 });
    expect(b.spildM2).toBe(0);
    expect(b.arealMedSpildM2).toBe(37.5);
  });

  test("0 % spild på maling giver stadig hele enheder", () => {
    const b = beregnMaterialbehov(25, maling, { spildPct: 0 });
    expect(b.arealMedSpildM2).toBe(25);
    expect(b.enheder).toBe(3);
  });

  test("nul og negative arealer giver intet behov", () => {
    for (const areal of [0, -10, Number.NaN, Number.POSITIVE_INFINITY]) {
      const b = beregnMaterialbehov(areal, maling);
      expect(b.samletArealM2).toBe(0);
      expect(b.spildM2).toBe(0);
      expect(b.arealMedSpildM2).toBe(0);
      expect(b.enheder).toBeNull();
    }
  });

  test("ugyldige valg falder tilbage på forsvarlige værdier", () => {
    const b = beregnMaterialbehov(20, gulv, {
      antalFelter: 0,
      spildPct: -5,
      daekningPrEnhedM2: -1,
    });
    expect(b.samletArealM2).toBe(20);
    expect(b.spildM2).toBe(0);
    expect(b.enheder).toBeNull();
  });

  test("et decimalt antal felter tælles ned", () => {
    expect(beregnMaterialbehov(10, gulv, { antalFelter: 2.9 }).samletArealM2).toBe(20);
  });
});

describe("beregnMaterialpris", () => {
  test("pris pr. enhed ganges med antallet enheder", () => {
    const b = beregnMaterialbehov(60, maling, { spildPct: 10 });
    expect(beregnMaterialpris(b, 120)).toBe(840);
  });

  test("pris pr. m² ganges med arealet inkl. spild", () => {
    const b = beregnMaterialbehov(20, gulv, { spildPct: 10 });
    expect(beregnMaterialpris(b, 450)).toBeCloseTo(9_900, 5);
  });

  test("uden pris er prisen 0", () => {
    const b = beregnMaterialbehov(20, gulv, { spildPct: 10 });
    for (const pris of [0, -100, Number.NaN]) {
      expect(beregnMaterialpris(b, pris)).toBe(0);
    }
  });

  test("et tomt areal koster 0 uanset pris", () => {
    const b = beregnMaterialbehov(0, fliser, { spildPct: 10 });
    expect(beregnMaterialpris(b, 500)).toBe(0);
  });
});
