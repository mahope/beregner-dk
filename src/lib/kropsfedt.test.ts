import { describe, test, expect } from "vitest";
import { beregnKropsfedt } from "./kropsfedt";

describe("beregnKropsfedt", () => {
  test("returns null for invalid input", () => {
    expect(beregnKropsfedt("mand", 0, 90, 40, 0)).toBeNull();
    expect(beregnKropsfedt("mand", 180, 40, 40, 0)).toBeNull(); // waist == neck
    expect(beregnKropsfedt("kvinde", 170, 80, 34, 0)).toBeNull(); // missing hip
  });

  test("man: 180 cm, waist 90, neck 40 gives a plausible value", () => {
    const r = beregnKropsfedt("mand", 180, 90, 40, 0)!;
    // Reference Navy calc ~= 19.9%
    expect(r.procent).toBeGreaterThan(18);
    expect(r.procent).toBeLessThan(22);
    expect(r.kategori).toBe("gennemsnit");
  });

  test("lean man is categorised as athlete", () => {
    const r = beregnKropsfedt("mand", 180, 80, 40, 0)!;
    expect(r.procent).toBeLessThan(14);
    expect(["atlet", "essentiel"]).toContain(r.kategori);
  });

  test("woman requires and uses hip measurement", () => {
    const r = beregnKropsfedt("kvinde", 168, 75, 32, 95)!;
    expect(r.procent).toBeGreaterThan(0);
    expect(r.procent).toBeLessThan(45);
  });

  test("woman classification thresholds", () => {
    const r = beregnKropsfedt("kvinde", 165, 70, 30, 90)!;
    expect(["fitness", "gennemsnit", "atlet"]).toContain(r.kategori);
  });
});
