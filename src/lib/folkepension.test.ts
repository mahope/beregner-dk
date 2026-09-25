import { describe, it, expect } from "vitest";
import {
  FOLKEPENSION_2026,
  beregnFolkepension2026,
  folkepensionsalder,
  folkepensionsalderRækker,
  formatFolkepensionsalder,
} from "./folkepension";

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
