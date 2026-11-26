import { describe, expect, it } from "vitest";
import { adtractionLink } from "./adtraction";

describe("adtractionLink", () => {
  const deeplink = "https://www.ase.dk/a-kasse?fra=beregner&valg=1";

  it("appends the encoded deeplink to the verified tracking URL", () => {
    expect(adtractionLink("1666137874", deeplink)).toBe(
      "https://on.ase.dk/t/t?a=1666137879&as=2056156501&t=2&tk=1&url=https%3A%2F%2Fwww.ase.dk%2Fa-kasse%3Ffra%3Dberegner%26valg%3D1",
    );
  });

  it.each(["unknown", "constructor"])("returns the original deeplink for %s", (programId) => {
    expect(adtractionLink(programId, deeplink)).toBe(deeplink);
  });
});
