import { describe, expect, test } from "vitest";
import {
  LAANETYPER,
  LAANETYPE_EKSEMPEL_AARSRENTE,
  LAANETYPE_EKSEMPEL_HOVEDSTOL,
  LAANETYPE_EKSEMPEL_LOEBETID,
  MAX_AARSRENTE,
  MAX_HOVEDSTOL,
  MAX_LOEBETID_AAR,
  MIN_HOVEDSTOL,
  krydsMaaned,
  laanetypeEksempel,
  laanetypeEksempelFor,
  laanetypeEksempelKryds,
  laanetyperSammenlign,
  laanetypeResultat,
} from "./laantype";
import { annuitetsYdelse, laanKostning, serielaanSamletRente } from "./laanebeloeb";

/**
 * Porten dømmer på **tal**, og hvert tal er valgt, så en fejl i formlen giver et
 * *andet* tal. De tre forventninger nederst er ikke læst af koden — de er
 * håndregnet:
 *
 * **Serielånet på 2.000.000 kr, 4 %, 30 år** (360 måneder, månedlig rente
 * 0,3333 %):
 *
 * - Afdrag pr. måned = 2.000.000 ÷ 360 = **5.555,56 kr.**
 * - Rente måned 1 = 2.000.000 × 0,04 ÷ 12 = **6.666,67 kr.**
 * - Første ydelse = 5.555,56 + 6.666,67 = **12.222,22 kr.**
 * - Sidste måned: restgælden er 5.555,56, renten er 18,52, ydelsen
 *   **5.574,07 kr.**
 * - Renterne er en aritmetisk række: 360 × (6.666,67 + 18,52) ÷ 2 =
 *   **1.203.333,33 kr.**
 * - Renteandelen = 1.203.333,33 ÷ 3.203.333,33 = **37,565 %**
 *
 * **Annuitetslånet på de samme tal:** ydelsen er
 * P·r·(1+r)^n ÷ ((1+r)^n − 1) = **9.548,31 kr.**, samlet betaling
 * 360 × 9.548,31 = **3.437.390 kr.**, renter **1.437.390 kr.**, renteandel
 * 41,8 %.
 *
 * **Stående lånet** betaler kun rente på hele hovedstolen: 6.666,67 kr. hver
 * måned i 360 måneder = 2.400.000 kr. i rente, og 2.000.000 kr. er tilbage
 * hele vejen.
 *
 * **Krydsmåneden** regnes ikke ved hånden, men porten dømmer den på den egenskab,
 * der definerer den: måneden *før* krydset er serielånet dyrere, måneden
 * *på* krydset er det ikke. Målt 6/10: mutation til `return k + 1` giver 2 røde,
 * og restgælden `hovedstol - afdrag * k` i stedet for `* (k - 1)` giver 2 røde.
 * Mutation af betingelsen `<=` til `<` giver derimod **0** røde — ved dette
 * eksempel er ydelsen i måned 146 ikke præcis lig annuitetslånets, så begge
 * betingelser finder samme måned. Den beskrives derfor ikke som en port.
 *
 * **De tre typer må ikke kunne bytte om.** Mutér `laanetypeResultat` til at
 * altid kalde `laanKostning` med `"serielaan"`, så annuitetets forventede
 * ydelse på 9.548,31 bliver 12.222,22.
 */

const P = LAANETYPE_EKSEMPEL_HOVEDSTOL;
const R = LAANETYPE_EKSEMPEL_AARSRENTE;
const A = LAANETYPE_EKSEMPEL_LOEBETID;

describe("laantype — serielån", () => {
  const s = laanetypeEksempelFor("serielaan");

  test("afdraget er hovedstolen delt på månederne", () => {
    expect(s.foersteAfdrag).toBeCloseTo(P / (A * 12), 6);
  });

  test("første ydelse er afdrag + rente på hele hovedstolen", () => {
    expect(s.foersteYdelse).toBeCloseTo(12_222.22, 2);
  });

  test("sidste ydelse er afdrag + rente på det sidste afdrag", () => {
    // Mutér restgælden til at stå på fuld hovedstol hele vejen, så bliver
    // sidste ydelsen lig den første og den her forventning brister.
    expect(s.sidsteYdelse).toBeCloseTo(5_574.07, 2);
  });

  test("ydelsen falder hver måned, altså sidste er lavere end første", () => {
    expect(s.sidsteYdelse).toBeLessThan(s.foersteYdelse);
  });

  test("renterne er den aritmetiske række n × (første + sidste rente) ÷ 2", () => {
    expect(s.samletRente).toBeCloseTo(1_203_333.33, 2);
  });

  test("samlet betaling er hovedstol + renter", () => {
    expect(s.samletBetaling).toBeCloseTo(3_203_333.33, 2);
  });

  test("renteandelen er 37,565 %", () => {
    expect(s.renteAndel).toBeCloseTo(37.565, 3);
  });

  test("serielånet er billigere end annuitetslånet over hele løbetiden", () => {
    expect(s.samletRente).toBeLessThan(laanetypeEksempelFor("annuitet").samletRente);
  });

  test("serielånet er dyrere end annuitetslånet i måned 1", () => {
    expect(s.foersteYdelse).toBeGreaterThan(laanetypeEksempelFor("annuitet").foersteYdelse);
  });
});

describe("laantype — annuitetslån", () => {
  const a = laanetypeEksempelFor("annuitet");

  test("ydelsen er konstant, så første og sidste er ens", () => {
    expect(a.foersteYdelse).toBeCloseTo(a.sidsteYdelse, 9);
  });

  test("ydelsen er 9.548,31 kr.", () => {
    expect(a.foersteYdelse).toBeCloseTo(9_548.31, 2);
  });

  test("ydelsen er præcis den samme som laanebeloebs annuitetsYdelse", () => {
    // Mutér `laanetypeResultat` til at regne ydelsen selv, så løkken på 12
    // måneder i stedet for hele løbetiden giver et andet tal.
    expect(a.foersteYdelse).toBeCloseTo(annuitetsYdelse(P, R, A), 9);
  });

  test("renterne er præcis laanebeloebs", () => {
    expect(a.samletRente).toBeCloseTo(laanKostning(P, R, A, "annuitet").samletRente, 6);
  });

  test("afdraget i måned 1 er ydelsen minus månedens rente", () => {
    const rente = (P * R) / 100 / 12;
    expect(a.foersteAfdrag).toBeCloseTo(a.foersteYdelse - rente, 6);
  });

  test("afdraget i måned 1 er mindre end serielånets", () => {
    expect(a.foersteAfdrag).toBeLessThan(laanetypeEksempelFor("serielaan").foersteAfdrag);
  });

  test("samlet betaling er ydelsen × måneder", () => {
    expect(a.samletBetaling).toBeCloseTo(a.foersteYdelse * 360, 2);
  });

  test("renteandelen er 41,8 %", () => {
    expect(a.renteAndel).toBeCloseTo(41.8, 1);
  });
});

describe("laantype — stående lån", () => {
  const st = laanetypeEksempelFor("staende");

  test("ydelsen er kun rente på hele hovedstolen", () => {
    expect(st.foersteYdelse).toBeCloseTo(6_666.67, 2);
  });

  test("ydelsen er konstant, så første og sidste er ens", () => {
    expect(st.sidsteYdelse).toBeCloseTo(st.foersteYdelse, 9);
  });

  test("der er intet afdrag", () => {
    expect(st.foersteAfdrag).toBe(0);
  });

  test("renterne er månedens rente × alle måneder", () => {
    // Mutér til at kun regne den første måneds rente, så forventningen på
    // 2.400.000 bryder.
    expect(st.samletRente).toBeCloseTo(2_400_000, 2);
  });

  test("stående lånet er dyrest i rente af de tre", () => {
    expect(st.samletRente).toBeGreaterThan(laanetypeEksempelFor("annuitet").samletRente);
  });

  test("stående lånet har den laveste månedlige ydelse", () => {
    expect(st.foersteYdelse).toBeLessThan(laanetypeEksempelFor("annuitet").foersteYdelse);
  });

  test("renteandelen er 54,5 %", () => {
    expect(st.renteAndel).toBeCloseTo(54.5, 1);
  });
});

describe("laantype — krydsmåneden mellem annuitetslån og serielån", () => {
  const k = laanetypeEksempelKryds();

  test("eksemplet krydser i måned 146", () => {
    expect(k).toBe(146);
  });

  test("måneden før krydset er serielånet stadig dyrest", () => {
    if (k === null) throw new Error("eksemplet skal have et kryds");
    const r = R / 100 / 12;
    const afdrag = P / (A * 12);
    const ydelseFoer = afdrag + (P - afdrag * (k - 2)) * r;
    expect(ydelseFoer).toBeGreaterThan(laanetypeEksempelFor("annuitet").foersteYdelse);
  });

  test("på krydsmåneden er serielånet ikke længere dyrere", () => {
    if (k === null) throw new Error("eksemplet skal have et kryds");
    const r = R / 100 / 12;
    const afdrag = P / (A * 12);
    const ydelse = afdrag + (P - afdrag * (k - 1)) * r;
    expect(ydelse).toBeLessThanOrEqual(laanetypeEksempelFor("annuitet").foersteYdelse);
  });

  test("krydset er ikke længere end løbetiden", () => {
    expect(k).not.toBeNull();
    expect(k!).toBeLessThanOrEqual(A * 12);
  });

  test("ved 0 % rente er ydelserne ens, så der er intet kryds", () => {
    // Mutér returværdien til 1, så porten på `null` brister.
    expect(krydsMaaned(P, 0, A)).toBeNull();
  });

  test("et kortere lån krydser tidligere, fordi afdraget er større", () => {
    const lang = krydsMaaned(P, R, 30);
    const kort = krydsMaaned(P, R, 10);
    expect(kort).not.toBeNull();
    expect(kort!).toBeLessThan(lang!);
  });

  test("en højere rente krydser tidligere, fordi serielånets ydelse falder stejlere", () => {
    const lav = krydsMaaned(P, 2, A);
    const høj = krydsMaaned(P, 8, A);
    expect(høj).not.toBeNull();
    expect(høj!).toBeLessThan(lav!);
  });
});

describe("laantype — struktur og rækkefølge", () => {
  test("der er præcis tre lånetyper", () => {
    expect(LAANETYPER).toHaveLength(3);
  });

  test("rækkefølgen er annuitet, serielaan, staende", () => {
    expect(LAANETYPER).toEqual(["annuitet", "serielaan", "staende"]);
  });

  test("sammenligningen har én række pr. type", () => {
    expect(laanetyperSammenlign(P, R, A)).toHaveLength(3);
  });

  test("alle tre har samme antal måneder", () => {
    const raekker = laanetyperSammenlign(P, R, A);
    expect(new Set(raekker.map((x) => x.antalMaaneder)).size).toBe(1);
    expect(raekker[0].antalMaaneder).toBe(360);
  });

  test("alle tre indfrierer hovedstolen", () => {
    for (const r of laanetyperSammenlign(P, R, A)) {
      expect(r.restgaeldVedUdlob).toBe(0);
    }
  });

  test("samlet betaling er hovedstol + rente for alle tre", () => {
    for (const r of laanetyperSammenlign(P, R, A)) {
      expect(r.samletBetaling).toBeCloseTo(P + r.samletRente, 6);
    }
  });

  test("eksemplet læser de tre konstanter, der står i koden", () => {
    const [a, s, st] = laanetypeEksempel();
    expect(a.antalMaaneder).toBe(LAANETYPE_EKSEMPEL_LOEBETID * 12);
    expect(a.samletBetaling - a.samletRente).toBeCloseTo(LAANETYPE_EKSEMPEL_HOVEDSTOL, 6);
    expect(s.samletBetaling - s.samletRente).toBeCloseTo(LAANETYPE_EKSEMPEL_HOVEDSTOL, 6);
    expect(st.samletBetaling - st.samletRente).toBeCloseTo(LAANETYPE_EKSEMPEL_HOVEDSTOL, 6);
  });

  test("eksemplet og den rå funktion er ens", () => {
    const [a] = laanetypeEksempel();
    expect(a.foersteYdelse).toBeCloseTo(
      laanetypeResultat(P, R, A, "annuitet").foersteYdelse,
      9,
    );
  });

  test("laanetypeEksempelFor kaster på en ukendt type", () => {
    // @ts-expect-error — porten skal dømme at den ukendte typen afvises.
    expect(() => laanetypeEksempelFor("flexlaan")).toThrow();
  });

  test("renteandelen ligger mellem 0 og 100 for alle tre", () => {
    for (const r of laanetyperSammenlign(P, R, A)) {
      expect(r.renteAndel).toBeGreaterThan(0);
      expect(r.renteAndel).toBeLessThan(100);
    }
  });
});

describe("laantype — grænser", () => {
  test("et beløb under bunden kaster", () => {
    // Mutér MIN_HOVEDSTOL til 0, så løkken på 100 kr læber videre med et
    // hovedstol på 100 kr og 30 års rente — et tal uden mening.
    expect(() => laanetypeResultat(MIN_HOVEDSTOL - 1, R, A, "annuitet")).toThrow();
  });

  test("et beløb over toppen kaster", () => {
    expect(() => laanetypeResultat(MAX_HOVEDSTOL + 1, R, A, "annuitet")).toThrow();
  });

  test("en negativ rente kaster", () => {
    expect(() => laanetypeResultat(P, -1, A, "annuitet")).toThrow();
  });

  test("en rente over toppen kaster", () => {
    expect(() => laanetypeResultat(P, MAX_AARSRENTE + 1, A, "annuitet")).toThrow();
  });

  test("et løbetid på 0 kaster", () => {
    expect(() => laanetypeResultat(P, R, 0, "annuitet")).toThrow();
  });

  test("et løbetid over toppen kaster", () => {
    expect(() => laanetypeResultat(P, R, MAX_LOEBETID_AAR + 1, "annuitet")).toThrow();
  });

  test("NaN kaster", () => {
    expect(() => laanetypeResultat(Number.NaN, R, A, "annuitet")).toThrow();
  });

  test("alle tre typer kaster på det samme forkerte input", () => {
    for (const type of LAANETYPER) {
      expect(() => laanetypeResultat(P, R, 0, type)).toThrow();
    }
  });

  test("et decimalt løbetid rundes til hele måneder", () => {
    // Mutér `antalMaaneder` til at lade 30,5 år give 366 måneder, så ydelsen
    // ikke dækker afdraget og de tre forventelser bryder.
    expect(laanetypeResultat(P, R, 30.5, "annuitet").antalMaaneder).toBe(366);
    expect(laanetypeResultat(P, R, 30.4, "annuitet").antalMaaneder).toBe(365);
  });

  test("et 1-årigt lån kaster ikke", () => {
    expect(() => laanetypeResultat(P, R, 1, "annuitet")).not.toThrow();
  });

  test("et lån på bundbeløbet kaster ikke", () => {
    expect(() => laanetypeResultat(MIN_HOVEDSTOL, R, A, "staende")).not.toThrow();
  });
});

describe("laantype — 0 % rente", () => {
  test("alle tre typer har samlet rente 0", () => {
    for (const r of laanetyperSammenlign(P, 0, A)) {
      expect(r.samletRente).toBe(0);
    }
  });

  test("ydelsen er hovedstolen delt på månederne", () => {
    expect(laanetypeEksempelFor("annuitet").foersteYdelse).toBeCloseTo(9_548.31, 2);
    expect(laanetypeResultat(P, 0, A, "annuitet").foersteYdelse).toBeCloseTo(P / 360, 6);
  });

  test("stående lånet koster 0, fordi et afdragsfrit lån på 0 % rente koster 0", () => {
    expect(laanetypeResultat(P, 0, A, "staende").foersteYdelse).toBe(0);
  });

  test("renteandelen er 0 for alle tre", () => {
    for (const r of laanetyperSammenlign(P, 0, A)) {
      expect(r.renteAndel).toBe(0);
    }
  });
});

describe("laantype — uafhængighed fra laanebeloeb", () => {
  test("serielånets renter er præcis laanebeloebs", () => {
    // Mutér serielånsgrenen til at bruge annuitetslånets formel, så denne og
    // `serielaanSamletRente`-porten modsiger hinanden.
    expect(laanetypeEksempelFor("serielaan").samletRente).toBeCloseTo(
      serielaanSamletRente(P, R, A),
      6,
    );
  });

  test("en dobbelt så høj rente giver mere end dobbelt så meget i rente på serielånet", () => {
    // Renterne er lineære i renten, fordi rækken er P·r·(n+1)/2. Mutér til en
    // forventning på det dobbelte, så denne brister.
    const en = laanetypeEksempelFor("serielaan").samletRente;
    const to = laanetypeResultat(P, R * 2, A, "serielaan").samletRente;
    expect(to).toBeCloseTo(en * 2, 6);
  });
});
