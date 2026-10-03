import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { getPageData } from "@/lib/page-data";
import { formatBelob } from "@/lib/format";
import {
  BOERNE_SATSER_2026,
  BOERNEUNGEYDELSE_2026,
  aarligBelob,
  udbetalingerPrAar,
} from "@/lib/borneungeydelse";
import {
  AFTRAPNING_EKSEMPEL_HOEJ,
  AFTRAPNING_EKSEMPEL_LAV,
  AFTRAPNING_GRAENSE,
  AFTRAPNING_PCT,
  belobOverGraensen,
  boerneBeskrivelse,
  boerneBelob,
  boerneBelobI,
  boerneInterval,
  boerneMetaBeskrivelse,
  boerneNedaettelse,
  boerneSatslisteKort,
  boerneSatslisteLang,
  boerneSatslisteMeta,
  boernepengeFaqItems,
} from "@/lib/boernepenge-eksempler";

/**
 * Påstande i tekst er kode (punkt 11). `/boernepenge` skrev de fire satser, de
 * fire årstal, aftrappingsgrænsen og de to eksempelbeløb i hånden — i
 * `description`, `metaDescription`, i to af sine otte FAQ-svar og i
 * brødtekstens aftrappingseksempel — mens `BoernepengBeregner` læser
 * `BOERNE_SATSER_2026`. Søgeresultat og værktøj var altså to uafhængige tal,
 * og ingen af husets porte kunne se det: en streng med et tal er gyldig JSX, så
 * hverken `tsc`, lint eller build siger noget.
 *
 * **Ingen reel fejl fundet.** Alle ni beløb var rigtige, så prøverne her er et
 * **lås mod 2027-drift** — de er skrevet, så en fremtidig satsændring ikke kan
 * efterlade søgeresultatet med den gamle værdi.
 *
 * Porten dømmer *hvert* beløb i metadata og svar mod de tal modulet må skrive,
 * så et håndskrevet beløb gør den rød. Den låser ikke en liste over fejl, men
 * de tal `BOERNE_SATSER_2026` faktisk må producere — ændrer en sats, følger
 * teksten med, og kommer der et tal ind udenom modulet, bliver porten rød.
 */

/** De beløb, porten accepterer: hver sats, hvert årstal og eksemplernes tal. */
const TILLADTE_BELOB = new Set([
  ...BOERNE_SATSER_2026.flatMap((sats) => [sats.hel, aarligBelob(sats)]),
  AFTRAPNING_GRAENSE,
  AFTRAPNING_EKSEMPEL_LAV,
  belobOverGraensen(AFTRAPNING_EKSEMPEL_LAV),
  boerneNedaettelse(AFTRAPNING_EKSEMPEL_LAV),
  AFTRAPNING_EKSEMPEL_HOEJ,
  belobOverGraensen(AFTRAPNING_EKSEMPEL_HOEJ),
  boerneNedaettelse(AFTRAPNING_EKSEMPEL_HOEJ),
].map((belob) => formatBelob(belob, "da")));

const ROT = join(__dirname, "..", "..");
const las = (sti: string) => readFileSync(join(ROT, sti), "utf8");

/** Et beløb med tusindtalsseparator, som sidens egen notationsform bruger. */
const BELOB = /\d{1,3}(?:\.\d{3})+/g;
/** Et procenttal, med eller uden mellemrum før tegnet. */
const PROCENT = /\d+(?:,\d+)?\s?%/g;

function alleTekster(): { hvor: string; tekst: string }[] {
  const side = getPageData("boernepenge", "da");
  if (!side) throw new Error("/boernepenge mangler i da");
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

describe("/boernepenge — tal fra BOERNE_SATSER_2026", () => {
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
        const sats = BOERNEUNGEYDELSE_2026.aftrapning.pct;
        if (match.replace(/\s/g, "") !== `${formatBelob(sats * 100, "da")}%`) {
          fund.push(`${hvor}: «${match}»`);
        }
      }
    }
    expect(fund).toEqual([]);
  });

  test("aftrappingsgrænsen og satsen er modulets egne tal", () => {
    expect(AFTRAPNING_GRAENSE).toBe(BOERNEUNGEYDELSE_2026.aftrapning.graense);
    expect(AFTRAPNING_GRAENSE).toBe(961100);
    expect(AFTRAPNING_PCT).toBe("2 %");
    // Mutation: glemmer man mellemrummet, skriver samme side «2%» i
    // brødteksten og «2 %» i FAQ-svaret for den samme sats.
    expect(AFTRAPNING_PCT).not.toBe("2%");
  });

  test("årstallene er intervalbeløbet ganget med antal udbetalinger", () => {
    // MÅLT: 5.370 × 4 = 21.480, 4.248 × 4 = 16.992, 3.342 × 4 = 13.368 og
    // 1.114 × 12 = 13.368. Note at 7-14 år og 15-17 år har samme årstal — det er
    // ikke en tastefejl, det er sådan ungeydelsen er sat.
    for (const sats of BOERNE_SATSER_2026) {
      expect(aarligBelob(sats)).toBe(sats.hel * udbetalingerPrAar(sats.interval));
    }
    expect(boerneSatslisteLang()).toBe(
      "0-2 år: 5.370 kr/kvartal (21.480 kr/år), " +
        "3-6 år: 4.248 kr/kvartal (16.992 kr/år), " +
        "7-14 år: 3.342 kr/kvartal (13.368 kr/år), " +
        "15-17 år: 1.114 kr/måned (13.368 kr/år)",
    );
  });

  test("de to eksempler er regnet med modulets egen formel", () => {
    // Mutation: skriver man «778 kr.» i hånden, er det et tal udenom modulet,
    // og et andet formelbrud end det porten ovenfor dømmer.
    expect(belobOverGraensen(AFTRAPNING_EKSEMPEL_LAV)).toBe(38900);
    expect(boerneNedaettelse(AFTRAPNING_EKSEMPEL_LAV)).toBe(778);
    expect(belobOverGraensen(AFTRAPNING_EKSEMPEL_HOEJ)).toBe(138900);
    expect(boerneNedaettelse(AFTRAPNING_EKSEMPEL_HOEJ)).toBe(2778);
    // Under grænsen er der ingen nedsættelse — aldrig et negativt beløb.
    expect(boerneNedaettelse(AFTRAPNING_GRAENSE)).toBe(0);
    expect(boerneNedaettelse(AFTRAPNING_GRAENSE - 100_000)).toBe(0);
  });
});

describe("/boernepenge — notationsform", () => {
  test("hver aldersgruppe har sit udbetalingsinterval med", () => {
    // Mutation: `metaDescription` skrev «3-6 år 4.248 kr» og «7-14 år 3.342 kr»
    // uden interval, mens `description` lige over den skrev «4.248 kr/kvartal».
    // Intervallet står nu på den gruppe, det gælder for, så det dækker alle fire.
    const meta = boerneSatslisteMeta();
    expect(meta).toBe(
      "0-2 år 5.370, 3-6 år 4.248 og 7-14 år 3.342 kr/kvartal, " +
        "15-17 år 1.114 kr/md",
    );
    expect(meta).not.toContain("3-6 år 4.248 kr,");
    expect(meta).not.toContain("7-14 år 3.342 kr,");
    for (const sats of BOERNE_SATSER_2026) {
      expect(meta).toContain(`${sats.alder} ${formatBelob(sats.hel, "da")}`);
    }
    // `description` har ingen tegngrænse, så den beholder formen pr. gruppe.
    expect(boerneSatslisteKort()).toBe(
      "0-2 år: 5.370 kr/kvartal, 3-6 år: 4.248 kr/kvartal, " +
        "7-14 år: 3.342 kr/kvartal, 15-17 år: 1.114 kr/md",
    );
    for (const sats of BOERNE_SATSER_2026) {
      expect(boerneSatslisteKort()).toContain(
        `${sats.alder}: ${formatBelob(sats.hel, "da")} kr/`,
      );
    }
  });

  test("metabeskrivelsen holder sig under husets 160 tegn", () => {
    // Mutation: skrev man intervallet på alle fire grupper, bliver den 174 tegn og
    // `page-data.test.ts` + `meta-description.test.ts` røde.
    expect(boerneMetaBeskrivelse().length).toBeLessThanOrEqual(160);
  });

  test("den korte form skriver «kr/md» og den lange «kr/måned»", () => {
    const unge = BOERNE_SATSER_2026.at(-1);
    expect(unge?.interval).toBe("maaned");
    expect(boerneInterval(unge!)).toBe("1.114 kr/md");
    expect(boerneInterval(unge!, true)).toBe("1.114 kr/måned");
    // Kvartalssatsen har samme ord i begge former — der er ingen «md» at forkorte.
    expect(boerneInterval(BOERNE_SATSER_2026[0])).toBe("5.370 kr/kvartal");
    expect(boerneInterval(BOERNE_SATSER_2026[0], true)).toBe("5.370 kr/kvartal");
  });

  test("kr-formen har ét punktum og ingen dobbelt enhed", () => {
    expect(boerneBelob(5370)).toBe("5.370 kr.");
    expect(boerneBelobI(5370)).toBe("5.370 kr");
    // Mutation: en streng med «kr.,» giver dobbelt sætningstegning, som
    // `pension-dobbelt-valuta` 2/10 kostede på `/pension`. Metadata og svar er
    // rigtige strenge, så porten kan se den der.
    //
    // Brødteksten er **ikke** med i denne løkke: beløbet står der i en
    // interpolation, så «kr.,» findes aldrig i kilden. Den dømmes af prøven
    // nedenfor, som binder beløbet foran kommaet til `boerneBelobI`.
    const fund: string[] = [];
    for (const { hvor, tekst } of alleTekster()) {
      for (const brokket of ["kr. kr.", "kr..", "kr.,"]) {
        if (tekst.includes(brokket)) fund.push(`${hvor}: «${brokket}»`);
      }
    }
    expect(fund).toEqual([]);
  });
});

describe("/boernepenge — brødteksten og FAQ-svaret siger det samme", () => {
  const side = las("src/app/boernepenge/page.tsx");

  test("brødteksten skriver «2 %», ikke «2%»", () => {
    // Mutation: brødteksten skrev «2%» to gange, mens FAQ-svaret på præcis
    // samme side skrev «2 %» — to notationsformer for én sats.
    expect(side).not.toContain("2%");
    expect(side).toContain("AFTRAPNING_PCT");
    // Og svaret bruger samme konstant, så der er én sats i to steder.
    const svar = boernepengeFaqItems().find((f) =>
      f.question.startsWith("Bliver børnepenge modregnet"),
    );
    expect(svar?.answer).toContain(AFTRAPNING_PCT);
    expect(svar?.answer).not.toContain("2%");
  });

  test("brødteksten har ingen håndskrevet beløb, men læser modulet", () => {
    // Mutation: sætter man «961.100 kr.» tilbage i JSX, er søgeresultatet og
    // brødteksten igen to uafhængige tal — og det er præcis det, porten over
    // ikke kan se, fordi beløbet står i JSX-tekst.
    const fund: string[] = [];
    for (const match of side.match(/\d{1,3}(?:\.\d{3})+/g) ?? []) {
      if (!TILLADTE_BELOB.has(match)) fund.push(match);
    }
    expect(fund).toEqual([]);
    expect(side).toContain("boerneBelob(AFTRAPNING_GRAENSE)");
    // Beløbet foran kommaet skal bruge formen **uden** punktum, ellers bliver
    // den renderede sætning «Tjener du 1.100.000 kr., er du …». Det var den
    // dobbelte sætningstegning, `pension-dobbelt-valuta` 2/10 fjernede andre
    // steder — og den lå i denne linje, fordi porten kun dømte metadata og svar.
    expect(side).toContain("boerneBelobI(AFTRAPNING_EKSEMPEL_HOEJ)");
    expect(side).not.toMatch(/\{\s*boerneBelob\(AFTRAPNING_EKSEMPEL_HOEJ\)\s*\}/);
    expect(side).toContain("boerneNedaettelse(AFTRAPNING_EKSEMPEL_HOEJ)");
  });

  test("FAQ-svarets eksempel er regnet med samme formel som brødteksten", () => {
    const svar = boernepengeFaqItems().find((f) =>
      f.question.startsWith("Bliver børnepenge modregnet"),
    );
    expect(svar?.answer).toContain(
      `${boerneBelob(AFTRAPNING_EKSEMPEL_LAV)} giver 2 % af ` +
        `${boerneBelob(belobOverGraensen(AFTRAPNING_EKSEMPEL_LAV))} = ` +
        `${boerneBelob(boerneNedaettelse(AFTRAPNING_EKSEMPEL_LAV))} årligt`,
    );
  });

  test("de otte spørgsmål er uændrede, de står som JSON-LD", () => {
    // `FAQSchema` publicerer spørgsmålene, så en stavefejl her er en ændring
    // af sidens strukturerede data, ikke kun af teksten.
    expect(boernepengeFaqItems().map((f) => f.question)).toEqual([
      "Hvem kan få børne- og ungeydelse?",
      "Hvor meget får jeg i børnepenge 2026?",
      "Hvornår udbetales børnepenge?",
      "Bliver børnepenge modregnet ved høj indkomst?",
      "Hvordan deles børnepenge mellem forældre?",
      "Hvad får enlige forsørgere ekstra?",
      "Er børnepenge skattefrie?",
      "Hvordan søger jeg om børnepenge?",
    ]);
  });

  test("metadatafelterne er de to, siden har brugt hele vejen", () => {
    const boernepenge = getPageData("boernepenge", "da");
    expect(boernepenge?.description).toBe(boerneBeskrivelse());
    expect(boernepenge?.metaDescription).toBe(boerneMetaBeskrivelse());
    expect(boerneBeskrivelse()).toContain("Beregn børnepenge 2026.");
    expect(boerneMetaBeskrivelse()).toContain("Beregn børnepenge 2026.");
  });
});
