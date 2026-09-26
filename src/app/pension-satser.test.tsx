import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { SATSER_2026 } from "@/lib/satser-2026";
import PensionGuidePage from "./blog/pension-hvor-meget-skal-du-spare-op/page";

vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null }));
vi.mock("@/components/ads/AdBanner", () => ({ InlineAd: () => null }));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const pensionPagePath = join(__dirname, "pension", "page.tsx");
const pensionPage = readFileSync(pensionPagePath, "utf8");
const guidePath = join(__dirname, "blog", "pension-hvor-meget-skal-du-spare-op", "page.tsx");
const guide = readFileSync(guidePath, "utf8");

/**
 * C18 (2026-09-26) fandt, at pensionsguiden skrev "max ~63.000 kr/år" for
 * ratepension to steder, mens samme artikels FAQ, `/pension` og
 * `/blog/fradrag-2026-komplet-guide` sagde 68.700 kr. 2026-loftet er
 * 68.700 kr. (SKAT, "Fradrag for indbetalinger til pension i 2026",
 * 2026-02-26), så artiklen modsagde både satsmodulet og sig selv.
 *
 * Testen er en vagt mod samme fejltype som S2/S3: ingen pensionsrate må
 * genangives som tekstliteral i artiklen eller på siden — de skal læses fra
 * `SATSER_2026`, så et aarstalregulering ikke kan glide fra paa een side.
 */
const staleLiterals = [
  "63.000", // gammelt ratepension-loft i pensionsguiden
  "66.550", // ratepension-loftet for 2025
  "65.500", // ratepension-loftet for 2025
  "9.000", // gammelt aldersopsparing-loft
];

describe("pensionssatserne i `/pension` og pensionsguiden", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("2026-loftet i satsmodulet er SKAT's dokumenterede værdi", () => {
    // Kilde: https://skat.dk/borger/pension-og-efterloen/fradrag-for-indbetalinger-til-pension
    // ("op til 68.700 kr. i 2026") og info.skat.dk C.A.10.2.2.3.3
    expect(SATSER_2026.ratepensionMax).toBe(68700);
    expect(SATSER_2026.aldersopsparingMax).toBe(9900);
  });

  test("begge sider læser loftene fra det delte satsmodul", () => {
    expect(guide).toContain('from "@/lib/satser-2026"');
    expect(pensionPage).toContain('from "@/lib/satser-2026"');
    expect(guide).toContain("SATSER_2026.ratepensionMax");
    expect(guide).toContain("SATSER_2026.aldersopsparingMax");
    expect(pensionPage).toContain("SATSER_2026.ratepensionMax");
    expect(pensionPage).toContain("SATSER_2026.aldersopsparingMax");
  });

  test.each(staleLiterals)("indeholder ikke den forældede sats %s", (literal) => {
    expect(guide).not.toContain(literal);
    expect(pensionPage).not.toContain(literal);
  });

  test("guiden viser 2026-loftet for både ratepension og aldersopsparing", async () => {
    const markup = renderToStaticMarkup(await PensionGuidePage());
    const rate = new Intl.NumberFormat("da-DK").format(SATSER_2026.ratepensionMax);
    const alders = new Intl.NumberFormat("da-DK").format(SATSER_2026.aldersopsparingMax);

    expect(rate).toBe("68.700");
    expect(alders).toBe("9.900");
    expect(markup).toContain(`${rate} kr/år`);
    expect(markup).toContain(`${alders} kr/år`);
    expect(markup).not.toContain("63.000");
  });
});
