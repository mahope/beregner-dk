import { describe, expect, test } from "vitest";
import {
  efterloenAlder,
  EFTERLOEN_ALDER_2026,
  EFTERLOEN_MAX_SATS,
  EFTERLOEN_MAX_SATS_DELTID,
  EFTERLOEN_SATS_PROCENT,
  MAX_TIMER_TIL_PRAEMIE,
  praemieManglerForudsætning,
  praemiePortioner,
  SKATTEFRI_PRAEMIE_2026,
} from "./efterloen";
import { DAGPENGE_2026 } from "./satser-2026";
import { folkepensionsalder } from "./folkepension";

describe("EFTERLOEN_MAX_SATS", () => {
  test("fuldtidssatsen er 91 % og 100 % af max dagpenge", () => {
    expect(EFTERLOEN_MAX_SATS.udenUdskydelse).toBe(20057);
    expect(EFTERLOEN_MAX_SATS.medUdskydelse).toBe(22041);
    expect(EFTERLOEN_MAX_SATS.udenUdskydelse).toBe(
      Math.round(DAGPENGE_2026.fuldtid * EFTERLOEN_SATS_PROCENT.udenUdskydelse),
    );
  });

  /**
   * Deltidsforsikret får 2/3 af dagpengesatsen (22.041 → 14.694 kr. i
   * ministeriets «Satser for 2026»), og efterlønssatsen er en procentdel af
   * *egen* max dagpenge. Værktøjet gangede tidligere 0,67 ind i
   * fuldtidssatsen, hvilket gav 13.438 kr. — 66 kr. for højt pr. måned.
   */
  test("deltidssatsen er 2/3 af fuldtidssatsen, ikke 0,67 gange den", () => {
    expect(EFTERLOEN_MAX_SATS_DELTID.udenUdskydelse).toBe(13372);
    expect(EFTERLOEN_MAX_SATS_DELTID.medUdskydelse).toBe(14694);

    // Grunden er deltidens egen dagpengesats, ikke fuldtidssatsen ganget med
    // et tilnærmet tal — derfor opgøres den mod `DAGPENGE_2026`.
    expect(EFTERLOEN_MAX_SATS_DELTID.udenUdskydelse).toBe(
      Math.round(DAGPENGE_2026.deltid * EFTERLOEN_SATS_PROCENT.udenUdskydelse),
    );
    expect(EFTERLOEN_MAX_SATS_DELTID.medUdskydelse).toBe(
      Math.round(DAGPENGE_2026.deltid * EFTERLOEN_SATS_PROCENT.medUdskydelse),
    );

    // 2/3 forholdet, med to kroners tolerance for de to afrundinger (20057 mod
    // 13372). Ved 0,67 bliver afvigelsen 100 kr., så porten kan ikke passes ved
    // en lille fejl i selve brødteksten.
    expect(
      Math.abs(EFTERLOEN_MAX_SATS.udenUdskydelse - (EFTERLOEN_MAX_SATS_DELTID.udenUdskydelse * 3) / 2),
    ).toBeLessThanOrEqual(2);
    expect(
      Math.abs(EFTERLOEN_MAX_SATS.medUdskydelse - (EFTERLOEN_MAX_SATS_DELTID.medUdskydelse * 3) / 2),
    ).toBeLessThanOrEqual(2);

    // 0,67 må ikke dukke op igen som erstatning for 2/3.
    expect(EFTERLOEN_MAX_SATS_DELTID.udenUdskydelse).not.toBe(
      Math.round(EFTERLOEN_MAX_SATS.udenUdskydelse * 0.67),
    );
  });
});

describe("EFTERLOEN_ALDER_2026", () => {
  test("indeholder præcis borger.dk's fem rækker", () => {
    expect(
      EFTERLOEN_ALDER_2026.map((raekke) => [
        raekke.fraDato,
        raekke.tilDato,
        raekke.efterloensalder.hoej,
        raekke.folkepensionsalder,
        raekke.maxAarPaaEfterloen.lav,
      ])
    ).toEqual([
      ["1. juli 1956", "31. december 1958", 63, 67, 4],
      ["1. januar 1959", "30. juni 1959", 64, 67, 3],
      ["1. juli 1959", "31. december 1962", 64, 67, 3],
      ["1. januar 1963", "31. december 1966", 65, 68, 3],
      ["1. januar 1967", "31. december 1970", 66, 69, 3],
    ]);
  });

  test("dækker hvert fødselsår 1956-1970 uden overlap eller huller", () => {
    for (let aar = 1956; aar <= 1970; aar += 1) {
      const raekker = EFTERLOEN_ALDER_2026.filter(
        (r) => aar >= r.fraAar && aar <= (r.tilAar ?? r.fraAar)
      );
      expect(raekker).toHaveLength(1);
    }
  });

  test("forskelsalderen forsvinder aldrig", () => {
    for (let aar = 1956; aar <= 1970; aar += 1) {
      const alder = efterloenAlder(aar);
      expect(alder.efterloensalder!).toBeLessThan(alder.folkepensionsalder!);
    }
  });
});

describe("efterloenAlder", () => {
  test("født 1963-1966: efterløn 65 og folkepension 68", () => {
    for (const aar of [1963, 1964, 1965, 1966]) {
      expect(efterloenAlder(aar)).toMatchObject({
        efterloensalder: 65,
        folkepensionsalder: 68,
        maxAarPaaEfterloen: 3,
        praecis: true,
        udenForTabel: false,
      });
    }
  });

  test("født 1967-1970: efterløn 66 og folkepension 69", () => {
    for (const aar of [1967, 1968, 1969, 1970]) {
      expect(efterloenAlder(aar)).toMatchObject({
        efterloensalder: 66,
        folkepensionsalder: 69,
        maxAarPaaEfterloen: 3,
      });
    }
  });

  test("født 1959 er et interval og markeres som upræcist", () => {
    const alder = efterloenAlder(1959);
    expect(alder.praecis).toBe(false);
    expect(alder.efterloensalder).toBe(64);
    expect(alder.folkepensionsalder).toBe(67);
    expect(alder.maxAarPaaEfterloen).toBe(3);
  });

  test("bruger aldrig en lavere alder end den officielle", () => {
    // 1959 er det eneste år med to aldre; værktøjet skal bruge den højeste.
    const raekke = EFTERLOEN_ALDER_2026.find((r) => r.fraAar === 1959)!;
    expect(efterloenAlder(1959).efterloensalder).toBe(raekke.efterloensalder.hoej);
  });

  test("årsældre uden for tabellen beder om a-kassen", () => {
    for (const aar of [1955, 1971, 1980, 1990]) {
      expect(efterloenAlder(aar).udenForTabel).toBe(true);
      expect(efterloenAlder(aar).folkepensionsalder).toBeUndefined();
    }
  });
});

describe("efterloens folkepensionsalder mod folkepension.ts", () => {
  test("de to moduler er enige for alle fødselsår i tabellen", () => {
    for (let aar = 1956; aar <= 1970; aar += 1) {
      const efterloen = efterloenAlder(aar);
      // Sidste dag i året, så alderen er den, der gælder ved årets slutning.
      const fraFolkepension = folkepensionsalder(`${aar}-12-31`);
      expect(efterloen.folkepensionsalder).toBe(fraFolkepension);
    }
  });
});

describe("SKATTEFRI_PRAEMIE_2026", () => {
  test("481 timer pr. portion, 12 portioner og 5.772 timer i alt", () => {
    expect(SKATTEFRI_PRAEMIE_2026.timerPerPortion).toBe(481);
    expect(SKATTEFRI_PRAEMIE_2026.maxPortioner).toBe(12);
    expect(MAX_TIMER_TIL_PRAEMIE).toBe(5772);
  });

  test("portionen er 15.870 kr. fuldtid og 10.580 kr. deltid", () => {
    expect(SKATTEFRI_PRAEMIE_2026.portion.full).toBe(15870);
    expect(SKATTEFRI_PRAEMIE_2026.portion.part).toBe(10580);
  });

  test("kun hele portioner tæller", () => {
    expect(praemiePortioner(480, true)).toBe(0);
    expect(praemiePortioner(481, true)).toBe(1);
    expect(praemiePortioner(962, true)).toBe(2);
    expect(praemiePortioner(1_000, true)).toBe(2);
  });

  test("loftet er 12 portioner", () => {
    expect(praemiePortioner(5_772, true)).toBe(12);
    expect(praemiePortioner(6_000, true)).toBe(12);
  });

  test("optjening fra efterløn kræver 2 års udskydelse", () => {
    expect(praemiePortioner(1_000, false)).toBe(0);
    expect(praemieManglerForudsætning(1_000, false)).toBe(true);
    expect(praemieManglerForudsætning(1_000, true)).toBe(false);
    expect(praemieManglerForudsætning(100, false)).toBe(false);
  });
});
