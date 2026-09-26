import { describe, test, expect } from "vitest";
import {
  TIDS_EKSEEMPLER,
  TIDS_EKSEMPEL_FLERE_DAGE,
  TIDS_UDEN_DATOER,
  formatTidsvar,
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
    expect(telefon!.decimalTimer).toBe("8.25");
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
    expect(TIDS_EKSEMPEL_FLERE_DAGE.decimalTimer).toBe("65.00");
    expect(TIDS_UDEN_DATOER.da).toBe("17 t 0 min");
    expect(TIDS_UDEN_DATOER.se).toBe("17 h 0 min");
    // Samme tal, men med den notationsform hvert domæne bruger — danske
    // forkortelser på beraknare.se er en locale-leak.
    expect(formatTidsvar(TIDS_EKSEMPEL_FLERE_DAGE, "da")).toBe("65 t 0 min");
    expect(formatTidsvar(TIDS_EKSEMPEL_FLERE_DAGE, "se")).toBe("65 h 0 min");
  });
});
