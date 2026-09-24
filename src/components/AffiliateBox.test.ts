import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  bilforsikringAffiliates,
  boligforsikringAffiliates,
  forsikringAffiliates,
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
});
