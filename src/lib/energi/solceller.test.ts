import { describe, expect, it } from "vitest";
import pvgisFixture from "./__fixtures__/pvgis-aarhus-35-syd.json";
import { slaaPostnummerOp } from "./postnumre";
import { buildPvgisUrl, parsePvgis, solOekonomi } from "./solceller";

describe("parsePvgis", () => {
  it("reads yearly and monthly production from the recorded v5_3 response", () => {
    const r = parsePvgis(pvgisFixture);
    expect(r.kwhPrKwp).toBe(968.78);
    expect(r.maaneder).toHaveLength(12);
    expect(r.maaneder.reduce((s, v) => s + v, 0)).toBeCloseTo(968.78, 0);
  });

  it("throws on an error body", () => {
    expect(() => parsePvgis({ message: "Location over the sea" })).toThrow();
    expect(() => parsePvgis(null)).toThrow();
  });
});

describe("buildPvgisUrl", () => {
  it("builds a v5_3 PVcalc URL for 1 kWp on a building", () => {
    const url = new URL(buildPvgisUrl({ lat: 56.2, lon: 10.2, angle: 35, aspect: -45 }));
    expect(url.pathname).toBe("/api/v5_3/PVcalc");
    expect(url.searchParams.get("peakpower")).toBe("1");
    expect(url.searchParams.get("aspect")).toBe("-45");
    expect(url.searchParams.get("mountingplace")).toBe("building");
    expect(url.searchParams.get("outputformat")).toBe("json");
  });
});

describe("solOekonomi", () => {
  it("values self-consumption at the purchase price and surplus at the spot price", () => {
    const r = solOekonomi({
      produktion: 6000,
      forbrug: 5000,
      egetforbrugAndel: 0.3,
      koebspris: 2,
      salgspris: 0.5,
      anlaegspris: 72000,
    });
    expect(r.egetforbrug).toBe(1800);
    expect(r.overskud).toBe(4200);
    expect(r.aarligVaerdi).toBe(1800 * 2 + 4200 * 0.5);
    expect(r.tilbagebetalingsAar).toBeCloseTo(72000 / 5700, 6);
  });

  it("caps self-consumption at the household's consumption", () => {
    const r = solOekonomi({ produktion: 10000, forbrug: 2000, egetforbrugAndel: 0.5, koebspris: 2, salgspris: 0.5, anlaegspris: 1 });
    expect(r.egetforbrug).toBe(2000);
    expect(r.overskud).toBe(8000);
  });

  it("returns no payback when the system earns nothing", () => {
    const r = solOekonomi({ produktion: 0, forbrug: 4000, egetforbrugAndel: 0.3, koebspris: 2, salgspris: 0.5, anlaegspris: 50000 });
    expect(r.tilbagebetalingsAar).toBeNull();
  });
});

describe("slaaPostnummerOp", () => {
  it("finds centroids for real postcodes and rejects unknown ones", () => {
    const aarhus = slaaPostnummerOp("8000")!;
    expect(aarhus.navn).toBe("Aarhus C");
    expect(aarhus.lat).toBeCloseTo(56.15, 1);
    expect(slaaPostnummerOp("3700")?.navn).toBe("Rønne");
    expect(slaaPostnummerOp("0000")).toBeNull();
    expect(slaaPostnummerOp("abcd")).toBeNull();
  });
});
