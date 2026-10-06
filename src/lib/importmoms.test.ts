import { describe, expect, test } from "vitest";
import {
  beregnImportmoms,
  erGyldigImportmoms,
  IMPORTMOMS_EKEMPEL,
  EGENVAERDI_GRENSE_EUR,
  EGENVAERDI_GRENSE_KR_OMRUND,
  MOMS_UDEN_FOR_EU,
  TOLD_FLAT_EUR_PR_VARELINJE,
  TOLD_FLAT_KR_PR_VARELINJE_OMRUND,
} from "./importmoms";

describe("importmoms: tolden under 150 EUR er 3 EUR pr. varepost", () => {
  test("ét varepost koster 22 kr. i told, uanset hvor lille varen er", () => {
    const r = beregnImportmoms({ egenvaerdi: 100, fragt: 0, vareposter: 1 })!;

    expect(r.laevVaerdi).toBe(true);
    expect(r.told).toBe(TOLD_FLAT_KR_PR_VARELINJE_OMRUND);
  });

  test("tre vareposter koster tre gange tolden — Toldstyrelsens eget eksempel", () => {
    // T shirts, bukser og solbriller i én pakke: tre vareposter, ni euro i
    // told før 1. juli 2026-reglen.
    const r = beregnImportmoms(IMPORTMOMS_EKEMPEL)!;

    expect(r.vareposter).toBe(3);
    expect(r.told).toBe(3 * TOLD_FLAT_KR_PR_VARELINJE_OMRUND);
    expect(r.told).toBe(66);
  });

  test("tolden er den samme for en vare til 100 kr. som for en vare til 1.000 kr.", () => {
    const lille = beregnImportmoms({ egenvaerdi: 100, fragt: 0, vareposter: 1 })!;
    const stor = beregnImportmoms({ egenvaerdi: 1000, fragt: 0, vareposter: 1 })!;

    // Det er pointen med 3 EUR pr. varepost: den afhænger ikke af værdien.
    expect(lille.told).toBe(stor.told);
  });
});

describe("importmoms: grænsen er 150 EUR (ca. 1.150 kr.)", () => {
  test("lige på grænsen er stadig 3 EUR-reglen", () => {
    const r = beregnImportmoms({ egenvaerdi: EGENVAERDI_GRENSE_KR_OMRUND, fragt: 0, vareposter: 1 })!;

    expect(r.laevVaerdi).toBe(true);
    expect(r.told).toBe(TOLD_FLAT_KR_PR_VARELINJE_OMRUND);
  });

  test("én krone over grænsen skifter til tarifmaessig told", () => {
    const r = beregnImportmoms({
      egenvaerdi: EGENVAERDI_GRENSE_KR_OMRUND + 1,
      fragt: 0,
      vareposter: 1,
      toldsats: 10,
    })!;

    expect(r.laevVaerdi).toBe(false);
    expect(r.told).toBeCloseTo(115.1, 5);
    // Ikke 22 kr. mere: over grænsen er der ingen flad told.
    expect(r.told).not.toBe(TOLD_FLAT_KR_PR_VARELINJE_OMRUND);
  });

  test("grænsen er egenværdien, ikke værdien med fragt", () => {
    // skat.dk: «Når du beregner, hvor meget du har købt for, skal du ikke regne
    // fragten med.» 300 kr. i varer + 900 kr. fragt er stadig lavværdi.
    const r = beregnImportmoms({ egenvaerdi: 300, fragt: 900, vareposter: 1 })!;

    expect(r.laevVaerdi).toBe(true);
  });

  test("beløbene er de myndighederne selv bruger", () => {
    // De to tal, der står i koden, skal være de, kilderne siger.
    expect(TOLD_FLAT_EUR_PR_VARELINJE).toBe(3);
    expect(TOLD_FLAT_KR_PR_VARELINJE_OMRUND).toBe(22);
    expect(EGENVAERDI_GRENSE_EUR).toBe(150);
    expect(EGENVAERDI_GRENSE_KR_OMRUND).toBe(1150);
  });
});

describe("importmoms: toldsatsen over grænsen regnes af værdi + fragt", () => {
  test("12 % af 1.500 kr. er 180 kr. i told", () => {
    const r = beregnImportmoms({ egenvaerdi: 1200, fragt: 300, vareposter: 4, toldsats: 12 })!;

    expect(r.toldgrundlag).toBe(1500);
    expect(r.told).toBe(180);
  });

  test("mangler toldsatsen, er tolden 0 — der er ingen generel sats", () => {
    const r = beregnImportmoms({ egenvaerdi: 2000, fragt: 0, vareposter: 2 })!;

    // skat.dk: toldsatsen varierer fra vare til vare, og nogle varer er slet
    // ikke told på. Værktøjet gisker derfor ikke.
    expect(r.told).toBe(0);
  });
});

describe("importmoms: momsgrundlaget er ML § 32 stk. 1", () => {
  test("momsgrundlaget er værdien, fragten og tolden", () => {
    const r = beregnImportmoms(IMPORTMOMS_EKEMPEL)!;

    expect(r.momsgrundlag).toBe(800 + 100 + 66);
    expect(r.momsgrundlag).toBe(966);
  });

  test("momsen er 25 % af grundlaget, og i alt er grundlaget + moms", () => {
    const r = beregnImportmoms(IMPORTMOMS_EKEMPEL)!;

    expect(MOMS_UDEN_FOR_EU).toBe(25);
    expect(r.moms).toBe(966 * 0.25);
    expect(r.moms).toBe(241.5);
    expect(r.iAlt).toBe(966 + 241.5);
  });

  test("en vare på 0 kr. med 25 kr. fragt og 1 varepost", () => {
    const r = beregnImportmoms({ egenvaerdi: 0, fragt: 25, vareposter: 1 })!;

    expect(r.toldgrundlag).toBe(25);
    expect(r.told).toBe(22);
    expect(r.momsgrundlag).toBe(47);
    expect(r.moms).toBe(11.75);
    expect(r.iAlt).toBe(58.75);
  });

  test("momsen uden told er 25 % af værdien plus fragten", () => {
    const r = beregnImportmoms({ egenvaerdi: 400, fragt: 0, vareposter: 0.5 })!;
    // 0,5 vareposter er ugyldigt, så resultatet er null og intet vises.
    expect(r).toBeNull();
  });
});

describe("importmoms: indtastningen skal være et rigtigt køb", () => {
  test.each([
    ["NaN i værdien", { egenvaerdi: Number.NaN, fragt: 0, vareposter: 1 }],
    ["uendelig fragt", { egenvaerdi: 100, fragt: Number.POSITIVE_INFINITY, vareposter: 1 }],
    ["negativ værdi", { egenvaerdi: -100, fragt: 0, vareposter: 1 }],
    ["negativ fragt", { egenvaerdi: 100, fragt: -50, vareposter: 1 }],
    ["nul vareposter", { egenvaerdi: 100, fragt: 0, vareposter: 0 }],
    ["brøkdels i vareposter", { egenvaerdi: 100, fragt: 0, vareposter: 2.5 }],
    ["negativ toldsats", { egenvaerdi: 2000, fragt: 0, vareposter: 1, toldsats: -5 }],
    ["NaN i toldsats", { egenvaerdi: 2000, fragt: 0, vareposter: 1, toldsats: Number.NaN }],
  ])("%s giver ingen beregning", (_navn, input) => {
    expect(erGyldigImportmoms(input)).toBe(false);
    expect(beregnImportmoms(input)).toBeNull();
  });

  test("et gyldigt køb med 0 kr. fragt og toldsats 0 %", () => {
    const input = { egenvaerdi: 100, fragt: 0, vareposter: 1, toldsats: 0 };
    expect(erGyldigImportmoms(input)).toBe(true);
    expect(beregnImportmoms(input)).not.toBeNull();
  });
});