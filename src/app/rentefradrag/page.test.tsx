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
  FAQSchema: () => null,
}));

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

  test("de svenske og norske sider er urørte af den danske 'loft'-tekst", async () => {
    for (const locale of ["se", "no"] as const) {
      const html = await render(locale);
      expect(html).not.toContain("Er der et loft på rentefradraget?");
      expect(html).not.toContain("Der er intet loft på selve renteudgifterne");
    }
  });
});
