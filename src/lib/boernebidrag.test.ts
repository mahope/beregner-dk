import { describe, expect, test } from "vitest";
import {
  BOERNEBIDRAG_2026,
  FRADRAGSVAERDI_PCT,
  INDKOMSTNIVEUER_2026,
  MAX_ANTAL_BOERN,
  boernebidragEksempel,
  beregnBoernebidrag,
  formaterGrae,
  niveauForIndomst,
  skattefradragFor,
} from "./boernebidrag";

describe("satser for 2026", () => {
  test("normalbidraget er grundbeløb plus tillæg", () => {
    expect(BOERNEBIDRAG_2026.grundbeloebMaaned + BOERNEBIDRAG_2026.tillaegMaaned).toBe(
      BOERNEBIDRAG_2026.normalbidragMaaned,
    );
  });

  test("årstallene er månedstallene gange 12", () => {
    expect(BOERNEBIDRAG_2026.grundbeloebAar).toBe(BOERNEBIDRAG_2026.grundbeloebMaaned * 12);
    expect(BOERNEBIDRAG_2026.tillaegAar).toBe(BOERNEBIDRAG_2026.tillaegMaaned * 12);
  });

  test("indkomstniveauerne stiger med antal børn og med niveau", () => {
    for (let i = 1; i < MAX_ANTAL_BOERN; i += 1) {
      for (const niveau of [100, 200, 300] as const) {
        expect(INDKOMSTNIVEUER_2026[niveau][i]).toBeGreaterThan(
          INDKOMSTNIVEUER_2026[niveau][i - 1],
        );
      }
      expect(INDKOMSTNIVEUER_2026[300][i]).toBeGreaterThan(INDKOMSTNIVEUER_2026[100][i]);
    }
  });
});

describe("niveauForIndomst", () => {
  test("under den første grænse er der intet procenttillæg", () => {
    expect(niveauForIndomst(0, 1)).toBe(0);
    expect(niveauForIndomst(599_999, 1)).toBe(0);
  });

  test("grænsen udløser niveauet, et kroner under gør ikke", () => {
    // Ét barn: 100 % fra 600.000, 200 % fra 900.000, 300 % fra 1.600.000.
    expect(niveauForIndomst(600_000, 1)).toBe(100);
    expect(niveauForIndomst(599_999, 1)).toBe(0);
    expect(niveauForIndomst(900_000, 1)).toBe(200);
    expect(niveauForIndomst(1_599_999, 1)).toBe(200);
    expect(niveauForIndomst(1_600_000, 1)).toBe(300);
  });

  test("flere børn hæver grænsen", () => {
    // 600.000 er 100 % for ét barn (græns 600.000), men under 100 %-grænsen
    // for to børn (690.000). Og 1.000.000 er 200 % for to børn, mens det
    // for ét barn kun er 100 % (grænsen til 200 % er 900.000).
    expect(niveauForIndomst(600_000, 1)).toBe(100);
    expect(niveauForIndomst(600_000, 2)).toBe(0);
    expect(niveauForIndomst(689_999, 2)).toBe(0);
    expect(niveauForIndomst(690_000, 2)).toBe(100);
    expect(niveauForIndomst(1_000_000, 2)).toBe(200);
    expect(niveauForIndomst(1_000_000, 1)).toBe(200);
    // 300 %-grænsen er 1,6 mio. for ét barn, 1,9 mio. for to og 2,2 mio. for
    // tre — så 1,9 mio. er 300 % for to børn, men kun 200 % for ét og tre.
    expect(niveauForIndomst(1_599_999, 1)).toBe(200);
    expect(niveauForIndomst(1_600_000, 1)).toBe(300);
    expect(niveauForIndomst(1_900_000, 1)).toBe(300);
    expect(niveauForIndomst(1_900_000, 2)).toBe(300);
    expect(niveauForIndomst(1_900_000, 3)).toBe(200);
  });

  test("antal børn holdes mellem 1 og indkomstoversigtens kolonner", () => {
    expect(niveauForIndomst(600_000, 0)).toBe(100);
    expect(niveauForIndomst(600_000, -3)).toBe(100);
    // Seks børn bruger fembørns-kolonnen, fordi oversigten ikke har en sjette.
    expect(niveauForIndomst(600_000, 6)).toBe(niveauForIndomst(600_000, MAX_ANTAL_BOERN));
  });
});

describe("beregnBoernebidrag", () => {
  test("uten procenttillæg er bidraget normalbidraget pr. barn", () => {
    const r = beregnBoernebidrag({ antalBorn: 2, aarligIndomst: 500_000 });
    expect(r.niveauPct).toBe(0);
    expect(r.bidragPrBarnMaaned).toBe(1675);
    expect(r.bidragSamletMaaned).toBe(3350);
    expect(r.bidragSamletAar).toBe(40_200);
  });

  test("procenttillægget regnes kun af grundbeløbet", () => {
    // Familieretshusets eget eksempel: 610.000 kr. og ét barn giver
    // 1.483 + 1.483 + 192 = 3.158 kr. Hvis tillægget var regnet af hele
    // normalbidraget, blev det 1.675 + 1.675 + 192 = 3.542.
    const r = beregnBoernebidrag({ antalBorn: 1, aarligIndomst: 610_000 });
    expect(r.niveauPct).toBe(100);
    expect(r.procentsTillaegMaaned).toBe(1483);
    expect(r.bidragPrBarnMaaned).toBe(3158);
  });

  test("300 % giver 1.483 + 4.449 + 192", () => {
    const r = beregnBoernebidrag({ antalBorn: 1, aarligIndomst: 1_700_000 });
    expect(r.niveauPct).toBe(300);
    expect(r.procentsTillaegMaaned).toBe(4449);
    expect(r.bidragPrBarnMaaned).toBe(6124);
  });

  test("alle børnene summeres", () => {
    const r = beregnBoernebidrag({ antalBorn: 3, aarligIndomst: 800_000 });
    expect(r.niveauPct).toBe(100);
    expect(r.bidragPrBarnMaaned).toBe(3158);
    expect(r.bidragSamletMaaned).toBe(9474);
    expect(r.bidragSamletAar).toBe(113_688);
  });

  test("næste niveau og afstanden til det følger indkomstoversigten", () => {
    const under = beregnBoernebidrag({ antalBorn: 1, aarligIndomst: 610_000 });
    expect(under.naesteNiveauPct).toBe(200);
    expect(under.naesteGrae).toBe(900_000);
    expect(under.manglerTilNaeste).toBe(290_000);

    const paa = beregnBoernebidrag({ antalBorn: 1, aarligIndomst: 900_000 });
    expect(paa.naesteNiveauPct).toBe(300);
    expect(paa.naesteGrae).toBe(1_600_000);
    expect(paa.manglerTilNaeste).toBe(700_000);

    const over = beregnBoernebidrag({ antalBorn: 1, aarligIndomst: 2_000_000 });
    expect(over.naesteNiveauPct).toBe(0);
    expect(over.manglerTilNaeste).toBe(0);
  });

  test("indkomst og antal børn renses for urimelige værdier", () => {
    const r = beregnBoernebidrag({ antalBorn: Number.NaN, aarligIndomst: -100 });
    expect(r.antalBorn).toBe(1);
    expect(r.aarligIndomst).toBe(0);
    expect(r.bidragPrBarnMaaned).toBe(1675);
  });
});

describe("skattefradrag", () => {
  test("normalbidraget giver fradrag for grundbeløbet", () => {
    expect(skattefradragFor(1675)).toBe(1483);
  });

  test("et aftalt beløb giver beløbet minus tillægget", () => {
    expect(skattefradragFor(1000)).toBe(808);
  });

  test("et beløb under tillægget giver intet fradrag", () => {
    expect(skattefradragFor(100)).toBe(0);
    expect(skattefradragFor(0)).toBe(0);
  });

  test("et forhøjet bidrag ikke giver mere fradrag end grundbeløbet", () => {
    // SKATs regel er skrevet for normalbidraget; et højere beløb giver ikke
    // større fradrag, fordi grundbeløbet ikke er skattepligtigt.
    expect(skattefradragFor(3158)).toBe(1483);
    expect(skattefradragFor(6124)).toBe(1483);
  });

  test("fradragsværdien i resultatet følger de 27 %", () => {
    const r = beregnBoernebidrag({ antalBorn: 2, aarligIndomst: 500_000 });
    expect(r.skattefradragMaaned).toBe(2966);
    expect(r.skatteBesparelseMaaned).toBeCloseTo((2966 * FRADRAGSVAERDI_PCT) / 100, 6);
    expect(r.skattefradragAar).toBe(r.skattefradragMaaned * 12);
    expect(r.skatteBesparelseAar).toBeCloseTo(r.skatteBesparelseMaaned * 12, 6);
  });
});

describe("formaterGrae", () => {
  test("beløb under en mio. skrives som hele kroner", () => {
    expect(formaterGrae(600_000)).toBe("ca. 600.000 kr.");
    expect(formaterGrae(910_000)).toBe("ca. 910.000 kr.");
  });

  test("beløb fra en mio. skrives som mio. med én decimal", () => {
    expect(formaterGrae(1_100_000)).toBe("ca. 1,1 mio. kr.");
    expect(formaterGrae(2_700_000)).toBe("ca. 2,7 mio. kr.");
  });
});

describe("eksemplet", () => {
  test("matcher Familieshusets eget regneeksempel for 2026", () => {
    const r = boernebidragEksempel();
    expect(r.antalBorn).toBe(1);
    expect(r.aarligIndomst).toBe(610_000);
    expect(r.niveauPct).toBe(100);
    expect(r.bidragPrBarnMaaned).toBe(3158);
  });
});
