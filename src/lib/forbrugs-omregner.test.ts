import { describe, expect, it } from "vitest";
import {
  FORBRUGS_ENHEDER,
  FORBRUGS_OMREGNINGS_EKSEAMPLER,
  IMP_GALLON_I_LITER,
  KM_PER_LITER_FAKTORER,
  MPG_UK_I_KM_PER_LITER,
  MPG_US_I_KM_PER_LITER,
  MIL_I_KM,
  US_GALLON_I_LITER,
  erGyldigtForbrug,
  forbrugsEnhed,
  omregnForbrug,
  omregnTilAlleForbrug,
  omregnTilKmPerLiter,
  rundForbrug,
  type ForbrugsEnhedId,
} from "./forbrugs-omregner";

/** De fire enheder, så en test ikke kan glemme at dømme én af dem. */
const ALLE_IDER: ForbrugsEnhedId[] = FORBRUGS_ENHEDER.map((e) => e.id);

describe("forbrugs-omregner — de eksakte enheder", () => {
  it("den internationale mil er præcis 1,609344 km", () => {
    expect(MIL_I_KM).toBe(1.609344);
  });

  it("en US gallon er præcis de 231 kubiktommer i 3,785411784 liter", () => {
    // 231 in³ × (0,0254 m)³, og 1 tomme er præcis 0,0254 m.
    expect(US_GALLON_I_LITER).toBe(231 * 0.0254 ** 3 * 1000);
    expect(US_GALLON_I_LITER).toBeCloseTo(3.785411784, 9);
  });

  it("den britiske gallon er præcis 4,54609 liter", () => {
    expect(IMP_GALLON_I_LITER).toBe(4.54609);
  });

  it("mpg er afstand pr. brændstof, så milen deles ind i gallonen", () => {
    // 1,609344 ÷ 3,785411784. Den omvendte division er den klassiske fejl.
    expect(MPG_US_I_KM_PER_LITER).toBeCloseTo(0.4251437074, 9);
    expect(MPG_UK_I_KM_PER_LITER).toBeCloseTo(0.3540061899, 9);
  });

  it("1 km/l er 2,4 mpg (US) og 2,8 mpg (UK)", () => {
    expect(omregnForbrug(1, "kmPerLiter", "mpg")).toBeCloseTo(2.352145833, 9);
    expect(omregnForbrug(1, "kmPerLiter", "mpgUk")).toBeCloseTo(2.824809363, 9);
  });

  it("den britiske gallon giver et *større* mpg-tal end den amerikanske", () => {
    // Samme mil, men den britiske gallon indeholder flere liter.
    expect(MPG_UK_I_KM_PER_LITER).toBeLessThan(MPG_US_I_KM_PER_LITER);
    expect(IMP_GALLON_I_LITER).toBeGreaterThan(US_GALLON_I_LITER);
  });

  it("km/l er afstand pr. brændstof, l/100 km er brændstof pr. afstand", () => {
    // De to er omvendte, ikke to forholdelige enheder — det er hele modellens
    // grund, så den låses her.
    expect(forbrugsEnhed("kmPerLiter").retning).toBe("kmPerLiter");
    expect(forbrugsEnhed("mpg").retning).toBe("kmPerLiter");
    expect(forbrugsEnhed("literPr100km").retning).toBe("literPr100km");
    expect(KM_PER_LITER_FAKTORER).toEqual({
      kmPerLiter: 1,
      mpg: MPG_US_I_KM_PER_LITER,
      mpgUk: MPG_UK_I_KM_PER_LITER,
    });
    expect("literPr100km" in KM_PER_LITER_FAKTORER).toBe(false);
  });

  it("de fire enheder har hver sit id og ingen dubletter", () => {
    expect(ALLE_IDER).toEqual(["kmPerLiter", "literPr100km", "mpg", "mpgUk"]);
    expect(new Set(ALLE_IDER).size).toBe(ALLE_IDER.length);
  });

  it("en ukendt enhed kaster frem for at give NaN", () => {
    expect(() => forbrugsEnhed("kubikfod" as ForbrugsEnhedId)).toThrow(/Ukendt forbrugsenhed/);
  });
});

describe("forbrugs-omregner — km/l og l/100 km er omvendte", () => {
  it("15 km/l er 6,67 l/100 km", () => {
    expect(omregnForbrug(15, "kmPerLiter", "literPr100km")).toBeCloseTo(6.6666667, 6);
  });

  it("6,7 l/100 km er 14,93 km/l", () => {
    expect(omregnForbrug(6.7, "literPr100km", "kmPerLiter")).toBeCloseTo(14.9253731, 6);
  });

  it("forholdet er 100, ikke 6,7 gange 100", () => {
    // Den fejl et lineært forhold ville give: 6,7 × 100 = 670 km/l.
    expect(omregnForbrug(6.7, "literPr100km", "kmPerLiter")).not.toBeCloseTo(670, 3);
  });

  it("et lille og et stort forbrug vender rigtigt begge veje", () => {
    expect(omregnForbrug(3.2, "literPr100km", "kmPerLiter")).toBeCloseTo(31.25, 9);
    expect(omregnForbrug(25, "kmPerLiter", "literPr100km")).toBeCloseTo(4, 9);
  });
});

describe("forbrugs-omregner — gallon-enhederne", () => {
  it("15 km/l er 35,3 mpg (US)", () => {
    expect(omregnForbrug(15, "kmPerLiter", "mpg")).toBeCloseTo(35.2821875, 6);
  });

  it("15 km/l er 42,4 mpg (UK)", () => {
    expect(omregnForbrug(15, "kmPerLiter", "mpgUk")).toBeCloseTo(42.3721404, 6);
  });

  it("35 mpg (US) er 14,88 km/l", () => {
    expect(omregnForbrug(35, "mpg", "kmPerLiter")).toBeCloseTo(14.8800297, 6);
  });

  it("20 mpg (UK) er 7,08 km/l og 14,12 l/100 km", () => {
    expect(omregnForbrug(20, "mpgUk", "kmPerLiter")).toBeCloseTo(7.0801238, 6);
    expect(omregnForbrug(20, "mpgUk", "literPr100km")).toBeCloseTo(14.1240468, 6);
  });

  it("de to gallon-enheder er ikke det samme — de afviger med 20 %", () => {
    const sammeKmPerLiter = 15;
    const mpgUs = omregnForbrug(sammeKmPerLiter, "kmPerLiter", "mpg");
    const mpgUk = omregnForbrug(sammeKmPerLiter, "kmPerLiter", "mpgUk");
    expect(mpgUk / mpgUs).toBeCloseTo(IMP_GALLON_I_LITER / US_GALLON_I_LITER, 9);
  });
});

describe("forbrugs-omregner — omregningens egenskaber", () => {
  it("en enhed til sig selv er uændret — alle fire veje", () => {
    for (const id of ALLE_IDER) {
      expect(omregnForbrug(7, id, id)).toBeCloseTo(7, 9);
    }
  });

  it("omregningen er symmetrisk: A → B → A giver A tilbage, alle 16 par", () => {
    for (const fra of ALLE_IDER) {
      for (const til of ALLE_IDER) {
        const der = omregnForbrug(9.3, fra, til);
        expect(omregnForbrug(der, til, fra)).toBeCloseTo(9.3, 9);
      }
    }
  });

  it("værdien i km/l er det samme uanset hvilken enhed den kom fra", () => {
    for (const fra of ALLE_IDER) {
      const der = omregnForbrug(omregnForbrug(12.5, "kmPerLiter", fra), fra, "kmPerLiter");
      expect(der).toBeCloseTo(12.5, 9);
    }
  });

  it("omregnTilKmPerLiter er samme vej som omregnForbrug", () => {
    for (const fra of ALLE_IDER) {
      expect(omregnTilKmPerLiter(6.7, fra)).toBeCloseTo(
        omregnForbrug(6.7, fra, "kmPerLiter"),
        12,
      );
    }
  });
});

describe("forbrugs-omregner — ugyldige tal", () => {
  it("0, negative tal, NaN og uendelig er alle ugyldige", () => {
    expect(erGyldigtForbrug(0)).toBe(false);
    expect(erGyldigtForbrug(-6.7)).toBe(false);
    expect(erGyldigtForbrug(Number.NaN)).toBe(false);
    expect(erGyldigtForbrug(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("et gyldigt tal kan ikke være 0 — 100 ÷ 0 er uendeligt", () => {
    expect(erGyldigtForbrug(0.01)).toBe(true);
  });

  it("ugyldige tal giver NaN i begge retninger, ikke Infinity", () => {
    for (const id of ALLE_IDER) {
      expect(omregnForbrug(0, "literPr100km", id)).toBeNaN();
      expect(omregnForbrug(-1, id, "kmPerLiter")).toBeNaN();
      expect(omregnTilKmPerLiter(Number.NaN, id)).toBeNaN();
    }
  });

  it("omregnTilAlleForbrug giver NaN i alle felter for et ugyldigt tal", () => {
    const alle = omregnTilAlleForbrug(0, "literPr100km");
    for (const id of ALLE_IDER) {
      expect(alle[id]).toBeNaN();
    }
  });
});

describe("forbrugs-omregner — alle enheder på én gang", () => {
  it("6,7 l/100 km giver de fire tal værktøjet viser", () => {
    const alle = omregnTilAlleForbrug(6.7, "literPr100km");
    expect(rundForbrug(alle.kmPerLiter, "kmPerLiter")).toBe(14.93);
    expect(rundForbrug(alle.literPr100km, "literPr100km")).toBe(6.7);
    expect(rundForbrug(alle.mpg, "mpg")).toBe(35.1);
    expect(rundForbrug(alle.mpgUk, "mpgUk")).toBe(42.2);
  });

  it("den valgte enhed står uændret i sit eget felt", () => {
    for (const fra of ALLE_IDER) {
      const alle = omregnTilAlleForbrug(8.2, fra);
      expect(rundForbrug(alle[fra], fra)).toBe(8.2);
    }
  });

  it("et lille forbrug må ikke give en falsert høj mpg", () => {
    // 3 l/100 km er 33,3 km/l, altså 78,4 mpg. Behandlet som et *forhold*
    // blev det til 3 × 0,01 = 0,03 km/l og 0,07 mpg — læseren ville tro at
    // bilen var 1.000 gange så effektiv som den er.
    const alle = omregnTilAlleForbrug(3, "literPr100km");
    expect(rundForbrug(alle.mpg, "mpg")).toBe(78.4);
    expect(rundForbrug(alle.kmPerLiter, "kmPerLiter")).toBe(33.33);
  });

  it("rundForbrug bruger enhedens egne decimaler", () => {
    expect(rundForbrug(14.9253731, "kmPerLiter")).toBe(14.93);
    expect(rundForbrug(35.2821875, "mpg")).toBe(35.3);
    expect(rundForbrug(42.3721404, "mpgUk")).toBe(42.4);
    expect(rundForbrug(6.6666667, "literPr100km")).toBe(6.67);
  });
});

describe("forbrugs-omregner — brødtekstens tre eksempler", () => {
  it("de er de tre veje, autocomplete målte 6/10", () => {
    expect(FORBRUGS_OMREGNINGS_EKSEAMPLER.map((e) => `${e.fra}→${e.til}`)).toEqual([
      "literPr100km→kmPerLiter",
      "kmPerLiter→literPr100km",
      "kmPerLiter→mpg",
    ]);
  });

  it("alle tre bruger en enhed, der findes", () => {
    for (const e of FORBRUGS_OMREGNINGS_EKSEAMPLER) {
      expect(ALLE_IDER).toContain(e.fra);
      expect(ALLE_IDER).toContain(e.til);
    }
  });

  it("de runder til de tal brødteksten skriver", () => {
    const rundet = FORBRUGS_OMREGNINGS_EKSEAMPLER.map((e) =>
      rundForbrug(omregnForbrug(e.vaerdi, e.fra, e.til), e.til),
    );
    expect(rundet).toEqual([14.93, 6.67, 35.3]);
  });
});