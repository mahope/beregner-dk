/**
 * The port for /kalorier's example numbers.
 *
 * The metadata moved to `kalorier-eksempler` first; these tests are what keep
 * the FAQ answers from drifting back — and they are the reason the Swedish and
 * Norwegian strings stopped writing "1.780 kcal", which in running text reads
 * as 1,780 kcal in both languages.
 *
 * Every test below fails against the code before the fix. `dansk er
 * byte-uændret` pins the seven Danish answers to the strings the page has
 * always published, so the module cannot quietly rewrite them; the `se`/`no`
 * loops forbid a Danish thousands separator in any published string; the last
 * test reads the numbers out of `kalorierEksempelTal`, so a mutation of the
 * activity factor or of the deficit turns them red.
 */

import { describe, expect, test } from "vitest";
import { formatBelob } from "./format";
import {
  KALORIER_EKSEMPEL,
  KALORIER_KG_PR_UGE,
  KALORIER_USIKKERHED_PCT,
  kalorierEksempelTal,
  kalorierFaqItems,
  kalorierOverskrifter,
} from "./kalorier-eksempler";
import { AKTIVITETS_FAKTORER, KALORIE_UNDERSKUD, PROTEIN_G_PER_KG } from "./makroer";
import { getPageData } from "./page-data";
import { VAEGTTAB_KCAL_PR_KG } from "./vaegttab-eksempler";

const SPROG = ["da", "se", "no"] as const;



describe("kalorierEksempelTal", () => {
  test("eksemplens tal er dem, KalorieBeregner ville regne dem til", () => {
    const { mandBmr, mandTdee, kvindeTdee, dagligtMaal } = kalorierEksempelTal();
    // Mifflin-St Jeor: 10 × 80 + 6,25 × 180 − 5 × 30 + 5 = 1.780
    expect(mandBmr).toBe(1780);
    expect(mandTdee).toBeCloseTo(1780 * AKTIVITETS_FAKTORER.moderat, 6);
    // Samme krop som kvinde: 1.780 − 166 = 1.614 BMR, × 1,55 = 2.501,7
    expect(kvindeTdee).toBeCloseTo(1614 * AKTIVITETS_FAKTORER.moderat, 6);
    // Og dagsmålet er TDEE minus underskuddet — det er `kalorierForMaal`, der
    // også sørger for aldrig at anbefale under BMR.
    expect(dagligtMaal).toBe(2259);
    expect(dagligtMaal).toBeGreaterThan(mandBmr);
  });
});

describe("kalorierFaqItems", () => {
  const gammelDa = [
    {
      question: "Hvad er forskellen på BMR og TDEE?",
      answer:
        "BMR er kalorier i hvile. TDEE er totalt dagligt forbrug inkl. aktivitet. TDEE = BMR × aktivitetsfaktor.",
    },
    {
      question: "Hvor mange kalorier for at tabe mig?",
      answer:
        "Spis ca. 500 kcal under din TDEE, svarende til ca. 0,5 kg tab pr. uge. Mand, 80 kg, 180 cm og 30 år med moderat aktivitet: ca. 2.259 kcal om dagen.",
    },
    {
      question: "Hvad meget protein?",
      answer: "Vedligehold: 0,8-1,2g/kg. Vægttab: 1,2-1,6g/kg. Muskelopbygning: 1,6-2,2g/kg.",
    },
    {
      question: "Er beregneren præcis?",
      answer: "Bruger Mifflin-St Jeor formlen. Individuelle variationer kan være 10-15%.",
    },
    {
      question: "Hvor mange kalorier skal jeg have?",
      answer:
        "En mand på 80 kg, 180 cm og 30 år med moderat aktivitet har et dagligt forbrug på 2.759 kcal. En kvinde på samme mål har 2.502 kcal. Skriv dine egne tal i værktøjet for det præcise tal.",
    },
    {
      question: "Hvor mange kalorier skal jeg forbrænde for at tabe 1 kg?",
      answer:
        "Der skal bruges ca. 7.700 kcal pr. kilo fedt, så 1 kg kræver et underskud på 7.700 kcal fordelt over en uge. Det svarer til 500 kcal om dagen.",
    },
    {
      question: "Er kalorieberegneren gratis?",
      answer:
        "Ja. Værktøjet er en gratis hjemmeside — du skal ikke oprette en konto, og det virker direkte i browseren på computer og telefon.",
    },
  ];

  test("dansk er byte-uændret — de syv svar lå på de tal, før de kom fra modulet", () => {
    expect(kalorierFaqItems("da")).toEqual(gammelDa);
  });

  test("hvert sprog har sit eget sæt spørgsmål — intet er dansk på svensk", () => {
    const spoergsmaal = (locale: "da" | "se" | "no") => kalorierFaqItems(locale).map((s) => s.question);
    for (const locale of SPROG) {
      // Listen er ensartet, og intet spørgsmål går igen i to sprog: en dansk
      // sætning i den svenske gren er den fejl, der lå på /pace, så porten
      // dømmer netop det.
      const liste = spoergsmaal(locale);
      expect(new Set(liste).size, locale).toBe(liste.length);
      for (const andet of SPROG) {
        if (andet === locale) continue;
        const dubletter = liste.filter((s) => spoergsmaal(andet).includes(s));
        expect(dubletter, `${locale} mod ${andet}`).toEqual([]);
      }
    }
    // Svensk har to mere end dansk (børn og gratis); norsk har bevidst kun de
    // fire, der nævner et tal — udgaven ligger i `hiddenDomains` (❓ i planen).
    expect(spoergsmaal("se").length).toBeGreaterThan(spoergsmaal("da").length);
    expect(spoergsmaal("no").length).toBeLessThan(spoergsmaal("da").length);
  });

  test.each(["se", "no"] as const)(
    "%s skriver intet tusindtal med dansk punktum — «2.759» læses som 2,759 kcal",
    (locale) => {
      for (const { question, answer } of kalorierFaqItems(locale)) {
        // Punktum mellem to talgrupper er den danske separator. I svensk og
        // norsk løbende tekst er den en decimal, så «2.759 kcal» er ulæseligt.
        expect(answer, `${locale}: ${question}`).not.toMatch(/\d\.\d{3}/);
        expect(answer, `${locale}: ${question}`).not.toContain("NaN");
        expect(answer.length, `${locale}: ${question}`).toBeGreaterThan(20);
      }
      // Det samme gælder metadatafelterne, som også står i søgeresultatet.
      const o = kalorierOverskrifter(locale);
      for (const [felt, vaerdi] of Object.entries(o)) {
        expect(vaerdi, `${locale}: ${felt}`).not.toMatch(/\d\.\d{3}/);
        expect(vaerdi, `${locale}: ${felt}`).not.toContain("NaN");
      }
    },
  );

  test.each(["da", "se"] as const)(
    "%s bærer de tal, beregningen giver — ikke håndskrevne",
    (locale) => {
      const { mandTdee, kvindeTdee, dagligtMaal } = kalorierEksempelTal();
      const svar = kalorierFaqItems(locale);
      const alle = svar.map((s) => s.answer).join(" ");
      for (const vaerdi of [
        mandTdee,
        kvindeTdee,
        dagligtMaal,
        VAEGTTAB_KCAL_PR_KG,
        KALORIE_UNDERSKUD,
        KALORIER_EKSEMPEL.vaegtKg,
        KALORIER_EKSEMPEL.hoejdeCm,
        KALORIER_EKSEMPEL.alder,
      ]) {
        expect(alle, `${locale}: ${vaerdi}`).toContain(formatBelob(vaerdi, locale));
      }
      // Proteinintervallerne er makroer.ts' egne, ugerunden er deklareret.
      expect(alle, locale).toContain(
        `${formatBelob(PROTEIN_G_PER_KG.vedligehold.min, locale, 1)}-${formatBelob(PROTEIN_G_PER_KG.vedligehold.max, locale, 1)}g/kg`,
      );
      expect(alle, locale).toContain(`${formatBelob(KALORIER_KG_PR_UGE, locale, 1)} kg`);
      expect(alle, locale).toContain(
        `${formatBelob(KALORIER_USIKKERHED_PCT.min, locale)}-${formatBelob(KALORIER_USIKKERHED_PCT.maks, locale)}%`,
      );
      // Og de tre spørgsmål, der bærer et tal, skal hver især bære sit eget.
      const tdeeSvar = svar.find((s) => s.answer.includes(formatBelob(mandTdee, locale)));
      expect(tdeeSvar?.answer, locale).toContain(formatBelob(kvindeTdee, locale));
      const maalSvar = svar.find((s) => s.answer.includes(formatBelob(dagligtMaal, locale)));
      expect(maalSvar?.answer, locale).toContain(formatBelob(KALORIE_UNDERSKUD, locale));
    },
  );

  test("norsk bærer de tal, dens fire svar faktisk nævner", () => {
    const { dagligtMaal } = kalorierEksempelTal();
    const svar = kalorierFaqItems("no").map((s) => s.answer).join(" ");
    for (const vaerdi of [dagligtMaal, KALORIE_UNDERSKUD]) {
      expect(svar, String(vaerdi)).toContain(formatBelob(vaerdi, "no"));
    }
    expect(svar).toContain(`${formatBelob(KALORIER_KG_PR_UGE, "no", 1)} kg`);
    // De to tal, de norske svar ikke nævner, må ikke findes i dem — ellers er
    // der tilføjet et svar, der hævder noget, porten ikke dømmer.
    expect(svar).not.toContain(formatBelob(kalorierEksempelTal().mandTdee, "no"));
  });
});

describe("page-data binder /kalorier til modulet", () => {
  test.each(SPROG)("%s: de publicerede tal er modulens egne", (locale) => {
    const data = getPageData("kalorier", locale)!;
    const o = kalorierOverskrifter(locale);
    const items = kalorierFaqItems(locale);
    expect(data.description).toBe(o.description);
    expect(data.metaTitle).toBe(o.metaTitle);
    expect(data.metaDescription).toBe(o.metaDescription);
    expect(data.ogTitle).toBe(o.ogTitle);
    // `faqItems` er præcis det `FAQSchema` læser, så de syv/otte/fire svar er
    // dem, der står i JSON-LD'en — de må ikke være en anden liste.
    expect(data.faqItems).toEqual(items);
  });

  test("den danske titel er uændret, så der ikke er en SEO-regression", () => {
    expect(getPageData("kalorier", "da")!.metaTitle).toBe(
      "Kalorieberegner: 80 kg, 180 cm, 30 år, moderat = 2.759 kcal",
    );
    expect(getPageData("kalorier", "se")!.metaTitle).toBe(
      "Kalorikalkylator: man 80 kg, 180 cm = 2 759 kcal/dag",
    );
  });
});