import { describe, test, expect } from "vitest";
import { formatCurrency, formatNumber, getIntlLocale, getCurrencyCode, getCurrencySuffix } from "./format";

describe("formatCurrency", () => {
  test("formats DKK for Danish locale", () => {
    const result = formatCurrency(1000, "da");
    expect(result).toContain("1.000");
    expect(result).toMatch(/kr/);
  });

  test("formats SEK for Swedish locale", () => {
    const result = formatCurrency(1000, "se");
    expect(result).toMatch(/kr/);
  });

  test("formats NOK for Norwegian locale", () => {
    const result = formatCurrency(1000, "no");
    expect(result).toMatch(/kr/);
  });

  test("respects fraction digit options", () => {
    const result = formatCurrency(1234.5678, "da", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    expect(result).not.toContain(",56");
  });

  test("handles zero", () => {
    const result = formatCurrency(0, "da");
    expect(result).toContain("0");
  });

  test("handles negative numbers", () => {
    const result = formatCurrency(-500, "da");
    expect(result).toContain("500");
  });
});

describe("formatNumber", () => {
  test("adds thousand separators for DA", () => {
    const result = formatNumber(1000000, "da");
    expect(result).toContain("1.000.000");
  });

  test("handles decimals", () => {
    const result = formatNumber(3.14, "da", { minimumFractionDigits: 2 });
    expect(result).toContain("3,14");
  });
});

describe("getIntlLocale", () => {
  test("returns correct Intl locale strings", () => {
    expect(getIntlLocale("da")).toBe("da-DK");
    expect(getIntlLocale("no")).toBe("nb-NO");
    expect(getIntlLocale("se")).toBe("sv-SE");
  });
});

describe("getCurrencyCode", () => {
  test("returns correct currency codes", () => {
    expect(getCurrencyCode("da")).toBe("DKK");
    expect(getCurrencyCode("no")).toBe("NOK");
    expect(getCurrencyCode("se")).toBe("SEK");
  });
});

describe("getCurrencySuffix", () => {
  test("returns kr. for Danish, kr for others", () => {
    expect(getCurrencySuffix("da")).toBe("kr.");
    expect(getCurrencySuffix("se")).toBe("kr");
    expect(getCurrencySuffix("no")).toBe("kr");
  });
});
