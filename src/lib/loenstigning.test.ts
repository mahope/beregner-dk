import { describe, test, expect } from "vitest";
import { beregnLoenstigning } from "./loenstigning";

describe("beregnLoenstigning", () => {
  test("returns null for non-positive old salary", () => {
    expect(beregnLoenstigning(0, 100)).toBeNull();
    expect(beregnLoenstigning(-10, 100)).toBeNull();
  });

  test("computes a raise", () => {
    const r = beregnLoenstigning(30000, 33000)!;
    expect(r.forskel).toBe(3000);
    expect(r.procent).toBe(10);
    expect(r.erStigning).toBe(true);
  });

  test("computes a pay cut", () => {
    const r = beregnLoenstigning(40000, 36000)!;
    expect(r.forskel).toBe(-4000);
    expect(r.procent).toBe(-10);
    expect(r.erStigning).toBe(false);
  });

  test("no change is zero percent", () => {
    const r = beregnLoenstigning(25000, 25000)!;
    expect(r.procent).toBe(0);
    expect(r.erStigning).toBe(true);
  });
});
