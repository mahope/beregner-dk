import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import {
  BOAFGIFT_SATS,
  BUNDFRADRAG,
  EFFEKTIV_MARGINAL_SATS,
  EKSEMPEL_BARN,
  EKSEMPLER_GUIDE,
  TILLAEGSBOAFGIFT_SATS,
  beregnArveafgift,
} from "@/lib/arveafgift";
import { getPageData } from "@/lib/page-data";
import { SATSER_2026 } from "@/lib/satser-2026";
import ArveafgiftPage from "./page";

vi.mock("next/dynamic", () => ({ default: () => () => <div>Værktøj</div> }));
// Beregneren er en klientkomponent med egen `useLocale`; den læser allerede
// SATSER_2026 direkte og dømmes ikke af denne port, som handler om brødteksten.
vi.mock("@/components/ArveafgiftBeregner", () => ({ default: () => null }));
vi.mock("@/components/AffiliateBox", () => ({ TestamenteAffiliate: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

/**
 * F5b: `/arveafgift` skrev «392.300 kr» syv gange i brødteksten og et helt
 * regnestykke — «(1.000.000 − 392.300) × 15% = 91.155 kr» — som håndskreven
 * tekst. Tallene var rigtige for 2026 og ville være stående for 2027, hvor
 * bundfradraget stiger, mens brødteksten læste det gamle tal syv steder.
 *
 * Porten dømmer på den **renderede markup**, som `loen-efter-skat`-porten gør:
 * den kræver, at hvert beløb i brødteksten står som det tal modulet regner, så
 * egenskaben «kan ikke glide fra sin egen beregning» overlever en omskrivning
 * af koden. Svensk er ikke med: hele afsnittet ligger bag `locale === "da"`.
 */
describe("/arveafgift — bundfradraget og eksemplerne læses fra modulet", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  const kr = (tal: number) => tal.toLocaleString("da-DK");

  test("satserne er satserne fra SATSER_2026, og 36,25 % er regnet ud af dem", () => {
    // Mutation: en hårdkodet 36,25 i stedet for den afledede sats giver intet
    // at slå fra her — men porten nedenfor kræver markupkens tal.
    expect(BUNDFRADRAG).toBe(SATSER_2026.arveBundfradrag);
    expect(BOAFGIFT_SATS).toBe(SATSER_2026.boafgift);
    expect(TILLAEGSBOAFGIFT_SATS).toBe(SATSER_2026.tillaegsboafgift);
    expect(EFFEKTIV_MARGINAL_SATS).toBeCloseTo(0.3625, 10);
  });

  test("bundfradraget står i markupken syv gange og altid som moduls tal", async () => {
    const html = renderToStaticMarkup(await ArveafgiftPage());

    // De tre tabellerceller plus «Nærmeste familie …» og «Bundfradraget … de
    // første … af arven» = syv forekomster, som brødteksten havde håndskrevet.
    const fund = html.split(kr(BUNDFRADRAG)).length - 1;
    expect(fund, `bundfradraget står ${fund} gange i markupken`).toBe(7);

    // Og intet beløb i markupken må være skrevet med et andet tal end dem modulet
    // regner: bundfradraget syv gange, eksemplets arv og afgift, og de to
    // guidebeløb. Mutation: en hårdkodet «392.500 kr» i en celle gør porten rød.
    // Seks gange «392.300 kr» (tabellens tre celler + tre brødtekststeder); den
    // syvende forekomst står i regnestykket som «392.300)» og tælles ovenfor.
    const forventede = [
      ...Array(6).fill(`${kr(BUNDFRADRAG)} kr`),
      `${kr(EKSEMPEL_BARN.arv)} kr`,
      `${kr(EKSEMPEL_BARN.boafgift)} kr`,
      `${kr(EKSEMPLER_GUIDE.barn.arv)} kr`,
      `${kr(EKSEMPLER_GUIDE.soeskende.arv)} kr`,
    ];
    const iMarkupken = html.match(/\d{1,3}(?:\.\d{3})+ kr/g) ?? [];
    expect(iMarkupken.sort()).toEqual([...forventede].sort());
  });

  test("regnestykket i brødteksten er regnet fra modulets eksempel", async () => {
    const html = renderToStaticMarkup(await ArveafgiftPage());

    // Mutation: et beløb, der ikke er EKSEMPEL_BARN.boafgift, gør porten rød.
    expect(html).toContain(
      `(${kr(EKSEMPEL_BARN.arv)} − ${kr(BUNDFRADRAG)}) × 15% = ${kr(EKSEMPEL_BARN.boafgift)} kr i afgift`,
    );
    expect(EKSEMPEL_BARN.grundlag).toBe(EKSEMPEL_BARN.arv - BUNDFRADRAG);
    expect(EKSEMPEL_BARN.boafgift).toBeCloseTo(91_155, 6);
  });

  test("guideboksen lover præcis de to eksempler, indlægget viser", async () => {
    const html = renderToStaticMarkup(await ArveafgiftPage());
    expect(html).toContain(
      `to fulde regneeksempler på ${kr(EKSEMPLER_GUIDE.barn.arv)} kr til børn og ${kr(
        EKSEMPLER_GUIDE.soeskende.arv,
      )} kr til en søskende`,
    );
  });

  test("den effektive marginale sats er 36,25 %, og det er ikke et tilnærmelse", async () => {
    const html = renderToStaticMarkup(await ArveafgiftPage());
    // Mutation: «nærmer sig» forsvinder, fordi satsen er præcis, ikke grænsende.
    expect(html).toContain("Den <strong>effektive marginale sats</strong> er for store arvebeløb");
    expect(html).not.toContain("nærmer sig");
    // En hårdkodet «36,25» i JSX forbliver grøn — den er rigtig. Det er samme
    //princip som på /procent: porten fanger tal der er **forkerte**, ikke alle
    //tal der er skrevet i hånden.
    expect((EFFEKTIV_MARGINAL_SATS * 100).toLocaleString("da-DK")).toBe("36,25");
  });

  test("FAQ'en på samme side læser bundfradraget fra samme sats", () => {
    // Mutation: en hårdkodet «392.300 kr» i FAQ'en gør porten rød, selv om
    // tabellen er rettet — det var præcis det, der gjorde siden halvt rettet.
    const bundfradragTekst = SATSER_2026.arveBundfradrag.toLocaleString("da-DK");
    const side = getPageData("arveafgift", "da");
    expect(side, "siden har ingen data").toBeDefined();
    const svar = (side as NonNullable<typeof side>).faqItems.map((f) => f.answer);
    // Svar der nævner bundfradraget *og* et beløb. Mutation: et hårdkodet
    // «392.500 kr» i et af dem gør porten rød, selv om tabellen er rettet.
    const medBelob = svar.filter((a) => /bundfradrag/i.test(a) && /\d{1,3}\.\d{3} kr/.test(a));
    expect(medBelob.length, "FAQ'en nævner ikke bundfradraget med et beløb").toBeGreaterThanOrEqual(2);
    for (const svarTekst of medBelob) expect(svarTekst).toContain(bundfradragTekst);
    // Og ingen FAQ må have sit eget beløb ved siden af.
    const belobIAlleSvar = svar.flatMap((a) => a.match(/\d{1,3}\.\d{3} kr/g) ?? []);
    for (const belob of belobIAlleSvar) expect(belob).toBe(`${bundfradragTekst} kr`);
  });
});

describe("beregnArveafgift", () => {
  test("et barn over bundfradraget betaler 15 % af resten", () => {
    const e = beregnArveafgift(1_000_000);
    expect(e.grundlag).toBe(607_700);
    expect(e.boafgift).toBe(91_155);
    expect(e.tillaeg).toBe(0);
    expect(e.iAlt).toBe(91_155);
    expect(e.modtager).toBe(908_845);
  });

  test("en søskende betaler tillægsafgift af arven efter boafgift", () => {
    const e = beregnArveafgift(800_000, true);
    expect(e.grundlag).toBe(407_700);
    expect(e.boafgift).toBeCloseTo(61_155, 6);
    expect(e.tillaeg).toBeCloseTo(184_711.25, 6);
    expect(e.iAlt).toBeCloseTo(245_866.25, 6);
    expect(e.modtager).toBeCloseTo(554_133.75, 6);
  });

  test("et beløb under bundfradraget har ingen boafgift — men søskende har tillægsafgift", () => {
    // Mutation: uden Math.max(0, …) ville en lille arv få negativ grundlag.
    expect(beregnArveafgift(BUNDFRADRAG)).toMatchObject({ grundlag: 0, boafgift: 0, iAlt: 0 });
    // Der er intet bundfradrag for tillægsafgiften, så en søskende betaler 25 %
    // af hele den lille arv — det er ikke en fejl, men nemlig at få dyrligere.
    expect(beregnArveafgift(100_000)).toMatchObject({
      grundlag: 0,
      boafgift: 0,
      tillaeg: 0,
      modtager: 100_000,
    });
    expect(beregnArveafgift(100_000, true)).toMatchObject({
      grundlag: 0,
      boafgift: 0,
      tillaeg: 25_000,
      modtager: 75_000,
    });
  });

  test("bundfradraget går forud for de to guideeksempler, så de er regnet rigtigt", () => {
    expect(EKSEMPLER_GUIDE.barn.arv).toBe(1_500_000);
    expect(EKSEMPLER_GUIDE.soeskende.arv).toBe(800_000);
    expect(EKSEMPLER_GUIDE.barn.boafgift).toBeCloseTo(166_155, 6);
    expect(EKSEMPLER_GUIDE.soeskende.tillaeg).toBeGreaterThan(0);
    expect(EKSEMPLER_GUIDE.barn.tillaeg).toBe(0);
  });
});