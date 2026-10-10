/**
 * Sidernes `<title>` skal love præcis det, de gør.
 *
 * GSC-uddraget for minberegner.dk (28 dage) deler sitet i to grupper efter
 * titelform, og forskellen er ikke lille:
 *
 * | titelform        | sider | median CTR | visninger |
 * |------------------|-------|------------|-----------|
 * | regnestykke-eksempel | 6   | 0,9 %      | 67.643    |
 * | kategori-navn     | 5     | 0,3 %      | 385.817   |
 * | som et spørgsmål  | 3     | 0,5 %      | 43.733    |
 *
 * De fem kategorisider rummer **386.817 visninger** — fire gange sitets øvrige
 * titler — og konverterer dårligst. `/procent` alene har 150.148 visninger og
 * 98 klik. Det er ikke et titelmistgrep, det er et mønster i sitets egne data,
 * og det er derfor en regel: en beregners `<title>` skal indeholde et
 * regnestykke, brugeren kan regne efter og se resultatet af.
 *
 * Testen læser `metaTitle` — altså den tekst der havner i `<head>` — og kræver
 * at de syv dækkende sider indeholder et tegn på et udregnet eksempel
 * (`=` eller `→` mellem to tal). Den fejler på den gamle kode, fordi ingen af
 * de syv titler har en værdi: de er "Procentberegner – beregn 10 procent af
 * et tal", "Dage mellem datoer og dage til en dato", "BMI Beregner for voksne
 * - Beregn dit Body Mass Index gratis" og således videre.
 *
 * Samme test verificerer de konkrete tal mod repoets egne beregningsfunktioner.
 * Et tal i en titel er en påstand om, hvad værktøjet gør (punkt 11 i
 * kvalitetstjeklisten), så det skal kunne regnes efter — ikke være en plausibel
 * runde figur.
 */
import { describe, expect, test } from "vitest";
import { rabatProcent, procentAf, RABAT_EKSEMPEL, PROCENT_10_AF_FAQ } from "@/lib/procent";
import { beregnBmr, beregnTdee } from "@/lib/makroer";
import { dageTilDecember } from "@/lib/dage-mellem-datoer";
import { beregnMoms } from "@/lib/moms";
import { getPageData } from "@/lib/page-data";
import { formatBelob } from "./format";
import { beregnTidsinterval } from "@/lib/tidsberegner";

/**
 * Sider der skal have et regnestykke i titlen. Listen er begrundet i GSC:
 * en visning, der ikke klikkes, er en visning der koster penge.
 */
const SKAL_HAEVE_EKSEMPEL = [
  "tidsberegner",
  "moms",
  "dato",
  "bmi",
  "fart",
  "kalorier",
] as const;

/**
 * En titel skal have et tal og et mellemled, så læseren kan regne efter.
 *
 * Ét tal er nok: `= 365 dage` er et udregnet svar, ligesom `10 % af 250 kr. =
 * 25 kr.` er et regnestykke. Det afgørende er `=` — ingen af de otte gamle
 * titler havde det, de var alle "Procentberegner – beregn 10 procent af et
 * tal" og "Dage mellem datoer og dage til en dato".
 *
 * **To former, begge regnet af koden siden selv bruger.** `/dato` skrev før
 * 4/10 «1. jan. 2026→2027 = 365» — mellemledet mellem to tal. Fra 4/10 skriver
 * den «58 dage tilbage» (se `dageTilDecember`), fordi GSC's to største
 * søgninger på siden er nedtællinger, og en pil mellem to årstal læses i
 * svensk som «365 dage kvar». Den anden form kræver derfor **måleenheden
 * lige efter tallet**: uden `dage`/`dagar`/`kr.`/`%` er «Dage til 1. december: 2026»
 * igen en titel uden svar, hvilket er den fejl de otte gamle titler havde.
 */
function harUdregnetEksempel(titel: string): boolean {
  const harMellemledMellemTal = /[=→]/.test(titel);
  const harSvarMedEnhed = /\d[\d.,]*\s?(dage|dagar|kr\.?|%|timer)\b/.test(titel);
  return /\d/.test(titel) && (harMellemledMellemTal || harSvarMedEnhed);
}

describe("titler med et udregnet eksempel", () => {
  for (const slug of SKAL_HAEVE_EKSEMPEL) {
    for (const locale of ["da", "se"] as const) {
      test(`${locale}/${slug}`, () => {
        const data = getPageData(slug, locale);
        expect(data, `${locale}/${slug}`).toBeDefined();
        expect(
          harUdregnetEksempel(data!.metaTitle),
          `"${data!.metaTitle}" har intet udregnet eksempel`
        ).toBe(true);
      });
    }
  }
});

describe("tallene i titlerne er rigtige", () => {
  test("tidsberegner: 08:30 til 16:45 er 8 timer og 15 minutter", () => {
    // Samme kald som beregnerens egen tabel bruger.
    expect(beregnTidsinterval({ startTid: "08:30", slutTid: "16:45" })).toMatchObject({
      timer: 8,
      minutter: 15,
    });
    for (const locale of ["da", "se"] as const) {
      const titel = getPageData("tidsberegner", locale)!.metaTitle;
      expect(titel, locale).toContain("08:30");
      expect(titel, locale).toContain("16:45");
    }
  });

  test("tidsberegner: titlen lover de datoer, værktøjet faktisk regner på", () => {
    // GSC: "tidsberegner" er 27.000 visninger på pos. 4, og dansk autocomplete
    // svarer variation 2 med "tidsberegner mellem datoer". Værktøjet har kunnet
    // regne på tværs af datoer siden C51, men titlen lovede kun klokkeslæt — så
    // den overløbte en kapacitet den ikke havde. Kaldet her beviser den først,
    // så påstanden i titlen ikke kan overleve et brudt datofelt.
    const overDatoer = beregnTidsinterval({
      startTid: "08:30",
      slutTid: "16:45",
      startDato: "2026-09-28",
      slutDato: "2026-09-30",
    });
    expect(overDatoer).toMatchObject({ timer: 56, minutter: 15 });
    const page = getPageData("tidsberegner", "da")!;
    for (const streng of [page.metaTitle, page.ogTitle]) {
      expect(streng).toMatch(/datoer/i);
    }
    for (const streng of [page.metaDescription, page.ogDescription, page.schemaDescription]) {
      expect(streng).toMatch(/datoer/i);
    }
    // Svensk titel er frosset til 13/10 (opgave 187), så den skal ikke røres.
    expect(getPageData("tidsberegner", "se")!.metaTitle).not.toMatch(/datoer/i);
  });

  test("moms: 1.000 kr. ekskl. moms er 1.250 kr. inkl. 25 %", () => {
    const r = beregnMoms(1000, "tillaegMoms", 25);
    expect(r.prisInklMoms).toBe(1250);
    expect(r.momsBeloeb).toBe(250);
    const titel = getPageData("moms", "da")!.metaTitle;
    expect(titel).toMatch(/1\.?000/);
    expect(titel).toMatch(/1\.?250/);
  });

  // /procent er sitets største impressionsblok: GSC 9/9–7/10 viser 141.167
  // visninger, 77 klik, CTR 0,1 % på pos. 7,5. Den gamle titel skrev
  // "10 % af et tal" — et tal uden et regnestykke, og de to største
  // søgninger på siden er netop "procentberegner" og "10 procent af". Nu
  // skriver titlen hele opgaven med svaret, regnet af den samme funktion,
  // siden bruger. De to andre tal i titlen/beskrivelsen er rabatspørgsmålet,
  // som Google selv har registreret på siden ("en telefon er sat 1125 kr.
  // ned. normalt koster den 9000 kr. hvor stor er rabatten i procent?").
  test("procent: 10 % af 1.600 kr. = 160 kr. og rabaten 9.000 → 7.875 = 12,5 %", () => {
    const svar = procentAf(PROCENT_10_AF_FAQ, 10);
    const rabat = rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris);
    expect(svar).toBe(160);
    expect(rabat).toBe(12.5);

    const titel = getPageData("procent", "da")!.metaTitle;
    expect(titel).toMatch(/10 % af/);
    expect(titel).toContain(`${formatBelob(PROCENT_10_AF_FAQ, "da")} kr.`);
    // Resultatet skal stå med enhed lige efter tallet, så det læses som svar.
    expect(titel).toContain(`${formatBelob(svar, "da")} kr.`);
    expect(titel).toContain("=");

    const beskrivelse = getPageData("procent", "da")!.metaDescription;
    expect(beskrivelse).toContain(`${formatBelob(RABAT_EKSEMPEL.normalPris, "da")} kr.`);
    expect(beskrivelse).toContain(`${formatBelob(RABAT_EKSEMPEL.nedsatPris, "da")} kr.`);
    expect(beskrivelse).toContain(`${formatBelob(rabat, "da", 1)} %`);
  });

  // Titlen på /dato (131.320 visninger, 0,7 % CTR) skrev før 4/10
  // «1. jan. 2026→2027 = 365» — et interval på en nedtællingsside, håndskrevet
  // som bogstaver. Nu regner den nedtællingen til næste 1. december, så porten
  // dømmer *dagens* tal og ikke et gammelt.
  test("dato: titlen regner dagene til 1. december", () => {
    const { dage, decemberTekst } = dageTilDecember("da", new Date());
    const titel = getPageData("dato", "da")!.metaTitle;
    expect(titel).toContain(decemberTekst);
    expect(titel).toContain(`${dage} dage`);
    // Ikke længere et interval: pilen var den del, der læst som «365 dage kvar».
    expect(titel).not.toMatch(/→/);
  });

  test("bmi: 75 kg og 1,75 m er BMI 24,5", () => {
    expect(75 / 1.75 ** 2).toBeCloseTo(24.4898, 3);
    for (const locale of ["da", "se"] as const) {
      const titel = getPageData("bmi", locale)!.metaTitle;
      expect(titel, locale).toMatch(/75/);
      expect(titel, locale).toMatch(/1,75²/);
      expect(titel, locale).toMatch(/24,5/);
    }
  });

  test("fart: 100 km/t i 2 timer er 200 km", () => {
    expect(100 * 2).toBe(200);
    for (const locale of ["da", "se"] as const) {
      const titel = getPageData("fart", locale)!.metaTitle;
      expect(titel, locale).toMatch(/100/);
      expect(titel, locale).toMatch(/2 (?:timer|timmar)/);
      expect(titel, locale).toMatch(/200 km/);
    }
  });

  test("kalorier: mand 80 kg, 180 cm, 30 år har TDEE 2.759 kcal", () => {
    const bmr = beregnBmr("mand", 80, 180, 30);
    expect(bmr).toBe(1780);
    expect(beregnTdee(bmr, "moderat")).toBe(2759);
    // Dansk bruger punktum som tusindelstegn, svensk et mellemrum.
    expect(getPageData("kalorier", "da")!.metaTitle).toMatch(/2\.759/);
    expect(getPageData("kalorier", "se")!.metaTitle).toMatch(/2 759/);
  });
});
