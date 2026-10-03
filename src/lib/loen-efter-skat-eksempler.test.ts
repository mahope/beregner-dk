import { describe, expect, test } from "vitest";
import { getPageData } from "@/lib/page-data";
import { formatBelob } from "@/lib/format";
import { KOMMUNER } from "@/lib/kommuner";
import { SATSER_2026 } from "@/lib/satser-2026";
import {
  KOMMUNESKAT_HOEJESTE,
  KOMMUNESKAT_LAVESTE,
  loenBelob,
  loenBelobI,
  loenEfterSkatFaqItems,
  loenEfterSkatOgBeskrivelse,
} from "@/lib/loen-efter-skat-eksempler";

/**
 * Påstande i tekst er kode (punkt 11). `/loen-efter-skat` skrev personfradraget,
 * AM-bidraget, mellemskattens og topskattens sats og de tre grænser i hånden —
 * i `description`, `metaDescription`, `ogDescription` og i fire af otte
 * FAQ-svar — mens `BruttoNettoBeregner` læser `SATSER_2026`. Søgeresultatet og
 * værktøjet var altså to uafhængige tal, og ingen af husets porte kunne se det:
 * en streng med et tal er gyldig JSX, så hverken `tsc`, lint eller build siger
 * noget. De to metadatafelter modsagde oven i hinanden desuden om AM-bidrag —
 * `description` skrev «8%» og `metaDescription» «8 %».
 *
 * Porten dømmer *hvert* beløb og hver procent i metadata og svar mod de tal
 * modulet må skrive, så et håndskrevet beløb gør den rød. Den låser ikke en
 * tilladelsesliste over fejl, men de tal, `SATSER_2026` faktisk må producere —
 * ændrer en sats, følger teksten med, og kommer der et tal ind uden omkring
 * modulet, bliver porten rød.
 */

/**
 * Alle beløb, porten accepterer — de kommer alle fra `SATSER_2026`.
 *
 * `49.700` er den **ene** håndskrevne undtagelse: det er sidens påstand om
 * 2025-personfradraget, som står i samme sætning som 2026-tallet. Modulet
 * regner ikke med fortiden, så tallet kan ikke afledes, og det er heller ikke
 * slået op (punkt 11) — det er bevaret uændret og dømmes derfor af sit eget
 * `toBe` nedenfor, så det ikke kan glide væk fra den sætning, det hører til.
 */
const TILLADTE_BELOB = new Set(
  [
    SATSER_2026.personfradrag,
    SATSER_2026.mellemskatGraense,
    SATSER_2026.topskatGraense,
    SATSER_2026.topTopskatGraense,
    49700,
  ].map((belob) => formatBelob(belob, "da"))
);

/**
 * Alle procenttal, porten accepterer — uden mellemrum, så «8 %» og «8%» er ét.
 * Kommuneskattens tre tal kommer fra `KOMMUNER` og svmn.dk-gennemsnittet, som
 * `KOMMUNESKAT_SNIT_PCT` læser, så de afledes her på samme måde.
 */
const TILLADTE_PROCENTER = new Set(
  [
    SATSER_2026.amBidrag,
    SATSER_2026.mellemskat,
    SATSER_2026.topskat,
    SATSER_2026.topTopskat,
    0.15,
  ].map((sats) => `${formatBelob(sats * 100, "da", 2).replace(/\s/g, "")}%`)
);
// `KOMMUNER` opgiver procenttal (22,5), `SATSER_2026` opgiver brøkdele (0,075).
for (const sats of [
  ...KOMMUNER.map((k) => k.kommuneskat),
  SATSER_2026.kommuneskatSnit * 100,
]) {
  TILLADTE_PROCENTER.add(`${formatBelob(sats, "da", 3).replace(/\s/g, "")}%`);
}

/** Et beløb med tusindtalsseparator, som sidens egen notationsform bruger. */
const BELOB = /\d{1,3}(?:\.\d{3})+/g;
/** Et procenttal, med eller uden mellemrum før tegnet. */
const PROCENT = /\d+(?:,\d+)?\s?%/g;

function alleTekster(): { hvor: string; tekst: string }[] {
  const side = getPageData("loen-efter-skat", "da");
  if (!side) throw new Error("/loen-efter-skat mangler i da");
  const ut: { hvor: string; tekst: string }[] = [
    { hvor: "description", tekst: side.description ?? "" },
    { hvor: "metaDescription", tekst: side.metaDescription ?? "" },
    { hvor: "ogDescription", tekst: side.ogDescription ?? "" },
    { hvor: "schemaDescription", tekst: side.schemaDescription ?? "" },
  ];
  for (const [i, faq] of (side.faqItems ?? []).entries()) {
    ut.push({ hvor: `faqItems[${i}] "${faq.question}"`, tekst: faq.answer });
  }
  return ut;
}

describe("/loen-efter-skat — tal fra SATSER_2026", () => {
  test("hvert beløb i metadata og svar kommer fra modulet", () => {
    const fund: string[] = [];
    for (const { hvor, tekst } of alleTekster()) {
      for (const match of tekst.match(BELOB) ?? []) {
        if (!TILLADTE_BELOB.has(match)) fund.push(`${hvor}: «${match}»`);
      }
    }
    expect(fund).toEqual([]);
  });

  test("hver procent i metadata og svar kommer fra modulet", () => {
    const fund: string[] = [];
    for (const { hvor, tekst } of alleTekster()) {
      for (const match of tekst.match(PROCENT) ?? []) {
        const normaliseret = match.replace(/\s/g, "");
        if (!TILLADTE_PROCENTER.has(normaliseret)) fund.push(`${hvor}: «${match}»`);
      }
    }
    expect(fund).toEqual([]);
  });

  test("kommuneskattens yderste sats er afledt af KOMMUNER, ikke håndskrevet", () => {
    const laveste = Math.min(...KOMMUNER.map((k) => k.kommuneskat));
    const hoejeste = Math.max(...KOMMUNER.map((k) => k.kommuneskat));
    expect(KOMMUNESKAT_LAVESTE).toBe(
      `ca. ${formatBelob(laveste, "da", 1)} % (${
        KOMMUNER.find((k) => k.kommuneskat === laveste)!.navn
      })`
    );
    expect(KOMMUNESKAT_HOEJESTE).toBe(
      `${formatBelob(hoejeste, "da", 1)} % (${
        KOMMUNER.find((k) => k.kommuneskat === hoejeste)!.navn
      })`
    );
  });
});

describe("/loen-efter-skat — beløbsform", () => {
  test("kr-formen har ét punktum og ingen dobbelt enhed", () => {
    expect(loenBelob(54100)).toBe("54.100 kr.");
    expect(loenBelobI(54100)).toBe("54.100 kr");
    const fund: string[] = [];
    for (const { hvor, tekst } of alleTekster()) {
      // «kr)» er ikke en fejl — «(op fra 49.700 kr).» er korrekt dansk.
      for (const brokket of ["kr. kr.", "kr..", "kr.,"]) {
        if (tekst.includes(brokket)) fund.push(`${hvor}: «${brokket}»`);
      }
    }
    expect(fund).toEqual([]);
  });

  test("mellemskat og topskat er 7,5 %, ikke den afrundede 8 %", () => {
    // `formatBelob`'s standard er nul decimaler, så 0.075 × 100 blev «8 %».
    const svar = loenEfterSkatFaqItems("25,049");
    const mellemskat = svar.find((f) => f.question.startsWith("Hvornår skal jeg"));
    expect(mellemskat?.answer).toContain("Mellemskat på 7,5 %");
    expect(mellemskat?.answer).toContain("topskat på 7,5 % over 777.900 kr");
    expect(mellemskat?.answer).not.toContain("7,5%");
  });
});

describe("/loen-efter-skat — dansk tekst", () => {
  test("de fire sætninger med tal er uændret bortset fra mellemrummet før %", () => {
    const side = getPageData("loen-efter-skat", "da");
    const svar = new Map(
      loenEfterSkatFaqItems("25,049").map((f) => [f.question, f.answer])
    );

    // Fra den gamle kode, med % nu skrevet med mellemrum.
    expect(side?.description).toBe(
      "Beregn din nettoløn 2026. Nyt skattesystem med mellemskat og topskat. " +
        "Personfradrag 54.100 kr. Se hvad du får udbetalt efter skat, AM-bidrag (8 %) " +
        "og pension. Gratis lønberegner."
    );
    expect(side?.metaDescription).toBe(
      "Beregn din nettoløn 2026 med mellemskat og topskat. Personfradrag 54.100 kr. " +
        "Se hvad du får udbetalt efter skat, AM-bidrag (8 %) og pension."
    );
    expect(svar.get("Hvad er AM-bidrag?")).toBe(
      "AM-bidrag (arbejdsmarkedsbidrag) er 8 % af din bruttoløn før andre fradrag. " +
        "Bidraget går til at finansiere dagpenge, efterløn og andre " +
        "arbejdsmarkedsordninger. AM-bidrag trækkes før skat beregnes."
    );
    expect(svar.get("Hvad er personfradraget i 2026?")).toBe(
      "Personfradraget i 2026 er 54.100 kr (op fra 49.700 kr). Det betyder, at " +
        "du ikke betaler skat af de første 54.100 kr af din årlige indkomst (efter " +
        "AM-bidrag). Alle skatteydere får automatisk dette fradrag."
    );
    expect(svar.get("Hvordan beregnes min løn efter skat?")).toBe(
      "Din nettoløn beregnes ved først at trække AM-bidrag (8 %) fra bruttolønnen. " +
        "Derefter trækkes bundskat, kommuneskat og eventuel kirkeskat fra den " +
        "skattepligtige indkomst efter fradrag. Tjener du over topskattegrænsen, " +
        "betales der i 2026 mellemskat 7,5 % og topskat 7,5 % — den gamle topskat " +
        "på 15 % er afskaffet."
    );
    // Kommuneskats-sætningen bygges af de to **aflede** yderste satser plus
    // svmn.dk-gennemsnittet, som kaldende side skriver ind. Den dømmes derfor på
    // de tre tal hver for sig frem for på hele sætningen — de to yderste er
    // låst mod `KOMMUNER` i prøven ovenfor, så intet kan komme ind udenom.
    const kommuneskat = svar.get("Hvorfor varierer kommuneskatten?") ?? "";
    expect(kommuneskat).toContain(`varierer kommuneskatten fra ${KOMMUNESKAT_LAVESTE}`);
    expect(kommuneskat).toContain(`til ${KOMMUNESKAT_HOEJESTE}`);
    expect(kommuneskat).toContain(
      "Beregnerens forudindstillede sats er et andet gennemsnit end tabellens"
    );
  });

  test("alle otte svar er stadig på plads, og Open Graph-beskrivelsen får tallene", () => {
    const side = getPageData("loen-efter-skat", "da");
    expect(side?.faqItems).toHaveLength(8);
    expect(loenEfterSkatOgBeskrivelse()).toContain("personfradrag 54.100 kr.");
    expect(loenEfterSkatOgBeskrivelse()).toContain("topskat fra 777.900 kr.");
    // `ogDescription` læser samme modul som `description` — de modsiger
    // altså ikke hinanden mere.
    expect(side?.ogDescription).toBe(loenEfterSkatOgBeskrivelse());
  });
});
