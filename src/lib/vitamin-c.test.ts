import { describe, expect, it } from "vitest";
import {
  KARTOFFEL_KOGT_C_MG_100G,
  VITAMIN_C_ANBEFALING_MG,
  VITAMIN_C_AR_KVINDE_MG,
  VITAMIN_C_AR_MAND_MG,
  VITAMIN_C_KILDE,
  VITAMIN_C_RI_KVINDE_MG,
  VITAMIN_C_RI_MAND_MG,
  VITAMIN_C_RYGENDE_EKSTRA_MG,
  VITAMIN_C_VARER,
  andelAfAnbefaling,
  c100g,
  cIgram,
  gramForAnbefaling,
  rangliste,
  soegCVarer,
  vareMedNavn,
  vitaminCTal,
} from "./vitamin-c";
import { getPageData } from "./page-data";

const soelbaer = vareMedNavn("Solbær")!;
const peberfrugt = vareMedNavn("Peberfrugt, rød, rå")!;
const kartoffel = vareMedNavn("Kartoffel, rå")!;
const appelsin = vareMedNavn("Appelsin, rå")!;
const gulerod = vareMedNavn("Gulerod, rå")!;
const aeble = vareMedNavn("Æble, rå")!;

describe("vitamin-c", () => {
  it("læser kildens C-vitamintal for de vigtigste kilder", () => {
    // USDA FoodData Central, SR Legacy 2018-04, næringsstof 1162 (401).
    expect(soelbaer.c100g).toBe(181.0);
    expect(vareMedNavn("Persille, frisk")!.c100g).toBe(133.0);
    expect(peberfrugt.c100g).toBe(127.7);
    expect(vareMedNavn("Grønkål, rå")!.c100g).toBe(93.4);
    expect(vareMedNavn("Kiwi, grøn, rå")!.c100g).toBe(92.7);
    expect(vareMedNavn("Broccoli, rå")!.c100g).toBe(89.2);
    expect(vareMedNavn("Rosenkål, rå")!.c100g).toBe(85.0);
    expect(appelsin.c100g).toBe(53.2);
    expect(kartoffel.c100g).toBe(19.7);
    expect(KARTOFFEL_KOGT_C_MG_100G).toBe(13.0);
    expect(aeble.c100g).toBe(4.6);
  });

  it("har unikke fdcId'er og ikke-negative værdier", () => {
    const idSaet = new Set(VITAMIN_C_VARER.map((v) => v.fdcId));
    expect(idSaet.size).toBe(VITAMIN_C_VARER.length);
    for (const vare of VITAMIN_C_VARER) {
      expect(vare.c100g).toBeGreaterThan(0);
      expect(vare.portionGram).toBeGreaterThan(0);
      expect(Number.isFinite(cIgram(vare, vare.portionGram))).toBe(true);
    }
  });

  it("har NNR2023's anbefalinger", () => {
    expect(VITAMIN_C_RI_KVINDE_MG).toBe(95);
    expect(VITAMIN_C_RI_MAND_MG).toBe(110);
    expect(VITAMIN_C_AR_KVINDE_MG).toBe(75);
    expect(VITAMIN_C_AR_MAND_MG).toBe(90);
    expect(VITAMIN_C_RYGENDE_EKSTRA_MG).toBe(40);
    // Andelstabellen regner fra kvinders RI — den laveste af de to.
    expect(VITAMIN_C_ANBEFALING_MG).toBe(VITAMIN_C_RI_KVINDE_MG);
    expect(VITAMIN_C_RI_MAND_MG).toBeGreaterThan(VITAMIN_C_RI_KVINDE_MG);
    expect(VITAMIN_C_AR_KVINDE_MG).toBeLessThan(VITAMIN_C_RI_KVINDE_MG);
    expect(VITAMIN_C_AR_MAND_MG).toBeLessThan(VITAMIN_C_RI_MAND_MG);
  });

  it("regner C-vitamin i en given mængde", () => {
    expect(cIgram(soelbaer, 100)).toBeCloseTo(181.0, 5);
    expect(cIgram(peberfrugt, 80)).toBeCloseTo(102.16, 5);
    expect(cIgram(appelsin, 130)).toBeCloseTo(69.16, 5);
    expect(cIgram(kartoffel, 200)).toBeCloseTo(39.4, 5);
  });

  it("regner andelen af kvinders anbefaling", () => {
    // En 80 g rød peberfrugt giver 102,16 mg = 107,5 % af 95 mg.
    expect(andelAfAnbefaling(peberfrugt, 80)).toBeCloseTo(107.54, 2);
    // En 200 g kartoffel giver 39,4 mg = 41,5 % af 95 mg.
    expect(andelAfAnbefaling(kartoffel)).toBeCloseTo(41.47, 2);
  });

  it("regner hvor meget der skal til for anbefalingen", () => {
    // 95 mg / 127,7 mg pr. 100 g = 74,4 g peberfrugt.
    expect(gramForAnbefaling(peberfrugt)).toBeCloseTo(74.39, 1);
    // 95 mg / 53,2 mg pr. 100 g = 178,6 g appelsin.
    expect(gramForAnbefaling(appelsin)).toBeCloseTo(178.57, 1);
    // 95 mg / 19,7 mg pr. 100 g = 482,2 g kartoffel.
    expect(gramForAnbefaling(kartoffel)).toBeCloseTo(482.23, 1);
  });

  it("viser at kogning koster C-vitamin, ikke at kartoffel er en dårlig kilde", () => {
    // Kildens egen kogte kartoffelrække holder 13,0 mg pr. 100 g mod 19,7 rå.
    expect(KARTOFFEL_KOGT_C_MG_100G).toBeLessThan(kartoffel.c100g);
    // 200 g kogt kartoffel dækker stadig over en fjerdedel af kvinders anbefaling.
    expect(((KARTOFFEL_KOGT_C_MG_100G * 2) / 95) * 100).toBeGreaterThan(25);
    expect(((KARTOFFEL_KOGT_C_MG_100G * 2) / 95) * 100).toBeLessThan(30);
  });

  it("sorterer mest C-vitamin først og søger i navnene", () => {
    const listen = rangliste();
    expect(listen[0].navn).toBe("Solbær");
    expect(listen[1].navn).toBe("Persille, frisk");
    for (let i = 1; i < listen.length; i++) {
      expect(listen[i - 1].c100g).toBeGreaterThanOrEqual(listen[i].c100g);
    }
    expect(soegCVarer("kål").length).toBe(6);
    expect(soegCVarer("kartoffel").length).toBe(1);
    expect(soegCVarer("  GULEROD ").length).toBe(1);
    expect(soegCVarer("melon").length).toBe(0);
    expect(soegCVarer("").length).toBe(VITAMIN_C_VARER.length);
  });

  it("formaterer tal på dansk", () => {
    expect(vitaminCTal(soelbaer.c100g)).toBe("181");
    expect(vitaminCTal(peberfrugt.c100g)).toBe("127,7");
    expect(vitaminCTal(cIgram(peberfrugt, 80))).toBe("102,2");
    expect(vitaminCTal(95, 0)).toBe("95");
    expect(vitaminCTal(110, 0)).toBe("110");
  });

  it("viser C-vitamin-siden med anbefalingen og tabellen, beregnet af kildetal", () => {
    const pageData = getPageData("vitamin-c", "da")!;
    expect(pageData).toBeDefined();
    expect(pageData.title).toBe("C-vitamin – hvor meget skal du have om dagen?");
    expect(pageData.metaTitle).toBe("C-vitamin: 95 mg for kvinder, 110 mg for mænd");
    expect(pageData.metaTitle.length).toBeLessThanOrEqual(70);
    expect(pageData.metaDescription).toContain("95 mg");
    expect(pageData.metaDescription).toContain("peberfrugt");
    expect(pageData.schemaName).toBe("C-vitamin anbefaling og C-vitamin i madvarer");
    expect(pageData.category).toBe("Sundhed");

    // FAQ'en skal være genereret af modulet: tallene i svarene er kildens.
    const faq = pageData.faqItems;
    expect(faq.length).toBeGreaterThanOrEqual(5);
    const spoergsmaal = faq.map((f) => f.question);
    expect(spoergsmaal).toContain("Hvor meget C-vitamin skal man have om dagen?");
    expect(spoergsmaal).toContain("Hvor meget C-vitamin er der i peberfrugt?");
    expect(spoergsmaal).toContain("Hvor meget C-vitamin er der i appelsin?");
    const svarOmDagligt = faq.find(
      (f) => f.question === "Hvor meget C-vitamin skal man have om dagen?"
    )!;
    expect(svarOmDagligt.answer).toContain("95 mg");
    expect(svarOmDagligt.answer).toContain("110 mg");
    expect(svarOmDagligt.answer).toContain("75 mg");
    expect(svarOmDagligt.answer).toContain("40 mg");
    const svarOmPeberfrugt = faq.find(
      (f) => f.question === "Hvor meget C-vitamin er der i peberfrugt?"
    )!;
    expect(svarOmPeberfrugt.answer).toContain("127,7 mg");
    expect(svarOmPeberfrugt.answer).toContain("102,2 mg");
    expect(svarOmPeberfrugt.answer).toContain("108 %");
    const svarOmAppelsin = faq.find(
      (f) => f.question === "Hvor meget C-vitamin er der i appelsin?"
    )!;
    expect(svarOmAppelsin.answer).toContain("53,2 mg");
    expect(svarOmAppelsin.answer).toContain("69,2 mg");

    // Ingen markdown-stjerner i metadata eller FAQ.
    for (const punkt of [pageData.metaTitle, pageData.metaDescription, ...faq.flatMap((f) => [f.question, f.answer])]) {
      expect(punkt).not.toContain("**");
    }
  });
});
