import { describe, expect, test } from "vitest";
import {
  beregnMoms,
  momsAndel,
  momsFaktor,
  MOMS_REFERENCE_BELOEB,
  MOMS_SATSER,
  MOMS_SATS_VALG_SE,
  normalizeMomssats,
  opsummering,
  referenceRaekker,
  fratraekRaekker,
  type MomsBeregningstype,
} from "./moms";

describe("moms", () => {
  test.each([
    { sats: 25, faktor: 1.25, andel: 0.2 },
    { sats: 12, faktor: 1.12, andel: 0.12 / 1.12 },
    { sats: 6, faktor: 1.06, andel: 0.06 / 1.06 },
  ])("$sats % har faktoren $faktor og andelen $andel", ({ sats, faktor, andel }) => {
    expect(momsFaktor(sats)).toBe(faktor);
    expect(momsAndel(sats)).toBeCloseTo(andel, 12);
  });

  test("momsandelen i en pris inkl. moms er 20 % ved 25 %", () => {
    // Brødteksten siger 25 / 125 = 0,20 — ikke 0,25.
    expect(momsAndel(25) * 100).toBeCloseTo(20, 10);
    expect(beregnMoms(1000, "fratraekMoms", 25).momsBeloeb).toBeCloseTo(200, 10);
  });

  describe("normalizeMomssats", () => {
    test("accepterer alle tre svenske satser", () => {
      for (const sats of MOMS_SATSER.se) {
        expect(normalizeMomssats(sats, "se")).toBe(sats);
      }
    });

    test("dansk og norsk url-state med 12 eller 6 % falder tilbage på 25 %", () => {
      for (const locale of ["da", "no"] as const) {
        expect(normalizeMomssats(12, locale)).toBe(25);
        expect(normalizeMomssats(6, locale)).toBe(25);
        expect(normalizeMomssats(25, locale)).toBe(25);
      }
    });

    test("tastede værdier, tom streng og NaN falder tilbage på 25 %", () => {
      expect(normalizeMomssats("12", "se")).toBe(12);
      expect(normalizeMomssats("12", "da")).toBe(25);
      expect(normalizeMomssats("", "se")).toBe(25);
      expect(normalizeMomssats(undefined, "se")).toBe(25);
      expect(normalizeMomssats(NaN, "se")).toBe(25);
      expect(normalizeMomssats(7.5, "se")).toBe(25);
    });
  });

  describe("beregnMoms", () => {
    test("tillæg: 1.000 kr. uden moms bliver 1.250 kr. inkl. moms", () => {
      const r = beregnMoms(1000, "tillaegMoms", 25);
      expect(r.prisUdenMoms).toBe(1000);
      expect(r.momsBeloeb).toBeCloseTo(250, 10);
      expect(r.prisInklMoms).toBeCloseTo(1250, 10);
    });

    test("fratræk: 1.250 kr. inkl. moms bliver 1.000 kr. uden moms", () => {
      const r = beregnMoms(1250, "fratraekMoms", 25);
      expect(r.prisUdenMoms).toBeCloseTo(1000, 10);
      expect(r.momsBeloeb).toBeCloseTo(250, 10);
      expect(r.prisInklMoms).toBe(1250);
    });

    test("find: 1.250 kr. inkl. moms indeholder 250 kr. moms", () => {
      const r = beregnMoms(1250, "findMoms", 25);
      expect(r.momsBeloeb).toBeCloseTo(250, 10);
      expect(r.prisInklMoms).toBe(1250);
    });

    test("find og fratræk er samme regnestykke, kun valget af knap er forskelligt", () => {
      // Værktøjet skal ikke give to forskellige svar på det samme spørgsmål.
      expect(beregnMoms(1120, "findMoms", 12)).toEqual(beregnMoms(1120, "fratraekMoms", 12));
    });

    test("tillæg og fratræk er hinandens modsætning ved alle tre satser", () => {
      for (const sats of MOMS_SATSER.se) {
        const frem = beregnMoms(1000, "tillaegMoms", sats);
        const tilbage = beregnMoms(frem.prisInklMoms, "fratraekMoms", sats);
        expect(tilbage.prisUdenMoms).toBeCloseTo(1000, 9);
        expect(tilbage.momsBeloeb).toBeCloseTo(frem.momsBeloeb, 9);
      }
    });

    test("et beløb på 0 giver 0 i alle tre felter, ikke NaN", () => {
      for (const type of ["tillaegMoms", "fratraekMoms", "findMoms"] as MomsBeregningstype[]) {
        expect(beregnMoms(0, type, 25)).toEqual({
          prisUdenMoms: 0,
          momsBeloeb: 0,
          prisInklMoms: 0,
        });
      }
    });

    test("et beløb på 12 % giver de samme beløb som siden viser", () => {
      const r = beregnMoms(1234.56, "fratraekMoms", 12);
      expect(r.prisUdenMoms).toBeCloseTo(1102.2857, 4);
      expect(r.momsBeloeb).toBeCloseTo(132.2743, 4);
      expect(r.prisInklMoms).toBe(1234.56);
    });
  });

  describe("referenceRaekker", () => {
    test("dækker præcis de fem beløb, siden lovede", () => {
      expect(MOMS_REFERENCE_BELOEB).toEqual([100, 500, 1000, 5000, 10000]);
      expect(referenceRaekker(25).map((r) => r.prisUdenMoms)).toEqual([
        100, 500, 1000, 5000, 10000,
      ]);
    });

    test("hver række er beregnet af beregnMoms, så tabellen ikke kan lyve", () => {
      for (const sats of MOMS_SATSER.se) {
        expect(referenceRaekker(sats)).toEqual(
          MOMS_REFERENCE_BELOEB.map((beloeb) => beregnMoms(beloeb, "tillaegMoms", sats))
        );
      }
    });

    test("summen af de tre tal er altid det beløb, tabellen loever", () => {
      for (const r of referenceRaekker(6)) {
        expect(r.prisUdenMoms + r.momsBeloeb).toBeCloseTo(r.prisInklMoms, 9);
      }
    });
  });

  describe("fratraekRaekker", () => {
    test("er referenceRaekker modsat vej — samme beløb, taget fra", () => {
      // 1.250 kr. i kassen er 1.000 kr. ekskl. moms: det er den rigtige
      // retning, fordi det er prisen med moms, folk har.
      expect(fratraekRaekker(25).map((r) => r.prisInklMoms)).toEqual([...MOMS_REFERENCE_BELOEB]);
      expect(fratraekRaekker(25).map((r) => r.prisUdenMoms)).toEqual([100, 500, 1000, 5000, 10000].map((b) => b / 1.25));
    });

    test("hver række er beregnet af beregnMoms, så tabellen ikke kan lyve", () => {
      for (const sats of MOMS_SATSER.se) {
        expect(fratraekRaekker(sats)).toEqual(
          MOMS_REFERENCE_BELOEB.map((beloeb) => beregnMoms(beloeb, "fratraekMoms", sats))
        );
      }
    });

    test("momsandelen er 20 % ved 25 % — aldrig 25 %", () => {
      // Den fejl, afsnittet handler om. 499 / 1,25 = 399,20, altså 99,80 i
      // moms: 99,80 / 499 = 20,0 %, ikke 25 %.
      const r = beregnMoms(499, "fratraekMoms", 25);
      expect(r.momsBeloeb / r.prisInklMoms).toBeCloseTo(0.2, 9);
      expect(r.momsBeloeb).toBeCloseTo(99.8, 9);
      expect(r.prisUdenMoms).toBeCloseTo(399.2, 9);
    });
  });

  describe("opsummering", () => {
    const dansk = { pris: (t: number) => `${t.toFixed(2)} kr`, procent: (t: number) => t.toFixed(2) };
    const svensk = { pris: (t: number) => `${t.toFixed(2)} kr`, procent: (t: number) => t.toFixed(2) };

    test("tillæg i dansk nævner alle tre tal, også momsen", () => {
      const r = beregnMoms(1000, "tillaegMoms", 25);
      const s = opsummering("tillaegMoms", r, 25, dansk, "da");
      expect(s).toBe("1000.00 kr uden moms + 250.00 kr moms (25.00 %) = 1250.00 kr inkl. moms");
    });

    test("fratræk i dansk læser fra prisen inkl. moms ned til prisen uden", () => {
      const r = beregnMoms(1250, "fratraekMoms", 25);
      const s = opsummering("fratraekMoms", r, 25, dansk, "da");
      expect(s).toBe("1250.00 kr inkl. moms − 250.00 kr moms = 1000.00 kr uden moms");
    });

    test("find i dansk svarer på hvor meget af beløbet der er moms", () => {
      const r = beregnMoms(1250, "findMoms", 25);
      const s = opsummering("findMoms", r, 25, dansk, "da");
      expect(s).toBe("Moms i 1250.00 kr er 250.00 kr (20.00 % af beløbet)");
    });

    test("svensk opsummering bruger svenske ord, ikke de danske", () => {
      const r = beregnMoms(1000, "tillaegMoms", 12);
      expect(opsummering("tillaegMoms", r, 12, svensk, "se")).toBe(
        "1000.00 kr utan moms + 120.00 kr moms (12.00 %) = 1120.00 kr inkl. moms"
      );
      const r2 = beregnMoms(1000, "fratraekMoms", 6);
      expect(opsummering("fratraekMoms", r2, 6, svensk, "se")).toBe(
        "1000.00 kr inkl. moms − 56.60 kr moms = 943.40 kr utan moms"
      );
    });

    test("momsen står som et tal i hver opsummering, aldrig som en etiket alene", () => {
      // Det var den gamle fejl: separatoren læst "1.000 kr. + moms = 1.250 kr."
      for (const locale of ["da", "se"] as const) {
        for (const type of ["tillaegMoms", "fratraekMoms", "findMoms"] as MomsBeregningstype[]) {
          const r = beregnMoms(1234.56, type, 25);
          const s = opsummering(type, r, 25, dansk, locale);
          expect(s).not.toMatch(/\+ moms\s*=/);
          expect(s).toContain(`${r.momsBeloeb.toFixed(2)} kr`);
        }
      }
    });
  });

  test("de svenske satsknapper dækker præcis de tre satser", () => {
    expect(MOMS_SATS_VALG_SE.map((v) => v.sats)).toEqual([...MOMS_SATSER.se]);
    expect(MOMS_SATS_VALG_SE.map((v) => v.navn)).toEqual(["Standard", "Mat, hotell", "Böcker, kultur"]);
  });
});
