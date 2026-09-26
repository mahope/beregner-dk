import { describe, test, expect } from "vitest";
import { TIDS_EKSEEMPLER } from "./tids-eksempler";
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
        fratraekPause: eksempel.pause,
      })!;
      expect(eksempel.svar).toBe(
        `${resultat.timer} t ${resultat.minutter} min`
      );
      expect(eksempel.decimalTimer).toBe(resultat.decimalTimer);
      expect(eksempel.overMidnat).toBe(resultat.overMidnat);
    }
  });

  test("nættevagten over midnat er markeret, de andre ikke", () => {
    const overMidnat = TIDS_EKSEEMPLER.filter((e) => e.overMidnat);
    expect(overMidnat.map((e) => e.start)).toEqual(["22:00"]);
  });

  test("alle klokkeslæt er gyldige HH:MM", () => {
    for (const eksempel of TIDS_EKSEEMPLER) {
      for (const klokkeslaet of [eksempel.start, eksempel.slut]) {
        expect(klokkeslaet).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      }
    }
  });
});
