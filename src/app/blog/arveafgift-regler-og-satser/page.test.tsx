import { EKSEMPEL_BARN, EKSEMPLER_GUIDE } from "@/lib/arveafgift";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { SATSER_2026 } from "@/lib/satser-2026";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ArveafgiftGuidePage, { generateMetadata } from "./page";

/**
 * Bundfradraget er gjort til en læsbar holder, så den mutation derude kan se
 * om artiklens tal *læses* fra `SATSER_2026` eller er skrevet i brødteksten.
 * En artikel med håndskrevne beløb ville vise de gamle tal, når holderen flyttes
 * til 500.000, og porten bliver rød.
 */
const sats = vi.hoisted(() => ({ arveBundfradrag: 392_300 }));

vi.mock("@/lib/satser-2026", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/satser-2026")>();
  return {
    ...original,
    SATSER_2026: {
      ...original.SATSER_2026,
      get arveBundfradrag() {
        return sats.arveBundfradrag;
      },
    },
  };
});

vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null, ArticleSchema: () => null }));
vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

const html = () => renderToStaticMarkup(ArveafgiftGuidePage());

describe("arveafgift-regler-og-satser artiklen", () => {
  beforeEach(() => {
    vi.mocked(getLocale).mockResolvedValue("da");
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(getDomainConfigByLocale("da"));
  });

  test("titlen og H1 er svar-først med et konkret 2026-tal", async () => {
    const meta = await generateMetadata();

    expect((meta.title as { absolute: string }).absolute).toBe(
      "Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr."
    );
    expect(html()).toContain("Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.");
  });

  test("metadata er byte-uændret, selv om tallene nu læses fra modulet", async () => {
    // Bygningen af beskrivelserne erstattede fire håndskrevne strenge. Google har
    // dem i sit index, så de skal være præcis de samme tegn — kun med et andet
    // ejerskab. Porten dømmer længden også, fordi Google afbryder omkring 160.
    const meta = await generateMetadata();
    const beskrivelse = "Arveafgift (boafgift) 2026: Et barn arver 1 mio. kr. og betaler 91.155 kr. Se bundfradrag på 392.300 kr, 15 % for nære arvinger og 36,25 % for søskende.";

    expect(meta.description).toBe(beskrivelse);
    expect((meta.description ?? "").length).toBeLessThanOrEqual(160);
    expect(meta.openGraph?.title).toBe(
      "Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.",
    );
    expect(meta.openGraph?.description).toBe(
      "Arveafgift 2026: 91.155 kr for et barn der arver 1 mio. kr. Bundfradrag, satser og to regneeksempler.",
    );
// `TITEL` og `BESKRIVELSE` er **én** konstant hver, brugt i `generateMetadata`,
  // i `openGraph` og som attributter på `BlogArticleSchema` — så JSON-LD og
  // `<head>` kan ikke glide fra hinanden. Denne port låser den færdige tekst.
  expect(html()).toContain("Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.");
  });

  test("bundfradrag og satser læses fra den centrale konfiguration", () => {
    const markup = html();
    const bundfradrag = new Intl.NumberFormat("da-DK").format(
      SATSER_2026.arveBundfradrag,
    );

    expect(markup).toContain(bundfradrag);
    expect(bundfradrag).toBe("392.300");
    expect(markup).toContain("91.155 kr");
  });

  test("søskende-eksemplet følger beregnerens tillægsafgift på resten", () => {
    const markup = html();
    const grundlag = 800000 - SATSER_2026.arveBundfradrag;
    const boafgift = grundlag * SATSER_2026.boafgift;
    const tillaeg = (800000 - boafgift) * SATSER_2026.tillaegsboafgift;
    const samlet = boafgift + tillaeg;
    const format = (v: number) => new Intl.NumberFormat("da-DK").format(Math.round(v));

    expect(format(grundlag)).toBe("407.700");
    expect(format(boafgift)).toBe("61.155");
    expect(format(tillaeg)).toBe("184.711");
    expect(format(samlet)).toBe("245.866");
    expect(format(800000 - samlet)).toBe("554.134");
    expect(markup).toContain("184.711 kr");
    expect(markup).toContain("245.866 kr");
    expect(markup).toContain("554.134 kr");
  });

  test("barn-eksemplet og FAQ'en læses fra EKSEMPLER_GUIDE og EKSEMPEL_BARN", () => {
    const markup = html();
    const barn = EKSEMPLER_GUIDE.barn;
    const faq = EKSEMPEL_BARN;

    // Regnestykket til børn: grundlag, boafgift og det der er til deling.
    expect(barn.grundlag).toBe(1_107_700);
    expect(barn.boafgift).toBe(166_155);
    expect(barn.modtager).toBe(1_333_845);
    expect(markup).toContain("1.107.700 kr");
    expect(markup).toContain("166.155 kr");
    expect(markup).toContain("1.333.845 kr");
    // Halvdelen runder op, så de to børn tilsammen ikke får et halt krone mindre.
    expect(markup).toContain("ca. 666.923 kr hver");

    // FAQ'en om et barn, der arver 1.000.000 kr, bruger samme afledede felter.
    expect(faq.grundlag).toBe(607_700);
    expect(faq.boafgift).toBe(91_155);
    expect(faq.modtager).toBe(908_845);
    expect(markup).toContain("afgiftsgrundlaget er 607.700 kr");
    expect(markup).toContain("modtager 908.845 kr");
  });

  test("alle procenter staves med dansk decimalkomma", () => {
    // Sats-tabellen skrev `36.25%` — et punktum i en dansk brødtekst, mens
    // metadata og resten af artiklen skrev «36,25 %». Samme tal, to sprog.
    const markup = html();

    expect(markup).not.toContain("36.25");
    expect(markup).toContain("36,25");
  });

  test("beløbene følger bundfradraget i SATSER_2026", async () => {
    // Mutation: står et beløb håndskrevet i brødteksten eller i metadata, er det
    // uændret, når bundfradraget flyttes, og denne port bliver rød.
    sats.arveBundfradrag = 500_000;
    vi.resetModules();
    try {
      const side = await import("./page");
      const markup = renderToStaticMarkup(side.default());
      const meta = await side.generateMetadata();
      const titel = (meta.title as { absolute: string }).absolute;

      // 1.000.000 − 500.000 = 500.000, og 15 % af det er 75.000.
      expect(titel).toBe("Arveafgift 2026: 1 mio. kr. til børn koster 75.000 kr.");
      expect(meta.description).toContain("bundfradrag på 500.000 kr");
      expect(markup).toContain("Bundfradrag: −500.000 kr");
      expect(markup).toContain("afgiftsgrundlaget er 500.000 kr");
      // Søskende-eksemplet: 800.000 − 500.000 = 300.000 grundlag, 45.000 boafgift.
      expect(markup).toContain("Afgiftspliktigt beløb: 300.000 kr");
      expect(markup).toContain("Boafgift (15%): 45.000 kr");
      expect(markup).not.toContain("392.300");
      expect(markup).not.toContain("407.700");
    } finally {
      sats.arveBundfradrag = 392_300;
      vi.resetModules();
    }
  });

  test("de tre dokumenterede fejl er væk", () => {
    const markup = html();

    // 1) eksemplet tog 25 % af afgiftsgrundlaget i stedet for resten efter boafgift
    expect(markup).not.toContain("86.636");
    expect(markup).not.toContain("147.791");
    expect(markup).not.toContain("652.209");
    // 2) tabellen sagde "15 % + 25 %" uden at gøre grundlaget for tillægsafgiften klart
    expect(markup).toContain("% af beløbet efter boafgift");
    // 3) gaver over grænsen blev deklareret som "15 % gaveafgift" uden kilde
    expect(markup).not.toContain("15% gaveafgift");
  });

  test("artiklen linker til beregneren tidligt, og siden linker tilbage", () => {
    const markup = html();
    const firstCta = markup.indexOf('href="/arveafgift"');
    const thirdSection = markup.indexOf("Sådan beregnes arveafgiften");

    expect(firstCta).toBeGreaterThan(-1);
    expect(firstCta).toBeLessThan(thirdSection);
  });
});
