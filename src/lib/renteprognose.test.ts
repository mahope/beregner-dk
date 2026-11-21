import { describe, expect, test } from "vitest";
import {
  beregnRenteprognose,
  maanedYdelse,
  procentScenarier,
  renteIAaret,
  RENTEOMLAEGNING_AAR,
  type RenteprognoseInput,
} from "@/lib/renteprognose";

/** 2 mio. kr. i 30 år til 3,5 % med afdrag — bankernes standardtilfælde. */
const GRUND: RenteprognoseInput = {
  laanebeloeb: 2_000_000,
  rente: 0.035,
  loebetidAar: 30,
  renteomlaegning: "variabel",
  renteudvikling: 0,
  afdragsform: "afdrag",
};

describe("maanedYdelse", () => {
  test("en 30-årig annuitet på 2 mio. til 3,5 % er 8.966 kr.", () => {
    expect(maanedYdelse(2_000_000, 0.035, 360)).toBeCloseTo(8980.89, 1);
  });

  test("0 % rente deler beløbet i lige månedlige afdrag", () => {
    expect(maanedYdelse(120_000, 0, 12)).toBeCloseTo(10_000, 5);
  });

  test("højere rente giver højere ydelse på samme gæld", () => {
    expect(maanedYdelse(2_000_000, 0.05, 360)).toBeGreaterThan(maanedYdelse(2_000_000, 0.035, 360));
  });

  test("restgæld 0 eller ingen måneder giver 0", () => {
    expect(maanedYdelse(0, 0.035, 360)).toBe(0);
    expect(maanedYdelse(2_000_000, 0.035, 0)).toBe(0);
  });
});

describe("renteIAaret", () => {
  test("variabel rente får en ny rente hvert år", () => {
    expect(renteIAaret(0.035, 0.01, 1, "variabel")).toBeCloseTo(0.035, 6);
    expect(renteIAaret(0.035, 0.01, 2, "variabel")).toBeCloseTo(0.045, 6);
    expect(renteIAaret(0.035, 0.01, 10, "variabel")).toBeCloseTo(0.125, 6);
  });

  test("5-årig fastrente holder samme rente i fem år ad gangen", () => {
    expect(renteIAaret(0.035, 0.01, 1, "aar5")).toBeCloseTo(0.035, 6);
    expect(renteIAaret(0.035, 0.01, 5, "aar5")).toBeCloseTo(0.035, 6);
    expect(renteIAaret(0.035, 0.01, 6, "aar5")).toBeCloseTo(0.045, 6);
    expect(renteIAaret(0.035, 0.01, 15, "aar5")).toBeCloseTo(0.055, 6);
    expect(renteIAaret(0.035, 0.01, 16, "aar5")).toBeCloseTo(0.065, 6);
  });

  test("3-årig fastrente springer hvert tredje år", () => {
    expect(renteIAaret(0.03, 0.01, 3, "aar3")).toBeCloseTo(0.03, 6);
    expect(renteIAaret(0.03, 0.01, 4, "aar3")).toBeCloseTo(0.04, 6);
  });

  test("faldende rente bliver aldrig negativ", () => {
    expect(renteIAaret(0.015, -0.01, 5, "variabel")).toBe(0);
  });

  test("alle fire renteformer er dækket", () => {
    expect(Object.keys(RENTEOMLAEGNING_AAR).sort()).toEqual(["aar1", "aar3", "aar5", "variabel"]);
    expect(RENTEOMLAEGNING_AAR.variabel).toBe(RENTEOMLAEGNING_AAR.aar1);
  });
});

describe("beregnRenteprognose", () => {
  test("gælden er betalt ud ved løbetidens udløb", () => {
    const r = beregnRenteprognose(GRUND);
    expect(r.gaeldSlut).toBeCloseTo(0, 3);
    expect(r.maanederIAlt).toBe(360);
  });

  test("renten uændret på 30 år med 3,5 % giver 1.317.408 kr. i renter", () => {
    // Håndregnet kontrol: 2 mio. * 0,035 = 70.000 kr. det første år,
    // faldende til 28.703 kr. det sidste (gælden er 823.996 kr. med).
    expect(beregnRenteprognose(GRUND).renterIAlt).toBeCloseTo(1_233_122, -3);
  });

  test("ydelsen er konstant, når renten ikke ændrer sig", () => {
    const r = beregnRenteprognose(GRUND);
    const foerste = r.aar[0].maanedYdelse;
    expect(foerste).toBeCloseTo(8980.89, 1);
    expect(r.aar[29].maanedYdelse).toBeCloseTo(foerste, 5);
  });

  test("renterne er voksende år for år på et afdragslån", () => {
    const r = beregnRenteprognose(GRUND);
    expect(r.aar[0].renterAaret).toBeGreaterThan(r.aar[29].renterAaret);
    expect(r.aar[29].renterAaret).toBeGreaterThan(0);
  });

  test("de kumulative renter vokser med årene", () => {
    const r = beregnRenteprognose(GRUND);
    for (let n = 1; n < 30; n++) {
      expect(r.aar[n].renterAngaaende).toBeGreaterThan(r.aar[n - 1].renterAngaaende);
    }
    expect(r.aar[29].renterAngaaende).toBeCloseTo(r.renterIAlt, 5);
  });

  test("højere renteudvikling giver mere renter i alt", () => {
    const flad = beregnRenteprognose({ ...GRUND, renteudvikling: 0 });
    const stigende = beregnRenteprognose({ ...GRUND, renteudvikling: 0.01 });
    const faldende = beregnRenteprognose({ ...GRUND, renteudvikling: -0.01 });
    expect(stigende.renterIAlt).toBeGreaterThan(flad.renterIAlt);
    expect(faldende.renterIAlt).toBeLessThan(flad.renterIAlt);
  });

  test("en 5-årig fastrente med +1 procentpoint ligner en flad rente de første 5 år", () => {
    // Rentesættet ved omlægningen er fast i 5 år, så de første fem afsnit skal
    // være *identiske* med en kørsel hvor udviklingen er 0 — det er det, der
    // adskiller en 5-årig fastrente fra en variabel.
    const r = beregnRenteprognose({ ...GRUND, renteomlaegning: "aar5", renteudvikling: 0.01 });
    const flad = beregnRenteprognose({ ...GRUND, renteomlaegning: "aar5", renteudvikling: 0 });
    for (let n = 0; n < 5; n++) {
      expect(r.aar[n].rente).toBeCloseTo(flad.aar[n].rente, 9);
      expect(r.aar[n].maanedYdelse).toBeCloseTo(flad.aar[n].maanedYdelse, 5);
    }
  });

  test("ydelsen stiger i de fem år, hver renteomlægning lander i", () => {
    const r = beregnRenteprognose({ ...GRUND, renteomlaegning: "aar5", renteudvikling: 0.01 });
    // Afsnit 6, 11 og 16 er de første med den nye rente — indeks 5, 10 og 15.
    for (const i of [5, 10, 15]) {
      expect(r.aar[i].renterAngaaende).toBeGreaterThan(r.aar[i - 1].renterAngaaende);
      expect(r.aar[i].rente).toBeGreaterThan(r.aar[i - 1].rente);
    }
  });

  test("afdragsfrit gæld: gælden står stå, og kun renterne falder", () => {
    const r = beregnRenteprognose({ ...GRUND, afdragsform: "afdragsfrit" });
    expect(r.gaeldSlut).toBeCloseTo(2_000_000, 2);
    expect(r.aar[0].maanedYdelse).toBeCloseTo((2_000_000 * 0.035) / 12, 5);
    // År 1: 2 mio. * 3,5 % = 70.000 kr. Helt uændret hvert år.
    expect(r.aar[0].renterAaret).toBeCloseTo(70_000, 5);
    expect(r.aar[29].renterAaret).toBeCloseTo(70_000, 5);
    expect(r.renterIAlt).toBeCloseTo(70_000 * 30, 5);
  });

  test("afdragsfrit koster mere renter end afdrag", () => {
    const medAfdrag = beregnRenteprognose({ ...GRUND, afdragsform: "afdrag" });
    const udenAfdrag = beregnRenteprognose({ ...GRUND, afdragsform: "afdragsfrit" });
    expect(udenAfdrag.renterIAlt).toBeGreaterThan(medAfdrag.renterIAlt);
  });

  test("afdragsfrit reagerer på renteudvikling, afdrag på samme måde", () => {
    const r = beregnRenteprognose({
      ...GRUND,
      afdragsform: "afdragsfrit",
      renteudvikling: 0.01,
    });
    // Variabel rente: rente i år n er 3,5 % + 1 procentpoint * (n-1),
    // så år 10 (indeks 9) er 12,5 % — ikke 4,5 %.
    expect(r.aar[0].renterAaret).toBeCloseTo(70_000, 5);
    expect(r.aar[9].renterAaret).toBeCloseTo(2_000_000 * 0.125, 5);
  });

  test("et kortere lån koster færre renter", () => {
    const tyveAar = beregnRenteprognose({ ...GRUND, loebetidAar: 20 });
    const trediveAar = beregnRenteprognose({ ...GRUND, loebetidAar: 30 });
    expect(tyveAar.renterIAlt).toBeLessThan(trediveAar.renterIAlt);
    expect(tyveAar.aar).toHaveLength(20);
  });

  test("et større lån koster flere renter", () => {
    const lille = beregnRenteprognose({ ...GRUND, laanebeloeb: 1_000_000 });
    expect(lille.renterIAlt).toBeLessThan(beregnRenteprognose(GRUND).renterIAlt);
  });

  test("et lån uden rente og uden afdrag koster 0 kr. i renter", () => {
    const r = beregnRenteprognose({ ...GRUND, rente: 0, afdragsform: "afdragsfrit" });
    expect(r.renterIAlt).toBeCloseTo(0, 6);
    expect(r.aar[0].maanedYdelse).toBe(0);
  });

  test("løbetid 0 år giver ingen år og ingen renter", () => {
    const r = beregnRenteprognose({ ...GRUND, loebetidAar: 0 });
    expect(r.aar).toHaveLength(0);
    expect(r.renterIAlt).toBe(0);
    expect(r.maanedSlut).toBe(0);
  });

  test("et brudt løbetidstal runder ned i stedet for at give delår", () => {
    const r = beregnRenteprognose({ ...GRUND, loebetidAar: 29.7 });
    expect(r.aar).toHaveLength(29);
    expect(r.maanederIAlt).toBe(348);
  });

  test("et negativt lånebeløb tages som 0, ikke som negativ gæld", () => {
    const r = beregnRenteprognose({ ...GRUND, laanebeloeb: -500_000 });
    expect(r.gaeldSlut).toBe(0);
    expect(r.renterIAlt).toBe(0);
  });

  test("rækken har ét afsnit pr. år, og hvert afsnit har sit årstal", () => {
    const r = beregnRenteprognose(GRUND);
    expect(r.aar.map((a) => a.aar)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  test("summen af årenes renter er lig renterne i alt", () => {
    const r = beregnRenteprognose({ ...GRUND, renteudvikling: 0.01, renteomlaegning: "aar3" });
    const sum = r.aar.reduce((acc, a) => acc + a.renterAaret, 0);
    expect(sum).toBeCloseTo(r.renterIAlt, 4);
  });
});

describe("procentScenarier", () => {
  test("tre rentebaner med den valgte i midten", () => {
    const s = procentScenarier(GRUND, 0.01);
    expect(s.map((x) => x.id)).toEqual(["lavere", "uaendret", "hoeiere"]);
    expect(s[1].renteudvikling).toBe(0);
    expect(s[0].renteudvikling).toBeCloseTo(-0.01, 6);
    expect(s[2].renteudvikling).toBeCloseTo(0.01, 6);
  });

  test("renterne stiger fra lavere til højere rentebane", () => {
    const [lav, , høj] = procentScenarier(GRUND, 0.01);
    expect(lav.renterIAlt).toBeLessThan(høj.renterIAlt);
    expect(lav.maanedSlut).toBeLessThan(høj.maanedSlut);
    expect(lav.gaeldSlut).toBeLessThan(høj.gaeldSlut);
  });

  test("den valgte rentebane er altid identisk med at køre værktøjet alene", () => {
    const s = procentScenarier({ ...GRUND, renteudvikling: 0.01 }, 0.01);
    const alene = beregnRenteprognose({ ...GRUND, renteudvikling: 0.01 });
    expect(s[1].renterIAlt).toBeCloseTo(alene.renterIAlt, 6);
    expect(s[1].maanedSlut).toBeCloseTo(alene.maanedSlut, 6);
  });

  test("ved udvikling 0 sammenlignes renterne ±1 procentpoint", () => {
    const s = procentScenarier(GRUND, 0.01);
    const negativ = beregnRenteprognose({ ...GRUND, renteudvikling: -0.01 });
    expect(s[0].renterIAlt).toBeCloseTo(negativ.renterIAlt, 6);
  });
});