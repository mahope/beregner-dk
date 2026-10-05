import { describe, test, expect } from "vitest";
import { getTrendingHrefs } from "./trending";

// The gate must judge the site's timezone, not the machine's, so the machine is
// pinned to UTC here. Without it this file passes on a Danish developer machine
// no matter what `getTrendingHrefs` does: the machine's calendar month *is* the
// site's calendar month, which is why the original bug survived — a clock moved
// with `vi.setSystemTime` agreed with the buggy code on every day of the year.
// GitHub Actions already runs in UTC, so this only makes the local run as
// strict as CI.
process.env.TZ = "UTC";

/**
 * Independent reference for the site's calendar month, read through `Intl`
 * rather than through the code under test.
 */
function monthInCopenhagen(dato: Date): number {
  const maaned = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Copenhagen",
    month: "numeric",
  }).format(dato);
  return Number(maaned) - 1; // 0-indexed
}

/** One calculator from each season, so a case can only pass on the right one. */
const SAESON = {
  aarsopgoerelse: "/loen-efter-skat",
  sommer: "/feriepenge",
  studiestart: "/su",
  aarsslut: "/opsparing",
} as const;

/**
 * The four season-turning days. A season turns at 00:00 local time, which is
 * 23:00 UTC in CET (1 January) and 22:00 UTC in CEST (1 April, 1 August,
 * 1 October). `foer` is 30 minutes before that hour and `efter` 30 minutes
 * into it — the two hours where UTC still stands in the previous month.
 */
const SKIFTEDAGE = [
  { foer: "2025-12-31T22:30:00Z", efter: "2025-12-31T23:30:00Z" },
  { foer: "2026-03-31T21:30:00Z", efter: "2026-03-31T22:30:00Z" },
  { foer: "2026-07-31T21:30:00Z", efter: "2026-07-31T22:30:00Z" },
  { foer: "2026-09-30T21:30:00Z", efter: "2026-09-30T22:30:00Z" },
] as const;

describe("getTrendingHrefs", () => {
  test("alle tolv måneder giver tre hrefs med /-start", () => {
    for (let m = 0; m < 12; m++) {
      const result = getTrendingHrefs(new Date(Date.UTC(2026, m, 15, 12, 0)), "da");
      expect(result).toHaveLength(3);
      for (const href of result) {
        expect(href).toMatch(/^\//);
      }
    }
  });

  test("sæsonen følger kalendermåneden i Europe/Copenhagen hele året", () => {
    for (let m = 0; m < 12; m++) {
      // 02:30 UTC er 03:30/04:30 dansk tid, altså formiddag i hver måned;
      // grænsen mellem to måneder dømmes i de næste tests.
      const dato = new Date(Date.UTC(2026, m, 15, 2, 30));
      expect(monthInCopenhagen(dato)).toBe(m);

      const hrefs = getTrendingHrefs(dato, "da");
      if (m <= 2) expect(hrefs).toContain(SAESON.aarsopgoerelse);
      else if (m <= 6) expect(hrefs).toContain(SAESON.sommer);
      else if (m <= 8) expect(hrefs).toContain(SAESON.studiestart);
      else expect(hrefs).toContain(SAESON.aarsslut);
    }
  });

  test("på de fire skiftedage er det præcis 00:00 dansk tid der skifter", () => {
    for (const { foer, efter } of SKIFTEDAGE) {
      const foerDato = new Date(foer);
      const efterDato = new Date(efter);

      // Bevis på at døgnet er det interessante: lige efter skiftet er UTC
      // stadig i den forrige måned, så `getMonth()` ville svare forkert.
      expect(monthInCopenhagen(foerDato)).toBe(foerDato.getUTCMonth());
      expect(monthInCopenhagen(efterDato)).not.toBe(efterDato.getUTCMonth());

      expect(getTrendingHrefs(foerDato, "da")).not.toEqual(
        getTrendingHrefs(efterDato, "da"),
      );
    }
  });

  test("31. december kl. 23:30 dansk tid er stadig sidste sæson, 00:30 er årsopgørelse", () => {
    const nytaar = getTrendingHrefs(new Date("2025-12-31T22:30:00Z"), "da");
    expect(nytaar).toContain(SAESON.aarsslut);
    expect(nytaar).not.toContain(SAESON.aarsopgoerelse);

    const nytAarMorgen = getTrendingHrefs(new Date("2025-12-31T23:30:00Z"), "da");
    expect(nytAarMorgen).toContain(SAESON.aarsopgoerelse);
    expect(nytAarMorgen).not.toContain(SAESON.aarsslut);
  });

  test("de tre sommerlige skiftedage skifter til den nye sæson", () => {
    expect(getTrendingHrefs(new Date("2026-03-31T22:30:00Z"), "da")).toContain(SAESON.sommer);
    expect(getTrendingHrefs(new Date("2026-07-31T22:30:00Z"), "da")).toContain(
      SAESON.studiestart,
    );
    expect(getTrendingHrefs(new Date("2026-09-30T22:30:00Z"), "da")).toContain(SAESON.aarsslut);
  });

  test("den svenske udgave læser svensk tid — samme sæson som den danske", () => {
    // Danmark og Sverige deler CET/CEST, så de to lokaler er enige hele året.
    // Porten siger det eksplicit, så en fremtidig tidszone-ændring ikke kan
    // gøre de to hjemmesider uenige uden at porten bliver rød.
    for (const { foer, efter } of SKIFTEDAGE) {
      expect(getTrendingHrefs(new Date(foer), "se")).toEqual(getTrendingHrefs(new Date(foer), "da"));
      expect(getTrendingHrefs(new Date(efter), "se")).toEqual(
        getTrendingHrefs(new Date(efter), "da"),
      );
    }
  });
});
