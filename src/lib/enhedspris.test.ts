import { describe, test, expect } from "vitest";
import { sammenlignEnhedspris } from "./enhedspris";

describe("sammenlignEnhedspris", () => {
  test("returns null for invalid input", () => {
    expect(sammenlignEnhedspris(10, 0, 20, 2)).toBeNull();
    expect(sammenlignEnhedspris(-1, 1, 20, 2)).toBeNull();
    expect(sammenlignEnhedspris(10, 1, 20, 0)).toBeNull();
  });

  test("computes unit prices", () => {
    const r = sammenlignEnhedspris(20, 2, 15, 1)!;
    expect(r.enhedsprisA).toBe(10);
    expect(r.enhedsprisB).toBe(15);
  });

  test("picks the cheaper product A", () => {
    const r = sammenlignEnhedspris(20, 2, 15, 1)!;
    expect(r.billigst).toBe("A");
    // A is 10/kg, B is 15/kg -> saving vs B = 33.33%
    expect(r.besparelseProcent).toBeCloseTo(33.33, 2);
  });

  test("picks the cheaper product B", () => {
    const r = sammenlignEnhedspris(30, 1, 40, 2)!;
    // A = 30, B = 20 -> B cheaper, saving vs A = 33.33%
    expect(r.billigst).toBe("B");
    expect(r.besparelseProcent).toBeCloseTo(33.33, 2);
  });

  test("detects equal unit price", () => {
    const r = sammenlignEnhedspris(10, 1, 20, 2)!;
    expect(r.billigst).toBe("lige");
    expect(r.besparelseProcent).toBe(0);
  });

  test("handles a free product without dividing by zero", () => {
    const r = sammenlignEnhedspris(0, 1, 10, 1)!;
    expect(r.enhedsprisA).toBe(0);
    expect(r.billigst).toBe("A");
    expect(r.besparelseProcent).toBe(100);
  });
});
