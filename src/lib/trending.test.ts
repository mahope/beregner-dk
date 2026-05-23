import { describe, test, expect, vi, afterEach } from "vitest";
import { getTrendingHrefs } from "./trending";

function mockMonth(month: number) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, month, 15));
}

afterEach(() => {
  vi.useRealTimers();
});

describe("getTrendingHrefs", () => {
  test("always returns exactly 3 hrefs", () => {
    for (let m = 0; m < 12; m++) {
      mockMonth(m);
      const result = getTrendingHrefs();
      expect(result).toHaveLength(3);
      vi.useRealTimers();
    }
  });

  test("all hrefs start with /", () => {
    for (let m = 0; m < 12; m++) {
      mockMonth(m);
      for (const href of getTrendingHrefs()) {
        expect(href).toMatch(/^\//);
      }
      vi.useRealTimers();
    }
  });

  test("Jan–Mar returns tax-season calculators", () => {
    mockMonth(0); // January
    expect(getTrendingHrefs()).toContain("/loen-efter-skat");
  });

  test("Apr–Jul returns summer calculators", () => {
    mockMonth(5); // June
    expect(getTrendingHrefs()).toContain("/feriepenge");
  });

  test("Aug–Sep returns study-start calculators", () => {
    mockMonth(7); // August
    expect(getTrendingHrefs()).toContain("/su");
  });

  test("Oct–Dec returns year-end calculators", () => {
    mockMonth(10); // November
    expect(getTrendingHrefs()).toContain("/opsparing");
  });
});
