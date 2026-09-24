import { describe, expect, test } from "vitest";
import { SU_2026 } from "./satser-2026";
import {
  DEFAULT_STUDIELAAN_INPUT,
  normaliserStudielaanInputs,
  type StudielaanInput,
} from "./studielaan";

const baseInput: StudielaanInput = {
  totalDebt: 100000,
  annualInterestRate: 2.85,
  repaymentYears: 7,
  extraMonthlyPayment: 0,
  monthlyIncome: 25000,
};

describe("normaliserStudielaanInputs", () => {
  test("bevarer gyldige delestatsfelter", () => {
    expect(
      normaliserStudielaanInputs({
        samletGaeld: 120000,
        rente: 4,
        loebetid: 10,
        ekstraAfdrag: 500,
        maanedligIndkomst: 30000,
      }),
    ).toEqual({
      totalDebt: 120000,
      annualInterestRate: 4,
      repaymentYears: 10,
      extraMonthlyPayment: 500,
      monthlyIncome: 30000,
    });
  });

  test("bevarer en gammel kortere løbetid i delelinket", () => {
    expect(
      normaliserStudielaanInputs(
        {
          samletGaeld: 100000,
          rente: 4,
          loebetid: 5,
          ekstraAfdrag: 0,
          maanedligIndkomst: 25000,
        },
        true,
      ),
    ).toEqual({
      totalDebt: 100000,
      annualInterestRate: 4,
      repaymentYears: 5,
      extraMonthlyPayment: 0,
      monthlyIncome: 25000,
    });
  });

  test(" erstatter malformed værdier med sikre defaults", () => {
    expect(normaliserStudielaanInputs(null)).toEqual(DEFAULT_STUDIELAAN_INPUT);
    expect(
      normaliserStudielaanInputs({
        samletGaeld: -1,
        rente: -2,
        loebetid: 16.5,
        ekstraAfdrag: -100,
        maanedligIndkomst: Number.NaN,
      }),
    ).toEqual(DEFAULT_STUDIELAAN_INPUT);
  });

  test("begrænser den aktuelle normale løbetid til syv til femten år", () => {
    expect(
      normaliserStudielaanInputs({ loebetid: 1 }).repaymentYears,
    ).toBe(SU_2026.loan.repaymentMinYears);
    expect(
      normaliserStudielaanInputs({ loebetid: 99 }).repaymentYears,
    ).toBe(DEFAULT_STUDIELAAN_INPUT.repaymentYears);
  });
});
