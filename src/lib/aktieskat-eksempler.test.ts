import { describe, expect, test } from "vitest";
import { getPageData } from "@/lib/page-data";
import { formatBelob } from "@/lib/format";
import { SATSER_2026 } from "@/lib/satser-2026";
import {
  AKTIE_GRAENSE,
  AKTIE_GRAENSE_AEGTEPAR,
  AKTIE_SATS_HOEJ,
  AKTIE_SATS_KOMPAKT,
  AKTIE_SATS_LAV,
  ASK_LOFT,
  ASK_SATS,
  aktieskatBeskrivelse,
  aktieskatFaqItems,
} from "@/lib/aktieskat-eksempler";

/**
 * Påstande i tekst er kode (punkt 11). `/aktieskat` skrev progressionsgrænsen,
 * de to satser, ASK-satsen og ASK-loftet i hånden — i `description`,
 * `metaDescription`, `ogDescription`, `schemaDescription`, i fire af seks
 * FAQ-svar **og** i fem beløb i sidens egen brødtekst — mens
 * `AktieskatBeregner` læste `SATSER_2026`. Søgeresultatet og værktøjet var altså
 * to uafhængige tal, og ingen af husets porte kunne se det: en streng med et tal
 * er gyldig JSX, så hverken `tsc`, lint eller build siger noget.
 *
 * Porten her dømmer *hvert* tal i metadata og svar mod de tal modulet må skrive,
 * så et håndskrevet beløb gør den rød. Den låser ikke en tilladelsesliste over
 * fejl, men de tal, `SATSER_2026` faktisk må producere — ændrer en sats, følger
 * teksten med, og kommer der et tal ind uden omkring modulet, bliver porten rød.
 */

/** Alle beløb, porten accepterer — de kommer alle fra `SATSER_2026`. */
const TILLADTE_BELOB = new Set([
  formatBelob(SATSER_2026.aktieProgressionsgraense, "da"),
  formatBelob(SATSER_2026.aktieProgressionsgraense * 2, "da"),
  formatBelob(SATSER_2026.askLoft, "da"),
]);

/** Alle procenttal, porten accepterer — uden mellemrum, så «27 %» og «27%» er ét. */
const TILLADTE_PROCENTER = new Set(
  [
    formatBelob(SATSER_2026.aktieSatsLav * 100, "da"),
    formatBelob(SATSER_2026.aktieSatsHoej * 100, "da"),
    formatBelob(SATSER_2026.askSats * 100, "da"),
  ].map((p) => `${p.replace(/\s/g, "")}%`),
);

/** Et beløb med tusindtalsseparator, som sidens egen notationsform bruger. */
const BELOB = /\d{1,3}(?:\.\d{3})+/g;
/** Et procenttal, med eller uden mellemrum før tegnet. */
const PROCENT = /\d+(?:,\d+)?\s?%/g;

function alleTekster(): { hvor: string; tekst: string }[] {
  const side = getPageData("aktieskat", "da");
  if (!side) throw new Error("/aktieskat mangler i da");
  const ut: { hvor: string; tekst: string }[] = [
    { hvor: "description", tekst: side.description ?? "" },
    { hvor: "metaDescription", tekst: side.metaDescription ?? "" },
    { hvor: "ogDescription", tekst: side.ogDescription ?? "" },
    { hvor: "schemaDescription", tekst: side.schemaDescription ?? "" },
  ];
  for (const svar of side.faqItems ?? []) {
    ut.push({ hvor: `FAQ: ${svar.question}`, tekst: svar.answer });
  }
  return ut;
}

describe("aktieskat-eksempler — port over alt tekstbeløb", () => {
  test("hvert beløb i metadata og FAQ kommer fra SATSER_2026", () => {
    const fund: string[] = [];
    for (const { hvor, tekst } of alleTekster()) {
      for (const belob of tekst.match(BELOB) ?? []) {
        if (!TILLADTE_BELOB.has(belob)) fund.push(`${hvor}: «${belob}»`);
      }
    }
    expect(fund).toEqual([]);
  });

  test("hvert procenttal i metadata og FAQ kommer fra SATSER_2026", () => {
    const fund: string[] = [];
    for (const { hvor, tekst } of alleTekster()) {
      for (const procent of tekst.match(PROCENT) ?? []) {
        const normaliseret = procent.replace(/\s/g, "");
        if (![...TILLADTE_PROCENTER].some((p) => p === normaliseret)) {
          fund.push(`${hvor}: «${procent}»`);
        }
      }
    }
    expect(fund).toEqual([]);
  });

  test("svarene publiceres som FAQPage-JSON-LD uden håndskrevne tal", () => {
    const side = getPageData("aktieskat", "da");
    // `FAQSchema` læser præcis `faqItems` — det er derfor et fejltal i et
    // svar ender i Googles snippet, ikke bare på siden.
    expect(side?.faqItems).toEqual(aktieskatFaqItems());
    expect(side?.faqItems?.length).toBe(6);
  });

  test("dobbeltgrænsen for ægtepar er netop det dobbelte", () => {
    expect(AKTIE_GRAENSE_AEGTEPAR).toBe(SATSER_2026.aktieProgressionsgraense * 2);
    expect(AKTIE_GRAENSE_AEGTEPAR).toBe(158800);
  });

  test("modulet læser de samme satser som beregneren", () => {
    expect(AKTIE_GRAENSE).toBe(SATSER_2026.aktieProgressionsgraense);
    expect(ASK_LOFT).toBe(SATSER_2026.askLoft);
    expect(AKTIE_SATS_LAV).toBe("27 %");
    expect(AKTIE_SATS_HOEJ).toBe("42 %");
    expect(ASK_SATS).toBe("17 %");
    expect(AKTIE_SATS_KOMPAKT).toBe("27 %");
  });
});

describe("aktieskat-eksempler — dansk tekst låst", () => {
  test("beskrivelsen er uændret bortset fra mellemrummet før procenttegnet", () => {
    expect(aktieskatBeskrivelse()).toBe(
      "Beregn aktieskat 2026: 27 % under 79.400 kr., 42 % over. Sammenlign " +
        "frit depot vs. aktiesparekonto (ASK, 17 %). Se din skat og besparelse gratis.",
    );
  });

  test("de to svar med tal gengiver den danske ordlyd", () => {
    const svar = aktieskatFaqItems();
    expect(svar[0].answer).toBe(
      "I 2026 beskattes aktieindkomst i frit depot med 27 % af de første " +
        "79.400 kr. (158.800 kr. for ægtepar) og 42 % af beløb derover. I en " +
        "aktiesparekonto (ASK) er satsen kun 17 %.",
    );
    expect(svar[2].answer).toBe(
      "Progressionsgrænsen er 79.400 kr. i 2026. Aktieindkomst under denne " +
        "grænse beskattes med 27 %, og beløb over grænsen beskattes med 42 %. " +
        "For ægtepar er grænsen 158.800 kr. samlet.",
    );
  });
});