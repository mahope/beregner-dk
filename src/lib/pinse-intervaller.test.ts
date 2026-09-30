import { describe, expect, test } from "vitest";
import {
  naestePinseInterval,
  pinseAfstande,
  pinseAar,
  pinseInterval,
} from "./pinse-intervaller";
import { daysBetween, easterSunday } from "./dage-til";
import { erArbejdsdag, getHelligdage, taellArbejdsdage } from "./helligdage";

/** 1990-2050: the window earlier iterations used, so the claims are comparable. */
const AAR = Array.from({ length: 61 }, (_, i) => 1990 + i);

describe("pinse-intervaller", () => {
  test("de tre dage ligger på hver sin fast ugedag i 61 år", () => {
    // Påskedagen er en søndag, så +39 er torsdag, +49 er søndag igen og +50 er
    // mandag. Det er ikke tre valgte år: det er hele det vindue, tekstens
    // "altid" skal dække.
    for (const year of AAR) {
      const interval = pinseInterval(year, "da");
      expect(interval.paaskedag.getDay(), `påskedag ${year}`).toBe(0);
      expect(interval.himmelfartsdag.getDay(), `himmelfart ${year}`).toBe(4);
      expect(interval.pinsedag.getDay(), `pinse ${year}`).toBe(0);
      expect(interval.andenPinsedag.getDay(), `2. pinsedag ${year}`).toBe(1);
    }
  });

  test("datoerne er påskedagen plus 39, 49 og 50 dage — hvert år", () => {
    for (const year of AAR) {
      for (const locale of ["da", "se"] as const) {
        const interval = pinseInterval(year, locale);
        const paaske = interval.paaskedag;
        expect(daysBetween(paaske, interval.himmelfartsdag), `${locale} ${year}`).toBe(39);
        expect(daysBetween(paaske, interval.pinsedag), `${locale} ${year}`).toBe(49);
        expect(daysBetween(paaske, interval.andenPinsedag), `${locale} ${year}`).toBe(50);
      }
    }
  });

  test("de danske og svenske dage er samme dato, kun loven er forskellig", () => {
    for (const year of AAR) {
      const da = pinseInterval(year, "da");
      const se = pinseInterval(year, "se");
      expect(da.paaskedag.getTime()).toBe(se.paaskedag.getTime());
      expect(da.himmelfartsdag.getTime()).toBe(se.himmelfartsdag.getTime());
      expect(da.pinsedag.getTime()).toBe(se.pinsedag.getTime());
      expect(da.andenPinsedag.getTime()).toBe(se.andenPinsedag.getTime());
    }
  });

  test("påskedagen er den dag, påske-algoritmen faktisk regner", () => {
    // Uafhængigt af modulet: påskedagen skal være easterSunday() konverteret
    // til et lokalt midnatspunkt, ellers ville hele tabellen kun være
    // internt konsistent.
    for (const year of AAR) {
      const easter = easterSunday(year);
      const forventet = new Date(
        easter.getUTCFullYear(),
        easter.getUTCMonth(),
        easter.getUTCDate()
      );
      expect(pinseInterval(year, "da").paaskedag.getTime()).toBe(forventet.getTime());
    }
  });

  test("pinseperioden er de 12 kalenderdage fra himmelfartsdag til 2. pinsedag", () => {
    // Det er det, der gør svaret på "hvor mange dage er der i pinsen" overraskende:
    // de tre helligdage ligger i to kalenderuger, så pinsen er ikke én uge.
    for (const year of AAR) {
      for (const locale of ["da", "se"] as const) {
        const interval = pinseInterval(year, locale);
        expect(interval.periodeKalenderdage, `${locale} ${year}`).toBe(12);
        expect(interval.dageHimmelfartTilAndenPinse, `${locale} ${year}`).toBe(11);
        expect(daysBetween(interval.himmelfartsdag, interval.pinsedag), `${locale} ${year}`).toBe(10);
      }
    }
  });

  test("de 12 dage er delt mellem arbejdsdage, weekender og helligdage", () => {
    // Perioden er 12 kalenderdage fra torsdag til mandag og spænder dermed to
    // weekender. De tre kategorier skal dække alle 12 dage præcis én gang — det
    // er den kontrol, der gør arbejdstallet troværdigt uden at håndskrive det.
    for (const year of AAR) {
      for (const locale of ["da", "se"] as const) {
        const p = pinseInterval(year, locale);
        expect(
          p.periodeArbejdsdage + p.periodeWeekenddage + p.periodeHelligdagePaaHverdag,
          `${locale} ${year}`
        ).toBe(p.periodeKalenderdage);
        expect(p.periodeWeekenddage, `${locale} ${year}`).toBe(4);
        expect(p.periodeFrieDage, `${locale} ${year}`).toBe(
          p.periodeWeekenddage + p.periodeHelligdagePaaHverdag
        );
      }
    }
  });

  test("Sverige har aldrig færre arbejdsdage end Danmark i perioden", () => {
    // Mandagen efter pingstdagen er 2. pinsedag og dermed helligdag i Danmark,
    // mens den er en almindelig arbejdsdag i Sverige — den forskel påvirker
    // alle 61 år. De øvrige helligdage i perioden er ikke fælles: Danmark har
    // grundlovsdagen 5. juni, Sverige nationaldagen 6. juni, og forskellen mellem
    // de to lande er derfor 1, 2 eller 0 dage alt efter hvor de falder på en
    // hverdag. Det er præcis derfor, siden ikke hævder et fast tal.
    for (const year of AAR) {
      const da = pinseInterval(year, "da");
      const se = pinseInterval(year, "se");
      expect(se.periodeArbejdsdage, `${year}`).toBeGreaterThanOrEqual(
        da.periodeArbejdsdage
      );
      expect([5, 6], `da ${year}`).toContain(da.periodeArbejdsdage);
      expect([6, 7], `se ${year}`).toContain(se.periodeArbejdsdage);
    }
    // 1992 er det interessante år: grundlovsdagen 5. juni er en fredag, mens
    // Sveriges nationaldag 6. juni er en lørdag og derfor ikke tager en
    // arbejdsdag med. Forskellen er derfor 2 dage, ikke 1.
    expect(pinseInterval(1992, "da").periodeArbejdsdage).toBe(5);
    expect(pinseInterval(1992, "se").periodeArbejdsdage).toBe(7);
  });

  test("de tre pinsedage er altid i periodens navneliste", () => {
    for (const year of AAR) {
      for (const locale of ["da", "se"] as const) {
        const navne = pinseInterval(year, locale).periodeHelligdagsnavne;
        for (const dag of pinseInterval(year, locale).dage) {
          if (dag.helligdag) expect(navne, `${locale} ${year}`).toContain(dag.navn);
        }
        // Annandag pingst er ikke en helgdag i Sverige, så den må ikke stå der.
        expect(navne, `se ${year}`).not.toContain("Annandag pingst");
      }
    }
  });

  test("grundlovsdagen kan ligge i perioden — og i 1995 er den 2. pinsedag", () => {
    // Når kristi himmelfartsdag falder sidst i maj, kommer grundlovsdagen 5. juni
    // ind i de 12 dage. Det sker i 7 af de 61 år, så sætningen på siden lister
    // helligdagene ud af `getHelligdage` i stedet for at sige "tre". I 1995 er
    // 2. pinsedag 5. juni — samme dag som grundlovsdagen — så de tælles som én.
    const medGrundlovsdag = AAR.filter((year) =>
      pinseInterval(year, "da").periodeHelligdagsnavne.includes("Grundlovsdag")
    );
    expect(medGrundlovsdag.length).toBeGreaterThan(0);
    for (const year of medGrundlovsdag) {
      const p = pinseInterval(year, "da");
      // Helligdagene tælles pr. dag: 1995 har grundlovsdagen og 2. pinsedag på
      // samme dato, så listen har fire navne, men dagen tælles én gang.
      expect(p.periodeHelligdage, `da ${year}`).toBeLessThanOrEqual(4);
      expect(p.periodeHelligdagsnavne.length).toBeLessThanOrEqual(4);
      expect(p.periodeArbejdsdage, `da ${year}`).toBeGreaterThanOrEqual(5);
    }
    // 1995: påskedagen 16. april, så 2. pinsedag er 5. juni — grundlovsdagen.
    const s1995 = pinseInterval(1995, "da");
    expect(s1995.andenPinsedag.getMonth()).toBe(5);
    expect(s1995.andenPinsedag.getDate()).toBe(5);
    expect(s1995.periodeHelligdagsnavne).toEqual([
      "Kristi himmelfartsdag",
      "Pinsedag",
      "Grundlovsdag",
      "2. pinsedag",
    ]);
    expect(s1995.periodeHelligdage).toBe(3);
    expect(s1995.periodeArbejdsdage).toBe(6);
    // De to nærmeste år er hverken kollision eller grundlovsdag-i-perioden,
    // så det er de tal siden viser.
    expect(pinseInterval(2026, "da").periodeArbejdsdage).toBe(6);
    expect(pinseInterval(2027, "da").periodeArbejdsdage).toBe(6);
    expect(pinseInterval(2027, "se").periodeArbejdsdage).toBe(7);
  });

  test("kun 2. pinsedag er forskellig mellem landene", () => {
    // `Annandag pingst` står med vilje ikke på den svenska liste. Derfor er den
    // danske dags `helligdag` true, den svenske false, og de to tal for
    // perioden følger af netop det.
    for (const year of [2026, 2027, 2038]) {
      expect(pinseInterval(year, "da").dage[2].helligdag).toBe(true);
      expect(pinseInterval(year, "se").dage[2].helligdag).toBe(false);
      expect(erArbejdsdag(pinseInterval(year, "da").andenPinsedag, "da")).toBe(false);
      expect(erArbejdsdag(pinseInterval(year, "se").andenPinsedag, "se")).toBe(true);
    }
  });

  test("alle tre dage står i den danske helligdagsliste", () => {
    // Ellers ville `pinseInterval` finde dem ved navn og ikke kunne sige, at de
    // er helligdage. De er netop de tre, der manglede i listen før 30/9.
    for (const year of AAR) {
      const datoer = getHelligdage(year, "da").map((h) => h.name);
      expect(datoer).toContain("Kristi himmelfartsdag");
      expect(datoer).toContain("Pinsedag");
      expect(datoer).toContain("2. pinsedag");
    }
  });

  test("afstandene 39, 49 og 50 er de samme i begge lande og alle år", () => {
    for (const year of AAR) {
      for (const locale of ["da", "se"] as const) {
        expect(pinseAfstande(year, locale)).toEqual({
          himmelfart: 39,
          pinse: 49,
          andenPinse: 50,
          himmelfartTilPinse: 10,
        });
      }
    }
  });

  test("`dage` er sorteret på dato, og hver dag har påske-afstanden med", () => {
    for (const year of [2026, 2027]) {
      const { dage } = pinseInterval(year, "da");
      expect(dage.map((d) => d.dageFraPaaske)).toEqual([39, 49, 50]);
      expect(dage.map((d) => d.navn)).toEqual([
        "Kristi himmelfartsdag",
        "Pinsedag",
        "2. pinsedag",
      ]);
      for (let i = 1; i < dage.length; i++) {
        expect(dage[i].date.getTime()).toBeGreaterThan(dage[i - 1].date.getTime());
      }
    }
  });

  test("svenske dage bærer svenske navne", () => {
    const { dage } = pinseInterval(2027, "se");
    expect(dage.map((d) => d.navn)).toEqual([
      "Kristi himmelsfärdsdag",
      "Pingstdagen",
      "Annandag pingst",
    ]);
    // `Annandag pingst` er en navneform, ikke en helligdag — porten må ikke
    // finde den i den svenska liste.
    expect(getHelligdage(2027, "se").map((h) => h.name)).not.toContain("Annandag pingst");
  });

  test("pinseAar står på året pinse er over, også på selve mandagen", () => {
    const sidste = pinseInterval(2027, "da").andenPinsedag;
    // 2. pinsedag 2027 er 17. maj. Sidste time på dagen er stadig 2027, og
    // dagen efter er 2028.
    expect(pinseAar(new Date(2027, 4, 17, 23, 59))).toBe(2027);
    expect(pinseAar(new Date(2027, 4, 18, 0, 0))).toBe(2028);
    // Samme i Sverige: mandagen er ikke en röd dag, men perioden slutter der.
    expect(pinseAar(new Date(2027, 4, 17, 12, 0), "se")).toBe(2027);
    expect(pinseAar(new Date(2027, 4, 18, 12, 0), "se")).toBe(2028);
  });

  test("pinseAar læser kalenderåret i sidens egen tidszone", () => {
    // 31. december kl. 23:30 UTC er allerede 1. januar nytårsaften i både
    // København og Stockholm. Kalenderåret må følge tidszonen, ellers ville
    // nytårsaften regnes som næste års pinse fordi UTC stadig siger 2026.
    const nytarsaften = new Date("2026-12-31T23:30:00Z");
    expect(pinseAar(nytarsaften, "da")).toBe(2027);
    expect(pinseAar(nytarsaften, "se")).toBe(2027);
  });

  test("naestePinseInterval giver den pinse, der ikke er brugt endnu", () => {
    // 30. september 2026: pinse 2026 ligger i baggrund, så næste er 2027 med
    // påskedag 28. marts. Samme kald midt i pinseugen 2027 giver stadig 2027.
    const september = new Date(2026, 8, 30, 12, 0);
    const interval = naestePinseInterval(september, "da");
    expect(interval.year).toBe(2027);
    expect(interval.paaskedag.getMonth()).toBe(2);
    expect(interval.paaskedag.getDate()).toBe(28);
    expect(naestePinseInterval(new Date(2027, 4, 14, 12, 0), "da").year).toBe(2027);
    expect(naestePinseInterval(new Date(2026, 8, 30, 12, 0), "se").year).toBe(2027);
  });
});