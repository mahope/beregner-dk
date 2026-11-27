import { describe, expect, it } from "vitest";
import { fristerFraCvrradar, isoDato, momsfristerIcs } from "./momsfrister";

const dato = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

describe("isoDato", () => {
  it("reads a calendar date as a local date", () => {
    expect(dato(isoDato("2027-03-01")!)).toBe("2027-3-1");
  });

  it.each(["2027-02-30", "2027-13-01", "1/3/2027", "", null, 20270301])("rejects %s", (v) => {
    expect(isoDato(v)).toBeNull();
  });
});

describe("fristerFraCvrradar", () => {
  it("uses cvrradar's dates as they are and names half years", () => {
    const f = fristerFraCvrradar("halvaar", [
      { fra: "2026-07-01", til: "2026-12-31", frist: "2027-03-01" },
      { fra: "2027-01-01", til: "2027-06-30", frist: "2027-09-01" },
    ]);
    expect(f.map((x) => x.periodeNavn)).toEqual(["2. halvår 2026", "1. halvår 2027"]);
    expect(f.map((x) => dato(x.frist))).toEqual(["2027-3-1", "2027-9-1"]);
    expect(dato(f[0].periodeSlut)).toBe("2026-12-31");
  });

  it("names quarters and months", () => {
    expect(fristerFraCvrradar("kvartal", [{ fra: "2026-07-01", til: "2026-09-30", frist: "2026-12-01" }])[0].periodeNavn).toBe(
      "3. kvartal 2026",
    );
    // A deadline cvrradar moved to a bank day (25 Dec -> 28 Dec) is not recomputed here.
    const m = fristerFraCvrradar("maaned", [{ fra: "2026-11-01", til: "2026-11-30", frist: "2026-12-28" }])[0];
    expect(m.periodeNavn).toBe("November 2026");
    expect(dato(m.frist)).toBe("2026-12-28");
  });

  it("drops entries with bad dates", () => {
    expect(
      fristerFraCvrradar("kvartal", [
        { fra: "2026-07-01", til: "2026-09-30", frist: "2026-12-32" },
        { fra: "x", til: "2026-09-30", frist: "2026-12-01" },
      ]),
    ).toEqual([]);
  });
});

describe("momsfristerIcs", () => {
  const frister = fristerFraCvrradar("halvaar", [
    { fra: "2026-07-01", til: "2026-12-31", frist: "2027-03-01" },
    { fra: "2027-01-01", til: "2027-06-30", frist: "2027-09-01" },
  ]);
  const ics = momsfristerIcs(frister, { cvr: "39413892", navn: "Mahope, Aarhus; test", nu: new Date(Date.UTC(2026, 10, 26, 12, 0, 0)) });

  it("is a valid calendar with one all-day event per deadline", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270301\r\nDTEND;VALUE=DATE:20270302");
    expect(ics).toContain("DTSTAMP:20261126T120000Z");
    expect(ics).toContain("UID:moms-39413892-20261231@minberegner.dk");
    expect(ics).toContain("SUMMARY:Momsfrist: 2. halvår 2026");
  });

  it("escapes text and folds long lines at 75 octets", () => {
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain("Mahope\\, Aarhus\\; test (CVR 39413892)");
    const enc = new TextEncoder();
    for (const linje of ics.split("\r\n")) expect(enc.encode(linje).length).toBeLessThanOrEqual(75);
  });
});
