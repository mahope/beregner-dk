import { describe, test, expect } from "vitest";
import { beregnNedtaelling } from "./nedtaelling";

describe("beregnNedtaelling", () => {
  test("returns null for invalid dates", () => {
    expect(beregnNedtaelling("not-a-date", "2026-01-01")).toBeNull();
    expect(beregnNedtaelling("2026-02-31", "2026-03-01")).toBeNull();
  });

  test("counts days to a future date", () => {
    const r = beregnNedtaelling("2026-07-07", "2026-07-17")!;
    expect(r.dage).toBe(10);
    expect(r.uger).toBe(1);
    expect(r.restDage).toBe(3);
    expect(r.erFortid).toBe(false);
  });

  test("marks a past date", () => {
    const r = beregnNedtaelling("2026-07-07", "2026-07-01")!;
    expect(r.dage).toBe(6);
    expect(r.erFortid).toBe(true);
  });

  test("same day is zero", () => {
    const r = beregnNedtaelling("2026-07-07", "2026-07-07")!;
    expect(r.dage).toBe(0);
    expect(r.erFortid).toBe(false);
  });

  test("counts across a year boundary", () => {
    const r = beregnNedtaelling("2026-12-25", "2027-01-01")!;
    expect(r.dage).toBe(7);
    expect(r.uger).toBe(1);
    expect(r.restDage).toBe(0);
  });
});
