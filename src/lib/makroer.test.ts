import { describe, it, expect } from "vitest";
import {
  beregnMakroer,
  proteinGPerKg,
  PROTEIN_G_PER_KG,
  FEDT_ANDEL,
  KCAL_PER_G,
  MAAL_ORDRE,
  AKTIVITETS_FAKTORER,
  beregnBmr,
  beregnTdee,
  kalorierForMaal,
  kaloriePrDagRaekker,
  kaloriePrAlderRaekker,
  PR_DAG_FORUDSETNINGER,
  PR_DAG_VAEGTE,
  PR_ALDER_ALDERE,
  PR_ALDER_FORUDSETNINGER,
  type KalorieMaal,
} from "./makroer";

const VAEGT = 80;
const KALORIER = 2400;

describe("proteinGPerKg", () => {
  it("uses the middle of each documented range", () => {
    expect(proteinGPerKg("vedligehold")).toBe(1.0);
    expect(proteinGPerKg("tab")).toBe(1.4);
    expect(proteinGPerKg("opbyg")).toBeCloseTo(1.9, 10);
  });

  it("stays inside the range the /kalorier page documents", () => {
    for (const maal of MAAL_ORDRE) {
      const gPerKg = proteinGPerKg(maal);
      const { min, max } = PROTEIN_G_PER_KG[maal];
      expect(gPerKg).toBeGreaterThanOrEqual(min);
      expect(gPerKg).toBeLessThanOrEqual(max);
    }
  });

  it("rises with the goal, and the ranges do not overlap", () => {
    expect(proteinGPerKg("vedligehold")).toBeLessThan(proteinGPerKg("tab"));
    expect(proteinGPerKg("tab")).toBeLessThan(proteinGPerKg("opbyg"));
    expect(PROTEIN_G_PER_KG.vedligehold.max).toBeLessThanOrEqual(
      PROTEIN_G_PER_KG.tab.min
    );
    expect(PROTEIN_G_PER_KG.tab.max).toBeLessThanOrEqual(
      PROTEIN_G_PER_KG.opbyg.min
    );
  });
});

describe("beregnMakroer", () => {
  it("gives the page's own example: 80 kg vedligehold = 80 g protein", () => {
    const makro = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal: "vedligehold" });
    expect(Math.round(makro.protein)).toBe(80);
    expect(makro.proteinGPerKgMin).toBe(0.8);
    expect(makro.proteinGPerKgMax).toBe(1.2);
  });

  it("gives more protein for weight loss than for maintenance", () => {
    const tab = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal: "tab" });
    const vedligehold = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal: "vedligehold" });
    expect(tab.protein).toBeGreaterThan(vedligehold.protein);
    expect(Math.round(tab.protein)).toBe(112);
  });

  it("gives the most protein for muscle gain", () => {
    const opbyg = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal: "opbyg" });
    expect(Math.round(opbyg.protein)).toBe(152);
  });

  it("keeps fat at 25 % of the calories", () => {
    for (const maal of MAAL_ORDRE) {
      const makro = beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal });
      expect(makro.fedt * KCAL_PER_G.fedt).toBeCloseTo(KALORIER * FEDT_ANDEL, 6);
    }
  });

  it("adds up to the calories, and never returns negative carbohydrates", () => {
    for (const maal of MAAL_ORDRE) {
      for (const kalorier of [1400, 1800, 2400, 3200, 4500]) {
        const makro = beregnMakroer({ vaegtKg: VAEGT, kalorier, maal });
        const sum =
          makro.protein * KCAL_PER_G.protein +
          makro.fedt * KCAL_PER_G.fedt +
          makro.kulhydrater * KCAL_PER_G.kulhydrater;
        expect(makro.kulhydrater).toBeGreaterThanOrEqual(0);
        expect(sum).toBeCloseTo(Math.max(kalorier, sum), 6);
        if (makro.kulhydrater > 0) expect(sum).toBeCloseTo(kalorier, 6);
      }
    }
  });

  it("keeps protein inside the documented range for every weight and goal", () => {
    for (let vaegt = 35; vaegt <= 200; vaegt += 5) {
      for (const maal of MAAL_ORDRE) {
        const makro = beregnMakroer({ vaegtKg: vaegt, kalorier: KALORIER, maal });
        const { min, max } = PROTEIN_G_PER_KG[maal];
        expect(makro.protein / vaegt).toBeGreaterThanOrEqual(min);
        expect(makro.protein / vaegt).toBeLessThanOrEqual(max);
        expect(makro.proteinGPerKgMin).toBe(min);
        expect(makro.proteinGPerKgMax).toBe(max);
      }
    }
  });

  it("returns zero protein for a non-positive weight instead of a negative", () => {
    for (const maal of MAAL_ORDRE) {
      const makro = beregnMakroer({ vaegtKg: 0, kalorier: KALORIER, maal });
      expect(makro.protein).toBe(0);
      expect(makro.kulhydrater).toBeGreaterThanOrEqual(0);
    }
  });

  it("covers every goal the calculator offers", () => {
    for (const maal of ["vedligehold", "tab", "opbyg"] as KalorieMaal[]) {
      expect(MAAL_ORDRE).toContain(maal);
      expect(() =>
        beregnMakroer({ vaegtKg: VAEGT, kalorier: KALORIER, maal })
      ).not.toThrow();
    }
  });
});

describe("BMR, TDEE og kalorier pr dag", () => {
  it("regner Mifflin-St Jeor for mand og kvinde", () => {
    // 10*80 + 6,25*180 - 5*30 + 5 = 1.780 (mand), -161 i stedet for +5 (kvinde)
    expect(beregnBmr("mand", 80, 180, 30)).toBeCloseTo(1780, 5);
    expect(beregnBmr("kvinde", 80, 180, 30)).toBeCloseTo(1614, 5);
  });

  it("ganger BMR med aktivitetsfaktoren", () => {
    expect(beregnTdee(1780, "moderat")).toBeCloseTo(1780 * 1.55, 5);
    expect(AKTIVITETS_FAKTORER.stillesiddende).toBe(1.2);
  });

  it("laegger et underskud paa 500 og et overskud paa 300", () => {
    const bmr = beregnBmr("mand", 80, 180, 30);
    const tdee = beregnTdee(bmr, "moderat");
    expect(kalorierForMaal(bmr, tdee, "vedligehold")).toBe(2759);
    expect(kalorierForMaal(bmr, tdee, "tab")).toBe(2259);
    expect(kalorierForMaal(bmr, tdee, "opbyg")).toBe(3059);
  });

  it("laegger aldrig vaegttabsbehovet under basalstofskiftet", () => {
    // 30 kg, 100 cm, 100 aar, kvinde, stillesiddende: et 500 kcal underskud
    // ville give et negativt anbefalet indtag
    const bmr = beregnBmr("kvinde", 30, 100, 100);
    const tdee = beregnTdee(bmr, "stillesiddende");
    expect(kalorierForMaal(bmr, tdee, "tab")).toBe(Math.round(bmr));
    expect(kalorierForMaal(bmr, tdee, "tab")).toBeGreaterThan(0);
  });

  it("giver 80 kg mand de tal siden allerede lover i sin egen tekst", () => {
    const raekke = kaloriePrDagRaekker([80])[0];
    // 1.780 BMR og 2.759 TDEE staar i metaDescription, 2.259 i FAQ'en
    expect(raekke.mand).toBe(2759);
    expect(raekke.tabMand).toBe(2259);
  });

  it("har en kvinderaeekke der er laevendere end mandsraekken paa samme vaegt", () => {
    for (const raekke of kaloriePrDagRaekker()) {
      expect(raekke.kvinde).toBeLessThan(raekke.mand);
      expect(raekke.tabKvinde).toBeLessThan(raekke.tabMand);
      expect(raekke.tabKvinde).toBeLessThan(raekke.kvinde);
    }
  });

  it("bruger de forudsætninger som tabellen siger i teksten", () => {
    expect(PR_DAG_FORUDSETNINGER).toEqual({
      hoejdeCm: 180,
      alder: 30,
      aktivitet: "moderat",
    });
    expect(kaloriePrDagRaekker()).toHaveLength(PR_DAG_VAEGTE.length);
  });
});

describe("kaloriePrAlderRaekker", () => {
  it("dækker præcis de aldre søgningen spørger om", () => {
    // Svensk autocomplete under "kaloribehov kvinna" er 10/10 det samme
    // spørgsmål, og syv af dem er en alder: 40, 50, 55, 60, 65, 70 og 80 år.
    for (const alder of [40, 50, 60, 65, 70, 80]) {
      expect(PR_ALDER_ALDERE).toContain(alder);
    }
    expect(kaloriePrAlderRaekker()).toHaveLength(PR_ALDER_ALDERE.length);
  });

  it("giver hver raekke vaerktøjets eget tal for den alder", () => {
    for (const raekke of kaloriePrAlderRaekker()) {
      const bmr = beregnBmr("kvinde", PR_ALDER_FORUDSETNINGER.vaegtKg, PR_ALDER_FORUDSETNINGER.hoejdeCm, raekke.alder);
      const tdee = beregnTdee(bmr, PR_ALDER_FORUDSETNINGER.aktivitet);
      expect(raekke.kvinde).toBe(kalorierForMaal(bmr, tdee, "vedligehold"));
      expect(raekke.tabKvinde).toBe(kalorierForMaal(bmr, tdee, "tab"));
    }
  });

  it("giver 80 kg 30 år de tal siderne allerede skriver i egen tekst", () => {
    const trediveAar = kaloriePrAlderRaekker([30])[0];
    // 2.759 og 2.502 staar i kalorier/side og i FAQ'en paa begge domaener
    expect(trediveAar.mand).toBe(2759);
    expect(trediveAar.kvinde).toBe(2502);
  });

  it("falder 50 kcal i BMR pr. aarti, altsaa 78 kcal i TDEE pr. aartia", () => {
    const raekker = kaloriePrAlderRaekker();
    for (let i = 1; i < raekker.length; i++) {
      const foer = raekker[i - 1];
      const nu = raekker[i];
      // Aldersspringet er 5 eller 10 aar; kravet er den samme rate hver gang.
      const spring = nu.alder - foer.alder;
      const bmrFald = (beregnBmr("kvinde", PR_ALDER_FORUDSETNINGER.vaegtKg, PR_ALDER_FORUDSETNINGER.hoejdeCm, foer.alder)
        - beregnBmr("kvinde", PR_ALDER_FORUDSETNINGER.vaegtKg, PR_ALDER_FORUDSETNINGER.hoejdeCm, nu.alder));
      expect(bmrFald).toBe(5 * spring);
      expect(foer.kvinde).toBeGreaterThan(nu.kvinde);
      expect(foer.tabKvinde).toBeGreaterThan(nu.tabKvinde);
    }
  });

  it("krydssjekker den 30-aarige raekke mod vaegttabellen, saa de to tabeller ikke kan glide fra hinanden", () => {
    const vaegt80 = kaloriePrDagRaekker([80])[0];
    const trediveAar = kaloriePrAlderRaekker([30])[0];
    // Begge tabeller bruger 80 kg og 180 cm, saa 30 aar skal give de samme tal.
    expect(PR_DAG_FORUDSETNINGER.hoejdeCm).toBe(PR_ALDER_FORUDSETNINGER.hoejdeCm);
    expect(trediveAar.mand).toBe(vaegt80.mand);
    expect(trediveAar.kvinde).toBe(vaegt80.kvinde);
    expect(trediveAar.tabKvinde).toBe(vaegt80.tabKvinde);
  });

  it("giver en mand altid mere end en kvinne i samme alder", () => {
    for (const raekke of kaloriePrAlderRaekker()) {
      expect(raekke.kvinde).toBeLessThan(raekke.mand);
    }
  });
});
