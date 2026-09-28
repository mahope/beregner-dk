import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getPageData } from "@/lib/page-data";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { estimerNettoMaaned } from "@/lib/barsel/netto";
import { BARSEL_2026 } from "@/lib/satser-2026";
import BarselPage from "./page";

vi.mock("@/components/BarselBeregner", () => ({
  default: () => <div>Barselsværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const MAKS_PR_MAANED = (BARSEL_2026.maxWeeklyRate * 52) / 12;

function kr(value: number) {
  return `${Math.round(value).toLocaleString("da-DK")} kr.`;
}

async function render(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return renderToStaticMarkup(await BarselPage());
}

describe("barselsdagpenge: svar på 'barselsdagpenge sats 2026 efter skat'", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("overskriften og de to regnestykker står i den danske brødtekst", async () => {
    const html = await render("da");
    expect(html).toContain("Barselsdagpenge efter skat");
    expect(html).toContain(
      `${BARSEL_2026.maxHourlyRate.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.`,
    );
    expect(html).toContain("52 uger ÷ 12 måneder");
    expect(html).toContain(kr(MAKS_PR_MAANED));
  });

  test("efter-skat-tallet er udledt af estimerNettoMaaned, ikke skrevet i hånden", async () => {
    const html = await render("da");
    const netto = estimerNettoMaaned({ loen: 0, ydelse: MAKS_PR_MAANED });
    expect(html).toContain(kr(netto.netto));
    expect(html).toContain(kr(netto.skat));
    // Beløbet på konto skal være mindre end beløbet før skat.
    expect(netto.netto).toBeLessThan(MAKS_PR_MAANED);
  });

  test("tabellen har alle tre satser med skat- og efter-skat-kolonne", async () => {
    const html = await render("da");
    for (const uge of [4000, 4500, BARSEL_2026.maxWeeklyRate]) {
      const r = estimerNettoMaaned({ loen: 0, ydelse: (uge * 52) / 12 });
      expect(html).toContain(`${uge.toLocaleString("da-DK")} kr.`);
      expect(html).toContain(kr((uge * 52) / 12));
      expect(html).toContain(kr(r.netto));
    }
    expect(html).toContain("(maks)");
  });

  test("timeprisen og ugesatsen peger samme vej", () => {
    const viaTime = (BARSEL_2026.maxHourlyRate * BARSEL_2026.fullTimeHours * 52) / 12;
    expect(Math.abs(viaTime - MAKS_PR_MAANED)).toBeLessThan(1);
  });

  test("siden siger at ydelsen ikke er AM-bidragspligtig", async () => {
    const html = await render("da");
    expect(html).toContain("ikke AM-bidragspligtig");
    expect(html).toContain("AM-bidrag");
  });

  test("de to nye FAQ-par er i page-data, så de kommer i JSON-LD'en", () => {
    const faq = getPageData("barselsdagpenge", "da")!.faqItems;
    const spoergsmaal = faq.map((f) => f.question);
    expect(spoergsmaal).toContain("Hvor mange kroner får jeg i barselsdagpenge efter skat?");
    expect(spoergsmaal).toContain("Er barselsdagpenge AM-bidragspligtig?");
    const svar = faq.find((f) => f.question === "Hvor mange kroner får jeg i barselsdagpenge efter skat?")!.answer;
    const netto = estimerNettoMaaned({ loen: 0, ydelse: MAKS_PR_MAANED });
    expect(svar).toContain(kr(netto.netto));
  });

  test("den svenske og norske side må ikke vise den danske efter-skat-blok", async () => {
    for (const locale of ["se", "no"] as const) {
      const html = await render(locale);
      expect(html).not.toContain("Barselsdagpenge efter skat");
      expect(html).not.toContain("AM-bidragspligtig");
    }
  });
});
