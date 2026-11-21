import { describe, expect, it } from "vitest";
import {
  BOLIGSIKRING_2026,
  beregnBoligsikring,
  boligsikringFormueTillaeg,
  boligsikringIndkomstGraense,
  boligsikringMaksHusleje,
  boligsikringTilladtAreal,
} from "./boligsikring";

const base = {
  huslejeMaanedlig: 7_500,
  antalVoksne: 1,
  antalBoernUnder18: 1,
  husstandsindkomst: 250_000,
  formue: 0,
  arealKvm: 0,
  undtagetFraLoftUdenBoern: false,
};

describe("boligsikring 2026 satser", () => {
  it("har de regulerede beløb fra beskæftigelsesministeriets vejledning", () => {
    expect(BOLIGSIKRING_2026.indkomstGraense).toBe(170_300);
    expect(BOLIGSIKRING_2026.indkomstGraensePrBarn).toBe(44_900);
    expect(BOLIGSIKRING_2026.mindstEgenbetaling).toBe(28_700);
    expect(BOLIGSIKRING_2026.maksBoligsikring).toBe(50_412);
    expect(BOLIGSIKRING_2026.maksHusleje).toBe(95_500);
    expect(BOLIGSIKRING_2026.minimumsBeloeb).toBe(3_696);
    expect(BOLIGSIKRING_2026.formueGraenseLav).toBe(896_400);
    expect(BOLIGSIKRING_2026.formueGraenseHoej).toBe(1_793_000);
  });
});

describe("boligsikringIndkomstGraense", () => {
  it("giver ingen forhøjelse for ét barn", () => {
    expect(boligsikringIndkomstGraense(0)).toBe(170_300);
    expect(boligsikringIndkomstGraense(1)).toBe(170_300);
  });

  it("forhøjer med 44.900 kr. for de 2. til 4. barn", () => {
    expect(boligsikringIndkomstGraense(2)).toBe(215_200);
    expect(boligsikringIndkomstGraense(3)).toBe(260_100);
    expect(boligsikringIndkomstGraense(4)).toBe(305_000);
  });

  it("stopper ved fire børn", () => {
    expect(boligsikringIndkomstGraense(6)).toBe(305_000);
  });
});

describe("boligsikringMaksHusleje", () => {
  it("forhøjer huslejemaksimummet med 5 pct. pr. barn op til fire børn", () => {
    expect(boligsikringMaksHusleje(0)).toBe(95_500);
    expect(boligsikringMaksHusleje(2)).toBe(105_050);
    expect(boligsikringMaksHusleje(4)).toBe(114_600);
    expect(boligsikringMaksHusleje(7)).toBe(114_600);
  });
});

describe("boligsikringTilladtAreal", () => {
  it("tæller 65 m² for den første person og 20 m² for hver følgende", () => {
    expect(boligsikringTilladtAreal(1)).toBe(65);
    expect(boligsikringTilladtAreal(2)).toBe(85);
    expect(boligsikringTilladtAreal(4)).toBe(125);
  });
});

describe("boligsikringFormueTillaeg", () => {
  it("giver ingen formuetillæg under den laveste grænse", () => {
    expect(boligsikringFormueTillaeg(0)).toBe(0);
    expect(boligsikringFormueTillaeg(896_400)).toBe(0);
  });

  it("regner 10 pct. af hele formuen mellem grænserne", () => {
    expect(boligsikringFormueTillaeg(1_000_000)).toBe(100_000);
    expect(boligsikringFormueTillaeg(1_793_000)).toBe(179_300);
  });

  it("regner 20 pct. af hele formuen over den højeste grænse", () => {
    expect(boligsikringFormueTillaeg(2_000_000)).toBe(400_000);
  });

  it("trækker formuen fra indkomsten i beregningen", () => {
    const medFormue = beregnBoligsikring({ ...base, formue: 1_000_000 });
    const udenFormue = beregnBoligsikring(base);
    // 10 pct. af 1 mio. = 100.000 kr. mere i indkomst, og 18 pct. af det
    // trækkes fra boligsikringen.
    expect(medFormue.formueTillaeg).toBe(100_000);
    expect(udenFormue.grundlinje - medFormue.grundlinje).toBe(18_000);
    expect(udenFormue.aarlig - medFormue.aarlig).toBe(18_000);
  });
});

describe("beregnBoligsikring", () => {
  it("regner formlen 60 pct. af lejen minus 18 pct. af indkomsten over grænsen", () => {
    const r = beregnBoligsikring({ ...base, huslejeMaanedlig: 7_500, husstandsindkomst: 250_000 });
    // 90.000 × 0,6 = 54.000. Indkomst over grænsen: 250.000 − 170.300 = 79.700,
    // 18 pct. deraf er 14.346. Differencen er derfor 39.654.
    expect(r.boligudgift).toBe(90_000);
    expect(r.huslejeandel).toBe(54_000);
    expect(r.indkomstandel).toBe(14_346);
    expect(r.grundlinje).toBe(39_654);
    expect(r.aarlig).toBe(39_654);
    expect(r.maanedlig).toBeCloseTo(3_304.5, 6);
  });

  it("giver intet, når indkomsten er over grænsen plus hele huslejeandelen", () => {
    const r = beregnBoligsikring({ ...base, husstandsindkomst: 490_000 });
    expect(r.grundlinje).toBeLessThanOrEqual(0);
    expect(r.aarlig).toBe(0);
    expect(r.begraensetAf).toBe("egenbetaling");
  });

  it("lader husstanden aldrig betale mindre end 28.700 kr. af boligudgiften selv", () => {
    // Lav indkomst: formlen vil give hele huslejeandelen, men § 22, stk. 2
    // lader husstanden beholde mindst 28.700 kr. af boligudgiften.
    const r = beregnBoligsikring({ ...base, huslejeMaanedlig: 5_000, husstandsindkomst: 0 });
    expect(r.grundlinje).toBe(36_000);
    expect(r.aarlig).toBe(60_000 - 28_700);
    expect(r.egenbetaling).toBe(28_700);
  });

  it("lofter boligsikringen til 15 pct. af huslejen, når der ikke er børn under 18", () => {
    // 60 pct. af 60.000 = 36.000, men uden børn må beløbet højst være 15 pct.
    const r = beregnBoligsikring({ ...base, huslejeMaanedlig: 5_000, husstandsindkomst: 0, antalBoernUnder18: 0 });
    expect(r.aarlig).toBe(9_000);
    expect(r.begraensetAf).toBe("loft-uden-boern");
  });

  it("hæver loftet, når husstanden er undtaget fra § 22, stk. 3", () => {
    const r = beregnBoligsikring({
      ...base,
      huslejeMaanedlig: 5_000,
      husstandsindkomst: 0,
      antalBoernUnder18: 0,
      undtagetFraLoftUdenBoern: true,
    });
    expect(r.aarlig).toBe(60_000 - 28_700);
    expect(r.begraensetAf).toBe("ingen");
  });

  it("holder boligsikringen under maksimumsbeløbet", () => {
    const r = beregnBoligsikring({
      ...base,
      huslejeMaanedlig: 10_000,
      husstandsindkomst: 215_200,
      antalBoernUnder18: 2,
    });
    expect(r.aarlig).toBe(BOLIGSIKRING_2026.maksBoligsikring);
    expect(r.begraensetAf).toBe("maksimum");
  });

  it("forhøjer maksimumsbeløbet med 25 pct. ved fire eller flere børn", () => {
    const r = beregnBoligsikring({
      ...base,
      huslejeMaanedlig: 12_000,
      husstandsindkomst: 0,
      antalBoernUnder18: 4,
    });
    expect(r.aarlig).toBe(50_412 * 1.25);
  });

  it("regner 4.201 kr. om måneden for en førtidspensionist uden børn", () => {
    // borger.dk's egen tabel for 2026: 4.201 kr. pr. måned = 50.412 kr. om året.
    const r = beregnBoligsikring({
      ...base,
      huslejeMaanedlig: 12_000,
      husstandsindkomst: 0,
      antalBoernUnder18: 0,
      undtagetFraLoftUdenBoern: true,
    });
    expect(Math.floor(r.maanedlig)).toBe(4_201);
    expect(r.aarlig).toBe(50_412);
  });

  it("regner 1.194 kr. om måneden uden børn, når 15 pct.-loftet gælder", () => {
    // 15 pct. af huslejemaksimummet på 95.500 kr. = 14.325 kr. om året, dvs.
    // 1.193,75 kr. om måneden — det tal, borger.dk viser som 1.194 kr.
    const r = beregnBoligsikring({
      ...base,
      huslejeMaanedlig: 10_000,
      husstandsindkomst: 0,
      antalBoernUnder18: 0,
    });
    expect(r.boligudgift).toBe(95_500);
    expect(r.aarlig).toBeCloseTo(14_325, 6);
    expect(Math.round(r.maanedlig)).toBe(1_194);
  });

  it("begrænser huslejen til maksimumsbeløbet", () => {
    const r = beregnBoligsikring({ ...base, huslejeMaanedlig: 15_000, antalBoernUnder18: 0 });
    expect(r.huslejeErBegraenset).toBe(true);
    expect(r.boligudgift).toBe(95_500);
  });

  it("inddrager kun den del af huslejen, der dækkes af arealgrænsen", () => {
    // To personer må regne med 85 m². Bor de på 100 m², indgår 85/100 af
    // huslejen.
    const r = beregnBoligsikring({
      ...base,
      antalVoksne: 2,
      huslejeMaanedlig: 10_000,
      husstandsindkomst: 0,
      arealKvm: 100,
      antalBoernUnder18: 0,
      undtagetFraLoftUdenBoern: true,
    });
    expect(r.tilladtAreal).toBe(85);
    expect(r.arealFaktor).toBe(0.85);
    expect(r.boligudgift).toBe(95_500 * 0.85);
  });

  it("ændrer ikke noget, når boligen er mindre end arealgrænsen", () => {
    const r = beregnBoligsikring({
      ...base,
      antalVoksne: 2,
      huslejeMaanedlig: 6_000,
      arealKvm: 60,
    });
    expect(r.arealFaktor).toBe(1);
    expect(r.boligudgift).toBe(72_000);
  });

  it("tæller børn med i husstanden, men ikke i arealgrænsen alene", () => {
    const r = beregnBoligsikring({ ...base, antalBoernUnder18: 2 });
    expect(r.tilladtAreal).toBe(105);
    expect(r.indkomstGraense).toBe(215_200);
  });

  it("holder sig robust over for ugyldige indtastninger", () => {
    for (const input of [
      { ...base, huslejeMaanedlig: Number.NaN },
      { ...base, husstandsindkomst: -50_000 },
      { ...base, antalVoksne: 0 },
      { ...base, antalBoernUnder18: Number.NaN },
      { ...base, arealKvm: -10 },
      { ...base, formue: -1 },
    ]) {
      const r = beregnBoligsikring(input);
      expect(Number.isFinite(r.aarlig)).toBe(true);
      expect(r.aarlig).toBeGreaterThanOrEqual(0);
      expect(r.maanedlig).toBeGreaterThanOrEqual(0);
      expect(r.egenbetaling).toBeGreaterThanOrEqual(0);
      expect(r.egenbetaling + r.aarlig).toBeCloseTo(r.boligudgift, 6);
    }
  });
});
