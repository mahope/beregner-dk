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
  FAQSchema: () => null, ArticleSchema: () => null }));
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

  /**
   * 1/10: «dagpenge nyuddannet» er en af de danske autocomplete-træffere under
   * «dagpenge», men ordet «nyuddannet» fandtes ikke ét sted på /dagpenge — siden
   * sagde kun «Dimittend», og de to betingelser for dimittendsatsen (uddannelsens
   * længde og tilmelding til A-kassen) lå kun i et blogindlæg. Porten dømmer på
   * den **renderede** side, så den kan ikke grønne ved at læse kildefilen.
   */
  test("svarer på «dagpenge nyuddannet» med dimittendens to betingelser", async () => {
    const html = renderToStaticMarkup(await DagpengePage());
    const kr = (n: number) => `${new Intl.NumberFormat("da-DK").format(n)} kr`;
    const start = html.indexOf("Nyuddannet?");
    expect(start).toBeGreaterThan(-1);
    const afsnit = html.slice(start);

    expect(afsnit).toContain(String(DAGPENGE_2026.dimittendUddannelseMdr));
    expect(afsnit).toContain(String(DAGPENGE_2026.dimittendTilmeldingDage));
    expect(afsnit).toContain(kr(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt));
    expect(afsnit).toContain(kr(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt));
  });

  test("«nyuddannet» og «dimittend» bruges om hinanden, så begge søgninger rammer", async () => {
    const html = renderToStaticMarkup(await DagpengePage());
    const start = html.indexOf("Nyuddannet?");
    expect(start).toBeGreaterThan(-1);
    const afsnit = html.slice(start);

    expect(afsnit).toContain("nyuddannet");
    expect(afsnit).toContain("dimittend");
  });
});
