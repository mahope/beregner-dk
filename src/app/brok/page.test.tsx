import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { forkortBrok } from "@/lib/brok";
import { formatNumber } from "@/lib/format";
import BrokPage from "./page";

vi.mock("@/components/BrokBeregner", () => ({
  default: () => <div>Brøkværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

describe("brok page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Brøkberegner - forkort brøk til decimaltal og procent",
      answer: "6/8 forkortet = 3/4 = 0,75 = 75 %",
    },
    {
      locale: "se" as const,
      heading: "Bråkkalkylator - förkorta bråk till decimaltal och procent",
      answer: "6/8 förkortat = 3/4 = 0,75 = 75 %",
    },
  ])("viser det konkrete brøk-svar og beregneren i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await BrokPage());

    expect(html).toContain(`>${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Brøkværktøj");
  });

  test("de fire regneregler står med tal, der er regnet af forkortBrok", async () => {
    // "brøk regneregler" er dansk autocompletes nr. 1 under "brøk". Tallene
    // udledes af modulet, så brødteksten ikke kan modsige værktøjet ovenfor.
    const html = renderToStaticMarkup(await BrokPage());
    const t = (x: number, y: number) => forkortBrok(x, y)!;
    const dec = (x: number, y: number) =>
      formatNumber(t(x, y).decimal, "da", { maximumFractionDigits: 3 });
    const pct = (x: number, y: number) =>
      formatNumber(t(x, y).procent, "da", { maximumFractionDigits: 1 });

    expect(html).toContain("<h2>Brøkregning: de fire regneregler</h2>");
    // Plus og minus kræver ens nævnere; resultaterne er 5/6 og 1/2.
    expect(html).toContain(`3/6 + 2/6 = <strong>5/6</strong> = ${dec(5, 6)} = ${pct(5, 6)} %`);
    expect(html).toContain(`3/4 − 1/4 = 2/4 = <strong>1/2</strong> = ${dec(1, 2)} = ${pct(1, 2)} %`);
    // Gange: 1/2 × 2/3 = 2/6 = 1/3.
    expect(t(1 * 2, 2 * 3).taeller).toBe(t(1, 3).taeller);
    expect(t(1 * 2, 2 * 3).naevner).toBe(t(1, 3).naevner);
    expect(html).toContain(`2/6 = <strong>1/3</strong> = ${dec(1, 3)} = ${pct(1, 3)} %`);
    // Dele: 1/2 ÷ 2/3 = 1/2 × 3/2 = 3/4.
    expect(html).toContain(`1/2 ÷ 2/3 = 1/2 × 3/2 = 3/4 = <strong>${dec(3, 4)}</strong>`);
  });

  test("omregningstabellen er forkortet, decimal og procent, regnet af modulet", async () => {
    const html = renderToStaticMarkup(await BrokPage());

    expect(html).toContain("procent = brøk × 100");
    for (const [t, n] of [
      [1, 2],
      [1, 4],
      [3, 4],
      [1, 8],
      [2, 3],
      [5, 6],
      [7, 10],
    ] as [number, number][]) {
      const r = forkortBrok(t, n)!;
      const dec = formatNumber(r.decimal, "da", { maximumFractionDigits: 3 });
      const pct = formatNumber(r.procent, "da", { maximumFractionDigits: 1 });
      expect(html, `${t}/${n}`).toContain(`<td>${dec}</td><td>${pct} %</td>`);
      // Invarianten: procent er decimaltallet × 100, inden for den afrunding
      // tabellen bruger. Uden denne lås kan en af de to kolonner rykke sig.
      expect(Math.abs(r.procent - r.decimal * 100), `${t}/${n}`).toBeLessThan(0.1);
    }
  });

  test("brøkdel af et tal er besvaret med tal, der kan efterprøves", async () => {
    const html = renderToStaticMarkup(await BrokPage());

    expect(html).toContain("Sådan regner du en brøkdel af et tal");
    expect(html).toContain("(3 × 200) ÷ 4 = <strong>150 kr.</strong>");
    expect(html).toContain("1.000 ÷ 4 = 250 kr.");
    expect(html).toContain("(2 × 250) ÷ 5 = 100 kr.");
    expect(html).toContain("3/4 er 75 %, og 75 % af 200 er 150");
    expect(html).toContain('href="/procent"');
  });

  test("den svenske side er urørt af den danske regneblok", async () => {
    // C82's lektion: en sproggren må ikke arve den andens svar, fordi den er
    // skrevet først. De danske strenge skal derfor være 0 på beraknare.se.
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await BrokPage());

    for (const dansk of [
      "Brøkregning",
      "regneregler",
      "procent = brøk × 100",
      "brøkdel af et tal",
      "(3 × 200) ÷ 4",
    ]) {
      expect(html, dansk).not.toContain(dansk);
    }
    expect(html).toContain("Förkorta ett bråk");
  });
});
