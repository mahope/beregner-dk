import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { braendstofForudsætninger } from "@/lib/braendstof";
import {
  BIL_BRAENDSTOF,
  BIL_ESTIMATER,
  bilBelob,
  bilDaekHoldelighed,
  bilDriftsomkostninger,
  bilEnhedspris,
  bilInterval,
  bilKrPrKm,
  bilProcent,
  bilPrisPrKmSpaend,
  bilPrisPrKmSpaendTekst,
  bilRaekker,
  bilServiceomkostning,
  bilResultater,
  bilStandardindgange,
  beregnBilOmkostninger,
} from "@/lib/bil-omkostninger";

/**
 * `/bil` skrev 2/10 «2,00-2,50 kr» og «2,50-4,50 kr/km» i to tabeller, mens
 * `BilBeregner` med sine egne standardindgange viser 4,90 kr/km. Svensk var
 * en modsigelse af den anden slags: artiklen skrev «18-20 kr/liter» for
 * benzin, mens beregneren startede på 13,5 kr/liter på alle domæner.
 *
 * Testen dømmer derfor tre ting: at regnestykket er det værktøjet bruger, at
 * brændstofprisen er den `/braendstof` bruger, og at artiklen ikke længere
 * indeholder et eneste håndskrevet beløb — heller ikke i en streng i et prop,
 * som `regnestykker`-porten ikke ser.
 */
const ROT = join(__dirname, "..", "..");
const sidekilde = readFileSync(join(ROT, "src/app/bil/page.tsx"), "utf8");

describe("bil-omkostninger", () => {
  test("beregnerens sum er brændstof, forsikring, vægt, værditab, service og dæk", () => {
    const s = bilStandardindgange("da");
    const r = beregnBilOmkostninger({ ...s, braendstof: "benzin" }, "da");
    // 15.000 km / 15 km/l × 13,5 kr = 13.500 kr
    expect(r.braendstof).toBe(13500);
    expect(r.vaegt).toBe(4000);
    // 250.000 × 15 % = 37.500 kr, 250.000 × 3 % = 7.500 kr
    expect(r.vaerditab).toBe(37500);
    expect(r.service).toBe(7500);
    expect(r.daek).toBe(3000);
    expect(r.aarligt).toBe(13500 + 8000 + 4000 + 37500 + 7500 + 3000);
    expect(r.maanedligt).toBeCloseTo(r.aarligt / 12, 6);
    expect(r.prKm).toBeCloseTo(r.aarligt / 15000, 6);
  });

  test("elbilen regnes på kWh og har ingen benzinforbrug", () => {
    const s = bilStandardindgange("da");
    const r = beregnBilOmkostninger({ ...s, braendstof: "el" }, "da");
    // 17 kWh/100 km × 150 km × 2,5 kr = 6.375 kr
    expect(r.braendstof).toBeCloseTo(6375, 6);
    expect(r.vaegt).toBe(0);
    // Benzinen har 4.000 kr mere i vægt *og* 7.125 kr mere i brændstof, så
    // det er de to poster — ikke brændstoffet alene — der forklarer springet.
    const benzin = beregnBilOmkostninger({ ...s, braendstof: "benzin" }, "da");
    expect(benzin.aarligt - r.aarligt).toBeCloseTo(13500 - 6375 + 4000, 6);
  });

  test("værdierne i brødteksten er beregnerens egne, for hver brændstoftype", () => {
    const rækker = bilResultater("da");
    expect(rækker).toHaveLength(BIL_BRAENDSTOF.length);
    for (const [i, type] of BIL_BRAENDSTOF.entries()) {
      const svar = beregnBilOmkostninger({ ...bilStandardindgange("da"), braendstof: type }, "da");
      expect(rækker[i].aarligt, `brændstof ${type}`).toBe(svar.aarligt);
      expect(rækker[i].vaegt, `vægt ${type}`).toBe(bilDriftsomkostninger("da").vaegt[type]);
    }
    // 4,90 kr/km for benzin: 73.500 kr / 15.000 km.
    expect(rækker[0].prKm).toBeCloseTo(4.9, 6);
    const spænd = bilPrisPrKmSpaend("da");
    expect(spænd.fra).toBeCloseTo(4.158333333, 5);
    expect(spænd.til).toBeCloseTo(5, 6);
  });

  test("benzin- og elprisen er den /braendstof bruger, også på beraknare.se", () => {
    // Mutation: en hårdkodet 13,5 på svensk giver den danske pris, og testen
    // bliver rød — det var præcis fejlen, siden havde.
    for (const sprog of ["da", "se"] as const) {
      const standard = bilStandardindgange(sprog);
      const f = braendstofForudsætninger(sprog);
      expect(standard.braendstofpris, `brændstofpris ${sprog}`).toBe(f.benzin.literPris);
      expect(standard.elpris, `elpris ${sprog}`).toBe(f.el.kwhPris);
    }
    expect(bilStandardindgange("se").braendstofpris).toBeGreaterThan(
      bilStandardindgange("da").braendstofpris,
    );
  });

  test("beløb og intervaller skrives i sitets egen skrivemåde", () => {
    // `sv-SE` bruger U+00A0 som tusindtalsseparator, ikke U+0020 — samme
    // fælde som `intl-locale-tag`-porten låser for `nb-NO`.
    expect(bilBelob("da", 7500)).toBe("7.500 kr.");
    expect(bilBelob("se", 7500)).toBe("7\u00A0500 kr");
    expect(bilBelob("se", 7500)).not.toContain("7.500");
    expect(bilInterval("da", 1500, 4000)).toBe("1.500-4.000 kr.");
    expect(bilInterval("se", 1500, 4000)).toBe("1\u00A0500-4\u00A0000 kr");
    expect(bilDaekHoldelighed("da")).toBe("30.000-50.000 km");
    expect(bilDaekHoldelighed("se")).toBe("30\u00A0000-50\u00A0000 km");
    expect(BIL_ESTIMATER.daekHoldelighedKm.fra).toBe(30000);
  });

  test("servicebeløbet i artiklen er 3 % af bilens pris", () => {
    // Mutation: en fast sum (fx 3.000 kr.) ville give artiklen et tal, der ikke
    // følger bilprisen — præcis den fejl de håndskrevne intervaller havde.
    expect(bilServiceomkostning(250000, "da")).toBe(7500);
    expect(bilServiceomkostning(100000, "se")).toBe(3000);
    for (const række of bilRaekker("da")) {
      expect(række.service, `service for ${række.type}`).toBe(7500);
    }
  });

  test("prisen pr. kilometer står med to decimaler i begge sprog", () => {
    // Mutation: en frarunding til 4,16 mod cellens «4,9» ville se forkert ud
    // lige under sig selv i tabellen.
    expect(bilKrPrKm(4.9, "da")).toBe("4,90 kr.");
    expect(bilKrPrKm(4.9, "se")).toBe("4,90 kr");
    expect(bilPrisPrKmSpaendTekst("da", "da")).toBe("4,16-5,00 kr.");
    // Svensk har sin egen spændvidde: dyrere literpris, men 360 kr i
    // fordonsskatt på elbilen, så hybriden er billigst og diesel dyrest.
    expect(bilPrisPrKmSpaendTekst("se", "se")).toBe("4,10-5,27 kr");
    expect(bilEnhedspris(17.57, "se", "liter")).toBe("17,57 kr/liter");
    expect(bilEnhedspris(2.5, "da", "kWh")).toBe("2,5 kr/kWh");
    expect(bilProcent(3, "da")).toBe("3 %");
  });

  test("artiklens rækker hedder det samme på begge sprog og dækker fire typer", () => {
    const da = bilRaekker("da");
    const se = bilRaekker("se");
    expect(da.map((r) => r.type)).toEqual(BIL_BRAENDSTOF);
    expect(da.map((r) => r.navn)).toEqual(["Benzin", "Diesel", "Hybrid", "Elbil"]);
    expect(se.map((r) => r.navn)).toEqual(["Bensin", "Diesel", "Laddhybrid", "Elbil"]);
    // Svensk regner elbilen med en fordonsskatt, dansk uden — det er de to
    // steder, hvor artiklen før 2/10 modsagde beregneren.
    expect(da[3].vaegt).toBe(0);
    expect(se[3].vaegt).toBe(360);
  });

  test("artiklen har ikke ét eneste håndskrevet beløb tilbage", () => {
    // Helt filen, ikke kun JSX-tekst: `regnestykker`-porten ser kun `ts.isJsxText`,
    // så et beløb i en streng i et prop ville være usynligt for den. 2/10 stod
    // denne side med 16 fund i JSX-tekst — mutation: læg et «1.500 kr» tilbage
    // i en attribut, og denne test bliver rød.
    const fund = sidekilde.match(/\d{1,3}[. ]\d{3}(?!\d)/g) ?? [];
    expect(fund, `håndskrevne beløb i artiklen: ${fund.join(", ")}`).toHaveLength(0);
  });

  test("artiklen læser sine tal fra modulet", () => {
    expect(sidekilde).toContain("bil-omkostninger");
    expect(sidekilde).toContain("bilRaekker");
  });
});
