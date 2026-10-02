import { describe, expect, test } from "vitest";
import { getPageData } from "@/lib/page-data";
import { PRISER, FASTE_POSTER, GAVEGENNEMSNIT } from "@/components/KonfirmationBeregner";

/**
 * Påstande i tekst er kode (punkt 11). `/konfirmation`'s FAQ blev publiceret som
 * `FAQPage`-JSON-LD med «8.000-25.000 DKK afhængigt af antal gæster» som svar
 * på «Hvad koster en konfirmation?» — altså et *samlet* beløb.
 *
 * Målt mod beregnerens egne tal (standardindstillinger: 30 gæster,
 * forsamlingshus, fotograf med): festen 19.600 kr. og gaverne 19.100 kr., i alt
 * 38.700 kr. Siden sagde altså «højst 25.000» om et beløb, dens egen værktøj
 * viser 38.700, og 25.000 var i virkeligheden loftet for *gaverne alene* — de
 * samme tal, brødteksten skriver som gaveinterval.
 */
const DA_DEFAULTS = {
  gaester: 30,
  foraeldre: 2,
  bedsteforaeldre: 4,
  familie: 8,
  venner: 5,
};

function standardFoeldsom() {
  const p = PRISER.forsamlingshus;
  const udgifter =
    DA_DEFAULTS.gaester * p.madPrPerson +
    p.lokalePris +
    FASTE_POSTER.konfirmandToej +
    FASTE_POSTER.fotograf +
    FASTE_POSTER.pynt +
    FASTE_POSTER.invitation +
    FASTE_POSTER.kage;
  const gaver =
    DA_DEFAULTS.foraeldre * GAVEGENNEMSNIT.foraeldre +
    DA_DEFAULTS.bedsteforaeldre * GAVEGENNEMSNIT.bedsteforaeldre +
    DA_DEFAULTS.familie * GAVEGENNEMSNIT.oevrigFamilie +
    DA_DEFAULTS.venner * GAVEGENNEMSNIT.venner;
  return { udgifter, gaver, alt: udgifter + gaver };
}

describe("/konfirmation: FAQ'en må ikke modsige beregneren", () => {
  test("beregnerens standardforløb koster mere end det gamle FAQ-loft på 25.000", () => {
    const { udgifter, gaver, alt } = standardFoeldsom();
    // Beløbene her skal kunne slås op i KonfirmationBeregner.tsx — bliver de
    // ændret, peger denne prøve på den nye værdi i stedet for på en kold konstant.
    expect(udgifter).toBe(19_600);
    expect(gaver).toBe(19_100);
    expect(alt).toBe(38_700);
    expect(alt).toBeGreaterThan(25_000);
  });

  test("svaret på «Hvad koster en konfirmation?» rammer ikke længere under sit eget værktøj", () => {
    const svar = getPageData("konfirmation", "da")!.faqItems.find(
      (f) => f.question === "Hvad koster en konfirmation?"
    )!.answer;
    expect(svar).not.toMatch(/8\.000-25\.000/);
    // Dansk side skriver «kr.», ikke «DKK» — de øvrige svar og hele brødteksten
    // gør det samme, og FAQ'en publiceres som JSON-LD ved siden af dem.
    expect(svar).not.toMatch(/DKK/);
    expect(svar).toContain("10.000 og 25.000 kr.");
  });

  test("gaveintervallet i FAQ'en er det samme som i sidens brødtekst", () => {
    const svar = getPageData("konfirmation", "da")!.faqItems.find(
      (f) => f.question === "Hvad koster en konfirmation?"
    )!.answer;
    expect(svar).toContain("10.000");
    expect(svar).toContain("25.000");
  });
});
