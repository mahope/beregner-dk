/**
 * Tidszonen låses, fordi hele pointen med `heleDageMellem` er skiftet for
 * sommertid: i UTC er 25.–26. oktober 2026 præcis 24 timer, så en fejl
 * aldrig kunne fejle på en byggemaskine.
 */
process.env.TZ = "Europe/Copenhagen";

import { describe, expect, test } from "vitest";
import {
  heleDageMellem,
  parseIsoDato,
  plusIsoMaaneder,
  tilIsoDato,
} from "./lokal-dato";

describe("tilIsoDato", () => {
  test("skriver kalenderfeltet, ikke UTC-dagen", () => {
    // Bygget af kalenderfelterne, så forventningen holder i alle tidszoner.
    expect(tilIsoDato(new Date(2026, 0, 15))).toBe("2026-01-15");
    expect(tilIsoDato(new Date(2026, 11, 5))).toBe("2026-12-05");
  });

  test("padder måned og dag til to tegn", () => {
    expect(tilIsoDato(new Date(2026, 8, 7))).toBe("2026-09-07");
  });
});

describe("parseIsoDato", () => {
  test("læser kalenderdatoen i lokal tid", () => {
    const dato = parseIsoDato("1990-03-15");
    expect(dato?.getFullYear()).toBe(1990);
    expect(dato?.getMonth()).toBe(2);
    expect(dato?.getDate()).toBe(15);
  });

  test("afviser tomme, korte og umulige datoer", () => {
    expect(parseIsoDato("")).toBeNull();
    expect(parseIsoDato("1990-3-15")).toBeNull();
    expect(parseIsoDato("1990-03")).toBeNull();
    expect(parseIsoDato("1990-02-31")).toBeNull();
    expect(parseIsoDato("1990-13-01")).toBeNull();
  });
});

describe("plusIsoMaaneder", () => {
  test("flytter hen over årsskiftet", () => {
    expect(plusIsoMaaneder("2026-12-15", 1)).toBe("2027-01-15");
    expect(plusIsoMaaneder("2026-01-15", -1)).toBe("2025-12-15");
  });

  test("klemmer til månedens sidste dag i stedet for at rulle over", () => {
    expect(plusIsoMaaneder("2026-01-31", 1)).toBe("2026-02-28");
    expect(plusIsoMaaneder("2028-01-31", 1)).toBe("2028-02-29");
  });

  test("afviser en ugyldig dato", () => {
    expect(plusIsoMaaneder("", 1)).toBeNull();
  });
});

describe("heleDageMellem", () => {
  const dage = (fra: string, til: string) =>
    heleDageMellem(parseIsoDato(fra)!, parseIsoDato(til)!);

  test("tæller kalenderdage, ikke 24-timers blokke", () => {
    expect(dage("2026-09-28", "2026-09-29")).toBe(1);
    expect(dage("2026-09-28", "2026-12-29")).toBe(92);
    expect(dage("2026-09-28", "2026-09-28")).toBe(0);
  });

  test("skifter for sommertid tæller som én dag, ikke to", () => {
    // 25. oktober 2026 er søndagen hvor Danmark går tilbage: 25 timer
    // mellem de to midnat. En Math.ceil på millisekunderne svarede 2.
    expect(dage("2026-10-25", "2026-10-26")).toBe(1);
    expect(dage("2026-10-24", "2026-10-26")).toBe(2);
    // Og den anden vej: 29. marts 2026 er 23 timer, men stadig én dag mere.
    expect(dage("2026-03-28", "2026-03-30")).toBe(2);
  });

  test("beholder fortegnet, så en omvendt række trækker fra", () => {
    expect(dage("2026-10-26", "2026-10-25")).toBe(-1);
  });
});
