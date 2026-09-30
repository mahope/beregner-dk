import { describe, expect, test } from "vitest";
import {
  GNNEMSNIT_DAGE_PR_MAANED,
  aarstal,
  erSkudaar,
  denneMaanedEksempel,
  maanedEksempel,
  maanederITaar,
} from "./dato-eksempler";
import { daysBetween } from "./dage-til";
import { taellArbejdsdage, taellWeekender } from "./helligdage";

describe("dato-eksempler", () => {
  test("en måneds længde er den forskel densanden har på sig", () => {
    // Uafhængig af modulet: månedslængden er simpelthen dage mellem første dag
    // og den første dag i næste måned. Formlen i Excel-afsnittet er præcis
    // denne forskel, så tabellen og regnestykket kan ikke sige hinanden modsat.
    for (const raekke of maanederITaar(2026, "da")) {
      const foerste = new Date(2026, raekke.month - 1, 1);
      const naeste = new Date(2026, raekke.month, 1);
      expect(raekke.dage).toBe(daysBetween(foerste, naeste));
    }
  });

  test("februar er 28 dage i 2026 og 29 i et skudår", () => {
    const feb26 = maanederITaar(2026, "da").find((r) => r.month === 2)!;
    expect(feb26.dage).toBe(28);
    expect(feb26.skudaar).toBe(false);
    const feb28 = maanederITaar(2028, "da").find((r) => r.month === 2)!;
    expect(feb28.dage).toBe(29);
    expect(feb28.skudaar).toBe(true);
  });

  test("kun februar kan være skudårsflaget", () => {
    for (const raekke of maanederITaar(2028, "da")) {
      expect(raekke.skudaar).toBe(raekke.month === 2);
    }
  });

  test("skudårsreglen følger den gregorianske, ikke den naive", () => {
    expect(erSkudaar(2024)).toBe(true);
    expect(erSkudaar(2026)).toBe(false);
    expect(erSkudaar(2000)).toBe(true);
    expect(erSkudaar(2100)).toBe(false);
  });

  test("de niogtyve dages spørgsmål er besvaret: syv måneder har 31 dage", () => {
    const raekker = maanederITaar(2026, "da");
    expect(raekker.filter((r) => r.dage === 31).map((r) => r.month)).toEqual([
      1, 3, 5, 7, 8, 10, 12,
    ]);
    expect(raekker.filter((r) => r.dage === 30).map((r) => r.month)).toEqual([4, 6, 9, 11]);
  });

  test("de tolv rækker summerer til hele årets arbejdsdage", () => {
    // Kontrollen der gør tabellen brugbar: summerer de tolv måneder til det
    // tal, `taellArbejdsdage` giver for hele året, kan rækkerne ikke have en
    // forkert måned. 2026 er dansk 251 og svensk 252, fordi danskerne har
    // kristi himmelfartsdag (torsdag 14. maj) og 2. pinsedag (mandag 25. maj)
    // som hverdage, mens svenskerne kun har pingstdagen — en søndag.
    const dansk = maanederITaar(2026, "da").reduce((sum, r) => sum + r.arbejdsdage, 0);
    const svensk = maanederITaar(2026, "se").reduce((sum, r) => sum + r.arbejdsdage, 0);
    expect(dansk).toBe(taellArbejdsdage(new Date(2026, 0, 1), new Date(2026, 11, 31), "da"));
    expect(aarstal(2026, "da").arbejdsdage).toBe(251);
    expect(aarstal(2026, "se").arbejdsdage).toBe(252);
    expect(svensk).toBe(aarstal(2026, "se").arbejdsdage);
  });

  test("arbejdsdage plus weekenddage er aldrig mere end månedens dage", () => {
    // Helligdage ligger nogle gange på en lørdag eller søndag, så de tælles
    // ikke to gange. Derfor er summen ≤ månedens længde, og aldrig større.
    for (const raekke of maanederITaar(2026, "da")) {
      expect(raekke.arbejdsdage + raekke.weekenddage).toBeLessThanOrEqual(raekke.dage);
      expect(raekke.arbejdsdage).toBeGreaterThan(0);
    }
  });

  test("arbejdsdage og weekenddage er de samme tal som værktøjets egne", () => {
    for (const raekke of maanederITaar(2026, "da")) {
      const foerste = new Date(2026, raekke.month - 1, 1);
      const sidste = new Date(2026, raekke.month, 0);
      expect(raekke.arbejdsdage).toBe(taellArbejdsdage(foerste, sidste, "da"));
      expect(raekke.weekenddage).toBe(taellWeekender(foerste, sidste));
    }
  });

  test("månedens navne er oversat, og month er 1-12", () => {
    const da = maanederITaar(2026, "da");
    const se = maanederITaar(2026, "se");
    expect(da.map((r) => r.name)).toEqual([
      "januar", "februar", "marts", "april", "maj", "juni",
      "juli", "august", "september", "oktober", "november", "december",
    ]);
    expect(se.map((r) => r.name)).toEqual([
      "januari", "februari", "mars", "april", "maj", "juni",
      "juli", "augusti", "september", "oktober", "november", "december",
    ]);
    expect(da.map((r) => r.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    // Ingen af navnene må have et tegn, der kun findes i det andet sprog.
    for (const r of se) expect(r.name).not.toMatch(/[æøå]/);
    for (const r of da) expect(r.name).not.toMatch(/[ö]/);
  });

  test("årstallet er 365 dage og 366 i skudår", () => {
    expect(aarstal(2026, "da").dage).toBe(365);
    expect(aarstal(2026, "da").skudaar).toBe(false);
    expect(aarstal(2028, "da").dage).toBe(366);
    expect(aarstal(2028, "da").skudaar).toBe(true);
    expect(aarstal(2026, "da").maneder).toBe(12);
    // Skudåret har 366 dage, men stadig 12 måneder — 29. februar ligger inde i
    // februar. En "13. måned" er den fejl, der lå i modulet.
    expect(aarstal(2028, "da").maneder).toBe(12);
    expect(aarstal(2028, "da").maneder).not.toBe(13);
  });

  test("et år er lidt mere end 52 uger", () => {
    // "1 år ≈ 52 uger" står i Nyttige datofakta. Løsningen på "hvor mange dage
    // er der i et år" skal derfor ikke modsige den.
    expect(aarstal(2026, "da").dage / 7).toBeGreaterThan(52);
    expect(aarstal(2026, "da").dage / 7).toBeCloseTo(52.1, 1);
  });

  test("gennemsnittet er 30,44 og er ikke en af månederne", () => {
    expect(GNNEMSNIT_DAGE_PR_MAANED).toBeCloseTo(30.44, 2);
    // Teksten siger, at gennemsnittet "er et regnestykke, ikke en virkelig
    // måned". Det er kun sandt, fordi ingen måned har præcis gennemsnittet —
    // de fire 30-dages måneder ligger 0,44 under det, de syv 31-dages 0,56
    // over. Testen må derfor ikke afrunde: Math.round(30,436875) er 30, som
    // *er* en rigtig måneds længde, og låsen ville være forkert.
    const dage = maanederITaar(2026, "da").map((r) => r.dage);
    expect(dage).not.toContain(GNNEMSNIT_DAGE_PR_MAANED);
    expect(dage.filter((d) => d === 30)).toHaveLength(4);
    expect(dage.filter((d) => d === 31)).toHaveLength(7);
  });

  test("eksemplet er februar 2026, og formlen giver præcis månedens længde", () => {
    const eksempel = maanedEksempel(2026, 2, "da");
    expect(eksempel.start).toBe("2026-02-01");
    // B1 er dagen *efter* månedens sidste dag — det er den fælde, teksten
    // advarer om, så eksemplet selv skal vise den rigtige dato.
    expect(eksempel.sluttOgKoeb).toBe("2026-03-01");
    expect(eksempel.formelResultat).toBe(28);
    expect(eksempel.aarDage).toBe(365);
    expect(eksempel.aarArbejdsdage).toBe(251);
  });

  test("eksemplet følger det år, det bliver kaldt med", () => {
    // Kaldet kommer med `tilbage.year` fra dageTilbageIAaret, så et skudår kan
    // ikke blive vist med årets gamle tal stående i teksten.
    const eksempel = maanedEksempel(2028, 2, "se");
    expect(eksempel.aarDage).toBe(366);
    expect(eksempel.formelResultat).toBe(29);
    expect(eksempel.aar).toBe(2028);
  });

  test("de niogtyve måneders sum er 365 dage", () => {
    // Den simple kontrol på tabellen: de tolv længder skal summere til året.
    for (const aar of [2025, 2026, 2028]) {
      const sum = maanederITaar(aar, "da").reduce((s, r) => s + r.dage, 0);
      expect(sum).toBe(aarstal(aar, "da").dage);
    }
  });

  test("den her måned er den, kalenderen står i, med dage brugt og dage tilbage", () => {
    const nu = denneMaanedEksempel(new Date(2026, 6, 21, 12), "da");
    expect(nu.month).toBe(7);
    expect(nu.name).toBe("juli");
    expect(nu.dage).toBe(31);
    expect(nu.dageForbruget).toBe(21);
    expect(nu.dageTilbage).toBe(10);
    expect(nu.foersteDag).toBe("2026-07-01");
    expect(nu.sidsteDag).toBe("2026-07-31");
  });

  test("dageForbruget + dageTilbage er altid månedens længde, i alle 12 måneder", () => {
    // Fælden ved "dage tilbage i måneden" er en tæller der løber en dag for
    // hver måned. Hele året gennem, i begge kalenderår.
    for (const year of [2026, 2027]) {
      for (let day = 1; day <= 31; day++) {
        for (let month = 1; month <= 12; month++) {
          const foerste = new Date(year, month - 1, 1);
          const naeste = new Date(year, month, 1);
          const dage = daysBetween(foerste, naeste);
          if (day > dage) continue;
          const nu = denneMaanedEksempel(new Date(year, month - 1, day, 12), "da");
          expect(nu.dageForbruget + nu.dageTilbage).toBe(dage);
          expect(nu.dage).toBe(dage);
          expect(nu.dato).toBe(day);
        }
      }
    }
  });

  test("den her måned er den samme række som tabellen viser", () => {
    // Månedslængden og arbejdsdagene må ikke kunne glide fra hinanden mellem
    // det ene svar og den tolv-rækkers tabel.
    for (const [year, month, day] of [
      [2026, 1, 15],
      [2028, 2, 29],
      [2027, 12, 31],
    ] as const) {
      const nu = denneMaanedEksempel(new Date(year, month - 1, day, 12), "da");
      const raekke = maanederITaar(year, "da").find((r) => r.month === month)!;
      expect(nu.dage).toBe(raekke.dage);
      expect(nu.arbejdsdage).toBe(raekke.arbejdsdage);
      expect(nu.weekenddage).toBe(raekke.weekenddage);
    }
  });

  test("dagens dato læses i Europe/Copenhagen, ikke i serverens tidszone", () => {
    // En UTC-server kl. 00:30 dansk tid er stadig i går. Uden tidszonen ville
    // måneden og dagsforbruget være en dag tilbage.
    const senNat = new Date("2026-07-01T00:30:00+02:00");
    const nu = denneMaanedEksempel(senNat, "da");
    expect(nu.year).toBe(2026);
    expect(nu.month).toBe(7);
    expect(nu.name).toBe("juli");
    expect(nu.dato).toBe(1);
  });
});
