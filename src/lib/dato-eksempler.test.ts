import { describe, expect, test } from "vitest";
import {
  GNNEMSNIT_DAGE_PR_MAANED,
  aarstal,
  erSkudaar,
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
    // forkert måned. 2026 er dansk 253 og svensk 252, fordi den danske
    // grundlovsdag og den svenske hedningaftensdag ligger på hver sin dag.
    const dansk = maanederITaar(2026, "da").reduce((sum, r) => sum + r.arbejdsdage, 0);
    const svensk = maanederITaar(2026, "se").reduce((sum, r) => sum + r.arbejdsdage, 0);
    expect(dansk).toBe(taellArbejdsdage(new Date(2026, 0, 1), new Date(2026, 11, 31), "da"));
    expect(aarstal(2026, "da").arbejdsdage).toBe(253);
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
    expect(eksempel.aarArbejdsdage).toBe(253);
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
});
