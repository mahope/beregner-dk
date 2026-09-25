import { describe, expect, test } from "vitest";
import { getSearchContent } from "./search-content";

describe("getSearchContent", () => {
  test("exposes the BMI-for-children guide only in Danish", () => {
    const [guide] = getSearchContent("da");

    expect(guide.href).toBe("/blog/bmi-for-boern-saadan-tjekker-du");
    expect(guide.keywords).toContain("bmi for mit barn");
    expect(getSearchContent("no")).toHaveLength(0);
    expect(getSearchContent("se")).toHaveLength(0);
  });
});
