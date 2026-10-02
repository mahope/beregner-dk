import { describe, test, expect } from "vitest";
import { isoUge, antalUgerIIsoAar, datoerIUge, mandagIIsoUge, ugeDatoerFaqSvar } from "./ugenummer";

describe("isoUge", () => {
  test("returns null for invalid input", () => {
    expect(isoUge("")).toBeNull();
    expect(isoUge("2026-13-01")).toBeNull();
    expect(isoUge("2026-02-30")).toBeNull();
    expect(isoUge(new Date("invalid"))).toBeNull();
  });

  test("ordinary mid-year date", () => {
    const r = isoUge("2026-02-23")!;
    expect(r.uge).toBe(9);
    expect(r.isoAar).toBe(2026);
  });

  test("Monday of a normal week (today's reference)", () => {
    const r = isoUge("2026-08-24")!;
    expect(r.uge).toBe(35);
    expect(r.ugedagNr).toBe(1);
  });

  test("Sunday has weekday number 7", () => {
    const r = isoUge("2026-08-30")!;
    expect(r.ugedagNr).toBe(7);
    expect(r.uge).toBe(35);
  });

  test("January 1 on a Thursday is week 1 of the same year", () => {
    const r = isoUge("2026-01-01")!;
    expect(r.uge).toBe(1);
    expect(r.isoAar).toBe(2026);
  });

  test("late Monday belongs to week 1 of the NEXT year", () => {
    const r = isoUge("2025-12-29")!;
    expect(r.uge).toBe(1);
    expect(r.isoAar).toBe(2026);
  });

  test("late Monday after leap year maps to week 1 of next year", () => {
    const r = isoUge("2024-12-30")!;
    expect(r.uge).toBe(1);
    expect(r.isoAar).toBe(2025);
  });

  test("January 1 on a Sunday belongs to week 52 of the PREVIOUS year", () => {
    const r = isoUge("2023-01-01")!;
    expect(r.uge).toBe(52);
    expect(r.isoAar).toBe(2022);
  });

  test("January 1 on a Friday belongs to week 53 of the previous year", () => {
    const r = isoUge("2021-01-01")!;
    expect(r.uge).toBe(53);
    expect(r.isoAar).toBe(2020);
  });

  test("December 31 in a 53-week year stays in week 53", () => {
    const r = isoUge("2020-12-31")!;
    expect(r.uge).toBe(53);
    expect(r.isoAar).toBe(2020);
  });

  test("Sunday early January can be week 53 of two years back", () => {
    const r = isoUge("2016-01-03")!;
    expect(r.uge).toBe(53);
    expect(r.isoAar).toBe(2015);
  });

  test("January 1 on a Saturday belongs to week 52 of the previous year", () => {
    const r = isoUge("2000-01-01")!;
    expect(r.uge).toBe(52);
    expect(r.isoAar).toBe(1999);
  });

  test("accepts Date objects identically to strings", () => {
    expect(isoUge(new Date(2026, 7, 24))).toEqual(isoUge("2026-08-24"));
  });
});

describe("antalUgerIIsoAar", () => {
  test("returns null for invalid input", () => {
    expect(antalUgerIIsoAar(0)).toBeNull();
    expect(antalUgerIIsoAar(-2026)).toBeNull();
    expect(antalUgerIIsoAar(2026.5)).toBeNull();
    expect(antalUgerIIsoAar(NaN)).toBeNull();
    expect(antalUgerIIsoAar(10000)).toBeNull();
  });

  test("years with 53 weeks", () => {
    // Jan 1 is a Thursday (2026) or Wednesday in a leap year (2020)
    expect(antalUgerIIsoAar(2026)).toBe(53);
    expect(antalUgerIIsoAar(2020)).toBe(53);
    expect(antalUgerIIsoAar(2015)).toBe(53);
  });

  test("normal years have 52 weeks", () => {
    expect(antalUgerIIsoAar(2024)).toBe(52);
    expect(antalUgerIIsoAar(2025)).toBe(52);
    expect(antalUgerIIsoAar(2027)).toBe(52);
  });

  test("week number never exceeds weeks-in-year for every day of 2026", () => {
    for (let d = new Date(2026, 0, 1); d.getFullYear() === 2026; d.setDate(d.getDate() + 1)) {
      const r = isoUge(new Date(d))!;
      expect(r.uge).toBeLessThanOrEqual(53);
      expect(r.uge).toBeGreaterThanOrEqual(1);
      if (r.isoAar === 2026) expect(r.uge).toBeLessThanOrEqual(antalUgerIIsoAar(2026)!);
    }
  });
});

describe("datoerIUge", () => {
  test("uge 42 i 2026 er de syv dage fra mandag 12. oktober til søndag 18. oktober", () => {
    // «datoer i uge 42» er 5. af 10 danske autocomplete-completions under
    // «dato» (målt 2/10 13:25 på suggestqueries, hl=da gl=dk).
    expect(datoerIUge(42, 2026)?.map((d) => d.isoDato)).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
    ]);
  });

  test("uge 1 kan begynde i december året før", () => {
    // 1. januar 2026 er en torsdag, så uge 1 starter 29. december 2025.
    const uge = datoerIUge(1, 2026)!;
    expect(uge[0].isoDato).toBe("2025-12-29");
    expect(uge[6].isoDato).toBe("2026-01-04");
    expect(uge.map((d) => d.ugedagNr)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("uge 53 findes kun i de år, der har 53 uger", () => {
    // 2026 har 53 uger, 2027 har 52 — så uge 53 i 2027 må ikke findes.
    expect(datoerIUge(53, 2026)?.[0].isoDato).toBe("2026-12-28");
    expect(datoerIUge(53, 2026)?.[6].isoDato).toBe("2027-01-03");
    expect(datoerIUge(53, 2027)).toBeNull();
    expect(datoerIUge(0, 2026)).toBeNull();
    expect(datoerIUge(54, 2026)).toBeNull();
    expect(datoerIUge(42.5, 2026)).toBeNull();
  });

  test("alle syv dage i en uge løser tilbage til samme uge og iso-år", () => {
    // Den egen port mod `isoUge`: den skal kunne regne begge veje.
    for (const [uge, isoAar] of [
      [1, 2026],
      [42, 2026],
      [52, 2026],
      [53, 2026],
      [1, 2025],
      [1, 2027],
      [20, 2024],
    ] as const) {
      for (const dag of datoerIUge(uge, isoAar)!) {
        const r = isoUge(dag.isoDato)!;
        expect([r.uge, r.isoAar]).toEqual([uge, isoAar]);
        expect(r.ugedagNr).toBe(dag.ugedagNr);
      }
    }
  });

  test("mandagIIsoUge er samme dato for alle dage i ugen", () => {
    for (const isoDato of ["2026-10-12", "2026-10-15", "2026-10-18"]) {
      const r = isoUge(isoDato)!;
      expect(mandagIIsoUge(r.uge, r.isoAar)?.toISOString().slice(0, 10)).toBe("2026-10-12");
    }
  });
});

describe("ugeDatoerFaqSvar", () => {
  test("svaret til «datoer i uge 42» læser begge datoer fra datoerIUge", () => {
    const svar = ugeDatoerFaqSvar(42, 2026);
    expect(svar).toContain("mandag den 12. oktober 2026");
    expect(svar).toContain("søndag den 18. oktober 2026");
    expect(svar).toContain("Uge 42 i 2026");
    // Ugen er syv dage, og det er samme uge `isoUge` regner for dem alle.
    expect(datoerIUge(42, 2026)).toHaveLength(7);
  });

  test("en uge, der ikke findes, får et svar der siger det", () => {
    // 2027 har 52 uger — aldrig en tom streng i FAQ'en (punkt 11).
    const svar = ugeDatoerFaqSvar(53, 2027);
    expect(svar).toContain("52");
    expect(svar).toContain("findes ikke");
    expect(svar.length).toBeGreaterThan(20);
  });
});
