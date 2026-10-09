import { describe, it, expect } from "vitest";
import { beregnMaxPuls, beregnMaxPulsSimpel, beregnHrr, beregnHjerterytme } from "./hjerterytme";

describe("beregnMaxPuls", () => {
  it("beregner max puls med Tanaka-formlen", () => {
    expect(beregnMaxPuls(30)).toBe(187);
    expect(beregnMaxPuls(40)).toBe(180);
    expect(beregnMaxPuls(50)).toBe(173);
    expect(beregnMaxPuls(60)).toBe(166);
  });

  it("returnerer hele tal", () => {
    expect(Number.isInteger(beregnMaxPuls(35))).toBe(true);
  });
});

describe("beregnMaxPulsSimpel", () => {
  it("beregner max puls med 220 - alder", () => {
    expect(beregnMaxPulsSimpel(30)).toBe(190);
    expect(beregnMaxPulsSimpel(40)).toBe(180);
    expect(beregnMaxPulsSimpel(50)).toBe(170);
  });
});

describe("beregnHrr", () => {
  it("beregner Karvonen-formlen", () => {
    expect(beregnHrr(180, 60, 0.5)).toBe(120);
    expect(beregnHrr(180, 60, 0.7)).toBe(144);
    expect(beregnHrr(180, 60, 0.9)).toBe(168);
  });

  it("giver hvilepuls ved 0 %", () => {
    expect(beregnHrr(180, 60, 0)).toBe(60);
  });

  it("giver max puls ved 100 %", () => {
    expect(beregnHrr(180, 60, 1)).toBe(180);
  });
});

describe("beregnHjerterytme", () => {
  it("beregner zoner ud fra alder", () => {
    const r = beregnHjerterytme(40);
    expect(r.maxPuls).toBe(180);
    expect(r.maxPulsSimpel).toBe(180);
    expect(r.zones).toHaveLength(5);
    expect(r.zones[0].pulsMin).toBe(90);
    expect(r.zones[0].pulsMax).toBe(108);
    expect(r.zones[4].pulsMin).toBe(162);
    expect(r.zones[4].pulsMax).toBe(180);
  });

  it("inkluderer HRR når hvilepuls er givet", () => {
    const r = beregnHjerterytme(40, 60);
    expect(r.zones[0].hrrMin).toBe(120);
    expect(r.zones[0].hrrMax).toBe(132);
    expect(r.zones[4].hrrMin).toBe(168);
    expect(r.zones[4].hrrMax).toBe(180);
  });

  it("udelader HRR når hvilepuls ikke er givet", () => {
    const r = beregnHjerterytme(40);
    expect(r.zones[0].hrrMin).toBeUndefined();
    expect(r.zones[0].hrrMax).toBeUndefined();
  });

  it("zonerne dækker 50-100 % af max puls", () => {
    const r = beregnHjerterytme(50);
    expect(r.zones[0].pctMin).toBe(0.5);
    expect(r.zones[4].pctMax).toBe(1.0);
    for (let i = 1; i < r.zones.length; i++) {
      expect(r.zones[i].pctMin).toBe(r.zones[i - 1].pctMax);
    }
  });
});
