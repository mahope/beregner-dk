import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  bilforsikringAffiliates,
  boligforsikringAffiliates,
  KREDIT_ADVARSEL,
  forsikringAffiliates,
  pantelaanAffiliates,
  partnerAdsLink,
  selvstaendigAffiliates,
  testamenteAffiliates,
} from "./AffiliateBox";

const partnerAdsPresets = [
  ...bilforsikringAffiliates,
  ...boligforsikringAffiliates,
  ...selvstaendigAffiliates,
  ...testamenteAffiliates,
];

describe("affiliate-links", () => {
  test("partnerAdsLink bygger et sporbart link (uid tilføjes af withSubid)", () => {
    expect(partnerAdsLink("60068")).toBe(
      "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=60068",
    );
  });

  test("partnerAdsLink URL-koder deeplinks", () => {
    expect(partnerAdsLink("60068", "https://www.findforsikring.dk/bil?x=1&y=2")).toContain(
      "&htmlurl=https%3A%2F%2Fwww.findforsikring.dk%2Fbil%3Fx%3D1%26y%3D2",
    );
  });

  test.each(partnerAdsPresets.map((p) => [p.name, p.url]))("%s går gennem Partner-ads med vores id", (_navn, url) => {
    expect(url).toMatch(/^https:\/\/www\.partner-ads\.com\/dk\/klikbanner\.php\?partnerid=42553&bannerid=\d+/);
  });

  test("Findforsikring.dk i boligbudgettet går gennem Adtraction", () => {
    expect(forsikringAffiliates[0].url).toBe(
      "https://go.findforsikring.dk/t/t?a=1873805483&as=2056156501&t=2&tk=1&url=https%3A%2F%2Fwww.findforsikring.dk%2F",
    );
  });

  // Links med en hjemmelavet ?ref= giver ingen kommission (sådan så de gamle presets ud).
  test("ingen komponent linker til partnere med en hjemmelavet ref-parameter", () => {
    const dir = join(__dirname);
    const syndere = readdirSync(dir)
      .filter((f) => f.endsWith(".tsx") && !f.includes(".test."))
      .filter((f) => /url:\s*"https?:\/\/[^"]*[?&]ref=minberegner/.test(readFileSync(join(dir, f), "utf-8")));
    expect(syndere).toEqual([]);
  });

  test("pantelån går gennem Partner-ads", () => {
    expect(pantelaanAffiliates).toHaveLength(1);
    expect(pantelaanAffiliates[0].url).toContain("bannerid=78126");
  });

  test("kreditadvarslen indeholder lovpligtig tekst og ÅOP-eksempel", () => {
    expect(KREDIT_ADVARSEL).toContain("Det koster penge at låne penge");
    expect(KREDIT_ADVARSEL).toContain("ÅOP");
    expect(KREDIT_ADVARSEL).toContain("ca. 1.116 kr. i renter");
    expect(KREDIT_ADVARSEL).toContain("ÅOP på ca. 21,9 %");
  });

  test("ingen komponent eller side lover hurtighed, nemhed eller bedste rente ved lån", () => {
    const forbudt = /uden kreditvurdering|hurtigt svar|hurtig udbetaling|nem ansøgning|bedste rente|find den laveste rente/i;
    const samlFiler = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const sti = join(dir, e.name);
        if (e.isDirectory()) return samlFiler(sti);
        return /\.tsx?$/.test(e.name) && !e.name.includes(".test.") ? [sti] : [];
      });
    const filer = samlFiler(join(__dirname, ".."));
    expect(filer.length).toBeGreaterThan(100);
    for (const f of filer) {
      expect(readFileSync(f, "utf-8"), f).not.toMatch(forbudt);
    }
  });

  test("forsikrings- og a-kasse-tekster lover hverken tid eller pris-rangering", () => {
    const forbudt = /på 2 minutter|på få minutter|hurtig tilmelding|danmarks billigste|billigste (indbo|hus|bil|forsikring|a-kasse)/i;
    const samlFiler = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const sti = join(dir, e.name);
        if (e.isDirectory()) return samlFiler(sti);
        return /\.tsx?$/.test(e.name) && !e.name.includes(".test.") ? [sti] : [];
      });
    for (const f of samlFiler(join(__dirname, ".."))) {
      expect(readFileSync(f, "utf-8"), f).not.toMatch(forbudt);
    }
  });

  test("affiliate-links markeres sponsored nofollow", () => {
    expect(readFileSync(join(__dirname, "AffiliateBox.tsx"), "utf-8")).toContain('rel="sponsored nofollow noopener noreferrer"');
  });
});
