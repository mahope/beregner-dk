/**
 * Promillegrænserne i brødteksten målt mod loven, ikke mod et hjemmeskrevet
 * målescript (opgave 189).
 *
 * Uden denne port er `/promille` brødtekstens tal frie tal. `PROMILLEGRANSE_UDLAND`
 * siger i sin egen docblock at kilden er WHO's landoversigt hentet via Wikipedia —
 * altså en sekundær kilde, og de svenske og danske *særregler* i landstabellen var
 * slet ikke kildeført. Det viste sig dyrt: tabellen skrev at Danmark har
 * "Ingen særregel", mens Rådet for Sikker Trafik oplyser at grænsen blev sat ned til
 * 0,2 ‰ for nye bilister de første 3 år med kørekort i 2025.
 *
 * **Målerfælden fra F8 gælder også her.** Porten må ikke låse de ord den så, og
 * den må ikke måle mod en hjemmeskrevet antagelse om hvad loven siger. Derfor:
 *
 * 1. Kilden er hentet fra en myndighed, ikke husket. Retsinformation.dk serverer
 *    kun en SPA-skal til en agent (alle `/api/document/*`-stier svarer 200 med
 *    index.html), så den danske lov er læst gennem Rådet for Sikker Trafik, der
 *    gengiver færdselslovens § 53 ordret. Den svenske lov er læst i sin
 *    gældende lydelse på riksdagen.se.
 * 2. Tabellen herunder er *data fra kilden*, og porten læser tallene herfra — så
 *    et tal der ændrer sig i loven, ændrer hvad porten kræver af brødteksten.
 * 3. Kun de to lande med en hentet kilde måles. De otte anden rækker er Springvand
 *    fra den samme Wikipedia-tabel og springes over, ligesom F8's port gjorde;
 *    at låse dem ville bare låse de ord porten så.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { PROMILLEGRANSE, PROMILLEGRANSE_UDLAND } from "@/lib/promille";
import { getPageData } from "@/lib/page-data";
import PromillePage from "@/app/promille/page";

vi.mock("@/components/PromilleBeregner", () => ({
  default: () => <div>Promilleværktøj</div>,
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

/** Loven, som den står i den hentede kilde. Ikke husket — læst 30/9 2026. */
interface Lovkilde {
  /** Kilden, med afsnit, så en efterfølger kan genhente den. */
  kilde: string;
  /** Hvornår kilden blev hentet. */
  hentet: string;
  /** Den generelle grænse i ‰. */
  generel: number;
  /** Eventuel strengere grænse for nye bilister, i ‰. */
  nyBilist?: number;
  /** Hvor mange år den strengere grænse gælder. */
  nyBilistAar?: number;
  /** Grænsen for det grove brud, i ‰, hvis loven har en. */
  grov?: number;
}

const LOVKILDE: Record<string, Lovkilde> = {
  danmark: {
    kilde: "Færdselsloven § 53, gengivet ordret af Rådet for Sikker Trafik",
    hentet: "2026-09-30",
    generel: 0.5,
    nyBilist: 0.2,
    nyBilistAar: 3,
    // RST: "Over 2,0 promille … Du får frakendt kørekortet ubetinget i mindst 3 år."
    grov: 2.0,
  },
  sverige: {
    // 4 §: "alkoholkoncentrationen under eller efter färden uppgår till minst
    // 0,2 promille i blodet". 4 a §: grovt när "minst 1,0 promille i blodet".
    kilde: "Trafikbrottslagen (1951:649) 4 § og 4 a §",
    hentet: "2026-09-30",
    generel: 0.2,
    grov: 1.0,
  },
};

/**
 * "0,5" / "0,2" / "1,0" / "2,0". **Ikke** `String(tal)` — JavaScript skriver
 * `String(2.0)` som `"2"`, så den naive form gjør porten måle mod et tal der
 * aldrig står i brødteksten. Målerfældens fjerde udløber, fundet i denne
 * opgave: en forkert formatter lod to tests se ud som at de fejlede på
 * brødteksten, når de fejlede på sig selv.
 */
const danskKomma = (tal: number) => (Number.isInteger(tal) ? tal.toFixed(1) : `${tal}`).replace(".", ",");

/** Alle tal i den hentede lovgivning — tilladt i en sætning der sammenligner. */
const TAL_FRA_LOVEN = Object.values(LOVKILDE).flatMap((lov) =>
  [lov.generel, lov.nyBilist, lov.nyBilistAar, lov.grov]
    .filter((t): t is number => typeof t === "number")
    .map(danskKomma)
);

/** Hent en `<tr>` ud af den renderede landstabel. */
const raekke = (html: string, land: string): string => {
  const rækker = html.match(/<tr>(?:(?!<\/tr>)[\s\S])*?<\/tr>/g) ?? [];
  const fundet = rækker.find((r) => r.includes(`>${land}</td>`));
  if (!fundet) throw new Error(`Ingen række for ${land} i den renderede tabel`);
  return fundet;
};

/** Brødteksten på `/promille` i ét sprog: FAQ, description og og-description. */
const sideTekster = (locale: "da" | "se") => {
  const side = getPageData("promille", locale);
  if (!side) throw new Error(`Ingen sidedata for /promille (${locale})`);
  return [
    ...side.faqItems.map((f) => `${f.question} ${f.answer}`),
    side.metaDescription,
    side.ogDescription,
  ];
};

const danskeTekster = () => sideTekster("da");
const svenskeTekster = () => sideTekster("se");

/**
 * Find en hel sætning der *fastsætter* et tal. Bredere læsninger af samme
 * brødtekst gav i denne opgave 29 fund i dansk og 31 i svensk, hvor **alle** var
 * beregnede promiller, Tysklands og Storbritanniens grænser eller et hypotetisk
 * "må jeg køre med 0,4". Det er målerfældens sjette udløber, og F8's port blev
 * af samme grund snævret fra "alle ugedage" til de to påstande der faktisk var
 * forkerte. Porten her må derfor *kræve* kildens tal frem for at søge efter
 * forkerte — en mutation i kilden eller i brødteksten giver så et rødt svar.
 */
const sætningMed = (tekster: string[], mønster: RegExp) =>
  tekster.flatMap((t) => t.split(/(?<=[.!?])\s+/)).find((s) => mønster.test(s)) ?? "";

const SVERIGE = /\bSverige|svensk/i;

describe("promillegrænser mod loven", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("de hentede love må aldrig ændre sig uden at porten bliver rød", () => {
    // Lovenes tal står her, fordi de er hentet. De skal ikke kunne glide fra
    // kilden uden at nogen lægger mærke til det — derfor låses de fra begge sider.
    expect(LOVKILDE.sverige).toEqual({
      kilde: "Trafikbrottslagen (1951:649) 4 § og 4 a §",
      hentet: "2026-09-30",
      generel: 0.2,
      grov: 1.0,
    });
    expect(LOVKILDE.danmark).toEqual({
      kilde: "Færdselsloven § 53, gengivet ordret af Rådet for Sikker Trafik",
      hentet: "2026-09-30",
      generel: 0.5,
      nyBilist: 0.2,
      nyBilistAar: 3,
      grov: 2.0,
    });
  });

  test("beregnerens egen grænse er den grænse, loven giver", () => {
    expect(PROMILLEGRANSE.da).toBe(LOVKILDE.danmark.generel);
    expect(PROMILLEGRANSE.se).toBe(LOVKILDE.sverige.generel);
  });

  test("landstabellen viser den generelle grænse fra loven, ikke en anden", () => {
    for (const [nokkel, lov] of Object.entries(LOVKILDE)) {
      expect(PROMILLEGRANSE_UDLAND[nokkel]).toBe(lov.generel);
    }
  });

  test("Danmark må ikke stå med 'Ingen særregel' — loven har sænket den for nye bilister", async () => {
    const lov = LOVKILDE.danmark;
    expect(lov.nyBilist).toBeDefined();
    expect(lov.nyBilistAar).toBeDefined();

    const html = renderToStaticMarkup(await PromillePage());
    const række = raekke(html, "Danmark");

    // Begge tal fra kilden skal stå i rækken, så en værdi der ændrer sig i
    // loven, gør porten rød indtil brødteksten følger med.
    expect(række).toContain(`${danskKomma(lov.nyBilist!)} ‰`);
    expect(række).toContain(`${lov.nyBilistAar} år`);
    // Og den skal ikke sige det modsatte, som den gjorde før denne opgave.
    expect(række).not.toMatch(/Ingen særregel/);
  });

  test("Sveriges række skal nævne den grove grænse fra 4 a §", async () => {
    const lov = LOVKILDE.sverige;
    expect(lov.grov).toBeDefined();

    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("se"));
    const html = renderToStaticMarkup(await PromillePage());

    expect(raekke(html, "Sverige")).toContain(`${danskKomma(lov.generel)} ‰`);
    // Sverige har ingen lavere grænse for nye bilister i 4 §, så rækken skal
    // ikke opfinde en — kun den generelle og den grove.
    expect(raekke(html, "Sverige")).not.toMatch(/de första \d+ åren/);
  });

  test("svensk brødtekst fastsætter 4 §'s grænse og 4 a §'s grove grænse", () => {
    const lov = LOVKILDE.sverige;
    const tekster = svenskeTekster();

    const fastsat = sætningMed(tekster, /gränsen för rattfylleri/i);
    expect(fastsat).not.toBe("");
    expect(fastsat).toContain(`${danskKomma(lov.generel)} ‰`);

    const grov = sætningMed(tekster, /grovt rattfylleri/i);
    expect(grov).not.toBe("");
    expect(grov).toContain(`${danskKomma(lov.grov!)} ‰`);
  });

  test("dansk brødtekst fastsætter færdselslovens 0,5 ‰", () => {
    const lov = LOVKILDE.danmark;
    const tekster = danskeTekster();

    const fastsat = sætningMed(tekster, new RegExp(`${danskKomma(lov.generel)}\\s*‰`, "i"));
    // Siden er dansk, så en sætning der fastsætter 0,5,5 skal være Danmarks
    // egen — den skal ikke blot nævne et tal der ligner.
    expect(fastsat).toMatch(/ulovligt/i);
    expect(fastsat).toContain(`${danskKomma(lov.generel)} ‰`);
  });

  test("dansk brødtekst må ikke kalde 2,0 ‰ noget andet end ubetinget kørekorttab", () => {
    const lov = LOVKILDE.danmark;
    const sætninger = danskeTekster().flatMap((t) => t.split(/(?<=[.!?])\s+/));

    const nævnerGroft = sætninger.filter((s) => s.includes(danskKomma(lov.grov!)));
    expect(nævnerGroft.length).toBeGreaterThan(0);
    for (const sætning of nævnerGroft) {
      // RST: over 2,0 får man kørekortet frakendt ubetinget i mindst 3 år. En
      // sætning der nævner 2,0 skal hænge sammen med kørekortet, ellers er
      // den en løs promilleoplysning uden lovens følge.
      expect(sætning).toMatch(/kørekort/);
    }
  });

});
