import { describe, expect, it } from "vitest";
import {
  KOFFEIN_EKSEMPEL,
  KOFFEIN_GRAENSER,
  KOFFEIN_KILDER,
  KOFFEIN_KILDE_MAP,
  koffeinBeregning,
  koffeinFaqSvar,
  type KoffeinKildeId,
} from "./koffein";

describe("koffeinBeregning", () => {
  it("beregner totalen for en filterkaffe på 200 ml til 90 mg", () => {
    const svar = koffeinBeregning([{ kilde: "filterkaffe", gram: 200 }], "voksen");
    expect(svar.totalMg).toBe(90);
  });

  it("beregner totalen for en espresso på 60 ml til 80 mg", () => {
    const svar = koffeinBeregning([{ kilde: "espresso", gram: 60 }], "voksen");
    expect(svar.totalMg).toBe(80);
  });

  it("beregner totalen for en cola på 355 ml til 40 mg", () => {
    const svar = koffeinBeregning([{ kilde: "cola", gram: 355 }], "voksen");
    expect(svar.totalMg).toBe(40);
  });

  it("beregner totalen for en energidrik på 250 ml til 80 mg", () => {
    const svar = koffeinBeregning([{ kilde: "red-bull", gram: 250 }], "voksen");
    expect(svar.totalMg).toBe(80);
  });

  it("beregner totalen for 50 g mørk chokolade til 25 mg", () => {
    const svar = koffeinBeregning([{ kilde: "mørk-chokolade", gram: 50 }], "voksen");
    expect(svar.totalMg).toBe(25);
  });

  it("beregner totalen for 50 g mælkechokolade til 10 mg", () => {
    const svar = koffeinBeregning([{ kilde: "maelke-chokolade", gram: 50 }], "voksen");
    expect(svar.totalMg).toBe(10);
  });

  it("summerer flere kilder korrekt", () => {
    const svar = koffeinBeregning(
      [
        { kilde: "filterkaffe", gram: 200 },
        { kilde: "cola", gram: 355 },
      ],
      "voksen"
    );
    expect(svar.totalMg).toBe(130);
  });

  it("returnerer 0 for en tom liste", () => {
    const svar = koffeinBeregning([], "voksen");
    expect(svar.totalMg).toBe(0);
    expect(svar.overGraense).toBe(false);
  });

  it("markerer overGrænse når totalen overstiger 400 mg", () => {
    const svar = koffeinBeregning(
      [
        { kilde: "filterkaffe", gram: 200 },
        { kilde: "filterkaffe", gram: 200 },
        { kilde: "filterkaffe", gram: 200 },
        { kilde: "filterkaffe", gram: 200 },
        { kilde: "filterkaffe", gram: 200 },
      ],
      "voksen"
    );
    expect(svar.totalMg).toBe(450);
    expect(svar.overGraense).toBe(true);
  });

  it("markerer overEnkelt når én dosis overstiger 200 mg", () => {
    const svar = koffeinBeregning([{ kilde: "espresso", gram: 60 }], "voksen");
    expect(svar.overEnkelt).toBe(false);
    const stor = koffeinBeregning([{ kilde: "espresso", gram: 600 }], "voksen");
    expect(stor.overEnkelt).toBe(true);
  });

  it("bruger 200 mg daglig grænse for gravide", () => {
    const svar = koffeinBeregning([{ kilde: "filterkaffe", gram: 200 }], "gravid");
    expect(svar.graense.dagligMg).toBe(200);
    expect(svar.overGraense).toBe(false);
  });

  it("bruger 3 mg/kg for børn når vægten er givet", () => {
    const svar = koffeinBeregning([{ kilde: "cola", gram: 355 }], "barn", 30);
    expect(svar.graense.dagligMg).toBe(90);
    expect(svar.overGraense).toBe(false);
    const stor = koffeinBeregning(
      [
        { kilde: "red-bull", gram: 250 },
        { kilde: "red-bull", gram: 250 },
      ],
      "barn",
      30
    );
    expect(stor.overGraense).toBe(true);
  });

  it("giver 0 daglig grænse for børn uden vægt", () => {
    const svar = koffeinBeregning([{ kilde: "cola", gram: 355 }], "barn");
    expect(svar.graense.dagligMg).toBe(0);
    expect(svar.overGraense).toBe(false);
  });
});

describe("KOFFEIN_KILDER", () => {
  it("har 13 kilder", () => {
    expect(KOFFEIN_KILDER).toHaveLength(13);
  });

  it("har unikke id'er", () => {
    const ids = KOFFEIN_KILDER.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("har positive værdier for mgPer100 og portion", () => {
    for (const k of KOFFEIN_KILDER) {
      expect(k.mgPer100).toBeGreaterThan(0);
      expect(k.portion).toBeGreaterThan(0);
      expect(k.portionMg).toBeGreaterThan(0);
    }
  });

  it("har portionMg der passer til mgPer100 × portion", () => {
    for (const k of KOFFEIN_KILDER) {
      const beregnet = (k.portion / 100) * k.mgPer100;
      expect(k.portionMg).toBeCloseTo(beregnet, 0);
    }
  });

  it("har fdcId på alle kilder", () => {
    for (const k of KOFFEIN_KILDER) {
      expect(k.fdcId).toBeDefined();
      expect(k.fdcId).toBeGreaterThan(0);
    }
  });
});

describe("KOFFEIN_EKSEMPEL", () => {
  it("er en filterkaffe på 200 ml", () => {
    expect(KOFFEIN_EKSEMPEL.kilde).toBe("filterkaffe");
    expect(KOFFEIN_EKSEMPEL.gram).toBe(200);
  });

  it("har totalMg på 90", () => {
    expect(KOFFEIN_EKSEMPEL.totalMg).toBe(90);
  });
});

describe("koffeinFaqSvar", () => {
  it("svarer dansk for voksen", () => {
    const svar = koffeinFaqSvar("voksen", "da");
    expect(svar).toContain("400 mg");
    expect(svar).toContain("voksne");
  });

  it("svarer svensk for voksen", () => {
    const svar = koffeinFaqSvar("voksen", "se");
    expect(svar).toContain("400 mg");
    expect(svar).toContain("vuxna");
  });

  it("svarer dansk for gravid", () => {
    const svar = koffeinFaqSvar("gravid", "da");
    expect(svar).toContain("200 mg");
    expect(svar).toContain("gravid");
  });
});

describe("KOFFEIN_GRAENSER", () => {
  it("har 400 mg for voksne", () => {
    expect(KOFFEIN_GRAENSER.voksen.dagligMg).toBe(400);
  });

  it("har 200 mg for gravide", () => {
    expect(KOFFEIN_GRAENSER.gravid.dagligMg).toBe(200);
  });

  it("har 200 mg enkelt for voksne", () => {
    expect(KOFFEIN_GRAENSER.voksen.enkeltMg).toBe(200);
  });
});
