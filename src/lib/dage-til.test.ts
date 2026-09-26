import { describe, expect, test } from "vitest";
import {
  DAGE_TIL_EVENTS,
  daysBetween,
  easterSunday,
  formatTargetDate,
  getDageTilAnswer,
  getDageTilEventBySlug,
  getDageTilSlugs,
  getNextAnchorDate,
  isDageTilLocale,
  resolveDageTilSlug,
} from "./dage-til";

const iso = (value: string) => new Date(`${value}T00:00:00.000Z`);
const dayMs = 86_400_000;
const toISO = (date: Date) => date.toISOString().slice(0, 10);

describe("easterSunday", () => {
  test.each([
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
    [2028, "2028-04-16"],
    [2000, "2000-04-23"],
    [2100, "2100-03-28"],
  ])("påskedagen i %i er %s", (year, expected) => {
    expect(toISO(easterSunday(year))).toBe(expected);
  });

  test("er altid en søndag", () => {
    for (let year = 1990; year <= 2050; year++) {
      expect(easterSunday(year).getUTCDay()).toBe(0);
    }
  });
});

describe("daysBetween", () => {
  test("tæller hele dage uden at tælle dagen i dag med", () => {
    expect(daysBetween(iso("2026-09-25"), iso("2026-09-26"))).toBe(1);
    expect(daysBetween(iso("2026-09-25"), iso("2026-09-25"))).toBe(0);
    expect(daysBetween(iso("2026-09-25"), iso("2026-10-25"))).toBe(30);
  });

  test("krydser skudårsgrænsen", () => {
    expect(daysBetween(iso("2028-02-28"), iso("2028-03-01"))).toBe(2);
  });

  test("ignorerer kloktidspunktet på dagen", () => {
    const morning = new Date("2026-09-25T06:00:00.000Z");
    const evening = new Date("2026-09-25T23:59:00.000Z");
    expect(daysBetween(morning, iso("2026-09-27"))).toBe(2);
    expect(daysBetween(evening, iso("2026-09-27"))).toBe(2);
  });
});

describe("getNextAnchorDate", () => {
  const juledagen = DAGE_TIL_EVENTS[0].anchor.da;

  test("giver den næste forekomst i samme år", () => {
    expect(toISO(getNextAnchorDate(juledagen, iso("2026-09-25")))).toBe(
      "2026-12-25"
    );
  });

  test("skifter til næste år når datoen er passeret", () => {
    expect(toISO(getNextAnchorDate(juledagen, iso("2026-12-26")))).toBe(
      "2027-12-25"
    );
  });

  test("beholder dagens dato som nul dage i stedet for at rulle videre", () => {
    expect(toISO(getNextAnchorDate(juledagen, iso("2026-12-25")))).toBe(
      "2026-12-25"
    );
  });

  test("udregner computérbare datoer fra påskedagen", () => {
    const skaertorsdag = DAGE_TIL_EVENTS.find((e) => e.id === "skaertorsdag")!;
    expect(toISO(getNextAnchorDate(skaertorsdag.anchor.da, iso("2026-01-01")))).toBe(
      "2026-04-02"
    );
    const paskedag = DAGE_TIL_EVENTS.find((e) => e.id === "paskedag")!;
    expect(toISO(getNextAnchorDate(paskedag.anchor.da, iso("2026-01-01")))).toBe(
      "2026-04-05"
    );
    expect(toISO(getNextAnchorDate(paskedag.anchor.da, iso("2026-04-06")))).toBe(
      "2027-03-28"
    );
  });

  test("de faste datoer ligger på den kalenderdag loven angiver", () => {
    const grundlovsdag = DAGE_TIL_EVENTS.find((e) => e.id === "grundlovsdag")!;
    expect(grundlovsdag.anchor.da).toMatchObject({ kind: "fixed", month: 6, day: 5 });
    expect(grundlovsdag.anchor.se).toMatchObject({ kind: "fixed", month: 6, day: 6 });
  });
});

describe("getDageTilAnswer", () => {
  const juledagen = DAGE_TIL_EVENTS[0].anchor.da;

  test("tæller dage, uger og restdage", () => {
    const answer = getDageTilAnswer(DAGE_TIL_EVENTS[0], "da", iso("2026-09-25"));
    expect(answer.days).toBe(91);
    expect(answer.weeks).toBe(13);
    expect(answer.daysLeft).toBe(0);
    expect(answer.isToday).toBe(false);
  });

  test("deler dage i hele uger plus restdage", () => {
    const answer = getDageTilAnswer(DAGE_TIL_EVENTS[0], "da", iso("2026-09-23"));
    expect(answer.days).toBe(93);
    expect(answer.weeks).toBe(13);
    expect(answer.daysLeft).toBe(2);
  });

  test("markerer dagen selv som nul dage", () => {
    const answer = getDageTilAnswer(DAGE_TIL_EVENTS[0], "da", iso("2026-12-25"));
    expect(answer.days).toBe(0);
    expect(answer.isToday).toBe(true);
  });

  test("beregner på tværs af DST-skift", () => {
    const answer = getDageTilAnswer(DAGE_TIL_EVENTS[0], "da", new Date("2026-10-24T23:30:00.000Z"));
    expect(answer.days).toBe(62);
  });
});

describe("formatTargetDate", () => {
  test("bruger dansk datoformat", () => {
    expect(formatTargetDate(iso("2026-12-01"), "da")).toBe("1. december");
  });

  test("bruger svenskt datoformat", () => {
    expect(formatTargetDate(iso("2026-12-01"), "se")).toBe("1 december");
  });
});

describe("slug-opløsning", () => {
  test("danske slugs er danske", () => {
    expect(isDageTilLocale("da")).toBe(true);
    expect(getDageTilEventBySlug("juledagen", "da")?.id).toBe("juledagen");
  });

  test("svenske slugs er svenske", () => {
    expect(getDageTilEventBySlug("juldagen", "se")?.id).toBe("juledagen");
  });

  test("et dansk slug på det svenske domæne peger på den svenske variant", () => {
    const resolved = resolveDageTilSlug("juledagen", "se");
    expect(resolved?.localeSlug).toBe("juldagen");
    expect(resolved?.isOwnLocale).toBe(false);
  });

  test("et svenskt slug på det danske domæne peger på den danske variant", () => {
    const resolved = resolveDageTilSlug("juldagen", "da");
    expect(resolved?.localeSlug).toBe("juledagen");
    expect(resolved?.isOwnLocale).toBe(false);
  });

  test("eget slug er ikke et redirect", () => {
    expect(resolveDageTilSlug("juledagen", "da")?.isOwnLocale).toBe(true);
    expect(resolveDageTilSlug("juldagen", "se")?.isOwnLocale).toBe(true);
  });

  test("ukendte slugs giver undefined", () => {
    expect(resolveDageTilSlug("tacohoedag", "da")).toBeUndefined();
    expect(getDageTilEventBySlug("tacohoedag", "da")).toBeUndefined();
  });

  test("norsk locale har ingen dage-til-sider", () => {
    expect(isDageTilLocale("no")).toBe(false);
    expect(getDageTilSlugs("no")).toEqual([]);
    expect(getDageTilEventBySlug("juledagen", "no")).toBeUndefined();
  });

  test("alle events har unikke slugs pr. locale og samme antal sider i begge sprog", () => {
    const da = getDageTilSlugs("da");
    const se = getDageTilSlugs("se");
    expect(da).toHaveLength(se.length);
    expect(new Set(da).size).toBe(da.length);
    expect(new Set(se).size).toBe(se.length);
    expect(da).toContain("1-december");
    expect(se).toContain("1-december");
  });

  test("alle events har spørgsmål og mindst to fakta i begge sprog", () => {
    for (const event of DAGE_TIL_EVENTS) {
      for (const locale of ["da", "se"] as const) {
        expect(event[locale].copy.question).toContain("?");
        expect(event[locale].copy.facts.length).toBeGreaterThanOrEqual(2);
        expect(event[locale].copy.faq.length).toBeGreaterThanOrEqual(3);
        expect(event[locale].copy.faq.every((item) => item.answer.length > 20)).toBe(true);
      }
    }
  });

  test("hver event har et unikt id", () => {
    expect(new Set(DAGE_TIL_EVENTS.map((e) => e.id)).size).toBe(DAGE_TIL_EVENTS.length);
  });

  test("juleaften ligger præcis én dag før juledagen i begge sprog", () => {
    const juleaften = DAGE_TIL_EVENTS.find((e) => e.id === "juleaften");
    const juledagen = DAGE_TIL_EVENTS.find((e) => e.id === "juledagen");
    expect(juleaften).toBeDefined();
    expect(juledagen).toBeDefined();
    for (const locale of ["da", "se"] as const) {
      expect(getDageTilSlugs(locale)).toContain(juleaften![locale].slug);
      expect(juleaften![locale].copy.question).toContain(juleaften![locale].copy.short);
      const from = getNextAnchorDate(juleaften!.anchor[locale], iso("2026-09-25"));
      const to = getNextAnchorDate(juledagen!.anchor[locale], iso("2026-09-25"));
      expect((to.getTime() - from.getTime()) / dayMs).toBe(1);
      expect(getDageTilAnswer(juleaften!, locale, iso("2026-09-25")).days).toBe(90);
    }
  });
});

describe("dato-anker", () => {
  test("alle computérbare events ligger i et realistisk interval", () => {
    for (const event of DAGE_TIL_EVENTS) {
      const anchor = getNextAnchorDate(event.anchor.da, iso("2026-09-25"));
      const days = (anchor.getTime() - iso("2026-09-25").getTime()) / dayMs;
      expect(days).toBeGreaterThanOrEqual(0);
      expect(days).toBeLessThan(400);
    }
  });
});
