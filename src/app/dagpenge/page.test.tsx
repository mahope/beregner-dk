import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { DAGPENGE_2026 } from "@/lib/satser-2026";
import DagpengePage from "./page";

vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));
vi.mock("@/components/ads/AdBanner", () => ({ InlineAd: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/DagpengeBeregner", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ FAQ: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({
  RelatedCalculators: () => null,
}));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const kilde = readFileSync(join(__dirname, "page.tsx"), "utf8");

/**
 * C19 (2026-09-26): /dagpenge viste dimittend-satsen 15.174 kr, som i
 * værktøjet var mærket "2026 estimat" og ikke findes i ministeriets tabel.
 * Siden skal nu læse alle dagpenge-satser fra `DAGPENGE_2026`.
 */
describe("side /dagpenge", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("læser 2026-satser fra det delte satsmodul", () => {
    expect(kilde).toContain('from "@/lib/satser-2026"');
  });

  test("indeholder ikke den estimerede dimittendsats", () => {
    expect(kilde).not.toContain("15.174");
  });

  test("renderer max-, deltids- og dimittendsatserne fra modulet", async () => {
    const html = renderToStaticMarkup(await DagpengePage());
    const kr = (n: number) => `${new Intl.NumberFormat("da-DK").format(n)} kr`;

    expect(html).toContain(kr(DAGPENGE_2026.fuldtid));
    expect(html).toContain(kr(DAGPENGE_2026.deltid));
    expect(html).toContain(kr(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt));
    expect(html).toContain(kr(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt));
  });
});
