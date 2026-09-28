import { describe, test, expect } from "vitest";
import {
  TIDS_EKSEEMPLER,
  TIDS_EKSEMPEL_DAG,
  TIDS_EKSEMPEL_FLERE_DAGE,
  TIDS_EKSEMPEL_MIDNAT,
  TIDS_EKSEMPEL_PAUSE,
  TIDS_UDEN_DATOER,
  excelDifferens,
  formatTidsvar,
  totalMinutter,
} from "./tids-eksempler";
import { beregnTidsinterval } from "./tidsberegner";

describe("TIDS_EKSEEMPLER", () => {
  test("eksemplet i sidens metaDescription er med og er korrekt", () => {
    const telefon = TIDS_EKSEEMPLER.find((e) => e.start === "08:30");
    expect(telefon).toBeDefined();
    expect(telefon!.slut).toBe("16:45");
    // Search Console: "08:30 til 16:45 er 8 timer og 15 minutter" er løftet i
    // title/description, så det SKAL være det, værktøjet faktisk regner.
    expect(telefon!.svar).toBe("8 t 15 min");
    expect(telefon!.decimalTimer).toBeCloseTo(8.25, 2);
  });

  test("hvert eksempel er beregnet af beregnTidsinterval, ikke håndskrevet", () => {
    for (const eksempel of TIDS_EKSEEMPLER) {
      const resultat = beregnTidsinterval({
        startTid: eksempel.start,
        slutTid: eksempel.slut,
        startDato: eksempel.startDato,
        slutDato: eksempel.slutDato,
        fratraekPause: eksempel.pause,
      })!;
      expect(eksempel.svar).toBe(
        `${resultat.timer} t ${resultat.minutter} min`
      );
      expect(eksempel.decimalTimer).toBe(resultat.decimalTimer);
      expect(eksempel.overMidnat).toBe(resultat.overMidnat);
    }
  });

  test("overMidnat betyder kun at sluttidspunktet er tidligere på dagen", () => {
    // Flagget siger, at uret står tilbage — ikke at sluttidspunktet er dagen
    // efter. Fredag 16:00 → mandag 09:00 har flaget, men slutter tre dage
    // senere, og derfor må tabellen kun skrive "(dagen efter)" på de
    // eksempler, der ikke har datofelter.
    const overMidnat = TIDS_EKSEEMPLER.filter((e) => e.overMidnat);
    expect(overMidnat.map((e) => e.start)).toEqual(["22:00", "16:00"]);
    expect(
      TIDS_EKSEEMPLER.filter((e) => e.overMidnat && e.startDato !== undefined)
        .length
    ).toBe(1);
  });

  test("alle klokkeslæt er gyldige HH:MM", () => {
    for (const eksempel of TIDS_EKSEEMPLER) {
      for (const klokkeslaet of [eksempel.start, eksempel.slut]) {
        expect(klokkeslaet).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      }
    }
  });

  test("et eksempel med kun én dato kan ikke forekomme", () => {
    // Ét dato felt uden det andet ignoreres stilt af beregnTidsinterval, så et
    // sådant eksempel ville vise et tal, der ikke svarer til det, der står i
    // klokkeslætskolonnerne.
    for (const eksempel of TIDS_EKSEEMPLER) {
      expect(Boolean(eksempel.startDato)).toBe(Boolean(eksempel.slutDato));
    }
  });

  test("de to eksempler med datofelter er med, fordi værktøjet kan dem", () => {
    // /tidsberegner har haft to valgfrie datofelter siden starten, men siden
    // nævnte dem aldrig, og ingen af de oprindelige fem eksempler brugte dem.
    const medDatoer = TIDS_EKSEEMPLER.filter((e) => e.startDato !== undefined);
    expect(medDatoer.length).toBeGreaterThanOrEqual(2);
    for (const eksempel of medDatoer) {
      const medDatoer = beregnTidsinterval({
        startTid: eksempel.start,
        slutTid: eksempel.slut,
        startDato: eksempel.startDato,
        slutDato: eksempel.slutDato,
        fratraekPause: eksempel.pause,
      })!;
      const udenDatoer = beregnTidsinterval({
        startTid: eksempel.start,
        slutTid: eksempel.slut,
        fratraekPause: eksempel.pause,
      })!;
      // Uden datoerne er svaret et andet — det er hele pointen med sektionen.
      expect(medDatoer.totalMinutter).not.toBe(udenDatoer.totalMinutter);
    }
  });

  test("brødtekstens eksempel er fredag 16:00 til mandag 09:00 = 65 timer", () => {
    // Tallene i afsnittet "Beregner tid på tværs af datoer" er hentet herfra,
    // så de kan ikke blive en anden værdi end den, værktøjet regner.
    expect(TIDS_EKSEMPEL_FLERE_DAGE.start).toBe("16:00");
    expect(TIDS_EKSEMPEL_FLERE_DAGE.slut).toBe("09:00");
    expect(TIDS_EKSEMPEL_FLERE_DAGE.startDato).toBe("2026-09-25");
    expect(TIDS_EKSEMPEL_FLERE_DAGE.slutDato).toBe("2026-09-28");
    expect(TIDS_EKSEMPEL_FLERE_DAGE.svar).toBe("65 t 0 min");
    expect(TIDS_EKSEMPEL_FLERE_DAGE.decimalTimer).toBeCloseTo(65, 2);
    expect(TIDS_UDEN_DATOER.da).toBe("17 t 0 min");
    expect(TIDS_UDEN_DATOER.se).toBe("17 h 0 min");
    // Samme tal, men med den notationsform hvert domæne bruger — danske
    // forkortelser på beraknare.se er en locale-leak.
    expect(formatTidsvar(TIDS_EKSEMPEL_FLERE_DAGE, "da")).toBe("65 t 0 min");
    expect(formatTidsvar(TIDS_EKSEMPEL_FLERE_DAGE, "se")).toBe("65 h 0 min");
  });
});

/**
 * De tre eksempler, Excel-afsnittet på /tidsberegner bruger. Sektionen er kun
 * troværdig, hvis tallene i den er de samme som dem TIDS_EKSEEMPLER og
 * beregnTidsinterval regner — ellers står der en ny sandhed ved siden af
 * værktøjet.
 */
describe("Excel-eksemplerne på /tidsberegner", () => {
  test("de tre er de samme rækker som tabellen viser", () => {
    // De er fundet i TIDS_EKSEEMPLER, så identiteten låses her: en ny række i
    // tabellen, der ændrer sig, må ikke kunne gøre brødteksten til en løgn.
    expect(TIDS_EKSEMPEL_DAG).toBe(
      TIDS_EKSEEMPLER.find((e) => e.start === "08:30" && e.slut === "16:45")
    );
    expect(TIDS_EKSEMPEL_MIDNAT).toBe(
      TIDS_EKSEEMPLER.find((e) => e.start === "22:00" && e.slut === "06:00")
    );
    expect(TIDS_EKSEMPEL_PAUSE).toBe(
      TIDS_EKSEEMPLER.find((e) => e.start === "09:00" && e.pause === 30)
    );
    // Metadatens løfte: "08:30 til 16:45 er 8 timer og 15 minutter" (C50).
    expect(TIDS_EKSEMPEL_DAG.svar).toBe("8 t 15 min");
    expect(TIDS_EKSEMPEL_DAG.decimalTimer).toBeCloseTo(8.25, 2);
    expect(TIDS_EKSEMPEL_MIDNAT.svar).toBe("8 t 0 min");
    expect(TIDS_EKSEMPEL_MIDNAT.overMidnat).toBe(true);
    expect(TIDS_EKSEMPEL_PAUSE.svar).toBe("7 t 30 min");
    expect(TIDS_EKSEMPEL_PAUSE.decimalTimer).toBeCloseTo(7.5, 2);
  });

  test("heleDoegn er det samme som Excel's =-B1 giver i en tal-celle", () => {
    // Excel gemmer et klokkeslæt som en brøkdel af et døgn, så `=B1-A1` i en
    // almindelig tal-celle giver 0,34375 for 08:30→16:45 — det er præcis den
    // fælde brødteksten beskriver, så værdien skal komme fra modulet.
    expect(TIDS_EKSEMPEL_DAG.heleDoegn).toBeCloseTo(495 / 1440, 6);
    expect(TIDS_EKSEMPEL_DAG.heleDoegn).toBeCloseTo(8.25 / 24, 6);
    for (const eksempel of TIDS_EKSEEMPLER) {
      // Uden pause er heleDoegn præcis decimaltimer delt med 24.
      if (eksempel.pause === 0 && eksempel.startDato === undefined) {
        expect(eksempel.heleDoegn).toBeCloseTo(eksempel.decimalTimer / 24, 6);
      }
    }
  });

  test("totalMinutter er hele intervallet i minutter", () => {
    // Det er tallet `=(B1-A1)*24*60` giver i Excel, altså den form, en
    // løntimesrapport bruger.
    expect(totalMinutter(TIDS_EKSEMPEL_DAG)).toBe(495);
    expect(totalMinutter(TIDS_EKSEMPEL_MIDNAT)).toBe(480);
    expect(totalMinutter(TIDS_EKSEMPEL_PAUSE)).toBe(450);
    for (const eksempel of TIDS_EKSEEMPLER) {
      const r = beregnTidsinterval({
        startTid: eksempel.start,
        slutTid: eksempel.slut,
        startDato: eksempel.startDato,
        slutDato: eksempel.slutDato,
        fratraekPause: eksempel.pause,
      })!;
      expect(totalMinutter(eksempel)).toBe(r.totalMinutter);
    }
  });

  test("excelDifferens er negativ for et interval over midnat", () => {
    // Det er hele fælden: Excel trækker sluttiden fra starttiden uden at vide
    // at nattetimen slutter næste dag, så `=B1-A1` giver -0,67 — og derfor
    // skal siden anbefale MOD(…;1). Tallene er håndskrevet her, fordi det er
    // dem brødtekten siger, og de er hentet fra de to klokkeslæt.
    const r = beregnTidsinterval({
      startTid: TIDS_EKSEMPEL_MIDNAT.start,
      slutTid: TIDS_EKSEMPEL_MIDNAT.slut,
    })!;
    // 06:00 − 22:00 = −16 timer = −960 minutter = −0,6667 døgn.
    expect((6 * 60 - 22 * 60) / (24 * 60)).toBeCloseTo(-0.6667, 3);
    expect(excelDifferens(TIDS_EKSEMPEL_MIDNAT)).toBeCloseTo(-960 / 1440, 6);
    expect(excelDifferens(TIDS_EKSEMPEL_MIDNAT)).toBeLessThan(0);
    // Og MOD(…;1)*24 tager de 24 timer med igen — præcis værktøjets svar.
    const wrapped = ((excelDifferens(TIDS_EKSEMPEL_MIDNAT) % 1) + 1) % 1;
    expect(wrapped * 24).toBeCloseTo(r.decimalTimer, 6);
  });

  test("excelDifferens er positiv i dagslys-eksemplet og med pause", () => {
    expect(excelDifferens(TIDS_EKSEMPEL_DAG)).toBeCloseTo(0.34375, 6);
    // Pausen er ikke en del af Excel-formlen, så den skal tælles fra sit eget
    // argument — 30 minutter er 0,5 time, og 8 − 0,5 = 7,5.
    expect(excelDifferens(TIDS_EKSEMPEL_PAUSE) * 24).toBeCloseTo(8, 6);
    expect(excelDifferens(TIDS_EKSEMPEL_PAUSE) * 24 - 0.5).toBeCloseTo(
      TIDS_EKSEMPEL_PAUSE.decimalTimer,
      6
    );
    expect(TIDS_EKSEMPEL_PAUSE.pause).toBe(30);
  });

  test("excelDifferens er det rå celletal, ikke det rettede heleDoegn", () => {
    // Præcis forskellen, der gør hele fælden: `beregnTidsinterval` *retter*
    // et negativt resultat ved at lægge 24 timer til, fordi værktøjet skal vise
    // 8 timer for en nattevagt. Excel gør ikke det. Hvis nogen senere låner
    // `heleDoegn` i stedet, forsvinder hele den negative værdi, og siden
    // kommer til at sige at Excel regner det rigtige.
    expect(excelDifferens(TIDS_EKSEMPEL_MIDNAT)).not.toBeCloseTo(
      TIDS_EKSEMPEL_MIDNAT.heleDoegn,
      3
    );
    // Mod-varianten, altså præcis det siden beder læseren skrive.
    const wrapped = ((excelDifferens(TIDS_EKSEMPEL_MIDNAT) % 1) + 1) % 1;
    expect(wrapped * 24).toBeCloseTo(TIDS_EKSEMPEL_MIDNAT.decimalTimer, 6);
    // Og for et interval i dagslys er de to tal ens — så funktionen er ikke
    // alene en særfejl-fabrik, men den rå sandhed.
    expect(excelDifferens(TIDS_EKSEMPEL_DAG)).toBeCloseTo(
      TIDS_EKSEMPEL_DAG.heleDoegn,
      6
    );
  });

  test("afsnittet bruger kun de to eksempler uden datofelter", () => {
    // excelDifferens regner på de to *celler* alene. Et eksempel med
    // datofelter ville give et negativt tal, selv om Excel ville tælle
    // datoerne med, så brødteksten bruger ikke sådan et.
    expect(TIDS_EKSEMPEL_DAG.startDato).toBeUndefined();
    expect(TIDS_EKSEMPEL_MIDNAT.startDato).toBeUndefined();
    expect(TIDS_EKSEMPEL_PAUSE.startDato).toBeUndefined();
  });
});
