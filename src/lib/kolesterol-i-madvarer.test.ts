import { describe, expect, it } from "vitest";
import {
  AEG_GRAM,
  AEG_MG,
  DAGS_EKSEMPEL,
  KOLESTEROL_ANBEFALING_MG,
  KOLESTEROL_KILDE,
  KOLESTEROLVARER,
  antalAeg,
  kolesterol100gForNavn,
  kolesterolIgram,
  kolesterolTal,
  dagsTotal,
  gramForEtAeg,
  planter,
  rangliste,
  vareMedNavn,
} from "./kolesterol-i-madvarer";
import { getPageData } from "./page-data";

const aeg = vareMedNavn("Æg, helt, rå")!;
const blomme = vareMedNavn("Æggeblomme, rå")!;
const smor = vareMedNavn("Smør, saltet")!;
const cheddar = vareMedNavn("Cheddar")!;

describe("kolesterol-i-madvarer", () => {
  it("læser kildens kolesteroltal", () => {
    // USDA FoodData Central, SR Legacy 2018-04, næringsstof 1253.
    expect(aeg.kolesterol100g).toBe(372);
    expect(blomme.kolesterol100g).toBe(1085);
    expect(smor.kolesterol100g).toBe(215);
    expect(cheddar.kolesterol100g).toBe(99);
    expect(vareMedNavn("Rejer, kogte")!.kolesterol100g).toBe(189);
    expect(vareMedNavn("Kaviar")!.kolesterol100g).toBe(588);
    expect(vareMedNavn("Mælk, letmælk")!.kolesterol100g).toBe(5);
    expect(vareMedNavn("Tun, let, konserveret i vand")!.kolesterol100g).toBe(36);
  });

  it("har de fdcId'er tallene er læst fra", () => {
    expect(aeg.fdcId).toBe(171287);
    expect(blomme.fdcId).toBe(172184);
    expect(smor.fdcId).toBe(173410);
    expect(vareMedNavn("Kaviar")!.fdcId).toBe(174188);
  });

  it("har ingen dubletter i navne eller fdcId'er", () => {
    const navne = KOLESTEROLVARER.map((v) => v.navn);
    const ids = KOLESTEROLVARER.map((v) => v.fdcId);
    expect(new Set(navne).size).toBe(navne.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("regner mg i en mængde gram", () => {
    expect(kolesterolIgram(aeg, AEG_GRAM)).toBeCloseTo(223.2, 5);
    expect(kolesterolIgram(smor, 15)).toBeCloseTo(32.25, 5);
    expect(kolesterolIgram(cheddar, 30)).toBeCloseTo(29.7, 5);
  });

  it("regner 0 og negative mængder som 0", () => {
    expect(kolesterolIgram(aeg, 0)).toBe(0);
    expect(kolesterolIgram(aeg, -50)).toBe(0);
  });

  it("bruger ét råt æg som sammenligningstal", () => {
    expect(AEG_MG).toBe(223.2);
    expect(antalAeg(aeg, AEG_GRAM)).toBeCloseTo(1, 10);
    expect(antalAeg(aeg, AEG_GRAM * 2)).toBeCloseTo(2, 10);
    // Blommen er 1.085 mg pr. 100 g, men én portion er 17 g — dvs. 184,45 mg,
    // altså 0,83 æg. Hele ægget er 60 g og har 372 mg pr. 100 g.
    expect(blomme.portionGram).toBe(17);
    expect(antalAeg(blomme)).toBeCloseTo(184.45 / AEG_MG, 10);
    expect(antalAeg(blomme)).toBeLessThan(1);
    // 100 g æggeblomme svarer derimod til næsten fem hele æg.
    expect(antalAeg(blomme, 100)).toBeCloseTo(1085 / AEG_MG, 10);
  });

  it("finder gram der svarer til ét æg, og kan ikke gøre det for plantemad", () => {
    expect(gramForEtAeg(smor)).toBeCloseTo((AEG_MG / 215) * 100, 5);
    expect(gramForEtAeg(vareMedNavn("Rugbrød")!)).toBe(
      Number.POSITIVE_INFINITY
    );
    expect(antalAeg(vareMedNavn("Rugbrød")!)).toBe(0);
  });

  it("har kun plantemad til 0 mg", () => {
    const nuller = planter();
    expect(nuller.length).toBeGreaterThan(0);
    for (const vare of nuller) {
      expect(vare.kolesterol100g).toBe(0);
    }
    // Alt kød, mejeri, fisk og æg skal have mere end 0.
    for (const vare of KOLESTEROLVARER) {
      if (vare.navn.startsWith("Havregryn") || vare.navn === "Rugbrød") continue;
      if (vare.navn.startsWith("Gulerødder") || vare.navn === "Olivenolie")
        continue;
      expect(vare.kolesterol100g).toBeGreaterThan(0);
    }
  });

  it("sorterer ranglisten med mest cholesterol først", () => {
    const liste = rangliste();
    expect(liste[0].kolesterol100g).toBe(1085);
    for (let i = 1; i < liste.length; i++) {
      expect(liste[i - 1].kolesterol100g).toBeGreaterThanOrEqual(
        liste[i].kolesterol100g
      );
    }
  });

  it("læser dagens eksempel fra tabellens egne tal", () => {
    expect(DAGS_EKSEMPEL.length).toBeGreaterThan(4);
    for (const { vare } of DAGS_EKSEMPEL) {
      expect(vare).toBeDefined();
    }
    // Summen skal være summen af linjerne, ikke et håndskrevet tal.
    const sum = DAGS_EKSEMPEL.reduce(
      (acc, { vare, gram }) => acc + kolesterolIgram(vare, gram),
      0
    );
    expect(dagsTotal()).toBeCloseTo(sum, 10);
    expect(dagsTotal()).toBeGreaterThan(AEG_MG);
  });

  it("har ingen dansk anbefaling, og siger det", () => {
    // Der findes ingen dansk anbefalede dagsmængde for kostkolesterol. Hvis en
    // myndighed en dag sætter en, skal konstanten og teksten rettes samtidig.
    expect(KOLESTEROL_ANBEFALING_MG).toBeNull();
    expect(KOLESTEROL_KILDE.maettetFedtLoftProcent).toBe(10);
  });

  it("finder tal pr. navn, og kaster på et ukendt navn", () => {
    // En stavefejl i en tekst skal ikke kunne skrive «0 mg» i stedet for tallet.
    expect(kolesterol100gForNavn("Kaviar")).toBe(588);
    expect(kolesterol100gForNavn("Cheddar")).toBe(99);
    expect(() => kolesterol100gForNavn("Æggeblommer, rå")).toThrow();
    expect(() => kolesterol100gForNavn("Findes ikke")).toThrow();
  });

  it("formaterer tal på dansk", () => {
    expect(kolesterolTal(223.2)).toBe("223,2");
    expect(kolesterolTal(1085, 0)).toBe("1.085");
  });

  it("har en dansk side med titel, beskrivelse og FAQ", () => {
    const data = getPageData("kolesterol-i-madvarer", "da")!;
    expect(data.title).toContain("Kolesterol i madvarer");
    expect(data.description).toContain("æg");
    // Punkt 11: tallene i teksten skal komme fra tabellen.
    expect(data.metaTitle).toContain("223,2 mg");
    expect(data.metaDescription).toContain("99 mg");
    expect(data.metaDescription).toContain("215 mg");
    expect(data.metaDescription).toContain(String(KOLESTEROLVARER.length));
    expect(data.faqItems.length).toBeGreaterThanOrEqual(5);
    const svar = data.faqItems.map((f) => f.answer).join(" ");
    expect(svar).toContain("Der findes ingen dansk anbefaling");
    expect(svar).toContain(`${kolesterolTal(blomme.kolesterol100g, 0)} mg`);
    expect(svar).toContain(KOLESTEROL_KILDE.udgave);
  });
});