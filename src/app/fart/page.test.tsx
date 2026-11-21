import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { beregnFart } from "@/lib/fart";
import { fartOmregningsFakta } from "@/lib/fart-omregner";
import { formatNumber } from "@/lib/format";
import FartPage from "./page";

vi.mock("@/components/FartBeregner", () => ({
  default: () => <div>Fartværktøj</div>,
}));
vi.mock("@/components/FartOmregner", () => ({
  default: () => <div>Hastighedsomregner</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null, ArticleSchema: () => null }));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const n = (x: number) => formatNumber(x, "da", { maximumFractionDigits: 1 });

describe("fart page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("svarer på 'tid ud fra hastighed og distance' med de tre regnestykker", async () => {
    // GSC: "beregn tid ud fra hastighed og distance" 72 visninger, pos. 8, og
    // dansk autocomplete har "... og distance formel" som nr. 4. Tallene
    // udledes af beregnFart, så brødteksten ikke kan modsige værktøjet.
    const html = renderToStaticMarkup(await FartPage());

    const tid = beregnFart("tid", 100, 300, 0);
    const fart = beregnFart("fart", 0, 100, 2);
    const distance = beregnFart("distance", 50, 0, 2);

    expect(html).toContain("Sådan beregner du tid ud fra hastighed og distance");
    expect(html).toContain(`300 km ÷ 100 km/t = <strong>${n(tid!.tid)} timer</strong>`);
    expect(html).toContain(`100 km ÷ 2 timer = <strong>${n(fart!.fart)} km/t</strong>`);
    expect(html).toContain(`50 km/t × 2 timer = <strong>${n(distance!.distance)} km</strong>`);
  });

  test("fælden med timer og minutter står skrevet ud", async () => {
    const html = renderToStaticMarkup(await FartPage());

    expect(html).toContain("3 timer");
    expect(html).toContain("180 minutter");
    expect(html).toContain("ikke 3 minutter");
  });

  test("tempo-tabellen har alle rækker, og tempoet er 60 divideret med farten", async () => {
    const html = renderToStaticMarkup(await FartPage());

    expect(html).toContain("Fart og tempo er ikke det samme");
    expect(html).toContain("tempo = 60 ÷ farten");

    for (const fart of [8, 10, 12, 15, 20, 25, 30]) {
      const r = beregnFart("fart", 0, 1, 1 / fart);
      expect(html).toContain(`${n(fart)} km/t`);
      expect(html).toContain(`${n(r!.paceMinPrKm)} min/km`);
    }
  });

  test("tempoet modsiger aldrig farten: tempoet falder når farten stiger", async () => {
    const rækker = [8, 10, 12, 15, 20, 25, 30].map(
      (f) => beregnFart("fart", 0, 1, 1 / f)!.paceMinPrKm
    );

    for (let i = 1; i < rækker.length; i++) {
      expect(rækker[i]).toBeLessThan(rækker[i - 1]);
    }
    expect(beregnFart("fart", 0, 1, 1 / 10)!.paceMinPrKm).toBe(6);
  });

  test("brødtekken linker videre til brændstofberegneren", async () => {
    const html = renderToStaticMarkup(await FartPage());

    expect(html).toContain('href="/braendstof"');
    expect(html).toContain("brændstofberegneren");
  });

  test("de to nye spørgsmål ligger i FAQ-tabellen, som også JSON-LD'en læser", () => {
    const da = getPageData("fart", "da")!;
    const spgs = da.faqItems.map((f) => f.question);

    expect(spgs).toContain("Hvordan beregner jeg tid ud fra hastighed og distance?");
    expect(spgs).toContain("Er fart og tempo det samme?");
    // Formlen-spørgsmålet lå før og må ikke være forsvundet.
    expect(spgs).toContain("Hvad er formlen for fart, distance og tid?");
  });

  // Dansk autocomplete 6/10 20:3x: 10 af 10 træffere under «km i timen» er
  // omregning. Brødteksten skal derfor kunne svare på «100 km/t i m/s» osv.,
  // og tallene læses fra `fart-omregner` — samme modul som værktøjet.
  test("omregningsafsnittet svarer på 100 km/t i de tre andre enheder", async () => {
    const html = renderToStaticMarkup(await FartPage());
    const fakta = fartOmregningsFakta("da");

    expect(html).toContain("Omregn km/t til m/s, mph og knop");
    expect(html).toContain(`<strong>100 km/t i m/s:</strong> 27,78 m/s`);
    expect(html).toContain(`<strong>100 km/t i mph:</strong> 62,1 mph`);
    expect(html).toContain(`<strong>100 km/t i knop:</strong> 54 knop`);
    expect(html).toContain(`${fakta.milKm} km`);
    expect(html).toContain(`${fakta.somermilKm} km/t`);
    // Tempoet står som egne rækker og må derfor ikke få en enhedsfaktor.
    expect(html).toContain("er ikke enheder på linjen");
    expect(html).toContain("3 min/km og 18 sekunder");
    expect(html).toContain("6 min/km og 36 sekunder");
  });

  test("omregnings-FAQ'en læser de samme tal som brødteksten", () => {
    const fakta = fartOmregningsFakta("da");
    const da = getPageData("fart", "da")!;
    const spgs = da.faqItems.map((f) => f.question);
    const svar = da.faqItems.map((f) => f.answer).join(" ");

    expect(spgs).toContain("Hvor mange m/s er 100 km/t?");
    expect(spgs).toContain("Hvor mange km/t er 60 mph?");
    expect(spgs).toContain("Hvad er en knop, og hvor mange km/t er det?");
    expect(svar).toContain(`100 km/t er ${fakta.eksempler[0].resultat} m/s`);
    expect(svar).toContain(`60 mph er ${fakta.eksempler[4].resultat} km/t`);
    expect(svar).toContain(`10 knob ${fakta.eksempler[3].resultat} km/t`);
  });

  test("den svenske side får samme omregning på svensk", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await FartPage());
    const fakta = fartOmregningsFakta("se");

    expect(html).toContain("Omvandla km/h till m/s, mph och knop");
    expect(html).toContain(`${fakta.somermilKm} km/h`);
    expect(html).toContain("är inte enheter i raden");
    expect(html).not.toContain("Omregn km/t til m/s");
  });

  test("den svenska side regner de tre omvandlingarna, den danske gør", async () => {
    // Målt på beraknare.se 6/10 21:4x: den danske side har en liste med de tre
    // mest eftersökta omvandlingarna (100 km/t i m/s, mph og knop) og
    // definitionen på milen, den svenska sida gick direkte fra introduktionen
    // til «3,6 km/h är exakt 1 m/s» og skrev aldrig ut vad 100 km/h blir til.
    // Läsaren på beraknare.se får alltså inga tal at efterpröva i huvudet,
    // selv om domänen växer +141 %.
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await FartPage());
    const fakta = fartOmregningsFakta("se");

    expect(html).toContain(`<strong>100 km/h i m/s:</strong> ${fakta.eksempler[0].resultat} m/s`);
    expect(html).toContain(`<strong>100 km/h i mph:</strong> ${fakta.eksempler[1].resultat} mph`);
    expect(html).toContain(`<strong>100 km/h i knop:</strong> ${fakta.eksempler[2].resultat} knop`);
    expect(html).toContain(`${fakta.milKm} km`);
  });

  test("den svenske side er urørt af den danske rettelse", async () => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await FartPage());

    expect(html).toContain("Beräkna hastighet, sträcka eller tid");
    expect(html).toContain("Fartværktøj");
    expect(html).not.toContain("Sådan beregner du tid ud fra hastighed og distance");
  });
});
