import { describe, expect, test } from "vitest";

import { formatBelob } from "@/lib/format";
import { getPageData } from "@/lib/page-data";
import { beregnRentefradrag } from "@/lib/rentefradrag";
import {
  rentefradragDescription,
  rentefradragFaqSvar,
  rentefradragMetaDescription,
  RENTEFRADRAG_LOFT_EKSEMPEL,
} from "@/lib/rentefradrag-eksempler";
import { RENTEFRADRAG_2026 } from "@/lib/satser-2026";

const data = getPageData("rentefradrag", "da")!;
const kr = (vaerdi: number) => formatBelob(vaerdi, "da");

/**
 * Alt, /rentefradrag har lov til at skrive i en brødtekst, regnet ud fra de
 * moduler siden læser. Et beløb, der ikke står her, er håndskrevet — og det er
 * præcis den fejl, opgaven fjerner: «26.880 kr.» kunne stå i FAQ'en, mens
 * `rentefradrag.ts` sagde 24.480, og ingen test ville have set det.
 */
const TILLADTE_BELOB = new Set<string>([
  kr(RENTEFRADRAG_2026.highRateLimitSingle),
  kr(RENTEFRADRAG_2026.highRateLimitCouple),
  kr(RENTEFRADRAG_LOFT_EKSEMPEL),
  // De tre beløb der er beregnede, ikke slået op: et eksempel ved grænsen hos
  // en enlig, samme beløb hos et par (helt under den dobbelte grænse) og
  // forskellen mellem dem.
  kr(beregnRentefradrag(RENTEFRADRAG_2026.highRateLimitSingle, "single").besparelse),
  kr(beregnRentefradrag(RENTEFRADRAG_LOFT_EKSEMPEL, "single").besparelse),
  kr(beregnRentefradrag(RENTEFRADRAG_LOFT_EKSEMPEL, "couple").besparelse),
  kr(
    beregnRentefradrag(RENTEFRADRAG_LOFT_EKSEMPEL, "couple").besparelse -
      beregnRentefradrag(RENTEFRADRAG_LOFT_EKSEMPEL, "single").besparelse,
  ),
]);

/** Hvert beløb i en brødtekst, så porten kan dømme dem enkeltvis. */
const belobI = (tekst: string): string[] => tekst.match(/\d{1,3}\.\d{3}(?!\d)/g) ?? [];

describe("rentefradrag-eksempler", () => {
  test("hvert beløb i metadata og svar kommer fra modulerne", () => {
    const fund: string[] = [];
    for (const tekst of [
      data.description,
      data.metaDescription,
      ...data.faqItems.map((faq) => faq.answer),
    ]) {
      for (const belob of belobI(tekst)) {
        if (!TILLADTE_BELOB.has(belob)) fund.push(`${belob} — ${tekst.slice(0, 60)}`);
      }
    }
    expect(fund).toEqual([]);
  });

  test("metadata og svar læser de samme funktioner, siden binder dem", () => {
    expect(data.description).toBe(rentefradragDescription());
    expect(data.metaDescription).toBe(rentefradragMetaDescription());
    // De fem svar med tal ligger i rækkefølge i listen, så et spørgsmål der
    // flytter sig ikke kan få det forkerte svar.
    const medTal = data.faqItems.filter((faq) => belobI(faq.answer).length > 0).map((f) => f.answer);
    expect(medTal).toEqual(
      rentefradragFaqSvar("fradragsvaerdi", "falder", "loft", "effektiv", "par"),
    );
  });

  test("besparelsen ved grænsen er grænsen gange den høje sats", () => {
    // 50.000 × 33,6 % = 16.800 kr. Skrevet med konstantens egen værdi, så
    // mutationen i RENTEFRADRAG_2026 slår den rød.
    const forventet =
      RENTEFRADRAG_2026.highRateLimitSingle * RENTEFRADRAG_2026.highRate;
    expect(kr(forventet)).toBe("16.800");
    expect(rentefradragDescription()).toContain(`${kr(forventet)} kr i skattebesparelse`);
  });

  test("den effektive sats er lavere end den høje sats for den, der kommer over grænsen", () => {
    const enlig = beregnRentefradrag(RENTEFRADRAG_LOFT_EKSEMPEL, "single");
    const par = beregnRentefradrag(RENTEFRADRAG_LOFT_EKSEMPEL, "couple");
    expect(enlig.effektivSats).toBeCloseTo(30.6, 5);
    // Parret ligger under den dobbelte grænse, så hele beløbet får høj sats.
    expect(par.effektivSats).toBeCloseTo(RENTEFRADRAG_2026.highRate * 100, 5);
    expect(rentefradragFaqSvar("effektiv")[0]).toContain("30,6 %");
  });

  test("et par med loft-eksemplet sparer mere end en enlig, ikke det samme", () => {
    // Mutation: den gamle påstand «præcis samme besparelse» giver rødt her,
    // fordi den talte 24.480 mod 26.880 — en forskel på 2.400 kr. Den stod i
    // FAQ'en og dermed i Googles JSON-LD, mens page.tsx havde sagt det rigtige.
    const [svar] = rentefradragFaqSvar("par");
    // Den gamle sætning var «et par med 80.000 kr. i renter får præcis samme
    // besparelse» — altså som den enlige. Den nye siger «Begge parter får
    // præcis samme besparelse», og det er en anden påstand: den holder kun
    // mellem de to parter, ikke mellem par og enlig. Derfor negationen matcher
    // på «i renter får» og ikke på hele den afsluttende sætning.
    expect(svar).not.toMatch(/i renter får præcis samme besparelse/);
    expect(svar).toContain("26.880 kr.");
    expect(svar).toContain("2.400 kr. mere end en enlig");
  });

  test("svaret om de fremtidige satser har kilde og dato i stedet for en løs påstand", () => {
    // Den gamle sætning sluttede «Grænsen har været uændret i en årrække» —
    // en historisk påstand uden kilde. Modulets egen verifiedAt står nu i
    // svaret, så datoen ikke kan være ældre end det sidste slå-op.
    const [svar] = rentefradragFaqSvar("falder");
    expect(svar).toContain(RENTEFRADRAG_2026.verifiedAt);
    expect(svar).toContain(new URL(RENTEFRADRAG_2026.officialRules).host);
    expect(svar).not.toContain("uændret i en årrække");
  });
});
