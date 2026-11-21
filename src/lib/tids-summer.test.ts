import { describe, test, expect } from "vitest";
import {
  TIDS_SUMMER,
  summerTidsrum,
  formatDoegn,
  EXCEL_SUM_FORMEL,
  EXCEL_SUM_MED_PAUSE,
} from "./tids-summer";
import { beregnTidsinterval } from "./tidsberegner";

function findRaekke(id: (typeof TIDS_SUMMER)[number]["id"]) {
  const raekke = TIDS_SUMMER.find((r) => r.id === id);
  if (!raekke) throw new Error(`TIDS_SUMMER skal indeholde rækken ${id}`);
  return raekke;
}

/**
 * Summer formlen i Excel selv, så krydschecket ikke bare gentager modulet.
 *
 * Excel lagrer et klokkeslæg som en **brøkdel af et døgn** — det er den
 * fælde, /tidsberegners egen Excel-afsnit beskriver — så "08:00" er 8/24
 * og ikke 8. Min første version af denne hjælper gav rå time-tal ind, og
 * den regnede derfor 192 dage i stedet for 8 timer; fundet fordi testen
 * *faldt* med et forkert tal frem for med NaN.
 */
function excelSum(
  a1: string,
  b1: string,
  c1: string,
  d1: string,
  e1 = 0,
  e2 = 0
) {
  const somDoegn = (værdi: string) => {
    const [time, minutter] = værdi.split(":").map(Number);
    return (time * 60 + minutter) / (24 * 60);
  };
  return (somDoegn(b1) - somDoegn(a1)) * 24 + (somDoegn(d1) - somDoegn(c1)) * 24 - e1 - e2;
}

describe("summerTidsrum", () => {
  test("de tre rækker summerer til 15,00 / 13,50 og 14,50 timer", () => {
    expect(summerTidsrum(findRaekke("arbejdsuge"))!.decimalTimer).toBe(15);
    expect(summerTidsrum(findRaekke("to_vagter"))!.decimalTimer).toBe(13.5);
    expect(summerTidsrum(findRaekke("pause_storre_end_en_time"))!.decimalTimer).toBe(14.5);
  });

  test("hver række er summen af de to rum, målt med beregnTidsinterval", () => {
    for (const raekke of TIDS_SUMMER) {
      const foerste = beregnTidsinterval({
        startTid: raekke.forsteStart,
        slutTid: raekke.forsteSlut,
        fratraekPause: raekke.pauseForste,
      })!;
      const anden = beregnTidsinterval({
        startTid: raekke.andenStart,
        slutTid: raekke.andenSlut,
        fratraekPause: raekke.pauseAnden,
      })!;
      const sum = summerTidsrum(raekke)!;
      // Beviset for at tabellen ikke kan glide fra værktøjet: summen er præcis
      // de to resultater lagt sammen, ikke et håndskrevet tal ved siden af.
      expect(sum.totalMinutter).toBe(foerste.totalMinutter + anden.totalMinutter);
    }
  });

  test("timer og minutter er div/mod 60 af totalen, som modulet selv gør", () => {
    for (const raekke of TIDS_SUMMER) {
      const sum = summerTidsrum(raekke)!;
      expect(sum.timer).toBe(Math.floor(sum.totalMinutter / 60));
      expect(sum.minutter).toBe(sum.totalMinutter % 60);
      expect(sum.timer * 60 + sum.minutter).toBe(sum.totalMinutter);
      expect(sum.decimalTimer).toBe(sum.totalMinutter / 60);
    }
  });

  test("pausen trækkes fra FØR summationen, så en pause over én time ikke giver et negativt tal", () => {
    // 09:00–17:00 er 480 minutter; 90 minutters pause efterlader 390.
    const raekke = findRaekke("pause_storre_end_en_time");
    const foerste = beregnTidsinterval({
      startTid: raekke.forsteStart,
      slutTid: raekke.forsteSlut,
      fratraekPause: raekke.pauseForste,
    })!;
    expect(foerste.totalMinutter).toBe(390);
    // 390 + 480 = 870. Uden pausen først ville det være 960.
    expect(summerTidsrum(raekke)!.totalMinutter).toBe(870);
  });

  test("den anden vagt må ikke tælles dobbelt: 8 t 15 min + 5 t 15 min = 13 t 30 min", () => {
    const raekke = findRaekke("to_vagter");
    const foerste = beregnTidsinterval({
      startTid: raekke.forsteStart,
      slutTid: raekke.forsteSlut,
    })!;
    const anden = beregnTidsinterval({
      startTid: raekke.andenStart,
      slutTid: raekke.andenSlut,
    })!;
    // Fælden: de to rum støder op ad hinanden, så 16:45 er begge steders
    // sluttid/starttid. Tælles den med to gange, bliver svaret 13:45.
    expect(raekke.forsteSlut).toBe(raekke.andenStart);
    expect(foerste.minutter).toBe(15);
    expect(anden.minutter).toBe(15);
    const sum = summerTidsrum(raekke)!;
    expect(sum.totalMinutter).toBe(495 + 315);
    expect(sum.minutter).toBe(30);
  });

  test("et ugyldigt klokkeslæt giver null i stedet for et tal", () => {
    const ugyldig = { ...findRaekke("to_vagter"), andenSlut: "25:00" };
    expect(summerTidsrum(ugyldig)).toBeNull();
  });

  test("ingen række må have en pause, der gør et af rummene negative", () => {
    for (const raekke of TIDS_SUMMER) {
      const resultat = summerTidsrum(raekke);
      expect(resultat).not.toBeNull();
      expect(resultat!.totalMinutter).toBeGreaterThan(0);
    }
  });
});

describe("Excel-formlerne på /tidsberegner", () => {
  test("EXCEL_SUM_FORMEL giver præcis summerTidsrum på den række uden pause", () => {
    const raekke = findRaekke("to_vagter");
    const sum = summerTidsrum(raekke)!;
    const formel = excelSum("08:30", "16:45", "16:45", "22:00");
    expect(formel).toBeCloseTo(sum.decimalTimer, 10);
  });

  test("EXCEL_SUM_MED_PAUSE giver præcis summerTidsrum på de to rækker med pause", () => {
    const uke = summerTidsrum(findRaekke("arbejdsuge"))!;
    expect(excelSum("08:00", "16:00", "09:00", "17:00", 0.5, 0.5)).toBeCloseTo(
      uke.decimalTimer,
      10
    );

    const pause = summerTidsrum(findRaekke("pause_storre_end_en_time"))!;
    expect(excelSum("09:00", "17:00", "10:00", "18:00", 1.5, 0)).toBeCloseTo(
      pause.decimalTimer,
      10
    );
  });

  test("formlerne er de strenge brødtekken skriver, tegn for tegn", () => {
    // Formlerne står i indekseret tekst, så et kodet tegn (f.eks. ; mod ,)
    // ville være en løgn på siden. Samme krav som C119's arealeksempler.
    expect(EXCEL_SUM_FORMEL).toBe("=(B1-A1)*24+(D1-C1)*24");
    expect(EXCEL_SUM_MED_PAUSE).toBe("=(B1-A1)*24+(D1-C1)*24-E1-E2");
  });

  test("formlerne bruger de samme celler som sidens øvrige Excel-afsnit (A1/B1)", () => {
    // Excel-afsnittet på /tidsberegner bruger A1 og B1; en ny sumelformel der
    // brugte C1 og D1 alene ville se ud som et andet regnestykke.
    expect(EXCEL_SUM_FORMEL).toContain("A1");
    expect(EXCEL_SUM_FORMEL).toContain("B1");
    expect(EXCEL_SUM_MED_PAUSE).toContain("A1");
  });
});

describe("formatDoegn", () => {
  test("skriver komma i begge sprog, fordi det er den tekst Google indekserer", () => {
    expect(formatDoegn(0.625, "da")).toBe("0,63 døgn");
    expect(formatDoegn(0.625, "se")).toBe("0,63 dygn");
  });

  test("runder til to decimaler, så tre rækker har samme længde", () => {
    for (const raekke of TIDS_SUMMER) {
      const tekst = formatDoegn(summerTidsrum(raekke)!.heleDoegn, "da");
      expect(tekst).toMatch(/^0,\d{2} døgn$/);
    }
  });

  test("svensk enhed må ikke indeholde æ eller ø", () => {
    // C73's R4: svensk skriver aldrig nogen af dem, så reglen kan ikke give
    // falske fund.
    expect(formatDoegn(1, "se")).not.toMatch(/[æø]/);
  });
});

describe("TIDS_SUMMER", () => {
  test("de tre rækker er præcis de tre, siden viser", () => {
    // Tallet er håndskrevet, så en ny række i modulet uden tilsvarende
    // tabelrække på siden ville være vakuum-grøn. Samme lære som C165's
    // koblingstest.
    expect(TIDS_SUMMER.map((r) => r.id)).toEqual([
      "arbejdsuge",
      "to_vagter",
      "pause_storre_end_en_time",
    ]);
  });

  test("alle klokkeslæt er gyldige HH:MM", () => {
    for (const raekke of TIDS_SUMMER) {
      for (const tid of [
        raekke.forsteStart,
        raekke.forsteSlut,
        raekke.andenStart,
        raekke.andenSlut,
      ]) {
        expect(tid).toMatch(/^\d{1,2}:\d{2}$/);
      }
    }
  });

  test("begge sprog har en bemærkning på hver række", () => {
    for (const raekke of TIDS_SUMMER) {
      expect(raekke.bemaerkingDa.length).toBeGreaterThan(10);
      expect(raekke.bemaerkingSe.length).toBeGreaterThan(10);
    }
  });

  test("den svenske bemærkning må ikke indeholde æ eller ø", () => {
    for (const raekke of TIDS_SUMMER) {
      expect(raekke.bemaerkingSe).not.toMatch(/[æø]/);
    }
  });
});
