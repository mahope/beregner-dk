import { describe, expect, test } from "vitest";
import {
  BARN_ALDRER,
  dagForAlderTabel,
  foedselsdatoVedAlder,
  levetVedAlder,
  MAX_ALDER,
  VOKSNE_ALDRER,
} from "./alder-levet";
import { beregnAlder } from "./alder";

/**
 * "Så mange dage har du levet som 10-årig?" — tabellen på /alder.
 *
 * Dagens dato er et argument overalt, så tallene låses på bestemte dage i stedet
 * for at følge klokken. Samme regel som resten af `/alder`-porten.
 */
const I_DAG = "2026-10-03";

describe("levetVedAlder", () => {
  test("tager alderen som hele år, dage, uger og måneder", () => {
    const r = levetVedAlder(10, I_DAG);

    // 10 × 365 dage + skuddagene 2020 og 2024.
    expect(r).not.toBeNull();
    expect(r?.foedselsdato).toBe("2016-10-03");
    expect(r?.totalDage).toBe(3652);
    expect(r?.totalUger).toBe(521);
    expect(r?.totalMaaneder).toBe(120);
  });

  test("skuddagene i årene imellem tælles med", () => {
    // 8 år: skuddagene 2020 og 2024.
    expect(levetVedAlder(8, I_DAG)?.totalDage).toBe(2922);
    expect(levetVedAlder(18, I_DAG)?.totalDage).toBe(6574);
    expect(levetVedAlder(50, I_DAG)?.totalDage).toBe(18262);
  });

  test("er præcis beregnAlder på de samme to datoer", () => {
    for (const aar of [1, 8, 10, 18, 50, 80]) {
      const r = levetVedAlder(aar, I_DAG);
      const foedselsdato = foedselsdatoVedAlder(aar, I_DAG);
      const forventet = beregnAlder({ foedselsdato: foedselsdato ?? "", beregningsdato: I_DAG });

      expect(r?.totalDage).toBe(forventet?.totalDage);
      expect(r?.totalUger).toBe(forventet?.totalUger);
      expect(r?.totalMaaneder).toBe(forventet?.totalMaaneder);
      // Skuddagene i årene imellem gør dage-tallet *mindst* N x 365.
      expect(r?.totalDage).toBeGreaterThanOrEqual(aar * 365);
    }
  });

  test("29. februar som fødselsdato bliver 28. februar, ikke 1. marts", () => {
    // `new Date(2023, 1, 29)` ville rullet videre til 1. marts og givet en
    // fødselsdato en måned forskudt — altså en helt alder forkert.
    expect(foedselsdatoVedAlder(1, "2024-02-29")).toBe("2023-02-28");
    // 2020 *er* et skudår, så dens 29. februar er en rigtig fødselsdato og
    // skal ikke flyttes — kun skudår uden 29. februar gør det.
    expect(foedselsdatoVedAlder(4, "2024-02-29")).toBe("2020-02-29");
  });

  // Uden `dagForAlderTabel` døde 18 af de 26 rækker den 29. februar, fordi
  // invarianten `dage === 0` forlanger en fødselsdato præcis N år før dagen: en
  // fødselsdag 28. februar er 16 år *og 1 dag* den 29. februar 2024. Kun de otte
  // aldre hvis fødselsår er et skudår har en fødselsdag 29. februar — og den er
  // netop N år gammel, fordi begge endepunkter er 29. februar. Beviset står her,
  // fordi det er den regel `dagForAlderTabel`s docblock begrunder med.
  test("på 29. februar overlever kun de otte skudårsaldre uden reglen", () => {
    for (const skudDag of ["2024-02-29", "2020-02-29", "2028-02-29"]) {
      const aldre = [...BARN_ALDRER, ...VOKSNE_ALDRER];
      const gyldige = aldre.filter((aar) => {
        const foedselsdato = foedselsdatoVedAlder(aar, skudDag);
        const r = foedselsdato ? beregnAlder({ foedselsdato, beregningsdato: skudDag }) : null;
        return r?.aar === aar && r?.maaneder === 0 && r?.dage === 0;
      });
      expect(aldre).toHaveLength(26); // 8 overlever, 18 forsvinder.
      expect(gyldige).toEqual([4, 8, 12, 16, 20, 40, 60, 80]);
    }
  });

  // Reglen flytter dagen én dag bagud i skudår, så tabellen har alle 26 rækker.
  test("tabellen har alle sine rækker på 29. februar", () => {
    expect(dagForAlderTabel("2024-02-29")).toBe("2024-02-28");
    // En dag der ikke findes, ændrer intet.
    expect(dagForAlderTabel(I_DAG)).toBe(I_DAG);
    for (const dag of ["2024-02-28", "2024-02-29", "2025-02-28", "2026-10-03"]) {
      const iso = dagForAlderTabel(dag);
      for (const aar of [...BARN_ALDRER, ...VOKSNE_ALDRER]) {
        expect(levetVedAlder(aar, iso)).not.toBeNull();
      }
    }
  });

  test("den skarpe dag giver præcis den fulde alder", () => {
    for (const aar of [1, 8, 10, 18, 50]) {
      const foedselsdato = foedselsdatoVedAlder(aar, "2024-02-28") ?? "";
      const r = beregnAlder({ foedselsdato, beregningsdato: "2024-02-28" });
      expect([r?.aar, r?.maaneder, r?.dage]).toEqual([aar, 0, 0]);
    }
  });

  test("afviser en alder, der ikke findes", () => {
    expect(levetVedAlder(0, I_DAG)).toBeNull();
    expect(levetVedAlder(-1, I_DAG)).toBeNull();
    expect(levetVedAlder(MAX_ALDER + 1, I_DAG)).toBeNull();
    expect(levetVedAlder(1.5, I_DAG)).toBeNull();
    expect(levetVedAlder(10, "2026-13-40")).toBeNull();
  });

  test("rækkerne dækker de otte aldre, autocomplete spørger om", () => {
    for (const aar of [8, 10, 12, 13, 14, 15]) {
      expect(BARN_ALDRER).toContain(aar);
    }
    // "hur många dagar har man levt när man fyller 50 år" er den eneste af de
    // otte svenske søgninger, der ikke spørger om en barndomsalder.
    expect(VOKSNE_ALDRER).toContain(50);
  });
});