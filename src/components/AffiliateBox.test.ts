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

const presets = [
  ...bilforsikringAffiliates,
  ...boligforsikringAffiliates,
  ...forsikringAffiliates,
  ...selvstaendigAffiliates,
  ...testamenteAffiliates,
];

describe("affiliate-links", () => {
  test("partnerAdsLink bygger et sporbart link med site-uid", () => {
    expect(partnerAdsLink("60068")).toBe(
      "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=60068&uid=minberegner",
    );
  });

  test("partnerAdsLink URL-koder deeplinks", () => {
    expect(partnerAdsLink("60068", "https://www.findforsikring.dk/bil?x=1&y=2")).toContain(
      "&htmlurl=https%3A%2F%2Fwww.findforsikring.dk%2Fbil%3Fx%3D1%26y%3D2",
    );
  });

  test.each(presets.map((p) => [p.name, p.url]))("%s går gennem Partner-ads med vores id", (_navn, url) => {
    expect(url).toMatch(/^https:\/\/www\.partner-ads\.com\/dk\/klikbanner\.php\?partnerid=42553&bannerid=\d+&uid=minberegner/);
  });

  // Links med en hjemmelavet ?ref= giver ingen kommission (sådan så de gamle presets ud).
  test("ingen komponent linker til partnere med en hjemmelavet ref-parameter", () => {
    const dir = join(__dirname);
    const syndere = readdirSync(dir)
      .filter((f) => f.endsWith(".tsx") && !f.includes(".test."))
      .filter((f) => /url:\s*"https?:\/\/[^"]*[?&]ref=minberegner/.test(readFileSync(join(dir, f), "utf-8")));
    expect(syndere).toEqual([]);
  });

  test("pantelån går gennem Partner-ads og har neutral tekst", () => {
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
    const forbudt = /uden kreditvurdering|hurtigt svar|hurtig udbetaling|nem ansøgning|bedste rente|laveste rente - |find den laveste rente/i;
    const filer = ["ForbrugslaanBeregner.tsx", "BillaanBeregner.tsx", "AffiliateBox.tsx", "../app/forbrugslaan/page.tsx", "../app/billaan/page.tsx"];
    for (const f of filer) {
      expect(readFileSync(join(__dirname, f), "utf-8"), f).not.toMatch(forbudt);
    }
  });

  test("affiliate-links markeres sponsored nofollow", () => {
    expect(readFileSync(join(__dirname, "AffiliateBox.tsx"), "utf-8")).toContain('rel="sponsored nofollow noopener noreferrer"');
  });
});
