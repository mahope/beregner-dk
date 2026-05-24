import { describe, test, expect } from "vitest";

// =============================================================================
// Pure calculation logic tests — extracted from component useMemo blocks
// =============================================================================

// --- Moms (VAT 25%) ---
describe("Moms beregning", () => {
  const MOMS_SATS = 0.25;

  function beregnMomsTillaeg(beloeb: number) {
    const moms = beloeb * MOMS_SATS;
    return { prisInklMoms: beloeb + moms, moms };
  }

  function beregnMomsFratruek(beloebInkl: number) {
    const prisUdenMoms = beloebInkl / (1 + MOMS_SATS);
    const moms = beloebInkl - prisUdenMoms;
    return { prisUdenMoms, moms };
  }

  test("tillaeg moms paa 1000 kr", () => {
    const r = beregnMomsTillaeg(1000);
    expect(r.prisInklMoms).toBe(1250);
    expect(r.moms).toBe(250);
  });

  test("tillaeg moms paa 0 kr", () => {
    const r = beregnMomsTillaeg(0);
    expect(r.prisInklMoms).toBe(0);
    expect(r.moms).toBe(0);
  });

  test("fratraek moms fra 1250 kr", () => {
    const r = beregnMomsFratruek(1250);
    expect(r.prisUdenMoms).toBe(1000);
    expect(r.moms).toBe(250);
  });

  test("fratraek moms fra 100 kr", () => {
    const r = beregnMomsFratruek(100);
    expect(r.prisUdenMoms).toBe(80);
    expect(r.moms).toBe(20);
  });
});

// --- BMI ---
describe("BMI beregning", () => {
  function beregnBMI(vaegt: number, hoejdeCm: number) {
    const hoejdeM = hoejdeCm / 100;
    return vaegt / (hoejdeM * hoejdeM);
  }

  function bmiKategori(bmi: number): string {
    if (bmi < 18.5) return "Undervægtig";
    if (bmi < 25) return "Normalvægtig";
    if (bmi < 30) return "Overvægtig";
    if (bmi < 35) return "Fedme klasse I";
    if (bmi < 40) return "Fedme klasse II";
    return "Fedme klasse III";
  }

  function idealVaegt(hoejdeCm: number) {
    const h = hoejdeCm / 100;
    return { min: 18.5 * h * h, max: 24.9 * h * h };
  }

  test("BMI for 80 kg, 180 cm", () => {
    expect(beregnBMI(80, 180)).toBeCloseTo(24.69, 1);
  });

  test("BMI for 60 kg, 170 cm", () => {
    expect(beregnBMI(60, 170)).toBeCloseTo(20.76, 1);
  });

  test("BMI kategori normalvaegtig", () => {
    expect(bmiKategori(22)).toBe("Normalvægtig");
  });

  test("BMI kategori undervaegtig", () => {
    expect(bmiKategori(17)).toBe("Undervægtig");
  });

  test("BMI kategori overvaegtig", () => {
    expect(bmiKategori(27)).toBe("Overvægtig");
  });

  test("BMI kategori fedme klasse I", () => {
    expect(bmiKategori(32)).toBe("Fedme klasse I");
  });

  test("ideal vaegt for 180 cm", () => {
    const r = idealVaegt(180);
    expect(r.min).toBeCloseTo(59.94, 0);
    expect(r.max).toBeCloseTo(80.68, 0);
  });
});

// --- Løn efter skat (2026) ---
describe("Loen efter skat beregning", () => {
  const SATSER = {
    amBidrag: 0.08,
    bundskat: 0.1201,
    personfradrag: 54100,
    beskaeftigelsesfradragPct: 0.1275,
    beskaeftigelsesfradragMax: 63300,
    mellemskatGraense: 641200,
    mellemskatPct: 0.075,
    topskatGraense: 777900,
    topskatPct: 0.075,
    topTopskatGraense: 2592700,
    topTopskatPct: 0.05,
  };

  function beregnLoenEfterSkat(aarligBrutto: number, kommuneskatPct: number, kirkeskat: boolean, kirkeskatPct: number, pensionPct: number) {
    const pensionBidrag = aarligBrutto * (pensionPct / 100);
    const loenEfterPension = aarligBrutto - pensionBidrag;
    const amBidrag = loenEfterPension * SATSER.amBidrag;
    const loenEfterAM = loenEfterPension - amBidrag;

    const beskaeftigelsesfradrag = Math.min(loenEfterAM * SATSER.beskaeftigelsesfradragPct, SATSER.beskaeftigelsesfradragMax);
    const skattepligtig = Math.max(0, loenEfterAM - SATSER.personfradrag - beskaeftigelsesfradrag);

    const bundSkat = skattepligtig * SATSER.bundskat;
    const kommuneSkat = skattepligtig * (kommuneskatPct / 100);
    const kirkeSkatBeloeb = kirkeskat ? skattepligtig * (kirkeskatPct / 100) : 0;
    const mellemSkat = Math.max(0, loenEfterAM - SATSER.mellemskatGraense) * SATSER.mellemskatPct;
    const topSkat = Math.max(0, loenEfterAM - SATSER.topskatGraense) * SATSER.topskatPct;
    const topTopSkat = Math.max(0, loenEfterAM - SATSER.topTopskatGraense) * SATSER.topTopskatPct;

    const totalSkat = bundSkat + kommuneSkat + kirkeSkatBeloeb + mellemSkat + topSkat + topTopSkat;
    const netto = loenEfterAM - totalSkat;

    return {
      amBidrag: Math.round(amBidrag),
      loenEfterAM: Math.round(loenEfterAM),
      beskaeftigelsesfradrag: Math.round(beskaeftigelsesfradrag),
      skattepligtig: Math.round(skattepligtig),
      bundSkat: Math.round(bundSkat),
      kommuneSkat: Math.round(kommuneSkat),
      mellemSkat: Math.round(mellemSkat),
      topSkat: Math.round(topSkat),
      totalSkat: Math.round(totalSkat),
      nettoAarlig: Math.round(netto),
      nettoMaanedlig: Math.round(netto / 12),
    };
  }

  test("gennemsnitlig loen 500.000 kr, ingen pension, ingen kirkeskat", () => {
    const r = beregnLoenEfterSkat(500000, 25.07, false, 0, 0);
    expect(r.amBidrag).toBe(40000);
    expect(r.loenEfterAM).toBe(460000);
    expect(r.mellemSkat).toBe(0); // under grænsen
    expect(r.topSkat).toBe(0);
    expect(r.nettoAarlig).toBeGreaterThan(0);
    expect(r.nettoMaanedlig).toBeGreaterThan(0);
  });

  test("hoej loen 1.000.000 kr rammer mellemskat og topskat", () => {
    const r = beregnLoenEfterSkat(1000000, 25.07, false, 0, 0);
    expect(r.mellemSkat).toBeGreaterThan(0);
    expect(r.topSkat).toBeGreaterThan(0);
  });

  test("lav loen 200.000 kr — ingen skat under personfradrag", () => {
    const r = beregnLoenEfterSkat(200000, 25.07, false, 0, 0);
    expect(r.mellemSkat).toBe(0);
    expect(r.topSkat).toBe(0);
    // AM-bidrag betales altid
    expect(r.amBidrag).toBe(16000);
  });

  test("kirkeskat tillaegges korrekt", () => {
    const uden = beregnLoenEfterSkat(500000, 25.07, false, 0, 0);
    const med = beregnLoenEfterSkat(500000, 25.07, true, 0.68, 0);
    expect(med.totalSkat).toBeGreaterThan(uden.totalSkat);
    expect(med.nettoAarlig).toBeLessThan(uden.nettoAarlig);
  });

  test("pension reducerer brutto foer AM-bidrag", () => {
    const uden = beregnLoenEfterSkat(500000, 25.07, false, 0, 0);
    const med = beregnLoenEfterSkat(500000, 25.07, false, 0, 5);
    expect(med.amBidrag).toBeLessThan(uden.amBidrag);
  });

  test("0 kr i loen giver 0 i alt", () => {
    const r = beregnLoenEfterSkat(0, 25.07, false, 0, 0);
    expect(r.amBidrag).toBe(0);
    expect(r.nettoAarlig).toBe(0);
    expect(r.totalSkat).toBe(0);
  });
});

// --- Dagpenge ---
describe("Dagpenge beregning", () => {
  const MAX_DAGPENGE = 22041;
  const AM_BIDRAG = 0.08;
  const DAGPENGE_PCT = 0.90;

  function beregnDagpenge(maanedloenBrutto: number, timer: number = 37) {
    const aarlig = maanedloenBrutto * 12;
    const efterAM = aarlig * (1 - AM_BIDRAG);
    const maanedligEfterAM = efterAM / 12;
    const beregnet = maanedligEfterAM * DAGPENGE_PCT;
    const factor = timer / 37;
    const maxJusteret = MAX_DAGPENGE * factor;
    return Math.round(Math.min(beregnet, maxJusteret));
  }

  test("hoej loen giver max dagpenge", () => {
    expect(beregnDagpenge(50000)).toBe(MAX_DAGPENGE);
  });

  test("lav loen giver 90% af loen efter AM", () => {
    const loen = 20000;
    const forventet = Math.round(loen * (1 - AM_BIDRAG) * DAGPENGE_PCT);
    expect(beregnDagpenge(loen)).toBe(forventet);
  });

  test("deltid 20 timer justerer max dagpenge", () => {
    const r = beregnDagpenge(50000, 20);
    expect(r).toBe(Math.round(MAX_DAGPENGE * (20 / 37)));
  });

  test("0 loen giver 0 dagpenge", () => {
    expect(beregnDagpenge(0)).toBe(0);
  });
});

// --- Feriepenge ---
describe("Feriepenge beregning", () => {
  const FERIEPENGE_PCT = 0.125;
  const AM_BIDRAG = 0.08;
  const SKAT_ESTIMAT = 0.38;
  const FERIEDAGE = 25;

  function beregnFeriepenge(aarligBrutto: number, feriedage: number = FERIEDAGE) {
    const total = aarligBrutto * FERIEPENGE_PCT;
    const efterAM = total * (1 - AM_BIDRAG);
    const skat = efterAM * SKAT_ESTIMAT;
    const netto = efterAM - skat;
    const perDag = netto / FERIEDAGE;
    return {
      total: Math.round(total),
      efterAM: Math.round(efterAM),
      netto: Math.round(netto),
      perDag: Math.round(perDag),
      forValgteDage: Math.round(perDag * feriedage),
    };
  }

  test("feriepenge for 500.000 kr aarlig loen", () => {
    const r = beregnFeriepenge(500000);
    expect(r.total).toBe(62500); // 12.5%
    expect(r.efterAM).toBe(57500); // -8%
    expect(r.netto).toBe(35650); // -38% skat
  });

  test("feriepenge per dag", () => {
    const r = beregnFeriepenge(500000);
    expect(r.perDag).toBe(Math.round(35650 / 25));
  });

  test("5 feriedage ud af 25", () => {
    const r = beregnFeriepenge(500000, 5);
    expect(r.forValgteDage).toBe(Math.round((35650 / 25) * 5));
  });

  test("0 loen giver 0 feriepenge", () => {
    const r = beregnFeriepenge(0);
    expect(r.total).toBe(0);
    expect(r.netto).toBe(0);
  });
});

// --- Kørselsfradrag ---
describe("Koerselsfradrag beregning", () => {
  const BUNDGRAENSE = 24; // km dagligt
  const SATS_LAV = 2.23; // kr/km 25-120 km
  const SATS_HOEJ = 1.12; // kr/km over 120 km
  const MAX_DAGE = 216;

  function beregnKoerselsfradrag(enkeltVejKm: number, arbejdsdage: number = MAX_DAGE) {
    const dage = Math.min(arbejdsdage, MAX_DAGE);
    const dagligKm = enkeltVejKm * 2;
    const fradragsKm = dagligKm - BUNDGRAENSE;
    if (fradragsKm <= 0) return 0;

    const lavKm = Math.min(fradragsKm, 120 * 2 - BUNDGRAENSE);
    const hoejKm = Math.max(0, fradragsKm - lavKm);
    return Math.round((lavKm * SATS_LAV + hoejKm * SATS_HOEJ) * dage);
  }

  test("12 km = bundgraense, intet fradrag", () => {
    expect(beregnKoerselsfradrag(12)).toBe(0);
  });

  test("11 km under bundgraense, intet fradrag", () => {
    expect(beregnKoerselsfradrag(11)).toBe(0);
  });

  test("30 km enkelt vej giver fradrag", () => {
    // 60 km dagligt - 24 km = 36 km fradrag
    // 36 km * 2.23 kr * 216 dage
    const forventet = Math.round(36 * SATS_LAV * MAX_DAGE);
    expect(beregnKoerselsfradrag(30)).toBe(forventet);
  });

  test("0 km giver 0 fradrag", () => {
    expect(beregnKoerselsfradrag(0)).toBe(0);
  });

  test("faerre arbejdsdage reducerer fradrag", () => {
    const fuld = beregnKoerselsfradrag(30, 216);
    const halv = beregnKoerselsfradrag(30, 108);
    expect(halv).toBe(Math.round(fuld / 2));
  });
});

// --- Boliglaan (annuitetslaan) ---
describe("Boliglaan beregning", () => {
  function beregnAnnuitet(laanBeloeb: number, aarligRente: number, loebetidAar: number) {
    const r = aarligRente / 100 / 12;
    const n = loebetidAar * 12;
    if (r === 0) return laanBeloeb / n;
    return (laanBeloeb * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  function beregnAfdragsfrit(laanBeloeb: number, aarligRente: number) {
    return laanBeloeb * (aarligRente / 100 / 12);
  }

  test("annuitet 2.000.000 kr, 4%, 30 aar", () => {
    const ydelse = beregnAnnuitet(2000000, 4, 30);
    expect(ydelse).toBeCloseTo(9548, -1); // ca. 9.548 kr/md
  });

  test("annuitet 1.000.000 kr, 3%, 20 aar", () => {
    const ydelse = beregnAnnuitet(1000000, 3, 20);
    expect(ydelse).toBeCloseTo(5546, -1);
  });

  test("afdragsfrit laan 2.000.000 kr, 4%", () => {
    const ydelse = beregnAfdragsfrit(2000000, 4);
    expect(ydelse).toBeCloseTo(6667, -1);
  });

  test("0% rente giver lige fordeling", () => {
    const ydelse = beregnAnnuitet(120000, 0, 10);
    expect(ydelse).toBe(1000);
  });

  test("total rente over loebet tid", () => {
    const ydelse = beregnAnnuitet(2000000, 4, 30);
    const totalBetalt = ydelse * 30 * 12;
    const totalRente = totalBetalt - 2000000;
    expect(totalRente).toBeGreaterThan(1000000); // Markant renteudgift
  });
});

// --- Ejendomsvaerdiskat ---
describe("Ejendomsvaerdiskat beregning", () => {
  const BUNDFRADRAG = 3040000;
  const LAV_SATS = 0.0092;
  const HOEJ_SATS = 0.03;

  function beregnEjendomsvaerdiskat(ejendomsvaerdi: number) {
    if (ejendomsvaerdi <= BUNDFRADRAG) {
      return Math.round(ejendomsvaerdi * LAV_SATS);
    }
    const under = BUNDFRADRAG * LAV_SATS;
    const over = (ejendomsvaerdi - BUNDFRADRAG) * HOEJ_SATS;
    return Math.round(under + over);
  }

  function beregnGrundskyld(grundvaerdi: number, promille: number) {
    return Math.round(grundvaerdi * (promille / 1000));
  }

  test("ejendom under bundfradrag", () => {
    expect(beregnEjendomsvaerdiskat(2000000)).toBe(Math.round(2000000 * LAV_SATS));
  });

  test("ejendom over bundfradrag", () => {
    const r = beregnEjendomsvaerdiskat(4000000);
    const forventet = Math.round(BUNDFRADRAG * LAV_SATS + (4000000 - BUNDFRADRAG) * HOEJ_SATS);
    expect(r).toBe(forventet);
  });

  test("ejendom paa praecis bundfradrag", () => {
    expect(beregnEjendomsvaerdiskat(BUNDFRADRAG)).toBe(Math.round(BUNDFRADRAG * LAV_SATS));
  });

  test("grundskyld beregning", () => {
    expect(beregnGrundskyld(1000000, 24.9)).toBe(24900);
  });

  test("0 vaerdi giver 0 skat", () => {
    expect(beregnEjendomsvaerdiskat(0)).toBe(0);
  });
});

// --- Skattefradrag samlet besparelse ---
describe("Skattefradrag besparelse", () => {
  const KOMMUNE_SKAT = 25.1;
  const BUNDSKAT = 12.01;
  const SKATTESATS = (KOMMUNE_SKAT + BUNDSKAT) / 100;

  function beregnBesparelse(fradrag: number) {
    return Math.round(fradrag * SKATTESATS);
  }

  test("10.000 kr fradrag", () => {
    expect(beregnBesparelse(10000)).toBe(Math.round(10000 * SKATTESATS));
  });

  test("100.000 kr fradrag", () => {
    const r = beregnBesparelse(100000);
    expect(r).toBe(Math.round(100000 * 0.3711));
  });

  test("0 kr fradrag giver 0 besparelse", () => {
    expect(beregnBesparelse(0)).toBe(0);
  });
});

// --- Opsparing (renters rente) ---
describe("Opsparing beregning", () => {
  function simulerOpsparing(
    startBeloeb: number,
    maanedligIndbetaling: number,
    aarligRentePct: number,
    periodeAar: number
  ) {
    const maanedligRente = aarligRentePct / 100 / 12;
    const antalMaaneder = periodeAar * 12;
    let saldo = startBeloeb;
    let samletIndskud = startBeloeb;
    let samletRente = 0;

    for (let m = 1; m <= antalMaaneder; m++) {
      saldo += maanedligIndbetaling;
      samletIndskud += maanedligIndbetaling;
      const renteBeloeb = saldo * maanedligRente;
      saldo += renteBeloeb;
      samletRente += renteBeloeb;
    }

    return { slutSaldo: Math.round(saldo), samletIndskud, samletRente: Math.round(samletRente) };
  }

  test("0% rente giver kun indskud tilbage", () => {
    const r = simulerOpsparing(10000, 1000, 0, 5);
    expect(r.slutSaldo).toBe(70000);
    expect(r.samletIndskud).toBe(70000);
    expect(r.samletRente).toBe(0);
  });

  test("renters rente med startbeloeb", () => {
    const r = simulerOpsparing(100000, 0, 5, 10);
    expect(r.slutSaldo).toBeGreaterThan(160000);
    expect(r.slutSaldo).toBeLessThan(170000);
    expect(r.samletIndskud).toBe(100000);
    expect(r.samletRente).toBeGreaterThan(60000);
  });

  test("maanedlige indbetalinger uden startbeloeb", () => {
    const r = simulerOpsparing(0, 1000, 5, 10);
    expect(r.samletIndskud).toBe(120000);
    expect(r.slutSaldo).toBeGreaterThan(r.samletIndskud);
  });

  test("1 aars opsparing ved 3%", () => {
    const r = simulerOpsparing(0, 1000, 3, 1);
    expect(r.samletIndskud).toBe(12000);
    expect(r.slutSaldo).toBeGreaterThan(12000);
    expect(r.slutSaldo).toBeLessThan(12300);
  });
});

// --- Termin beregning ---
describe("Termin beregning", () => {
  function beregnTermin(sidsteMenstruation: Date): Date {
    const termin = new Date(sidsteMenstruation);
    termin.setDate(termin.getDate() + 280);
    return termin;
  }

  function beregnUge(sidsteMenstruation: Date, dato: Date): number {
    const diffMs = dato.getTime() - sidsteMenstruation.getTime();
    const diffDage = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.floor(diffDage / 7);
  }

  test("termin er 280 dage efter sidste menstruation", () => {
    const sm = new Date(2026, 0, 1);
    const termin = beregnTermin(sm);
    const diffDage = Math.round((termin.getTime() - sm.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDage).toBe(280);
  });

  test("termin er ca. 40 uger", () => {
    const sm = new Date(2026, 0, 1);
    const termin = beregnTermin(sm);
    const uger = beregnUge(sm, termin);
    expect(uger).toBeGreaterThanOrEqual(39);
    expect(uger).toBeLessThanOrEqual(40);
  });

  test("uge 0 paa starddato", () => {
    const sm = new Date(2026, 0, 1);
    expect(beregnUge(sm, sm)).toBe(0);
  });

  test("7 dage er uge 1", () => {
    const sm = new Date(2026, 0, 1);
    const enUge = new Date(2026, 0, 8);
    expect(beregnUge(sm, enUge)).toBe(1);
  });
});
