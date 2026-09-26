import { describe, expect, test } from "vitest";
import { erSommertid, sidsteSoendagIMaaned, soendagIMaaned, utcOffsetMinutter } from "./sommertid";

/** Dato som et lokalt kalenderdato, så testene ikke afhænger af testmaskinens zone. */
const d = (aar: number, maaned: number, dag: number) => new Date(aar, maaned - 1, dag);

describe("sommertid", () => {
  // Overgangsdatoerne er verificeret mod IANA-tzbasen (systemets zoneinfo) for
  // 2026 og 2027. Et afvigende årstal her betyder, at en regel er ændret i
  // tidszonebasen og modulet skal følge med.
  test("EU: sidste søndag i marts til sidste søndag i oktober", () => {
    expect(sidsteSoendagIMaaned(2026, 2).getDate()).toBe(29);
    expect(sidsteSoendagIMaaned(2026, 9).getDate()).toBe(25);
    expect(sidsteSoendagIMaaned(2027, 2).getDate()).toBe(28);
    expect(sidsteSoendagIMaaned(2027, 9).getDate()).toBe(31);

    expect(erSommertid(d(2026, 3, 28), "eu")).toBe(false);
    expect(erSommertid(d(2026, 3, 29), "eu")).toBe(true);
    expect(erSommertid(d(2026, 9, 26), "eu")).toBe(true);
    expect(erSommertid(d(2026, 10, 25), "eu")).toBe(false);
    expect(erSommertid(d(2027, 1, 1), "eu")).toBe(false);
  });

  test("USA: anden søndag i marts til første søndag i november", () => {
    expect(erSommertid(d(2026, 3, 7), "us")).toBe(false);
    expect(erSommertid(d(2026, 3, 8), "us")).toBe(true);
    expect(erSommertid(d(2026, 11, 1), "us")).toBe(false);
    expect(erSommertid(d(2026, 9, 26), "us")).toBe(true);
    expect(erSommertid(d(2027, 3, 14), "us")).toBe(true);
  });

  test("Australien: første søndag i oktober til første søndag i april", () => {
    expect(erSommertid(d(2026, 4, 5), "au")).toBe(false);
    expect(erSommertid(d(2026, 4, 4), "au")).toBe(true);
    expect(erSommertid(d(2026, 1, 15), "au")).toBe(true);
    expect(erSommertid(d(2026, 10, 3), "au")).toBe(false);
    expect(erSommertid(d(2026, 10, 4), "au")).toBe(true);
  });

  test("zoner uden sommertid har aldrig sommertid", () => {
    for (const dato of [d(2026, 1, 15), d(2026, 4, 1), d(2026, 7, 15), d(2026, 12, 1)]) {
      expect(erSommertid(dato, "ingen")).toBe(false);
    }
  });

  test("offsetten skifter præcis en time ved overgangen", () => {
    // Danmark: UTC+1 -> UTC+2, New York: UTC-5 -> UTC-4. Da skifter de begge,
    // bliver forskellen 6 timer hele året. Det er grundene til, at forskellen
    // til USA alene ikke afslører om sommertiden er indarbejdet.
    const forskel = (dato: Date) =>
      (utcOffsetMinutter(-300, -240, "us", dato) - utcOffsetMinutter(60, 120, "eu", dato)) / 60;

    expect(forskel(d(2026, 1, 15))).toBe(-6);
    expect(forskel(d(2026, 4, 1))).toBe(-6);
    expect(forskel(d(2026, 9, 26))).toBe(-6);
    expect(forskel(d(2026, 12, 1))).toBe(-6);

    // Sydney derimod: AEST (UTC+10) og AEDT (UTC+11) mellem Danmarks egne
    // skift, så forskellen svinger mellem 8 og 10 timer.
    const sydney = (dato: Date) =>
      (utcOffsetMinutter(600, 660, "au", dato) - utcOffsetMinutter(60, 120, "eu", dato)) / 60;
    expect(sydney(d(2026, 9, 26))).toBe(8);
    expect(sydney(d(2026, 1, 15))).toBe(10);

    // Tokyo har ingen sommertid, så forskellen til Danmark følger Danmarks skift.
    const tokyo = (dato: Date) =>
      (utcOffsetMinutter(540, undefined, "ingen", dato) - utcOffsetMinutter(60, 120, "eu", dato)) / 60;
    expect(tokyo(d(2026, 1, 15))).toBe(8);
    expect(tokyo(d(2026, 7, 15))).toBe(7);
  });

  test("en zone uden sommertid returnerer altid vinteroffsetten", () => {
    expect(utcOffsetMinutter(330, undefined, "eu", d(2026, 7, 15))).toBe(330);
    expect(utcOffsetMinutter(330, 330, "eu", d(2026, 7, 15))).toBe(330);
  });

  test("dagskift og månedslængder holder i overgangsmånederne", () => {
    // 29. marts 2026 er en søndag; 25. oktober 2026 også. En fejl i ugedags-
    // beregningen ville ramme præcis disse dage.
    expect(sidsteSoendagIMaaned(2026, 2).getDay()).toBe(0);
    expect(sidsteSoendagIMaaned(2026, 9).getDay()).toBe(0);
    // Den 5. søndag i oktober 2026 ligger i november, så "sidste søndag" kan
    // ikke findes som den 5. søndag.
    expect(soendagIMaaned(2026, 9, 5).getMonth()).toBe(10);
    expect(soendagIMaaned(2026, 1, 5).getDay()).toBe(0);
    expect(soendagIMaaned(2026, 3, 5).getDay()).toBe(0);
  });
});
