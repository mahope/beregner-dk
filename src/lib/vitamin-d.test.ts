import { describe, expect, it } from "vitest";
import {
  VITAMIN_D_ANBEFALING_UG,
  VITAMIN_D_AR_UG,
  VITAMIN_D_KILDE,
  VITAMIN_D_RI_75_PLUS_UG,
  VITAMIN_D_RI_UDEN_SOL_UG,
  VITAMIN_D_RI_UG,
  VITAMIN_D_UL_UG,
  VITAMIN_D_VARER,
  andelAfAnbefaling,
  d100g,
  dIgram,
  gramForAnbefaling,
  rangliste,
  soegVitaminDvarer,
  vareMedNavn,
  vitaminDTal,
} from "./vitamin-d";
import { getPageData } from "./page-data";

const makrel = vareMedNavn("Makrel, atlantic, rå")!;
const torskeleverolie = vareMedNavn("Torskeleverolie")!;
const aeg = vareMedNavn("Æg, helt, råt")!;
const smoer = vareMedNavn("Smør, saltet")!;

describe("vitamin-d", () => {
  it("læser kildens D-vitamintal for de vigtigste kilder", () => {
    // USDA FoodData Central, SR Legacy 2018-04, næringsstof 1114 (328).
    expect(makrel.d100g).toBe(16.1);
    expect(vareMedNavn("Ørred, regnbue, opdrættet, rå")!.d100g).toBe(15.9);
    expect(vareMedNavn("Laks, atlantic, opdrættet, kogt")!.d100g).toBe(13.1);
    expect(vareMedNavn("Laks, atlantic, opdrættet, rå")!.d100g).toBe(11.0);
    expect(torskeleverolie.d100g).toBe(250);
    expect(vareMedNavn("Æggeblomme")!.d100g).toBe(5.4);
    expect(vareMedNavn("Sild, atlantic, rå")!.d100g).toBe(4.2);
    expect(aeg.d100g).toBe(2);
    expect(vareMedNavn("Mælk, sødmælk, m. tilsat D-vitamin")!.d100g).toBe(1.3);
    expect(smoer.d100g).toBe(0);
  });

  it("har unikke fdcId'er og ikke-negative værdier", () => {
    const idSaet = new Set(VITAMIN_D_VARER.map((v) => v.fdcId));
    expect(idSaet.size).toBe(VITAMIN_D_VARER.length);
    for (const vare of VITAMIN_D_VARER) {
      expect(vare.d100g).toBeGreaterThanOrEqual(0);
      expect(vare.portionGram).toBeGreaterThan(0);
      expect(Number.isFinite(dIgram(vare, vare.portionGram))).toBe(true);
    }
  });

  it("har NNR2023's anbefalinger", () => {
    expect(VITAMIN_D_RI_UG).toBe(10);
    expect(VITAMIN_D_RI_75_PLUS_UG).toBe(20);
    expect(VITAMIN_D_RI_UDEN_SOL_UG).toBe(20);
    expect(VITAMIN_D_AR_UG).toBe(7.5);
    expect(VITAMIN_D_UL_UG).toBe(100);
    expect(VITAMIN_D_ANBEFALING_UG).toBe(VITAMIN_D_RI_UG);
    expect(VITAMIN_D_RI_UDEN_SOL_UG).toBeGreaterThan(VITAMIN_D_RI_UG);
    expect(VITAMIN_D_UL_UG).toBeGreaterThan(VITAMIN_D_RI_UG);
  });

  it("regner D-vitamin i en given mængde", () => {
    expect(dIgram(makrel, 100)).toBeCloseTo(16.1, 5);
    expect(dIgram(makrel, 125)).toBeCloseTo(20.125, 5);
    expect(dIgram(aeg, 60)).toBeCloseTo(1.2, 5);
    expect(dIgram(smoer, 100)).toBe(0);
  });

  it("regner andelen af voksnes anbefaling", () => {
    // En 125 g makrel giver 20,125 µg = 201,25 % af 10 µg.
    expect(andelAfAnbefaling(makrel, 125)).toBeCloseTo(201.25, 2);
    expect(andelAfAnbefaling(smoer, 15)).toBe(0);
  });

  it("regner hvor meget der skal til for anbefalingen", () => {
    // 10 µg / 16,1 µg pr. 100 g = 62,1 g makrel.
    expect(gramForAnbefaling(makrel)).toBeCloseTo(62.11, 1);
    expect(gramForAnbefaling(smoer)).toBe(Number.POSITIVE_INFINITY);
  });

  it("sorterer mest D-vitamin først og søger i navnene", () => {
    const listen = rangliste();
    expect(listen[0].navn).toBe("Torskeleverolie");
    expect(listen[1].navn).toBe("Makrel, atlantic, rå");
    for (let i = 1; i < listen.length; i++) {
      expect(listen[i - 1].d100g).toBeGreaterThanOrEqual(listen[i].d100g);
    }
    expect(soegVitaminDvarer("laks").length).toBe(2);
    expect(soegVitaminDvarer("makrel").length).toBe(1);
    expect(soegVitaminDvarer("  OSTR ").length).toBe(0);
    expect(soegVitaminDvarer("").length).toBe(VITAMIN_D_VARER.length);
  });

  it("formaterer tal på dansk", () => {
    expect(vitaminDTal(makrel.d100g)).toBe("16,1");
    expect(vitaminDTal(10)).toBe("10");
    expect(vitaminDTal(20.125)).toBe("20,1");
    expect(vitaminDTal(100)).toBe("100");
    expect(vitaminDTal(250, 0)).toBe("250");
  });

  it("viser D-vitamin-siden med anbefalingen og tabellen, beregnet af kildetal", () => {
    const pageData = getPageData("vitamin-d", "da")!;
    expect(pageData).toBeDefined();
    expect(pageData.title).toBe("D-vitamin – hvor meget skal du have om dagen?");
    expect(pageData.metaTitle).toBe("D-vitamin: 10 µg om dagen for voksne");
    expect(pageData.metaTitle.length).toBeLessThanOrEqual(70);
    expect(pageData.metaDescription).toContain("10 µg");
    expect(pageData.metaDescription).toContain("makrel");
    expect(pageData.schemaName).toBe("D-vitamin anbefaling og D-vitamin i madvarer");
    expect(pageData.category).toBe("Sundhed");

    // FAQ'en skal være genereret af modulet: tallene i svarene er kildens.
    const faq = pageData.faqItems;
    expect(faq.length).toBeGreaterThanOrEqual(5);
    const spoergsmaal = faq.map((f) => f.question);
    expect(spoergsmaal).toContain("Hvor meget D-vitamin skal man have om dagen?");
    expect(spoergsmaal).toContain("Hvor meget D-vitamin er der i makrel?");
    expect(spoergsmaal).toContain("Hvor meget D-vitamin er der i laks?");
    const svarOmDagligt = faq.find(
      (f) => f.question === "Hvor meget D-vitamin skal man have om dagen?"
    )!;
    expect(svarOmDagligt.answer).toContain("10 µg");
    expect(svarOmDagligt.answer).toContain("7,5 µg");
    expect(svarOmDagligt.answer).toContain("100 µg");
    const svarOmMakrel = faq.find(
      (f) => f.question === "Hvor meget D-vitamin er der i makrel?"
    )!;
    expect(svarOmMakrel.answer).toContain("16,1 µg");
    expect(svarOmMakrel.answer).toContain("20,1 µg");
    expect(svarOmMakrel.answer).toContain("201 %");

    // Ingen markdown-stjerner i metadata eller FAQ.
    for (const punkt of [pageData.metaTitle, pageData.metaDescription, ...faq.flatMap((f) => [f.question, f.answer])]) {
      expect(punkt).not.toContain("**");
    }
  });
});
