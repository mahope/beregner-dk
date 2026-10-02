import { describe, expect, test } from "vitest";
import {
  RENTERS_RENTE_AAR,
  RENTERS_RENTE_PCT,
  RENTERS_RENTE_START,
  TID_VS_BELOEB,
  enkelRente,
  rentersRenteEksempel,
  simulerOpsparing,
  tidVsBeloeb,
} from "./opsparing";

/**
 * Formlerne skrevet uafhængigt af `simulerOpsparing`, så testen ikke bare
 * gentager implementationen. Årlig forrentning med månedsindbetaling er
 * en serie hvor indbetalingen lægges til i starten af hvert år, så den tjener
 * årets rente: `S(n) = M · 12 · (1 + r) · ((1 + r)ⁿ − 1) / r`.
 */
const aarligForrentning = (maanedlig: number, rentePct: number, aar: number) => {
  const r = rentePct / 100;
  return maanedlig * 12 * (1 + r) * ((Math.pow(1 + r, aar) - 1) / r);
};

describe("simulerOpsparing", () => {
  test("0 % rente giver startbeløb plus alle indbetalinger og ingen rente", () => {
    const sim = simulerOpsparing(10000, 1000, 0, 5, "aarlig");
    expect(sim.slutSaldo).toBe(10000 + 1000 * 60);
    expect(sim.samletIndskud).toBe(10000 + 1000 * 60);
    expect(sim.samletRente).toBe(0);
  });

  test("årlig forrentning følger serien, når der spares hver måned", () => {
    const sim = simulerOpsparing(0, 1000, 5, 10, "aarlig");
    expect(sim.slutSaldo).toBeCloseTo(aarligForrentning(1000, 5, 10), 6);
    expect(sim.samletIndskud).toBe(120000);
  });

  test("kun et startbeløb, ingen indbetalinger, vokser som en renteserie", () => {
    const sim = simulerOpsparing(10000, 0, 5, 30, "aarlig");
    expect(sim.slutSaldo).toBeCloseTo(10000 * Math.pow(1.05, 30), 6);
    expect(sim.samletIndskud).toBe(10000);
  });

  test("flere tilskrivninger giver mere end færre", () => {
    const start = 100000;
    const aarlig = simulerOpsparing(start, 0, 5, 10, "aarlig").slutSaldo;
    const kvartal = simulerOpsparing(start, 0, 5, 10, "kvartal").slutSaldo;
    const maanedlig = simulerOpsparing(start, 0, 5, 10, "maanedlig").slutSaldo;
    expect(kvartal).toBeGreaterThan(aarlig);
    expect(maanedlig).toBeGreaterThan(kvartal);
    // Månedlig tilskrivning ligger tæt på den effektive årlige rente.
    expect(maanedlig).toBeCloseTo(start * Math.pow(1 + 0.05 / 12, 120), 6);
  });

  test("årsrækken har ét punkt pr. år, og indskuddet hænger ved saldoen", () => {
    const sim = simulerOpsparing(5000, 500, 4, 3, "aarlig");
    expect(sim.aarligData.map((a) => a.aar)).toEqual([1, 2, 3]);
    expect(sim.aarligData[2].indskud).toBe(5000 + 500 * 36);
    expect(sim.aarligData[2].rente).toBeCloseTo(
      sim.aarligData[2].saldo - sim.aarligData[2].indskud,
      9,
    );
  });

  test("rente + indskud er altid saldoen", () => {
    const sim = simulerOpsparing(20000, 1500, 7, 15, "kvartal");
    expect(sim.samletRente + sim.samletIndskud).toBeCloseTo(sim.slutSaldo, 6);
  });
});

describe("enkelRente", () => {
  test("10.000 kr til 5 % i 30 år er 25.000 kr", () => {
    expect(enkelRente(10000, 5, 30)).toBeCloseTo(25000, 9);
  });

  test("den er lineær i både år og rente", () => {
    expect(enkelRente(10000, 5, 10)).toBeCloseTo(15000, 9);
    expect(enkelRente(20000, 5, 30)).toBeCloseTo(2 * enkelRente(10000, 5, 30), 9);
    expect(enkelRente(10000, 10, 30)).toBeCloseTo(40000, 9);
  });

  test("0 % og 0 år giver hovedstolen tilbage", () => {
    expect(enkelRente(10000, 0, 30)).toBe(10000);
    expect(enkelRente(10000, 5, 0)).toBe(10000);
  });
});

describe("eksemplet 'Kraften i renters rente' på /opsparing", () => {
  test("de to sprog kun adskiller sig i startbeløbet", () => {
    expect(RENTERS_RENTE_START.da).toBe(10000);
    expect(RENTERS_RENTE_START.se).toBe(100000);
    const da = rentersRenteEksempel("da");
    for (const sprog of ["da", "se"] as const) {
      const eksempel = rentersRenteEksempel(sprog);
      expect(eksempel.aarligRentePct).toBe(RENTERS_RENTE_PCT);
      expect(eksempel.aar).toBe(RENTERS_RENTE_AAR);
      expect(eksempel.startBeloeb).toBe(RENTERS_RENTE_START[sprog]);
    }
    // Svensk er præcis ti gange dansk, så også resultaterne er det.
    expect(rentersRenteEksempel("se").med / 10).toBeCloseTo(da.med, 6);
    expect(rentersRenteEksempel("se").uden / 10).toBeCloseTo(da.uden, 6);
  });

  test("de tal, siden skrev, kommer nu ud af modulet", () => {
    // 25.000 kr mod 43.219 kr i dansk og 250 000 kr mod 432 194 kr i svensk —
    // de samme fire tal, som stod håndskrevet i `page.tsx`.
    expect(Math.round(rentersRenteEksempel("da").uden)).toBe(25000);
    expect(Math.round(rentersRenteEksempel("da").med)).toBe(43219);
    expect(Math.round(rentersRenteEksempel("se").uden)).toBe(250000);
    expect(Math.round(rentersRenteEksempel("se").med)).toBe(432194);
  });

  test("renters rente giver mere end enkel rente, men under det dobbelte", () => {
    const eksempel = rentersRenteEksempel("da");
    expect(eksempel.med).toBeGreaterThan(eksempel.uden);
    expect(eksempel.med).toBeLessThan(2 * eksempel.uden);
  });
});

describe("eksemplet 'Tid vs. beløb' på /opsparing", () => {
  test("de to rækker er de samme i begge sprog", () => {
    // Sprogene kunne hver have sin egen liste, sådan som de gjorde før denne
    // samling. Der er kun én.
    expect(TID_VS_BELOEB).toHaveLength(2);
    expect(TID_VS_BELOEB[0].alder).toBeLessThan(TID_VS_BELOEB[1].alder);
    expect(TID_VS_BELOEB[0].aar).toBeGreaterThan(TID_VS_BELOEB[1].aar);
    expect(TID_VS_BELOEB[0].maanedlig).toBeLessThan(TID_VS_BELOEB[1].maanedlig);
  });

  test("indskuddet er alle månedlige beløb", () => {
    const { a, b } = tidVsBeloeb();
    expect(a.indskud).toBe(1000 * 12 * 40);
    expect(b.indskud).toBe(2000 * 12 * 30);
  });

  test("slutsaldoen er serien for den forrentning, værktøjet har som standard", () => {
    const { a, b } = tidVsBeloeb();
    expect(a.slutSaldo).toBeCloseTo(aarligForrentning(1000, 5, 40), 6);
    expect(b.slutSaldo).toBeCloseTo(aarligForrentning(2000, 5, 30), 6);
    // De håndskrevne «1,5 mio» og «1,7 mio» var de samme to tal, afrundet til
    // nærmeste hundrede tusind. Nu står de præcist, og siden «men forskellen er
    // minimal» kan ses: forskellen er 152.182 kr mod 240.000 kr indbetalt.
    expect(Math.round(a.slutSaldo)).toBe(1522077);
    expect(Math.round(b.slutSaldo)).toBe(1674259);
  });

  test("pointen holder: B betaler mere ind og får mindre ekstra ud af det", () => {
    const { forskelIndbetalet, forskelSlutSaldo } = tidVsBeloeb();
    expect(forskelIndbetalet).toBe(240000);
    expect(Math.round(forskelSlutSaldo)).toBe(152182);
    expect(forskelSlutSaldo).toBeGreaterThan(0);
    expect(forskelSlutSaldo).toBeLessThan(forskelIndbetalet);
  });
});