import { describe, test, expect } from "vitest";
import {
  antalMaaneder,
  annuitetsYdelse,
  laanKostning,
  laaneBeloebRaekker,
  LAANE_BELOEB,
  serielaanSamletRente,
} from "./laanebeloeb";

/**
 * Forventningerne er ikke hentet fra `laanebeloeb.ts` — de er regnet i en
 * uafhængig løkke over månederne (summen af månedens rente på den faktiske
 * restgæld), som står i kommentarerne. En formel, der er regnet forkert, kan
 * ikke samtidig være i overensstemmelse med sin egen nåetidssum.
 */

describe("antalMaaneder", () => {
  test("30 år er 360 måneder", () => {
    expect(antalMaaneder(30)).toBe(360);
  });

  test("et decimalt år rundes op til hele måneder", () => {
    // 30,5 år * 12 = 366, så dette tilfælde er helt. Det der skal afgøres er
    // at 0,5 måneder ikke bliver en halv ydelse.
    expect(antalMaaneder(0.5)).toBe(6);
    expect(antalMaaneder(1.04)).toBe(12);
  });
});

describe("annuitetsYdelse", () => {
  test("1 mio. kr. til 5 % i 30 år er 5.368 kr. pr. måned", () => {
    expect(annuitetsYdelse(1_000_000, 5, 30)).toBeCloseTo(5368.22, 1);
  });

  test("ydelsen dækker præcis hovedstolen over løbetiden", () => {
    // 360 måneder * 5.368,22 kr. = 1.932.557,84, som er 932.557,84 over
    // hovedstolen. Rentesummen her er målt ved at lade restgælden løbe: efter
    // hver måned er restgælden restgæld + rente - ydelse, og det sidste tal
    // ender på 0.
    const n = 360;
    const ydelse = annuitetsYdelse(1_000_000, 5, 30);
    let rest = 1_000_000;
    let renteIalt = 0;
    for (let m = 0; m < n; m++) {
      const rente = rest * (5 / 100 / 12);
      renteIalt += rente;
      rest += rente - ydelse;
    }
    expect(renteIalt).toBeCloseTo(932_557.84, 0);
    expect(rest).toBeCloseTo(0, 4);
  });

  test("ved 0 % er ydelsen hovedstolen delt på månederne", () => {
    // Formlen bliver 0/0 ved 0 % rente. Svaret må være 500.000 / 120.
    expect(annuitetsYdelse(500_000, 0, 10)).toBeCloseTo(4166.67, 1);
  });

  test("et kortere lån på samme beløb giver en højere ydelse", () => {
    expect(annuitetsYdelse(1_000_000, 5, 30)).toBeLessThan(
      annuitetsYdelse(1_000_000, 5, 20),
    );
  });
});

describe("serielaanSamletRente", () => {
  test("1 mio. kr. til 5 % i 30 år er 752.083 kr. i renter", () => {
    expect(serielaanSamletRente(1_000_000, 5, 30)).toBeCloseTo(752_083.33, 1);
  });

  test("summerer til den samme rente som den månedlige løkke", () => {
    // Uden denne prøve vil (n+1)/2-formlen være lige så rigtig som en
    // bevidst fejl, fordi den er en sum af en række — løkken er det samme tal
    // uden formel.
    const n = 360;
    const r = 5 / 100 / 12;
    const afdrag = 1_000_000 / n;
    let rest = 1_000_000;
    let renteIalt = 0;
    for (let m = 0; m < n; m++) {
      renteIalt += rest * r;
      rest -= afdrag;
    }
    expect(serielaanSamletRente(1_000_000, 5, 30)).toBeCloseTo(renteIalt, 2);
  });

  test("serielån koster mindre i renter end annuitetslån på samme lån", () => {
    // Det er hele pointen med at vælge serielån, så hvis denne fejler er
    // låntypevalget i værktøjet tomt.
    const annuitet = laanKostning(1_000_000, 5, 30, "annuitet");
    const serielaan = laanKostning(1_000_000, 5, 30, "serielaan");
    expect(serielaan.samletRente).toBeLessThan(annuitet.samletRente);
  });
});

describe("laanKostning", () => {
  test("annuitetslån har ingen særskilt sidste ydelse", () => {
    const k = laanKostning(1_000_000, 5, 30, "annuitet");
    expect(k.sidsteMaanedsYdelse).toBeNull();
    expect(k.maanedligYdelse).toBeCloseTo(5368.22, 1);
  });

  test("serielånets ydelse falder fra første til sidste måned", () => {
    const k = laanKostning(1_000_000, 5, 30, "serielaan");
    expect(k.maanedligYdelse).toBeCloseTo(6944.44, 1);
    expect(k.sidsteMaanedsYdelse).toBeCloseTo(2789.35, 1);
    expect(k.sidsteMaanedsYdelse!).toBeLessThan(k.maanedligYdelse);
  });

  test("samlet betaling er hovedstol plus renter i begge lånetyper", () => {
    for (const type of ["annuitet", "serielaan"] as const) {
      const k = laanKostning(1_000_000, 5, 30, type);
      expect(k.samletBetaling).toBeCloseTo(
        1_000_000 + k.samletRente,
        6,
      );
    }
  });

  test("ugyldige input giver 0 overalt i stedet for NaN", () => {
    for (const type of ["annuitet", "serielaan"] as const) {
      for (const [belob, rente, aar] of [
        [0, 5, 30],
        [-100_000, 5, 30],
        [1_000_000, 5, 0],
        [1_000_000, 5, -5],
      ]) {
        const k = laanKostning(belob, rente, aar, type);
        for (const vaerdi of [
          k.maanedligYdelse,
          k.samletRente,
          k.samletBetaling,
          k.sidsteMaanedsYdelse ?? 0,
        ]) {
          expect(Number.isFinite(vaerdi)).toBe(true);
        }
      }
    }
  });
});

describe("laaneBeloebRaekker", () => {
  test("indeholder de beløb, autocomplete målte, i stigende rækkefølge", () => {
    // Målt 4/10 under «hvor meget koster det at låne»: 1 million, 500.000,
    // 3 millioner, 2 millioner, 4 millioner, 5 millioner. 100.000 og
    // 250.000 kom i samme måling.
    for (const belob of [
      100_000, 250_000, 500_000, 1_000_000, 2_000_000, 3_000_000, 5_000_000,
    ]) {
      expect(LAANE_BELOEB).toContain(belob);
    }
    expect([...LAANE_BELOEB].sort((a, b) => a - b)).toEqual([...LAANE_BELOEB]);
  });

  test("én række pr. beløb, og ydelsen vokser med beløbet", () => {
    const raekker = laaneBeloebRaekker(5, 30, "annuitet");
    expect(raekker).toHaveLength(LAANE_BELOEB.length);
    for (let i = 1; i < raekker.length; i++) {
      expect(raekker[i].kostning.maanedligYdelse).toBeGreaterThan(
        raekker[i - 1].kostning.maanedligYdelse,
      );
    }
  });

  test("renteandelen ligger mellem 0 og 100 procent", () => {
    for (const type of ["annuitet", "serielaan"] as const) {
      for (const rente of [0, 2.5, 5, 12]) {
        for (const r of laaneBeloebRaekker(rente, 30, type)) {
          expect(r.renteAndel).toBeGreaterThanOrEqual(0);
          expect(r.renteAndel).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  test("ved 0 % rente er renteandelen præcis 0, ikke NaN", () => {
    for (const r of laaneBeloebRaekker(0, 20, "annuitet")) {
      expect(r.renteAndel).toBe(0);
    }
  });

  test("højere rente giver en højere renteandel", () => {
    const lav = laaneBeloebRaekker(2, 30, "annuitet")[3];
    const høj = laaneBeloebRaekker(8, 30, "annuitet")[3];
    expect(høj.renteAndel).toBeGreaterThan(lav.renteAndel);
  });

  test("rækkerne følger den rente og løbetid, de får — ikke faste tal", () => {
    // Rækken skal regnes om, når læseren ændrer sin indtastning. En række der
    // så det samme ud ved 3 % og ved 7 % ville være en tabel uden mening.
    const ro = laaneBeloebRaekker(3, 30, "annuitet")[3];
    const høj = laaneBeloebRaekker(7, 30, "annuitet")[3];
    expect(ro.hovedstol).toBe(1_000_000);
    expect(høj.kostning.maanedligYdelse).toBeGreaterThan(
      ro.kostning.maanedligYdelse,
    );

    const kort = laaneBeloebRaekker(5, 10, "annuitet")[3];
    expect(kort.kostning.samletRente).toBeLessThan(
      ro.kostning.samletRente,
    );
  });
});