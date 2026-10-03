import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { getPageData } from "@/lib/page-data";
import { formatBelob } from "@/lib/format";
import { SATSER_2026 } from "@/lib/satser-2026";
import {
  AM_BIDRAG,
  MELLEMSKAT,
  MELLEMSKAT_GRAENSE,
  SKATTELOFT,
  SKATTELOFT_PCT,
  TOPSKAT,
  TOPSKAT_GRAENSE,
  TOPTOPSKAT,
  TOPTOPSKAT_GRAENSE,
  bruttoGraense,
  topskatBelob,
  topskatBelobI,
  topskatBeskrivelse,
  topskatFaqItems,
} from "@/lib/topskat-eksempler";

/**
 * Påstande i tekst er kode (punkt 11). `/topskat` skrev de tre grænser, de tre
 * satser og de fire bruttoindkomster i hånden — i `description`,
 * `metaDescription` og i to af sine fem FAQ-svar — mens `TopskatBeregner`
 * læser `SATSER_2026`. Søgeresultatet og værktøjet var altså to uafhængige tal,
 * og ingen af husets porte kunne se det: en streng med et tal er gyldig JSX, så
 * hverken `tsc`, lint eller build siger noget. De to metadatafelter lå oven i
 * hinanden og skrev begge «641.200 kr.,».
 *
 * Porten dømmer *hvert* beløb og hver procent i metadata og svar mod de tal
 * modulet må skrive, så et håndskrevet beløb gør den rød. Den låser ikke en
 * tilladelsesliste over fejl, men de tal `SATSER_2026` faktisk må producere —
 * ændrer en sats, følger teksten med, og kommer der et tal ind udenom modulet,
 * bliver porten rød.
 */

/** Beløb, porten accepterer: de tre grænser og de fire bruttoindkomster. */
const TILLADTE_BELOB = new Set(
  [
    MELLEMSKAT_GRAENSE,
    TOPSKAT_GRAENSE,
    TOPTOPSKAT_GRAENSE,
    bruttoGraense(MELLEMSKAT_GRAENSE),
    bruttoGraense(MELLEMSKAT_GRAENSE, 12),
    bruttoGraense(TOPSKAT_GRAENSE),
    bruttoGraense(TOPSKAT_GRAENSE, 12),
  ].map((belob) => formatBelob(belob, "da"))
);

/**
 * Procenter, porten accepterer — uden mellemrum, så «7,5 %» og «7,5%» er ét.
 *
 * `SKATTELOFT` er **ikke** en sats fra `SATSER_2026`, men sidens egen påstand om
 * skatteloftet (se modulens docblock), så den tages med her fordi den står i to
 * sætninger — brødteksten og FAQ-svaret — der begge skal kunne dømmes.
 */
const TILLADTE_PROCENTER = new Set(
  [
    SATSER_2026.amBidrag,
    SATSER_2026.mellemskat,
    SATSER_2026.topskat,
    SATSER_2026.topTopskat,
    SKATTELOFT,
  ].map((sats) => `${formatBelob(sats * 100, "da", 2).replace(/\s/g, "")}%`)
);

const ROT = join(__dirname, "..", "..");
const las = (sti: string) => readFileSync(join(ROT, sti), "utf8");

/** Et beløb med tusindtalsseparator, som sidens egen notationsform bruger. */
const BELOB = /\d{1,3}(?:\.\d{3})+/g;
/** Et procenttal, med eller uden mellemrum før tegnet. */
const PROCENT = /\d+(?:,\d+)?\s?%/g;

function alleTekster(): { hvor: string; tekst: string }[] {
  const side = getPageData("topskat", "da");
  if (!side) throw new Error("/topskat mangler i da");
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

describe("/topskat — tal fra SATSER_2026", () => {
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
        if (!TILLADTE_PROCENTER.has(match.replace(/\s/g, ""))) {
          fund.push(`${hvor}: «${match}»`);
        }
      }
    }
    expect(fund).toEqual([]);
  });

  test("grænserne og satserne er SATSER_2026s egne tal", () => {
    expect(MELLEMSKAT_GRAENSE).toBe(SATSER_2026.mellemskatGraense);
    expect(TOPSKAT_GRAENSE).toBe(SATSER_2026.topskatGraense);
    expect(TOPTOPSKAT_GRAENSE).toBe(SATSER_2026.topTopskatGraense);
    expect(MELLEMSKAT).toBe("7,5 %");
    expect(TOPSKAT).toBe("7,5 %");
    expect(TOPTOPSKAT).toBe("5 %");
    expect(AM_BIDRAG).toBe("8 %");
    // Mutation: `formatBelob`s standard er nul decimaler, så 0,075 blev skrevet
    // «8 %» — samme tal som AM-bidraget.
    expect(MELLEMSKAT).not.toBe(AM_BIDRAG);
  });

  test("mellemskat og topskat er 7,5 % med mellemrum, ikke «7,5%»", () => {
    const svar = topskatFaqItems();
    const forste = svar.find((f) => f.question.startsWith("Hvornår betaler"));
    expect(forste?.answer).toContain("mellemskat (7,5 %)");
    expect(forste?.answer).toContain("(yderligere 7,5 %)");
    expect(forste?.answer).not.toContain("7,5%");
    const topTopskat = svar.find((f) => f.question.startsWith("Hvad er den nye"));
    expect(topTopskat?.answer).toContain("top-topskat på 5 %");
    expect(topTopskat?.answer).not.toContain("5%");
  });
});

describe("/topskat — bruttoindkomsten fra grænsen efter AM-bidrag", () => {
  test("år og måned er beregnerens egen betingelse, rundet op til hundrede", () => {
    // MÅLT: 641.200 / 0,92 = 696.956,5 → 697.000, og / 12 = 58.079,7 → 58.100.
    // 777.900 / 0,92 = 845.543,5 → 845.500, og / 12 = 70.461,9 → 70.500.
    expect(bruttoGraense(MELLEMSKAT_GRAENSE)).toBe(697000);
    expect(bruttoGraense(MELLEMSKAT_GRAENSE, 12)).toBe(58100);
    expect(bruttoGraense(TOPSKAT_GRAENSE)).toBe(845500);
    expect(bruttoGraense(TOPSKAT_GRAENSE, 12)).toBe(70500);
  });

  test("FAQ-svaret og brødteksten siger det samme tal for månedsbeløbet", () => {
    // Mutation: den gamle kode skrev «58.000 kr./md» i FAQ-svaret, mens
    // brødteksten skrev «ca. 58.100 kr./md» for præcis samme beløb — to tal for
    // det samme på den samme side.
    const forste = topskatFaqItems().find((f) =>
      f.question.startsWith("Hvornår betaler")
    );
    expect(forste?.answer).toContain("ca. 697.000 kr./år (ca. 58.100 kr./md)");
    expect(forste?.answer).toContain("845.500 kr./år (ca. 70.500 kr./md)");
    expect(forste?.answer).not.toContain("58.000");
    expect(forste?.answer).not.toContain("(58.000");
  });

  test("begge grænser nås før AM-bidrag trækkes, så tallet er et loftsbrud", () => {
    // Mutation: glemmer man `(1 - amBidrag)`, bliver bruttoindkomsten lig med
    // grænsen efter AM-bidrag — altså lavere end den indkomst, der faktisk
    // udløser skatten.
    for (const graense of [MELLEMSKAT_GRAENSE, TOPSKAT_GRAENSE]) {
      const utenAfRunding = graense / (1 - SATSER_2026.amBidrag);
      expect(bruttoGraense(graense)).toBeGreaterThan(graense);
      // Runden er til nærmeste hundrede og intet mere, så tallet stadig er
      // **én** sum mindre end grænsen efter AM-bidrag.
      expect(Math.abs(bruttoGraense(graense) - utenAfRunding)).toBeLessThanOrEqual(50);
      expect(bruttoGraense(graense, 12) * 12).toBeGreaterThan(utenAfRunding);
    }
  });
});

describe("/topskat — beløbsform", () => {
  test("kr-formen har ét punktum og ingen dobbelt enhed", () => {
    expect(topskatBelob(641200)).toBe("641.200 kr.");
    expect(topskatBelobI(641200)).toBe("641.200 kr");
    const fund: string[] = [];
    for (const { hvor, tekst } of alleTekster()) {
      for (const brokket of ["kr. kr.", "kr..", "kr.,"]) {
        if (tekst.includes(brokket)) fund.push(`${hvor}: «${brokket}»`);
      }
    }
    expect(fund).toEqual([]);
  });

  test("begge metadatafelter får præcis samme beskrivelse", () => {
    const side = getPageData("topskat", "da");
    // Mutation: hvis kun det ene felt læser modulet, kan søgeresultatet igen
    // få to forskellige tal — de var ens i dag, men håndskrevet begge steder.
    expect(side?.description).toBe(topskatBeskrivelse());
    expect(side?.metaDescription).toBe(topskatBeskrivelse());
    expect(topskatBeskrivelse()).toContain("mellemskat fra 641.200 kr,");
    expect(topskatBeskrivelse()).toContain("topskat fra 777.900 kr.");
  });

  test("skatteloftet står ét sted, og værktøjet læser samme tal", () => {
    expect(SKATTELOFT).toBe(0.5207);
    expect(SKATTELOFT_PCT).toBe("ca. 52,07 %");
    const svar = topskatFaqItems().find((f) =>
      f.question.startsWith("Hvad er skatteloftet")
    );
    expect(svar?.answer).toContain(`overstiger ${SKATTELOFT_PCT}`);
    expect(svar?.answer).toContain(`Med AM-bidrag (${AM_BIDRAG})`);
    // Kilden læses, fordi komponenten skrev «52,07» i to steder — i kappens
    // formel og i sin brødtekst — uafhængigt af FAQ-svaret.
    const komponent = las("src/components/TopskatBeregner.tsx");
    expect(komponent).toContain("SKATTELOFT * 100");
    expect(komponent).toContain("{SKATTELOFT_PCT}");
    expect(komponent).not.toMatch(/52[,.]07/);
  });

  test("værktøjet og siden bruger samme omregning fra grænsen", () => {
    // Før stod formlen tre steder: i komponentens `result`, i sidens `caBelob`
    // og i FAQ-svaret med et håndskrevet månedsbeløb. Komponenten rundede til
    // krones nøjagtighed (845.544), siden til hundrede (845.500) — så værktøjet
    // og brødteksten viste to tal for den samme grænse.
    const komponent = las("src/components/TopskatBeregner.tsx");
    expect(komponent).toContain("bruttoGraense(TOPSKAT_GRAENSE)");
    expect(komponent).toContain("bruttoGraense(MELLEMSKAT_GRAENSE)");
    expect(komponent).not.toMatch(/GRAENSE \/ \(1 - AM_BIDRAG\)/);

    const side = las("src/app/topskat/page.tsx");
    expect(side).toContain("bruttoGraense(SATSER_2026.topskatGraense, 12)");
    expect(side).not.toContain("caBelob");
    // Svensk og norsk læser dansk `page-data`, så listen skal skrive den
    // danske sats — ellers skrev den «7,5%» med sin egen formatter.
    expect(side).toContain("<strong>Mellemskat ({MELLEMSKAT}):</strong>");
    expect(side).not.toContain("{pct(");
  });
});

describe("/topskat — dansk tekst", () => {
  test("de tre sætninger uden tal er uændret", () => {
    const svar = new Map(topskatFaqItems().map((f) => [f.question, f.answer]));
    expect(svar.get("Hvad er forskellen på effektiv skat og marginalskat?")).toBe(
      "Effektiv skat er den gennemsnitlige skatteprocent du betaler af hele din " +
        "indkomst. Marginalskat er skatten af den sidst tjente krone. " +
        "Marginalskatten er altid højere end den effektive skat, fordi de første " +
        "kroner beskattes lavere (pga. personfradrag og ingen mellemskat/topskat)."
    );
    expect(svar.get("Kan jeg undgå topskat?")).toBe(
      "Du kan reducere din skattepligtige indkomst via fradrag (rentefradrag, " +
        "befordringsfradrag, pensionsindbetalinger). Ekstra pensionsindbetalinger " +
        "er en populær måde at komme under topskattegrænsen."
    );
    // Svaret om top-topskat er ikke uændret: det fik «5 %» og «kr» uden punktum.
    expect(svar.get("Hvad er den nye top-topskat?")).toBe(
      "I 2026 er der indført en top-topskat på 5 % for indkomster over " +
        "2.592.700 kr (efter AM-bidrag). Den rammer kun de allerhøjeste " +
        "indkomster og er et nyt tredje skattetrin."
    );
  });

  test("alle fem svar er stadig på plads, og skatteloft-svaret er helt", () => {
    const side = getPageData("topskat", "da");
    expect(side?.faqItems).toHaveLength(5);
    const skatteloft = side?.faqItems?.find((f) =>
      f.question.startsWith("Hvad er skatteloftet")
    );
    expect(skatteloft?.answer).toBe(
      "Skatteloftet sikrer at din samlede marginalskat (ekskl. AM-bidrag og " +
        "kirkeskat) ikke overstiger ca. 52,07 %. Med AM-bidrag (8 %) og " +
        "kirkeskat kan den reelle marginalskat dog være højere."
    );
  });
});