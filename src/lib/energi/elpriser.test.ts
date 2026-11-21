import { describe, expect, it } from "vitest";
import dayAhead from "./__fixtures__/dayahead-2026-09-24.json";
import pricelist from "./__fixtures__/datahub-pricelist-2026-09.json";
import {
  addDays,
  billigsteIndekser,
  billigsteNatVindue,
  billigsteVindue,
  type DagPriser,
  dkNu,
  gennemsnitsPris,
  parseDatahubTariffs,
  parseDayAheadPrices,
  prisForTime,
  prisomraadeForPostnummer,
  standardTariffer,
  type Tariffer,
  toHourlySpot,
} from "./elpriser";

describe("parseDayAheadPrices", () => {
  it("parses the recorded DayAheadPrices fixture (quarter-hour, DK1+DK2, two days)", () => {
    const records = parseDayAheadPrices(dayAhead);
    expect(records).toHaveLength(384);
    expect(records[0]).toEqual({ timeDk: "2026-09-24T00:00:00", area: "DK1", dkkPerMwh: 748.008521 });
  });

  it("skips malformed rows and throws on a non-dataset body", () => {
    const records = parseDayAheadPrices({
      records: [
        { TimeDK: "2026-09-25T00:00:00", PriceArea: "DK1", DayAheadPriceDKK: 100 },
        { TimeDK: "2026-09-25T00:15:00", PriceArea: "DK1", DayAheadPriceDKK: null },
        { PriceArea: "DK1", DayAheadPriceDKK: 5 },
      ],
    });
    expect(records).toHaveLength(1);
    expect(() => parseDayAheadPrices({ error: "x" })).toThrow();
    expect(() => parseDayAheadPrices(null)).toThrow();
  });
});

describe("toHourlySpot", () => {
  const hourly = toHourlySpot(parseDayAheadPrices(dayAhead), "DK1");

  it("averages four quarters into one hourly kr/kWh value per DK date", () => {
    const day = hourly.get("2026-09-25")!;
    expect(day).toHaveLength(24);
    // (1472.468939 + 1378.052074 + 1313.612439 + 1275.038321) / 4 / 1000
    expect(day[0].spot).toBeCloseTo(1.35979, 5);
    expect(day[0].hour).toBe(0);
    expect(day[23].hour).toBe(23);
  });

  it("keeps the areas apart", () => {
    const dk2 = toHourlySpot(parseDayAheadPrices(dayAhead), "DK2").get("2026-09-25")!;
    expect(dk2).toHaveLength(24);
    expect(dk2[0].spot).not.toBe(hourly.get("2026-09-25")![0].spot);
  });
});

describe("parseDatahubTariffs", () => {
  it("picks the Radius summer time-of-use tariff valid on 2026-09-25", () => {
    const t = parseDatahubTariffs(pricelist, "DK2", "2026-09-25")!;
    expect(t.kilde).toBe("live");
    expect(t.netselskab).toBe("Radius");
    expect(t.nettarif[0]).toBeCloseTo(0.106175, 6);
    expect(t.nettarif[12]).toBeCloseTo(0.159262, 6);
    expect(t.nettarif[18]).toBeCloseTo(0.414082, 6);
    expect(t.transmission).toBe(0.043);
    expect(t.system).toBe(0.072);
    expect(t.elafgift).toBe(0.008);
  });

  it("switches to the winter tariff from 2026-10-01 and ignores N1's monthly subscription row", () => {
    const t = parseDatahubTariffs(pricelist, "DK1", "2026-10-01")!;
    expect(t.netselskab).toBe("N1");
    expect(t.nettarif).toHaveLength(24);
    expect(t.nettarif[18]).toBeCloseTo(0.79069, 5);
  });

  it("returns null when a component is missing", () => {
    expect(parseDatahubTariffs({ records: [] }, "DK1", "2026-09-25")).toBeNull();
    expect(parseDatahubTariffs(null, "DK1", "2026-09-25")).toBeNull();
    // Energinet charges are only listed until 2027-01-01 in the fixture.
    expect(parseDatahubTariffs(pricelist, "DK2", "2027-02-01")).toBeNull();
  });
});

describe("prisForTime", () => {
  const t: Tariffer = { ...standardTariffer("DK1"), nettarif: Array(24).fill(0.2) };

  it("adds tariffs, Energinet, elafgift and 25% VAT to the spot price", () => {
    const p = prisForTime(1, 5, t);
    const exMoms = 1 + 0.2 + 0.043 + 0.072 + 0.008;
    expect(p.energinet).toBeCloseTo(0.115, 6);
    expect(p.moms).toBeCloseTo(exMoms * 0.25, 6);
    expect(p.total).toBeCloseTo(exMoms * 1.25, 6);
  });

  it("uses the hour's own net tariff", () => {
    const tou: Tariffer = { ...t, nettarif: Array.from({ length: 24 }, (_, h) => (h >= 17 && h < 21 ? 1 : 0.1)) };
    expect(prisForTime(0.5, 18, tou).nettarif).toBe(1);
    expect(prisForTime(0.5, 3, tou).nettarif).toBe(0.1);
  });

  it("keeps negative spot prices (VAT is applied to the sum)", () => {
    const p = prisForTime(-0.5, 12, t);
    expect(p.total).toBeCloseTo((-0.5 + 0.323) * 1.25, 6);
  });

  it("averages a day's components", () => {
    const avg = gennemsnitsPris([prisForTime(1, 0, t), prisForTime(2, 1, t)]);
    expect(avg.spot).toBeCloseTo(1.5, 6);
    expect(avg.total).toBeCloseTo((1.5 + 0.323) * 1.25, 6);
  });
});

describe("billigsteVindue", () => {
  it("finds the cheapest contiguous window", () => {
    expect(billigsteVindue([5, 1, 1, 1, 1, 5, 0, 9], 4)).toEqual({ start: 1, gennemsnit: 1 });
    expect(billigsteVindue([3, 2, 1, 0], 2)).toEqual({ start: 2, gennemsnit: 0.5 });
  });

  it("prefers the earliest window on ties", () => {
    expect(billigsteVindue([1, 1, 1, 1], 2)?.start).toBe(0);
  });

  it("handles negative prices and too-short input", () => {
    expect(billigsteVindue([0.5, -0.2, -0.3, 0.4], 2)).toEqual({ start: 1, gennemsnit: -0.25 });
    expect(billigsteVindue([1, 2], 3)).toBeNull();
    expect(billigsteVindue([1, 2], 0)).toBeNull();
  });
});

describe("billigsteIndekser", () => {
  it("returns the n cheapest positions", () => {
    expect([...billigsteIndekser([3, 1, 2, 0, 5], 2)].sort()).toEqual([1, 3]);
    expect(billigsteIndekser([1, 2], 0).size).toBe(0);
  });
});

describe("billigsteNatVindue", () => {
  const dag = (date: string, prices: number[]): DagPriser => ({
    date,
    hours: prices.map((total, hour) => ({ hour, total, spot: 0, nettarif: 0, energinet: 0, elafgift: 0, moms: 0 })),
  });
  const idag = Array.from({ length: 24 }, (_, h) => (h === 22 || h === 23 ? 1 : 3));
  const imorgen = Array.from({ length: 24 }, (_, h) => (h >= 1 && h <= 4 ? 0.5 : h === 0 ? 1 : 3));

  it("spans midnight when tomorrow's prices are known", () => {
    const w = billigsteNatVindue([dag("2026-09-25", idag), dag("2026-09-26", imorgen)], { date: "2026-09-25", hour: 14 })!;
    expect(w).toMatchObject({ startDate: "2026-09-26", startHour: 1, slutDate: "2026-09-26", slutHour: 5, kunIDag: false });
    expect(w.gennemsnit).toBeCloseTo(0.5, 6);
  });

  it("falls back to this evening only before tomorrow's prices are published", () => {
    const w = billigsteNatVindue([dag("2026-09-25", idag)], { date: "2026-09-25", hour: 10 })!;
    expect(w).toMatchObject({ startHour: 20, slutHour: 0, slutDate: "2026-09-26", kunIDag: true });
  });

  it("uses the current night before 08:00", () => {
    const w = billigsteNatVindue([dag("2026-09-26", imorgen)], { date: "2026-09-26", hour: 2 })!;
    expect(w).toMatchObject({ startHour: 2, slutHour: 6 });
  });

  it("returns null with too few hours left", () => {
    expect(billigsteNatVindue([dag("2026-09-26", imorgen)], { date: "2026-09-26", hour: 6 })).toBeNull();
  });
});

describe("time and area helpers", () => {
  it("converts instants to Danish date and hour across DST", () => {
    expect(dkNu(new Date("2026-09-25T22:30:00Z"))).toEqual({ date: "2026-09-26", hour: 0, minute: 30 });
    expect(dkNu(new Date("2026-01-15T23:10:00Z"))).toEqual({ date: "2026-01-16", hour: 0, minute: 10 });
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("maps postcodes to price areas", () => {
    expect(prisomraadeForPostnummer("2100")).toBe("DK2");
    expect(prisomraadeForPostnummer("3700")).toBe("DK2"); // Bornholm
    expect(prisomraadeForPostnummer("5000")).toBe("DK1");
    expect(prisomraadeForPostnummer("8000")).toBe("DK1");
    expect(prisomraadeForPostnummer("80")).toBeNull();
  });
});
