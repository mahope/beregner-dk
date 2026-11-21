import { describe, test, expect } from "vitest";
import {
  beregnGrundavdrag,
  beregnJobbskatteavdrag,
  beregnSvenskSkatt,
  kommunalskattSkillnadPerManad,
  SVENSK_SKATT_2026 as S,
  SVENSK_SKATT_TAL,
} from "./svensk-skatt";

// Values verified against Skatteverket SKV 433 (utgåva 36), inkomstår 2026.
describe("beregnGrundavdrag (2026, under 66)", () => {
  test("tier boundaries match the official table", () => {
    expect(beregnGrundavdrag(55000)).toBe(25100); // 0,423 PBB → 25 041,6, ceil 100
    expect(beregnGrundavdrag(170000)).toBe(45600); // 0,423 PBB + 20% over 0,99 PBB
    expect(beregnGrundavdrag(175000)).toBe(45600); // plateau 0,77 PBB = 45 584
    expect(beregnGrundavdrag(400000)).toBe(24000); // 0,77 PBB − 10% over 3,11 PBB
    expect(beregnGrundavdrag(700000)).toBe(17400); // floor 0,293 PBB = 17 345,6
  });
  test("never exceeds income", () => {
    expect(beregnGrundavdrag(10000)).toBeLessThanOrEqual(10000);
  });
});

describe("beregnJobbskatteavdrag (2026, under 66)", () => {
  test("plateaus near the 2026 maximum (~52 400 kr) for high incomes", () => {
    const jsa = beregnJobbskatteavdrag(900000, 17400, S.kommunalskattSnitt);
    expect(jsa).toBeGreaterThan(51000);
    expect(jsa).toBeLessThan(53000);
  });
  test("is zero for zero underlag", () => {
    expect(beregnJobbskatteavdrag(0, 0, S.kommunalskattSnitt)).toBe(0);
  });
});

describe("beregnSvenskSkatt", () => {
  test("returns null for non-positive income", () => {
    expect(beregnSvenskSkatt(0)).toBeNull();
    expect(beregnSvenskSkatt(-5)).toBeNull();
  });

  test("typical salary 400 000 kr/år: ~20% effective, no state tax", () => {
    const r = beregnSvenskSkatt(400000, S.kommunalskattSnitt)!;
    expect(r.statligSkatt).toBe(0);
    expect(r.grundavdrag).toBe(24000);
    expect(r.beskattningsbar).toBe(376000);
    expect(r.publicService).toBe(S.publicServiceMax);
    expect(r.effektivSkattProcent).toBeGreaterThan(18);
    expect(r.effektivSkattProcent).toBeLessThan(22);
    expect(r.nettoMaaned).toBeGreaterThan(26000);
    expect(r.nettoMaaned).toBeLessThan(27500);
  });

  test("state tax starts just above the 2026 brytpunkt (~660 400 kr)", () => {
    expect(beregnSvenskSkatt(650000)!.statligSkatt).toBe(0);
    expect(beregnSvenskSkatt(680000)!.statligSkatt).toBeGreaterThan(0);
  });

  test("high income 800 000 kr: state tax applies, effective ~28-31%", () => {
    const r = beregnSvenskSkatt(800000, S.kommunalskattSnitt)!;
    expect(r.statligSkatt).toBeGreaterThan(20000);
    expect(r.effektivSkattProcent).toBeGreaterThan(27);
    expect(r.effektivSkattProcent).toBeLessThan(32);
  });

  test("kyrkoavgift increases tax", () => {
    const utan = beregnSvenskSkatt(400000, S.kommunalskattSnitt, false)!;
    const med = beregnSvenskSkatt(400000, S.kommunalskattSnitt, true)!;
    expect(med.summaSkatt).toBeGreaterThan(utan.summaSkatt);
  });

  test("higher municipal rate yields lower net", () => {
    const laag = beregnSvenskSkatt(400000, 0.29)!;
    const hoej = beregnSvenskSkatt(400000, 0.35)!;
    expect(hoej.nettoAar).toBeLessThan(laag.nettoAar);
  });
});

/**
 * Punkt 11: påstande i tekst er kode. `/lon-efter-skatt` skrev grundavdragets
 * spænd, skiktgrænsen, brytpunkten og jobbskatteavdragets maksimum i hånden i
 * både brødteksten og FAQ'en, mens kalkylatoren regnede sit eget tal. Disse tal
 * er nu udledt af modellen — testen dømmer, at udledningen faktisk er den, der
 * beskrives, så et satsskift ikke kan efterlade en forkert brødtekst.
 */
describe("SVENSK_SKATT_TAL — de tal siden citerer", () => {
  test("grundavdragets spænd er hentet på de punkter, hvor kurven knækker", () => {
    // 0,293 PBB er det laveste (over 7,88 PBB), 0,77 PBB det højeste (3,11 PBB).
    expect(SVENSK_SKATT_TAL.grundavdragMin).toBe(beregnGrundavdrag(10 * S.prisbasbelopp));
    expect(SVENSK_SKATT_TAL.grundavdragMax).toBe(beregnGrundavdrag(3.11 * S.prisbasbelopp));
    expect(SVENSK_SKATT_TAL.grundavdragMin).toBe(17400);
    expect(SVENSK_SKATT_TAL.grundavdragMax).toBe(45600);
    // Spændet er et spænd, ikke et lig: min < max.
    expect(SVENSK_SKATT_TAL.grundavdragMin).toBeLessThan(SVENSK_SKATT_TAL.grundavdragMax);
  });

  test("statligBrytpunkt er præcis den laveste bruttoløn med statlig skatt", () => {
    // Skiktgrænsen + grundavdraget på det niveau (0,293 PBB over 7,88 PBB).
    expect(SVENSK_SKATT_TAL.statligBrytpunkt).toBe(660400);
    expect(SVENSK_SKATT_TAL.statligBrytpunkt).toBe(
      S.skiktgrans + SVENSK_SKATT_TAL.grundavdragMin
    );
    // Dømmer på modellen, ikke på tallet: netop her er statlig skatt stadig 0.
    expect(beregnSvenskSkatt(SVENSK_SKATT_TAL.statligBrytpunkt)!.statligSkatt).toBe(0);
    expect(beregnSvenskSkatt(SVENSK_SKATT_TAL.statligBrytpunkt + 100)!.statligSkatt).toBeGreaterThan(0);
    // Og den beskriver sig selv som skiktgrænsen, ikke som en anden størrelse.
    expect(beregnSvenskSkatt(SVENSK_SKATT_TAL.statligBrytpunkt)!.beskattningsbar).toBe(S.skiktgrans);
  });

  test("jobbskatteavdragets maksimum pr. måned er modellens egen, afrundet opad", () => {
    const top = beregnJobbskatteavdrag(
      900000,
      beregnGrundavdrag(900000),
      S.kommunalskattSnitt
    );
    const prMaaned = top / 12;
    expect(SVENSK_SKATT_TAL.jobbskatteavdragMaxManad).toBe(4400);
    // Teksten siger «cirka», så tallet er afrundet til hundrede — aldrig ned.
    expect(SVENSK_SKATT_TAL.jobbskatteavdragMaxManad).toBeGreaterThanOrEqual(
      Math.floor(prMaaned / 100) * 100
    );
    expect(SVENSK_SKATT_TAL.jobbskatteavdragMaxManad).toBeLessThanOrEqual(
      Math.ceil(prMaaned / 100) * 100
    );
  });

  test("publicServiceMax er loftet i modulen, ikke et tal ved siden af", () => {
    expect(SVENSK_SKATT_TAL.publicServiceMax).toBe(S.publicServiceMax);
  });
});

describe("kommunalskattSkillnadPerManad", () => {
  test("er forskellen mellem laveste og højeste kommunalskatt, delt på tolv", () => {
    const arsloen = 420000;
    const forskel = Math.round(
      (beregnSvenskSkatt(arsloen, 0.29)!.nettoAar - beregnSvenskSkatt(arsloen, 0.35)!.nettoAar) / 12
    );
    expect(kommunalskattSkillnadPerManad(arsloen)).toBe(forskel);
  });

  test("«flera hundra kronor» underdriver den: 35 000 kr/mån giver over 1 000", () => {
    expect(kommunalskattSkillnadPerManad(35000 * 12)).toBeGreaterThan(1000);
  });

  test("är 0 for en lön på 0 i stället för NaN", () => {
    expect(kommunalskattSkillnadPerManad(0)).toBe(0);
  });
});
