import { describe, expect, test } from "vitest";
import {
  BILLAAN_EKSEMPLER,
  beregnBillaan,
  billaanEksempler,
} from "./billaan";

/**
 * `/billaan` skrev før denne samling seks håndskrevne eksempeltabeller-rækker
 * med **tre** forskellige betydninger af de samme kolonner:
 *
 * - den danske laante på hele bilens pris, mens `BillaanBeregner` laante på
 *   prisen minus udbetalingen,
 * - den danske «Samlet omkostning» var ydelserne alene, den svenske var
 *   ydelserne plus udbetalingen,
 * - og to af de tre danske rækker bar «6 %» i rentekolonnen med en månedlig
 *   ydelse, der var den for 7 %.
 *
 * Testen her dømmer på tallene, så en række ikke kan få sin egen fortælling.
 */

/** Annuitetsformlen, skrevet uafhængigt af modulet. */
function forventetYdelse(laanebelob: number, rentesats: number, maaneder: number): number {
  const r = rentesats / 100 / 12;
  const faktor = Math.pow(1 + r, maaneder);
  return (laanebelob * r * faktor) / (faktor - 1);
}

/**
 * Den årlige effektive rente som lånet faktisk er værd: den månedlige effektive
 * rente `i`, der gør nutidsværdien af ydelserne lig lånebeløbet, annualiseret.
 *
 * Uafhængig af modulets formel, så testen kan dømme den.
 */
function aarligEffektivRente(laanebelob: number, maanedligYdelse: number, maaneder: number): number {
  const nutidsvaerdi = (i: number) => maanedligYdelse * (1 - 1 / Math.pow(1 + i, maaneder)) / i;
  let lo = 1e-9;
  let hi = 1;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (nutidsvaerdi(mid) > laanebelob) lo = mid;
    else hi = mid;
  }
  return (Math.pow(1 + (lo + hi) / 2, 12) - 1) * 100;
}

describe("beregnBillaan", () => {
  test("lånebeløbet er bilens pris minus udbetalingen", () => {
    const resultat = beregnBillaan({ bilpris: 250000, udbetaling: 20000, loebetid: 72, rentesats: 6.5 });
    expect(resultat.laanebelob).toBe(230000);
  });

  test("månedlig ydelse følger annuitetsformlen på lånebeløbet", () => {
    const resultat = beregnBillaan({ bilpris: 250000, udbetaling: 20000, loebetid: 72, rentesats: 6.5 });
    expect(resultat.maanedligYdelse).toBeCloseTo(forventetYdelse(230000, 6.5, 72), 6);
  });

  test("0 % rente fordeler lånet ligeligt over månederne", () => {
    const resultat = beregnBillaan({ bilpris: 120000, udbetaling: 20000, loebetid: 60, rentesats: 0 });
    expect(resultat.maanedligYdelse).toBe(100000 / 60);
    expect(resultat.samletRente).toBe(0);
  });

  test("renteudgiften er ydelserne minus lånebeløbet", () => {
    const resultat = beregnBillaan({ bilpris: 250000, udbetaling: 20000, loebetid: 72, rentesats: 6.5 });
    expect(resultat.samletRente).toBeCloseTo(resultat.samletBelob - resultat.laanebelob, 9);
    expect(resultat.samletBelob).toBeCloseTo(resultat.maanedligYdelse * 72, 9);
  });

  test("APR er højere end den nominelle rente, og tæt på den årlige effektive", () => {
    const input = { bilpris: 250000, udbetaling: 20000, loebetid: 72, rentesats: 6.5 };
    const resultat = beregnBillaan(input);
    // En årlig omkostning i procent kan ikke ligge under den rente lånet er
    // værd af. Den gamle formel gav 3,46 % her, altså halvdelen.
    expect(resultat.apr).toBeGreaterThan(input.rentesats);
    // APR-metoden er en tilnærmelse, så den dømmes mod den årlige effektive
    // rente, fundet ved at løse ydelsesligningens nutidsværdi.
    const effektiv = aarligEffektivRente(resultat.laanebelob, resultat.maanedligYdelse, input.loebetid);
    expect(resultat.apr).toBeGreaterThan(effektiv);
    expect(resultat.apr).toBeLessThan(effektiv + 1);
  });
});

describe("eksemplerne på /billaan", () => {
  test("rækkerne er de samme i begge sprog, og de er hele måneder", () => {
    expect(BILLAAN_EKSEMPLER.da).toHaveLength(3);
    expect(BILLAAN_EKSEMPLER.se).toHaveLength(3);
    for (const sprog of ["da", "se"] as const) {
      for (const input of BILLAAN_EKSEMPLER[sprog]) {
        expect(input.loebetid % 12).toBe(0);
        expect(input.bilpris).toBeGreaterThan(input.udbetaling);
      }
    }
  });

  test("udbetalingen er 10 % i dansk og 20 % på svenska", () => {
    for (const input of BILLAAN_EKSEMPLER.da) expect(input.udbetaling).toBe(input.bilpris * 0.1);
    for (const input of BILLAAN_EKSEMPLER.se) expect(input.udbetaling).toBe(input.bilpris * 0.2);
  });

  test("månedlig ydelse i tabellen er den for den viste rente", () => {
    for (const sprog of ["da", "se"] as const) {
      for (const raekke of billaanEksempler(sprog)) {
        const laan = raekke.bilpris - raekke.udbetaling;
        expect(raekke.maanedligYdelse).toBeCloseTo(
          forventetYdelse(laan, raekke.rentesats, raekke.loebetid),
          6,
        );
      }
    }
  });

  test("dømmer den danske 7-års-række, der lå på 6 %-ydelsen for 7 %", () => {
    // Rækken der skrev «6 %» og «3.017 kr». 200.000 minus 10 % udbetaling er
    // 180.000, og 180.000 til 6 % i 84 måneder er 2.630 kr — ikke 3.017 kr,
    // som er det 7 % giver. Ydelsen på hele prisen til 6 % er 2.922 kr, så
    // ingen læsning af den gamle række giver 3.017 kr.
    const [raekke] = billaanEksempler("da").filter((r) => r.bilpris === 200000);
    expect(Math.round(raekke.maanedligYdelse)).toBe(2630);
    expect(Math.round(raekke.maanedligYdelse)).not.toBe(3017);
  });

  test("samlet omkostning er ydelserne plus udbetalingen, altså bilens pris", () => {
    for (const sprog of ["da", "se"] as const) {
      for (const raekke of billaanEksempler(sprog)) {
        expect(raekke.samletOmkostning).toBeCloseTo(
          raekke.maanedligYdelse * raekke.loebetid + raekke.udbetaling,
          9,
        );
        expect(raekke.samletOmkostning).toBeGreaterThan(raekke.bilpris);
      }
    }
  });

  test("svensk række på 150.000 kr med 20 % nedskrivning er uændret 2.376 kr", () => {
    // Beviser at rettelsen ikke har ændret den række, der var rigtig.
    const [raekke] = billaanEksempler("se").filter((r) => r.bilpris === 150000);
    expect(Math.round(raekke.maanedligYdelse)).toBe(2376);
    expect(Math.round(raekke.samletOmkostning)).toBe(172569);
  });
});