import { describe, expect, test } from "vitest";
import {
  DAGE_PER_UGE,
  FERIEUGER,
  getUgerIAaretPath,
  isUgerLocale,
  ugerCopy,
  ugerFaq,
  ugerOversigt,
  UGER_I_ARET_PATH,
} from "./uger-i-aret";

/**
 * Siden svarer på «hvor mange uger er der på et år» og de ni søskende fra
 * autocomplete. Testen dømmer de tal, en læser kan tjekke i hovedet: 365 dage
 * er 52 uger og 1 dag, et skudår giver 2 dage til overs, og 2026 har 53
 * ISO-uger fordi 1. januar er en torsdag. Alle datoer sendes som faste
 * tidspunkter, så testen ikke afhænger af maskinens ur eller tidszone.
 */
const SOMMER = new Date("2026-06-15T12:00:00Z");

describe("uger-i-aret: stier", () => {
  test("hvert sprog har sin egen sti", () => {
    expect(UGER_I_ARET_PATH.da).toBe("/uger-i-aret");
    expect(UGER_I_ARET_PATH.se).toBe("/veckor-i-aret");
    expect(getUgerIAaretPath("da")).toBe("/uger-i-aret");
    expect(getUgerIAaretPath("se")).toBe("/veckor-i-aret");
    expect(getUgerIAaretPath("no")).toBeNull();
    expect(isUgerLocale("no")).toBe(false);
  });
});

describe("uger-i-aret: årets uger", () => {
  test("2026 har 365 dage = 52 uger og 1 dag", () => {
    const o = ugerOversigt("da", SOMMER);
    expect(o.aar).toBe(2026);
    expect(o.dage).toBe(365);
    expect(o.skudaar).toBe(false);
    expect(o.uger).toBe(52);
    expect(o.restDage).toBe(1);
    expect(o.uger * DAGE_PER_UGE + o.restDage).toBe(o.dage);
  });

  test("2026 har 53 ISO-uger, fordi 1. januar er en torsdag", () => {
    expect(ugerOversigt("da", SOMMER).isoUger).toBe(53);
  });

  test("et skudår har 366 dage = 52 uger og 2 dage", () => {
    const o = ugerOversigt("da", new Date("2028-06-15T12:00:00Z"));
    expect(o.aar).toBe(2028);
    expect(o.dage).toBe(366);
    expect(o.skudaar).toBe(true);
    expect(o.uger).toBe(52);
    expect(o.restDage).toBe(2);
  });

  test("dagens dato læses i Europe/Copenhagen, ikke UTC", () => {
    // 31. december 2026 kl. 23:30 UTC er 1. januar 2027 kl. 00:30 i Danmark,
    // så året skal være 2027 — ikke 2026, som serverens UTC-ur ville sige.
    const o = ugerOversigt("da", new Date("2026-12-31T23:30:00Z"));
    expect(o.aar).toBe(2027);
  });

  test("hver måned har uger og restdage der summer til månedens dage", () => {
    const o = ugerOversigt("da", SOMMER);
    expect(o.maaneder).toHaveLength(12);
    for (const m of o.maaneder) {
      expect(m.uger * DAGE_PER_UGE + m.restDage).toBe(m.maaned.dage);
    }
    const februar = o.maaneder.find((m) => m.maaned.month === 2)!;
    expect(februar.uger).toBe(4);
    expect(februar.restDage).toBe(0);
  });
});

describe("uger-i-aret: perioder og ferie", () => {
  test("uge, to uger og hele året har de rigtige ugetal", () => {
    const o = ugerOversigt("da", SOMMER);
    const uge = o.perioder.find((p) => p.id === "uge")!;
    const to = o.perioder.find((p) => p.id === "to-uger")!;
    const aar = o.perioder.find((p) => p.id === "aar")!;
    expect(uge).toMatchObject({ dage: 7, uger: 1, restDage: 0 });
    expect(to).toMatchObject({ dage: 14, uger: 2, restDage: 0 });
    expect(aar).toMatchObject({ dage: 365, uger: 52, restDage: 1 });
  });

  test("et halvt år er 26 uger og 1 dag", () => {
    const halvaar = ugerOversigt("da", SOMMER).perioder.find(
      (p) => p.id === "halvaar"
    )!;
    expect(halvaar.uger).toBe(26);
    expect(halvaar.restDage).toBe(1);
  });

  test("fem ugers ferie efterlader 47 arbejdsuger", () => {
    const o = ugerOversigt("da", SOMMER);
    expect(o.ferie).toHaveLength(FERIEUGER.length);
    expect(o.ferie[0]).toEqual({ uger: 5, arbejdsuger: 47 });
    expect(o.ferie[1]).toEqual({ uger: 6, arbejdsuger: 46 });
  });
});

describe("uger-i-aret: FAQ og copy", () => {
  test("fem spørgsmål, alle besvaret ud fra det regnede år", () => {
    for (const locale of ["da", "se"] as const) {
      const faq = ugerFaq(locale, SOMMER);
      expect(faq).toHaveLength(5);
      for (const svar of faq) {
        expect(svar.question.length).toBeGreaterThan(0);
        expect(svar.answer.length).toBeGreaterThan(20);
      }
      // Året står i årssvaret og i nedtællingen til jul — altså de svar der
      // nævner et kalenderår — så et nyt år ikke kan give en gammel sætning.
      const samlet = faq.map((f) => f.answer).join(" ");
      expect(samlet).toContain("2026");
    }
  });

  test("title og description er under 160 tegn i begge sprog", () => {
    for (const locale of ["da", "se"] as const) {
      const c = ugerCopy[locale];
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.title.length).toBeLessThanOrEqual(160);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.description.length).toBeLessThanOrEqual(160);
    }
  });

  test("h1 rammer søgningen ordret", () => {
    expect(ugerCopy.da.h1.toLowerCase()).toContain("hvor mange uger");
    expect(ugerCopy.se.h1.toLowerCase()).toContain("hur många veckor");
  });
});
