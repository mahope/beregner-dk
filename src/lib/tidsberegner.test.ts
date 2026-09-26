import { describe, expect, test } from "vitest";
import { beregnTidsinterval, type TidsintervalInput } from "./tidsberegner";

const baseInput: TidsintervalInput = {
  startTid: "08:30",
  slutTid: "16:45",
  startDato: "",
  slutDato: "",
  fratraekPause: 0,
};

describe("beregnTidsinterval", () => {
  test("heleDoegn er døgn, ikke kalenderdage", () => {
    // 8 t 15 min = 495 min = 0,34 døgn. Før blev deret regnet i komponenten og
    // kaldt "dage", hvilket læses som 0,33 dage.
    const resultat = beregnTidsinterval(baseInput)!;
    expect(resultat.heleDoegn).toBe("0.34");

    const heleDag = beregnTidsinterval({
      ...baseInput,
      startTid: "16:00",
      slutTid: "09:00",
      startDato: "2026-09-25",
      slutDato: "2026-09-28",
    })!;
    expect(heleDag.totalMinutter).toBe(3900);
    expect(heleDag.heleDoegn).toBe("2.71");
  });

  test("beregner et interval på samme dag", () => {
    const result = beregnTidsinterval(baseInput)!;

    expect(result.timer).toBe(8);
    expect(result.minutter).toBe(15);
    expect(result.totalMinutter).toBe(495);
    expect(result.totalTimer).toBe("8.25");
    expect(result.overMidnat).toBe(false);
  });

  test("fortsætter automatisk over midnat uden datoer", () => {
    const result = beregnTidsinterval({
      ...baseInput,
      startTid: "22:00",
      slutTid: "06:00",
    })!;

    expect(result.totalMinutter).toBe(480);
    expect(result.totalTimer).toBe("8.00");
    expect(result.overMidnat).toBe(true);
  });

  test("tæller næste dato én gang", () => {
    const result = beregnTidsinterval({
      ...baseInput,
      startTid: "22:00",
      slutTid: "06:00",
      startDato: "2026-09-25",
      slutDato: "2026-09-26",
    })!;

    expect(result.totalMinutter).toBe(480);
    expect(result.totalTimer).toBe("8.00");
    expect(result.overMidnat).toBe(true);
  });

  test("beregner fulde dage på tværs af datoer", () => {
    const result = beregnTidsinterval({
      ...baseInput,
      startDato: "2026-09-25",
      slutDato: "2026-09-26",
    })!;

    expect(result.totalMinutter).toBe(1935);
    expect(result.totalTimer).toBe("32.25");
    expect(result.overMidnat).toBe(false);
  });

  test("beregner intervaller på samme dato uafhængigt af datoerne", () => {
    const result = beregnTidsinterval({
      ...baseInput,
      startDato: "2026-09-25",
      slutDato: "2026-09-25",
    })!;

    expect(result.totalMinutter).toBe(495);
    expect(result.totalTimer).toBe("8.25");
  });

  test.each([
    ["forår", "2026-03-28", "2026-03-30"],
    ["efterår", "2026-10-24", "2026-10-26"],
  ])("beregner datointervaller uafhængigt af DST om %s", (_navn, startDato, slutDato) => {
    const result = beregnTidsinterval({
      ...baseInput,
      startDato,
      slutDato,
    })!;

    expect(result.totalMinutter).toBe(3375);
    expect(result.totalTimer).toBe("56.25");
  });

  test.each([
    ["uden datoer", "", ""],
    ["samme dato", "2026-09-25", "2026-09-25"],
    ["næste dato", "2026-09-25", "2026-09-26"],
  ])("trækker 30 minutters pause fra et interval %s", (_navn, startDato, slutDato) => {
    const normalDag = beregnTidsinterval({
      ...baseInput,
      startDato,
      slutDato,
      fratraekPause: 30,
    })!;
    const nattevagt = beregnTidsinterval({
      ...baseInput,
      startTid: "22:00",
      slutTid: "06:00",
      startDato,
      slutDato,
      fratraekPause: 30,
    })!;

    expect(normalDag.totalMinutter).toBe(startDato === slutDato ? 465 : 1905);
    expect(nattevagt.totalMinutter).toBe(450);
  });

  test("bevarer den eksisterende nattevagtfortolkning på samme dato", () => {
    const result = beregnTidsinterval({
      ...baseInput,
      startTid: "22:00",
      slutTid: "06:00",
      startDato: "2026-09-25",
      slutDato: "2026-09-25",
    })!;

    expect(result.totalMinutter).toBe(480);
  });

  test("returnerer null for et interval med sluttid før startdatoen", () => {
    expect(
      beregnTidsinterval({
        ...baseInput,
        startDato: "2026-09-26",
        slutDato: "2026-09-25",
      }),
    ).toBeNull();
  });

  test("returnerer null for ugyldige klokkeslæt og datoer", () => {
    expect(beregnTidsinterval({ ...baseInput, startTid: "24:00" })).toBeNull();
    expect(beregnTidsinterval({ ...baseInput, slutTid: "10:60" })).toBeNull();
    expect(
      beregnTidsinterval({
        ...baseInput,
        startDato: "2026-02-31",
        slutDato: "2026-03-01",
      }),
    ).toBeNull();
    expect(beregnTidsinterval({ ...baseInput, startDato: "2026-02-31" })).toBeNull();
    expect(beregnTidsinterval({ ...baseInput, slutDato: "2026-02-31" })).toBeNull();
  });

  test("returnerer null for en ikke-finitt pauseværdi", () => {
    expect(beregnTidsinterval({ ...baseInput, fratraekPause: Number.NaN })).toBeNull();
    expect(beregnTidsinterval({ ...baseInput, fratraekPause: Infinity })).toBeNull();
  });

  test("bevarer pauseværdier uden for den normale UI-begrænsning", () => {
    expect(beregnTidsinterval({ ...baseInput, fratraekPause: -30 })?.totalMinutter).toBe(525);
    expect(beregnTidsinterval({ ...baseInput, fratraekPause: 30.5 })?.totalMinutter).toBe(464.5);
    expect(beregnTidsinterval({ ...baseInput, fratraekPause: 600 })?.totalMinutter).toBe(0);
  });

  test("genkender lavårs-datoer", () => {
    const result = beregnTidsinterval({
      ...baseInput,
      startDato: "0096-02-29",
      slutDato: "0096-03-01",
    })!;

    expect(result.totalMinutter).toBe(1935);
  });

  test("beholder over-midnat-markering for et ur-baseret interval", () => {
    const result = beregnTidsinterval({
      ...baseInput,
      startTid: "22:00",
      slutTid: "06:00",
    })!;

    expect(result.overMidnat).toBe(true);
  });
});
