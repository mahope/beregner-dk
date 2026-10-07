import { describe, test, expect } from "vitest";
import {
  BYGGEPRIS_EKSEMPEL,
  BYGGEPRIS_NIVEAUER,
  BYGGEPRIS_STANDARD_AREAL,
  BYGGEPRIS_STANDARD_NIVEAU,
  beregnByggepris,
} from "./byggepris";

describe("beregnByggepris", () => {
  test("typehus på 150 m² giver 2,25-3,0 mio. kr.", () => {
    const r = beregnByggepris(150, "typehus");
    expect(r.kvadratmeterprisMin).toBe(15000);
    expect(r.kvadratmeterprisMax).toBe(20000);
    expect(r.byggeprisMin).toBe(2250000);
    expect(r.byggeprisMax).toBe(3000000);
  });

  test("eksemplet er et 150 m² typehus, og standardværdierne følger det", () => {
    expect(BYGGEPRIS_EKSEMPEL.arealM2).toBe(150);
    expect(BYGGEPRIS_EKSEMPEL.niveau).toBe("typehus");
    expect(BYGGEPRIS_STANDARD_AREAL).toBe(BYGGEPRIS_EKSEMPEL.arealM2);
    expect(BYGGEPRIS_STANDARD_NIVEAU).toBe(BYGGEPRIS_EKSEMPEL.niveau);
  });

  test("totalentreprise koster mere end typehus på samme areal", () => {
    const t = beregnByggepris(150, "typehus");
    const te = beregnByggepris(150, "totalentreprise");
    expect(te.byggeprisMin).toBeGreaterThan(t.byggeprisMin);
    expect(te.byggeprisMax).toBeGreaterThan(t.byggeprisMax);
  });

  test("arkitekttegnet koster mere end totalentreprise på samme areal", () => {
    const te = beregnByggepris(150, "totalentreprise");
    const a = beregnByggepris(150, "arkitekttegnet");
    expect(a.byggeprisMin).toBeGreaterThan(te.byggeprisMin);
    expect(a.byggeprisMax).toBeGreaterThan(te.byggeprisMax);
  });

  test("prisen skalerer lineært med arealet", () => {
    const lille = beregnByggepris(100, "typehus");
    const stor = beregnByggepris(200, "typehus");
    expect(stor.byggeprisMin).toBe(lille.byggeprisMin * 2);
    expect(stor.byggeprisMax).toBe(lille.byggeprisMax * 2);
  });

  test("nul og negative arealer giver 0 kr.", () => {
    expect(beregnByggepris(0, "typehus").byggeprisMin).toBe(0);
    expect(beregnByggepris(-50, "typehus").byggeprisMax).toBe(0);
  });

  test("ikke-endelige arealer giver 0 kr.", () => {
    expect(beregnByggepris(NaN, "typehus").byggeprisMin).toBe(0);
    expect(beregnByggepris(Infinity, "typehus").byggeprisMax).toBe(0);
  });

  test("intervallet er lavt for typehus og højt for arkitekttegnet", () => {
    expect(BYGGEPRIS_NIVEAUER.typehus.min).toBeLessThan(BYGGEPRIS_NIVEAUER.typehus.max);
    expect(BYGGEPRIS_NIVEAUER.totalentreprise.min).toBeGreaterThan(BYGGEPRIS_NIVEAUER.typehus.min);
    expect(BYGGEPRIS_NIVEAUER.arkitekttegnet.min).toBeGreaterThan(BYGGEPRIS_NIVEAUER.totalentreprise.min);
  });
});
