import { describe, test, expect } from "vitest";
import {
  MALING_DAEKNING_M2_PR_LITER,
  MALING_EKSEMPEL,
  MALING_STANDARD_SPILD_PCT,
  MALING_STANDARD_STROEG,
  beregnMalingAreal,
  beregnMalingLiter,
  malingEksempelAreal,
  malingEksempelLiter,
} from "./maling";
import { materialeVedId } from "./kvadratmeter-materialer";

describe("beregnMalingAreal", () => {
  test("vægarealet er omkredsen gange højden", () => {
    // 2 × (5 + 4) × 2,5 = 45 m²
    const r = beregnMalingAreal({ laengdeM: 5, breddeM: 4, hoejdeM: 2.5 });
    expect(r.vaegarealM2).toBe(45);
    expect(r.loftarealM2).toBe(0);
    expect(r.prRumM2).toBe(45);
    expect(r.samletM2).toBe(45);
  });

  test("loftet lægges oveni når det er medregnet", () => {
    const r = beregnMalingAreal({ laengdeM: 5, breddeM: 4, hoejdeM: 2.5, medLoft: true });
    expect(r.loftarealM2).toBe(20);
    expect(r.samletM2).toBe(65);
  });

  test("døre og vinduer trækkes fra", () => {
    const r = beregnMalingAreal({ laengdeM: 5, breddeM: 4, hoejdeM: 2.5, fravalgM2: 5 });
    expect(r.samletM2).toBe(40);
  });

  test("fradraget kan ikke gøre arealet negativt", () => {
    const r = beregnMalingAreal({ laengdeM: 1, breddeM: 1, hoejdeM: 1, fravalgM2: 100 });
    expect(r.samletM2).toBe(0);
  });

  test("antal rum ganger arealet", () => {
    const r = beregnMalingAreal({ laengdeM: 5, breddeM: 4, hoejdeM: 2.5, antalRum: 3 });
    expect(r.samletM2).toBe(135);
  });

  test("manglende eller negative mål giver nul", () => {
    expect(beregnMalingAreal({ laengdeM: 0, breddeM: 4, hoejdeM: 2.5 }).samletM2).toBe(0);
    expect(beregnMalingAreal({ laengdeM: -5, breddeM: 4, hoejdeM: 2.5 }).samletM2).toBe(0);
  });

  test("antal rum under 1 behandles som ét rum", () => {
    expect(beregnMalingAreal({ laengdeM: 5, breddeM: 4, hoejdeM: 2.5, antalRum: 0 }).antalRum).toBe(1);
  });
});

describe("beregnMalingLiter", () => {
  test("liter er areal gange strøg divideret med dækkevnen", () => {
    // 45 × 2 ÷ 10 = 9 liter
    const r = beregnMalingLiter(45, 2, 10);
    expect(r.literEksakt).toBe(9);
  });

  test("spild lægges oveni og der købes hele liter", () => {
    const r = beregnMalingLiter(45, 2, 10);
    expect(r.literMedSpild).toBeCloseTo(9.9, 10);
    expect(r.literKoeb).toBe(10);
  });

  test("ét strøg halverer forbruget", () => {
    expect(beregnMalingLiter(45, 1, 10).literEksakt).toBeCloseTo(4.5, 10);
  });

  test("en anden dækkevne ændrer forbruget", () => {
    // 45 × 2 ÷ 15 = 6 liter
    expect(beregnMalingLiter(45, 2, 15).literEksakt).toBe(6);
  });

  test("nul dækkevne giver ingen liter i stedet for uendeligt", () => {
    const r = beregnMalingLiter(45, 2, 0);
    expect(r.literEksakt).toBe(0);
    expect(r.literKoeb).toBe(0);
  });

  test("et strøg under 1 behandles som ét", () => {
    expect(beregnMalingLiter(45, 0, 10).straag).toBe(1);
  });

  test("nul areal giver nul liter", () => {
    expect(beregnMalingLiter(0, 2, 10).literKoeb).toBe(0);
  });
});

describe("standardværdierne har én kilde", () => {
  test("dækkevne og spild kommer fra materialemodulet", () => {
    const maling = materialeVedId("maling");
    expect(MALING_DAEKNING_M2_PR_LITER).toBe(maling.daekningPrEnhedM2);
    expect(MALING_STANDARD_SPILD_PCT).toBe(maling.spildPct);
  });
});

describe("eksempelrummet", () => {
  test("arealet er 45 m² og der skal købes 10 liter", () => {
    expect(malingEksempelAreal().samletM2).toBe(45);
    const liter = malingEksempelLiter();
    expect(liter.straag).toBe(MALING_STANDARD_STROEG);
    expect(liter.literEksakt).toBe(9);
    expect(liter.literKoeb).toBe(10);
  });

  test("eksempelrummets mål er dem brødteksten nævner", () => {
    expect(MALING_EKSEMPEL.laengdeM).toBe(5);
    expect(MALING_EKSEMPEL.breddeM).toBe(4);
    expect(MALING_EKSEMPEL.hoejdeM).toBe(2.5);
  });
});
