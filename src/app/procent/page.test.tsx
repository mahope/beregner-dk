import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import ProcentPage from "./page";

vi.mock("@/components/ProcentBeregner", () => ({
  default: () => <div>Procentværktøj</div>,
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

/** React skriver `<!-- -->` mellem to tekstnoder i én JSX-celle, så de fjernes før grep. */
async function render(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return (await renderToStaticMarkup(await ProcentPage())).replaceAll("<!-- -->", "");
}

describe("procent page", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test.each([
    {
      locale: "da" as const,
      heading: "Procentberegner",
      answer: "10 procent af 250 er 25. Beregn procent, procentvis stigning og fald med formler.",
    },
    {
      locale: "se" as const,
      heading: "Procenträknare",
      answer: "10 procent av 250 är 25. Beräkna procent, procentuell ökning och minskning med formler.",
    },
  ])("viser det konkrete svar og beregneren i $locale", async ({ locale, heading, answer }) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

    const html = renderToStaticMarkup(await ProcentPage());

    expect(html).toContain(`<h1 class="text-3xl font-bold mb-2">${heading}</h1>`);
    expect(html).toContain(answer);
    expect(html).toContain("Procentværktøj");
  });

  test("den svenska siden har Excel-formlerna og säger inte på dansk skatt", async () => {
    vi.mocked(getLocale).mockResolvedValue("se");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));

    const html = renderToStaticMarkup(await ProcentPage());

    // Autocomplete (hl=sv): "hur räknar man ut procent i excel".
    expect(html).toContain("Hur räknar man ut procent i Excel?");
    expect(html).toContain("=A1/B1*100");
    expect(html).toContain("=A1*B1/100");
    // Interne links til de svenska værktøj, der besvarar den næste
    // spørgsmål i samme klasse.
    expect(html).toContain('href="/lon-efter-skatt"');
    expect(html).toContain('href="/loenstigning"');
    // 37 % er en dansk sats og kan ikke dokumenteres for svensk lön.
    expect(html).not.toContain("37% skatt");
    expect(html).toContain("kommunal skatt");
  });

  test("den danske side har Excel-formlerna og ingen dansk sats på et helt beløb", async () => {
    const html = renderToStaticMarkup(await ProcentPage());

    // Dansk autocomplete (hl=da, 2026-09-27) peger på "procent i excel
    // formel", "minus procent i excel" og "procent stigning i excel" — de
    // samme formler fandtes kun på den svenske side.
    expect(html).toContain("Hvordan regner man procent i Excel?");
    expect(html).toContain("=A1/B1*100");
    expect(html).toContain("=A1*B1/100");
    expect(html).toContain("=(B1-A1)/A1*100");
    expect(html).toContain('href="/loenstigning"');
    expect(html).toContain('href="/loen-efter-skat"');
    // 37 % er kommuneskat + statslig bundskat, og den statslige del først
    // slår ind over 641.200 kr (SATSER_2026.mellemskatGraense) — så den må
    // ikke stå som et resultat for 40.000 kr.
    expect(html).not.toContain("37% skat af 40.000 kr");
    expect(html).not.toContain("14.800");
    // Dansk tusindtalsseparator i brødteksten.
    expect(html).not.toContain("på 1000 kr");
  });

  // 8796c16 lod dansk og norsk urørt, fordi arbejdet var på den svenske
  // side. Det er samme metode, så formlerne skal findes i begge sprog.
  test("begge sprog har de tre Excel-formler", async () => {
    for (const [locale, overskrift] of [
      ["da", "Hvordan regner man procent i Excel?"],
      ["se", "Hur räknar man ut procent i Excel?"],
    ] as const) {
      vi.mocked(getLocale).mockResolvedValue(locale);
      vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));

      const html = renderToStaticMarkup(await ProcentPage());

      expect(html).toContain(overskrift);
      for (const formel of ["=A1/B1*100", "=A1*B1/100", "=(B1-A1)/A1*100"]) {
        expect(html).toContain(formel);
      }
    }
  });

  // SE /procent er beraknare.se's tredjestørste side (25.954 visninger, 2 klik,
  // CTR 0,0 %, pos. 10,0) og svarede på nul af den klynge, dens egen
  // sidekonkurrence danner: "procent skillnad mellan två tal" er nr. 1 under
  // "procent skillnad" og "räkna ut procent mellan två tal" nr. 10 under
  // "räkna ut procent" (autocomplete hl=se, 2026-09-28). Siden havde nul
  // forekomster af "mellan två tal".
  test("den svenska side svarar på skillnaden mellem to tall", async () => {
    const html = await render("se");

    expect(html).toContain("<h2>Skillnad i procent mellan två tal</h2>");
    // De to formler, der giver hver sit svar for de samme to tall.
    expect(html).toContain("((Ny - Gammal) / Gammal) × 100");
    expect(html).toContain("(|A - B| / ((A + B) / 2)) × 100");
    // Clusteren har tre Excel-varianter, så formlen skal stå i tabellen.
    expect(html).toContain("=(B1-A1)/A1*100");
    // Tallene er regnet, ikke skrevet i hånden: 25 % forskel mod 22,2 %
    // differens for 10 000 -> 12 500, og 10 % mod 9,5 % for 30 000 -> 33 000.
    expect(html).toContain("10 000 till 12 500 = 25 procent");
    expect(html).toContain("10 000 och 12 500 = 22,2 procent");
    expect(html).toContain("30 000 kr, der stiger til 33 000 kr");
    expect(html).toContain("stigning på 10 procent i en");
    expect(html).toContain("9,5 procent store forskellen");
    // Og fælden skal være skrevet ud, ellers er de to tal bare forvirrende.
    expect(html).toContain("De to formlene gir aldri samme svar");
    expect(html).toContain('href="/loenstigning"');
  });

  // Samme tal må aldrig stå med to forskellige separatorer på én side:
  // Intl bruger U+00A0 på svensk, resten af siden bruger almindeligt mellemrum.
  test("den svenska side bruger almindeligt mellemrum i tallene", async () => {
    const html = await render("se");
    expect(html).toContain("10 000 till 12 500");
    expect(html).not.toContain("\u00a0000");
  });

  // Dansk er bevidst urørt. Den danske klynge er målt (autocomplete hl=da) og
  // besvaret i C82, så en ny dansk sektion ville ødelægge målingen af den.
  test("den danske side er urørt af skillnadsafsnittet", async () => {
    const html = await render("da");
    expect(html).not.toContain("Skillnad i procent mellan två tal");
    expect(html).not.toContain("procentdifferens");
  });
});
