import { describe, expect, test } from "vitest";
import {
  addDays,
  addMonths,
  formatDato,
  formatKort,
  formatLang,
  isIsoDate,
  isoWeekNumber,
  weekEnd,
  weekIndexOf,
  weekStart,
} from "./dato";
import { buildIcs, escapeIcsText, foldIcsLine } from "./ics";
import { celleFor, komprimer, orlovsandel, saetUger, udvid } from "./perioder";
import { afkodPlan, hashMedPlan, kodPlan, planFraHash } from "./del-link";
import { estimerNettoMaaned } from "./netto";

describe("dato", () => {
  test("validates ISO dates strictly", () => {
    expect(isIsoDate("2027-01-04")).toBe(true);
    expect(isIsoDate("2027-02-30")).toBe(false);
    expect(isIsoDate("04-01-2027")).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });

  test("adds days across DST changes without drifting", () => {
    expect(addDays("2027-03-27", 2)).toBe("2027-03-29");
    expect(addDays("2027-10-30", 2)).toBe("2027-11-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  test("adds months and clamps to month end", () => {
    expect(addMonths("2027-01-31", 1)).toBe("2027-02-28");
    expect(addMonths("2027-04-15", -3)).toBe("2027-01-15");
  });

  test("maps leave weeks to dates", () => {
    expect(weekStart("2027-01-04", 0)).toBe("2027-01-04");
    expect(weekEnd("2027-01-04", 0)).toBe("2027-01-10");
    expect(weekStart("2027-01-04", -4)).toBe("2026-12-07");
    expect(weekIndexOf("2027-01-04", "2027-01-10")).toBe(0);
    expect(weekIndexOf("2027-01-04", "2027-01-11")).toBe(1);
    expect(weekIndexOf("2027-01-04", "2027-01-03")).toBe(-1);
  });

  test("formats Danish dates", () => {
    expect(formatLang("2027-01-04")).toBe("mandag den 4. januar 2027");
    expect(formatDato("2027-05-17")).toBe("17. maj 2027");
    expect(formatKort("2027-05-07")).toBe("07.05.2027");
  });

  test("computes ISO week numbers", () => {
    expect(isoWeekNumber("2027-01-04")).toBe(1);
    expect(isoWeekNumber("2026-12-31")).toBe(53);
    expect(isoWeekNumber("2026-09-25")).toBe(39);
  });
});

describe("ics", () => {
  const now = new Date("2026-09-25T10:00:00Z");

  test("builds all-day events with exclusive DTEND and CRLF", () => {
    const ics = buildIcs(
      [{ id: "a-1", title: "Barsel: orlov", start: "2027-01-04", end: "2027-01-17" }],
      "Barselsplan",
      now
    );
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270104");
    expect(ics).toContain("DTEND;VALUE=DATE:20270118");
    expect(ics).toContain("UID:a-1@minberegner.dk");
    expect(ics).toContain("DTSTAMP:20260925T100000Z");
    expect(ics.split("\r\n").filter((l) => l === "BEGIN:VEVENT")).toHaveLength(1);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/\n/);
  });

  test("escapes text", () => {
    expect(escapeIcsText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });

  test("folds long lines at 75 octets, counting UTF-8 bytes", () => {
    const line = `SUMMARY:${"æ".repeat(60)}`;
    const folded = foldIcsLine(line);
    const encoder = new TextEncoder();
    for (const part of folded.split("\r\n")) {
      expect(encoder.encode(part).length).toBeLessThanOrEqual(75);
    }
    expect(folded.split("\r\n ").join("")).toBe(line);
  });
});

describe("perioder", () => {
  test("round-trips runs through the week map", () => {
    const runs = [
      { start: 0, slut: 10, type: "orlov" as const },
      { start: 10, slut: 12, type: "ferie" as const },
    ];
    expect(komprimer(udvid(runs))).toEqual(runs);
  });

  test("sets and clears ranges and merges neighbours", () => {
    let runs = saetUger([], 0, 4, { type: "orlov" });
    runs = saetUger(runs, 4, 6, { type: "orlov" });
    expect(runs).toEqual([{ start: 0, slut: 6, type: "orlov" }]);
    runs = saetUger(runs, 2, 3, null);
    expect(runs).toEqual([
      { start: 0, slut: 2, type: "orlov" },
      { start: 3, slut: 6, type: "orlov" },
    ]);
    runs = saetUger(runs, 3, 5, { type: "deltid", arbejdsProcent: 50 });
    expect(celleFor(runs, 4)).toEqual({ type: "deltid", arbejdsProcent: 50 });
  });

  test("leave share: full, part-time and holiday", () => {
    expect(orlovsandel({ type: "orlov" })).toBe(1);
    expect(orlovsandel({ type: "deltid", arbejdsProcent: 60 })).toBeCloseTo(0.4);
    expect(orlovsandel({ type: "ferie" })).toBe(0);
    expect(orlovsandel(null)).toBe(0);
  });
});

describe("del-link", () => {
  test("round-trips a plan through the hash", async () => {
    const data = { konstellation: "mor-far", navn: "Åse & Søren", uger: [1, 2, 3] };
    const encoded = await kodPlan(data);
    const hash = hashMedPlan(encoded);
    expect(hash.startsWith("#plan=")).toBe(true);
    const extracted = planFraHash(hash);
    expect(extracted).toBe(encoded);
    expect(await afkodPlan(extracted!)).toEqual(data);
  });

  test("rejects garbage", async () => {
    expect(await afkodPlan("zzzz")).toBeNull();
    expect(await afkodPlan("xabc")).toBeNull();
    expect(planFraHash("#andet=1")).toBeNull();
  });
});

describe("netto", () => {
  test("zero income gives zero", () => {
    expect(estimerNettoMaaned({ loen: 0, ydelse: 0 }).netto).toBe(0);
  });

  test("AM-bidrag only applies to salary", () => {
    const loen = estimerNettoMaaned({ loen: 20000, ydelse: 0 });
    const ydelse = estimerNettoMaaned({ loen: 0, ydelse: 20000 });
    expect(loen.amBidrag).toBeCloseTo(1600);
    expect(ydelse.amBidrag).toBe(0);
  });

  test("net is below gross and increases with income", () => {
    const a = estimerNettoMaaned({ loen: 30000, ydelse: 0 });
    const b = estimerNettoMaaned({ loen: 40000, ydelse: 0 });
    expect(a.netto).toBeLessThan(30000);
    expect(b.netto).toBeGreaterThan(a.netto);
    // Plausibility: a 40.000 kr. salary nets roughly 26-29.000 kr. in 2026.
    expect(b.netto).toBeGreaterThan(26000);
    expect(b.netto).toBeLessThan(29500);
  });
});
