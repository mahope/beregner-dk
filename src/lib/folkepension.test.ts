import { describe, it, expect } from "vitest";
import {
  FOLKEPENSION_2026,
  beregnFolkepension2026,
  folkepensionMedFormel,
  folkepensionsalder,
  folkepensionsalderForAlder,
  folkepensionsalderRækker,
  folkepensionsdatoer,
  formatFolkepensionsalder,
} from "./folkepension";
import { parseIsoDato } from "./lokal-dato";

describe("FOLKEPENSION_2026", () => {
  it("har beløbene fra borger.dk (2026, før skat)", () => {
    expect(FOLKEPENSION_2026.grundbeloeb).toBe(7544);
    expect(FOLKEPENSION_2026.tillaeg.enlig).toBe(8729);
    expect(FOLKEPENSION_2026.tillaeg.samlevende).toBe(4467);
    expect(FOLKEPENSION_2026.iAlt.enlig).toBe(7544 + 8729);
    expect(FOLKEPENSION_2026.iAlt.samlevende).toBe(7544 + 4467);
  });

  it("har indkomstgrænser fra borger.dk", () => {
    expect(FOLKEPENSION_2026.indkomstgraenser.enlig).toEqual({
      nedsaetningOver: 99200,
      bortfaldOver: 438380,
      pct: 0.309,
    });
    expect(FOLKEPENSION_2026.indkomstgraenser.samlevendeUdenPensionist.pct).toBe(0.32);
    expect(FOLKEPENSION_2026.samleverAndelMedRegel).toBe(0.46);
  });
});

describe("folkepensionMedFormel", () => {
  it("giver præcis samme svar som beregnFolkepension2026 for enlige", () => {
    for (const indkomst of [0, 50000, 99200, 110000, 127449, 150000, 438380, 600000]) {
      expect(folkepensionMedFormel("enlig", indkomst).iAlt).toBeCloseTo(
        beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: indkomst, samleverErPensionist: false }).iAlt,
        6,
      );
    }
  });

  it("følger den rigtige indkomstgrænse for hver samlivsform", () => {
    for (const samleverErPensionist of [true, false]) {
      for (const indkomst of [0, 198800, 212759, 250000, 600000]) {
        expect(folkepensionMedFormel("samlevende", indkomst, samleverErPensionist).iAlt).toBeCloseTo(
          beregnFolkepension2026({ samliv: "samlevende", aarligIndkomst: indkomst, samleverErPensionist }).iAlt,
          6,
        );
      }
    }
  });

  it("lader nedsættelsen aldrig blive negativ (MAKS(0;…) i Excel-formlen)", () => {
    expect(folkepensionMedFormel("enlig", 0).tillaeg).toBe(8729);
    expect(folkepensionMedFormel("enlig", 0).iAlt).toBe(16273);
    expect(folkepensionMedFormel("enlig", -5000).tillaeg).toBe(8729);
  });

  it("lader aldrig tillægget overstige hele tillægget (MIN(…) i Excel-formlen)", () => {
    const hoj = folkepensionMedFormel("enlig", 1000000);
    expect(hoj.tillaeg).toBe(0);
    expect(hoj.tillaeg).toBeGreaterThanOrEqual(0);
    expect(hoj.iAlt).toBe(FOLKEPENSION_2026.grundbeloeb);
  });

  it("nedsætter tillægget præcis med satsen over grænsen", () => {
    // 110.000 kr er 10.800 kr over grænsen på 99.200 kr, og 10.800 × 0,309 = 3.337,20 kr
    const r = folkepensionMedFormel("enlig", 110000);
    expect(FOLKEPENSION_2026.tillaeg.enlig - r.tillaeg).toBeCloseTo(3337.2, 6);
    expect(r.tillaeg).toBeCloseTo(5391.8, 6);
    expect(r.iAlt).toBeCloseTo(12935.8, 6);
  });

  it("finder de to beløb hvor pensionstillægget forsvinder helt", () => {
    const g = FOLKEPENSION_2026.indkomstgraenser.enlig;
    const sammen = g.nedsaetningOver + FOLKEPENSION_2026.tillaeg.enlig / g.pct;
    expect(Math.round(sammen)).toBe(127449);
    // lige under er der stadig et (meget lille) tillæg
    expect(folkepensionMedFormel("enlig", Math.floor(sammen) - 1).tillaeg).toBeGreaterThan(0);
    expect(folkepensionMedFormel("enlig", Math.ceil(sammen)).tillaeg).toBeLessThan(1);

    const gu = FOLKEPENSION_2026.indkomstgraenser.samlevendeUdenPensionist;
    const sammenUden = gu.nedsaetningOver + FOLKEPENSION_2026.tillaeg.samlevende / gu.pct;
    expect(Math.round(sammenUden)).toBe(212759);
  });
});

describe("beregnFolkepension2026", () => {
  it("giver fuld pensionstillæg uden anden indkomst", () => {
    const result = beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: 0, samleverErPensionist: false });
    expect(result.tillaeg).toBe(8729);
    expect(result.iAlt).toBe(16273);
    expect(result.nedsatMed).toBe(0);
    expect(result.bortfaldet).toBe(false);
  });

  it("giver lavere grundsum til gifte/samlevende", () => {
    const result = beregnFolkepension2026({ samliv: "samlevende", aarligIndkomst: 0, samleverErPensionist: true });
    expect(result.tillaeg).toBe(4467);
    expect(result.iAlt).toBe(12011);
  });

  it("lader grundbeløbet være upåvirket af indkomst", () => {
    const result = beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: 300000, samleverErPensionist: false });
    expect(result.grundbeloeb).toBe(7544);
  });

  it("sætter ikke tillægget ned under indkomstgrænsen", () => {
    const result = beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: 99200, samleverErPensionist: false });
    expect(result.tillaeg).toBe(8729);
    expect(result.nedsatMed).toBe(0);
  });

  it("nedsætter tillægget med 30,9 % af indkomsten over grænsen", () => {
    const result = beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: 119200, samleverErPensionist: false });
    expect(result.nedsatMed).toBeCloseTo(20000 * 0.309, 6);
    expect(result.tillaeg).toBeCloseTo(8729 - 20000 * 0.309, 6);
    expect(result.iAlt).toBe(7544 + result.tillaeg);
  });

  it("lader pensionstillægget aldrig blive negativt", () => {
    const result = beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: 400000, samleverErPensionist: false });
    expect(result.tillaeg).toBe(0);
    expect(result.iAlt).toBe(7544);
    expect(result.bortfaldet).toBe(false);
  });

  it("fjerner pensionstillægget over bortfaldsgrænsen", () => {
    const over = beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: 438380, samleverErPensionist: false });
    expect(over.tillaeg).toBe(0);
    expect(over.bortfaldet).toBe(false);

    const ligeOver = beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: 438381, samleverErPensionist: false });
    expect(ligeOver.tillaeg).toBe(0);
    expect(ligeOver.bortfaldet).toBe(true);
    expect(ligeOver.iAlt).toBe(7544);
  });

  it("bruger forskellige grænser for samlevende med og uden pensionist", () => {
    const medPensionist = beregnFolkepension2026({ samliv: "samlevende", aarligIndkomst: 220000, samleverErPensionist: true });
    const udenPensionist = beregnFolkepension2026({ samliv: "samlevende", aarligIndkomst: 400000, samleverErPensionist: false });
    expect(udenPensionist.tillaeg).toBe(0);
    expect(udenPensionist.bortfaldet).toBe(true);
    expect(medPensionist.bortfaldet).toBe(false);
    expect(medPensionist.tillaeg).toBeGreaterThan(0);
  });

  it("behandler negativ og ugyldig indkomst som nul", () => {
    expect(beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: -5000, samleverErPensionist: false }).iAlt).toBe(16273);
    expect(
      beregnFolkepension2026({ samliv: "enlig", aarligIndkomst: Number.NaN, samleverErPensionist: false }).iAlt,
    ).toBe(16273);
  });

  it("regner kun 46 % af samleverens indkomst med, når samleveren ikke er pensionist", () => {
    const result = beregnFolkepension2026({
      samliv: "samlevende",
      aarligIndkomst: 0,
      samleverErPensionist: false,
      aarligSamleverIndkomst: 200000,
    });
    expect(result.indkomstGrundlag).toBeCloseTo(200000 * 0.46, 6);
    expect(result.samleverUdeladt).toBeCloseTo(200000 * 0.54, 6);
    expect(result.tillaeg).toBe(4467);
  });

  it("regner hele samleverens indkomst med, når samleveren er pensionist", () => {
    const result = beregnFolkepension2026({
      samliv: "samlevende",
      aarligIndkomst: 0,
      samleverErPensionist: true,
      aarligSamleverIndkomst: 200000,
    });
    expect(result.indkomstGrundlag).toBe(200000);
    expect(result.samleverUdeladt).toBe(0);
    expect(result.tillaeg).toBeCloseTo(4467 - 1200 * 0.16, 6);
  });

  it("lægger egen og samleverens indkomst sammen i grundlaget", () => {
    const result = beregnFolkepension2026({
      samliv: "samlevende",
      aarligIndkomst: 200000,
      samleverErPensionist: true,
      aarligSamleverIndkomst: 10000,
    });
    expect(result.indkomstGrundlag).toBe(210000);
    expect(result.nedsatMed).toBeCloseTo((210000 - 198800) * 0.16, 6);
    expect(result.tillaeg).toBeCloseTo(4467 - (210000 - 198800) * 0.16, 6);
  });

  it("ignorerer samleverens indkomst for enlige", () => {
    const result = beregnFolkepension2026({
      samliv: "enlig",
      aarligIndkomst: 0,
      samleverErPensionist: false,
      aarligSamleverIndkomst: 400000,
    });
    expect(result.indkomstGrundlag).toBe(0);
    expect(result.samleverUdeladt).toBe(0);
    expect(result.iAlt).toBe(16273);
  });

  it("behandler negativ eller ugyldig samleverindkomst som nul", () => {
    const base = { samliv: "samlevende" as const, aarligIndkomst: 0, samleverErPensionist: false };
    expect(
      beregnFolkepension2026({ ...base, aarligSamleverIndkomst: -100000 }).indkomstGrundlag,
    ).toBe(0);
    expect(
      beregnFolkepension2026({ ...base, aarligSamleverIndkomst: Number.NaN }).indkomstGrundlag,
    ).toBe(0);
    expect(beregnFolkepension2026(base).indkomstGrundlag).toBe(0);
  });

  it("bortfalder på den kombinerede indkomst af dig og din samlever", () => {
    const result = beregnFolkepension2026({
      samliv: "samlevende",
      aarligIndkomst: 300000,
      samleverErPensionist: true,
      aarligSamleverIndkomst: 300000,
    });
    expect(result.bortfaldet).toBe(true);
    expect(result.indkomstGrundlag).toBe(600000);
    expect(result.iAlt).toBe(7544);
  });
});

describe("folkepensionsalder", () => {
  it("giver 65 år for født 31. december 1953 eller tidligere", () => {
    expect(folkepensionsalder("1953-12-31")).toBe(65);
    expect(folkepensionsalder("1950-06-15")).toBe(65);
  });

  it("følger borger.dk's skala ved hvert skifte", () => {
    expect(folkepensionsalder("1954-01-01")).toBe(65);
    expect(folkepensionsalder("1954-06-30")).toBe(65);
    expect(folkepensionsalder("1954-07-01")).toBe(65.5);
    expect(folkepensionsalder("1955-01-01")).toBe(66);
    expect(folkepensionsalder("1955-07-01")).toBe(66.5);
    expect(folkepensionsalder("1956-01-01")).toBe(67);
    expect(folkepensionsalder("1962-12-31")).toBe(67);
    expect(folkepensionsalder("1963-01-01")).toBe(68);
    expect(folkepensionsalder("1966-12-31")).toBe(68);
    expect(folkepensionsalder("1967-01-01")).toBe(69);
    expect(folkepensionsalder("1970-12-31")).toBe(69);
    expect(folkepensionsalder("1971-01-01")).toBe(70);
    expect(folkepensionsalder("1985-03-09")).toBe(70);
  });

  it("accepterer Date-objekter", () => {
    expect(folkepensionsalder(new Date("1969-05-05T00:00:00Z"))).toBe(69);
  });

  it("skriver halve år med ½", () => {
    expect(formatFolkepensionsalder(65.5)).toBe("65 ½ år");
    expect(formatFolkepensionsalder(68)).toBe("68 år");
  });

  it("bygger en tabel med 1953 som første række", () => {
    const rækker = folkepensionsalderRækker();
    expect(rækker).toHaveLength(9);
    expect(rækker[0].foedselsdato).toBe("1953-12-31 eller tidligere");
    expect(rækker[1]).toMatchObject({ foedselsdato: "1. januar 1954", alder: 65 });
    expect(rækker[2].foedselsdato).toBe("1. juli 1954");
    expect(rækker[rækker.length - 1]).toMatchObject({ foedselsdato: "1. januar 1971", alder: 70 });
  });
});

describe("folkepensionsalderForAlder", () => {
  it("giver 70 år for en 30-årig, fordi skalaen kun er offentliggjort til 1971", () => {
    expect(folkepensionsalderForAlder(30, 2026)).toEqual({ fodselsaar: 1996, alder: 70, praecis: true });
  });

  it("følger skalaen for de øvrige fødselsår", () => {
    expect(folkepensionsalderForAlder(60, 2026)).toMatchObject({ fodselsaar: 1966, alder: 68 });
    expect(folkepensionsalderForAlder(55, 2026)).toMatchObject({ fodselsaar: 1971, alder: 70 });
    expect(folkepensionsalderForAlder(70, 2026)).toMatchObject({ fodselsaar: 1956, alder: 67 });
    expect(folkepensionsalderForAlder(76, 2026)).toMatchObject({ fodselsaar: 1950, alder: 65 });
  });

  it("tager det højeste trin i et år der går på tværs af to trin", () => {
    expect(folkepensionsalderForAlder(72, 2026)).toMatchObject({ fodselsaar: 1954, alder: 65.5, praecis: false });
    expect(folkepensionsalderForAlder(71, 2026)).toMatchObject({ fodselsaar: 1955, alder: 66.5, praecis: false });
  });

  it("markerer et helt år i skalaen som præcist", () => {
    expect(folkepensionsalderForAlder(63, 2026)).toMatchObject({ fodselsaar: 1963, alder: 68, praecis: true });
  });
});


describe("folkepensionsdatoer", () => {
  it("regner alderdatoen som fødselsdatoen plus folkepensionsalderen", () => {
    // Født 15. marts 1990 → 70 år i skalaen → 15. marts 2060.
    expect(folkepensionsdatoer("1990-03-15")).toEqual({
      alder: 70,
      foedselsdato: "1990-03-15",
      alderDato: "2060-03-15",
      soegDato: "2059-09-15",
    });
  });

  it("regner en halv alder som seks måneder", () => {
    // 1954 er det eneste år med to trin: 65 år til 1. juli, 65½ år efter.
    expect(folkepensionsdatoer("1954-01-01")).toMatchObject({
      alder: 65,
      alderDato: "2019-01-01",
      soegDato: "2018-07-01",
    });
    expect(folkepensionsdatoer("1954-08-01")).toMatchObject({
      alder: 65.5,
      alderDato: "2020-02-01",
      soegDato: "2019-08-01",
    });
    expect(folkepensionsdatoer("1955-08-01")).toMatchObject({
      alder: 66.5,
      alderDato: "2022-02-01",
    });
  });

  it("lægger de seks måneder før alderdatoen, så søgdatoen ikke kan ligge forude", () => {
    for (const foedselsdato of ["1953-12-31", "1954-01-01", "1963-06-15", "1971-01-01"]) {
      const d = folkepensionsdatoer(foedselsdato);
      expect(d).not.toBeNull();
      expect(d!.soegDato < d!.alderDato).toBe(true);
    }
  });

  it("lægger en fødselsdag på månedens sidste dag i stedet for at rulle en måned frem", () => {
    // 31. august 1954 plus 65½ år er månedens sidste dag i februar 2020 —
    // altså 29. februar, fordi 2020 er et skudår, og ikke 3. marts.
    expect(folkepensionsdatoer("1954-08-31")).toMatchObject({
      alder: 65.5,
      alderDato: "2020-02-29",
      soegDato: "2019-08-29",
    });
    // 31. december 1955 plus 66½ år er 30. juni 2022 — juni har 30 dage.
    expect(folkepensionsdatoer("1955-12-31")).toMatchObject({
      alder: 66.5,
      alderDato: "2022-06-30",
      soegDato: "2021-12-30",
    });
    // 31. januar 1955 er før 1. juli 1955, så skalaen giver 66 år, ikke 66½.
    expect(folkepensionsdatoer("1955-01-31")).toMatchObject({
      alder: 66,
      alderDato: "2021-01-31",
      soegDato: "2020-07-31",
    });
  });

  it("regner 29. februar som 28. februar, så værktøjet ikke lover en dato der ikke findes", () => {
    const d = folkepensionsdatoer("1956-02-29");
    expect(d).not.toBeNull();
    expect(d!.alderDato.endsWith("-02-28")).toBe(true);
    expect(parseIsoDato(d!.alderDato)).not.toBeNull();
  });

  it("giver 65 år til alle født i 1953 eller tidligere", () => {
    expect(folkepensionsdatoer("1953-12-31")).toMatchObject({ alder: 65, alderDato: "2018-12-31" });
    expect(folkepensionsdatoer("1940-06-01")).toMatchObject({ alder: 65, alderDato: "2005-06-01" });
  });

  it("afviser en fødselsdato der ikke findes", () => {
    expect(folkepensionsdatoer("1990-13-01")).toBeNull();
    expect(folkepensionsdatoer("1990-02-30")).toBeNull();
    expect(folkepensionsdatoer("")).toBeNull();
    expect(folkepensionsdatoer("ikke-en-dato")).toBeNull();
  });

  it("går aldrig forude: søgdatoen ligger seks måneder før alderdatoen, aldrig efter", () => {
    expect(folkepensionsdatoer("1990-03-15")!.soegDato).toBe("2059-09-15");
    expect(folkepensionsdatoer("1954-08-31")!.soegDato).toBe("2019-08-29");
  });
});
