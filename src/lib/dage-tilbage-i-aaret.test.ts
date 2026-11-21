/**
 * Porten for «hvor mange dage er der tilbage af året». Den holder fast ved to
 * ting: **tallet skal være det rigtige** (målt mod en uafhængig optælling af
 * kalenderdagene, ikke mod `aaretTilbage` selv), og **dagen i dag tælles aldrag
 * med** — den samme regel som `/dato`, `/dage-til` og `aarsoversigt.tilbage` på
 * `/dage-i-aaret`, så de to sider ikke kan svare forskelligt.
 *
 * Hver test kører med et fast ur, så et årsskifte eller en skudmarsændring
 * ikke kan flytte tallene.
 */
import { describe, expect, test } from "vitest";
import {
  aaretTilbage,
  DAGE_TILBAGE_PATH,
  dageTilbageIAaretAfsnit,
  dageTilbageIAaretCopy,
  dageTilbageIAaretFaq,
  getDageTilbagePath,
  isDageTilbageLocale,
  type DageTilbageLocale,
} from "./dage-tilbage-i-aaret";

/**
 * Dagen på dagen, uafhængig af modulet under test. 2026-10-10 er en lørdag med
 * 82 kalenderdage tilbage til årets sidste dag (10. oktober → 31. december).
 */
const I_DAG = new Date(2026, 9, 10, 12, 0, 0);

/** Kalenderdage mellem to ISO-datoer, uden regnestykket fra modulet. */
function dage(fra: string, til: string): number {
  const a = new Date(`${fra}T00:00:00Z`).getTime();
  const b = new Date(`${til}T00:00:00Z`).getTime();
  return (b - a) / 86400000;
}

/** Hverdage (man-fre) i det lukkede interval, uden helligdagstabelen. */
function hverdage(fra: string, til: string): number {
  const slut = new Date(`${til}T00:00:00Z`).getTime();
  let n = 0;
  for (let t = new Date(`${fra}T00:00:00Z`).getTime(); t <= slut; t += 86400000) {
    const dag = new Date(t).getUTCDay();
    if (dag !== 0 && dag !== 6) n += 1;
  }
  return n;
}

describe("dage tilbage i året: sprog og sti", () => {
  test("kender de to sprog og deres egne stier", () => {
    expect(isDageTilbageLocale("da")).toBe(true);
    expect(isDageTilbageLocale("se")).toBe(true);
    expect(isDageTilbageLocale("no")).toBe(false);
    expect(DAGE_TILBAGE_PATH).toEqual({
      da: "/dage-tilbage-i-aaret",
      se: "/dagar-kvar-i-aret",
    });
    expect(getDageTilbagePath("da")).toBe("/dage-tilbage-i-aaret");
    expect(getDageTilbagePath("se")).toBe("/dagar-kvar-i-aret");
    expect(getDageTilbagePath("no")).toBeNull();
  });
});

describe("aaretTilbage: tallene stemmer med kalenderen", () => {
  test("10. oktober 2026 har 82 dage tilbage, 11 uger og 5 dage", () => {
    const o = aaretTilbage("da", I_DAG);
    expect(o.aar).toBe(2026);
    expect(o.dageIAlt).toBe(365);
    expect(o.dageTilbage).toBe(dage("2026-10-10", "2026-12-31"));
    expect(o.dageTilbage).toBe(82);
    expect(o.medIDag).toBe(83);
    expect(o.uger).toBe(11);
    expect(o.restDage).toBe(5);
    expect(o.timer).toBe(82 * 24);
    expect(o.dageForbi).toBe(365 - 1 - 82);
    expect(o.procentForbi).toBe(77.3);
  });

  test("month table only lists months with days left, counted from tomorrow", () => {
    const o = aaretTilbage("da", I_DAG);
    expect(o.maaneder.map((m) => [m.name, m.dageTilbage, m.hverdageTilbage])).toEqual(
      [
        ["oktober", 21, 15],
        ["november", 30, 21],
        ["december", 31, 20],
      ]
    );
    // December's three extra days are the holidays and New Year's Eve, which
    // is why the working days fall short of the calendar days.
    expect(o.maaneder[2]?.hverdageTilbage).toBeLessThan(o.maaneder[2]?.dageTilbage);
  });

  test("resten af året følger helligdagstabelen", () => {
    const o = aaretTilbage("da", I_DAG);
    expect(o.hverdageTilbage).toBeLessThan(o.dageTilbage);
    expect(o.hverdageTilbage).toBe(56);
    expect(o.helligdageTilbage.map((h) => h.navn)).toEqual([
      "Juleaftensdag",
      "Juledag",
      "2. juledag",
    ]);
    expect(o.helligdageTilbage[0]?.iso).toBe("2026-12-24");
    expect(o.helligdageTilbage[0]?.ugedag).toBe("Torsdag");
    expect(o.helligdageTilbage[1]?.ugedag).toBe("Fredag");
  });

  test("årets sidste dag og næste års første er rokket i kalenderen", () => {
    const o = aaretTilbage("da", I_DAG);
    expect(o.sidsteDagIso).toBe("2026-12-31");
    expect(o.sidsteDagUgedag).toBe("Torsdag");
    expect(o.foersteDagIso).toBe("2027-01-01");
    expect(o.foersteDagUgedag).toBe("Fredag");
    expect(o.naesteAar).toBe(2027);
  });

  test("100-dages-mærket er dagen der ligger 100 dage før årets sidste", () => {
    const o = aaretTilbage("da", I_DAG);
    expect(o.hundredeDageIso).toBe("2026-09-22");
    expect(o.hundredeDageUgedag).toBe("Tirsdag");
    expect(dage(o.hundredeDageIso, o.sidsteDagIso)).toBe(100);
    expect(o.hundredeDagePasseret).toBe(true);
  });

  test("nytårsaften er 0 dage tilbage, ikke 1", () => {
    const o = aaretTilbage("da", new Date(2026, 11, 31, 12, 0, 0));
    expect(o.dageTilbage).toBe(0);
    expect(o.medIDag).toBe(1);
    expect(o.uger).toBe(0);
    expect(o.hverdageTilbage).toBe(0);
    expect(o.maaneder).toHaveLength(1);
    expect(o.maaneder[0]?.dageTilbage).toBe(0);
    expect(o.helligdageTilbage).toHaveLength(0);
  });

  test("1. januar har hele året tilbage", () => {
    const o = aaretTilbage("da", new Date(2027, 0, 1, 12, 0, 0));
    expect(o.aar).toBe(2027);
    expect(o.dageIAlt).toBe(365);
    expect(o.dageTilbage).toBe(364);
    expect(o.dageForbi).toBe(0);
    expect(o.procentForbi).toBe(0);
    expect(o.maaneder).toHaveLength(12);
  });

  test("skudår tæller 366 dage og holder 29. februar med", () => {
    const o = aaretTilbage("da", new Date(2028, 11, 31, 12, 0, 0));
    expect(o.dageIAlt).toBe(366);
    expect(o.dageTilbage).toBe(0);
    const januar = aaretTilbage("da", new Date(2028, 0, 1, 12, 0, 0));
    expect(januar.dageTilbage).toBe(366 - 1);
  });

  test("svensk side bruger svenske månedsnavne og ugedage", () => {
    const o = aaretTilbage("se", I_DAG);
    expect(o.dageTilbage).toBe(82);
    expect(o.maaneder[0]?.name).toBe("oktober");
    // Svenske helligdage frem til årsudgangen: alla helgons dag (31/10),
    // julafton, juldagen och annandag jul — plus nyårsafton, som den svenske
    // liste regner med. 6. januari och 1. maj ligger allerede bag 10. oktober.
    expect(o.helligdageTilbage.map((h) => h.navn)).toEqual([
      "Alla helgons dag",
      "Julafton",
      "Juldagen",
      "Annandag jul",
      "Nyårsafton",
    ]);
    expect(o.hverdageTilbage).toBe(56);
  });

  test("dagen før vintertid skifter ikke tallet", () => {
    // 25. oktober 2026 er den dag natten bliver 25 timer lang, så et tillæg på
    // 24 timer lander på den 25. oktober igen.
    const o = aaretTilbage("da", new Date(2026, 9, 25, 12, 0, 0));
    expect(o.dageTilbage).toBe(dage("2026-10-25", "2026-12-31"));
    expect(o.maaneder.map((m) => m.dageTilbage)).toEqual([6, 30, 31]);
    expect(o.maaneder[0]?.hverdageTilbage).toBe(5);
  });
});

describe("dage tilbage i året: teksten siger det tallet der er regnet", () => {
  test("FAQ'en nævner dage, uger, hverdage og årsskiftet", () => {
    const faq = dageTilbageIAaretFaq("da", I_DAG);
    const svar = faq.map((f) => `${f.question} ${f.answer}`).join(" ");
    expect(faq[0]?.question).toBe("Hvor mange dage er der tilbage af året?");
    expect(svar).toContain("82 dage tilbage af 2026");
    expect(svar).toContain("11 hele uger og 5 dage");
    expect(svar).toContain("83 dage");
    expect(svar).toContain("22. september 2026");
    expect(svar).toContain("56 hverdage");
    expect(svar).toContain("3 helligdage");
    expect(svar).toContain("31. december");
    expect(svar).toContain("1. januar 2027");
  });

  test("brødteksten bruger samme tal som tabellen", () => {
    const afsnit = dageTilbageIAaretAfsnit("da", I_DAG);
    const tekst = afsnit.map((a) => `${a.overskrift} ${a.brødtekst}`).join(" ");
    expect(tekst).toContain("82 dage tilbage af 2026");
    expect(tekst).toContain("1.968 timer");
    expect(tekst).toContain("77,3 % af året");
    expect(tekst).toContain("56 hverdage");
  });

  test("begge sprog har egen copy uden årstal i overskrifterne", () => {
    for (const locale of ["da", "se"] as DageTilbageLocale[]) {
      const c = dageTilbageIAaretCopy[locale];
      expect(c.h1).not.toMatch(/20\d\d/);
      expect(c.lead.length).toBeLessThanOrEqual(160);
      expect(c.titelSpoergsmaal.length).toBeGreaterThan(10);
    }
  });

  test("hverdage er flere end helligdagene, men færre end kalenderdagene", () => {
    const o = aaretTilbage("da", I_DAG);
    // Man-fre tæller 59 dage i intervallet; tre af dem er helligdage eller
    // nytårsaften, og det er den forskel mellem 59 og 56.
    expect(hverdage("2026-10-11", "2026-12-31")).toBe(59);
    expect(o.hverdageTilbage).toBe(56);
  });
});
