import { describe, expect, test } from "vitest";
import { getPageData } from "./page-data";
import { simulerOpsparing } from "./opsparing";

/**
 * GSC 18/8 til 16/11-2026 (minberegner.dk, 90 dage): de her sider har mange
 * visninger og CTR under 1 % ved position 4 til 9. Titlen og beskrivelsen er
 * flyttet, så de bruger brugerens egne ord (spørgsmålet eller værktøjsnavnet)
 * og lover et konkret svar. Testen låser længden (så Google ikke afkorter) og at
 * hovedsøgningen stadig står i teksten.
 *
 * `titel` er sat, hvor titlen er ændret; ellers er det kun beskrivelsen.
 */
const SIDER: {
  slug: string;
  titel?: string[];
  beskrivelse: string[];
}[] = [
  { slug: "procent", beskrivelse: ["Hvor mange procent er x af y?", "rabatten i procent"] },
  { slug: "brok", beskrivelse: ["Hvordan forkorter man en brøk?", "3/4 = 0,75 = 75 %"] },
  { slug: "alder", beskrivelse: ["Hvor gammel er jeg?"] },
  { slug: "braendstof", beskrivelse: ["100 km", "450 kr."] },
  { slug: "renteberegner", beskrivelse: ["annuitetslån", "1.887 kr."] },
  { slug: "fart", beskrivelse: ["gennemsnitsfart", "200 km"] },
  {
    slug: "loen-konverter",
    titel: ["Lønberegner", "timeløn til månedsløn"],
    beskrivelse: ["timeløn til månedsløn", "månedsløn til timeløn"],
  },
  { slug: "elberegner", beskrivelse: ["watt", "elpris"] },
  {
    slug: "alkoholenheder",
    titel: ["Alkoholenheder", "genstande"],
    beskrivelse: ["Genstandsberegner", "gram"],
  },
  {
    slug: "rabat",
    titel: ["Rabatberegner", "200 kr. med 20 % rabat = 160 kr."],
    beskrivelse: ["Hvordan regner man rabat?", "160 kr."],
  },
  {
    slug: "skridt",
    titel: ["Skridt til km", "10.000 skridt"],
    beskrivelse: ["Hvor mange skridt er 1 km", "10.000 skridt"],
  },
  {
    slug: "opsparing",
    titel: ["Opsparingsberegner", "837.000 kr."],
    beskrivelse: ["Renters rente beregner", "837.000 kr."],
  },
];

describe("CTR-titler nov. 2026 (da)", () => {
  test.each(SIDER.map((s) => [s.slug, s] as const))("/%s", (slug, side) => {
    const data = getPageData(slug, "da");
    expect(data, `getPageData("${slug}", "da")`).toBeDefined();

    expect(data!.metaTitle.length).toBeLessThanOrEqual(60);
    expect(data!.metaDescription.length).toBeLessThanOrEqual(155);
    expect(data!.ogTitle.length).toBeLessThanOrEqual(60);

    // Ingen tankestreger, og ingen uløste pladsholdere i det Google ser.
    for (const streng of [data!.metaTitle, data!.metaDescription]) {
      expect(streng).not.toMatch(/\{[A-Z_]+\}/);
    }
    expect(data!.metaTitle).not.toContain("—");
    expect(data!.metaDescription).not.toContain("—");

    for (const ord of side.titel ?? []) {
      expect(data!.metaTitle).toContain(ord);
    }
    if (side.titel) {
      expect(data!.ogTitle).toBe(data!.metaTitle);
    }
    for (const ord of side.beskrivelse) {
      expect(data!.metaDescription).toContain(ord);
    }
  });
});

describe("opsparing-titlens tal kan regnes efter", () => {
  test("1.000 kr./md. i 30 år, 5 %, årlig tilskrivning rundes til 837.000", () => {
    const slut = simulerOpsparing(0, 1000, 5, 30, "aarlig").slutSaldo;
    expect(Math.round(slut / 1000) * 1000).toBe(837000);
  });
});
