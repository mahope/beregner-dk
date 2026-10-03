import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import BoliglaanPage from "./page";

vi.mock("next/dynamic", () => ({ default: () => () => <div>Værktøj</div> }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/ads/AdBanner", () => ({ InlineAd: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/** React skriver `<!-- -->` mellem to tekstnoder i én JSX-celle, så de fjernes før grep. */
async function render(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return (await renderToStaticMarkup(await BoliglaanPage())).replaceAll("<!-- -->", "");
}

/**
 * Procenttegnet skrives med mellemrum: «5 %», «0,45-0,65 %». Renteafsnittet,
 * udbetalingsafsnittet, fradragstabellen og hele den svenske udgave skrev «80%»,
 * «0-40%» og «90 % av» — altså den skrivemåde, `/pension` 2/10 og `/procent`
 * 3/10 fik rettet.
 *
 * Porten dømmer på den **renderede markup** i begge sprog, fordi det er den
 * læseren ser — og fordi `regnestykker.test.ts` kun dømmer kildekoden, så
 * uden denne test kunne en ny side arve den gamle skrivemåde.
 */
describe("/boliglaan — procentnotationen", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each(["da", "se"] as const)(
    "ingen procent står uden mellemrum i %s",
    async (locale) => {
      const html = await render(locale);
      const fund = html.match(/\d%/g) ?? [];

      expect(fund, fund.join(" ")).toEqual([]);
    },
  );

  // Låsen på den anden side: tabellen og listerne skal stadig stå, ellers kan
  // «0 fund» opfyldes ved at slette rækkerne, og læseren taber den
  // afdragsordning han kan slå op.
  test.each([
    ["da", ["0,45-0,65 %", "Minimum 5 % af boligens pris", "ca. 25,6 % fradrag"]],
    ["se", ["Minst 10 % av bostadens pris", "30 % avdrag", "minst 2 % av lånebeloppet"]],
  ] as const)("indholdet overlever i %s", async (locale, forventet) => {
    const html = await render(locale);

    for (const tekst of forventet) expect(html, tekst).toContain(tekst);
  });
});