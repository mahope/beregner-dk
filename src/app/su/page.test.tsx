import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { SU_2026 } from "@/lib/satser-2026";
import SUPage from "./page";

vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));
vi.mock("@/components/SUBeregner", () => ({ default: () => null }));
vi.mock("@/components/ads/AdBanner", () => ({ InlineAd: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({
  default: () => null,
}));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const kilde = readFileSync(join(__dirname, "page.tsx"), "utf8");
const da = (n: number) => new Intl.NumberFormat("da-DK").format(n);

/**
 * C21 (2026-09-26): C20 verificerede forældreindkomstgrænserne, den lavere
 * sats for forsørgertillæg ved delt bolig og udlandsstudielånet og skrev dem
 * i artiklen. `/su` lovede i sin egen intro "forældreindkomst", men nævnte
 * ingen af tallene — de var kun i artiklen. Denne test låser, at landingssiden
 * og dens FAQ nu svarer på den samme søgning.
 */
describe("SU-siden", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });
  test("læser 2026-satser fra det delte satsmodul", () => {
    expect(kilde).toContain('from "@/lib/satser-2026"');
  });

  test("renderer forældreindkomstgrænserne fra modulet", async () => {
    const html = renderToStaticMarkup(await SUPage());

    expect(SU_2026.parentalIncome.maxSupplementAtOrBelow).toBe(419589);
    expect(SU_2026.parentalIncome.noSupplementAtOrAbove).toBe(710077);

    expect(html).toContain(da(SU_2026.parentalIncome.maxSupplementAtOrBelow));
    expect(html).toContain(da(SU_2026.parentalIncome.noSupplementAtOrAbove));
    expect(html).toContain(da(SU_2026.parentalIncome.siblingUnder18Deduction));
    expect(html).toContain(da(SU_2026.homewardMaximumSupplement));
  });

  test("renderer forsørgertillægget ved delt bolig og udlandsstudielånet", async () => {
    const html = renderToStaticMarkup(await SUPage());

    expect(SU_2026.singleParentSupplementSharedHome).toBe(2966);
    expect(SU_2026.loan.abroadTotal).toBe(129106);

    expect(html).toContain(da(SU_2026.singleParentSupplementSharedHome));
    expect(html).toContain(da(SU_2026.loan.abroadTotal));
    expect(html).toContain("fødselsstøtte");
    expect(html).toContain(String(SU_2026.rules.birthGrantSingleParentMonths));
  });

  test("beskriver den delte bolig-situation præcist", async () => {
    const html = renderToStaticMarkup(await SUPage());

    expect(html).toContain("kontanthjælp");
    expect(html).toContain(SU_2026.sources.parentalIncome);
  });

  test("FAQ'en på /su svarer på de samme tre søgninger", () => {
    const faq = getPageData("su", "da")!.faqItems;
    const svar = faq.map((item) => item.answer).join(" ");

    expect(svar).toContain(da(SU_2026.parentalIncome.maxSupplementAtOrBelow));
    expect(svar).toContain(da(SU_2026.parentalIncome.noSupplementAtOrAbove));
    expect(svar).toContain(da(SU_2026.singleParentSupplementSharedHome));
    expect(svar).toContain(da(SU_2026.loan.abroadTotal));
  });

  test("hjemmeboende-afsnittet står før fribeløbsafsnittet", async () => {
    const html = renderToStaticMarkup(await SUPage());
    const foraeldre = html.indexOf(`Forældrenes indkomstgrundlag i ${SU_2026.parentalIncomeYear}`);
    const fribeloeb = html.indexOf("Fribeløb 2026");

    expect(foraeldre).toBeGreaterThan(-1);
    expect(fribeloeb).toBeGreaterThan(-1);
    expect(foraeldre).toBeLessThan(fribeloeb);
  });
});
