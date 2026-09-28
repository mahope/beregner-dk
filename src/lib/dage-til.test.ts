import { describe, expect, test } from "vitest";
import {
  DAGE_TIL_EVENTS,
  dageTilbageIAaret,
  daysBetween,
  easterSunday,
  formatTargetDate,
  getDageTilAnswer,
  getDageTilEventBySlug,
  getDageTilSlugs,
  getNextAnchorDate,
  isDageTilLocale,
  midsommarafton,
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

describe("midsommarafton", () => {
  test.each([
    [2024, "2024-06-21"],
    [2025, "2025-06-20"],
    [2026, "2026-06-19"],
    [2027, "2027-06-25"],
    [2028, "2028-06-23"],
    [2030, "2030-06-21"],
  ])("midsommarafton i %i er %s", (year, expected) => {
    expect(toISO(midsommarafton(year))).toBe(expected);
  });

  test("er altid en fredag mellem 19. og 25. juni", () => {
    for (let year = 1990; year <= 2050; year++) {
      const date = midsommarafton(year);
      expect(date.getUTCDay()).toBe(5);
      expect(date.getUTCMonth()).toBe(5);
      expect(date.getUTCDate()).toBeGreaterThanOrEqual(19);
      expect(date.getUTCDate()).toBeLessThanOrEqual(25);
    }
  });

  test("offset 1 er lørdagen efter, altså midsommardagen", () => {
    for (let year = 2024; year <= 2032; year++) {
      const dag = midsommarafton(year, 1);
      expect(dag.getUTCDay()).toBe(6);
      expect(dag.getTime() - midsommarafton(year).getTime()).toBe(dayMs);
      expect(dag.getUTCDate()).toBeGreaterThanOrEqual(20);
      expect(dag.getUTCDate()).toBeLessThanOrEqual(26);
    }
  });

  test("de to events ligger præcis én dag fra hinanden i begge sprog", () => {
    const afton = DAGE_TIL_EVENTS.find((e) => e.id === "midsommarafton");
    const dagen = DAGE_TIL_EVENTS.find((e) => e.id === "midsommardagen");
    expect(afton).toBeDefined();
    expect(dagen).toBeDefined();
    for (const locale of ["da", "se"] as const) {
      const fra = getNextAnchorDate(afton!.anchor[locale], iso("2027-01-15"));
      const til = getNextAnchorDate(dagen!.anchor[locale], iso("2027-01-15"));
      expect((til.getTime() - fra.getTime()) / dayMs).toBe(1);
      expect(toISO(fra)).toBe("2027-06-25");
      expect(toISO(til)).toBe("2027-06-26");
    }
  });

  test("begge sprog har deres eget slug med sit eget spørgsmål", () => {
    const afton = DAGE_TIL_EVENTS.find((e) => e.id === "midsommarafton");
    const dagen = DAGE_TIL_EVENTS.find((e) => e.id === "midsommardagen");
    expect(getDageTilSlugs("da")).toContain("sankthansaftensdag");
    expect(getDageTilSlugs("da")).toContain("sankthansdag");
    expect(getDageTilSlugs("se")).toContain("midsommarafton");
    expect(getDageTilSlugs("se")).toContain("midsommardagen");
    expect(getDageTilEventBySlug("midsommarafton", "se")?.id).toBe("midsommarafton");
    expect(getDageTilEventBySlug("sankthansaftensdag", "da")?.id).toBe("midsommarafton");
    for (const event of [afton!, dagen!]) {
      for (const locale of ["da", "se"] as const) {
        expect(event[locale].copy.question).toContain(event[locale].copy.short);
      }
    }
  });

  test("et dansk slug på beraknare.se løser til den svenske side, og omvendt", () => {
    expect(resolveDageTilSlug("sankthansaftensdag", "se")?.localeSlug).toBe(
      "midsommarafton"
    );
    expect(resolveDageTilSlug("midsommarafton", "da")?.localeSlug).toBe(
      "sankthansaftensdag"
    );
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

  test("Halloween er fast 31. oktober i begge sprog", () => {
    const halloween = DAGE_TIL_EVENTS.find((e) => e.id === "halloween");
    expect(halloween).toBeDefined();
    for (const locale of ["da", "se"] as const) {
      expect(halloween!.anchor[locale]).toMatchObject({
        kind: "fixed",
        month: 10,
        day: 31,
      });
      expect(getDageTilSlugs(locale)).toContain(halloween![locale].slug);
      expect(halloween![locale].copy.question).toContain(
        halloween![locale].copy.short
      );
    }
  });

  test("Halloween ligger præcis én dag før 1. november — den forveksling, siden advarer om", () => {
    const halloween = DAGE_TIL_EVENTS.find((e) => e.id === "halloween")!;
    for (const locale of ["da", "se"] as const) {
      const svar = getDageTilAnswer(halloween, locale, iso("2026-09-27"));
      expect(toISO(svar.targetDate)).toBe("2026-10-31");
      expect(svar.days).toBe(34);
      expect(svar.weeks).toBe(4);
      expect(svar.daysLeft).toBe(6);
      expect(daysBetween(svar.targetDate, iso("2026-11-01"))).toBe(1);
    }
  });

  test("skriver den forvekslede dato ud i begge sprog, med hvert sprog egen notation", () => {
    // Svensk skriver "1 november", dansk "1. november" — derfor pr. sprog og ikke
    // én fælles streng, ellers låser den kun det ene sprog.
    const halloween = DAGE_TIL_EVENTS.find((e) => e.id === "halloween")!;
    const foerveksling = { da: "1. november", se: "1 november" } as const;
    for (const locale of ["da", "se"] as const) {
      const tekst = [
        ...halloween[locale].copy.facts,
        ...halloween[locale].copy.faq.map((item) => `${item.question} ${item.answer}`),
      ].join(" ");
      expect(tekst).toContain(foerveksling[locale]);
    }
  });

  test("står på 0 på selve Halloween og ruller først til næste år", () => {
    const halloween = DAGE_TIL_EVENTS.find((e) => e.id === "halloween")!;
    for (const locale of ["da", "se"] as const) {
      const iDag = getDageTilAnswer(halloween, locale, iso("2026-10-31"));
      expect(iDag.days).toBe(0);
      expect(iDag.isToday).toBe(true);
      // 1. november er dagen efter: først næste Halloween.
      expect(toISO(getDageTilAnswer(halloween, locale, iso("2026-11-01")).targetDate)).toBe(
        "2027-10-31"
      );
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

describe("dageTilbageIAaret", () => {
  test("tæller dagene til og med 31. december", () => {
    // 27. september 2026 → 31. december 2026
    const svar = dageTilbageIAaret(new Date("2026-09-27T10:00:00Z"));
    expect(svar.year).toBe(2026);
    expect(svar.dage).toBe(95);
    expect(svar.uger).toBe(13);
    expect(svar.dageEfterUger).toBe(4);
    expect(svar.sidsteDag.toISOString()).toBe("2026-12-31T00:00:00.000Z");
  });

  test("står på 0 nytårsaften, fordi det sidste døgn er 31. december", () => {
    const svar = dageTilbageIAaret(new Date("2026-12-31T23:59:00Z"));
    expect(svar.dage).toBe(0);
    expect(svar.uger).toBe(0);
  });

  test("tæller 365 dage fra 1. januar i et almindeligt år", () => {
    const svar = dageTilbageIAaret(new Date("2026-01-01T00:00:00Z"));
    expect(svar.dage).toBe(364);
    expect(dageTilbageIAaret(new Date("2026-01-02T00:00:00Z")).dage).toBe(363);
  });

  test("tæller 366 dage i et skudår, fordi 29. februar er med", () => {
    const skud = dageTilbageIAaret(new Date("2028-01-01T00:00:00Z"));
    expect(skud.year).toBe(2028);
    expect(skud.dage).toBe(365);
    expect(dageTilbageIAaret(new Date("2028-03-01T00:00:00Z")).dage).toBe(305);
  });

  test("tager ikke hensyn til klokkeslættet i døgnet", () => {
    const morgen = dageTilbageIAaret(new Date("2026-09-27T00:01:00Z"));
    const aftenaar = dageTilbageIAaret(new Date("2026-09-27T23:59:00Z"));
    expect(morgen.dage).toBe(aftenaar.dage);
  });
});
