import { describe, expect, test } from "vitest";
import {
  GAELDSFAKTOR_STANDARD,
  REALKREDIT_MAKS_PCT,
  UDBETALING_MIN_PCT,
  beregnLaanekapacitet,
  laanekapacitetEksempelRækker,
} from "./laanekapacitet";

const naesten = (a: number, b: number, tolerance = 1) =>
  expect(Math.abs(a - b)).toBeLessThanOrEqual(tolerance);

describe("beregnLaanekapacitet", () => {
  test("gældsfaktoren binder på standardeksemplet", () => {
    const r = beregnLaanekapacitet({
      husstandsindkomst: 500000,
      udbetaling: 300000,
      gaeldsfaktor: GAELDSFAKTOR_STANDARD,
    });
    naesten(r.laaneramme, 2000000);
    naesten(r.maksBoligpris, 2000000 / 0.95);
    expect(r.bindendeGraense).toBe("gaeldsfaktor");
  });

  test("udbetalingen binder, når den er for lille", () => {
    const r = beregnLaanekapacitet({
      husstandsindkomst: 1000000,
      udbetaling: 100000,
      gaeldsfaktor: 4,
    });
    naesten(r.maksPrisEfterUdbetaling, 2000000);
    naesten(r.maksBoligpris, 2000000);
    expect(r.bindendeGraense).toBe("udbetaling");
    naesten(r.laanVedMaks, 1900000);
  });

  test("krævet udbetaling er præcis 5 % af den pris, der binder", () => {
    const r = beregnLaanekapacitet({
      husstandsindkomst: 500000,
      udbetaling: 300000,
    });
    naesten(r.kraevUdbetaling, r.maksBoligpris * (UDBETALING_MIN_PCT / 100));
  });

  test("lånet er 95 %, og fordelingen er 80 % realkredit + 15 % banklån", () => {
    const r = beregnLaanekapacitet({
      husstandsindkomst: 500000,
      udbetaling: 300000,
    });
    naesten(r.laanVedMaks, r.maksBoligpris * 0.95);
    naesten(r.realkreditDel, r.maksBoligpris * (REALKREDIT_MAKS_PCT / 100));
    naesten(r.banklaanDel, r.maksBoligpris * 0.15);
    naesten(r.realkreditDel + r.banklaanDel, r.laanVedMaks);
  });

  test("eksisterende gæld trækkes krone for krone fra lånerammen", () => {
    const uden = beregnLaanekapacitet({
      husstandsindkomst: 500000,
      udbetaling: 300000,
    });
    const med = beregnLaanekapacitet({
      husstandsindkomst: 500000,
      udbetaling: 300000,
      eksisterendeGaeld: 200000,
    });
    naesten(uden.laaneramme - med.laaneramme, 200000);
    naesten(med.maksSamletGaeld, 2000000);
  });

  test("højere gældsfaktor giver større låneramme", () => {
    const fire = beregnLaanekapacitet({
      husstandsindkomst: 600000,
      udbetaling: 500000,
      gaeldsfaktor: 4,
    });
    const fem = beregnLaanekapacitet({
      husstandsindkomst: 600000,
      udbetaling: 500000,
      gaeldsfaktor: 5,
    });
    expect(fem.laaneramme).toBeGreaterThan(fire.laaneramme);
    naesten(fem.laaneramme, 3000000);
    naesten(fire.laaneramme, 2400000);
  });

  test("uden indkomst er der ingen lånekapacitet", () => {
    const r = beregnLaanekapacitet({ husstandsindkomst: 0, udbetaling: 500000 });
    expect(r.maksBoligpris).toBe(0);
    expect(r.laaneramme).toBe(0);
  });

  test("negative og ugyldige tal behandles som nul", () => {
    const r = beregnLaanekapacitet({
      husstandsindkomst: -100,
      udbetaling: Number.NaN,
      eksisterendeGaeld: -5,
    });
    expect(r.maksBoligpris).toBe(0);
    expect(r.eksisterendeGaeld).toBe(0);
    expect(r.gaeldsfaktor).toBe(GAELDSFAKTOR_STANDARD);
  });

  test("gældsfaktoren ved maks stemmer med lån plus gæld delt med indkomst", () => {
    const r = beregnLaanekapacitet({
      husstandsindkomst: 500000,
      udbetaling: 1000000,
      gaeldsfaktor: 4,
    });
    naesten(r.gaeldsfaktorVedMaks, (r.laanVedMaks + r.eksisterendeGaeld) / 500000);
  });

  test("eksempeltabellen regnes af samme funktion som værktøjet", () => {
    const rækker = laanekapacitetEksempelRækker();
    expect(rækker).toHaveLength(5);
    for (const r of rækker) {
      expect(r.maksBoligpris).toBeGreaterThan(0);
      expect(r.bindendeGraense).toBe("gaeldsfaktor");
    }
    expect(rækker.map((r) => r.husstandsindkomst)).toEqual([
      400000, 500000, 600000, 750000, 900000,
    ]);
  });
});
