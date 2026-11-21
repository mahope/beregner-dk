/**
 * Beløbsscanneren så kun `page.tsx` før 2/10, så de to beregnere her lå uden for
 * porten med håndskrevne tal i brødteksten: `BolanBeregner.tsx` skrev de svenske
 * satser («max 2%», «30%», «100 000 kr», «21%») og `LoenBeregner.tsx` skrev
 * «1.000 kr mere i bruttoløn» oven i den konstant, beregningen brugte. Begge
 * læser nu deres modul, og denne test dømmer på den **renderede** tekst — JSX
 * spiser et linjeskift lige efter et `}`, så et glemt `{" "}` giver «2%Ränteavdraget»
 * uden at nogen port kan se det.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import BolanBeregner from "./BolanBeregner";
import LoenBeregner from "./LoenBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { SVENSK_BOLAN_2026 } from "@/lib/svensk-bolan";
import { formatNumber } from "@/lib/format";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

afterEach(cleanup);

const medLocale = (
  node: React.ReactNode,
  domæne = "beraknare.se",
  locale: "da" | "se" = "se"
) =>
  render(
    <LocaleProvider locale={locale} domainConfig={getDomainConfig(domæne)}>
      {node}
    </LocaleProvider>
  );

describe("BolanBeregner", () => {
  test("amortisering og ränteavdrag læses fra SVENSK_BOLAN_2026", () => {
    medLocale(<BolanBeregner />);
    const b = SVENSK_BOLAN_2026;
    const tekst = screen.getByText(/Amorteringskravet följer/).textContent ?? "";
    expect(tekst).toContain(`max ${b.amorteringHog * 100} %`);
    expect(tekst).toContain(`Ränteavdraget är ${b.ranteavdrag * 100} % upp till`);
    expect(tekst).toContain(`${b.ranteavdragBrytpunkt.toLocaleString("sv-SE")} kr, sedan ${b.ranteavdragHog * 100} %`);
  });
});

describe("LoenBeregner", () => {
  test("«+ X kr mere i bruttoløn» bruger den forhøjelse, beregningen bruger", () => {
    medLocale(<LoenBeregner />, "localhost", "da");
    // Tilstanden skal være månedsløn, ellers vises rækken slet ikke.
    expect(screen.getByText(/kr mere i bruttoløn/)).toBeTruthy();
    const tekst = screen.getByText(/kr mere i bruttoløn/).textContent ?? "";
    expect(tekst).toContain(`${formatNumber(1000, "da")} kr mere i bruttoløn = +`);
  });
});
