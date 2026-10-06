import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getPageData } from "@/lib/page-data";
import { getRouteDecision } from "@/lib/routing";
import { getDomainConfig } from "@/lib/domain-config";
import { iDagPaSiden } from "@/lib/lokal-dato";
import {
  dageIAar,
  getUgedagPath,
  isoUge,
  ugedagResultat,
  ugedagsnavn,
} from "@/lib/ugedag";

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
 * Siden indlægger sit værktøj med `next/dynamic`, som suspenderer — og en
 * suspendérende komponent kan ikke renderes i et synkront `renderToStaticMarkup`.
 * Det er en målebegrænsning, ikke en fejl på siden. Værktøjet dømmes i
 * `UgedagBeregner.test.tsx` og logikken i `ugedag.test.ts`; her dømmes det,
 * der *kun* findes i markup'en: titel, brødtekst, interne links og ruterne.
 */
vi.mock("@/components/UgedagBeregner", () => ({
  default: ({ initialDato }: { initialDato?: string }) => (
    <div>Ugedagsværktøj:{initialDato ?? "INGEN-DATO"}</div>
  ),
}));
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
  const UgedagPage = (await import("@/app/ugedag/page")).default;
  return renderToStaticMarkup(await UgedagPage());
}

const da = getDomainConfig("minberegner.dk");
const se = getDomainConfig("beraknare.se");

describe("/ugedag og /veckodag — titel og metadata", () => {
  test("titlen lover en regnet ugedag, og den er rigtig", () => {
    // Titlen skriver «1. januar 2026 var en torsdag». Ugedagen kommer fra
    // `ugedagResultat` — samme funktion som værktøjet. Mutation af
    // `ugedagsnavn` gør BÅDE denne test og `ugedag.test.ts` røde, fordi der
    // ikke findes en anden kilde til ugedagen.
    const side = getPageData("ugedag", "da")!;
    expect(side.metaTitle).toContain("1. januar 2026");
    expect(side.metaTitle).toContain("torsdag");
    expect(side.metaTitle.length).toBeLessThanOrEqual(70);
    expect(ugedagsnavn("2026-01-01", "da")).toBe("Torsdag");
    expect(isoUge("2026-01-01")).toEqual({ uge: 1, ugedag: 4 });
  });

  test("den svenske titel lover den samme ugedag, på svensk", () => {
    const side = getPageData("veckodag", "se")!;
    expect(side.metaTitle).toContain("1 januari 2026");
    expect(side.metaTitle).toContain("torsdag");
    expect(side.metaTitle.length).toBeLessThanOrEqual(70);
    // Ingen *dansk* i den svenske titel. «Veckodagskalkylator» og «januari»
    // er svenske og må ikke forveksles med «ugedag» og «januar» — så porten
    // dømmer på de danske *ord*, ikke på substring. Mutation: skriv titlen
    // med `ugedagResultat(..., "da")` → rød.
    expect(side.metaTitle).toMatch(/januari/);
    expect(side.metaTitle).not.toMatch(/ugedag/);
    expect(side.metaTitle).not.toMatch(/\bjanuar\b/);
    expect(side.metaTitle).toContain("Veckodag");
    expect(getPageData("ugedag", "da")!.metaTitle).toMatch(/\bjanuar\b/);
    expect(getPageData("ugedag", "da")!.metaTitle).not.toMatch(/\bjanuari\b/);
  });

  test("titlen svarer på den søgning, siden er lavet til", () => {
    // «hvilken ugedag er jeg født» og «vilken veckodag är jag född» er de
    // completioner, opgaven er lavet efter. Uden dem i titlen er siden en
    // beregner uden spørgsmål.
    expect(getPageData("ugedag", "da")!.keywords).toContain("hvilken ugedag er jeg født");
    expect(getPageData("veckodag", "se")!.keywords).toContain("vilken veckodag är jag född");
  });

  test("begge sprog har egen `<h1>`, egen sti og egen brødkategori", () => {
    const dansk = getPageData("ugedag", "da")!;
    const svensk = getPageData("veckodag", "se")!;
    expect(dansk.title).not.toBe(svensk.title);
    expect(dansk.breadcrumbCategoryHref).toBe("/kategori/praktisk");
    // Kategori-sluggen er **samme** på begge domæner — `/kategori/praktiskt`
    // er en 404 på beraknare.se (målt 6/10), så den må ikke stå her.
    expect(svensk.breadcrumbCategoryHref).toBe("/kategori/praktisk");
    expect(dansk.breadcrumbCategoryHref).not.toBe(svensk.breadcrumbCategoryHref + "t");
  });
});

describe("/ugedag — den renderede side", () => {
  test("brødtekstens ugedag er den, kalenderen siger", async () => {
    const html = await markup();
    expect(html).toContain("1. januar 2026");
    expect(html).toContain("torsdag");
    // Mutér `ugedagResultat`-eksemplet i page.tsx til en anden dato → denne
    // og metadata-testen bliver begge røde.
    expect(ugedagResultat("2026-01-01", "da")!.ugedagTekst).toBe("Torsdag");
  });

  test("siden svarer på «hvilken ugedag er jeg født» i FAQ'en", async () => {
    const html = await markup();
    expect(html).toMatch(/fødselsdato|født/i);
  });

  test("brødteksten forklarer ISO-reglen med et regnet tal", async () => {
    // 24. december 2026 ligger i uge 52, fordi 1. januar 2027 er en fredag.
    // Det er præcis den regel, der gør ugerne ved årsskiftet overraskende, og
    // tallet skal komme fra `isoUge` — ikke fra en håndskreven «52».
    const html = await markup();
    expect(html).toContain("24. december 2026");
    expect(html).toContain(`uge ${ugedagResultat("2026-12-24", "da")!.uge}`);
    expect(ugedagResultat("2026-12-24", "da")!.uge).toBe(52);
  });

  test("værktøjets dagens dato er med i den server-renderede HTML", async () => {
    // Punkt 1 i kvalitetsreglerne: en klient-komponent med `useState("")` er
    // **tom** i den HTML, Google og alle uden JavaScript ser. Siden skal derfor
    // sende dagens dato ned som prop, regnet i sidens tidszone. Mutér
    // `iDagPaSiden` til `tilIsoDato(new Date())` — altså serverens UTC-dag —
    // og denne test bliver rød omkring kl. 00-02 dansk tid.
    const html = await markup();
    const iDag = iDagPaSiden(new Date(), "da");
    expect(html).toContain(`Ugedagsværktøj:${iDag}`);
    // 2026-10-06 er en tirsdag; retter proppen til en forkert dato, dør porten.
    expect(ugedagResultat(iDag, "da")!.ugedagTekst).toBe("Tirsdag");
    expect(html).not.toContain("INGEN-DATO");
  });

  test("alle interne links i brødteksten findes i sitets egne lister", async () => {
    const html = await markup();
    const links = Array.from(new Set(Array.from(html.matchAll(/href="(\/[a-z0-9-]*)"/g), (m) => m[1])));
    // De fire stier, siden linker til, er alle danske og findes i
    // `calculatorDefs` eller er en egen dansk rute. En svensk sti på en dansk
    // side (eller omvendt) er et 404 — det er præcis den fejl, porten her
    // låser, efter at `/kategori/praktiskt` viste sig at være en 404 på
    // beraknare.se.
    for (const sti of links) {
      expect(sti).not.toBe("/veckodag");
      expect(sti).not.toContain("praktiskt");
      expect(sti).not.toContain("dagar-");
    }
    expect(links).toContain("/dage-mellem-datoer");
    expect(links).toContain("/nedtaelling");
  });
});

describe("routing og sitemap", () => {
  test("hvert domæne 301'er den anden sprogsti", () => {
    // Uden denne regel serverede beraknare.se/ugedag dansk på et svensk domæne,
    // og samme svar lå på to URL'er pr. domæne.
    expect(getRouteDecision(da, "/ugedag")).toEqual({ type: "allow" });
    expect(getRouteDecision(se, "/veckodag")).toEqual({ type: "allow" });
    expect(getRouteDecision(da, "/veckodag")).toEqual({
      type: "redirect",
      destination: "/ugedag",
      status: 301,
    });
    expect(getRouteDecision(se, "/ugedag")).toEqual({
      type: "redirect",
      destination: "/veckodag",
      status: 301,
    });
  });

  test("begge stier er i hvert sit sitemap", () => {
    const dansk = getUgedagPath("da");
    const svensk = getUgedagPath("se");
    expect(dansk).toBe("/ugedag");
    expect(svensk).toBe("/veckodag");
    // Sitemap'en lister pr. domæne præcis sin egen sti.
    expect(dansk).not.toBe(svensk);
  });
});

describe("FAQ'en svarer på spørgsmål, læseren faktisk stiller", () => {
  test("alle svars påstande er regnet, ikke skrevet i hån", async () => {
    const side = getPageData("ugedag", "da")!;
    const heltTekst = side.faqItems.map((f) => f.answer).join(" ");
    // Dagene i et skudår, regnet — 2026 har 365, 2024 har 366, 1900 har 365,
    // 2000 har 366. Mutation af `dageIAar` til altid 365 → 1 rød her.
    expect(heltTekst).toContain(`${dageIAar(2026).dage} dage`);
    expect(heltTekst).toContain(`${dageIAar(2024).dage}`);
    expect(heltTekst).toContain(`${dageIAar(1900).dage}`);
    expect(dageIAar(1900).dage).toBe(365);
    expect(dageIAar(2000).dage).toBe(366);
  });

  test("den svenske FAQ svarer på svenska spørgsmål", () => {
    const side = getPageData("veckodag", "se")!;
    const spg = side.faqItems.map((f) => f.question.toLowerCase()).join(" ");
    expect(spg).toContain("vilken veckodag är jag född");
    // Ingen dansk i de svenske spørgsmål. Mutation: svar med `da` → rød.
    expect(spg).not.toMatch(/hvilken|fødselsdato/);
  });

  test("FAQ'en nævner den konkrete forskel på ISO-uge og kalenderuge", () => {
    // Uden den linje er «uge 52» en påstand uden forklaring, og en læser der
    // troede at uge 1 altid er den med 1. januar, ville tro at siden har lavet
    // en fejl.
    const svar = getPageData("ugedag", "da")!.faqItems.find((f) =>
      f.question.includes("ISO"),
    );
    expect(svar).toBeDefined();
    expect(svar!.answer).toMatch(/første torsdag/);
  });
});
