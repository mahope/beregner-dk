import { describe, expect, it } from "vitest";
import {
  ALDERSOPSPARING_2026,
  ALDERSOPSPARING_FRADRAG,
  ALDERSOPSPARING_KILDER,
  beloebsGraenseFor,
  beregnAldersopsparing,
  PENSIONSUDBETALINGSALDER,
  aarTilFolkepension,
  sammenlignFriOpsparing,
} from "./aldersopsparing";
import { beregnPensionsalder } from "./pensionsalder";

const GRUNDBELOEB = ALDERSOPSPARING_2026.grundbeloeb;
const HOEJT_BELOEB = ALDERSOPSPARING_2026.hoejtBeloeb;

describe("beloebsGraenseFor", () => {
  it("giver grundbeløbet, når der er mere end 7 år til folkepensionen", () => {
    expect(beloebsGraenseFor(8)).toEqual({ beloeb: GRUNDBELOEB, hoejt: false });
    expect(beloebsGraenseFor(30)).toEqual({ beloeb: GRUNDBELOEB, hoejt: false });
  });

  it("slår over til det høje beløb i det syvende år før folkepensionen", () => {
    expect(beloebsGraenseFor(7)).toEqual({ beloeb: HOEJT_BELOEB, hoejt: true });
    expect(beloebsGraenseFor(1)).toEqual({ beloeb: HOEJT_BELOEB, hoejt: true });
    expect(beloebsGraenseFor(0)).toEqual({ beloeb: HOEJT_BELOEB, hoejt: true });
  });

  it("bruger 2026-satserne læst af skat.dk", () => {
    expect(GRUNDBELOEB).toBe(9900);
    expect(HOEJT_BELOEB).toBe(64200);
  });
});

describe("beregnAldersopsparing", () => {
  it("holder indbetalingen afgiftsfri, når den er inden for grundbeløbet", () => {
    const resultat = beregnAldersopsparing({
      aarTilFolkepension: 20,
      aarligIndbetaling: GRUNDBELOEB,
      antalAar: 1,
      afkastPct: 0,
    });

    expect(resultat.beloebsGraense).toBe(GRUNDBELOEB);
    expect(resultat.hoejtBeloeb).toBe(false);
    expect(resultat.overGraense).toBe(0);
    expect(resultat.afgift).toBe(0);
    expect(resultat.indbetalingEfterAfgift).toBe(GRUNDBELOEB);
    expect(resultat.saldo).toBe(GRUNDBELOEB);
  });

  it("opkræver 20 % af beløbet over grundbeløbet, når der er over 7 år tilbage", () => {
    const resultat = beregnAldersopsparing({
      aarTilFolkepension: 20,
      aarligIndbetaling: 10900,
      antalAar: 1,
      afkastPct: 0,
    });

    expect(resultat.overGraense).toBe(1000);
    expect(resultat.afgift).toBe(200);
    expect(resultat.indbetalingEfterAfgift).toBe(10700);
    expect(resultat.saldo).toBe(10700);
  });

  it("opkræver 40 % af beløbet over det høje beløb", () => {
    const resultat = beregnAldersopsparing({
      aarTilFolkepension: 3,
      aarligIndbetaling: HOEJT_BELOEB + 10000,
      antalAar: 1,
      afkastPct: 0,
    });

    expect(resultat.hoejtBeloeb).toBe(true);
    expect(resultat.overGraense).toBe(10000);
    expect(resultat.afgift).toBe(4000);
    expect(resultat.indbetalingEfterAfgift).toBe(HOEJT_BELOEB + 6000);
  });

  it("tæller afkastet præcist og først det år det er optjent", () => {
    const resultat = beregnAldersopsparing({
      aarTilFolkepension: 20,
      aarligIndbetaling: 1000,
      antalAar: 2,
      afkastPct: 10,
    });

    // År 1: 1.000 → afkast 100,00 → PAL 15,30 → 1.084,70.
    // År 2: 1.084,70 + 1.000 = 2.084,70 → afkast 208,47 → PAL 31,90 → 2.261,27.
    // PAL-skatten tages af årets afkast, så næste år renter på nettobeløbet.
    expect(resultat.samletAfkastFoerSkat).toBeCloseTo(100 + 208.47, 2);
    expect(resultat.samletPalSkat).toBeCloseTo(15.3 + 31.89591, 4);
    expect(resultat.saldo).toBeCloseTo(2261.27409, 4);
  });

  it("viser at udbetalingen er skattefri og lig med saldoen", () => {
    const resultat = beregnAldersopsparing({
      aarTilFolkepension: 10,
      aarligIndbetaling: GRUNDBELOEB,
      antalAar: 10,
      afkastPct: 5,
    });

    expect(resultat.udbetalingSkattefri).toBe(resultat.saldo);
    expect(resultat.saldo).toBeGreaterThan(resultat.samletIndbetaling);
  });

  it("lover intet fradrag ved indbetaling", () => {
    expect(ALDERSOPSPARING_FRADRAG).toBe(0);
  });

  it("angiver antal år til det høje beløb slår til", () => {
    expect(beregnAldersopsparing({
      aarTilFolkepension: 12,
      aarligIndbetaling: 9900,
      antalAar: 1,
      afkastPct: 0,
    }).aarTilHoejtBeloeb).toBe(5);

    expect(beregnAldersopsparing({
      aarTilFolkepension: 4,
      aarligIndbetaling: 9900,
      antalAar: 1,
      afkastPct: 0,
    }).aarTilHoejtBeloeb).toBe(0);
  });

  it("tåler negative og ugyldige indgange uden at gå i stykker", () => {
    const resultat = beregnAldersopsparing({
      aarTilFolkepension: -4,
      aarligIndbetaling: -5000,
      antalAar: -3,
      afkastPct: -10,
    });

    expect(resultat.beloebsGraense).toBe(HOEJT_BELOEB);
    expect(resultat.samletIndbetaling).toBe(0);
    expect(resultat.saldo).toBe(0);
  });
});

describe("sammenlignFriOpsparing", () => {
  it("gør forskellen større jo højere marginalskat der er på afkastet", () => {
    const input = {
      aarTilFolkepension: 20,
      aarligIndbetaling: GRUNDBELOEB,
      antalAar: 30,
      afkastPct: 6,
    };
    const resultat = beregnAldersopsparing(input);

    const lav = sammenlignFriOpsparing(resultat.saldo, input.aarligIndbetaling, input.afkastPct, input.antalAar, 30);
    const hoej = sammenlignFriOpsparing(resultat.saldo, input.aarligIndbetaling, input.afkastPct, input.antalAar, 60);

    expect(lav.forskel).toBeGreaterThan(0);
    expect(hoej.forskel).toBeGreaterThan(lav.forskel);
    expect(hoej.saldoFri).toBeLessThan(lav.saldoFri);
  });

  it("tåler nul procent skat", () => {
    const input = {
      aarTilFolkepension: 20,
      aarligIndbetaling: 1000,
      antalAar: 5,
      afkastPct: 6,
    };
    const resultat = beregnAldersopsparing(input);
    const fri = sammenlignFriOpsparing(resultat.saldo, input.aarligIndbetaling, input.afkastPct, input.antalAar, 0);

    expect(fri.saldoFri).toBeGreaterThan(resultat.saldo);
  });
});

describe("referencetabeller", () => {
  it("lister pensionsudbetalingsalderen fra 60 til 65 år uden huller", () => {
    expect(PENSIONSUDBETALINGSALDER).toHaveLength(7);
    expect(PENSIONSUDBETALINGSALDER[0].alderTekst).toBe("60 år");
    expect(PENSIONSUDBETALINGSALDER[6].alderTekst).toContain("65 år");
  });

  it("henviser til skat.dk's egne sider for hver sats", () => {
    for (const [noegle, kilde] of Object.entries(ALDERSOPSPARING_KILDER)) {
      expect(kilde, `${noegle} mangler kilde`).toMatch(/^https:\/\/(www\.)?(skat|info\.skat)\.dk/);
    }
  });

  it("bruger 15,3 % PAL-skat og skattekode 33", () => {
    expect(ALDERSOPSPARING_2026.palSats).toBeCloseTo(0.153, 6);
    expect(ALDERSOPSPARING_2026.skattekode).toBe("33");
  });
});

describe("grænsen følger folkepensionsalderen i modulet", () => {
  it("flytter loftet fra 9.900 til 64.200 kr. syv år før folkepensionen", () => {
    const iDag = new Date(2026, 9, 11);

    // Født 1963: folkepensionsalderen nås i 2031 => fem indkomstår tilbage.
    const nær = beregnPensionsalder(new Date(1963, 0, 15), iDag);
    // Født 1996: folkepensionsalderen nås i 2066 => fyrre indkomstår tilbage.
    const langt = beregnPensionsalder(new Date(1996, 0, 15), iDag);

    expect(aarTilFolkepension(nær.alderFyldesDato, iDag)).toBe(5);
    expect(aarTilFolkepension(langt.alderFyldesDato, iDag)).toBe(40);

    expect(beloebsGraenseFor(aarTilFolkepension(nær.alderFyldesDato, iDag)).beloeb).toBe(HOEJT_BELOEB);
    expect(beloebsGraenseFor(aarTilFolkepension(langt.alderFyldesDato, iDag)).beloeb).toBe(GRUNDBELOEB);
  });

  it("lader skat.dks eget eksempel gå op: 2033 er 7 år efter 2026", () => {
    const iDag = new Date(2026, 0, 1);
    // Når folkepensionsalderen nås i 2033, kan det høje beløb indbetales i 2026.
    expect(aarTilFolkepension(new Date(2033, 5, 1), iDag)).toBe(7);
    expect(beloebsGraenseFor(aarTilFolkepension(new Date(2033, 5, 1), iDag)).beloeb).toBe(HOEJT_BELOEB);
    expect(beloebsGraenseFor(aarTilFolkepension(new Date(2034, 5, 1), iDag)).beloeb).toBe(GRUNDBELOEB);
  });
});

describe("mutation-kontrol", () => {
  it("låser 15,3 % PAL-skat, for den er det der gør ordningen værd at beregne", () => {
    const med = beregnAldersopsparing({
      aarTilFolkepension: 20,
      aarligIndbetaling: 9900,
      antalAar: 30,
      afkastPct: 6,
    });
    expect(med.saldo).toBeGreaterThan(med.samletIndbetaling);
    expect(med.samletPalSkat).toBeGreaterThan(0);
    expect(med.saldo).toBeLessThan(med.samletIndbetaling + med.samletAfkastFoerSkat);
  });
});
