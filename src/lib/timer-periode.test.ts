import { describe, expect, test } from "vitest";

import {
  DAGE_I_AAR,
  TIMER_I_DAGT,
  TIMER_I_SKUDAAR,
  TIMER_PERIODER,
  timerIPeriode,
} from "@/lib/timer-periode";

describe("timer-periode", () => {
  test("et døgn er 24 timer, en uge er 7 dage", () => {
    expect(timerIPeriode("doegn")).toMatchObject({
      dage: 1,
      timer: 24,
      minutter: 1440,
      sekunder: 86400,
    });
    expect(timerIPeriode("uge")).toMatchObject({
      dage: 7,
      timer: 168,
      minutter: 10080,
      sekunder: 604800,
    });
  });

  test("et år er 365 dage = 8.760 timer", () => {
    expect(timerIPeriode("aar")).toMatchObject({
      dage: DAGE_I_AAR,
      timer: 8760,
      minutter: 525600,
      sekunder: 31536000,
    });
  });

  test("måned og kvartal er snit af året, så de har brøkdele dage", () => {
    const maaned = timerIPeriode("maaned");
    expect(maaned.dage).toBeCloseTo(30.416667, 5);
    // 365 / 12 × 24 = 730 timer præcis, selv om dage ikke er et helt tal.
    expect(maaned.timer).toBe(730);
    expect(maaned.minutter).toBe(43800);

    const kvartal = timerIPeriode("kvartal");
    expect(kvartal.dage).toBeCloseTo(91.25, 5);
    expect(kvartal.timer).toBe(2190);
  });

  test("tre måneder er ét kvartal, fire kvartaler er ét år", () => {
    const { timer: maaned } = timerIPeriode("maaned");
    const { timer: kvartal } = timerIPeriode("kvartal");
    const { timer: aar } = timerIPeriode("aar");
    expect(maaned * 12).toBeCloseTo(aar, 6);
    expect(kvartal * 4).toBeCloseTo(aar, 6);
    expect(maaned * 3).toBeCloseTo(kvartal, 6);
  });

  test("hver periode er dage × 24 timer, og minutter/sekunder følger", () => {
    for (const p of TIMER_PERIODER) {
      expect(p.timer).toBe(p.dage * TIMER_I_DAGT);
      expect(p.minutter).toBe(p.timer * 60);
      expect(p.sekunder).toBe(p.timer * 3600);
      expect(p.naevn.da).not.toBe(p.naevn.se);
      expect(p.naevn.no).not.toBe(p.naevn.da);
    }
  });

  test("skudåret er præcis ét døgn mere end et normalt år", () => {
    expect(TIMER_I_SKUDAAR - timerIPeriode("aar").timer).toBe(TIMER_I_DAGT);
  });

  test("en ukendt periode kaster i stedet for at give tom tekst", () => {
    expect(() => timerIPeriode("uge" as "aar")).not.toThrow();
    expect(() => timerIPeriode("vinter" as "aar")).toThrow(/Ukendt periode/);
  });

  test("listen er dækkende og uden dubletter", () => {
    expect(TIMER_PERIODER.map((p) => p.id)).toEqual([
      "doegn",
      "uge",
      "maaned",
      "kvartal",
      "aar",
    ]);
  });
});