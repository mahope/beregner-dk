import { describe, test, expect } from "vitest";
import { vaegtPaaPlanet, alleVaegte, HIMMELLEGEMER } from "./planetvaegt";

describe("vaegtPaaPlanet", () => {
  test("returns null for invalid weight", () => {
    expect(vaegtPaaPlanet(0, 0.377)).toBeNull();
    expect(vaegtPaaPlanet(-5, 1)).toBeNull();
  });

  test("weight on the Moon is about a sixth", () => {
    const r = vaegtPaaPlanet(80, 0.166)!;
    expect(r).toBeCloseTo(13.28, 2);
  });

  test("weight on Jupiter is heavier", () => {
    const r = vaegtPaaPlanet(80, 2.528)!;
    expect(r).toBeCloseTo(202.24, 2);
  });
});

describe("alleVaegte", () => {
  test("returns a weight for every body", () => {
    const r = alleVaegte(70)!;
    expect(r.length).toBe(HIMMELLEGEMER.length);
    const mars = r.find((x) => x.id === "mars")!;
    expect(mars.vaegt).toBeCloseTo(70 * 0.379, 5);
  });

  test("returns null for invalid weight", () => {
    expect(alleVaegte(0)).toBeNull();
  });

  test("all factors are positive", () => {
    for (const h of HIMMELLEGEMER) {
      expect(h.faktor).toBeGreaterThan(0);
    }
  });
});
