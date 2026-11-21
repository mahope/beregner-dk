import { describe, it, expect } from "vitest";
import { beregnSkat, findBruttoFraNetto } from "./skattefordeling";
import { SATSER_2026 } from "./satser-2026";

const KOM = SATSER_2026.kommuneskatSnit;
const KIR = SATSER_2026.kirkeskatSnit;

describe("beregnSkat", () => {
  it("returnerer null for ikke-positive og ikke-finite værdier", () => {
    expect(beregnSkat(0, KOM, KIR)).toBeNull();
    expect(beregnSkat(-1000, KOM, KIR)).toBeNull();
    expect(beregnSkat(NaN, KOM, KIR)).toBeNull();
    expect(beregnSkat(Infinity, KOM, KIR)).toBeNull();
  });

  it("regner en almindelig løn korrekt (600.000 kr., snit-satser)", () => {
    const s = beregnSkat(600_000, KOM, KIR)!;
    expect(s).not.toBeNull();
    expect(s.amBidrag).toBeCloseTo(48_000, 6);
    expect(s.indkomstEfterAm).toBeCloseTo(552_000, 6);
    // Beskæftigelsesfradraget rammer loftet: 552.000 × 12,75 % = 70.380 > 63.300
    expect(s.beskFradrag).toBeCloseTo(SATSER_2026.beskaeftigelsesfradragMax, 6);
    expect(s.skattepligtig).toBeCloseTo(552_000 - 54_100 - 63_300, 6);
    expect(s.bundSkat).toBeCloseTo(s.skattepligtig * 0.1201, 6);
    expect(s.kommuneSkat).toBeCloseTo(s.skattepligtig * KOM, 6);
    expect(s.kirkeSkat).toBeCloseTo(s.skattepligtig * KIR, 6);
    expect(s.mellemSkat).toBe(0);
    expect(s.topSkat).toBe(0);
    expect(s.topTopSkat).toBe(0);
    expect(s.betalerMellemskat).toBe(false);
    expect(s.betalerTopskat).toBe(false);
    const forventet =
      s.amBidrag + s.bundSkat + s.kommuneSkat + s.kirkeSkat;
    expect(s.samletSkat).toBeCloseTo(forventet, 6);
    expect(s.nettoAar).toBeCloseTo(600_000 - forventet, 6);
    expect(s.effektivSkat).toBeCloseTo((forventet / 600_000) * 100, 6);
  });

  it("regner mellemskat korrekt over grænsen (800.000 kr.)", () => {
    const s = beregnSkat(800_000, KOM, KIR)!;
    expect(s.indkomstEfterAm).toBeCloseTo(736_000, 6);
    expect(s.mellemSkat).toBeCloseTo((736_000 - 641_200) * 0.075, 6);
    expect(s.topSkat).toBe(0);
    expect(s.betalerMellemskat).toBe(true);
    expect(s.betalerTopskat).toBe(false);
  });

  it("regner topskat korrekt over grænsen (900.000 kr.)", () => {
    const s = beregnSkat(900_000, KOM, KIR)!;
    expect(s.indkomstEfterAm).toBeCloseTo(828_000, 6);
    expect(s.mellemSkat).toBeCloseTo((828_000 - 641_200) * 0.075, 6);
    expect(s.topSkat).toBeCloseTo((828_000 - 777_900) * 0.075, 6);
    expect(s.topTopSkat).toBe(0);
    expect(s.betalerMellemskat).toBe(true);
    expect(s.betalerTopskat).toBe(true);
  });

  it("regner top-topskat korrekt over grænsen (3.000.000 kr.)", () => {
    const s = beregnSkat(3_000_000, KOM, KIR)!;
    expect(s.indkomstEfterAm).toBeCloseTo(2_760_000, 6);
    expect(s.topTopSkat).toBeCloseTo((2_760_000 - 2_592_700) * 0.05, 6);
    expect(s.betalerTopskat).toBe(true);
  });

  it("trækker personfradrag for en lav løn (100.000 kr.)", () => {
    const s = beregnSkat(100_000, KOM, KIR)!;
    expect(s.indkomstEfterAm).toBeCloseTo(92_000, 6);
    // 92.000 × 12,75 % = 11.730 < 63.300, så fradraget er ikke loftet
    expect(s.beskFradrag).toBeCloseTo(92_000 * 0.1275, 6);
    expect(s.skattepligtig).toBeCloseTo(92_000 - 54_100 - 11_730, 6);
    expect(s.skattepligtig).toBeGreaterThan(0);
  });

  it("giver skattepligtig 0 for en meget lav løn", () => {
    const s = beregnSkat(50_000, KOM, KIR)!;
    expect(s.skattepligtig).toBe(0);
    expect(s.bundSkat).toBe(0);
    expect(s.kommuneSkat).toBe(0);
    expect(s.kirkeSkat).toBe(0);
    // Kun AM-bidraget betales
    expect(s.samletSkat).toBeCloseTo(50_000 * 0.08, 6);
  });

  it("kommuneskat og kirkeskat afhænger af de givne satser", () => {
    const med = beregnSkat(600_000, 0.27, 0.01)!;
    const uden = beregnSkat(600_000, 0.27, 0)!;
    expect(med.kirkeSkat).toBeGreaterThan(0);
    expect(uden.kirkeSkat).toBe(0);
    expect(med.samletSkat).toBeGreaterThan(uden.samletSkat);
  });
});

describe("findBruttoFraNetto", () => {
  it("finder en bruttoløn der giver den ønskede nettoløn", () => {
    const oensketNetto = 300_000;
    const brutto = findBruttoFraNetto(oensketNetto, KOM, KIR);
    const s = beregnSkat(brutto, KOM, KIR)!;
    expect(Math.abs(s.nettoAar - oensketNetto)).toBeLessThan(1);
  });

  it("finder en bruttoløn også over topskatgrænsen", () => {
    const oensketNetto = 500_000;
    const brutto = findBruttoFraNetto(oensketNetto, KOM, KIR);
    const s = beregnSkat(brutto, KOM, KIR)!;
    expect(Math.abs(s.nettoAar - oensketNetto)).toBeLessThan(1);
    expect(s.betalerMellemskat).toBe(true);
  });
});
