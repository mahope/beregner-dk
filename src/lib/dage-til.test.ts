import { describe, expect, test } from "vitest";
import {
  DAGE_TIL_EVENTS,
  dageTilbageIAaret,
  daysBetween,
  easterSunday,
  formatTargetDate,
  forstaAdvent,
  getDageTilAnswer,
  getDageTilEventBySlug,
  getDageTilEvents,
  getDageTilSlugs,
  getNextAnchorDate,
  isDageTilLocale,
  midsommarafton,
  resolveDageTilSlug,
  sommerferieStart,
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
    }
    // Dansk sankthans er fast 23./24. juni; svensk midsummer er fredagen mellem
    // 19. og 25. juni. I 2027 er de to sprog derfor på hver sin dato.
    expect(toISO(getNextAnchorDate(afton!.anchor.da, iso("2027-01-15")))).toBe("2027-06-23");
    expect(toISO(getNextAnchorDate(dagen!.anchor.da, iso("2027-01-15")))).toBe("2027-06-24");
    expect(toISO(getNextAnchorDate(afton!.anchor.se, iso("2027-01-15")))).toBe("2027-06-25");
    expect(toISO(getNextAnchorDate(dagen!.anchor.se, iso("2027-01-15")))).toBe("2027-06-26");
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

describe("forstaAdvent", () => {
  test.each([
    [2024, "2024-12-01"],
    [2025, "2025-11-30"],
    [2026, "2026-11-29"],
    [2027, "2027-11-28"],
    [2028, "2028-12-03"],
    [2029, "2029-12-02"],
    [2033, "2033-11-27"],
  ])("1. advent i %i er %s", (year, expected) => {
    expect(toISO(forstaAdvent(year))).toBe(expected);
  });

  test("er altid en søndag mellem 27. november og 3. december", () => {
    for (let year = 1990; year <= 2050; year++) {
      const date = forstaAdvent(year);
      expect(date.getUTCDay()).toBe(0);
      const monthDay = `${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
      expect(monthDay === "11-27" || monthDay === "11-28" || monthDay === "11-29" ||
        monthDay === "11-30" || monthDay === "12-1" || monthDay === "12-2" ||
        monthDay === "12-3").toBe(true);
    }
  });

  test("advent har fire søndage, så den fjerde ligger mellem 18. og 24. december", () => {
    for (let year = 1990; year <= 2050; year++) {
      const tredje = forstaAdvent(year, 14);
      const fjerde = forstaAdvent(year, 21);
      expect(fjerde.getUTCDay()).toBe(0);
      expect(fjerde.getTime() - forstaAdvent(year).getTime()).toBe(21 * dayMs);
      expect(fjerde.getUTCMonth()).toBe(11);
      expect(fjerde.getUTCDate()).toBeGreaterThanOrEqual(18);
      expect(fjerde.getUTCDate()).toBeLessThanOrEqual(24);
      expect(tredje.getTime()).toBeLessThan(fjerde.getTime());
    }
  });

  test("eventet ligger præcis på 1. advent i begge sprog", () => {
    const advent = DAGE_TIL_EVENTS.find((e) => e.id === "advent");
    expect(advent).toBeDefined();
    for (const locale of ["da", "se"] as const) {
      const anchor = advent!.anchor[locale];
      expect(anchor.kind).toBe("advent");
      expect(toISO(getNextAnchorDate(anchor, iso("2026-09-25")))).toBe("2026-11-29");
      // Efter 1. advent er næste søndag 2. advent — altså ikke 1. december.
      expect(toISO(getNextAnchorDate(anchor, iso("2026-11-29")))).toBe("2026-11-29");
      expect(toISO(getNextAnchorDate(anchor, iso("2026-11-30")))).toBe("2027-11-28");
    }
    expect(getDageTilSlugs("da")).toContain("1-advent");
    expect(getDageTilSlugs("se")).toContain("1-advent");
    expect(getDageTilEventBySlug("1-advent", "se")?.id).toBe("advent");
  });
});

describe("påskafton", () => {
  test.each([
    [2024, "2024-03-29"],
    [2025, "2025-04-18"],
    [2026, "2026-04-03"],
    [2027, "2027-03-26"],
    [2028, "2028-04-14"],
  ])("påskafton i %i er %s", (year, expected) => {
    expect(toISO(getNextAnchorDate({ kind: "easterOffset", month: 0, day: 0, offsetDays: -2 }, iso(`${year}-01-01`)))).toBe(expected);
  });

  test("er altid en fredag to dage før påskedagen", () => {
    for (let year = 1990; year <= 2050; year++) {
      const dato = new Date(Date.UTC(year, 0, 1));
      const fredag = getNextAnchorDate(
        { kind: "easterOffset", month: 0, day: 0, offsetDays: -2 },
        dato
      );
      expect(fredag.getUTCDay()).toBe(5);
      expect((easterSunday(year).getTime() - fredag.getTime()) / dayMs).toBe(2);
    }
  });

  test("ligger mellem skærtorsdag og påskedag i begge sprog", () => {
    const paskafton = DAGE_TIL_EVENTS.find((e) => e.id === "paskafton");
    const skaertorsdag = DAGE_TIL_EVENTS.find((e) => e.id === "skaertorsdag");
    const paskedag = DAGE_TIL_EVENTS.find((e) => e.id === "paskedag");
    expect(paskafton).toBeDefined();
    expect(skaertorsdag).toBeDefined();
    expect(paskedag).toBeDefined();
    const iDag = iso("2027-01-15");
    for (const locale of ["da", "se"] as const) {
      const torsdag = getNextAnchorDate(skaertorsdag!.anchor[locale], iDag);
      const fredag = getNextAnchorDate(paskafton!.anchor[locale], iDag);
      const sondag = getNextAnchorDate(paskedag!.anchor[locale], iDag);
      expect(sondag.getTime() - fredag.getTime()).toBeLessThanOrEqual(2 * dayMs);
      expect(fredag.getTime()).toBeGreaterThan(torsdag.getTime());
    }
    // Dansk langfredag er påskedag minus 2 dage, svensk påskafton minus 1.
    expect(toISO(getNextAnchorDate(paskafton!.anchor.da, iDag))).toBe("2027-03-26");
    expect(toISO(getNextAnchorDate(paskafton!.anchor.se, iDag))).toBe("2027-03-27");
  });

  test("begge sprog har deres eget slug, og de to navne er hver sin dato", () => {
    const paskafton = DAGE_TIL_EVENTS.find((e) => e.id === "paskafton");
    expect(getDageTilSlugs("da")).toContain("langfredag");
    expect(getDageTilSlugs("se")).toContain("paskafton");
    // Svensk påskafton er lørdagen, dansk langfredag er fredagen dagen før —
    // de er to forskellige datoer, så hvert sprog har sit eget slug.
    expect(paskafton!.da.slug).toBe("langfredag");
    expect(paskafton!.se.slug).toBe("paskafton");
    expect(resolveDageTilSlug("langfredag", "se")?.localeSlug).toBe("paskafton");
    expect(resolveDageTilSlug("paskafton", "da")?.localeSlug).toBe("langfredag");
    for (const locale of ["da", "se"] as const) {
      expect(paskafton![locale].copy.question).toContain(
        paskafton![locale].copy.short
      );
    }
  });

  test("begge sprog kalder den anden, så læseren ikke tror de er samme dag", () => {
    const paskafton = DAGE_TIL_EVENTS.find((e) => e.id === "paskafton");
    expect(paskafton!.se.copy.facts.join(" ")).toContain("Långfredagen");
    expect(paskafton!.se.copy.facts.join(" ")).toContain("1 dag före");
  });
});

describe("valborg", () => {
  test("er fast 30. april i begge sprog", () => {
    const valborg = DAGE_TIL_EVENTS.find((e) => e.id === "valborg");
    expect(valborg).toBeDefined();
    for (const locale of ["da", "se"] as const) {
      expect(valborg!.anchor[locale]).toEqual({
        kind: "fixed",
        month: 4,
        day: 30,
        offsetDays: 0,
      });
      expect(toISO(getNextAnchorDate(valborg!.anchor[locale], iso("2026-09-25")))).toBe(
        "2027-04-30"
      );
      expect(toISO(getNextAnchorDate(valborg!.anchor[locale], iso("2026-04-29")))).toBe(
        "2026-04-30"
      );
    }
    expect(getDageTilSlugs("da")).toContain("valborg");
    expect(getDageTilSlugs("se")).toContain("valborg");
  });

  test("ligger altid EFTER askonsdagen, aldrig før", () => {
    // Askonsdagen er påskedag minus 46 dage; valborg ligger fast 30. april.
    const afstand = (year: number) =>
      (Date.UTC(year, 3, 30) - (easterSunday(year).getTime() - 46 * dayMs)) / dayMs;
    // Det tætte år er 2038 (51 dage), det vide 2035 (82 dage). Begge er
    // positive — valborg kan aldrig ligge før askonsdagen.
    let min = Infinity;
    let max = -Infinity;
    for (let year = 2024; year <= 2045; year++) {
      expect(afstand(year)).toBeGreaterThan(0);
      min = Math.min(min, afstand(year));
      max = Math.max(max, afstand(year));
    }
    expect(min).toBe(51);
    expect(max).toBe(82);
    expect(afstand(2027)).toBe(79);
    // Begge sprog skal sige de samme tal, ellers kan den ene sprogside
    // modsige den anden (C84's fejlklasse).
    const valborg = DAGE_TIL_EVENTS.find((e) => e.id === "valborg")!;
    for (const locale of ["da", "se"] as const) {
      const tekst = [
        ...valborg[locale].copy.facts,
        ...valborg[locale].copy.faq.map((f) => `${f.question} ${f.answer}`),
      ].join(" ");
      expect(tekst).toContain(locale === "da" ? "30. april" : "30 april");
      expect(tekst).toMatch(/51-82 dage|51-82 dagar/);
      expect(tekst).toMatch(/79 dage efter|79 dagar efter/);
      // Den gamle fejltagelse låste fast: 14. februar må ikke komme tilbage.
      expect(tekst).not.toMatch(/14\. februar|14 februari/);
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
    const evening = new Date("2026-09-25T20:00:00.000Z");
    expect(daysBetween(morning, iso("2026-09-27"))).toBe(2);
    expect(daysBetween(evening, iso("2026-09-27"))).toBe(2);
  });

  test("tæller dagen i København, så 00:30 ikke er i går", () => {
    // 00:30 dansk tid 26. september er 22:30 UTC 25. september. En UTC-tælling
    // ville svare 2, fordi den læser 25. september.
    const halvToOmMorgen = new Date("2026-09-25T22:30:00.000Z");
    expect(daysBetween(halvToOmMorgen, iso("2026-09-27"))).toBe(1);
    // Samme øjeblik som dansk aften 25. september (23:00 UTC) giver 2 dage.
    const danskAften = new Date("2026-09-25T21:00:00.000Z");
    expect(daysBetween(danskAften, iso("2026-09-27"))).toBe(2);
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
    // 01:30 dansk tid 25. oktober er 23:30 UTC 24. oktober. Tællingen skal
    // læse kalenderdagen i København, ellers vinder den gamle for ved.
    const answer = getDageTilAnswer(DAGE_TIL_EVENTS[0], "da", new Date("2026-10-24T23:30:00.000Z"));
    expect(answer.days).toBe(61);
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

  test("alle events har unikke slugs pr. locale", () => {
    const da = getDageTilSlugs("da");
    const se = getDageTilSlugs("se");
    expect(new Set(da).size).toBe(da.length);
    expect(new Set(se).size).toBe(se.length);
    expect(da).toContain("1-december");
    expect(se).toContain("1-december");
  });

  // Var før C169 en hård påstand om lige mange sider i begge sprog. Den holdt,
  // fordi alle events havde begge arme. Sommerferien bryder den med vilje,
  // fordi det svenska sommarlovet ikke har noget nationalt dato at tælle til —
  // så pariteten skal låses som *retningen der holder*, ikke som et tal.
  test("svensk mangler præcis de events der ikke har et svensk dato", () => {
    const da = getDageTilSlugs("da");
    const se = getDageTilSlugs("se");
    const kunDansk = DAGE_TIL_EVENTS.filter((e) => !e.se);
    expect(da).toHaveLength(DAGE_TIL_EVENTS.length);
    expect(se).toHaveLength(DAGE_TIL_EVENTS.length - kunDansk.length);
    expect(kunDansk.map((e) => e.da.slug)).toEqual(["sommerferien"]);
    // Slugs er ikke et sæt, der indeholder hinanden: dansk siger "juleaften",
    // svensk siger "julafton". Det er derfor kun antallet kan sammenlignes.
    expect(da).toContain("juleaften");
    expect(se).toContain("julafton");
  });

  test("alle slugs er ASCII, fordi sitemap-URL'en er procentkodet", () => {
    // Sitemap'en indeholder /dagar-till/paskafton, men `new URL()` giver
    // pathname "/dagar-till/p%C3%A5skafton" for et slug med å. Slug-resolveren
    // læser den kodede sti, finder ingen event og returnerer not-found, så
    // hele den svenske IndexNow-indsendelsen springes over. Derfor: ASCII-slug,
    // ligesom paskdagen, skartorsdagen og nyarsafton.
    for (const locale of ["da", "se"] as const) {
      for (const slug of getDageTilSlugs(locale)) {
        expect(slug, `slug i ${locale}`).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  test("alle events har spørgsmål og mindst to fakta i hvert sprog de har", () => {
    for (const event of DAGE_TIL_EVENTS) {
      for (const locale of ["da", "se"] as const) {
        // `se` is optional: sommerferien has no Swedish date to count down to.
        const arm = event[locale];
        if (!arm) continue;
        expect(arm.copy.question).toContain("?");
        expect(arm.copy.facts.length).toBeGreaterThanOrEqual(2);
        expect(arm.copy.faq.length).toBeGreaterThanOrEqual(3);
        expect(arm.copy.faq.every((item) => item.answer.length > 20)).toBe(true);
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
    const svar = dageTilbageIAaret(new Date("2026-12-31T20:00:00Z"));
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
    const morgen = dageTilbageIAaret(new Date("2026-09-27T04:00:00Z"));
    const aftenaar = dageTilbageIAaret(new Date("2026-09-27T20:00:00Z"));
    expect(morgen.dage).toBe(aftenaar.dage);
  });

  test("tæller kalenderdagen i København, så nytårsaften kl. 00:30 er stadig nytårsaften", () => {
    // 00:30 dansk tid 1. januar er 23:30 UTC 31. december. En UTC-tælling
    // ville svare "95 dage tilbage i 2026" midt i nytårsaften.
    const svar = dageTilbageIAaret(new Date("2026-12-31T23:30:00Z"));
    expect(svar.year).toBe(2027);
    expect(svar.dage).toBe(364);
  });
});

describe("sommerferieStart", () => {
  test.each([
    [2024, "2024-06-29"],
    [2025, "2025-06-28"],
    [2026, "2026-06-27"],
    [2027, "2027-06-26"],
    [2028, "2028-06-24"],
    [2030, "2030-06-29"],
  ])("sommerferien begynder %i den %s", (year, expected) => {
    expect(toISO(sommerferieStart(year))).toBe(expected);
  });

  // The three hard-coded years above would also pass a wrong rule that
  // happened to agree three times, so the invariant is checked over 61 years
  // instead: it must be a Saturday in June, and no later Saturday exists in
  // that month.
  test("er altid den SIDSTE lørdag i juni, 1990-2050", () => {
    for (let year = 1990; year <= 2050; year++) {
      const date = sommerferieStart(year);
      expect(date.getUTCDay()).toBe(6);
      expect(date.getUTCMonth()).toBe(5);
      // No later Saturday may exist in June — that is what makes it *sidste*.
      for (let day = date.getUTCDate() + 1; day <= 30; day++) {
        expect(new Date(Date.UTC(year, 5, day)).getUTCDay()).not.toBe(6);
      }
    }
  });
});

describe("sommerferien som dansk dato", () => {
  const sommerferien = DAGE_TIL_EVENTS.find((e) => e.id === "sommerferien");

  test("findes i listen", () => {
    expect(sommerferien).toBeDefined();
  });

  test("har et dansk slug og en dansk spørgsmål", () => {
    expect(sommerferien?.da.slug).toBe("sommerferien");
    expect(sommerferien?.da.copy.question).toBe(
      "Hvor mange dage er der til sommerferie?"
    );
  });

  // Det svenska sommarlovet fastsättes av varje kommun och har inget
  // nationellt datum, så en svensk sida skulle få gissa det tal den räknar
  // ner till. Sådan skal den side findes.
  test("har INGEN svensk udgave", () => {
    expect(sommerferien?.se).toBeUndefined();
    expect(sommerferien?.anchor.se).toBeUndefined();
    expect(getDageTilEvents("se").some((e) => e.id === "sommerferien")).toBe(false);
    expect(getDageTilSlugs("se")).not.toContain("sommerferien");
  });

  // The previous slug resolver matched `candidate.se.slug`, which would have
  // thrown or matched the Danish slug on the Swedish domain — a dead
  // cross-language redirect for a page that does not exist.
  test("løser ikke det danske slug på beraknare.se", () => {
    expect(resolveDageTilSlug("sommerferien", "se")).toBeUndefined();
    expect(resolveDageTilSlug("sommerferien", "da")?.isOwnLocale).toBe(true);
  });

  test("tæller til den sidste lørdag i juni", () => {
    // 29. september 2026 → 26. juni 2027 = 270 dage (talt i node, ikke i hovedet).
    const svar = getDageTilAnswer(sommerferien!, "da", iso("2026-09-29"));
    expect(toISO(svar.targetDate)).toBe("2027-06-26");
    expect(svar.days).toBe(270);
    expect(svar.weeks).toBe(38);
    expect(svar.daysLeft).toBe(4);
  });

  // Sidens svar er altid det *næste* start, som alle de andre dage-til-sider
  // gør: spørger man midt i ferien, er næste start et år fremme. Låst, fordi
  // det er en fælde at "rette" det uden at tænke over, hvad de 28 andre sider
  // gør.
  test("midt i ferien tæller den til næste års start", () => {
    const svar = getDageTilAnswer(sommerferien!, "da", iso("2027-07-01"));
    expect(toISO(svar.targetDate)).toBe("2028-06-24");
    expect(svar.days).toBe(359);
    expect(svar.isToday).toBe(false);
  });

  test("på selve startdagen er svaret 0 dage", () => {
    const svar = getDageTilAnswer(sommerferien!, "da", iso("2027-06-26"));
    expect(svar.days).toBe(0);
    expect(svar.isToday).toBe(true);
  });
});

describe("events uden svensk udgave", () => {
  test("hvert event har altid en dansk udgave", () => {
    for (const event of DAGE_TIL_EVENTS) {
      expect(event.da).toBeDefined();
      expect(event.anchor.da).toBeDefined();
    }
  });

  test("et event med svensk slug har også et svensk anker", () => {
    for (const event of DAGE_TIL_EVENTS) {
      if (event.se) expect(event.anchor.se).toBeDefined();
    }
  });
});
