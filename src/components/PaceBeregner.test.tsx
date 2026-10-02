import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import PaceBeregner from "./PaceBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

afterEach(cleanup);

const DOMAEN = {
  da: "localhost",
  no: "beregner.no",
  se: "beraknare.se",
} as const;

function renderPace(locale: "da" | "no" | "se") {
  return render(
    <LocaleProvider locale={locale} domainConfig={getDomainConfig(DOMAEN[locale])}>
      <PaceBeregner />
    </LocaleProvider>,
  );
}

/**
 * Ord der kun er danske. `PaceBeregner` slog før 2/10 altid tilbage på de
 * danske labels (`labels[locale === "se" ? "se" : "da"]`), så den norske side
 * havde norsk brødtekst og norsk tabel over en dansk beregner.
 */
const DANSKE_ORD = /holdtider|gælder|indtast|distancen|\baf\b|hvad vil du beregne/i;

describe("PaceBeregner", () => {
  test("den norske beregner er skrevet på norsk, ikke på dansk", () => {
    renderPace("no");
    const tekst = document.body.textContent ?? "";

    expect(tekst).toContain("Deltider pr. kilometer");
    expect(tekst).toContain("Hva vil du beregne");
    expect(tekst).toContain("Farten er den gjennomsnittlige tiden pr. kilometer");
    expect(tekst).toContain("Fart fra løpetid");

    const danske = tekst.match(new RegExp(DANSKE_ORD, "gi")) ?? [];
    expect(danske, `danske ord i den norske beregner: ${danske.join(", ")}`).toEqual([]);
  });

  test("hvert sprog har sine egne labels", () => {
    renderPace("se");
    const se = document.body.textContent ?? "";
    cleanup();
    renderPace("da");
    const da = document.body.textContent ?? "";
    cleanup();
    renderPace("no");
    const no = document.body.textContent ?? "";

    expect(se).toContain("Deltider per kilometer");
    expect(da).toContain("Holdtider pr. kilometer");
    expect(no).toContain("Deltider pr. kilometer");
    expect(no).not.toBe(da);
    expect(no).not.toBe(se);
  });

  test("værktøjet regner i alle tre sprog", () => {
    for (const locale of ["da", "no", "se"] as const) {
      renderPace(locale);
      expect(screen.getAllByText("5:00").length, `${locale} viser ikke tempoet`).toBeGreaterThan(0);
      cleanup();
    }
  });
});
