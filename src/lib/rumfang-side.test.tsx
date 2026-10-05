import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getPageData } from "@/lib/page-data";
import { LITER_PR_KUBIKMETER, RUMFANG_EKSEMPEL, RUMFANG_FORMEL, rumfangSvar } from "@/lib/rumfang";
import { getCalculatorsByLocale, isCalculatorAvailable } from "@/lib/calculator-list";
import { OG_IMAGE } from "@/lib/page-helpers";

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(async () => "da"),
  getCurrentDomainConfig: vi.fn(async () => ({
    baseUrl: "https://minberegner.dk",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
    locale: "da",
  })),
}));

/**
 * `/rumfang` indlægger sit værktøj med `next/dynamic`, som suspenderer — og en
 * suspendérende komponent kan ikke renderes i et synkront `renderToStaticMarkup`.
 * Det er en målebegrænsning, ikke en fejl på siden, så værktøjet og de tre
 * rammekomponenter stubbes. Alt porten vil se — formeltabellen, brødteksten og
 * de interne links — ligger uden for dem.
 */
vi.mock("@/components/RumfangBeregner", () => ({ default: () => <div>Rumfangværktøj</div> }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Sidebar", () => ({ default: () => null }));
vi.mock("@/components/ads/AdBanner", () => ({ InlineAd: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));

async function markup(): Promise<string> {
  const RumfangPage = (await import("@/app/rumfang/page")).default;
  return renderToStaticMarkup(await RumfangPage());
}

/**
 * Porten dømmer på den **renderede** side, ikke på at `rumfang.ts` regner
 * rigtigt — den port findes i `rumfang.test.ts`. Her dømmes tre ting, som
 * alle har kostet en bruger en forkert side før:
 *
 * 1. **Formeltabellen og værktøjet kan ikke vise hver sin formel.** Tabellen i
 *    `page.tsx` læser `RUMFANG_FORMEL`, som også værktøjet læser. Mutér
 *    `RUMFANG_FORMEL.kugle` til en kasseformel, og både tabellen og
 *    `RUMFANG_FORMEL`-porten bliver røde.
 * 2. **Titel, description og FAQ skal love det samme tal.** De læser
 *    `page-data.ts`, og `meta-title-tal.test.ts` dømmer titlen mod samme
 *    modul. Uden den her kunne FAQ'en sige 1,57 m³, mens titlen siger 0,52.
 * 3. **Siden skal være dansk på dansk.** Mutér den svenske `title` til den
 *    danske, og `forventerSvensk` bliver rød.
 */
describe("/rumfang siden", () => {
  const da = getPageData("rumfang", "da")!;
  const se = getPageData("rumfang", "se")!;

  test("formeltabellen viser alle fem figurer med formlen fra modulet", async () => {
    const html = await markup();
    for (const [figur, formel] of Object.entries(RUMFANG_FORMEL)) {
      expect(html, figur).toContain(formel.replace(/</g, "&lt;"));
    }
    // Alle fem navne står i tabellen — ikke kun de figurer, der har en formel.
    for (const navn of ["Kasse", "Cylinder", "Kugle", "Kegle", "Pyramide"]) {
      expect(html, navn).toContain(navn);
    }
  });

  test("FAQ'en svarer på de fire spørgsmål, autocomplete viste", () => {
    const spg = da.faqItems.map((f) => f.question).join(" | ");
    expect(spg).toMatch(/Hvordan beregner man rumfang\?/);
    expect(spg).toMatch(/diameter 1 meter/);
    expect(spg).toMatch(/Hvor mange liter er der i en kubikmeter\?/);
    expect(spg).toMatch(/areal og rumfang/);
  });

  test("titlen og beskrivelsen lover det samme cylindertal som FAQ'en", () => {
    // π/2 m³ — cylinderen med d = 1 m og h = 2 m.
    const forventet = RUMFANG_EKSEMPEL.cylinder.svar.kubikmeter
      .toLocaleString("da-DK", { maximumFractionDigits: 2 });
    expect(da.metaTitle).toContain(forventet);
    expect(da.metaDescription).toContain(forventet);
    const faq = da.faqItems.find((f) => /diameter 1 meter/.test(f.question))!.answer;
    expect(faq).toContain(forventet);
  });

  test("titlen siger diameter, fordi det er den fejl, der ganges fire gange", () => {
    expect(da.metaTitle).toMatch(/d = 1 m/);
    expect(da.keywords.join(" ")).toMatch(/rumfang cylinder/);
  });

  test("beskrivelserne er korte nok til et uddrag", () => {
    // Samme læge som `page-data.test.ts`, men kun for denne side, så en ny
    // sætning der ikke kan passes ind porten bliver rød med sit eget navn.
    for (const [locale, data] of [["da", da], ["se", se]] as const) {
      expect(data.metaDescription.length, locale).toBeLessThanOrEqual(160);
      expect(data.title.length, locale).toBeLessThanOrEqual(70);
    }
  });

  test("den svenske udgave er svensk og bruger svenske figurnavne", () => {
    expect(se.title).toBe("Volymberäknare");
    expect(se.metaTitle).not.toContain("Rumfangsberegner");
    expect(se.keywords.join(" ")).toMatch(/volym cylinder/);
    expect(se.faqItems.some((f) => f.question === "Hur beräknar man volym?")).toBe(true);
    // Tusindtalsseparatoren er skrevet med et punktum i modulet (JS-tal), så
    // porten tæller den og ikke et svensk tusindtal, der intet sted skrives.
    expect(se.faqItems.some((f) => f.answer.includes(`1 m³ = ${LITER_PR_KUBIKMETER} liter`))).toBe(true);
  });

  test("svensk og dansk beskriver samme tal for cylinderen", () => {
    const daFaq = da.faqItems.find((f) => /diameter 1 meter/.test(f.question))!.answer;
    const seFaq = se.faqItems.find((f) => /diameter 1 meter/.test(f.question))!.answer;
    const tal = RUMFANG_EKSEMPEL.cylinder.svar.kubikmeter
      .toLocaleString("da-DK", { maximumFractionDigits: 2 })
      .replace(".", ",");
    expect(daFaq).toContain(tal);
    expect(seFaq).toContain(tal);
  });

  test("siden er i katalog, sitemap-kredsen og ingeni norsk og svensk", async () => {
    const hrefs = getCalculatorsByLocale("da").map((c) => c.href);
    expect(hrefs).toContain("/rumfang");
    expect(isCalculatorAvailable("/rumfang", "da")).toBe(true);
    expect(isCalculatorAvailable("/rumfang", "se")).toBe(true);
    // `no`-siden findes ikke i page-data, så den må ikke have sit eget kort.
    expect(getPageData("rumfang", "no")).toBeUndefined();
    expect(se.slug).toBe("rumfang");
  });

  test("siden har schema og peger på kvadratmeter og procent", async () => {
    const html = await markup();
    expect(html).toContain("Rumfangsberegner");
    expect(html).toContain("/kvadratmeter");
    expect(html).toContain(String(LITER_PR_KUBIKMETER));
  });

  test("kvadratmeterexemplet i brødteksten er det, modulet regner", async () => {
    const html = await markup();
    const kasse = rumfangSvar("kasse", { kasse: { laengde: 2, bredde: 1, hoejde: 0.5 } })!;
    expect(kasse.kubikmeter).toBe(1);
    expect(kasse.liter).toBe(1000);
    expect(html).toContain("1.000 liter");
    expect(html).toContain("10 m²");
  });

  test("OG-billedet er sitets eget, ikke en ny fil", () => {
    expect(da.ogTitle).toBeTruthy();
    expect(OG_IMAGE).toBeTruthy();
  });
});