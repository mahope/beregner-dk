import { describe, expect, test } from "vitest";
import {
  PROCENT_10_AF_TAL,
  PROCENT_SKILLNAD_EKSEMPEL,
  RABAT_BELOEB,
  RABAT_EKSEMPEL,
  RABAT_SATS,
  RABAT_SATS_UDLAET,
  procentAf,
  procentDifferens,
  procentForskel,
  rabatProcent,
} from "./procent";

describe("procentForskel", () => {
  test("procentvis ændring fra gammal til ny", () => {
    expect(procentForskel(12500, 10000)).toBe(25);
    expect(procentForskel(33000, 30000)).toBe(10);
  });

  test("et fald er negativt", () => {
    expect(procentForskel(10000, 12500)).toBe(-20);
  });

  test("ingen ændring er 0 procent", () => {
    expect(procentForskel(10000, 10000)).toBe(0);
  });

  test("et gammelt tal på 0 giver ingen division med 0", () => {
    expect(procentForskel(10000, 0)).toBe(0);
  });
});

describe("procentDifferens", () => {
  test("er symmetrisk: samme svar uanset hvilken vej man regner", () => {
    expect(procentDifferens(10000, 12500)).toBeCloseTo(22.222, 3);
    expect(procentDifferens(12500, 10000)).toBeCloseTo(22.222, 3);
  });

  test("de to eksempler er 22,2 og 9,5 procent", () => {
    const [lon, belob] = PROCENT_SKILLNAD_EKSEMPEL;
    expect(procentDifferens(belob.gammal, belob.ny)).toBeCloseTo(22.222, 3);
    expect(procentDifferens(lon.gammal, lon.ny)).toBeCloseTo(9.5238, 3);
  });

  test("giver altid et positivt tal", () => {
    expect(procentDifferens(10000, 12500)).toBeGreaterThan(0);
    expect(procentDifferens(12500, 10000)).toBeGreaterThan(0);
  });

  test("to ens tal er 0 procent", () => {
    expect(procentDifferens(10000, 10000)).toBe(0);
  });

  test("to tal der summerer til 0 giver ingen division med 0", () => {
    expect(procentDifferens(10000, -10000)).toBe(0);
  });
});

describe("procentAf", () => {
  test("10 procent er tallet delt med 10", () => {
    expect(procentAf(250, 10)).toBe(25);
    expect(procentAf(100, 10)).toBe(10);
    expect(procentAf(500, 10)).toBe(50);
    expect(procentAf(1600, 10)).toBe(160);
  });

  test("et tal der ikke kan deles med 10 giver et decimaltal", () => {
    // 75 ligger i PROCENT_10_AF_TAL med vilje: det er det eneste målte tal,
    // hvis svar ikke er et helt tal, så formateringen skal kunne begge dele.
    expect(procentAf(75, 10)).toBe(7.5);
  });

  test("de andre satser bruger samme regel", () => {
    expect(procentAf(200, 25)).toBe(50);
    expect(procentAf(180, 50)).toBe(90);
    expect(procentAf(350, 1)).toBe(3.5);
  });

  test("0 procent er 0, og 100 procent er tallet selv", () => {
    expect(procentAf(500, 0)).toBe(0);
    expect(procentAf(500, 100)).toBe(500);
  });
});

describe("PROCENT_10_AF_TAL", () => {
  test("dækker de tal dansk og svensk autocomplete faktisk spørger om", () => {
    // Målt 2026-09-30 (hl=da&gl=dk / hl=se&gl=se). Listen er de viste tal,
    // ikke et udvalg — en række der mangler her, mangler også i tabellen.
    for (const tal of [75, 100, 200, 300, 400, 500, 600, 1000, 1600, 25000]) {
      expect(PROCENT_10_AF_TAL).toContain(tal);
    }
    for (const tal of [500, 1000, 2000, 10000, 1000000, 5000000]) {
      expect(PROCENT_10_AF_TAL).toContain(tal);
    }
  });

  test("hver række svarer til tallet delt med 10", () => {
    // Tallene er beregnet, ikke skrevet i hånden, så en forkert række er umulig
    // at få ind uden at denne test falder.
    for (const tal of PROCENT_10_AF_TAL) {
      expect(procentAf(tal, 10)).toBe(tal / 10);
    }
  });

  test("er stigende og uden dubletter", () => {
    expect(PROCENT_10_AF_TAL).toEqual([...PROCENT_10_AF_TAL].sort((a, b) => a - b));
    expect(new Set(PROCENT_10_AF_TAL).size).toBe(PROCENT_10_AF_TAL.length);
  });

  test("indeholder 75, fordi det er det eneste målte tal med komma i svaret", () => {
    const medDecimal = PROCENT_10_AF_TAL.filter((tal) => procentAf(tal, 10) % 1 !== 0);
    expect(medDecimal).toEqual([75]);
  });

  test("alle tal er positive heltal", () => {
    for (const tal of PROCENT_10_AF_TAL) {
      expect(Number.isInteger(tal)).toBe(true);
      expect(tal).toBeGreaterThan(0);
    }
  });
});

describe("de to formler er ikke det samme", () => {
  test("de samme to tal giver 25 procent ændring, men 22,2 procent forskel", () => {
    const [, belob] = PROCENT_SKILLNAD_EKSEMPEL;
    expect(procentForskel(belob.ny, belob.gammal)).toBe(25);
    expect(procentDifferens(belob.gammal, belob.ny)).toBeCloseTo(22.222, 3);
    // Det er hele fælden ved "procent skillnad mellan två tal": samme tal,
    // to svar. Formlen skal derfor aldrig kunne forveksles i teksten.
    expect(procentDifferens(belob.gammal, belob.ny)).not.toBe(
      procentForskel(belob.ny, belob.gammal)
    );
  });

  test("løn-eksemplet er 10 procent ændring, men 9,5 procent forskel", () => {
    const [lon] = PROCENT_SKILLNAD_EKSEMPEL;
    expect(procentForskel(lon.ny, lon.gammal)).toBe(10);
    expect(procentDifferens(lon.gammal, lon.ny)).toBeCloseTo(9.5238, 3);
  });

  test("eksemplerne er de tal siden allerede lover andre steder", () => {
    // 33 000 mot 30 000 = 10 procent står i FAQ'en, og 10 000 till 12 500 = 25
    // står i Excel-tabellen. En ny tekst må ikke give andre tal for de samme par.
    for (const { gammal, ny } of PROCENT_SKILLNAD_EKSEMPEL) {
      expect(procentForskel(ny, gammal)).toBeCloseTo(
        ((ny - gammal) / gammal) * 100,
        10
      );
    }
    expect(PROCENT_SKILLNAD_EKSEMPEL[0]).toMatchObject({ gammal: 30000, ny: 33000 });
    expect(PROCENT_SKILLNAD_EKSEMPEL[1]).toMatchObject({ gammal: 10000, ny: 12500 });
  });
});

describe("rabatProcent", () => {
  test("et prisfald er 12,5 procent rabat på 9.000 kr", () => {
    // Målt på læserens egne tal fra GSC's tredjestørste søgning på siden
    // ("en telefon er sat 1125 kr. ned. normalt koster den 9000 kr.",
    // 56 visninger, pos. 6). 1.125 / 9.000 = 12,5 %.
    expect(rabatProcent(9000, 7875)).toBe(12.5);
  });

  test("er altid positiv, selv om prisen faldt", () => {
    // procentForskel(7875, 9000) er -12,5, fordi et fald er negativt. En
    // rabat er et fald, og spørgsmålet "hvor stor er rabatten" forventer
    // 12,5 og ikke -12,5. Det er derfor værdien er absolut her og ikke i
    // teksten — en ny tekstformulering kan ikke slå fortegnet af.
    expect(procentForskel(RABAT_EKSEMPEL.nedsatPris, RABAT_EKSEMPEL.normalPris)).toBe(-12.5);
    expect(rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris)).toBe(12.5);
  });

  test("deler med den normale pris, ikke med den nye", () => {
    // Den fælde, svareafsnittet advarer om: 1.125 / 7.875 er 14,3 %, og det
    // er et andet spørgsmål end rabatten. De to tal må derfor aldrig kunne
    // forveksles ved at se ens ud.
    const medDenNye = rabatProcent(RABAT_EKSEMPEL.nedsatPris, RABAT_EKSEMPEL.nedsatPris);
    expect(medDenNye).toBe(0);
    const fejltal = procentForskel(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris);
    expect(fejltal).toBeCloseTo(14.2857, 3);
    expect(rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris)).not.toBeCloseTo(
      fejltal,
      1,
    );
  });

  test("giver de 25 procent, siden allerede lover i hverdagsbulletten", () => {
    // "25% rabat på en vare til 400 kr = du sparer 100 kr" står i
    // hverdagsafsnittet og er skrevet i hånden. Den nye funktion skal give
    // præcis den værdi, så de to steder ikke kan komme i strid.
    expect(rabatProcent(400, 300)).toBe(25);
    expect(400 - 300).toBe(procentAf(400, 25));
  });

  test("ingen ændring er 0 procent", () => {
    expect(rabatProcent(9000, 9000)).toBe(0);
  });

  test("en normalpris på 0 giver ingen division med 0", () => {
    expect(rabatProcent(0, 500)).toBe(0);
  });

  test("de almindelige satsers rækker følger procentAf", () => {
    for (const sats of RABAT_SATS) {
      expect(procentAf(RABAT_BELOEB, sats)).toBe((RABAT_BELOEB * sats) / 100);
      expect(RABAT_BELOEB - procentAf(RABAT_BELOEB, sats)).toBe(
        RABAT_BELOEB - (RABAT_BELOEB * sats) / 100,
      );
    }
  });
});

describe("RABAT_EKSEMPEL", () => {
  test("er priserne fra den søgning, afsnittet svarer på", () => {
    // GSC 2026-08-31 → 2026-09-28: "en telefon er sat 1125 kr. ned. normalt
    // koster den 9000 kr. hvor stor er rabatten i procent?" 56 visninger,
    // pos. 6. Hvis tallene ændres, skal søgningen og konstanten følge med.
    expect(RABAT_EKSEMPEL).toEqual({ normalPris: 9000, nedsatPris: 7875 });
  });

  test("nedsættelsen er 1.125 kr, så de tre tal i sætningen kan afledes", () => {
    const nedsat = RABAT_EKSEMPEL.normalPris - RABAT_EKSEMPEL.nedsatPris;
    expect(nedsat).toBe(1125);
    expect(RABAT_EKSEMPEL.normalPris).toBeGreaterThan(RABAT_EKSEMPEL.nedsatPris);
  });
});

describe("RABAT_SATS", () => {
  test("er stigende, uden dubletter og positive heltal", () => {
    expect(RABAT_SATS).toEqual([...RABAT_SATS].sort((a, b) => a - b));
    expect(new Set(RABAT_SATS).size).toBe(RABAT_SATS.length);
    for (const sats of RABAT_SATS) {
      expect(Number.isInteger(sats)).toBe(true);
      expect(sats).toBeGreaterThan(0);
      expect(sats).toBeLessThan(100);
    }
  });

  test("indeholder de satser, siden allerede dokumenterer", () => {
    // 10 % og 25 % står i "Hurtige procent-tricks" og i hverdagsbulletten,
    // så de er ikke nye påstande — de er de samme tal et andet sted. 33 %
    // nævnes uden for tabellen i sætningen om at den ikke er en tredjedel,
    // så den skal også stå i listen — ellers kan teksten tale om en sats,
    // tabellen ikke har, uden at nogen opdager det.
    for (const sats of [10, 25, 33]) {
      expect(RABAT_SATS).toContain(sats);
    }
  });

  test("33 er ikke en tredjedel, og det er derfor teksten siger det", () => {
    // Sætningen ved tabellen hævder præcis dette: en tredjedel af 1.000 kr
    // er 333,33 kr, så en tredjedels rabat giver 666,67 kr — ikke de 670 kr
    // som 33 % giver. Uden denne test kan teksten påstå det uden at nogen
    // har tjekket regnestykket.
    expect(RABAT_BELOEB - procentAf(RABAT_BELOEB, 33)).toBe(670);
    expect(procentAf(RABAT_BELOEB, 33)).not.toBeCloseTo(RABAT_BELOEB / 3, 5);
    expect(RABAT_BELOEB - RABAT_BELOEB / 3).toBeCloseTo(666.6667, 3);
  });

  test("hver sats giver en pris der koster mindre end beløbet", () => {
    for (const sats of RABAT_SATS) {
      expect(RABAT_BELOEB - procentAf(RABAT_BELOEB, sats)).toBeLessThan(RABAT_BELOEB);
    }
  });

  // RABAT_SATS_UDLAET blev navngivet, fordi to sætninger på siden og to
  // FAQ-svar regner med den. Uden denne port kunne navnet pege på en sats,
  // der ikke længere står i tabellen, og læseren ville få et tal, siden ikke
  // kan finde — præcis den fejl, konstanten blev navngivet for at undgå.
  test("den navngivne udlætssats står i tabellen, så tal og sætning følges", () => {
    expect(RABAT_SATS).toContain(RABAT_SATS_UDLAET);
    expect(RABAT_SATS_UDLAET).toBe(33);
  });
});
