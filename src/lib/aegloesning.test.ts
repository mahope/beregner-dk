import { describe, test, expect } from "vitest";
import { beregnAegloesning } from "./aegloesning";

describe("beregnAegloesning", () => {
  test("returns null for invalid date or cycle", () => {
    expect(beregnAegloesning("bad", 28)).toBeNull();
    expect(beregnAegloesning("2026-01-01", 10)).toBeNull();
    expect(beregnAegloesning("2026-01-01", 60)).toBeNull();
  });

  test("standard 28-day cycle", () => {
    const r = beregnAegloesning("2026-01-01", 28)!;
    // next period 2026-01-29, ovulation 14 days earlier = 2026-01-15
    expect(r.naesteMenstruation).toBe("2026-01-29");
    expect(r.aegloesning).toBe("2026-01-15");
    expect(r.frugtbarStart).toBe("2026-01-10");
    expect(r.frugtbarSlut).toBe("2026-01-16");
  });

  test("longer cycle pushes ovulation later", () => {
    const short = beregnAegloesning("2026-01-01", 28)!;
    const long = beregnAegloesning("2026-01-01", 35)!;
    expect(long.aegloesning > short.aegloesning).toBe(true);
    expect(long.naesteMenstruation).toBe("2026-02-05");
  });

  test("ovulation is always 14 days before next period", () => {
    const r = beregnAegloesning("2026-06-10", 30)!;
    // next = 2026-07-10, ovulation = 2026-06-26
    expect(r.naesteMenstruation).toBe("2026-07-10");
    expect(r.aegloesning).toBe("2026-06-26");
  });
});
