import { describe, test, expect } from "vitest";
import { beregnOhm } from "./ohm";

describe("beregnOhm", () => {
  test("returns null when inputs are missing", () => {
    expect(beregnOhm("spaending", 0, 0, 10)).toBeNull();
    expect(beregnOhm("stroem", 0, 2, 0)).toBeNull();
  });

  test("voltage from current and resistance", () => {
    const r = beregnOhm("spaending", 0, 2, 12)!;
    expect(r.spaending).toBe(24);
    expect(r.effekt).toBe(48); // 24 V * 2 A
  });

  test("current from voltage and resistance", () => {
    const r = beregnOhm("stroem", 230, 0, 46)!;
    expect(r.stroem).toBeCloseTo(5, 5);
    expect(r.effekt).toBeCloseTo(1150, 5);
  });

  test("resistance from voltage and current", () => {
    const r = beregnOhm("modstand", 12, 3, 0)!;
    expect(r.modstand).toBe(4);
    expect(r.effekt).toBe(36);
  });

  test("power equals I squared times R", () => {
    const r = beregnOhm("spaending", 0, 3, 10)!;
    expect(r.effekt).toBeCloseTo(3 * 3 * 10, 5);
  });
});
