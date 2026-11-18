import { describe, expect, test } from "vitest";
import {
  ALLE_LAANGIVERE,
  MAKS_ALDER_DAGE,
  alderIDage,
  formatHentetDato,
} from "./kredit-eksempler";

const medEksempel = ALLE_LAANGIVERE.filter((l) => l.eksempel !== null);

describe("kredit-eksempler", () => {
  // Fails on purpose when an example goes stale: refetch it from the lender's
  // page and update the figures and `hentet`, or set `eksempel: null`.
  test.each(medEksempel.map((l) => [l.navn, l.eksempel!.hentet]))(
    `%s: eksemplet er højst ${MAKS_ALDER_DAGE} dage gammelt (hentet %s)`,
    (_navn, hentet) => {
      expect(alderIDage(hentet)).toBeGreaterThanOrEqual(0);
      expect(alderIDage(hentet)).toBeLessThanOrEqual(MAKS_ALDER_DAGE);
    },
  );

  test.each(medEksempel.map((l) => [l.navn, l.eksempel!]))(
    "%s: eksemplet har alle lovpligtige felter og en https-kilde",
    (_navn, e) => {
      for (const felt of [
        e.samletKreditbeloeb,
        e.loebetid,
        e.debitorrente,
        e.aop,
        e.maanedligYdelse,
        e.samledeKreditomkostninger,
        e.samletTilbagebetaling,
      ]) {
        expect(felt.trim()).not.toBe("");
      }
      expect(e.kilde).toMatch(/^https:\/\//);
      if (e.debitorrenteKilde) expect(e.debitorrenteKilde.url).toMatch(/^https:\/\//);
    },
  );

  test("alderIDage tæller hele dage", () => {
    expect(alderIDage("2026-11-18", new Date("2027-02-16T12:00:00Z"))).toBe(90);
    expect(alderIDage("2026-11-18", new Date("2027-02-17T00:00:00Z"))).toBe(91);
  });

  test("formatHentetDato skriver datoen på dansk", () => {
    expect(formatHentetDato("2026-11-18")).toBe("18. november 2026");
  });
});
