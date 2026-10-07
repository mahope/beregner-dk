import { describe, expect, test } from "vitest";
import {
  INDSOVNING_MINUTTER,
  MAX_ALDER,
  SENGETID_CYKLUSSER,
  SOEVN_EKSEMPEL,
  SOEVN_GRUPPER,
  SOEVNCYKLUS_MINUTTER,
  sengetider,
  soevnGruppeForAlder,
  soevnInterval,
  soevnbehov,
  soevnbehovFaqSvar,
} from "./soevnbehov";

describe("aldersgrupperne dækker hele spændet uden huller", () => {
  // Tabellen er en kontrakt: hver alder fra 0 til MAX_ALDER skal ramme præcis
  // én gruppe. Et hul ville give `soevnGruppeForAlder` en `undefined` i praksis,
  // og et overlap ville gøre svaret afhængigt af rækkefølgen i arrayet.
  test("grupperne ligger i rækkefølge og støder op til hinanden", () => {
    expect(SOEVN_GRUPPER[0].minAar).toBe(0);
    expect(SOEVN_GRUPPER[SOEVN_GRUPPER.length - 1].maxAar).toBe(Infinity);
    for (let i = 1; i < SOEVN_GRUPPER.length; i++) {
      expect(SOEVN_GRUPPER[i].minAar, `gruppe ${i}`).toBe(
        SOEVN_GRUPPER[i - 1].maxAar
      );
    }
  });

  test("hver alder giver en gruppe, og den er den rigtige", () => {
    for (let alder = 0; alder <= MAX_ALDER; alder += 0.5) {
      const gruppe = soevnGruppeForAlder(alder);
      expect(gruppe.minAar, `${alder} år`).toBeLessThanOrEqual(alder);
      expect(alder, `${alder} år`).toBeLessThan(gruppe.maxAar);
    }
  });
});

describe("grænserne mellem grupperne", () => {
  // Grænsen hører til den ældste gruppe, og 18-årige er voksne, fordi kilden
  // skriver både «Teen 13-18» og «Adult 18 years and older» — de overlapper,
  // og værktøjet skal give ét svar.
  test.each([
    [0, "baby"],
    [0.25, "baby"],
    [4 / 12, "spaedbarn"],
    [0.9, "spaedbarn"],
    [1, "smaabarn"],
    [2.9, "smaabarn"],
    [3, "boernehave"],
    [5.9, "boernehave"],
    [6, "skole"],
    [12.9, "skole"],
    [13, "teen"],
    [17.9, "teen"],
    [18, "voksen"],
    [40, "voksen"],
    [120, "voksen"],
  ] as const)("%s år er %s", (alder, id) => {
    expect(soevnGruppeForAlder(alder).id).toBe(id);
  });

  test("kaster på en alder uden for spændet", () => {
    expect(() => soevnGruppeForAlder(-1)).toThrow();
    expect(() => soevnGruppeForAlder(121)).toThrow();
    expect(() => soevnGruppeForAlder(Number.NaN)).toThrow();
  });
});

describe("tallene er kildens tabel, ikke skrevet i brødteksten", () => {
  // Sleep Foundation / AASM-tabellen, læst 7/10 2026. Hver række er den
  // anbefaling, kilden angiver — så en redigering af modulet bliver rød her.
  test.each([
    ["baby", 14, 17],
    ["spaedbarn", 12, 16],
    ["smaabarn", 11, 14],
    ["boernehave", 10, 13],
    ["skole", 9, 12],
    ["teen", 8, 10],
    ["voksen", 7, 9],
  ] as const)("%s: %i-%i timer", (id, min, max) => {
    const gruppe = SOEVN_GRUPPER.find((g) => g.id === id)!;
    expect(gruppe.minTimer).toBe(min);
    expect(gruppe.maxTimer).toBe(max);
  });

  test("soevnbehov læser gruppens interval", () => {
    expect(soevnbehov(15)).toMatchObject({ minTimer: 8, maxTimer: 10 });
    expect(soevnbehov(0.1)).toMatchObject({ minTimer: 14, maxTimer: 17 });
    expect(soevnbehov(40)).toMatchObject({ minTimer: 7, maxTimer: 9 });
  });

  test("kun de yngste grupper regner lur med", () => {
    for (const id of ["baby", "spaedbarn", "smaabarn", "boernehave"]) {
      expect(SOEVN_GRUPPER.find((g) => g.id === id)!.lur, id).toBe(true);
    }
    for (const id of ["skole", "teen", "voksen"]) {
      expect(SOEVN_GRUPPER.find((g) => g.id === id)!.lur, id).toBe(false);
    }
  });
});

describe("sengetider følger søvncyklusser", () => {
  test("eksempel: skal du op 07:00, er sengetiderne 21:45, 23:15 og 00:45", () => {
    expect(sengetider("07:00")).toEqual([
      { cyklusser: 6, tid: "21:45" },
      { cyklusser: 5, tid: "23:15" },
      { cyklusser: 4, tid: "00:45" },
    ]);
  });

  test("hver sengetid ligger præcis cyklusser × 90 min + 15 min før vækketiden", () => {
    for (const sengetid of sengetider("06:30")) {
      const [t, m] = sengetid.tid.split(":").map(Number);
      const sengetidMin = t * 60 + m;
      const forventet =
        (390 - sengetid.cyklusser * SOEVNCYKLUS_MINUTTER - INDSOVNING_MINUTTER + 1440) %
        1440;
      expect(sengetidMin, sengetid.tid).toBe(forventet);
    }
  });

  test("vækketid efter midnat giver en sengetid om eftermiddagen", () => {
    // 6 cyklusser = 9 timer + 15 min indsovning = 9 t 15 min før 00:00.
    expect(sengetider("00:00")[0]).toEqual({ cyklusser: 6, tid: "14:45" });
  });

  test("kaster på en ugyldig tid", () => {
    expect(() => sengetider("25:00")).toThrow();
    expect(() => sengetider("07:60")).toThrow();
    expect(() => sengetider("i morgen")).toThrow();
  });

  test("cyklus-listen er den komponenten viser", () => {
    expect([...SENGETID_CYKLUSSER]).toEqual([6, 5, 4]);
    expect(SENGETID_CYKLUSSER.length).toBe(sengetider("07:00").length);
  });
});

describe("eksemplet og FAQ-svaret", () => {
  test("SOEVN_EKSEMPEL er en 15-årig i teenager-gruppen", () => {
    expect(SOEVN_EKSEMPEL.aar).toBe(15);
    expect(SOEVN_EKSEMPEL.gruppe.id).toBe("teen");
    expect(soevnInterval(SOEVN_EKSEMPEL)).toBe("8-10");
  });

  test.each(["da", "se"] as const)("FAQ-svaret (%s) bærer intervallet", (locale) => {
    const svar = soevnbehovFaqSvar(15, locale);
    expect(svar).toContain("8-10");
    expect(svar).toContain("15");
  });
});
