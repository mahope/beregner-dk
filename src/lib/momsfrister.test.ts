import { describe, expect, it } from "vitest";
import { erBankdag, momsfristerIcs, momsperiodeForOmsaetning, naesteMomsfrister } from "./momsfrister";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

describe("momsperiodeForOmsaetning", () => {
  it.each([
    [null, "halvaar"],
    [0, "halvaar"],
    [4_999_999, "halvaar"],
    [5_000_000, "kvartal"],
    [50_000_000, "kvartal"],
    [50_000_001, "maaned"],
  ] as const)("%s -> %s", (oms, p) => {
    expect(momsperiodeForOmsaetning(oms)).toBe(p);
  });
});

describe("erBankdag", () => {
  it.each([
    ["2026-11-26", true], // Thursday
    ["2026-11-28", false], // Saturday
    ["2026-12-24", false], // Christmas Eve (Thursday)
    ["2026-12-31", false],
    ["2026-06-05", false], // Constitution Day (Friday)
    ["2026-05-15", false], // Friday after Ascension (14 May 2026)
    ["2026-05-22", true],
  ])("%s -> %s", (d, forventet) => {
    const [y, m, dag] = d.split("-").map(Number);
    expect(erBankdag(new Date(y, m - 1, dag))).toBe(forventet);
  });
});

describe("naesteMomsfrister", () => {
  it("half year from late November 2026", () => {
    const f = naesteMomsfrister("halvaar", new Date(2026, 10, 26));
    expect(f.map((x) => [x.periodeNavn, iso(x.frist)])).toEqual([
      ["2. halvår 2026", "2027-03-01"],
      ["1. halvår 2027", "2027-09-01"],
      ["2. halvår 2027", "2028-03-01"],
    ]);
  });

  it("quarter: deadline on a Saturday moves to Monday", () => {
    // 1 March 2025 is a Saturday -> Monday 3 March.
    const f = naesteMomsfrister("kvartal", new Date(2025, 1, 1), 2);
    expect(f.map((x) => [x.periodeNavn, iso(x.frist)])).toEqual([
      ["4. kvartal 2024", "2025-03-03"],
      ["1. kvartal 2025", "2025-06-02"], // 1 June 2025 is a Sunday
    ]);
  });

  it("month: June is due 17 August and Christmas skips to the next bank day", () => {
    const f = naesteMomsfrister("maaned", new Date(2026, 6, 1), 6);
    expect(f.map((x) => [x.periodeNavn, iso(x.frist)])).toEqual([
      ["Juni 2026", "2026-08-17"],
      ["Juli 2026", "2026-08-25"],
      ["August 2026", "2026-09-25"],
      ["September 2026", "2026-10-26"], // 25 Oct is a Sunday
      ["Oktober 2026", "2026-11-25"],
      ["November 2026", "2026-12-28"], // 25-27 Dec closed
    ]);
  });

  it("includes a deadline on the day itself", () => {
    const f = naesteMomsfrister("halvaar", new Date(2026, 8, 1, 23, 59), 1);
    expect(iso(f[0].frist)).toBe("2026-09-01");
    expect(f[0].periodeNavn).toBe("1. halvår 2026");
  });
});

describe("momsfristerIcs", () => {
  const frister = naesteMomsfrister("halvaar", new Date(2026, 10, 26), 2);
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
