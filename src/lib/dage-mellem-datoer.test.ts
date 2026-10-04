// Tiden låses, fordi `dageTilDecember` læser dagens dato — ellers ville
// porten kun være grøn på den dag den er skrevet, og dagen efter ville
// `new Date()` give et andet svar end de forventede tal.
process.env.TZ = "Europe/Copenhagen";

import { describe, expect, test } from "vitest";
import { dageTilDecember } from "./dage-mellem-datoer";

/** En dato ved **dagens** klokkeslæt i sidens egen tidszone. */
function dag(iso: string): Date {
  const [aar, maaned, dato] = iso.split("-").map(Number);
  return new Date(aar, maaned - 1, dato, 12, 0, 0);
}

describe("dageTilDecember", () => {
  // /dato har 131.320 visninger og 0,7 % CTR, og GSC's to største søgninger
  // er «hvor mange dage er der til 1 december» (1.219 v, pos. 5) og «hvor
  // mange dage er der til den 24 december» (1.001 v, pos. 5). Titlen skal
  // derfor regne nedtællingen — og den gjorde det ikke før 4/10, da den skrev
  // «1. jan. 2026→2027 = 365», et interval der i svensk læses som «365 dage
  // kvar». Tallene her er modbevis mod den gamle kode: `heleDageMellem` giver
  // præcis disse tal, og 58 er det der står i `metaTitle` 4/10.
  test("dansk: 4/10 2026 er der 58 dage til 1. december", () => {
    const e = dageTilDecember("da", dag("2026-10-04"));
    expect(e.dage).toBe(58);
    expect(e.decemberIso).toBe("2026-12-01");
    expect(e.decemberTekst).toBe("1. december");
    expect(e.kort).toBe("58 dage");
  });

  test("svensk: samme dag, eget format", () => {
    const e = dageTilDecember("se", dag("2026-10-04"));
    expect(e.dage).toBe(58);
    expect(e.decemberTekst).toBe("1 december");
    expect(e.kort).toBe("58 dagar");
  });

  // Nyårsdag er det længste interval i året, og det er det kun 333 dage fordi
  // 2027 ikke er skudår — en titel der siger «365 dage tilbage» i januar
  // ville være den samme løgn som den gamle titel var i svensk.
  test("januar: der er 333 dage til 1. december 2027", () => {
    expect(dageTilDecember("da", dag("2027-01-02")).dage).toBe(333);
  });

  // Skudår: februar har 29 dage, så 2028 har **334** dage fra 2. januar.
  // Den gamle titel skrev «= 365» som håndskrevet bogstav, altså ville den
  // have sagt 365 for et interval der er 366 dage.
  test("skudår: 2/1 2028 er der 334 dage til 1. december", () => {
    expect(dageTilDecember("da", dag("2028-01-02")).dage).toBe(334);
  });

  // På selve 1. december må titlen ikke sige «0 dage» — «hvor mange dage er der
  // til 1. december» spørger på den næste, og det er næste år.
  test("på 1. december regnes der til næste år, ikke til 0 dage", () => {
    const e = dageTilDecember("da", dag("2026-12-01"));
    expect(e.decemberIso).toBe("2027-12-01");
    expect(e.dage).toBe(365);
    expect(e.kort).not.toBe("0 dage");
  });

  // Tæt på skiftet: 30/11 er 1 dag, 2/12 er 364 dage. Uden denne er en
  // fasefejl i `>=` usynlig, fordi de øvrige tal stadig er plausible.
  test("dagen før og dagen efter 1. december", () => {
    expect(dageTilDecember("da", dag("2026-11-30")).dage).toBe(1);
    expect(dageTilDecember("da", dag("2026-12-02")).dage).toBe(364);
  });

  // Tallene i `Intl` afhænger af default-locale på maskinen, så datoens navn
  // dømmes på den del, der er sproget: «december» i begge, med punktum kun på
  // dansk.
  test("datoens navn er ikke formateret med årets første dag", () => {
    const e = dageTilDecember("da", dag("2026-10-04"));
    expect(e.decemberTekst).not.toMatch(/2026/);
    expect(e.decemberTekst.toLowerCase()).toContain("december");
  });
});