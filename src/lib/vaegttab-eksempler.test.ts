import { describe, expect, test } from "vitest";
import { getPageData } from "./page-data";
import { formatBelob } from "./format";
import {
  VAEGTTAB_EKSEMPEL,
  VAEGTTAB_KCAL_PR_KG,
  vaegttabEksempelTal,
  vaegttabOverskrifter,
} from "./vaegttab-eksempler";

/**
 * /vaegttab's title and four description fields used to spell 2.209, 2.759 and
 * 550 kcal out inside the sentence. These tests exist so that going back to
 * that is red: each number is locked twice, once against an independent
 * calculation and once as the string the page actually serves.
 */
describe("vaegttab-eksempler", () => {
  test("eksemplet er 80 kg, 180 cm, 30 år, moderat aktiv, 6 kg på 12 uger", () => {
    expect(VAEGTTAB_EKSEMPEL).toEqual({
      vaegtKg: 80,
      hoejdeCm: 180,
      alder: 30,
      aktivitet: "moderat",
      tabKg: 6,
      uger: 12,
    });
  });

  test("de fem tal er regnet, ikke skrevet — målt uafhængigt af modulet", () => {
    // Mifflin-St Jeor for en mand: 10×80 + 6,25×180 − 5×30 + 5 = 1.780
    const bmr = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
    // Aktivitetsfaktor 1,55 for "moderat": 1.780 × 1,55 = 2.759
    const tdee = bmr * 1.55;
    // 6 kg × 7.700 kcal = 46.200, fordelt på 12 × 7 = 84 dage = 550 pr. dag
    const samlet = 6 * 7700;
    const dagligtDeficit = samlet / 84;
    const dagligtMaal = tdee - dagligtDeficit;

    const tal = vaegttabEksempelTal();

    expect(VAEGTTAB_KCAL_PR_KG).toBe(7700);
    expect(tal.bmr).toBe(bmr);
    expect(tal.bmr).toBe(1780);
    expect(tal.tdee).toBe(tdee);
    expect(tal.tdee).toBe(2759);
    expect(tal.samletUnderskud).toBe(samlet);
    expect(tal.samletUnderskud).toBe(46200);
    expect(tal.dagligtDeficit).toBe(dagligtDeficit);
    expect(tal.dagligtDeficit).toBe(550);
    expect(tal.dagligtMaal).toBe(dagligtMaal);
    expect(tal.dagligtMaal).toBe(2209);
  });

  test("et andet eksempel giver andre tal — formlen læser ikke konstanter", () => {
    const tal = vaegttabEksempelTal({
      vaegtKg: 90,
      hoejdeCm: 175,
      alder: 45,
      aktivitet: "stillesiddende",
      tabKg: 5,
      uger: 10,
    });
    // 10×90 + 6,25×175 − 5×45 + 5 = 1.773,75; × 1,2 = 2.128,5; 5×7.700/70 = 550
    expect(tal.bmr).toBe(1773.75);
    expect(tal.tdee).toBe(2128.5);
    expect(tal.dagligtDeficit).toBe(550);
    expect(tal.dagligtMaal).toBe(1578.5);
  });
});

describe("vaegttabOverskrifter", () => {
  test.each(["da", "no", "se"] as const)(
    "hver sprogstreng bæger de tal, beregningen giver i %s",
    (locale) => {
      const { dagligtDeficit, dagligtMaal, tdee } = vaegttabEksempelTal();
      const t = vaegttabOverskrifter(locale);

      // Titlen er den korte version: den lover tempoet, hverken dagsmålet eller
      // vægten. Resten af felterne bærer forudsætningen og dens konsekvens.
      for (const streng of [t.metaTitle, t.description, t.metaDescription, t.schemaDescription]) {
        expect(streng).toContain(formatBelob(dagligtDeficit, locale));
      }
      for (const streng of [t.description, t.metaDescription, t.schemaDescription]) {
        expect(streng).toContain(formatBelob(dagligtMaal, locale));
        expect(streng).toContain(formatBelob(VAEGTTAB_EKSEMPEL.vaegtKg, locale));
      }
      // Højde og alder er kun med i de to lange felter.
      for (const streng of [t.description, t.metaDescription]) {
        expect(streng).toContain(formatBelob(VAEGTTAB_EKSEMPEL.hoejdeCm, locale));
        expect(streng).toContain(formatBelob(VAEGTTAB_EKSEMPEL.alder, locale));
      }
      // TDEE står kun i metaDescription, som er den lange.
      expect(t.metaDescription).toContain(formatBelob(tdee, locale));
    },
  );

  test("dansk er byte-uændret — reklameteksten lå på de tal, før de kom fra modulet", () => {
    const t = vaegttabOverskrifter("da");

    expect(t.metaTitle).toBe("Vægttab: 6 kg på 12 uger = 550 kcal/dag");
    expect(t.description).toBe(
      "Mand på 80 kg, 180 cm og 30 år med moderat aktivitet: 6 kg på 12 uger kræver 550 kcal i underskud, så du skal spise 2.209 kcal om dagen.",
    );
    expect(t.metaDescription).toBe(
      "6 kg på 12 uger kræver 550 kcal i dagligt underskud. Mand på 80 kg, 180 cm og 30 år: spis 2.209 kcal om dagen (TDEE 2.759 kcal).",
    );
    expect(t.schemaDescription).toBe(
      "Beregn dagligt kalorieunderskud: 6 kg på 12 uger er 550 kcal/dag, så en mand på 80 kg spiser 2.209 kcal/dag.",
    );
  });

  test("svensk og norsk bruger mellemrum som tusindtalsseparator, dansk punktum", () => {
    // 2.209 med dansk punktum i svensk løbende tekst læses som 2,209 kcal.
    for (const locale of ["se", "no"] as const) {
      const t = vaegttabOverskrifter(locale);
      expect(t.description).toContain("2 209 kcal");
      expect(t.metaDescription).toContain("2 759 kcal");
      expect(t.description).not.toContain("2.209");
    }
    expect(vaegttabOverskrifter("da").description).toContain("2.209 kcal");
  });

  test("ingen af strengene er tomme, og ingen har NaN", () => {
    for (const locale of ["da", "no", "se"] as const) {
      const t = vaegttabOverskrifter(locale);
      for (const [navn, streng] of Object.entries(t)) {
        expect(streng.length, navn).toBeGreaterThan(30);
        expect(streng, navn).not.toContain("NaN");
        expect(streng, navn).not.toContain("undefined");
        expect(streng, navn).not.toContain("Infinity");
      }
      // Google afkorter descriptioner og titler ved ~160 og ~60 tegn.
      expect(t.metaTitle.length, locale).toBeLessThanOrEqual(60);
      expect(t.metaDescription.length, locale).toBeLessThanOrEqual(160);
    }
  });
});

describe("page-data bruger modulet på alle tre sprog", () => {
  test.each(["da", "no", "se"] as const)("%s læser titlen og beskrivelserne fra modulet", (locale) => {
    const t = vaegttabOverskrifter(locale);
    const data = getPageData("vaegttab", locale)!;

    expect(data.metaTitle).toBe(t.metaTitle);
    expect(data.ogTitle).toBe(t.metaTitle);
    expect(data.description).toBe(t.description);
    expect(data.metaDescription).toBe(t.metaDescription);
    expect(data.ogDescription).toBe(t.metaDescription);
    expect(data.schemaDescription).toBe(t.schemaDescription);
  });

  test("et eksempel med et andet underskud ændrer den serverede tekst", () => {
    // Mutationsmodsvejs: en side der skrev tallene i sætningen ville give det
    // samme svar her, fordi sætningen ikke ville ændre sig.
    const t = vaegttabOverskrifter("da", {
      ...VAEGTTAB_EKSEMPEL,
      uger: 8,
    });
    expect(t.metaTitle).toBe("Vægttab: 6 kg på 8 uger = 825 kcal/dag");
    // 6 × 7.700 / (8 × 7) = 825 pr. dag, så dagsmålet er 2.759 − 825 = 1.934
    expect(t.description).toContain("1.934 kcal om dagen");
  });
});
