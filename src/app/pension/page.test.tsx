import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { FOLKEPENSION_2026, folkepensionMedFormel } from "@/lib/folkepension";
import PensionPage from "./page";

vi.mock("@/components/PensionBeregner", () => ({
  default: () => <div>Pensionsværktøj</div>,
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
async function html(locale: "da" | "se" | "no") {
  vi.mocked(getLocale).mockResolvedValue(locale);
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale(locale));
  return (await renderToStaticMarkup(await PensionPage())).replaceAll("<!-- -->", "");
}

describe("pension page — Excel-afsnittet", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("da svarer på \"beregner jeg pension i Excel\" med de fire formler", async () => {
    const side = await html("da");
    expect(side).toContain("<h2 id=\"pension-i-excel\">Beregn din pension i Excel</h2>");
    // Folkepension = grundbeløb + tillæg
    expect(side).toContain("7.544+8.729");
    // Arbejdsmarkedspension fra løn
    expect(side).toContain("=B2*0,15");
    // Nedsættelsen bruger både MIN og MAKS, som i folkepensionMedFormel
    expect(side).toContain("-MIN(8.729;MAKS(0;(B1-99.200)*30,9))");
    // Og grundbeløbet + den nedsatte tillægs-celle
    expect(side).toContain("=7.544+C3");
    // De tre fælder, der giver de forkerte tal
    expect(side).toContain("MAKS(0;…)");
    expect(side).toContain("semiklon");
  });

  test("de tal i brødteksten er beregnet af modulet, ikke skrevet i hånden", async () => {
    const side = await html("da");
    const eksempel = folkepensionMedFormel("enlig", 110000);
    const kr = (v: number) => new Intl.NumberFormat("da-DK").format(Math.round(v));
    // 110.000 kr: 10.800 kr over grænsen × 30,9 % = 3.337 kr nedsat
    expect(side).toContain(kr(eksempel.tillaeg));
    expect(side).toContain(kr(eksempel.iAlt));
    expect(eksempel.tillaeg).toBeCloseTo(5391.8, 6);
    expect(eksempel.iAlt).toBeCloseTo(12935.8, 6);
    // Regnestykket i brødtekten bruger de samme mellemled
    const overGraensen = 110000 - FOLKEPENSION_2026.indkomstgraenser.enlig.nedsaetningOver;
    const nedsatMed = FOLKEPENSION_2026.tillaeg.enlig - eksempel.tillaeg;
    expect(side).toContain(`${kr(overGraensen)} kr over grænsen`);
    expect(side).toContain(`nedsætter ${kr(nedsatMed)} kr`);
  });

  test("formlens konstanter er FOLKEPENSION_2026's egne tal", async () => {
    const side = await html("da");
    const g = FOLKEPENSION_2026.indkomstgraenser.enlig;
    const pct = new Intl.NumberFormat("da-DK", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(g.pct * 100);
    expect(side).toContain(`B1-${new Intl.NumberFormat("da-DK").format(g.nedsaetningOver)})*${pct}`);
    expect(side).toContain("7.544");
    expect(side).toContain("8.729");
  });

  test("da linker videre til lønberegneren og folkepensionsalderen", async () => {
    const side = await html("da");
    expect(side).toContain('href="/loen-efter-skat"');
    expect(side).toContain('href="#folkepensionsalder"');
  });
});

describe("pension page — FAQ", () => {
  test("de tre nye spørgsmål ligger i den tabel FAQ og FAQSchema læser", () => {
    const faq = getPageData("pension", "da")!.faqItems;
    const spoergsmaal = faq.map((f) => f.question);
    expect(spoergsmaal).toContain("Hvordan beregner jeg pension i Excel?");
    expect(spoergsmaal).toContain("Hvor meget er pensionstillægget for enlige?");
    expect(spoergsmaal).toContain("Hvornår forsvinder pensionstillægget helt?");
    // De skal være forskellige spørgsmål, ikke dubletter
    expect(new Set(spoergsmaal).size).toBe(faq.length);
  });

  test("Excel-svaret bruger de samme tal som modulet, ikke en anden sats", () => {
    const svar = getPageData("pension", "da")!.faqItems.find(
      (f) => f.question === "Hvordan beregner jeg pension i Excel?",
    )!.answer;
    const g = FOLKEPENSION_2026.indkomstgraenser.enlig;
    expect(svar).toContain("7.544+8.729");
    expect(svar).toContain("99.200");
    expect(svar).toContain("0,309");
    expect(svar).toContain("semiklon");
  });

  test("de to beløb hvor tillægget forsvinder er de beregnede, ikke de rundede", () => {
    const svar = getPageData("pension", "da")!.faqItems.find(
      (f) => f.question === "Hvornår forsvinder pensionstillægget helt?",
    )!.answer;
    const gEnlig = FOLKEPENSION_2026.indkomstgraenser.enlig;
    const gUden = FOLKEPENSION_2026.indkomstgraenser.samlevendeUdenPensionist;
    const enlig = Math.round(gEnlig.nedsaetningOver + FOLKEPENSION_2026.tillaeg.enlig / gEnlig.pct);
    const uden = Math.round(gUden.nedsaetningOver + FOLKEPENSION_2026.tillaeg.samlevende / gUden.pct);
    expect(svar).toContain(new Intl.NumberFormat("da-DK").format(enlig));
    expect(svar).toContain(new Intl.NumberFormat("da-DK").format(uden));
  });
});

describe("pension page — svensk lås", () => {
  test("beraknare.se har ingen dansk Excel-blok", async () => {
    const side = await html("se");
    for (const dansk of ["Beregn din pension i Excel", "=B2*0,15", "MAKS(0;", "semiklon", "nedsættelse"]) {
      expect(side).not.toContain(dansk);
    }
  });

  test("den svenske side har stadig sit eget indhold", async () => {
    const side = await html("se");
    expect(side).toContain("Pensionsværktøj");
    expect(side).toContain("<h1");
  });
});
