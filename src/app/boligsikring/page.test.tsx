/**
 * Porten for /boligsikring. Siden lover beløb fra loven, så alle tal i
 * brødteksten, tabellen og FAQ'en skal kunne føres tilbage til
 * `BOLIGSIKRING_2026` — punkt 11: en påstand i tekst er kode.
 *
 * Tallet fra beregneren afgøres af `beregnBoligsikring`, der er testet for
 * sig. Her dømmes det, som serveren rent faktisk leverer: titlen, de satser
 * tabellen viser, og at beregneren er med på siden.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { isCalculatorAvailable } from "@/lib/calculator-list";
import { BOLIGSIKRING_2026 } from "@/lib/boligsikring";
import BoligsikringPage from "./page";

vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));
vi.mock("@/components/BoligsikringBeregner", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null, FAQ: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({
  default: () => null,
  RelatedCalculators: () => null,
}));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const kr = (vaerdi: number) =>
  new Intl.NumberFormat("da-DK").format(vaerdi);

describe("side /boligsikring", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("er daOnly: den findes ikke på beraknare.se eller beregner.no", () => {
    expect(isCalculatorAvailable("/boligsikring", "da")).toBe(true);
    expect(isCalculatorAvailable("/boligsikring", "se")).toBe(false);
    expect(isCalculatorAvailable("/boligsikring", "no")).toBe(false);
  });

  test("titlen lover formlen, ikke bare ordet boligsikring", async () => {
    const html = await renderToStaticMarkup(await BoligsikringPage());
    expect(html).toContain("60 pct. af huslejen");
    expect(html).toContain("18 pct. af indkomsten");
  });

  test("tabellen viser de regulerede 2026-satser fra satsmodulet", async () => {
    const html = await renderToStaticMarkup(await BoligsikringPage());
    expect(html).toContain(kr(BOLIGSIKRING_2026.indkomstGraense));
    expect(html).toContain(kr(BOLIGSIKRING_2026.indkomstGraensePrBarn));
    expect(html).toContain(kr(BOLIGSIKRING_2026.maksBoligsikring));
    expect(html).toContain(kr(BOLIGSIKRING_2026.maksHusleje));
    expect(html).toContain(kr(BOLIGSIKRING_2026.formueGraenseLav));
    expect(html).toContain(kr(BOLIGSIKRING_2026.formueGraenseHoej));
    expect(html).toContain(kr(BOLIGSIKRING_2026.mindstEgenbetaling));
  });

  test("fortæller at beregningen er vejledende og at Udbetaling Danmark afgør", async () => {
    const html = await renderToStaticMarkup(await BoligsikringPage());
    expect(html).toContain("vejledende");
    expect(html).toContain("Udbetaling Danmark");
  });

  test("forklarer at boligsikring er en ydelse og ikke en opsparing", async () => {
    const html = await renderToStaticMarkup(await BoligsikringPage());
    expect(html).toContain("ikke en opsparingsordning");
  });
});
