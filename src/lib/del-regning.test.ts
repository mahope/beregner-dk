import { describe, test, expect } from "vitest";
import { delRegning } from "./del-regning";

describe("delRegning", () => {
  test("returns null for invalid input", () => {
    expect(delRegning(100, 0, 0)).toBeNull();
    expect(delRegning(-1, 2, 0)).toBeNull();
  });

  test("splits evenly without tip", () => {
    const r = delRegning(300, 3, 0)!;
    expect(r.drikkepenge).toBe(0);
    expect(r.totalMedDrikkepenge).toBe(300);
    expect(r.prPerson).toBe(100);
  });

  test("adds a tip percentage", () => {
    const r = delRegning(500, 4, 10)!;
    expect(r.drikkepenge).toBe(50);
    expect(r.totalMedDrikkepenge).toBe(550);
    expect(r.prPerson).toBe(137.5);
  });

  test("treats negative tip as zero", () => {
    const r = delRegning(200, 2, -5)!;
    expect(r.drikkepenge).toBe(0);
    expect(r.prPerson).toBe(100);
  });

  test("single person pays the whole bill", () => {
    const r = delRegning(250, 1, 0)!;
    expect(r.prPerson).toBe(250);
  });
});
