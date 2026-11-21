import { describe, expect, it } from "vitest";
import {
  TIDSENHED_EKSEMPLER,
  minutterTilTimer,
  timerTilMinutter,
} from "./tidsenhed";

describe("minutterTilTimer", () => {
  it("deler minutter i timer og minutter med div/mod 60", () => {
    const r = minutterTilTimer(145)!;
    expect(r.timer).toBe(2);
    expect(r.minutter).toBe(25);
    expect(r.totalMinutter).toBe(145);
  });

  it("gør 25 minutter til 0 timer og 25 minutter, så feltet ikke siger 0,42 time", () => {
    const r = minutterTilTimer(25)!;
    expect(r.timer).toBe(0);
    expect(r.minutter).toBe(25);
    expect(r.sekunder).toBe(1500);
  });

  it("regner 90 minutter som 1,5 decimaltimer begge veje", () => {
    expect(minutterTilTimer(90)!.decimalTimer).toBe(1.5);
    expect(timerTilMinutter(1.5)!.totalMinutter).toBe(90);
  });

  it("lægger et helt døgn til uden at miste minutterne", () => {
    const r = minutterTilTimer(1500)!;
    expect(r.heleDoegn).toBe(1.0416666666666667);
    expect(r.timer).toBe(25);
    expect(r.minutter).toBe(0);
    expect(r.timer * 60 + r.minutter).toBe(1500);
  });

  it("giver minustek sit fortegn på timen, ikke på resten", () => {
    const r = minutterTilTimer(-90)!;
    expect(r.timer).toBe(-1);
    expect(r.minutter).toBe(-30);
    expect(r.timer * 60 + r.minutter).toBe(-90);
  });

  it("giver 0 i stedet for -0, så tallet ikke vises som «-0 minutter»", () => {
    const r = minutterTilTimer(-45)!;
    expect(r.timer).toBe(0);
    expect(Object.is(r.timer, -0)).toBe(false);
    expect(r.minutter).toBe(-45);
  });

  it("lader decimaler i minutter stå som sig, så 7,5 minutter er 450 sekunder", () => {
    const r = minutterTilTimer(7.5)!;
    expect(r.sekunder).toBe(450);
    expect(r.decimalTimer).toBe(0.125);
  });

  it("svarer null på tomt og ugyldigt, så UI'et kan vise en fejltilstand", () => {
    expect(minutterTilTimer(Number.NaN)).toBeNull();
    expect(minutterTilTimer(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("timerTilMinutter", () => {
  it("ganger timer med 60", () => {
    const r = timerTilMinutter(7.5)!;
    expect(r.totalMinutter).toBe(450);
    expect(r.timer).toBe(7);
    expect(r.minutter).toBe(30);
  });

  it("lægger de medtagne minutter til timen", () => {
    expect(timerTilMinutter(1, 30)!.totalMinutter).toBe(90);
    expect(timerTilMinutter(2, 45)!.totalMinutter).toBe(165);
  });

  it("regner minus en time som minus 60 minutter", () => {
    expect(timerTilMinutter(-1)!.totalMinutter).toBe(-60);
  });

  it("svarer null på et ugyldigt timetal", () => {
    expect(timerTilMinutter(Number.NaN)).toBeNull();
    expect(timerTilMinutter(2, Number.NaN)).toBeNull();
  });
});

describe("TIDSENHED_EKSEMPLER", () => {
  it("indeholder de tre konkrete «omregn N minutter» fra autocomplete", () => {
    for (const minutter of [25, 145, 180]) {
      expect(TIDSENHED_EKSEMPLER.some((e) => e.minutter === minutter)).toBe(true);
    }
  });

  it("har ingen eksempel med både timer og minutter sat", () => {
    for (const eksempel of TIDSENHED_EKSEMPLER) {
      const harTimer = eksempel.timer !== undefined;
      expect(harTimer && eksempel.minutter > 0).toBe(false);
    }
  });

  it("runder hvert eksempel af enten den ene eller den anden vej", () => {
    for (const eksempel of TIDSENHED_EKSEMPLER) {
      const r =
        eksempel.timer !== undefined
          ? timerTilMinutter(eksempel.timer)
          : minutterTilTimer(eksempel.minutter);
      expect(r).not.toBeNull();
    }
  });
});