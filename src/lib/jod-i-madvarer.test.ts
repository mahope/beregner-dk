import { describe, expect, it } from "vitest";
import {
  JODVARER,
  JOD_AI_UG,
  JOD_ANBEFALING_UG,
  JOD_AR_UG,
  JOD_KILDE,
  JOD_UL_UG,
  andelAfAnbefaling,
  gramForAnbefaling,
  jod100g,
  jodIgram,
  jodTal,
  rangliste,
  soegJodvarer,
  vareMedNavn,
} from "./jod-i-madvarer";
import { getPageData } from "./page-data";

const salt = vareMedNavn("Joderet salt")!;
const torsk = vareMedNavn("Torsk, atlantic, rå")!;
const aeg = vareMedNavn("Æg, helt")!;
const feta = vareMedNavn("Feta, helmælk")!;
const smoer = vareMedNavn("Smør, saltet")!;

describe("jod-i-madvarer", () => {
  it("læser kildens jodtal for de vigtigste kilder", () => {
    // USDA FoodData Central, Foundation Foods 2026-04-30, næringsstof 1100.
    expect(salt.jod100g).toBe(5080);
    expect(vareMedNavn("Æggeblomme")!.jod100g).toBe(177);
    expect(torsk.jod100g).toBe(113.7);
    expect(feta.jod100g).toBe(48.44);
    expect(vareMedNavn("Hytteost")!.jod100g).toBe(45.69);
    expect(vareMedNavn("Krabbe, blå, konserveret")!.jod100g).toBe(44.48);
    expect(vareMedNavn("Yoghurt, græsk, naturlig")!.jod100g).toBe(42.28);
    expect(vareMedNavn("Mælk, letmælk")!.jod100g).toBe(39.6);
    expect(vareMedNavn("Mælk, sødmælk")!.jod100g).toBe(37.9);
    expect(vareMedNavn("Kærnemælk")!.jod100g).toBe(34.16);
    expect(vareMedNavn("Laks, sockeye, vild, rå")!.jod100g).toBe(18.38);
    expect(aeg.jod100g).toBe(49.1);
    expect(smoer.jod100g).toBe(0);
  });

  it("har de fdcId'er tallene er læst fra", () => {
    expect(salt.fdcId).toBe(746775);
    expect(torsk.fdcId).toBe(2684444);
    expect(aeg.fdcId).toBe(748967);
    expect(vareMedNavn("Spinat, moden")!.fdcId).toBe(1999633);
  });

  it("har unikke fdcId'er og ikke-negative værdier", () => {
    const idSaet = new Set(JODVARER.map((v) => v.fdcId));
    expect(idSaet.size).toBe(JODVARER.length);
    for (const vare of JODVARER) {
      expect(vare.jod100g).toBeGreaterThanOrEqual(0);
      expect(vare.portionGram).toBeGreaterThan(0);
      expect(Number.isFinite(jodIgram(vare, vare.portionGram))).toBe(true);
    }
  });

  it("har NNR2023's anbefalinger", () => {
    expect(JOD_AI_UG).toBe(150);
    expect(JOD_AR_UG).toBe(120);
    expect(JOD_UL_UG).toBe(600);
    expect(JOD_ANBEFALING_UG).toBe(JOD_AI_UG);
    expect(JOD_UL_UG).toBeGreaterThan(JOD_AI_UG);
    expect(JOD_AI_UG).toBeGreaterThan(JOD_AR_UG);
  });

  it("opgiver hvilket næringsstof tallene kommer fra", () => {
    expect(JOD_KILDE.naeringsstof).toContain("Iodine");
    expect(JOD_KILDE.naeringsstof).toContain("1100");
    expect(JOD_KILDE.dataset).toBe("Foundation Foods");
    // SR Legacy (som de andre madvaresider bruger) har ingen jodrækker —
    // derfor skal databasen her være en anden, og det skal stå i kilden.
    expect(JOD_KILDE.dataset).not.toBe("SR Legacy");
  });

  it("regner jod i en given mængde", () => {
    expect(jodIgram(torsk, 100)).toBeCloseTo(113.7, 5);
    expect(jodIgram(torsk, 150)).toBeCloseTo(170.55, 5);
    expect(jodIgram(aeg, 60)).toBeCloseTo(29.46, 5);
    expect(jodIgram(salt, 6)).toBeCloseTo(304.8, 5);
    expect(jodIgram(smoer, 100)).toBe(0);
  });

  it("regner andelen af voksnes anbefaling", () => {
    // 150 g torsk giver 170,55 µg = 113,7 % af 150 µg.
    expect(andelAfAnbefaling(torsk, 150)).toBeCloseTo(113.7, 2);
    expect(andelAfAnbefaling(smoer, 15)).toBe(0);
    expect(andelAfAnbefaling(salt)).toBeCloseTo(203.2, 1);
  });

  it("regner hvor meget der skal til for anbefalingen", () => {
    // 150 µg / 113,7 µg pr. 100 g = 131,9 g torsk.
    expect(gramForAnbefaling(torsk)).toBeCloseTo(131.93, 1);
    expect(gramForAnbefaling(smoer)).toBe(Number.POSITIVE_INFINITY);
  });

  it("sorterer mest jod først og søger i navnene", () => {
    const listen = rangliste();
    expect(listen[0].navn).toBe("Joderet salt");
    expect(listen[1].navn).toBe("Æggeblomme");
    for (let i = 1; i < listen.length; i++) {
      expect(listen[i - 1].jod100g).toBeGreaterThanOrEqual(listen[i].jod100g);
    }
    expect(soegJodvarer("mælk").length).toBe(5);
    expect(soegJodvarer("yoghurt").length).toBe(2);
    expect(soegJodvarer("salt").length).toBe(2);
    expect(soegJodvarer("").length).toBe(JODVARER.length);
  });

  it("formaterer tal på dansk", () => {
    expect(jodTal(torsk.jod100g)).toBe("113,7");
    expect(jodTal(JOD_AI_UG, 0)).toBe("150");
    expect(jodTal(170.55)).toBe("170,6");
    expect(jodTal(304.8)).toBe("304,8");
  });

  it("viser siden med anbefalingen og tabellen, beregnet af kildetal", () => {
    const pageData = getPageData("jod-i-madvarer", "da")!;
    expect(pageData).toBeDefined();
    expect(pageData.title).toBe(
      "Jod i madvarer – hvor meget er der i mælk, fisk og æg?"
    );
    expect(pageData.metaTitle).toBe("Jod i madvarer: 150 µg om dagen for voksne");
    expect(pageData.metaTitle.length).toBeLessThanOrEqual(70);
    expect(pageData.metaDescription).toContain("113,7");
    expect(pageData.schemaName).toBe("Jod i madvarer og NNR2023's jodanbefaling");
    expect(pageData.category).toBe("Sundhed");

    const faq = pageData.faqItems;
    expect(faq.length).toBeGreaterThanOrEqual(5);
    const spoergsmaal = faq.map((f) => f.question);
    expect(spoergsmaal).toContain("Hvor meget jod skal man have om dagen?");
    expect(spoergsmaal).toContain("Hvor meget jod er der i mælk?");
    expect(spoergsmaal).toContain("Hvor meget jod er der i fisk?");
    expect(spoergsmaal).toContain("Kan man få for meget jod?");
    // FAQ-svarene skal være genereret af modulet: tallene i dem er kildens.
    expect(faq[0].answer).toContain("150 µg");
    expect(faq[0].answer).toContain("600 µg");
    expect(faq[2].answer).toContain("113,7");
  });
});
