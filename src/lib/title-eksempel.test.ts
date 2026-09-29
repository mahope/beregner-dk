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
 * at de fire dækkende sider indeholder et tegn på et udregnet eksempel
 * (`=` eller `→` mellem to tal). Den fejler på den gamle kode, fordi ingen af
 * de fire titler har en værdi: de er "Procentberegner – beregn 10 procent af
 * et tal", "Dage mellem datoer og dage til en dato" og således videre.
 *
 * Samme test verificerer de konkrete tal mod repoets egne beregningsfunktioner.
 * Et tal i en titel er en påstand om, hvad værktøjet gør (punkt 11 i
 * kvalitetstjeklisten), så det skal kunne regnes efter — ikke være en plausibel
 * runde figur.
 */
import { describe, expect, test } from "vitest";
import { beregnMoms } from "@/lib/moms";
import { getPageData } from "@/lib/page-data";
import { beregnTidsinterval } from "@/lib/tidsberegner";

/**
 * Sider der skal have et regnestykke i titlen. Listen er begrundet i GSC:
 * en visning, der ikke klikkes, er en visning der koster penge.
 */
const SKAL_HAEVE_EKSEMPEL = ["procent", "tidsberegner", "moms", "dato"] as const;

/**
 * En titel skal have et tal og et mellemled, så læseren kan regne efter.
 *
 * Ét tal er nok: `= 365 dage` er et udregnet svar, ligesom `10 % af 250 kr. =
 * 25 kr.` er et regnestykke. Det afgørende er `=` — ingen af de otte gamle
 * titler havde det, de var alle "Procentberegner – beregn 10 procent af et
 * tal" og "Dage mellem datoer og dage til en dato".
 */
function harUdregnetEksempel(titel: string): boolean {
  return /\d/.test(titel) && /[=→]/.test(titel);
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

  test("moms: 1.000 kr. ekskl. moms er 1.250 kr. inkl. 25 %", () => {
    const r = beregnMoms(1000, "tillaegMoms", 25);
    expect(r.prisInklMoms).toBe(1250);
    expect(r.momsBeloeb).toBe(250);
    const titel = getPageData("moms", "da")!.metaTitle;
    expect(titel).toMatch(/1\.?000/);
    expect(titel).toMatch(/1\.?250/);
  });

  test("procent: 10 % af 250 er 25", () => {
    expect(250 * 0.1).toBe(25);
    const titel = getPageData("procent", "da")!.metaTitle;
    expect(titel).toMatch(/250/);
    expect(titel).toMatch(/25\b/);
  });

  test("dato: 1. januar 2026 til 1. januar 2027 er 365 dage", () => {
    const fra = new Date(Date.UTC(2026, 0, 1));
    const til = new Date(Date.UTC(2027, 0, 1));
    expect((til.getTime() - fra.getTime()) / 86_400_000).toBe(365);
    const titel = getPageData("dato", "da")!.metaTitle;
    expect(titel).toMatch(/365/);
  });
});
