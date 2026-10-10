import { describe, expect, it } from "vitest";
import {
  VITAMIN_B12_AI_UG,
  VITAMIN_B12_ANBEFALING_UG,
  VITAMIN_B12_AR_UG,
  VITAMIN_B12_KILDE,
  VITAMIN_B12_NORDISK_INDTAG,
  VITAMIN_B12_UL_UG,
  VITAMIN_B12_VARER,
  andelAfAnbefaling,
  b100g,
  b12Tal,
  bIgram,
  gramForAnbefaling,
  rangliste,
  soegB12varer,
  vareMedNavn,
} from "./vitamin-b12";
import { getPageData } from "./page-data";

const makrel = vareMedNavn("Makrel, atlantic, rå")!;
const okselever = vareMedNavn("Okselever, rå")!;
const aeg = vareMedNavn("Æg, helt, råt")!;
const smoer = vareMedNavn("Smør, saltet")!;
const havregryn = vareMedNavn("Havregryn, tørrede")!;

describe("vitamin-b12", () => {
  it("læser kildens B12-tal for de vigtigste kilder", () => {
    // USDA FoodData Central, SR Legacy 2018-04, næringsstof 1178.
    expect(okselever.b100g).toBe(59.3);
    expect(vareMedNavn("Hønsenelever, rå")!.b100g).toBe(16.58);
    expect(vareMedNavn("Sild, atlantic, rå")!.b100g).toBe(13.67);
    expect(vareMedNavn("Muslinger, blå, rå")!.b100g).toBe(12.0);
    expect(vareMedNavn("Sardiner, dåse i olie")!.b100g).toBe(8.94);
    expect(makrel.b100g).toBe(8.71);
    expect(vareMedNavn("Ørred, regnbue, rå")!.b100g).toBe(4.3);
    expect(vareMedNavn("Laks, atlantic, opdrættet, rå")!.b100g).toBe(3.23);
    expect(vareMedNavn("Feta")!.b100g).toBe(1.69);
    expect(aeg.b100g).toBe(0.89);
    expect(vareMedNavn("Yoghurt, natur")!.b100g).toBe(0.37);
    expect(smoer.b100g).toBe(0.17);
    expect(havregryn.b100g).toBe(0);
  });

  it("har kun animalske kilder med B12 — alle plantefødevarer er 0", () => {
    const nuller = VITAMIN_B12_VARER.filter((v) => v.b100g === 0);
    expect(nuller.map((v) => v.navn)).toEqual(["Havregryn, tørrede", "Rugbrød"]);
  });

  it("har unikke fdcId'er og ikke-negative værdier", () => {
    const idSaet = new Set(VITAMIN_B12_VARER.map((v) => v.fdcId));
    expect(idSaet.size).toBe(VITAMIN_B12_VARER.length);
    for (const vare of VITAMIN_B12_VARER) {
      expect(vare.b100g).toBeGreaterThanOrEqual(0);
      expect(vare.portionGram).toBeGreaterThan(0);
      expect(Number.isFinite(bIgram(vare, vare.portionGram))).toBe(true);
    }
  });

  it("deler fdcId'er med kaloriesiden, så siderne ikke kan blive uenige", () => {
    expect(aeg.fdcId).toBe(171287);
    expect(vareMedNavn("Mælk, sødmælk")!.fdcId).toBe(171265);
    expect(smoer.fdcId).toBe(173410);
    expect(vareMedNavn("Gouda")!.fdcId).toBe(171241);
    expect(vareMedNavn("Kylling, kød, rå")!.fdcId).toBe(171052);
    expect(havregryn.fdcId).toBe(169705);
    expect(vareMedNavn("Rugbrød")!.fdcId).toBe(172684);
  });

  it("har NNR2023's anbefalinger — AI 4 µg, provisorisk AR 3,2 µg, ingen UL", () => {
    expect(VITAMIN_B12_AI_UG).toBe(4.0);
    expect(VITAMIN_B12_AR_UG).toBe(3.2);
    expect(VITAMIN_B12_ANBEFALING_UG).toBe(VITAMIN_B12_AI_UG);
    expect(VITAMIN_B12_UL_UG).toBeNull();
    expect(VITAMIN_B12_AR_UG).toBeLessThan(VITAMIN_B12_AI_UG);
    expect(VITAMIN_B12_NORDISK_INDTAG.lav).toBeLessThan(VITAMIN_B12_NORDISK_INDTAG.hoej);
  });

  it("regner B12 i en given mængde", () => {
    expect(bIgram(makrel, 100)).toBeCloseTo(8.71, 5);
    expect(bIgram(makrel, 125)).toBeCloseTo(10.8875, 5);
    expect(bIgram(aeg, 60)).toBeCloseTo(0.534, 5);
    expect(bIgram(havregryn, 100)).toBe(0);
  });

  it("regner andelen af voksnes anbefaling", () => {
    // 125 g makrel giver 10,8875 µg = 272,2 % af 4 µg.
    expect(andelAfAnbefaling(makrel, 125)).toBeCloseTo(272.1875, 3);
    expect(andelAfAnbefaling(havregryn, 50)).toBe(0);
  });

  it("regner hvor meget der skal til for anbefalingen", () => {
    // 4 µg / 8,71 µg pr. 100 g = 45,9 g makrel.
    expect(gramForAnbefaling(makrel)).toBeCloseTo(45.92, 1);
    expect(gramForAnbefaling(havregryn)).toBe(Number.POSITIVE_INFINITY);
  });

  it("sorterer mest B12 først og søger i navnene", () => {
    const listen = rangliste();
    expect(listen[0].navn).toBe("Okselever, rå");
    expect(listen[1].navn).toBe("Hønsenelever, rå");
    for (let i = 1; i < listen.length; i++) {
      expect(listen[i - 1].b100g).toBeGreaterThanOrEqual(listen[i].b100g);
    }
    expect(soegB12varer("mælk").length).toBe(2);
    expect(soegB12varer("makrel").length).toBe(1);
    expect(soegB12varer("  MAKREL ").length).toBe(1);
    expect(soegB12varer("laks").length).toBe(1);
    expect(soegB12varer("").length).toBe(VITAMIN_B12_VARER.length);
  });

  it("formaterer tal på dansk", () => {
    expect(b12Tal(makrel.b100g)).toBe("8,7");
    expect(b12Tal(4)).toBe("4");
    expect(b12Tal(59.3)).toBe("59,3");
    expect(b12Tal(16.58)).toBe("16,6");
    expect(b12Tal(125, 0)).toBe("125");
  });

  it("viser B12-siden med anbefalingen og tabellen, beregnet af kildetal", () => {
    const pageData = getPageData("vitamin-b12", "da")!;
    expect(pageData).toBeDefined();
    expect(pageData.title).toBe("B12-vitamin – hvor meget skal du have om dagen?");
    expect(pageData.metaTitle).toBe("B12-vitamin: 4 µg om dagen for voksne");
    expect(pageData.metaTitle.length).toBeLessThanOrEqual(70);
    expect(pageData.metaDescription).toContain("4 µg");
    expect(pageData.metaDescription).toContain("lever");
    expect(pageData.schemaName).toBe("B12-vitamin anbefaling og B12 i madvarer");
    expect(pageData.category).toBe("Sundhed");

    // FAQ'en skal være genereret af modulet: tallene i svarene er kildens.
    const faq = pageData.faqItems;
    expect(faq.length).toBeGreaterThanOrEqual(5);
    const spoergsmaal = faq.map((f) => f.question);
    expect(spoergsmaal).toContain("Hvor meget B12 skal man have om dagen?");
    expect(spoergsmaal).toContain("Hvor meget B12 er der i æg?");
    expect(spoergsmaal).toContain("Hvor meget B12 er der i kylling?");
    expect(spoergsmaal).toContain("Får vegetarianere og veganere nok B12?");
    const svarOmDagligt = faq.find(
      (f) => f.question === "Hvor meget B12 skal man have om dagen?"
    )!;
    expect(svarOmDagligt.answer).toContain("4 µg");
    expect(svarOmDagligt.answer).toContain("3,2 µg");
    const svarOmAeg = faq.find(
      (f) => f.question === "Hvor meget B12 er der i æg?"
    )!;
    expect(svarOmAeg.answer).toContain("0,9 µg");
    expect(svarOmAeg.answer).toContain("13 %");
    const svarOmVeg = faq.find(
      (f) => f.question === "Får vegetarianere og veganere nok B12?"
    )!;
    expect(svarOmVeg.answer).toContain("havregryn");

    // Ingen markdown-stjerner i metadata eller FAQ.
    for (const punkt of [pageData.metaTitle, pageData.metaDescription, ...faq.flatMap((f) => [f.question, f.answer])]) {
      expect(punkt).not.toContain("**");
    }
  });
});
