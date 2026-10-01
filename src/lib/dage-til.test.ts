import { describe, expect, test } from "vitest";
import {
  DAGE_TIL_EVENTS,
  type DageTilAnchor,
  type DageTilEvent,
  type DageTilLocaleArm,
  dageTilbageIAaret,
  daysBetween,
  easterSunday,
  formatTargetDate,
  formatTargetYear,
  forstaAdvent,
  foersteSkoledag,
  getDageTilAnswer,
  getDageTilEventBySlug,
  getDageTilEvents,
  getDageTilSlugs,
  getNextAnchorDate,
  isDageTilLocale,
  isoUgeMandag,
  midsommarafton,
  resolveDageTilSlug,
  sommerferieStart,
} from "./dage-til";
import { erArbejdsdag, erHelligdag } from "./helligdage";

const iso = (value: string) => new Date(`${value}T00:00:00.000Z`);
const dayMs = 86_400_000;
const toISO = (date: Date) => date.toISOString().slice(0, 10);

// `anchor.se` and `se` are optional on the type, because some dates only have
// a Danish answer. These three helpers throw instead of yielding `undefined`,
// so a test that points at a renamed or removed event fails loudly rather than
// asserting against `undefined`.
const eventById = (id: string): DageTilEvent => {
  const event = DAGE_TIL_EVENTS.find((e) => e.id === id);
  if (!event) throw new Error(`DAGE_TIL_EVENTS mangler "${id}"`);
  return event;
};

const armOf = (event: DageTilEvent, locale: "da" | "se"): DageTilLocaleArm => {
  const arm = event[locale];
  if (!arm) throw new Error(`"${event.id}" mangler ${locale}-arm`);
  return arm;
};

const anchorOf = (event: DageTilEvent, locale: "da" | "se"): DageTilAnchor => {
  const anchor = event.anchor[locale];
  if (!anchor) throw new Error(`"${event.id}" mangler ${locale}-anchor`);
  return anchor;
};

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
      const fra = getNextAnchorDate(anchorOf(afton!, locale), iso("2027-01-15"));
      const til = getNextAnchorDate(anchorOf(dagen!, locale), iso("2027-01-15"));
      expect((til.getTime() - fra.getTime()) / dayMs).toBe(1);
    }
    // Dansk sankthans er fast 23./24. juni; svensk midsummer er fredagen mellem
    // 19. og 25. juni. I 2027 er de to sprog derfor på hver sin dato.
    expect(toISO(getNextAnchorDate(anchorOf(afton!, "da"), iso("2027-01-15")))).toBe("2027-06-23");
    expect(toISO(getNextAnchorDate(anchorOf(dagen!, "da"), iso("2027-01-15")))).toBe("2027-06-24");
    expect(toISO(getNextAnchorDate(anchorOf(afton!, "se"), iso("2027-01-15")))).toBe("2027-06-25");
    expect(toISO(getNextAnchorDate(anchorOf(dagen!, "se"), iso("2027-01-15")))).toBe("2027-06-26");
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
        expect(armOf(event, locale).copy.question).toContain(armOf(event, locale).copy.short);
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
      const anchor = anchorOf(advent!, locale);
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
      const torsdag = getNextAnchorDate(anchorOf(skaertorsdag!, locale), iDag);
      const fredag = getNextAnchorDate(anchorOf(paskafton!, locale), iDag);
      const sondag = getNextAnchorDate(anchorOf(paskedag!, locale), iDag);
      expect(sondag.getTime() - fredag.getTime()).toBeLessThanOrEqual(2 * dayMs);
      expect(fredag.getTime()).toBeGreaterThan(torsdag.getTime());
    }
    // Dansk langfredag er påskedag minus 2 dage, svensk påskafton minus 1.
    expect(toISO(getNextAnchorDate(anchorOf(paskafton!, "da"), iDag))).toBe("2027-03-26");
    expect(toISO(getNextAnchorDate(anchorOf(paskafton!, "se"), iDag))).toBe("2027-03-27");
  });

  test("begge sprog har deres eget slug, og de to navne er hver sin dato", () => {
    const paskafton = DAGE_TIL_EVENTS.find((e) => e.id === "paskafton");
    expect(getDageTilSlugs("da")).toContain("langfredag");
    expect(getDageTilSlugs("se")).toContain("paskafton");
    // Svensk påskafton er lørdagen, dansk langfredag er fredagen dagen før —
    // de er to forskellige datoer, så hvert sprog har sit eget slug.
    expect(armOf(paskafton!, "da").slug).toBe("langfredag");
    expect(armOf(paskafton!, "se").slug).toBe("paskafton");
    expect(resolveDageTilSlug("langfredag", "se")?.localeSlug).toBe("paskafton");
    expect(resolveDageTilSlug("paskafton", "da")?.localeSlug).toBe("langfredag");
    for (const locale of ["da", "se"] as const) {
      expect(armOf(paskafton!, locale).copy.question).toContain(
        armOf(paskafton!, locale).copy.short
      );
    }
  });

  test("begge sprog kalder den anden, så læseren ikke tror de er samme dag", () => {
    const paskafton = DAGE_TIL_EVENTS.find((e) => e.id === "paskafton");
    expect(armOf(paskafton!, "se").copy.facts.join(" ")).toContain("Långfredagen");
    expect(armOf(paskafton!, "se").copy.facts.join(" ")).toContain("1 dag före");
  });
});

describe("palmesøndag", () => {
  test("FAQ'ens påstand om helligdagslisten er sand i modulet", () => {
    // Siden siger «Palmesøndag står i listen over Danmarks helligdage». Før 2/10
    // sagde den det uden at være sand: `getHelligdage` havde 12 navne og ingen
    // palmesøndag, så læseren kunne tælle listen på /dato og ikke finde den.
    // Palmesøndag ligger nu i modulet, og denne test er beviset — tages den ud
    // igen, bliver den rød.
    const arm = armOf(eventById("palmesondag"), "da");
    const faq = arm.copy.faq.find((f) => f.question.includes("helligdag"));
    expect(faq, "palmesøndagside mangler spørgsmålet om helligdage").toBeDefined();
    expect(faq!.answer).toContain("helligdage");
    for (let year = 2024; year <= 2045; year++) {
      const paske = iso(toISO(easterSunday(year)));
      const palme = new Date(paske.getTime() - 7 * dayMs);
      expect(erHelligdag(palme, "da"), `palmesøndag ${year} er ikke i helligdagslisten`).toBe(true);
      // …men den flytter aldrig en arbejdsdag, fordi den er en søndag.
      expect(palme.getUTCDay()).toBe(0);
      expect(erArbejdsdag(palme, "da")).toBe(false);
    }
  });
});

describe("valborg", () => {
  test("er fast 30. april i begge sprog", () => {
    const valborg = DAGE_TIL_EVENTS.find((e) => e.id === "valborg");
    expect(valborg).toBeDefined();
    for (const locale of ["da", "se"] as const) {
      expect(anchorOf(valborg!, locale)).toEqual({
        kind: "fixed",
        month: 4,
        day: 30,
        offsetDays: 0,
      });
      expect(toISO(getNextAnchorDate(anchorOf(valborg!, locale), iso("2026-09-25")))).toBe(
        "2027-04-30"
      );
      expect(toISO(getNextAnchorDate(anchorOf(valborg!, locale), iso("2026-04-29")))).toBe(
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
        armOf(valborg!, locale).copy.facts,
        armOf(valborg!, locale).copy.faq.map((f) => `${f.question} ${f.answer}`),
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
    expect(kunDansk.map((e) => e.da.slug)).toEqual([
      "sommerferien",
      "efteraarsferien",
      "skolestart",
    ]);
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
      expect(getDageTilSlugs(locale)).toContain(armOf(juleaften!, locale).slug);
      expect(armOf(juleaften!, locale).copy.question).toContain( armOf(juleaften!, locale).copy.short);
      const from = getNextAnchorDate(anchorOf(juleaften!, locale), iso("2026-09-25"));
      const to = getNextAnchorDate(anchorOf(juledagen!, locale), iso("2026-09-25"));
      expect((to.getTime() - from.getTime()) / dayMs).toBe(1);
      expect(getDageTilAnswer(juleaften!, locale, iso("2026-09-25")).days).toBe(90);
    }
  });

  test("Halloween er fast 31. oktober i begge sprog", () => {
    const halloween = DAGE_TIL_EVENTS.find((e) => e.id === "halloween");
    expect(halloween).toBeDefined();
    for (const locale of ["da", "se"] as const) {
      expect(anchorOf(halloween!, locale)).toMatchObject({
        kind: "fixed",
        month: 10,
        day: 31,
      });
      expect(getDageTilSlugs(locale)).toContain(armOf(halloween!, locale).slug);
      expect(armOf(halloween!, locale).copy.question).toContain(
        armOf(halloween!, locale).copy.short
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
        armOf(halloween!, locale).copy.facts,
        armOf(halloween!, locale).copy.faq.map((item) => `${item.question} ${item.answer}`),
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
      const anchor = getNextAnchorDate(anchorOf(event, "da"), iso("2026-09-25"));
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

describe("isoUgeMandag", () => {
  // ISO-ugedefinitionen: uge 1 er den uge med torsdagen i januar, så uge 1's
  // mandag ligger mellem 29. december og 4. januar. De tre års tal her er
  // efterårsferiens faktiske mandage (12. / 18. / 16. oktober), verificeret
  // mod de 21 kommunale ferieplaner.
  test.each([
    [2026, "2026-10-12"],
    [2027, "2027-10-18"],
    [2028, "2028-10-16"],
  ])("uge 42 i %i starter mandag %s", (year, expected) => {
    expect(toISO(isoUgeMandag(year, 42))).toBe(expected);
  });

  // De tre hårdkodede år ville også passe en forkert regel, der tilfældigvis
  // var enig tre gange, så invarianten låses over 61 år i stedet: mandagen i
  // uge 42 er altid en mandag i oktober, og uge 43 ligger præcis 7 dage senere.
  test("er altid en mandag i oktober, og uge 43 ligger 7 dage senere, 1990-2050", () => {
    for (let year = 1990; year <= 2050; year++) {
      const uge42 = isoUgeMandag(year, 42);
      // `getUTCDay()` er 0=søn..6=lør, så en mandag er 1.
      expect(uge42.getUTCDay(), `uge 42 i ${year}`).toBe(1);
      expect(uge42.getUTCMonth()).toBe(9);
      expect(isoUgeMandag(year, 43).getTime() - uge42.getTime()).toBe(
        7 * 86_400_000
      );
      // ISO-ugen må aldrig løbe ind i november — uge 42's mandag er i oktober,
      // og hvis reglen var "første mandag i oktober" ville den ligge i uge 40.
      expect(uge42.getUTCDate()).toBeGreaterThanOrEqual(8);
    }
  });

  // Uge 1's mandag kan ligge i december året før (2026: 29. december 2025).
  // Uden denne test ville en fejl i jan4-udregningen give stærkt plausible,
  // men forkerte datoer i alle de år hvor uge 1's mandag ligger i december.
  test("uge 1's mandag ligger mellem 29. december og 4. januar, 1990-2050", () => {
    for (let year = 1990; year <= 2050; year++) {
      const uge1 = isoUgeMandag(year, 1);
      // `getUTCDay()` er 0=søn..6=lør, så en mandag er 1.
      expect(uge1.getUTCDay(), `uge 1 i ${year}`).toBe(1);
      if (uge1.getUTCMonth() === 11) {
        expect(uge1.getUTCDate()).toBeGreaterThanOrEqual(29);
      } else {
        expect(uge1.getUTCMonth()).toBe(0);
        expect(uge1.getUTCDate()).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe("efteraarsferien som dansk dato", () => {
  const ferien = DAGE_TIL_EVENTS.find((e) => e.id === "efteraarsferien");

  test("findes i listen", () => {
    expect(ferien).toBeDefined();
  });

  test("har et dansk slug og en dansk spørgsmål", () => {
    expect(ferien?.da.slug).toBe("efteraarsferien");
    expect(ferien?.da.copy.question).toBe(
      "Hvor mange dage er der til efterårsferien?"
    );
  });

  // Efterårsferien er uge 42 i hele landet, så en svensk udgave ville kunne
  // regne det rigtige tal — men den svenska lagen har ingen tilsvarende
  // national ferieuge, og opgaven er dansk. Sådan skal den side findes.
  test("har INGEN svensk udgave", () => {
    expect(ferien?.se).toBeUndefined();
    expect(ferien?.anchor.se).toBeUndefined();
    expect(getDageTilEvents("se").some((e) => e.id === "efteraarsferien")).toBe(false);
    expect(getDageTilSlugs("se")).not.toContain("efteraarsferien");
  });

  test("løser ikke det danske slug på beraknare.se", () => {
    expect(resolveDageTilSlug("efteraarsferien", "se")).toBeUndefined();
    expect(resolveDageTilSlug("efteraarsferien", "da")?.isOwnLocale).toBe(true);
  });

  test("tæller til mandagen i uge 42", () => {
    // 30. september 2026 → 12. oktober 2026 = 12 dage (talt i node).
    const svar = getDageTilAnswer(ferien!, "da", iso("2026-09-30"));
    expect(toISO(svar.targetDate)).toBe("2026-10-12");
    expect(svar.days).toBe(12);
    expect(svar.weeks).toBe(1);
    expect(svar.daysLeft).toBe(5);
  });

  test("på selve startdagen er svaret 0 dage", () => {
    const svar = getDageTilAnswer(ferien!, "da", iso("2026-10-12"));
    expect(svar.days).toBe(0);
    expect(svar.isToday).toBe(true);
  });

  // Efterårsferien er én gang om året, så spørger man i januar tæller den til
  // oktober i samme år — ikke til næste.
  test("i januar tæller den til oktober i samme år", () => {
    const svar = getDageTilAnswer(ferien!, "da", iso("2027-01-05"));
    expect(toISO(svar.targetDate)).toBe("2027-10-18");
    expect(svar.days).toBe(286);
  });

  // De tre årstal i brødteksten skal være de samme tal koden regner — ellers
  // står der en forkert dato i teksten, som ingen anden test kan se. Teksten
  // skriver dem som "i 2026 er det 12. oktober", altså årstal og dato i to
  // led, og derfor ledes der efter datoen med årstallet i parentesen.
  test("de tre år i fakta-teksten er kalkens egne tal", () => {
    const fakta = ferien!.da.copy.facts.join(" ");
    const maaneder = [
      "januar", "februar", "marts", "april", "maj", "juni",
      "juli", "august", "september", "oktober", "november", "december",
    ];
    for (const year of [2026, 2027, 2028]) {
      const [aar, maaned, dag] = toISO(isoUgeMandag(year, 42)).split("-");
      const dato = `${Number(dag)}. ${maaneder[Number(maaned) - 1]}`;
      // Teksten lister årene i én sætning ("i 2026 er det 12. oktober, i 2027
      // 18. oktober …"), så kræves år og dato på hver side af hinanden.
      const foer = fakta.indexOf(String(year));
      expect(foer, `fakta skal nævne ${year}`).toBeGreaterThan(-1);
      expect(
        fakta.slice(foer, foer + 40),
        `året ${year} skal stå lige før ${dato}`
      ).toContain(dato);
    }
  });

  // Google's danske autocomplete spørger om præcis disse: "hvor mange dage er
  // der til efterårsferien" og "... efterårsferien 2026/2025". Sådan skal
  // spørgsmålet findes, ellers rammer siden ikke sin egen søgning.
  test("spørgsmålet matcher autocomplete-formuleringerne", () => {
    const spg = ferien!.da.copy.question.toLowerCase();
    expect(spg).toContain("hvor mange dage er der til");
    expect(spg).toContain("efterårsferien");
  });
});

const UGE_DAGE = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];

const MAANEDER = [
  "januar", "februar", "marts", "april", "maj", "juni",
  "juli", "august", "september", "oktober", "november", "december",
];

/** Svensk månedsliste — marts hedder "mars", ikke "marts". */
const MAANEDER_SE = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

/** ISO-ugenummer, samme regel som `isoUgeMandag` bruger internt. */
function isoUgeNummer(date: Date): number {
  const torsdag = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  torsdag.setUTCDate(torsdag.getUTCDate() + 4 - (torsdag.getUTCDay() || 7));
  const forsteJanuar = new Date(Date.UTC(torsdag.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((torsdag.getTime() - forsteJanuar.getTime()) / dayMs + 1) / 7
  );
}

describe("skolestart som dansk dato", () => {
  const start = DAGE_TIL_EVENTS.find((e) => e.id === "skolestart");

  test("findes i listen", () => {
    expect(start).toBeDefined();
  });

  test("har et dansk slug og en dansk spørgsmål", () => {
    expect(start?.da.slug).toBe("skolestart");
    expect(start?.da.copy.question).toBe("Hvor mange dage er der til skolestart?");
  });

  // Skolestart er fastsat i folkeskoleloven, som er dansk. Det svenska
  // skolåret har ingen tilsvarende national dato at tælle til, så siden skal
  // findes på dansk og 404'e på beraknare.se — ligesom de to feriesider.
  test("har INGEN svensk udgave", () => {
    expect(start?.se).toBeUndefined();
    expect(start?.anchor.se).toBeUndefined();
    expect(getDageTilEvents("se").some((e) => e.id === "skolestart")).toBe(false);
    expect(getDageTilSlugs("se")).not.toContain("skolestart");
  });

  test("løser ikke det danske slug på beraknare.se", () => {
    expect(resolveDageTilSlug("skolestart", "se")).toBeUndefined();
    expect(resolveDageTilSlug("skolestart", "da")?.isOwnLocale).toBe(true);
  });

  // 1. august 2026 ligger i fortiden, så en læser i dag skal tælle til næste
  // års skoledag — det er hele pointen med siden i efterårsferien.
  test("tæller til næste års skoledag, når datoen er passeret", () => {
    const svar = getDageTilAnswer(start!, "da", iso("2026-09-30"));
    // 1. august 2027 er en søndag, så undervisningen begynder mandag 2. august.
    expect(toISO(svar.targetDate)).toBe("2027-08-02");
    expect(svar.days).toBe(306);
    expect(svar.weeks).toBe(43);
    expect(svar.daysLeft).toBe(5);
  });

  test("tæller til skoledagen samme år, når vi er før den", () => {
    const svar = getDageTilAnswer(start!, "da", iso("2027-01-01"));
    expect(toISO(svar.targetDate)).toBe("2027-08-02");
    expect(svar.days).toBe(213);
  });

  // På selve 1. august er svaret ikke 0 dage: 2026-08-01 er en lørdag, så
  // undervisningen først starter mandag 3. august. Svaret 0 dage ville sige
  // "skolen starter i dag" en lørdag, hvilket er det forkerte svar — og
  // brødteksten på siden siger udtrykkeligt mandag 3. august.
  test("på en weekend-1. august er svaret mandagen, ikke 0 dage", () => {
    const svar = getDageTilAnswer(start!, "da", iso("2026-08-01"));
    expect(toISO(svar.targetDate)).toBe("2026-08-03");
    expect(svar.days).toBe(2);
    expect(svar.isToday).toBe(false);
  });

  test("på en hverdag-1. august er svaret 0 dage", () => {
    const svar = getDageTilAnswer(start!, "da", iso("2028-08-01"));
    expect(toISO(svar.targetDate)).toBe("2028-08-01");
    expect(svar.days).toBe(0);
    expect(svar.isToday).toBe(true);
  });

  // Porten dømmer på den regel, brødteksten fortæller: "nedtællingen følger
  // den første skoledag". Den må aldrig pege på en lørdag eller søndag, over
  // 61 år — så et kalkbrud i `foersteSkoledag` fanges, ikke tre valgte år.
  test("ankeret er altid en hverdag, og lovens 1. august kun forskubbes", () => {
    expect(start?.anchor.da.kind).toBe("skoleaar");
    for (let year = 1990; year <= 2050; year++) {
      const anker = getNextAnchorDate(anchorOf(start!, "da"), iso(`${year}-01-05`));
      const ugedag = anker.getUTCDay();
      expect(
        ugedag >= 1 && ugedag <= 5,
        `skolestart ${year} (${toISO(anker)}) må ikke ligge på en weekend`,
      ).toBe(true);
      const forskydning = Math.round(
        (anker.getTime() - iso(`${year}-08-01`).getTime()) / dayMs,
      );
      // 1. august er enten hverdag (0 dage), lørdag (2 dage frem) eller
      // søndag (1 dag frem). Aldrig mere, aldrig baglæns.
      expect([0, 1, 2]).toContain(forskydning);
      expect(forskydning).toBe(
        iso(`${year}-08-01`).getUTCDay() === 6
          ? 2
          : iso(`${year}-08-01`).getUTCDay() === 0
            ? 1
            : 0,
      );
    }
  });

  // Brødteksten siger "I 2026 er det en lørdag, i 2027 en søndag og i 2028 en
  // tirsdag". Det er kalkens egne tal, så de skal kunne regnes efter. Sætningen
  // lister alle tre år i én streng, så hvert år ledes efter på den plads, hvor
  // det står, og ugedagen skal stå i de 40 tegn derefter.
  test("ugedagene i fakta-teksten er kalkens egne tal", () => {
    const fakta = start!.da.copy.facts.join(" ");
    for (const year of [2026, 2027, 2028]) {
      const foersteAugust = iso(`${year}-08-01`);
      const ugedag = UGE_DAGE[foersteAugust.getUTCDay()];
      const foer = fakta.indexOf(String(year));
      expect(foer, `fakta skal nævne ${year}`).toBeGreaterThan(-1);
      expect(
        fakta.slice(foer, foer + 40),
        `året ${year} skal stå lige før ${ugedag}`
      ).toContain(ugedag);
    }
  });

  test("de tre ISO-uger i fakta-teksten er kalkens egne tal", () => {
    const fakta = start!.da.copy.facts.join(" ");
    expect(fakta).toContain("i uge 31 i 2026 og 2028, men i uge 30 i 2027");
    expect(isoUgeNummer(iso("2026-08-01"))).toBe(31);
    expect(isoUgeNummer(iso("2027-08-01"))).toBe(30);
    expect(isoUgeNummer(iso("2028-08-01"))).toBe(31);
    // Og årsagen skal være sand: 1. januar 2027 er en fredag, så 2026 fik
    // 53 ISO-uger.
    expect(iso("2027-01-01").getUTCDay()).toBe(5);
    expect(isoUgeNummer(iso("2026-12-31"))).toBe(53);
    // 1. august ligger aldrig uden for uge 30 og 31 — målt over 61 år, så
    // teksten ikke kan være en tilfældighed for de tre valgte år.
    for (let year = 1990; year <= 2050; year++) {
      expect([30, 31]).toContain(isoUgeNummer(iso(`${year}-08-01`)));
    }
  });

  // Nedtællingen peger på den første skoledag, så det er den uge, spørgsmålet
  // skal svare på — ikke 1. august. I 2026 er skoledagen i uge 32, selv om
  // lovens dato ligger i uge 31, og uden den her sætning får læseren to tal
  // uden at kunne se, at de gælder hver sin dato. Porten læser derfor både
  // dato og uge for hvert år og regner dem efter.
  test("FAQ'en svarer med skoledagens uge, og ugen er kalkens egen", () => {
    const svar = start!.da.copy.faq[2].answer;
    for (const year of [2026, 2027, 2028]) {
      const skoledag = foersteSkoledag(year);
      const dato = `${skoledag.getUTCDate()}. ${MAANEDER[skoledag.getUTCMonth()]}`;
      const fund = new RegExp(
        `i uge (\\d+) i ${year} \\(${dato.replace(".", "\\.")}\\)`,
      ).exec(svar);
      expect(fund, `FAQ skal svare med skoledagens uge for ${year} (${dato})`).not.toBeNull();
      expect(Number(fund?.[1]), `ugenummer for ${year}`).toBe(isoUgeNummer(skoledag));
    }
  });

  // "1. august 2026 er en lørdag, så det første skolebørn har undervisning er
  // mandag 3. august 2026." Det er netop det nedtællingen nu peger på, så
  // porten skal kunne læse dagen ud af ankeret i stedet for at hænge den på
  // kalenderen ved siden af.
  test("den første skoledag er ankeret, når 1. august er en weekend", () => {
    const foerste = getDageTilAnswer(start!, "da", iso("2026-07-01"));
    expect(iso("2026-08-01").getUTCDay()).toBe(6);
    expect(toISO(foerste.targetDate)).toBe("2026-08-03");
    expect(foerste.targetDate.getUTCDay()).toBe(1);
    expect(toISO(foersteSkoledag(2026))).toBe("2026-08-03");
    expect(toISO(foersteSkoledag(2027))).toBe("2027-08-02");
    expect(toISO(foersteSkoledag(2028))).toBe("2028-08-01");
    expect(start!.da.copy.faq[0].answer).toContain("mandag 2. august 2027");
    expect(start!.da.copy.faq[0].answer).toContain("mandag 3. august");
    // Brødteksten skal sige det samme, ellers er siden dens egen
    // selvmodsigelse: tallet peger på mandagen, teksten på en weekend.
    expect(start!.da.copy.facts.join(" ")).toContain("nedtællingen følger den første skoledag");
    // FAQ'en siger "2 dage senere i 2026 og 1 dag senere i 2027". De to tal er
    // forskydningen mellem lovens 1. august og `foersteSkoledag`, så de skal
    // regnes efter — ellers kan brødteksten rodes tilbage til 1. august,
    // mens portene på ankeret stadig er grønne. 2028 er bevidst ikke nævnt:
    // 1. august er en tirsdag det år, så der er ingen forskydning at nævne,
    // og porten sikrer derfor at ingen 0-tals-påstand kan snige sig ind.
    const faq = start!.da.copy.faq[1].answer;
    for (const year of [2026, 2027]) {
      const august = iso(`${year}-08-01`);
      const forskydning = Math.round(
        (foersteSkoledag(year).getTime() - august.getTime()) / dayMs,
      );
      // "1 dag" og "2 dage" — tallet bøjes, så porten leder efter begge
      // former frem for at hænge sig ved den ene.
      const rigtigtBøjet = forskydning === 1 ? "1 dag" : `${forskydning} dage`;
      expect(
        faq,
        `${year} skal have en påstand om ${forskydning} dages forskydning`,
      ).toContain(`${rigtigtBøjet} senere i ${year}`);
    }
    expect(faq).not.toContain("0 dage");
  });

  // Faktateksten siger "32 til 38 dage" fra sommerferiens start til skolestart.
  // Begge tal er sommerferieStart() og ankerets egne tal, så de skal kunne
  // regnes efter — og de skal dække hele året, ikke tre valgte år.
  test("afstanden fra sommerferiens start er 32 til 38 dage hele år", () => {
    for (let year = 1990; year <= 2050; year++) {
      const dage = daysBetween(sommerferieStart(year), foersteSkoledag(year));
      expect(dage, `sommerferie ${year} → skoledag`).toBeGreaterThanOrEqual(32);
      expect(dage, `sommerferie ${year} → skoledag`).toBeLessThanOrEqual(38);
    }
    expect(daysBetween(sommerferieStart(2026), foersteSkoledag(2026))).toBe(37);
    expect(daysBetween(sommerferieStart(2027), foersteSkoledag(2027))).toBe(37);
    expect(daysBetween(sommerferieStart(2028), foersteSkoledag(2028))).toBe(38);
  });

  test("de tre dagetal i FAQ'en er sommerferieStart minus skoledagen", () => {
    const svar = start!.da.copy.faq[4].answer;
    for (const year of [2026, 2027, 2028]) {
      const ferieStart = sommerferieStart(year);
      const skoledag = foersteSkoledag(year);
      const dage = daysBetween(ferieStart, skoledag);
      expect(svar).toContain(`${dage} dage`);
      // Både feriens startdato og skoledagen skal stå, så et tal ikke kan
      // stå alene og se ud som om det gjaldt en anden dato.
      const ferieDato = `${ferieStart.getUTCDate()}. ${MAANEDER[ferieStart.getUTCMonth()]}`;
      const skoleDato = `${skoledag.getUTCDate()}. ${MAANEDER[skoledag.getUTCMonth()]}`;
      expect(svar).toContain(`${ferieDato} til ${skoleDato} = ${dage} dage`);
    }
  });

  // Dansk autocomplete under "hvor mange dage er der til skolestart" giver
  // præcis denne formulering, så spørgsmålet skal findes her.
  test("spørgsmålet matcher autocomplete-formuleringen", () => {
    const spg = start!.da.copy.question.toLowerCase();
    expect(spg).toContain("hvor mange dage er der til");
    expect(spg).toContain("skolestart");
  });

  // Skolestart må ikke tælle nederdags. 1. august (og den hverdag den evt.
  // forskyder til) formateres med det danske datoformat, og året står i en
  // egen funktion, fordi det er det samme år hele vejen. I 2027 er den
  // hverdag 2. august — lovens 1. august er en søndag.
  test("startdatoen formateres som dansk dato", () => {
    const svar = getDageTilAnswer(start!, "da", iso("2027-01-01"));
    expect(formatTargetDate(svar.targetDate, "da")).toBe("2. august");
    expect(formatTargetYear(svar.targetDate)).toBe("2027");
    const haverdag = getDageTilAnswer(start!, "da", iso("2028-01-05"));
    expect(formatTargetDate(haverdag.targetDate, "da")).toBe("1. august");
    expect(formatTargetYear(haverdag.targetDate)).toBe("2028");
  });
});

describe("kristi himmelfartsdag i begge sprog", () => {
  const kristi = DAGE_TIL_EVENTS.find((e) => e.id === "kristi-himmelfartsdag");

  test("findes i listen med begge sprog", () => {
    expect(kristi).toBeDefined();
    expect(kristi?.da.slug).toBe("kristi-himmelfartsdag");
    expect(kristi?.se?.slug).toBe("kristi-himmelsfardsdag");
  });

  // Kristi himmelsfärdsdag är en allmän helgdag och röd dag i Sverige, så
  // begge sprog har en ægte side — i modsætning til skolestart og ferierne,
  // der kun findes i Danmark.
  test("begge arme peger på samme dato: påskedag plus 39 dage", () => {
    expect(kristi?.anchor.da).toEqual(kristi?.anchor.se);
    expect(kristi?.anchor.da).toEqual({
      kind: "easterOffset",
      month: 0,
      day: 0,
      offsetDays: 39,
    });
  });

  // De 51 datoer er hentet fra dansk og svensk Wikipedia, som begge fører
  // deres egne lister over kristi himmelfartsdag 2000-2050. De er uafhængige
  // af `easterSunday`, så porten kan ikke være grøn med en forskubbet påske.
  test("de 51 publicerede datoer 2000-2050 matcher kalken", () => {
    const PUBLICERET: [number, string][] = [
      [2000, "2000-06-01"], [2001, "2001-05-24"], [2002, "2002-05-09"],
      [2003, "2003-05-29"], [2004, "2004-05-20"], [2005, "2005-05-05"],
      [2006, "2006-05-25"], [2007, "2007-05-17"], [2008, "2008-05-01"],
      [2009, "2009-05-21"], [2010, "2010-05-13"], [2011, "2011-06-02"],
      [2012, "2012-05-17"], [2013, "2013-05-09"], [2014, "2014-05-29"],
      [2015, "2015-05-14"], [2016, "2016-05-05"], [2017, "2017-05-25"],
      [2018, "2018-05-10"], [2019, "2019-05-30"], [2020, "2020-05-21"],
      [2021, "2021-05-13"], [2022, "2022-05-26"], [2023, "2023-05-18"],
      [2024, "2024-05-09"], [2025, "2025-05-29"], [2026, "2026-05-14"],
      [2027, "2027-05-06"], [2028, "2028-05-25"], [2029, "2029-05-10"],
      [2030, "2030-05-30"], [2031, "2031-05-22"], [2032, "2032-05-06"],
      [2033, "2033-05-26"], [2034, "2034-05-18"], [2035, "2035-05-03"],
      [2036, "2036-05-22"], [2037, "2037-05-14"], [2038, "2038-06-03"],
      [2039, "2039-05-19"], [2040, "2040-05-10"], [2041, "2041-05-30"],
      [2042, "2042-05-15"], [2043, "2043-05-07"], [2044, "2044-05-26"],
      [2045, "2045-05-18"], [2046, "2046-05-03"], [2047, "2047-05-23"],
      [2048, "2048-05-14"], [2049, "2049-05-27"], [2050, "2050-05-19"],
    ];
    for (const [aar, forventet] of PUBLICERET) {
      expect(
        toISO(getNextAnchorDate(anchorOf(kristi!, "da"), iso(`${aar}-01-05`))),
        `kristi himmelfartsdag ${aar}`
      ).toBe(forventet);
    }
  });

  // "Kristi himmelfartsdag er altid en torsdag" er en påstand i brødteksten,
  // så den skal gælde hele året og ikke for de tre år teksten nævner.
  test("er altid en torsdag, og altid 39 dage efter påskedag", () => {
    for (let aar = 1990; aar <= 2050; aar++) {
      const dato = getNextAnchorDate(anchorOf(kristi!, "da"), iso(`${aar}-01-05`));
      expect(dato.getUTCDay(), `ugedag ${aar}`).toBe(4);
      expect(daysBetween(easterSunday(aar), dato), `afstand ${aar}`).toBe(39);
    }
  });

  // Faktateksten siger "mellem 1. maj (2008) og 3. juni (2038)". Begge tal er
  // spændvidden over 61 år, så de skal dække hele året, ikke tre valgte år.
  test("spændvidden 1. maj 2008 til 3. juni 2038 dækker hele året", () => {
    let tidligst = "";
    let senest = "";
    for (let aar = 1990; aar <= 2050; aar++) {
      const isoDato = toISO(
        getNextAnchorDate(anchorOf(kristi!, "da"), iso(`${aar}-01-05`))
      );
      if (!tidligst || isoDato.slice(5) < tidligst.slice(5)) tidligst = isoDato;
      if (!senest || isoDato.slice(5) > senest.slice(5)) senest = isoDato;
    }
    expect(tidligst).toBe("2008-05-01");
    expect(senest).toBe("2038-06-03");
    expect(kristi!.da.copy.facts.join(" ")).toContain(
      "mellem 1. maj (2008) og 3. juni (2038)"
    );
    expect(kristi!.se!.copy.facts.join(" ")).toContain(
      "mellan 1 maj (2008) och 3 juni (2038)"
    );
  });

  // "Der er derfor altid 10 dage imellem dem" (pinsedag) er en påstand fra FAQ'en.
  // Pinsedag er påskedag + 49, så forskellen er 10 — hvert år.
  test("ligger altid 10 dage før pinsedag", () => {
    for (let aar = 1990; aar <= 2050; aar++) {
      const kristiDato = getNextAnchorDate(anchorOf(kristi!, "da"), iso(`${aar}-01-05`));
      const pinse = new Date(easterSunday(aar).getTime() + 49 * dayMs);
      expect(daysBetween(kristiDato, pinse), `til pinsedag ${aar}`).toBe(10);
    }
  });

  // "I 2026 er den 14. maj, i 2027 6. maj og i 2028 25. maj." — de tre datoer
  // er kalkens egne tal, og sætningen lister dem i rækkefølge. Den svenske
  // sætning siger det samme med sit eget datoformat, så den låses samtidig.
  test("de tre datoer i begge sprog er kalkens egne tal", () => {
    for (const [arm, medPunkt, maaneder] of [
      [kristi!.da, true, MAANEDER],
      [kristi!.se!, false, MAANEDER_SE],
    ] as const) {
      const fakta = arm.copy.facts.join(" ");
      for (const aar of [2026, 2027, 2028]) {
        const dato = getNextAnchorDate(anchorOf(kristi!, "da"), iso(`${aar}-01-05`));
        const formateret = medPunkt
          ? `${dato.getUTCDate()}. ${maaneder[dato.getUTCMonth()]}`
          : `${dato.getUTCDate()} ${maaneder[dato.getUTCMonth()]}`;
        const foer = fakta.indexOf(String(aar));
        expect(foer, `fakta skal nævne ${aar}`).toBeGreaterThan(-1);
        expect(
          fakta.slice(foer, foer + 30),
          `${aar} skal stå før "${formateret}"`
        ).toContain(formateret);
      }
    }
  });

  // FAQ'en siger "I 2027 er påskedagen 28. marts, så kristi himmelfartsdag er
  // 6. maj 2027". Det er to tal fra kalken, så begge skal kunne regnes efter.
  test("de to datoer i FAQ'en er påskedagen og påskedagen plus 39 dage", () => {
    for (const [arm, medPunkt, maaneder] of [
      [kristi!.da, true, MAANEDER],
      [kristi!.se!, false, MAANEDER_SE],
    ] as const) {
      const svar = arm.copy.faq[0].answer;
      const påske = easterSunday(2027);
      const dato = new Date(påske.getTime() + 39 * dayMs);
      const formater = (d: Date) =>
        medPunkt
          ? `${d.getUTCDate()}. ${maaneder[d.getUTCMonth()]}`
          : `${d.getUTCDate()} ${maaneder[d.getUTCMonth()]}`;
      expect(toISO(påske)).toBe("2027-03-28");
      expect(toISO(dato)).toBe("2027-05-06");
      expect(svar).toContain(formater(påske));
      expect(svar).toContain(formater(dato));
    }
  });

  // "vælger du 13. maj 2026 som dagens dato, står der 1 dag tilbage" er en
  // påstand om et konkret dag-tal. Den holder kun for det år, hvor kristi
  // himmelfartsdag faktisk er 14. maj, så porten låser begge dele.
  test("'1 dag tilbage'-påstanden holder for den dato, den nævner", () => {
    for (const [arm, medPunkt] of [
      [kristi!.da, true],
      [kristi!.se!, false],
    ] as const) {
      const svar = arm.copy.faq[4].answer;
      const dagenFoer = medPunkt ? "13. maj 2026" : "13 maj 2026";
      expect(svar).toContain(dagenFoer);
      const foer = getDageTilAnswer(kristi!, "da", iso("2026-05-13"));
      expect(toISO(foer.targetDate)).toBe("2026-05-14");
      expect(foer.days).toBe(1);
    }
  });

  // Den 5. maj 2026 er passeret, så en læser i dag skal tælle til 2027 — samme
  // som påske-siderne gør.
  test("tæller til næste års dato, når denne er passeret", () => {
    const svar = getDageTilAnswer(kristi!, "da", iso("2026-09-30"));
    expect(toISO(svar.targetDate)).toBe("2027-05-06");
    expect(svar.days).toBe(218);
    expect(svar.weeks).toBe(31);
    expect(svar.daysLeft).toBe(1);
  });

  test("tæller til samme års dato, når vi er før den", () => {
    const svar = getDageTilAnswer(kristi!, "da", iso("2027-01-01"));
    expect(toISO(svar.targetDate)).toBe("2027-05-06");
    expect(svar.days).toBe(125);
  });

  test("på selve dagen er svaret 0 dage", () => {
    const svar = getDageTilAnswer(kristi!, "da", iso("2027-05-06"));
    expect(svar.days).toBe(0);
    expect(svar.isToday).toBe(true);
  });

  // Dansk autocomplete under "hvor mange dage er der til kristi" giver
  // "hvor mange dage er der til kristi himmelfart" og "hvor mange dage er
  // kristi himmelfartsdag". Den første er brugt som spørgsmål, fordi den også
  // holder titlen under Googles afkortningsgrænse med trecifrede dag-tal.
  test("spørgsmålet matcher autocomplete-formuleringen", () => {
    const dansk = kristi!.da.copy.question.toLowerCase();
    expect(dansk).toContain("hvor mange dage er der til");
    expect(dansk).toContain("kristi himmelfart");
    const svensk = kristi!.se!.copy.question.toLowerCase();
    expect(svensk).toContain("hur många dagar är det till");
    expect(svensk).toContain("kristi himmelsfärd");
  });

  // Titlen er `${question} ${count}`, så den længste dag tæller: tre-cifrede
  // dag-tal giver 55 tegn på dansk og 57 på svensk mod grænsen 60.
  test("titlen holder sig under 60 tegn med trecifrede dag-tal", () => {
    for (const svar of [
      "188 dage", "1 dag", "356 dage",
    ] as const) {
      expect(
        `${kristi!.da.copy.question} ${svar}`.length,
        `dansk "${svar}"`
      ).toBeLessThanOrEqual(60);
    }
    for (const svar of ["188 dagar", "1 dag", "356 dagar"] as const) {
      expect(
        `${kristi!.se!.copy.question} ${svar}`.length,
        `svensk "${svar}"`
      ).toBeLessThanOrEqual(60);
    }
  });

  test("den svenske side tæller til samme dato som den danske", () => {
    const da = getDageTilAnswer(kristi!, "da", iso("2026-09-30"));
    const se = getDageTilAnswer(kristi!, "se", iso("2026-09-30"));
    expect(toISO(se.targetDate)).toBe(toISO(da.targetDate));
    expect(se.days).toBe(da.days);
    expect(getDageTilSlugs("se")).toContain("kristi-himmelsfardsdag");
    expect(resolveDageTilSlug("kristi-himmelfartsdag", "se")?.localeSlug).toBe(
      "kristi-himmelsfardsdag"
    );
  });

  test("datoen formateres med sit eget sprog", () => {
    const svar = getDageTilAnswer(kristi!, "da", iso("2027-01-01"));
    expect(formatTargetDate(svar.targetDate, "da")).toBe("6. maj");
    expect(formatTargetYear(svar.targetDate)).toBe("2027");
    expect(formatTargetDate(svar.targetDate, "se")).toBe("6 maj");
  });
});

describe("pinse i begge sprog", () => {
  const pinse = DAGE_TIL_EVENTS.find((e) => e.id === "pinse");

  test("findes i listen med begge sprog", () => {
    expect(pinse).toBeDefined();
    expect(pinse?.da.slug).toBe("2-pinsedag");
    expect(pinse?.se?.slug).toBe("pingstdagen");
  });

  // De to arme er IKKE en oversættelse — de peger på hver sin dag. I Danmark
  // er både pinsedag og 2. pinsedag helligdag, så helligdagsstatus ikke kan
  // skelne dem; dansk tæller til mandagen (+50), fordi det er den, folk har
  // fri. Lagen (1989:253) om allmänna helgdagar räknar däremot pingstdagen
  // (+49) som allmän helgdag och INTE måndagen efter, så svensk tæller til
  // søndagen. Porten låser forskellen, så en "harmonisering" ikke kan slå
  // den ene arm ihjel.
  test("de to arme peger på hver sin dag: +50 dansk, +49 svensk", () => {
    expect(pinse?.anchor.da).toEqual({
      kind: "easterOffset",
      month: 0,
      day: 0,
      offsetDays: 50,
    });
    expect(pinse?.anchor.se).toEqual({
      kind: "easterOffset",
      month: 0,
      day: 0,
      offsetDays: 49,
    });
    expect(pinse?.anchor.da).not.toEqual(pinse?.anchor.se);
  });

  // 2. pinsedag er påskedag + 50, så den er påskedagen (en søndag) plus 50
  // dage. 50 mod 7 er 1, så det er altid en mandag. Målt over 61 år.
  test("2. pinsedag er altid en mandag, altid påskedag plus 50", () => {
    for (let aar = 1990; aar <= 2050; aar++) {
      const dato = getNextAnchorDate(anchorOf(pinse!, "da"), iso(`${aar}-01-05`));
      expect(dato.getUTCDay(), `ugedag ${aar}`).toBe(1);
      expect(daysBetween(easterSunday(aar), dato), `afstand ${aar}`).toBe(50);
    }
  });

  // Pingstdagen er lagens "sjunde söndagen efter påskdagen" — påskedag + 49.
  // 49 mod 7 er 0, så den er altid en søndag. Målt over 61 år.
  test("pingstdagen er altid en søndag, altid påskedag plus 49", () => {
    for (let aar = 1990; aar <= 2050; aar++) {
      const dato = getNextAnchorDate(anchorOf(pinse!, "se")!, iso(`${aar}-01-05`));
      expect(dato.getUTCDay(), `ugedag ${aar}`).toBe(0);
      expect(daysBetween(easterSunday(aar), dato), `afstand ${aar}`).toBe(49);
    }
  });

  // Brødteksten siger, at pinsedagen ligger 1 dag før 2. pinsedag. Det er
  // forskellen mellem de to arme, så det er den samme påstand to steder.
  test("pinsedagen ligger altid 1 dag før 2. pinsedag", () => {
    for (let aar = 1990; aar <= 2050; aar++) {
      const da = getNextAnchorDate(anchorOf(pinse!, "da"), iso(`${aar}-01-05`));
      const se = getNextAnchorDate(anchorOf(pinse!, "se")!, iso(`${aar}-01-05`));
      expect(toISO(se)).toBe(toISO(new Date(da.getTime() - dayMs)));
      expect(daysBetween(se, da), `afstand ${aar}`).toBe(1);
    }
  });

  // Faktateksten siger "mellem 12. maj (2008) og 14. juni (2038)" og "mellan
  // 11 maj (2008) och 13 juni (2038)". Begge er spændvidden over 61 år, så de
  // skal dække hele året og ikke tre valgte år. Sammenligningen er på
  // måned-dag (`slice(5)`), ikke på hele datoen — ellers finder den bare det
  // første år i løkken.
  test("spændvidderne dækker hele året i begge sprog", () => {
    let daTidligst = "";
    let daSenest = "";
    let seTidligst = "";
    let seSenest = "";
    for (let aar = 1990; aar <= 2050; aar++) {
      const isoDa = toISO(getNextAnchorDate(anchorOf(pinse!, "da"), iso(`${aar}-01-05`)));
      const isoSe = toISO(getNextAnchorDate(anchorOf(pinse!, "se")!, iso(`${aar}-01-05`)));
      if (!daTidligst || isoDa.slice(5) < daTidligst.slice(5)) daTidligst = isoDa;
      if (!daSenest || isoDa.slice(5) > daSenest.slice(5)) daSenest = isoDa;
      if (!seTidligst || isoSe.slice(5) < seTidligst.slice(5)) seTidligst = isoSe;
      if (!seSenest || isoSe.slice(5) > seSenest.slice(5)) seSenest = isoSe;
    }
    expect(daTidligst).toBe("2008-05-12");
    expect(daSenest).toBe("2038-06-14");
    expect(seTidligst).toBe("2008-05-11");
    expect(seSenest).toBe("2038-06-13");
    expect(pinse!.da.copy.facts.join(" ")).toContain(
      "mellem 12. maj (2008) og 14. juni (2038)"
    );
    expect(pinse!.se!.copy.facts.join(" ")).toContain(
      "mellan 11 maj (2008) och 13 juni (2038)"
    );
  });

  // "Den ligger i uge 20 til 24" / "i vecka 19 till 23" er påstander om
  // ISO-ugen. De skal dække hele året, så porten måler spændvidden.
  test("ISO-uge-spændvidderne i teksten er rigtige hele året", () => {
    const uge = (date: Date) => {
      const d = new Date(date.getTime());
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      const start = Date.UTC(d.getUTCFullYear(), 0, 1);
      return Math.ceil(((d.getTime() - start) / dayMs + 1) / 7);
    };
    const da = new Set<number>();
    const se = new Set<number>();
    for (let aar = 1990; aar <= 2050; aar++) {
      da.add(uge(getNextAnchorDate(anchorOf(pinse!, "da"), iso(`${aar}-01-05`))));
      se.add(uge(getNextAnchorDate(anchorOf(pinse!, "se")!, iso(`${aar}-01-05`))));
    }
    expect(Math.min(...da)).toBe(20);
    expect(Math.max(...da)).toBe(24);
    expect(Math.min(...se)).toBe(19);
    expect(Math.max(...se)).toBe(23);
    expect(pinse!.da.copy.facts.join(" ")).toContain("uge 20 til 24");
    expect(pinse!.se!.copy.facts.join(" ")).toContain("vecka 19 till 23");
  });

  // "I 2026 er den 25. maj, i 2027 17. maj og i 2028 5. juni." De tre tal er
  // kalkens egne, og sætningen lister dem i rækkefølge. Den svenske sætning
  // siger det samme med sit eget datoformat, så den låses samtidig.
  test("de tre datoer i begge sprog er kalkens egne tal", () => {
    for (const [arm, anchor, medPunkt, maaneder] of [
      [pinse!.da, anchorOf(pinse!, "da"), true, MAANEDER],
      [pinse!.se!, anchorOf(pinse!, "se")!, false, MAANEDER_SE],
    ] as const) {
      const fakta = arm.copy.facts.join(" ");
      for (const aar of [2026, 2027, 2028]) {
        const dato = getNextAnchorDate(anchor, iso(`${aar}-01-05`));
        const formateret = medPunkt
          ? `${dato.getUTCDate()}. ${maaneder[dato.getUTCMonth()]}`
          : `${dato.getUTCDate()} ${maaneder[dato.getUTCMonth()]}`;
        const foer = fakta.indexOf(String(aar));
        expect(foer, `fakta skal nævne ${aar}`).toBeGreaterThan(-1);
        expect(
          fakta.slice(foer, foer + 30),
          `${aar} skal stå før "${formateret}"`
        ).toContain(formateret);
      }
    }
  });

  // "altid 11 dage efter kristi himmelfartsdag" og "alltid 10 dagar efter
  // kristi himmelsfärdsdagen" — kristi er +39, så 50-39=11 og 49-39=10.
  test("afstanden til kristi himmelfartsdag er 11 dansk og 10 svensk", () => {
    for (let aar = 1990; aar <= 2050; aar++) {
      const kristiDato = new Date(easterSunday(aar).getTime() + 39 * dayMs);
      expect(
        daysBetween(kristiDato, getNextAnchorDate(anchorOf(pinse!, "da"), iso(`${aar}-01-05`))),
        `dansk ${aar}`
      ).toBe(11);
      expect(
        daysBetween(kristiDato, getNextAnchorDate(anchorOf(pinse!, "se")!, iso(`${aar}-01-05`))),
        `svensk ${aar}`
      ).toBe(10);
    }
  });

  // FAQ'ens to konkrete datoer (påskedagen og målet) er kalkens egne tal.
  test("de to datoer i hver FAQ er påskedagen og målet", () => {
    for (const [arm, anchor, medPunkt, maaneder, offset] of [
      [pinse!.da, anchorOf(pinse!, "da"), true, MAANEDER, 50],
      [pinse!.se!, anchorOf(pinse!, "se")!, false, MAANEDER_SE, 49],
    ] as const) {
      const svar = arm.copy.faq[0].answer;
      const påske = easterSunday(2027);
      const dato = new Date(påske.getTime() + offset * dayMs);
      const formater = (d: Date) =>
        medPunkt
          ? `${d.getUTCDate()}. ${maaneder[d.getUTCMonth()]}`
          : `${d.getUTCDate()} ${maaneder[d.getUTCMonth()]}`;
      expect(toISO(påske)).toBe("2027-03-28");
      expect(svar).toContain(formater(påske));
      expect(svar).toContain(formater(dato));
    }
  });

  // "'vælger du 24. maj 2026 … står der 1 dag tilbage'" er en påstand om et
  // konkret dag-tal. Den holder kun det år, hvor 2. pinsedag er 25. maj, så
  // porten tager datoen fra hver sprog og tæller baglæns derfra.
  test("'1 dag tilbage'-påstanden holder for den dato, den nævner", () => {
    for (const [arm, locale, dagenFoer] of [
      [pinse!.da, "da", "24. maj 2026"],
      [pinse!.se!, "se", "23 maj 2026"],
    ] as const) {
      const svar = arm.copy.faq[4].answer;
      expect(svar).toContain(dagenFoer);
      // Dagen før målet er nævnt i teksten, så forveksler den ikke målet.
      const svarDag = getDageTilAnswer(
        pinse!,
        locale,
        iso(toISO(getNextAnchorDate(
          locale === "da" ? anchorOf(pinse!, "da") : anchorOf(pinse!, "se")!,
          iso("2026-01-05")
        ))),
      );
      expect(toISO(svarDag.targetDate)).toBe(
        locale === "da" ? "2026-05-25" : "2026-05-24"
      );
      expect(
        getDageTilAnswer(pinse!, locale, iso(
          toISO(new Date(svarDag.targetDate.getTime() - dayMs))
        )).days,
        `${locale}: dagen før målet er 1 dag tilbage`
      ).toBe(1);
    }
  });

  // Dansk autocomplete under "hvor mange dage er der til pinse" giver fire
  // træffere, men "pinsedag" og "2 pinsedag" giver nul, så spørgsmålet er
  // skrevet til den praktiske mandag. Svensk autocomplete under "när är
  // pingstdagen" har årstal-varianter, så den arm er bygget på pingstdagen.
  test("spørgsmålene matcher de målte autocomplete-formuleringer", () => {
    const dansk = pinse!.da.copy.question.toLowerCase();
    expect(dansk).toContain("hvor mange dage er der til");
    expect(dansk).toContain("2. pinsedag");
    const svensk = pinse!.se!.copy.question.toLowerCase();
    expect(svensk).toContain("hur många dagar är det till");
    expect(svensk).toContain("pingstdagen");
  });

  // Titlen er `${question} ${count}`, så den længste dag tæller. Review-fundet
  // 30/9 (ac963e4) var præcis denne fejl: 61 tegn med trecifrede dag-tal, fordi
  // porten låste én valgt dato. Derfor køres alle tre dag-tal-formater her.
  test("titlen holder sig under 60 tegn med trecifrede dag-tal", () => {
    for (const svar of ["1 dag", "99 dage", "365 dage"] as const) {
      expect(
        `${pinse!.da.copy.question} ${svar}`.length,
        `dansk "${svar}"`
      ).toBeLessThanOrEqual(60);
    }
    for (const svar of ["1 dag", "99 dagar", "365 dagar"] as const) {
      expect(
        `${pinse!.se!.copy.question} ${svar}`.length,
        `svensk "${svar}"`
      ).toBeLessThanOrEqual(60);
    }
  });

  // De to arme er 1 dag fra hinanden, så det er et konkret målepunkt på
  // forskellen mellem dem.
  test("de to sider svarer hver sin dag", () => {
    const da = getDageTilAnswer(pinse!, "da", iso("2027-01-01"));
    const se = getDageTilAnswer(pinse!, "se", iso("2027-01-01"));
    expect(toISO(da.targetDate)).toBe("2027-05-17");
    expect(toISO(se.targetDate)).toBe("2027-05-16");
    expect(se.days).toBe(da.days - 1);
    expect(formatTargetDate(da.targetDate, "da")).toBe("17. maj");
    expect(formatTargetDate(se.targetDate, "se")).toBe("16 maj");
    expect(getDageTilSlugs("se")).toContain("pingstdagen");
    expect(resolveDageTilSlug("2-pinsedag", "se")?.localeSlug).toBe(
      "pingstdagen"
    );
    expect(resolveDageTilSlug("pingstdagen", "da")?.localeSlug).toBe(
      "2-pinsedag"
    );
  });

  test("på selve dagen er svaret 0 dage", () => {
    const svar = getDageTilAnswer(pinse!, "da", iso("2027-05-17"));
    expect(svar.days).toBe(0);
    expect(svar.isToday).toBe(true);
  });

  test("tæller til næste års dato, når denne er passeret", () => {
    const svar = getDageTilAnswer(pinse!, "da", iso("2026-09-30"));
    expect(toISO(svar.targetDate)).toBe("2027-05-17");
    // 30/9 2026 → 17/5 2027: 31+30+31+31+28+31+30+17 = 229 dage.
    expect(svar.days).toBe(229);
  });
});

describe("events uden svensk udgave", () => {
  test("hvert event har altid en dansk udgave", () => {
    for (const event of DAGE_TIL_EVENTS) {
      expect(event.da).toBeDefined();
      expect(anchorOf(event, "da")).toBeDefined();
    }
  });

  test("et event med svensk slug har også et svensk anker", () => {
    for (const event of DAGE_TIL_EVENTS) {
      if (event.se) expect(anchorOf(event, "se")).toBeDefined();
    }
  });
});

/**
 * Svenska påståenden om vilka dagar som är helgdagar.
 *
 * Lag (1989:253) om allmänna helgdagar, 1 §, jämförd med SFS 2004:1320,
 * räknar upp exakt dessa dagar:
 *
 *   - söndagar, däribland påskdagen och pingstdagen
 *   - nyårsdagen, trettondedag jul, första maj, juldagen och annandag jul
 *   - långfredagen, annandag påsk, Kristi himmelsfärdsdag, nationaldagen,
 *     midsommardagen och alla helgons dag
 *
 * Tre afsnit på beraknare.se sagde det modsatte, och de gjorde det på tre
 * mått: julafton skrev att den räknas som helgdag, skärtorsdag skrev att den
 * är en "officiell svensk helgdag" (och motsade samtidigt sin egen faktaboks
 * sista punkt om att man inte har automatisk rätt till dagpenning), och
 * nationaldagen skrev både i faktaboksen och i FAQ att den "inte är en laglig
 * helgdag" — fast lagen tar uttryckligen upp den.
 *
 * Denne test lægger loven i som data og tjekker brødteksten mod den, så
 * klassen kan ikke komme tilbage ved at nogen skriver en ny helgdagssætning.
 */
const LAGENS_HELGDAGE = [
  "påskdagen",
  "pingstdagen",
  "nyårsdagen",
  "trettondedag jul",
  "första maj",
  "juldagen",
  "annandag jul",
  "långfredagen",
  "annandag påsk",
  "kristi himmelsfärdsdag",
  "nationaldagen",
  "midsommardagen",
  "alla helgons dag",
];

/** Svenska eventer der LOven *ikke* tæller som allmæn helgedag. */
const IKKE_HELGDAG = ["julafton", "nyårsafton", "skärtorsdagen"];

const svenskBrødtekst = () =>
  DAGE_TIL_EVENTS.flatMap((event) => {
    const se = event.se;
    if (!se) return [];
    return [...se.copy.facts, ...se.copy.faq.map((f) => `${f.question} ${f.answer}`)];
  });

const naevner = (tekst: string, ord: string[]) => ord.some((o) => tekst.includes(o));

/**
 * Loven 1 §, målt på den svenska hændelses egen dag. `true` = loven tæller den
 * som allmæn helgdag, `false` = den står ikke på listen.
 *
 * Mangler en hændelse i tabellen, springes den over — tabellen er ikke en
 * påstand om at *alle* dage er dækket, men om de helligdagsdage der er.
 */
const LOEN_SIGER_HELGDAG: Record<string, boolean> = {
  juldagen: true, // juldagen
  julafton: false, // julafton — kun juldagen och annandag jul sta i listan
  nyarsafton: false, // nyårsafton — loven har nyårsdagen
  nyarsdagen: true, // nyårsdagen
  paskdagen: true, // söndag
  skartorsdagen: false, // skärtorsdag — ikke i lagen
  nationaldagen: true, // nationaldagen, jämför 2 § "den 6 juni"
  midsommarafton: false, // midsommarafton — lagen har midsommardagen
  midsommardagen: true, // midsommardagen
  halloween: false, // allhelgonaafton — lagen har alla helgons dag
  paskafton: true, // långfredagen
  "kristi-himmelsfardsdag": true, // Kristi himmelsfärdsdag
  pingstdagen: true, // pingstdagen
  valborg: false,
  "1-advent": true, // 1 § första stycket: "söndagar, däribland påskdagen och
  // pingstdagen". Advent står inte upptaget själv, men 1 advent är *alltid*
  // en söndag, så loven räknar den — mätt på hændelsens egen dag.
};

/** "er en allmän helgdag", "räknas som helgdag", "officiell svensk helgdag". */
const kalderDetHelgdag = (tekst: string) =>
  naevner(tekst, [
    "allmän helgdag",
    "allmänna helgdagar",
    "helgdag i den svenska kalendern",
    "officiell svensk helgdag",
    "officiella svenska helgdagar",
  ]);

/** "är inte en laglig helgdag", "är inte en officiell helgdag". */
const kalderDetIkkeHelgdag = (tekst: string) =>
  naevner(tekst, [
    "inte en laglig helgdag",
    "inte en officiell helgdag",
    "inte en allmän helgdag",
  ]);

/**
 * En benekrande sætning — "är inte en allmän helgdag", "saknas i listan".
 * Valborg och 1. advent er korrekt skrevet som *ikke* helgdag, så en test der
 * kun læser "allmän helgdag" i dem ville slå fejl på rigtig tekst.
 */
const benekrende = (tekst: string) =>
  naevner(tekst, [" inte ", "saknas", "utan ", "men inte ", "faller inte", "omfattas inte"]);

describe("svenska helgdagspåstande mod lagen (1989:253) 1 §", () => {
  test("nationaldagen kaldes aldrig for ikke at vaere en laglig helgdag", () => {
    const nationaldagen = DAGE_TIL_EVENTS.find((e) => e.se?.slug === "nationaldagen");
    expect(nationaldagen?.se).toBeDefined();
    const tekster = [
      ...nationaldagen!.se!.copy.facts,
      ...nationaldagen!.se!.copy.faq.map((f) => `${f.question} ${f.answer}`),
    ];
    // Den skal sige det modsatte — loven tager uttryckligen upp nationaldagen.
    expect(tekster.some((t) => kalderDetIkkeHelgdag(t))).toBe(false);
    expect(tekster.some((t) => t.includes("allmän helgdag"))).toBe(true);
  });

  test("hver svensk dag er helgdag i brødteksten præcis som i loven", () => {
    // Hver helligdagsdag, målt på *hændelsen* og ikke på om ordet "nationaldagen"
    // tilfældigvis står i sætningen — ellers ville korrekt tekst med et pronomen
    // ("I Sverige är den en allmän helgdag") blive afvist.
    const fejl: string[] = [];
    for (const event of DAGE_TIL_EVENTS) {
      const se = event.se;
      if (!se) continue;
      const loven = LOEN_SIGER_HELGDAG[se.slug];
      if (loven === undefined) continue;
      for (const tekst of [...se.copy.facts, ...se.copy.faq.map((f) => f.answer)]) {
        if (loven) {
          // Skal den vaere en benekrende sætning. En sætning der både
          // bekrefter og benekrter ("Pingstdagen är en allmän helgdag ...
          // // Måndagen efter är däremot ikke ...") handler om to forskellige
          // dage, saa den skal laeses i sin helhed og ikke slaas fejl pa.
          if (kalderDetIkkeHelgdag(tekst) && !kalderDetHelgdag(tekst)) {
            fejl.push(`${se.slug}: ${tekst}`);
          }
        } else if (kalderDetHelgdag(tekst) && !benekrende(tekst)) {
          fejl.push(`${se.slug}: ${tekst}`);
        }
      }
    }
    expect(fejl).toEqual([]);
  });
});

/**
 * Det bløde "helgdag" — uden "allmän", "officiell" eller "laglig" foran.
 *
 * `kalderDetHelgdag` målte kun de formuleringer den oprindelige tekst brugte,
 * så to sætninger på `/skartorsdagen` slap igennem: "Ja, den är en torsdag och
 * en helgdag" og "Båda är helgdagar" — på en side hvis egen faktaboks tre
 * linjer ovenfor siger at skärtorsdagen *inte* är en allmän helgdag. Det er
 * lovens egen skelnen, som brødteksten havde tabt: en **röd dag** (de facto
 * fridag, ifølge kollektivavtal) er ikke det samme som en **allmän helgdag**
 * (fastsat i lag), og skärtorsdagen er den første uden at være den anden.
 *
 * Formen er snæver med vilje, efter to målerfælder i dette repo (ugedags-
 * porten 30/9 fandt 15 fund hvor 13 var rigtig tekst om andre dage):
 *
 *  1. Kun klausler der *navngiver* en dag loven ikke tæller — i klauslen
 *     eller i det FAQ-spørgsmål den står i — tjekkes. Ellers ville "Datum-
 *     räknaren visar också veckor, arbetsdagar och helgdagar" på
 *     `/1-december` blive afvist for en korrekt generisk omtale.
 *  2. Negationen skal ligge i *samme klausul* som ordet. Sætningen "Ja, den
 *     är en torsdag och en helgdag, men den är inte automatiskt en frivillig
 *     heldag" indeholder netop denne fejl, og en sætningsvis negation ville
 *     have godkendt den — så komma er også et skel.
 *
 * Undtagelsen er klauslen der selv bruger det præcise ord: "röd dag" /
 * "röda dagar" er det korrekte fagord for en fridag uden lovens støtte.
 */
const HELGDAGSORD = /helgdag/;

/** "inte en allmän helgdag", "saknas i listan över allmänna helgdagar". */
const NEKTER_I_KLAUSUL = /\binte\b[^.?!,]{0,40}helgdag|saknas|omfattas inte|faller inte/;

const ROED_DAG = /röd dag|röda dagar/;

/** Sætninger, og sætningernes klausler — skel på både punktum og komma. */
const klausler = (tekst: string) => tekst.split(/(?<=[.!?])\s+|(?<=[a-zåäö]),\s+/i);

/**
 * En klausal der *predikerer* helgdag om den lovsfrie dag: "den är en torsdag
 * och en helgdag", "Båda är helgdagar". Det er den konstruktion, der gør
 * helgdagsordet til en påstand *om dagen* — og den skal ikke forveksles med
 * omtalen af en anden dag, som i "Det är allhelgonadagen 1 november och alla
 * helgons dag som är helgdagar" (halloween-siden, hvor allhelgons dag *er* en
 * allmän helgdag). Derfor står pronomenet først og verbet tæt på: med en
 * åben længde ville porten igen ramme rigtig tekst om andre dage.
 *
 * ⚠️ Ordgrænserne er talt i ord, ikke skrevet med `\b`: JavaScripts `\w` er
 * ASCII, så `\bär` aldrig kan matche — et portens mønster der *ser* rigtigt ud
 * og så aldrig fanger noget.
 */
const PRAEDIKERER_HELGDAG =
  /^(?:den|det|dagen|den dagen|båda|båda dagarna)(?:\s+\S+){0,2}\s+(?:er|är|räknas)(?:\s+\S+){0,4}\s+helgdag/iu;

const svenskSætninger = () =>
  DAGE_TIL_EVENTS.flatMap((event) => {
    const se = event.se;
    if (!se) return [];
    return [
      ...se.copy.facts.map((tekst) => ({ hændelse: se.slug, spoergsmaal: "", tekst })),
      ...se.copy.faq.map((f) => ({ hændelse: se.slug, spoergsmaal: f.question, tekst: f.answer })),
    ];
  });

/**
 * De dage 1 § *ikke* tæller, med de navne brødteksten skriver dem med —
 * både "skärtorsdagen" og "skärtorsdag", fordi et FAQ-spørgsmål skriver
 * ubestemt ("Räknas skärtorsdag och långfredag med?") mens svaret skriver
 * bestemt ("Båda är helgdagar"), og det er præcis den ubestemte sætning
 * porten skal fange.
 */
const dageLovenIkkeTæller = () => {
  const dage = new Map<string, string[]>();
  for (const event of DAGE_TIL_EVENTS) {
    const se = event.se;
    if (!se || LOEN_SIGER_HELGDAG[se.slug] !== false) continue;
    const kort = se.copy.short.toLowerCase();
    const ubestemt = /(?:en|et|ar)$/.test(kort) ? kort.slice(0, -2) : kort;
    dage.set(se.slug, ubestemt === kort ? [kort] : [kort, ubestemt]);
  }
  return [...dage];
};

describe("det bløde \"helgdag\" på en dag loven ikke tæller", () => {
  test("skärtorsdagen og de andre lovfrie dage må ikke kaldes helgdag i brødteksten", () => {
    const fejl: string[] = [];
    for (const { hændelse, spoergsmaal, tekst } of svenskSætninger()) {
      const spoergsmaaletNævnerLovfriDag = `${spoergsmaal}`.toLowerCase();
      for (const klausul of klausler(tekst)) {
        if (!HELGDAGSORD.test(klausul)) continue;
        if (NEKTER_I_KLAUSUL.test(klausul) || ROED_DAG.test(klausul)) continue;
        const laeg = klausul.toLowerCase();
        // (1) Klauslen navngiver en lovsfri dag, eller (2) den *predikerer*
        // helgdag om den dag dens FAQ-spørgsmål handler om.
        const nævnteITeksten = dageLovenIkkeTæller().filter(([, varianter]) =>
          varianter.some((navn) => laeg.includes(navn)),
        );
        const nævnteISpørgsmålet = PRAEDIKERER_HELGDAG.test(klausul)
          ? dageLovenIkkeTæller().filter(([, varianter]) =>
              varianter.some((navn) => spoergsmaaletNævnerLovfriDag.includes(navn)),
            )
          : [];
        const nævnte = [...new Map([...nævnteITeksten, ...nævnteISpørgsmålet]).keys()];
        if (nævnte.length === 0) continue;
        fejl.push(`${hændelse} nævner ${nævnte.join(" + ")}: ${klausul}`);
      }
    }
    expect(fejl).toEqual([]);
  });

  test("skærtorsdagen er sig selv modsigende uden forskellen mellem röd dag og allmän helgdag", () => {
    const skartorsdagen = DAGE_TIL_EVENTS.find((e) => e.se?.slug === "skartorsdagen");
    const tekster = [
      ...skartorsdagen!.se!.copy.facts,
      ...skartorsdagen!.se!.copy.faq.map((f) => f.answer),
    ];
    // Forskellen skal stå på siden — ellers står der bare en ny modsigelse,
    // hvor "helgdag" var ("en röd dag", uden at nogen siger hvad det er).
    expect(tekster.filter((t) => ROED_DAG.test(t)).length).toBeGreaterThanOrEqual(1);
    expect(tekster.some((t) => t.includes("allmän helgdag") && t.includes(" inte "))).toBe(true);
  });
});

/**
 * Loven tæller **alle søndagar**, ikke kun dem den navngiver.
 *
 * 1 § första stycket: "Med allmän helgdag avses i lag eller annan författning
 * söndagar, däribland påskdagen och pingstdagen". Advent står ikke opptaget i
 * nogen liste — men 1 advent är *alltid* en söndag, så loven tæller den. Det
 * er den ræson, der låste `LOEN_SIGER_HELGDAG["1-advent"]` til `true` 30/9:
 * tabellen sagde `false`, og siden skrev derfor "Första advent är inte en
 * allmän helgdag enligt lag (1989:253)" — den modsagde loven med lovens eget
 * navn, på en side der to linjer længere nede siger at alle søndagar er
 * røde dage.
 *
 * Hændelserne er ikke håndplukkede: `pingstdagen` står ikke i nogen dansk
 * kalenderfil, men er påske + 49 dage, altså en søndag. Derfor regnes her de
 * faktiske datoer, som `LOEN_SIGER_HELGDAG` gør andet sted.
 */
describe("1 § räknar alla söndagar, också dem lagen ikke navngiver", () => {
  const altidSondag: Record<string, (aar: number) => Date> = {
    paskdagen: (aar) => easterSunday(aar),
    pingstdagen: (aar) => new Date(easterSunday(aar).getTime() + 49 * 86_400_000),
    "1-advent": (aar) => forstaAdvent(aar),
  };

  test("en hændelse der altid er en söndag skal være en allmän helgdag i tabellen", () => {
    for (const aar of Array.from({ length: 61 }, (_, i) => 2020 + i)) {
      for (const [slug, dato] of Object.entries(altidSondag)) {
        expect({ slug, aar, ugedag: dato(aar).getUTCDay() }).toEqual({ slug, aar, ugedag: 0 });
        expect(LOEN_SIGER_HELGDAG[slug]).toBe(true);
      }
    }
  });

  /**
   * De søndage loven *ikke* navngiver — dem er søndagsreglen den eneste grund
   * til. Tabellen må sige `true`, **og** siden skal forklare hvorfor, ellers
   * kan næste skrivning finde på at sige "1 advent er ikke en allmän helgdag"
   * igen, denne gang med en anden begrundelse.
   *
   * Påskdagen och pingstdagen er *nævnt* i 1 §, så de behøver ikke den
   * forklaring — derfor står de ikke i denne liste.
   */
  test("dagen loven ikke navngiver skal sige at det er söndagen, der gør den til helgdag", () => {
    for (const slug of ["1-advent"]) {
      expect(LOEN_SIGER_HELGDAG[slug]).toBe(true);
      const hændelse = DAGE_TIL_EVENTS.find((e) => e.se?.slug === slug);
      expect(hændelse?.se).toBeDefined();
      const tekster = [
        ...hændelse!.se!.copy.facts,
        ...hændelse!.se!.copy.faq.map((f) => `${f.question} ${f.answer}`),
      ];
      // Forklaringen skal være en *positiv* sætning: nævner søndagen, nævner
      // helgdagen og benævner den ikke. Ellers slap den gamle tekst igennem på
      // "Adventssöndagarna står inte själva i lagen … om allmänna helgdagar",
      // der nævner begge ord og alligevel modsiger loven.
      const forklarerSondagen = tekster.some((t) =>
        t
          .split(/(?<=[.!?])\s+/)
          .some(
            (sætning) =>
              sætning.includes("söndag") &&
              sætning.includes("helgdag") &&
              !NEKTER_I_KLAUSUL.test(sætning),
          ),
      );
      expect({ slug, forklarerSondagen }).toEqual({ slug, forklarerSondagen: true });
    }
  });
});


/**
 * Ugedags-påstande i brødteksten, målt mod de datoer ankeret faktisk producerer.
 *
 * De 140 håndskrevne sætninger i `DAGE_TIL_EVENTS` siger flere steder hvilken
 * ugedag en dato falder på, og det er kun sandt i *nogle* år, når datoen er
 * fast: 31. december er en hverdag i 2026 (fredag) og en weekend i 2028
 * (søndag), og 23. juni er en weekend i 2029, 2030, 2035 og 2040 — mens
 * siden viser den alle dage. Samme fejlklasse som CEO-køens otte fund: et
 * fast tal i brødteksten, ingen test.
 *
 * Denne port *regner* de datoer ankeret giver, år for år over 61 år (et helt
 * 19-års påske-cyklus-udspil plus alle gregorianske skudårs-mønstre), og
 * kræver at påstandene følger med. Den fandt tre fejl, alle forkerte i sig
 * selv: nytårsaften kaldte 31. december en hverdag og en vardag uden
 * forbehold, sankthans kaldte 23. juni "en almindelig hverdag", og dansk
 * skærtorsdag svarede på "er skærtorsdag en fridag?" med "ja, den er en
 * fridag" — på en side der to linjer ovenfor siger at den *altid* er en
 * torsdag.
 *
 * ⚠️ Formen er snæver med vilje. En bredere version ("enhver nævnt ugedag
 * skal være blandt ankerets dage") gav 15 fund, hvor 13 var *om andre
 * dage* — "Fredagen efter Kristi himmelfartsdag er en hverdag", "den
 * sidste lørdag i juni" — altså rigtig tekst, som et målescript ville have
 * tvunget til at blive ødelagt. Det er præcis F8's målerfælde, og derfor
 * testes de to påstande, der faktisk er forkerte, og ikke alle ord i
 * brødteksten.
 */
const UGE_AAR = Array.from({ length: 61 }, (_, i) => 2020 + i);

/** Søndag = 0, som `Date.getUTCDay()`. */
const UGEDAG_DA = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  // "fridag" er dansk for *fri dag* (dag fri fra arbejde), ikke for fredagen.
  // Det tages med, fordi spørgsmålet "er skærtorsdag en fridag?" engang blev
  // besvaret med "ja, den er en fridag" — altså en påstand om fredagen, på en
  // torsdag. Svaret på et sådant spørgsmål er altid "nej", fordi ingen
  // dansk helligdag automatisk giver dagpenge.
  "fridag",
];
const UGEDAG_SE = [
  "söndag",
  "måndag",
  "tisdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lördag",
];

/**
 * "fridag" står i to FAQ-spørgsmål. Det er dansk for *fri dag* (dag fri fra
 * arbejde), ikke for fredagen — svaret på begge er "nej", fordi hverken
 * nytårsdagen eller skærtorsdag automatisk giver en fri dag.
 */
const FRIDAG_DA = 5;

const hverdagsDage = new Set([1, 2, 3, 4, 5]);

/** De ugedage et anker faktisk falder på, målt år for år. */
const muligeUgedage = (anchor: (typeof DAGE_TIL_EVENTS)[number]["anchor"]["da"]) => {
  const dage = new Set<number>();
  for (const aar of UGE_AAR) {
    // 1. januar som "i dag" giver altid ankeret i *samme* år, fordi intet
    // anker ligger før nytår — getNextAnchorDate ruller først videre til næste
    // år, når dagens dato er efter kandidaten.
    dage.add(getNextAnchorDate(anchor, new Date(Date.UTC(aar, 0, 1))).getUTCDay());
  }
  return dage;
};

const alleTekster = (arm: (typeof DAGE_TIL_EVENTS)[number]["da"] | undefined) =>
  arm
    ? [...arm.copy.facts, ...arm.copy.faq.map((f) => `${f.question} ${f.answer}`)]
    : [];

describe("ugedags-påstande mod de datoer ankeret producerer", () => {
  test("en dato der også kan ligge i en weekend kaldes ikke hverdag uden forbehold", () => {
    // Et forbehold tæller, hvis det står i samme sætning — sådan skriver
    // brødteksten allerede om en fast dato der skifter ugedag: "uanset om den
    // falder på en hverdag eller en weekend", "kan være alle ugedage". En
    // ledsætning tælder også ("der er halv fridag, *når* grundlovsdagen
    // holdes på en hverdag"), fordi den gør påstanden betinget i stedet for
    // ubetinget. Det er de to måder, brødteksten gør det rigtige på.
    const sprog = [
      {
        id: "da" as const,
        helg: /\bhverdage?n?\b/gi,
        forbehold:
          /\b(uanset|afhængig|kan falde|kan ligge|ikke altid|weekend|lørdag|søndag|fredag)\b/i,
        betingelse: /\b(når|hvis|om|efter)\b[^.!?]{0,45}$/i,
      },
      {
        id: "se" as const,
        helg: /\bvardag(en|ar|arna)?\b/gi,
        forbehold:
          /\b(oavsett|beroende|kan infalla|kan falla|inte alltid|veckoslut|lördag|söndag|fredag)\b/i,
        betingelse: /\b(när|hvis|om|efter)\b[^.!?]{0,45}$/i,
      },
    ];
    const fejl: string[] = [];
    for (const event of DAGE_TIL_EVENTS) {
      for (const { id, helg, forbehold, betingelse } of sprog) {
        const arm = id === "da" ? event.da : event.se;
        if (!arm) continue;
        const mulige = muligeUgedage(anchorOf(event, id));
        const kanVæreWeekend = [...mulige].some((dag) => !hverdagsDage.has(dag));
        if (!kanVæreWeekend) continue;
        for (const tekst of alleTekster(arm)) {
          helg.lastIndex = 0;
          for (const traefe of tekst.matchAll(helg)) {
            const foran = tekst.slice(Math.max(0, traefe.index - 40), traefe.index);
            if (forbehold.test(tekst) || betingelse.test(foran)) continue;
            fejl.push(
              `${event.id} (${id}): "${tekst}" — dage ${[...mulige].sort().join(",")}`
            );
          }
        }
      }
    }
    expect(fejl).toEqual([]);
  });

  test("et 'er X en <ugedag>'-spørgsmål med ja-svar skal ramme en dag ankeret kan falde på", () => {
    // Kun "ja"-svar tjekkes: "er nytårsdagen altid en fridag?" har korrekt svaret
    // "nej, den kan være alle ugedage", og et nej-svar kan ikke være en
    // påstand om ugedagen.
    const fejl: string[] = [];
    for (const event of DAGE_TIL_EVENTS) {
      for (const [id, arm, ugedage] of [
        ["da", event.da, UGEDAG_DA],
        ["se", event.se, UGEDAG_SE],
      ] as const) {
        if (!arm) continue;
        const mulige = muligeUgedage(anchorOf(event, id));
        for (const faq of arm.copy.faq) {
          const spg = new RegExp(`\\b(?:er|är) .* en (${ugedage.join("|")})\\?`, "i").exec(
            faq.question
          );
          if (!spg) continue;
          const svar = faq.answer.toLowerCase();
          if (!svar.startsWith("ja")) continue;
          const index = ugedage.indexOf(spg[1].toLowerCase());
          if (index !== -1 && !mulige.has(index)) {
            fejl.push(`${event.id} (${id}): "${faq.question}" → "${faq.answer}"`);
          }
        }
      }
    }
    expect(fejl).toEqual([]);
  });

  test("skærtorsdag er en torsdag, og spørgsmålet om 'fridag' har et nej-svar", () => {
    // "fridag" er fri dag, ikke fredag, så den skal ikke læses som en ugedag —
    // men svaret på spørgsmålet skal alligevel være et nej, fordi skærtorsdag
    // ikke automatisk giver dagpenge. Låst, fordi det er den her fejlklasse:
    // et spørgsmål der læser "fredag" og svarer "ja".
    const skaertorsdag = DAGE_TIL_EVENTS.find((e) => e.da.slug === "skaertorsdag");
    const faq = skaertorsdag?.da.copy.faq.find((f) => f.question.includes("fridag"));
    expect(faq).toBeDefined();
    expect(faq?.answer.startsWith("Nej")).toBe(true);
    expect(muligeUgedage(anchorOf(skaertorsdag!, "da"))).toEqual(new Set([4]));
    expect(FRIDAG_DA).not.toBe(4);
  });
});

// Tre nye kalenderdatoer, bygget 1/10 efter autocomplete på dansk (hl=da,
// gl=dk) og svensk (hl=sv, gl=se): "fastelavn" har 10 af 10 completioner, og
// "hvor mange dage er der til fastelavn" er en completion i sig selv; både
// "palmesøndag" og "2 juledag" har årstal-varianter ("palmesøndag 2026",
// "2 juledag 2026 dato"). De tre er computable uden nogen ny kilde: 26.
// december er fast, og de to andre er påskedagen minus henholdsvis 47 og 7
// dage. De forventede datoer er slået op i en kalender og ikke udregnet af
// samme påskeformel som koden — ellers kunne en forkert offset være sit eget
// bevis.
describe("fastelavn, palmesøndag og 2. juledag (1/10)", () => {
  // 2026 påske er 5. april, 2027 er 28. marts, 2028 er 16. april.
  test.each([
    ["fastelavn", "2026-02-17", "2027-02-09", 2],
    ["palmesondag", "2026-03-29", "2027-03-21", 0],
  ] as const)(
    "%s er %s i 2026 og %s i 2027, og er altid uge %i",
    (id, i2026, i2027, ugedag) => {
      const event = eventById(id);
      for (const locale of ["da", "se"] as const) {
        expect(toISO(getNextAnchorDate(anchorOf(event, locale), iso("2026-01-01"))), `${id}/${locale}`).toBe(i2026);
        expect(toISO(getNextAnchorDate(anchorOf(event, locale), iso("2027-01-01"))), `${id}/${locale}`).toBe(i2027);
        // Begge datoer ligger efter 1. januar hvert år (3/2–9/3 og 15/3–18/4),
        // så 1. januar som "i dag" finder altid årets egen forekomst.
        for (let year = 1990; year <= 2050; year++) {
          const dato = getNextAnchorDate(anchorOf(event, locale), iso(`${year}-01-01`));
          expect(dato.getUTCDay(), `${id}/${locale}/${year}`).toBe(ugedag);
        }
      }
    }
  );

  test("2. juledag er fast 26. december i begge sprog", () => {
    const event = eventById("juledag-2");
    for (const locale of ["da", "se"] as const) {
      expect(anchorOf(event, locale), locale).toMatchObject({ kind: "fixed", month: 12, day: 26 });
      for (const [iDag, forventet] of [
        ["2026-01-01", "2026-12-26"],
        ["2027-01-01", "2027-12-26"],
        // Efter julen er næste 2. juledag et helt år senere, ikke den i år.
        ["2027-12-27", "2028-12-26"],
      ] as const) {
        expect(toISO(getNextAnchorDate(anchorOf(event, locale), iso(iDag))), `${locale}/${iDag}`).toBe(forventet);
      }
      // 27. december er før julen er om igen: næste 2. juledag er 364 dage
      // senere, altså det trecifrede dag-tal titlen skal have plads til.
      expect(daysBetween(iso("2026-12-27"), getNextAnchorDate(anchorOf(event, locale), iso("2026-12-27")))).toBe(364);
    }
  });

  test("hvert sprog har sit eget slug, og den anden sprogvariant redirectes", () => {
    for (const [da, se] of [
      ["2-juledag", "annandag-jul"],
      ["fastelavn", "fettisdagen"],
      ["palmesondag", "palmsondagen"],
    ] as const) {
      expect(getDageTilSlugs("da"), da).toContain(da);
      expect(getDageTilSlugs("se"), se).toContain(se);
      expect(resolveDageTilSlug(se, "da")?.localeSlug, se).toBe(da);
      expect(resolveDageTilSlug(da, "se")?.localeSlug, da).toBe(se);
    }
  });

  test("2. juledags spørgsmål har datoen med — den del Google viser", () => {
    // Samme lektion som juleaften: "2 juledag dato" og "2 juledag 2026" er to
    // af ti completioner under "2 juledag" (autocomplete 1/10), så datoen skal
    // stå i spørgsmålet. Titlen er `${question} ${count}`, og 26. december er
    // fast, så den skal også have plads til " 364 dage".
    const spg = armOf(eventById("juledag-2"), "da").copy.question;
    expect(spg).toBe("Hvor mange dage er der til 2. juledag 26. december?");
    expect(`${spg} 364 dage`.length).toBeLessThanOrEqual(60);
    // Svensk må ikke få samme dato ind i spørgsmålet: "dagar" er fem tegn mod
    // dansk "dage", og det ville skubbe titlen over de 60 tegn.
    expect(`${armOf(eventById("juledag-2"), "se").copy.question} 364 dagar`.length).toBeLessThanOrEqual(60);
  });

  test("de to påske-ankrede datoer har ingen uge- eller lovpåstand uden kilde", () => {
    // De må ikke sige det samme om helligdagsstatus som en fast dato, fordi de
    // falder på forskellige ugedage — de påstande skal være dem, der gælder
    // uanset år. Kun "påskedagen minus N dage" og de to ugedage er sådan.
    for (const id of ["fastelavn", "palmesondag"]) {
      for (const locale of ["da", "se"] as const) {
        const tekst = alleTekster(armOf(eventById(id), locale)).join(" ");
        expect(tekst, `${id}/${locale}`).toMatch(
          locale === "da" ? /påskedagen minus \d+ dage/ : /påskdagen minus \d+ dagar/
        );
      }
    }
  });
});
