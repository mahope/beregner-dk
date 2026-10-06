import { describe, test, expect } from "vitest";
import {
  HASTIGHED_ENHEDER,
  MIL_I_KM,
  OMREGNINGS_EKSEAMPLER,
  SOMERMIL_I_KM,
  erGyldigFartvaerdi,
  omregnFart,
  omregnFartTilAlle,
  omregnTilKmT,
  rundFart,
  sekunderPr100m,
  tempoMinPrKm,
} from "./fart-omregner";

/** Så mange decimaler værktøjet viser enheden med. */
function hastighedEnhedDecimaler(id: (typeof HASTIGHED_ENHEDER)[number]["id"]): number {
  return HASTIGHED_ENHEDER.find((enhed) => enhed.id === id)!.decimaler;
}

/** Hvor mange km/t én enhed udgør — springet i den omregnede enhed. */
function hastighedEnhedFaktor(id: (typeof HASTIGHED_ENHEDER)[number]["id"]): number {
  return HASTIGHED_ENHEDER.find((enhed) => enhed.id === id)!.faktorKmT;
}

describe("de eksakte faktorer", () => {
  test("1 mil er præcis 1,609344 km (yard-and-pound-aftalen af 1959)", () => {
    // 1760 yard × 0,9144 m. Tallet skal være præcist, ikke "cirka 1,609".
    expect(MIL_I_KM).toBe(1.609344);
    expect(MIL_I_KM * 1000).toBe(1609.344);
  });

  test("1 sømil er præcis 1,852 km (international konvention)", () => {
    expect(SOMERMIL_I_KM).toBe(1.852);
  });

  test("omregningen mellem enhederne er dens omvendt", () => {
    // En enheds faktor skal kunne ganges og divideres ud i det samme tal,
    // ellers kan værktøjet ikke svare begge veje.
    for (const fra of HASTIGHED_ENHEDER) {
      for (const til of HASTIGHED_ENHEDER) {
        const frem = omregnFart(1, fra.id, til.id);
        const tilbage = omregnFart(frem, til.id, fra.id);
        expect(tilbage).toBeCloseTo(1, 10);
      }
    }
  });
});

describe("omregnFart", () => {
  test("100 km/t i de fire enheder", () => {
    // 100 / 3,6 = 27,777… m/s. 100 / 1,609344 = 62,137… mph.
    // 100 / 1,852 = 53,995… knop.
    expect(omregnFart(100, "km_t", "m_s")).toBeCloseTo(27.7777777, 6);
    expect(omregnFart(100, "km_t", "mph")).toBeCloseTo(62.13711922, 6);
    expect(omregnFart(100, "km_t", "knop")).toBeCloseTo(53.9956803, 6);
  });

  test("omregningen modsat vej giver det samme tal", () => {
    expect(omregnFart(27.7777777778, "m_s", "km_t")).toBeCloseTo(100, 8);
    expect(omregnFart(62.1371192233, "mph", "km_t")).toBeCloseTo(100, 8);
    expect(omregnFart(53.9956803456, "knop", "km_t")).toBeCloseTo(100, 8);
  });

  test("10 knop er 18,52 km/t", () => {
    expect(omregnFart(10, "knop", "km_t")).toBeCloseTo(18.52, 10);
  });

  test("en mil i timen er 1 knop og 0,86898 m/s", () => {
    // Sømil i timen ER definitionen af en knop, så her skal de tre enheder
    // give præcis det samme tal: 1,852 km/t = 0,514444… m/s = 1,15078 mph.
    expect(omregnFart(1.852, "km_t", "knop")).toBeCloseTo(1, 10);
    expect(omregnFart(1, "knop", "m_s")).toBeCloseTo(0.514444444, 9);
    expect(omregnFart(1, "knop", "mph")).toBeCloseTo(1.150779448, 9);
  });

  test("60 mph er den juridiske fartgrænse i USA: 96,56 km/t", () => {
    expect(omregnFart(60, "mph", "km_t")).toBeCloseTo(96.56064, 6);
    expect(omregnFart(96.56064, "km_t", "mph")).toBeCloseTo(60, 8);
  });

  test("negative hastigheder er gyldige (baglæns kørsel)", () => {
    expect(erGyldigFartvaerdi(-15)).toBe(true);
    expect(omregnFart(-15, "km_t", "mph")).toBeCloseTo(-9.32056788, 6);
  });

  test("NaN og uendelig er ikke gyldige, så værktøjet skjuler facit", () => {
    expect(erGyldigFartvaerdi(Number.NaN)).toBe(false);
    expect(erGyldigFartvaerdi(Number.POSITIVE_INFINITY)).toBe(false);
    expect(omregnTilKmT(Number.NaN, "km_t")).toBeNaN();
    expect(omregnFart(Number.NaN, "km_t", "m_s")).toBeNaN();
  });

  test("nul er gyldig i alle fire enheder", () => {
    for (const enhed of HASTIGHED_ENHEDER) {
      expect(erGyldigFartvaerdi(0)).toBe(true);
      expect(omregnFart(0, enhed.id, enhed.id)).toBe(0);
    }
  });
});

describe("omregnFartTilAlle", () => {
  test("de fire enheder er alle med, og de er alle læst fra den samme km/t", () => {
    const alle = omregnFartTilAlle(50, "km_t");
    expect(Object.keys(alle).sort()).toEqual(["km_t", "knop", "m_s", "mph"]);
    expect(alle.km_t).toBe(50);
    expect(alle.m_s).toBeCloseTo(13.88888889, 6);
    expect(alle.mph).toBeCloseTo(31.06855961, 6);
    expect(alle.knop).toBeCloseTo(26.99784017, 6);
  });

  test("den valgte enhed er ikke en afkortet rest — den er fuld præcision", () => {
    // 1/3 m/s omregnet til km/t må ikke miste noget, så værktøjet kan vise
    // den indtastede enhed tilbage uden en mellemregning.
    const alle = omregnFartTilAlle(1 / 3, "m_s");
    expect(alle.km_t).toBeCloseTo(1.2, 10);
    expect(alle.m_s).toBeCloseTo(1 / 3, 12);
  });

  test("ugyldige tal giver NaN i alle enheder, ikke 0", () => {
    // 0 ville være en rigtig fart og få værktøjet til at løjne et svar.
    for (const værdi of [Number.NaN, Number.POSITIVE_INFINITY]) {
      for (const enhed of HASTIGHED_ENHEDER) {
        expect(omregnFartTilAlle(værdi, enhed.id)[enhed.id]).toBeNaN();
      }
    }
  });
});

describe("rundFart", () => {
  test("hver enhed afrundes til sine egne decimaler", () => {
    expect(rundFart(27.7777777, "m_s")).toBe(27.78);
    expect(rundFart(27.7777777, "km_t")).toBe(27.8);
    expect(rundFart(62.13711922, "mph")).toBe(62.1);
    expect(rundFart(53.99568034, "knop")).toBe(54);
  });

  test("afrundingen er stabil, så brødtekst og værktøjet viser samme tal", () => {
    for (const { vaerdi, fra, til } of OMREGNINGS_EKSEAMPLER) {
      const raat = omregnFart(vaerdi, fra, til);
      const vist = rundFart(raat, til);
      // Den viste værdi skal ændre sig ved endnu en afrunding — ellers kunne
      // brødteksten og værktøjet vise to forskellige tal for samme input.
      expect(rundFart(vist, til)).toBe(vist);
      // Og den tabte præcision må højst være ét af de viste decimalers spring,
      // fordi det er den fejl, brødteksten skriver med.
      const spring = 10 ** -hastighedEnhedDecimaler(til);
      expect(Math.abs(omregnFart(vist, til, fra) - vaerdi)).toBeLessThanOrEqual(
        spring * hastighedEnhedFaktor(til),
      );
    }
  });
});

describe("tempo og sekunder pr. 100 m", () => {
  test("de går modsat farten, så de er ikke bare enheder på listen", () => {
    // 10 km/t er 6 min/km og 36 s pr. 100 m; 20 km/t er 3 min/km og 18 s.
    expect(tempoMinPrKm(10)).toBeCloseTo(6, 10);
    expect(sekunderPr100m(10)).toBeCloseTo(36, 10);
    expect(tempoMinPrKm(20)).toBeCloseTo(3, 10);
    expect(sekunderPr100m(20)).toBeCloseTo(18, 10);
    // Halv fart, dobbelt tempo: det er præcis den egenskab, der gør at en
    // lineær enhedsliste ville give en løser et forkert svar.
    expect(tempoMinPrKm(5)).toBeCloseTo(12, 10);
    expect((tempoMinPrKm(20) as number) * 2).toBeCloseTo(tempoMinPrKm(10) as number, 10);
  });

  test("farten 0 har intet tempo — det er udefineret, ikke uendeligt", () => {
    expect(tempoMinPrKm(0)).toBeNull();
    expect(sekunderPr100m(0)).toBeNull();
  });

  test("de afledte tal læses fra km/t, så de kan ikke glide fra værktøjet", () => {
    // Samme fart indskrevet i mph skal give præcis samme tempo som i km/t.
    const fraMph = omregnFartTilAlle(62.1371192233, "mph");
    expect(tempoMinPrKm(fraMph.km_t)).toBeCloseTo(tempoMinPrKm(100) as number, 8);
  });

  test("ugyldige tal giver null, så værktøjet kan skjule rækkerne", () => {
    expect(tempoMinPrKm(Number.NaN)).toBeNull();
    expect(sekunderPr100m(Number.NaN)).toBeNull();
  });
});

describe("OMREGNINGS_EKSEAMPLER", () => {
  test("de er de omregninger, autocomplete spørger om", () => {
    expect(OMREGNINGS_EKSEAMPLER.map((e) => `${e.fra}>${e.til}`)).toEqual([
      "km_t>m_s",
      "km_t>mph",
      "km_t>knop",
      "knop>km_t",
      "mph>km_t",
    ]);
  });

  test("de er alle færdigtal uden for fartsgrænsen, så tallene er prøvet", () => {
    for (const { vaerdi, fra, til } of OMREGNINGS_EKSEAMPLER) {
      const raat = omregnFart(vaerdi, fra, til);
      expect(Number.isFinite(raat)).toBe(true);
      expect(raat).toBeGreaterThan(0);
    }
  });
});
