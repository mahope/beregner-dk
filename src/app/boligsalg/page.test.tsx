import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import {
  DEFAULT_VALUES,
  TINGLYSNING_PANTEBREVLAANEDEL,
  TINGLYSNING_PANTEBREVPROCENT,
  TINGLYSNING_PANTEBREVBELOB,
  TINGLYSNING_SKOEDEBELOB,
  TINGLYSNING_SKOEDEPROCENT,
  beregnBoligsalg,
  beregnMaegler,
} from "@/lib/boligsalg";
import BoligsalgPage from "./page";

vi.mock("@/components/BoligsalgBeregner", () => ({
  default: () => <div>Boligsalgværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const kr = (tal: number) => formatNumber(tal, "da", { maximumFractionDigits: 0 });
const pct = (andel: number) => formatNumber(andel * 100, "da", { maximumFractionDigits: 2 });

/** Den danske brødtekst, uden HTML-tags — så tallene kan læses som tekst. */
function danskBrødtekst(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

describe("boligsalg page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  // Punkt 11: påstande i tekst er kode. Siden skrev otte prisintervaller i
  // hånden og kaldte dem «baseret på Boligejer.dk, opdateret august 2025» —
  // ingen kilde i repoet, og beregningen læseren kan se brugte helt andre tal.
  // Testen dømmer på den **renderede** tekst, så den kan ikke blive grøn ved at
  // porten kun kigger i kildefilen.
  test("brødteksten citerer beregnerens egne tal, ikke redaktionelle intervaller", async () => {
    const html = renderToStaticMarkup(await BoligsalgPage());
    const tekst = danskBrødtekst(html);
    const standard = beregnBoligsalg(DEFAULT_VALUES)!;

    // De tal teksten citerer, er beregnerens — mutation: ændre et beløb i
    // `DEFAULT_VALUES`, så brødteksten og beregningen ikke længere er ens.
    expect(tekst).toContain(kr(standard.samledeOmkostninger));
    expect(tekst).toContain(kr(standard.nettoProvenu));
    expect(tekst).toContain(kr(beregnMaegler(DEFAULT_VALUES)));
    expect(tekst).toContain(kr(DEFAULT_VALUES.energimaerke));
    expect(tekst).toContain(kr(DEFAULT_VALUES.tilstandsrapport));
    expect(tekst).toContain(kr(DEFAULT_VALUES.elRapport));
    expect(tekst).toContain(kr(DEFAULT_VALUES.ejerskifteforsikring));
    expect(tekst).toContain(kr(DEFAULT_VALUES.istaendsaettelse));
    expect(tekst).toContain(`${pct(DEFAULT_VALUES.maeglerProcent / 100)} % af salgsprisen`);

    // Ingen af de otte intervaller må stå igen. De er væk, ikke flyttet: de har
    // ingen kilde, så der er intet at læse dem fra.
    for (const interval of [
      "150.000-250.000",
      "3-6 %",
      "25.000-60.000",
      "6.900-8.700",
      "5.000-8.000",
      "3.000-5.000",
      "3.000-8.000",
      "20.000-50.000",
      "5.000-15.000",
    ]) {
      expect(tekst).not.toContain(interval);
    }

    // Kilden var «opdateret august 2025» på en side der siger 2026, så den er
    // væk — og afsnittet siger i stedet hvad tallene faktisk er.
    expect(tekst).not.toContain("Boligejer.dk");
    expect(tekst).not.toContain("august 2025");
    expect(tekst).toContain("beregnerens egne standardindstillinger");
  });

  test("tinglysningens satser i teksten er de samme som koden ganger med", async () => {
    const html = danskBrødtekst(renderToStaticMarkup(await BoligsalgPage()));

    // Mutation: ret en af procentkonstanterne, teksten skal følge med — ellers
    // er «0,6 %» igen en påstand uden for den beregning, læseren kan se.
    expect(html).toContain(`${pct(TINGLYSNING_SKOEDEPROCENT)} % af købesummen`);
    expect(html).toContain(kr(TINGLYSNING_SKOEDEBELOB));
    expect(html).toContain(
      `${pct(TINGLYSNING_PANTEBREVPROCENT)} % af ${pct(TINGLYSNING_PANTEBREVLAANEDEL)} % af vurderingssummen`,
    );
    expect(html).toContain(kr(TINGLYSNING_PANTEBREVBELOB));
  });

  test("de svenske og norske domæner er upåvirket af den danske brødtekst", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await BoligsalgPage());

    // Blokeret på `locale === "da"`: de nye beløb fra modulet må ikke lække
    // ud på de andre domæner, hvor beløbene står i andre valutaer.
    expect(html).not.toContain(kr(beregnBoligsalg(DEFAULT_VALUES)!.samledeOmkostninger));
    expect(html).not.toContain("Boligejer.dk");
  });
});