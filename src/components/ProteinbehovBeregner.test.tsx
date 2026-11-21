import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import ProteinbehovBeregner from "./ProteinbehovBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { beregnProteinbehov } from "@/lib/proteinbehov";
import { formatNumber } from "@/lib/format";

/**
 * `ProteinbehovBeregner` skrev sit tusindtal med den håndskrevne kæde
 * `locale === "se" ? "sv-SE" : "da-DK"`. Kæden har ingen `no`-arm, så en norsk
 * læser fik dansk formatering — og forskellen er synlig, ikke teoretisk: 500 kg
 * på "ekstrem-aktiv" er præcis 1.000 g, som `da-DK` skriver "1.000" med
 * punktum, mens `nb-NO` skriver "1 000" med mellemrum (U+00A0).
 *
 * Testen drev komponenten gennem de rigtige felter i stedet for URL-state,
 * fordi beregneren læser sin startværdi fra `?s=`-parameteren, og det er den
 * vej en læser ikke går.
 *
 * Fejlen er latent, fordi `beregner.no` ikke er lanceret (opgave 97), så den kan
 * kun låses her — ikke live. Denne test er derfor den eneste beskyttelse.
 */

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

/** 500 kg er inputets max, og 500 × 2,0 = 1.000 gram — fire cifre. */
const FIRE_CIFRE = { vaegtKg: 500, niveau: "ekstrem-aktiv" } as const;

function renderNorsk() {
  return render(
    <LocaleProvider locale="no" domainConfig={getDomainConfigByLocale("no")}>
      <ProteinbehovBeregner />
    </LocaleProvider>
  );
}

/** Sætter de to felter, så resultatet bliver 1.000 gram. */
function satTilFireCifre() {
  fireEvent.change(screen.getByRole("spinbutton"), {
    target: { value: String(FIRE_CIFRE.vaegtKg) },
  });
  fireEvent.change(screen.getByRole("combobox"), { target: { value: FIRE_CIFRE.niveau } });
}

/**
 * `nb-NO` grupperer med U+00A0, og Testing Library's normaliseringsskive laver
 * ethvert mellemrum om til U+0020 — også det usynlige. Sammenligner man råt,
 * finder `getByText("1 000")` aldrig det `nb-NO` netop har skrevet. Derfor
 * normaliserer vi begge sider selv, så prøven rammer talet og ikke kodetegnet.
 */
const somOrd = (s: string) => s.replace(/\s+/g, " ").trim();

afterEach(cleanup);

describe("ProteinbehovBeregner i norsk", () => {
  test("et firecifret tal får norsk tusindtalsseparator, ikke dansk", () => {
    renderNorsk();
    satTilFireCifre();

    const norsk = somOrd(formatNumber(1000, "no", { maximumFractionDigits: 0 }));
    const dansk = somOrd(formatNumber(1000, "da", { maximumFractionDigits: 0 }));

    // Bevis forvekslingen: de to tags er forskellige på netop dette tal. Uden
    // denne linje ville testen også være grøn mod gammel kode.
    expect(norsk).not.toBe(dansk);

    const skærm = somOrd(document.body.textContent ?? "");
    expect(skærm).toContain(norsk);
    expect(skærm).not.toContain(dansk);
  });

  test("beregningen bag tallet er uændret", () => {
    // Formateringen må ikke have ændret selve tallet: 500 × 2,0.
    const r = beregnProteinbehov(FIRE_CIFRE.vaegtKg, FIRE_CIFRE.niveau);
    expect(r?.gram).toBe(1000);
    expect(r?.faktor).toBe(2);
  });
});