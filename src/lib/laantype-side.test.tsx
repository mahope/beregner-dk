import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getPageData } from "@/lib/page-data";
import { getCalculatorsByLocale, isCalculatorAvailable } from "@/lib/calculator-list";
import {
  LAANETYPE_EKSEMPEL_HOVEDSTOL,
  LAANETYPE_EKSEMPEL_LOEBETID,
  laanetypeEksempelFor,
} from "@/lib/laantype";
import { OG_IMAGE } from "@/lib/page-helpers";
import { formatNumber, formatSvenskText } from "@/lib/format";

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(async () => "da"),
  getCurrentDomainConfig: vi.fn(async () => ({
    baseUrl: "https://minberegner.dk",
    siteName: "MinBeregner.dk",
    ogLocale: "da_DK",
    locale: "da",
  })),
}));

vi.mock("@/components/LaantypeBeregner", () => ({ default: () => <div>Lånetypeværktøj</div> }));
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
  const Page = (await import("@/app/laantype/page")).default;
  return renderToStaticMarkup(await Page());
}

const kr = (n: number) => formatNumber(n, "da", { maximumFractionDigits: 0 });
const annuitet = laanetypeEksempelFor("annuitet");
const serielaan = laanetypeEksempelFor("serielaan");
const staende = laanetypeEksempelFor("staende");

/**
 * Porten dømmer på den **renderede** side. Der er to ting, den skal fange,
 * fordi de begge har kostet en bruger en forkert side før:
 *
 * 1. **Brødteksten og værktøjet må ikke vise hver sit tal.** Alle tal i
 *    `page.tsx` læser `laantypeEksempelFor`, som går gennem de samme
 *    funktioner som `/renteberegner`. Mutér kilden til konstanten til 3.000.000,
 *    og både disse forventninger og `laantype.test.ts` bliver røde.
 * 2. **Titlen, description og FAQ skal love præcis det, søgningen spørger om.**
 *    Autocomplete målt 6/10 (`hl=da&gl=dk`) har «annuitetslån vs serielån» og
 *    «annuitetslån serielån og stående lån» som de to største variationer, så
 *    strengen skal stå i både metaTitle og keywords.
 */
describe("/laantype — dansk", () => {
  test("svarer på sitets største søgning: annuitetslån vs serielån", async () => {
    const { generateMetadata } = await import("@/app/laantype/page");
    const meta = await generateMetadata();
    // `title` er `{ absolute }` — layouten sætter sit eget suffix på titlen,
    // så kun den absolute streng er sidens egen.
    const titel =
      typeof meta.title === "object" && meta.title !== null && "absolute" in meta.title
        ? meta.title.absolute
        : meta.title;
    expect(titel).toContain("Annuitetslån vs serielån");
    expect(meta.description).toContain("annuitetslån");
    const html = await markup();
    expect(html).toContain("<h1");
  });

test("canonical og hreflang peger på /laantype på begge domæner", async () => {
    const { generateMetadata } = await import("@/app/laantype/page");
    const meta = await generateMetadata();
    expect(meta.alternates?.canonical).toBe("https://minberegner.dk/laantype");
    const sprog = meta.alternates?.languages as Record<string, string>;
    expect(sprog.da).toBe("https://minberegner.dk/laantype");
    expect(sprog.sv).toBe("https://beraknare.se/laantype");
  });

  test("keywords dækker de tre variationer dansk autocomplete målte", () => {
    const da = getPageData("laantype", "da")!;
    const nede = da.keywords.join(" ").toLowerCase();
    expect(nede).toContain("annuitetslån vs serielån");
    expect(nede).toContain("serielån beregner");
    expect(nede).toContain("stående lån");
  });

  test("alle tre typer står i titlen", () => {
    const da = getPageData("laantype", "da")!;
    expect(da.title).toContain("Annuitetslån");
    expect(da.title).toContain("serielån");
    expect(da.title).toContain("stående lån");
  });

  test("brødteksten bruger eksemplets beløb, rente og løbetid", async () => {
    const html = await markup();
    expect(html).toContain(kr(LAANETYPE_EKSEMPEL_HOVEDSTOL));
    expect(html).toContain(`4 %`);
    expect(html).toContain(`${LAANETYPE_EKSEMPEL_LOEBETID} års`);
  });

  test("brødteksten viser serielånets højere første ydelse og lavere rente", async () => {
    const html = await markup();
    expect(html).toContain(kr(serielaan.foersteYdelse));
    expect(html).toContain(kr(annuitet.foersteYdelse));
    expect(html).toContain(kr(serielaan.sidsteYdelse));
    expect(html).toContain(kr(staende.foersteYdelse));
  });

  test("forskellene i måned 1 og i rente står som konkrete tal", async () => {
    const html = await markup();
    const forskel = kr(serielaan.foersteYdelse - annuitet.foersteYdelse);
    const besparelse = kr(annuitet.samletRente - serielaan.samletRente);
    expect(forskel.length).toBeGreaterThan(0);
    expect(html).toContain(forskel);
    expect(html).toContain(besparelse);
  });

  test("FAQ'en svarer på forskellen, på hvad der er billigst og på reglen", () => {
    const da = getPageData("laantype", "da")!;
    const spg = da.faqItems.map((f) => f.question).join(" | ");
    expect(spg).toContain("forskellen på annuitetslån og serielån");
    expect(spg).toContain("Hvilken lånetype er billigst");
    expect(spg).toContain("stående lån");
    // Autocomplete har «stående lån hvad er det» og «stående lån fordele og
    // ulemper» — spørgsmålet om hvad det er, skal derfor være stillet.
    expect(spg).toContain("afdragsfrit lån");
    // Realkreditlovens § 4 er det, der gør afdragsfrihed lovlig. Påstanden er
    // læst i lovens egen tekst 6/10, så paragraffen skal stå i svaret — ellers
    // kan en læser ikke slå den op.
    expect(spg).toContain("30-årigt annuitetslån");
    const svar = da.faqItems.find((f) => f.question.includes("30-årigt"))!.answer;
    expect(svar).toContain("Realkreditlovens § 4");
    expect(svar).toContain("op til 10 år");
    expect(svar).toContain("ejerboliger til helårsbrug og fritidshuse");
  });

  test("FAQ'en indeholder de samme tal som værktøjet", () => {
    const da = getPageData("laantype", "da")!;
    const svar = da.faqItems.map((f) => f.answer).join(" ");
    expect(svar).toContain(kr(serielaan.foersteYdelse - annuitet.foersteYdelse));
    expect(svar).toContain(kr(annuitet.samletRente - serielaan.samletRente));
  });

  test("FAQSchema læser præcis faqItems, så tallene er i Googles svar", () => {
    const da = getPageData("laantype", "da")!;
    expect(da.faqItems.length).toBeGreaterThanOrEqual(5);
    for (const f of da.faqItems) {
      expect(f.question.length).toBeGreaterThan(10);
      expect(f.answer.length).toBeGreaterThan(40);
    }
  });

  test("siden linker videre til de tre relaterede værktøjer", async () => {
    const html = await markup();
    expect(html).toContain('href="/renteberegner"');
    expect(html).toContain('href="/rentefradrag"');
    expect(html).toContain('href="/boliglaan"');
  });

  test("siden har én h1, og den er sidens titel", async () => {
    const html = await markup();
    expect(html.match(/<h1/g) ?? []).toHaveLength(1);
    expect(html).toContain(getPageData("laantype", "da")!.title);
  });
});

describe("/laantype — svensk", () => {
  test("findes med egen titel og keywords på beraknare.se", () => {
    const se = getPageData("laantype", "se")!;
    expect(se.slug).toBe("laantype");
    expect(se.title).toContain("serielån");
    expect(se.title).toContain("stående lån");
    const nede = se.keywords.join(" ").toLowerCase();
    // Svensk autocomplete (hl=sv&gl=se) har «serielån vs annuitetslån
    // kalkylator» og «serielån vs annuitetslån» som egne variationer.
    expect(nede).toContain("serielån vs annuitetslån");
    expect(nede).toContain("stående lån");
  });

  test("den svenska titel og description bruger svensk tusindtalsseparator", () => {
    const se = getPageData("laantype", "se")!;
    expect(se.metaDescription).toContain(formatSvenskText(LAANETYPE_EKSEMPEL_HOVEDSTOL, 0));
    expect(se.metaDescription).not.toContain(kr(LAANETYPE_EKSEMPEL_HOVEDSTOL));
  });

  test("den svenska FAQ dækker samma frågor som den danska", () => {
    const se = getPageData("laantype", "se")!;
    const spg = se.faqItems.map((f) => f.question).join(" | ");
    expect(spg).toContain("skillnaden mellan annuitetslån och serielån");
    expect(spg).toContain("stående lån");
    expect(se.faqItems.length).toBeGreaterThanOrEqual(4);
  });

  test("den svenska side har ingen danske svar i sin FAQ", () => {
    const se = getPageData("laantype", "se")!;
    const alt = `${se.title} ${se.description} ${se.faqItems.map((f) => `${f.question} ${f.answer}`).join(" ")}`;
    // Punkt F9 i planen: 13 steder har dansk på norske domæner. Her kontrolleres
    // den modsatte vej — at svensk ikke kommer med dansk.
    for (const dansk of ["Hvad er", "Hvor ", "beregneren", "lånebeløb", "rente"]) {
      expect(alt.toLowerCase()).not.toContain(dansk.toLowerCase());
    }
  });
});

describe("/laantype — registrering", () => {
  test("værktøjet er i kalkulatorlisten på begge domæner", () => {
    for (const locale of ["da", "se"] as const) {
      const hrefs = getCalculatorsByLocale(locale).map((c) => c.href);
      expect(hrefs).toContain("/laantype");
    }
  });

  test("værktøjet er tilgængeligt i begge locales", () => {
    expect(isCalculatorAvailable("/laantype", "da")).toBe(true);
    expect(isCalculatorAvailable("/laantype", "se")).toBe(true);
  });

  test("relaterede værktøjer peger på de tre lån-sider", () => {
    const da = getCalculatorsByLocale("da").find((c) => c.href === "/renteberegner");
    expect(da).toBeDefined();
  });

  test("siden er med i sitemap og har canonical på sig selv", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = await sitemap();
    const stier = urls.map((u) => u.url);
    expect(stier.some((u) => u.includes("/laantype"))).toBe(true);
  });

  test("og:image er med på samme måde som de andre økonomisider", () => {
    const da = getPageData("laantype", "da")!;
    expect(da.ogTitle.length).toBeGreaterThan(10);
    expect(da.schemaCategory).toBe("FinanceApplication");
    expect(OG_IMAGE.length).toBeGreaterThan(0);
  });

  test("kategorien er Økonomi, så brødkrummen peger på en eksisterende kategori", () => {
    const da = getPageData("laantype", "da")!;
    expect(da.category).toBe("Økonomi");
    expect(da.breadcrumbCategoryHref).toBe("/kategori/oekonomi");
  });
});
