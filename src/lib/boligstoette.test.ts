import { describe, expect, test } from "vitest";
import {
  type BoligstoetteInput,
  DEFAULT_BOLIGSTOETTE_INPUT,
  beregnBoligstoette,
  normaliserBoligstoetteInputs,
} from "./boligstoette";

const baseInput: BoligstoetteInput = {
  monthlyRent: 6000,
  annualIncome: 216000,
  householdSize: 1,
  children: 0,
  wealth: 0,
  area: 65,
  pensionStatus: "ingen",
};

describe("beregnBoligstoette", () => {
  test("viser det officielle 2026-maksimum for en lejer uden pension", () => {
    expect(beregnBoligstoette(baseInput)).toMatchObject({
      maximumMonthly: 1194,
      screeningLowMonthly: 0,
      screeningHighMonthly: 1194,
      maximumShareOfRent: 20,
      wealthConsideration: "ingen",
    });
  });

  test("bruger de officielle maksima for børn og pensionstatus", () => {
    expect(
      beregnBoligstoette({ ...baseInput, householdSize: 2, children: 1 }),
    ).toMatchObject({ maximumMonthly: 4201, screeningHighMonthly: 4201 });
    expect(
      beregnBoligstoette({ ...baseInput, householdSize: 5, children: 4 }),
    ).toMatchObject({ maximumMonthly: 5251, screeningHighMonthly: 5251 });
    expect(
      beregnBoligstoette({ ...baseInput, householdSize: 7, children: 4 }),
    ).toMatchObject({ maximumMonthly: 5251, screeningHighMonthly: 5251 });
    expect(
      beregnBoligstoette({ ...baseInput, pensionStatus: "foertidspension" }),
    ).toMatchObject({ maximumMonthly: 4201, screeningHighMonthly: 4201 });
    expect(
      beregnBoligstoette({ ...baseInput, pensionStatus: "folkepension" }),
    ).toMatchObject({ maximumMonthly: 4969, screeningHighMonthly: 4969 });
    expect(
      beregnBoligstoette({
        ...baseInput,
        householdSize: 5,
        children: 4,
        monthlyRent: 8000,
        pensionStatus: "folkepension",
      }),
    ).toMatchObject({ maximumMonthly: 6211, screeningHighMonthly: 6211 });
  });

  test("dækker alle pension- og børnekategorier", () => {
    expect(
      beregnBoligstoette({
        ...baseInput,
        householdSize: 5,
        children: 4,
        pensionStatus: "foertidspension",
      }),
    ).toMatchObject({ maximumMonthly: 5251, screeningHighMonthly: 5251 });
    expect(
      beregnBoligstoette({
        ...baseInput,
        householdSize: 5,
        children: 4,
        monthlyRent: 8000,
        pensionStatus: "folkepension",
      }),
    ).toMatchObject({ maximumMonthly: 6211, screeningHighMonthly: 6211 });
  });

  test("anvender de progressive formuegrænser som et øvre formuesignal", () => {
    expect(
      beregnBoligstoette({ ...baseInput, wealth: 896399 }),
    ).toMatchObject({
      wealthConsideration: "ingen",
      wealthIncomeEquivalent: 0,
      wealthAdjustedIncome: 216000,
    });
    expect(
      beregnBoligstoette({ ...baseInput, wealth: 896400 }),
    ).toMatchObject({
      wealthConsideration: "ingen",
      wealthIncomeEquivalent: 0,
      wealthAdjustedIncome: 216000,
    });
    expect(
      beregnBoligstoette({ ...baseInput, wealth: 896401 }),
    ).toMatchObject({
      wealthConsideration: "10-procent",
      wealthIncomeEquivalent: 0.1,
      wealthAdjustedIncome: 216000.1,
    });
    expect(
      beregnBoligstoette({ ...baseInput, wealth: 1793000 }),
    ).toMatchObject({
      wealthConsideration: "20-procent",
      wealthIncomeEquivalent: 89660,
      wealthAdjustedIncome: 305660,
    });
    expect(
      beregnBoligstoette({ ...baseInput, wealth: 1793001 }),
    ).toMatchObject({
      wealthConsideration: "20-procent",
      wealthIncomeEquivalent: 89660.2,
      wealthAdjustedIncome: 305660.2,
    });
    expect(
      beregnBoligstoette({
        ...baseInput,
        wealth: 1060300,
        pensionStatus: "folkepension",
      }),
    ).toMatchObject({ wealthConsideration: "ingen", wealthIncomeEquivalent: 0 });
    expect(
      beregnBoligstoette({
        ...baseInput,
        wealth: 2120800,
        pensionStatus: "folkepension",
      }),
    ).toMatchObject({
      wealthConsideration: "20-procent",
      wealthIncomeEquivalent: 106050,
      wealthAdjustedIncome: 322050,
    });
  });

  test("bruger ikke-pensionisternes progressive formuegrænser for nye førtidspensionister", () => {
    expect(
      beregnBoligstoette({ ...baseInput, pensionStatus: "foertidspension", wealth: 896400 }),
    ).toMatchObject({ wealthConsideration: "ingen", wealthIncomeEquivalent: 0 });
    expect(
      beregnBoligstoette({ ...baseInput, pensionStatus: "foertidspension", wealth: 1793000 }),
    ).toMatchObject({ wealthConsideration: "20-procent", wealthIncomeEquivalent: 89660 });
  });

  test("begrænser de progressive formuegrænser ved de inklusive tærskler", () => {
    const belowUpperThreshold = beregnBoligstoette({
      ...baseInput,
      wealth: 1792999,
    });
    expect(belowUpperThreshold).toMatchObject({ wealthConsideration: "10-procent" });
    expect(belowUpperThreshold?.wealthIncomeEquivalent).toBeCloseTo(89659.9, 8);
    expect(
      beregnBoligstoette({ ...baseInput, wealth: 1793000 }),
    ).toMatchObject({ wealthConsideration: "20-procent", wealthIncomeEquivalent: 89660 });
    expect(
      beregnBoligstoette({ ...baseInput, pensionStatus: "folkepension", wealth: 1060299 }),
    ).toMatchObject({ wealthConsideration: "ingen", wealthIncomeEquivalent: 0 });
    expect(
      beregnBoligstoette({ ...baseInput, pensionStatus: "folkepension", wealth: 1060300 }),
    ).toMatchObject({ wealthConsideration: "ingen", wealthIncomeEquivalent: 0 });
  });

  test("accepterer nul indkomst, men markerer uoplyst formue som ukendt", () => {
    expect(beregnBoligstoette({ ...baseInput, annualIncome: 0 })).toMatchObject({
      maximumMonthly: 1194,
      wealthAdjustedIncome: 0,
    });
    expect(beregnBoligstoette({ ...baseInput, wealth: null })).toMatchObject({
      wealthConsideration: null,
      wealthIncomeEquivalent: null,
      wealthAdjustedIncome: null,
    });
  });

  test("begrænser det lokale interval ved huslejen", () => {
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 1000 }),
    ).toMatchObject({
      maximumMonthly: 1194,
      screeningHighMonthly: 1000,
      maximumShareOfRent: 100,
    });
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 1194 }),
    ).toMatchObject({ screeningHighMonthly: 1194 });
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 1194.01 }),
    ).toMatchObject({ screeningHighMonthly: 1194 });
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 1194.005 }),
    ).toMatchObject({ maximumShareOfRent: 99 });
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 1000000 }),
    ).toMatchObject({ maximumShareOfRent: 0 });
  });

  test("bevarer hele øre i små huslejer", () => {
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 1.15 }),
    ).toMatchObject({
      screeningHighMonthly: 1.15,
      maximumShareOfRent: 100,
    });
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 1000.5 }),
    ).toMatchObject({
      screeningHighMonthly: 1000.5,
      maximumShareOfRent: 100,
    });
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 0.29 }),
    ).toMatchObject({
      screeningHighMonthly: 0.29,
      maximumShareOfRent: 100,
    });
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 1.9999999999999998 }),
    ).toMatchObject({ screeningHighMonthly: 1.99 });
    expect(
      beregnBoligstoette({ ...baseInput, monthlyRent: 0.049999999999999996 }),
    ).toMatchObject({ screeningHighMonthly: 0.04 });
  });

  test("afviser husleje under ét øre", () => {
    expect(beregnBoligstoette({ ...baseInput, monthlyRent: 0.009 })).toBeNull();
  });

  test("ændrer ikke det lokale interval alene for indkomst, formue, areal eller husstand", () => {
    const baseline = beregnBoligstoette(baseInput);
    const variations = [
      { ...baseInput, annualIncome: 600000 },
      { ...baseInput, wealth: 2500000 },
      { ...baseInput, area: 150 },
      { ...baseInput, householdSize: 3, children: 0 },
    ];

    for (const variation of variations) {
      expect(beregnBoligstoette(variation)).toMatchObject({
        screeningLowMonthly: baseline?.screeningLowMonthly,
        screeningHighMonthly: baseline?.screeningHighMonthly,
      });
    }
  });

  test("afviser ugyldige tal og umulige husstande", () => {
    expect(beregnBoligstoette({ ...baseInput, monthlyRent: 0 })).toBeNull();
    expect(beregnBoligstoette({ ...baseInput, annualIncome: -1 })).toBeNull();
    expect(beregnBoligstoette({ ...baseInput, wealth: Number.NaN })).toBeNull();
    expect(beregnBoligstoette({ ...baseInput, wealth: -1 })).toBeNull();
    expect(beregnBoligstoette({ ...baseInput, annualIncome: Number.NaN })).toBeNull();
    expect(
      beregnBoligstoette({ ...baseInput, pensionStatus: "ukendt" as never }),
    ).toBeNull();
    expect(
      beregnBoligstoette({ ...baseInput, area: 0 }),
    ).toBeNull();
    expect(
      beregnBoligstoette(null as unknown as BoligstoetteInput),
    ).toBeNull();
    expect(
      beregnBoligstoette({
        ...baseInput,
        annualIncome: Number.MAX_VALUE,
        wealth: Number.MAX_VALUE,
      }),
    ).toBeNull();
    expect(
      beregnBoligstoette({ ...baseInput, householdSize: 1, children: 1 }),
    ).toBeNull();
    expect(
      beregnBoligstoette({ ...baseInput, householdSize: 9, children: 4 }),
    ).toMatchObject({ maximumMonthly: 5251, screeningHighMonthly: 5251 });
  });
});

describe("normaliserBoligstoetteInputs", () => {
  test("bevarer gyldige nuværende delestatsfelter", () => {
    expect(
      normaliserBoligstoetteInputs({
        maanedligHusleje: 7200,
        husstandsindkomst: 420000,
        antalPersoner: 4,
        antalBorn: 2,
        formue: 500000,
        areal: 92,
        pensionStatus: "folkepension",
      }),
    ).toEqual({
      monthlyRent: 7200,
      annualIncome: 420000,
      householdSize: 4,
      children: 2,
      wealth: 500000,
      area: 92,
      pensionStatus: "folkepension",
    });
  });

  test("normaliserer danske tusindtalsseparatorer uden at ændre almindelige decimaler", () => {
    expect(
      normaliserBoligstoetteInputs({
        maanedligHusleje: "6.000",
        husstandsindkomst: "300.000",
        formue: "1.250.000,50",
        areal: "65,5",
      }),
    ).toMatchObject({
      monthlyRent: 6000,
      annualIncome: 300000,
      wealth: 1250000.5,
      area: 65.5,
    });
    expect(
      normaliserBoligstoetteInputs({ formue: "1000.000" }),
    ).toMatchObject({ wealth: 1000000 });
    expect(
      normaliserBoligstoetteInputs({ maanedligHusleje: "6000.5" }),
    ).toMatchObject({ monthlyRent: 6000.5 });
    expect(
      normaliserBoligstoetteInputs({ maanedligHusleje: "0.009" }),
    ).toMatchObject({ monthlyRent: 0.009 });
  });

  test("bevarer gamle links uden at opfinde børn eller formue", () => {
    expect(
      normaliserBoligstoetteInputs({
        maanedligHusleje: "6000",
        husstandsindkomst: "216000",
        antalPersoner: "2",
        areal: "65",
        boligType: "leje",
      }),
    ).toEqual({
      monthlyRent: 6000,
      annualIncome: 216000,
      householdSize: 2,
      children: 0,
      wealth: null,
      area: 65,
      pensionStatus: "ingen",
    });
  });

  test("canonicaliserer fire eller flere børn i delestater", () => {
    expect(
      normaliserBoligstoetteInputs({
        antalPersoner: 9,
        antalBorn: 6,
      }),
    ).toMatchObject({ householdSize: 7, children: 4 });
  });

  test("normaliserer en ugyldig husstandsstørrelse til én person", () => {
    expect(normaliserBoligstoetteInputs({ antalPersoner: 0 })).toMatchObject({
      householdSize: 1,
      children: 0,
    });
  });

  test("erstatter malformed state med sikre defaults", () => {
    expect(normaliserBoligstoetteInputs(null)).toEqual(DEFAULT_BOLIGSTOETTE_INPUT);
    expect(normaliserBoligstoetteInputs([])).toEqual(DEFAULT_BOLIGSTOETTE_INPUT);
    expect(
      normaliserBoligstoetteInputs({
        maanedligHusleje: -100,
        husstandsindkomst: "meget",
        antalPersoner: 9,
        antalBorn: -1,
        formue: Number.NaN,
        areal: -20,
        pensionStatus: "ukendt",
      }),
    ).toEqual({
      monthlyRent: 0,
      annualIncome: 0,
      householdSize: 7,
      children: 0,
      wealth: null,
      area: 65,
      pensionStatus: "ingen",
    });
  });
});
