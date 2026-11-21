import { describe, expect, test, vi } from "vitest";
import { getPageData, getAvailableSlugs } from "./page-data";
import { getDomainConfigByLocale } from "./domain-config";
import { getCurrentDomainConfig } from "./get-locale";
import { buildDageTilMetadata } from "@/components/DageTilPage";

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/**
 * GSC 22/10-19/11-2026: sider med høj placering og lav CTR. Hver linje er
 * søgeintentionen, titlen skal svare på.
 */
describe("titler målrettet GSC-søgninger (da)", () => {
  test("/tidszone: titlen svarer på 'hvilken tidszone er Danmark'", () => {
    const d = getPageData("tidszone", "da")!;
    expect(d.metaTitle).toBe("Tidszoner: Danmark er CET (UTC+1), sommertid CEST (UTC+2)");
    expect(d.metaTitle.length).toBeLessThanOrEqual(60);
    expect(d.ogTitle).toBe(d.metaTitle);
    expect(d.metaDescription).toContain("Hvilken tidszone er Danmark i?");
    expect(d.metaDescription.length).toBeLessThanOrEqual(160);
  });

  test("/dato: titlen dækker 'dage mellem to datoer', H1 'antal dage mellem to datoer'", () => {
    const d = getPageData("dato", "da")!;
    expect(d.metaTitle).toContain("dage mellem to datoer");
    expect(d.ogTitle).toBe(d.metaTitle);
    expect(d.metaTitle).not.toMatch(/1\. december/);
    expect(d.title.toLowerCase()).toContain("antal dage mellem to datoer");
  });

  test("/ugenummer: titlen svarer på 'hvilken uge er vi i'", () => {
    const d = getPageData("ugenummer", "da")!;
    expect(d.metaTitle.toLowerCase()).toContain("hvilken uge er vi i");
    expect(d.metaTitle.toLowerCase()).toContain("ugenummer");
    expect(d.metaTitle.length).toBeLessThanOrEqual(60);
  });

  test("/boligstoette: titlen matcher 'boligstøtte beregner uden login'", () => {
    const d = getPageData("boligstoette", "da")!;
    expect(d.metaTitle.toLowerCase()).toContain("boligstøtte beregner uden login");
    expect(d.metaTitle.length).toBeLessThanOrEqual(60);
    expect(d.ogTitle).toBe(d.metaTitle);
  });

  test("/promille: titlen indeholder søgningen 'promille beregner'", () => {
    const d = getPageData("promille", "da")!;
    expect(d.metaTitle.toLowerCase()).toContain("promille beregner");
    expect(d.metaTitle.length).toBeLessThanOrEqual(60);
  });
});

describe("1. advent: titlen matcher '1 advent 2026'", () => {
  async function advent(iso: string) {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const m = await buildDageTilMetadata("/dage-til/", "1-advent", new Date(iso));
    return (m.title as { absolute: string }).absolute;
  }

  test("titlen har året, datoen og dagtallet", async () => {
    const titel = await advent("2026-11-21T12:00:00.000Z");
    expect(titel).toBe("1. advent 2026: søndag 29. november (8 dage)");
    expect(titel.length).toBeLessThanOrEqual(60);
  });

  test("titlen skifter år, når 1. advent er passeret", async () => {
    const titel = await advent("2026-12-10T12:00:00.000Z");
    expect(titel).toContain("1. advent 2027");
    expect(titel.length).toBeLessThanOrEqual(60);
  });

  test("andre dage-til-sider bevarer deres spørgsmålstitel", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
    const m = await buildDageTilMetadata("/dage-til/", "24-december", new Date("2026-11-21T12:00:00.000Z"));
    expect((m.title as { absolute: string }).absolute).toMatch(/^Hvor mange dage er der til /);
  });
});

describe("sider uden ændring bevarer deres titel", () => {
  test.each([
    ["moms", "Momsberegner: 1.000 kr. ekskl. moms + 25 % = 1.250 kr."],
    ["brok", "Brøkberegner: forkort 6/8 til 3/4 = 0,75 = 75 %"],
    ["braendstof", "Brændstofberegner: 500 km benzin koster 450 kr."],
  ])("%s", (slug, titel) => {
    expect(getPageData(slug, "da")!.metaTitle).toBe(titel);
  });

  test("beraknare.se (se) er urørt", () => {
    expect(getPageData("tidszone", "se")!.metaTitle).toMatch(/^Tidszoner/);
    expect(getPageData("dato", "se")!.metaTitle).toContain("15 mar–25 sep = 194 dagar");
  });

  test("alle da-titler er unikke", () => {
    const set = new Map<string, string>();
    for (const slug of getAvailableSlugs("da")) {
      const t = getPageData(slug, "da")!.metaTitle;
      expect(set.has(t), `${slug} og ${set.get(t)} har samme titel "${t}"`).toBe(false);
      set.set(t, slug);
    }
  });
});
