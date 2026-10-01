import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getPageData } from "@/lib/page-data";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { beregnRentefradrag } from "@/lib/rentefradrag";
import { RENTEFRADRAG_2026 } from "@/lib/satser-2026";
import RentefradragPage from "./page";

vi.mock("@/components/RentefradragBeregner", () => ({
  default: () => <div>Rentefradragsværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/RelateredeArtikler", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null, ArticleSchema: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const BELOEB = 80_000;

async function render(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return renderToStaticMarkup(await RentefradragPage());
}

describe("rentefradrag: er der et loft?", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("svarer på 'loft'-søgningen med at der ikke er et loft", async () => {
    const html = await render("da");
    expect(html).toContain("Er der et loft på rentefradraget?");
    expect(html).toContain("Der er intet loft på selve renteudgifterne");
    // Det afgørende er at svaret er et "nej" — ikke et tal på et loft.
    expect(html).not.toMatch(/loft på (?:dine )?renteudgifter (?:er|er på)/i);
  });

  test("de to satser i teksten er satser-2026's egne", async () => {
    const html = await render("da");
    expect(html).toContain(
      (RENTEFRADRAG_2026.highRate * 100).toLocaleString("da-DK"),
    );
    expect(html).toContain(
      (RENTEFRADRAG_2026.lowRate * 100).toLocaleString("da-DK"),
    );
  });

  test("alle tal i eksemplet stammer fra beregnRentefradrag, ikke fra brødteksten", async () => {
    const html = await render("da");
    const r = beregnRentefradrag(BELOEB, "single");

    // Kilde-sandheden: de to led og den effektive sats.
    const hoej = r.hoejAndel * RENTEFRADRAG_2026.highRate;
    const lav = r.lavAndel * RENTEFRADRAG_2026.lowRate;
    expect(html).toContain(hoej.toLocaleString("da-DK"));
    expect(html).toContain(lav.toLocaleString("da-DK"));
    expect(html).toContain(r.besparelse.toLocaleString("da-DK"));
    expect(html).toContain(r.effektivSats.toFixed(1).replace(".", ",") + " %");

    // Den indekserede tekst må ikke love en værdi modulet ikke giver.
    expect(html).not.toContain("16.900 kr.");
  });

  test("par beskriver den delte fordeling som præcis neutral", async () => {
    const html = await render("da");
    expect(html).toContain("Skal par fordele renterne mellem sig?");
    expect(html).toContain("præcis samme");

    // Neutraliteten er en påstand om modulet, så den låses her:
    // lige fordeling giver præcis samme besparelse som ét fælles beløb.
    const faelles = beregnRentefradrag(BELOEB, "couple").besparelse;
    const delt =
      beregnRentefradrag(BELOEB / 2, "single").besparelse +
      beregnRentefradrag(BELOEB / 2, "single").besparelse;
    expect(delt).toBeCloseTo(faelles, 6);
  });

  test("den ujævne fordeling er dårligere, og tabet står i teksten", async () => {
    const html = await render("da");
    const samlet = beregnRentefradrag(100_000, "couple").besparelse;
    const fordelt =
      beregnRentefradrag(95_000, "single").besparelse +
      beregnRentefradrag(5_000, "single").besparelse;

    // Kilden siger at fordeling først hjælper når renterne er ujævnt fordelt.
    // Her er den modsatte konsekvens, så tabet skal kunne efterprøves.
    expect(fordelt).toBeLessThan(samlet);
    const tab = Math.abs(fordelt - samlet);
    expect(html).toContain(tab.toLocaleString("da-DK"));
    expect(html).toContain("kr. mindre");
  });

  test("de fire nye spørgsmål ligger i FAQ'en og kommer i JSON-LD", () => {
    const data = getPageData("rentefradrag", "da")!;
    for (const m of [
      /er der et loft på rentefradraget/i,
      /hvad er rentefradraget værd i procent/i,
      /skal par fordele rentefradraget mellem sig/i,
    ]) {
      expect(data.faqItems.some((f) => m.test(f.question))).toBe(true);
    }
    // FAQ'en må ikke svare "ja, der er et loft" — det er hele pointen.
    const loft = data.faqItems.find((f) => /loft på rentefradraget/i.test(f.question));
    expect(loft!.answer.startsWith("Nej.")).toBe(true);
  });

  /**
   * Porten der kan fejle på den ændrede kode.
   *
   * `alle tal i eksemplet stammer fra beregnRentefradrag` så på hele siden —
   * altså på *alle* tal, også dem fra «Er der et loft?»-afsnittet ovenfor,
   * som allerede var beregnet. Derfor var den grøn mod en håndskrevet
   * «Eksempel»-liste: de to lister indeholdt de samme tal, så porten kunne
   * ikke se forskellen.
   *
   * Denne port muterer derimod kilden — satserne og beløbsgrænsen — og
   * kræver at «Eksempel»-afsnittet følger med. Mod master's håndskrevne
   * liste står tallene fast i markupken og kan ikke følge en mutation, så
   * porten er målt rød dér.
   */
  test("eksemplet følger satserne, når kilden muteres", async () => {
    vi.resetModules();
    vi.doMock("@/lib/satser-2026", async (importOriginal) => {
      const original = await importOriginal<typeof import("@/lib/satser-2026")>();
      return {
        ...original,
        RENTEFRADRAG_2026: {
          ...original.RENTEFRADRAG_2026,
          highRate: 0.25,
          lowRate: 0.15,
          highRateLimitSingle: 40_000,
          highRateLimitCouple: 80_000,
        },
      };
    });
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));

    const { default: Side } = await import("./page");
    const html = renderToStaticMarkup(await Side());

    // Kun selve Eksempel-listen — ikke hele siden, der også indeholder
    // loft-afsnittets beregnede tal.
    const start = html.indexOf(">Eksempel<");
    expect(start, "Eksempel-afsnittet findes ikke").toBeGreaterThan(-1);
    const liste = html.slice(start, html.indexOf("</ul>", start));

    // 80.000 kr. mod en grænse på 40.000 kr. → 40.000 + 40.000
    // 40.000 × 25 % = 10.000 · 40.000 × 15 % = 6.000 · i alt 16.000
    // Par: grænsen 80.000, så hele beløbet 80.000 × 25 % = 20.000
    for (const forventet of ["40.000", "10.000", "6.000", "16.000", "20.000"]) {
      expect(liste, `Eksempel-listen mangler ${forventet}`).toContain(forventet);
    }
    // De gamle satser må ikke stå mere — de ermutationen netop fjernede.
    expect(liste).not.toContain("16.800");
    expect(liste).not.toContain("24.480");
    expect(liste).not.toContain("26.880");
    vi.doUnmock("@/lib/satser-2026");
    vi.resetModules();
  });

  test("de svenske og norske sider er urørte af den danske 'loft'-tekst", async () => {
    for (const locale of ["se", "no"] as const) {
      const html = await render(locale);
      expect(html).not.toContain("Er der et loft på rentefradraget?");
      expect(html).not.toContain("Der er intet loft på selve renteudgifterne");
    }
  });
});
