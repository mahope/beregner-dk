import { describe, test, expect } from "vitest";
import { beregnNedtaelling, nedtaellingTimer } from "./nedtaelling";

describe("beregnNedtaelling", () => {
  test("returns null for invalid dates", () => {
    expect(beregnNedtaelling("not-a-date", "2026-01-01")).toBeNull();
    expect(beregnNedtaelling("2026-02-31", "2026-03-01")).toBeNull();
  });

  test("counts days to a future date", () => {
    const r = beregnNedtaelling("2026-07-07", "2026-07-17")!;
    expect(r.dage).toBe(10);
    expect(r.uger).toBe(1);
    expect(r.restDage).toBe(3);
    expect(r.erFortid).toBe(false);
  });

  test("marks a past date", () => {
    const r = beregnNedtaelling("2026-07-07", "2026-07-01")!;
    expect(r.dage).toBe(6);
    expect(r.erFortid).toBe(true);
  });

  test("same day is zero", () => {
    const r = beregnNedtaelling("2026-07-07", "2026-07-07")!;
    expect(r.dage).toBe(0);
    expect(r.erFortid).toBe(false);
  });

  test("counts across a year boundary", () => {
    const r = beregnNedtaelling("2026-12-25", "2027-01-01")!;
    expect(r.dage).toBe(7);
    expect(r.uger).toBe(1);
    expect(r.restDage).toBe(0);
  });
});

/**
 * Timetallet svarer på «hvor mange timer er der til <datoen>» — et af de ti
 * hyppigste autocomplete-forslag under både «hvor mange timer er der til jul»
 * og «…til juleaften». Porten låser opløsningen og afgrænsningen, og at
 * den besøgendes ur måler: server-time (typisk UTC) ville svare forkert.
 *
 * `now` bygges som forskydning fra datoens *lokale* midnat, så testen giver
 * det samme svar i alle tidszoner.
 */
describe("nedtaellingTimer", () => {
  function lokalMidnat(iso: string): Date {
    return new Date(
      Number(iso.slice(0, 4)),
      Number(iso.slice(5, 7)) - 1,
      Number(iso.slice(8, 10))
    );
  }

  test("regner hele timer og resterende minutter", () => {
    const tilTid = Date.UTC(2026, 11, 25);
    const maal = lokalMidnat("2026-12-25");
    const nu = new Date(maal.getTime() - 2 * 3_600_000 - 30 * 60_000);
    expect(nedtaellingTimer(tilTid, nu)).toEqual({ timer: 2, minutter: 30 });
  });

  test("minutterne runder aldrig timerne op", () => {
    const tilTid = Date.UTC(2026, 11, 31);
    const maal = lokalMidnat("2026-12-31");
    expect(
      nedtaellingTimer(tilTid, new Date(maal.getTime() - 3_600_000 - 1_000))
    ).toEqual({ timer: 1, minutter: 0 });
    // 59 sekunder er stadig nul hele minutter, ikke ét.
    expect(nedtaellingTimer(tilTid, new Date(maal.getTime() - 59_000))).toEqual({
      timer: 0,
      minutter: 0,
    });
    // Er der 61 sekunder tilbage, er der ét helt minut — ikke to timer.
    expect(nedtaellingTimer(tilTid, new Date(maal.getTime() - 61_000))).toEqual({
      timer: 0,
      minutter: 1,
    });
  });

  test("dagen i dag tælles ikke med: midnat giver 0 timer til datoen selv", () => {
    const tilTid = Date.UTC(2026, 11, 25);
    expect(nedtaellingTimer(tilTid, lokalMidnat("2026-12-25"))).toEqual({
      timer: 0,
      minutter: 0,
    });
  });

  test("en passeret dato giver 0, aldrig et negativt tal", () => {
    const tilTid = Date.UTC(2026, 11, 25);
    expect(
      nedtaellingTimer(tilTid, lokalMidnat("2026-12-27"))
    ).toEqual({ timer: 0, minutter: 0 });
  });

  test("timer og dage peger på det samme mål", () => {
    const tilTid = Date.UTC(2026, 11, 25);
    const maal = lokalMidnat("2026-12-25");
    const nu = new Date(maal.getTime() - 24 * 30 * 3_600_000);
    const r = beregnNedtaelling("2026-11-25", "2026-12-25")!;
    expect(nedtaellingTimer(r.tilTid, nu).timer).toBe(24 * 30);
  });

  test("resultatet bærer måldatoen, så timetallet kan regnes", () => {
    const r = beregnNedtaelling("2026-07-07", "2026-07-17")!;
    expect(r.tilTid).toBe(Date.UTC(2026, 6, 17));
  });
});
