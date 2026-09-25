import { describe, expect, test } from "vitest";
import pris01 from "./__fixtures__/statbank-pris01.json";
import { formatPeriode, parseStatbankInflation } from "./statbank";

const lav = (index: Record<string, number>, value: (number | null)[]) => ({
  dataset: { dimension: { Tid: { category: { index } } }, size: [1, 1, 1, value.length], value },
});

describe("parseStatbankInflation", () => {
  test("vælger seneste måned fra PRIS01-fixture", () => {
    expect(parseStatbankInflation(pris01)).toEqual({ pct: 2, periode: "2026M08", maaned: "august 2026" });
  });

  test("springer en manglende seneste værdi over", () => {
    expect(parseStatbankInflation(lav({ "2026M07": 0, "2026M08": 1 }, [1.7, null]))).toEqual({
      pct: 1.7,
      periode: "2026M07",
      maaned: "juli 2026",
    });
  });

  test("bruger index-rækkefølgen, ikke nøglernes rækkefølge", () => {
    expect(parseStatbankInflation(lav({ "2026M08": 1, "2026M07": 0 }, [1.7, 2.1]))?.periode).toBe("2026M08");
  });

  test("afviser ugyldige svar", () => {
    expect(parseStatbankInflation(null)).toBeNull();
    expect(parseStatbankInflation({ errorTypeCode: "EXTRACT-NOTFOUND" })).toBeNull();
    expect(parseStatbankInflation(lav({ "2026M08": 0 }, [999]))).toBeNull();
    expect(parseStatbankInflation({ dataset: { ...lav({ a: 0 }, [1]).dataset, size: [2, 1] } })).toBeNull();
  });
});

describe("formatPeriode", () => {
  test("månedskoder", () => {
    expect(formatPeriode("2026M01")).toBe("januar 2026");
    expect(formatPeriode("2025M12")).toBe("december 2025");
    expect(formatPeriode("2026M13")).toBeNull();
    expect(formatPeriode("2026K1")).toBeNull();
  });
});
