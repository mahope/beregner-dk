import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import SuPage from "./page";

// Værktøjet er bevidst IKKE mocket: porten skal dømme de tal, en læser ser, og
// en mockeret komponent ville gøge optællingen vakuum-grøn. SUBeregner
// mocket derimod — den er stor og uden for denne ports ærinde, og /su's egen
// test dækker den.
vi.mock("@/components/SUBeregner", () => ({ default: () => <div>SU-beregner</div> }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
  ArticleSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/**
 * «Hvor meget må man tjene ved siden af SU» er dansk autocomplete **nr. 1**
 * under «hvor meget» (målt 3/10), og /su falder (201 → 127 besøgende/28d).
 * Porten dømmer derfor tre ting i den RENDEREDE markup: at spørgsmålet stilles
 * som en overskrift, at der står et konkret årstal i svaret, og at tallet er
 * det samme som modulet regner — ikke et håndskrevet tal i teksten.
 */
async function render(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  const domainConfig = getDomainConfigByLocale(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(domainConfig);
  const html = renderToStaticMarkup(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      {await SuPage()}
    </LocaleProvider>,
  );
  return html.replaceAll("<!-- -->", "");
}

describe("/su: indtægtsgrænsen er et værktøj, ikke kun en tabel", () => {
  test("da-siden stiller spørgsmålet som overskrift og svarer med et årstal", async () => {
    const html = await render("da");
    expect(html).toContain("Hvor meget må jeg tjene ved siden af min SU?");
    expect(html).toMatch(/Du må højst tjene/);
    // Standardvalget er 12 måneder videregående SU: 12 × 20.749 = 248.988 kr.
    expect(html).toContain("248.988");
    // Og svaret må ikke være en forældet månedssats alene.
    expect(html).toContain("Det svarer til pr. måned");
    expect(html).toContain("Før AM-bidrag for hele året");
  });

  test("standard-svaret er 12 gange den laveste sats, ikke en sum der er gjort i hånden", async () => {
    const html = await render("da");
    const aarssum = 12 * 20749;
    // Nøgletallene i markupken, formatteret da-DK med formatsvende af samme
    // slags som `formatCurrency` bruger.
    const da = (tal: number) =>
      new Intl.NumberFormat("da-DK", {
        style: "currency",
        currency: "DKK",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(tal);
    expect(html).toContain(`<strong class="text-lg">${da(aarssum)}</strong>`);
    // Pr. måned = aarsfribeløbet / 12, altså præcis den laveste sats.
    expect(html).toContain(`<dd class="font-medium">${da(20749)}</dd>`);
    // Brutto = efter-AM-tallet delt på 0,92, rundet ned.
    expect(html).toContain(da(Math.floor(aarssum / 0.92)));
  });

  test("satserne i værktøjet er de samme tal som i tabellen under det", async () => {
    const html = await render("da");
    // Hver sats skal stå BÅDE i værktøjets markup OG i prose-tabellen, så de
    // ikke kan glide fra hinanden. Tællet dømmer forekomster, ikke substrings.
    const forekomster = (nål: string) => html.split(nål).length - 1;
    // 20.749 (med SU) og 23.598 (uden SU) er i begge.
    expect(forekomster("20.749")).toBeGreaterThanOrEqual(2);
    expect(forekomster("23.598")).toBeGreaterThanOrEqual(2);
    // 15.297, 45.420, 3.921 og 34.129 står i hvert fald i tabellen.
    for (const sats of ["15.297", "45.420", "3.921", "34.129"]) {
      expect(forekomster(sats)).toBeGreaterThanOrEqual(1);
    }
  });

  test("svarer på det, danskerne faktisk spørger om: en måned med meget og en med intet", async () => {
    const html = await render("da");
    // su.dk siger eksplicit, at året måles som helhed, så værktøjet må ikke
    // love en månedsgrænse, brugeren så bliver målt på.
    expect(html).toContain("en måned med meget og en måned med intet kan godt gå op i mellem");
    expect(html).toContain("før skat, men efter");
  });

  test("norske og svenske domæner får ikke den danske SU-tekst", async () => {
    for (const locale of ["se", "no"] as const) {
      const html = await render(locale);
      expect(html).not.toContain("Hvor meget må jeg tjene ved siden af min SU?");
      expect(html).not.toContain("248.988");
    }
  });
});
