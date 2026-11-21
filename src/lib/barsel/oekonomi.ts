/**
 * Income during the leave: salary, salary during leave (employer), barsels-
 * dagpenge or other benefits per week, distributed to calendar months.
 * All figures are rough estimates ("vejledende").
 */

import { REGLER } from "./regler";
import { addDays, monthKey } from "./dato";
import type { Analyse, ForaelderAnalyse } from "./motor";
import { estimerNettoMaaned } from "./netto";
import type { BarselsPlan, Foraelder } from "./types";

const UGER_PR_AAR = 52;
const AM = 0.08;

export interface UgeIndkomst {
  /** Salary incl. salary paid by the employer during leave (AM-bidrag applies). */
  loen: number;
  /** Barselsdagpenge, a-dagpenge or SU (no AM-bidrag). */
  ydelse: number;
  /** Of which salary during leave paid by the employer. */
  barselsloen: number;
  /** Of which barselsdagpenge. */
  dagpenge: number;
}

export interface MaanedIndkomst {
  maaned: string;
  loen: number;
  ydelse: number;
  brutto: number;
  normal: number;
  netto: number;
  normalNetto: number;
}

export interface ForaelderOekonomi {
  id: Foraelder["id"];
  ugesats: number;
  normalUge: number;
  maaneder: MaanedIndkomst[];
  bruttoIAlt: number;
  normalIAlt: number;
  nettoIAlt: number;
  normalNettoIAlt: number;
  tabBrutto: number;
  tabNetto: number;
}

export interface Oekonomi {
  maaneder: string[];
  foraeldre: ForaelderOekonomi[];
  husstand: { maaned: string; netto: number; normalNetto: number; brutto: number }[];
  tabNetto: number;
  tabBrutto: number;
}

/** Normal weekly income when working. */
export function normalUgeindkomst(f: Foraelder): { loen: number; ydelse: number } {
  switch (f.beskaeftigelse) {
    case "loenmodtager":
    case "selvstaendig":
      return { loen: (f.maanedsloen * 12) / UGER_PR_AAR, ydelse: 0 };
    case "ledig":
    case "studerende":
      return { loen: 0, ydelse: (f.ydelseMaaned * 12) / UGER_PR_AAR };
  }
}

/**
 * Weekly barselsdagpenge for a full leave week (before tax).
 * Wage earners: hours × min(hourly pay after AM-bidrag, max hourly rate),
 * capped at the weekly maximum (barselsloven § 33 and § 35).
 */
export function ugesats(f: Foraelder): number {
  switch (f.beskaeftigelse) {
    case "loenmodtager": {
      const timer = Math.max(1, f.ugentligeTimer);
      const timeloenEfterAm = ((f.maanedsloen * 12) / UGER_PR_AAR / timer) * (1 - AM);
      // The hourly cap is the weekly maximum divided by 37 hours (137,43 kr. rounded).
      const timesats = Math.min(timeloenEfterAm, REGLER.maksUgesats / REGLER.fuldtidTimer);
      return Math.min(timer * timesats, REGLER.maksUgesats);
    }
    case "selvstaendig":
      // Based on the profit; full rate needs ~264.420 kr. a year (borger.dk 2026).
      return Math.min((f.maanedsloen * 12) / UGER_PR_AAR, REGLER.maksUgesats);
    case "ledig":
      // Same rate as unemployment benefits (§ 36), capped at the maximum.
      return Math.min((f.ydelseMaaned * 12) / UGER_PR_AAR, REGLER.maksUgesats);
    case "studerende":
      // SU continues as fødsels-støtte; no barselsdagpenge.
      return 0;
  }
}

/** Income per leave week for one parent. */
export function ugeindkomster(f: Foraelder, a: ForaelderAnalyse): Map<number, UgeIndkomst> {
  const normal = normalUgeindkomst(f);
  const sats = ugesats(f);
  const segmenter = f.beskaeftigelse === "loenmodtager" ? f.loenUnderBarsel.map((s) => ({ ...s })) : [];
  const result = new Map<number, UgeIndkomst>();
  const weeks = [...a.uger.values()].sort((x, y) => x.uge - y.uge);

  for (const u of weeks) {
    const c = u.celle;
    if (!c) continue;
    const arbejde = 1 - u.andel;
    const udenRet = u.fordeling["uden-ret"] ?? 0;
    let medRet = u.andel - udenRet;
    let loen = normal.loen * arbejde;
    let ydelse = normal.ydelse * arbejde;
    let barselsloen = 0;
    let dagpenge = 0;

    if (c.type === "ferie") {
      loen = normal.loen;
      ydelse = normal.ydelse;
    } else {
      if (f.beskaeftigelse === "studerende") {
        // Fødsels-støtte: SU continues during the leave.
        ydelse += normal.ydelse * u.andel;
      } else {
        // Salary during leave covers leave weeks in order (also weeks without benefits).
        let orlov = u.andel;
        for (const s of segmenter) {
          if (orlov <= 0) break;
          const take = Math.min(s.uger, orlov);
          if (take <= 0) continue;
          const beloeb = normal.loen * take * (s.procent / 100);
          barselsloen += beloeb;
          loen += beloeb;
          s.uger -= take;
          orlov -= take;
          medRet = Math.max(0, medRet - take);
        }
        dagpenge = sats * medRet;
        ydelse += dagpenge;
      }
    }
    result.set(u.uge, { loen, ydelse, barselsloen, dagpenge });
  }
  return result;
}

export function beregnOekonomi(plan: BarselsPlan, analyse: Analyse): Oekonomi {
  const anker = plan.dato;
  const fra = analyse.foersteUge;
  const til = analyse.sidsteUge;
  const maanedSet = new Set<string>();
  for (let d = 0; d < (til - fra) * 7; d++) maanedSet.add(monthKey(addDays(anker, fra * 7 + d)));
  const maaneder = [...maanedSet].sort();

  const foraeldre: ForaelderOekonomi[] = plan.foraeldre.map((f, i) => {
    const a = analyse.foraeldre[i];
    const ugeInd = ugeindkomster(f, a);
    const normal = normalUgeindkomst(f);
    const perMaaned = new Map<string, { loen: number; ydelse: number; normalLoen: number; normalYdelse: number }>();
    for (const m of maaneder) perMaaned.set(m, { loen: 0, ydelse: 0, normalLoen: 0, normalYdelse: 0 });

    for (let w = fra; w < til; w++) {
      const ind = ugeInd.get(w) ?? { loen: normal.loen, ydelse: normal.ydelse };
      for (let d = 0; d < 7; d++) {
        const m = perMaaned.get(monthKey(addDays(anker, w * 7 + d)))!;
        m.loen += ind.loen / 7;
        m.ydelse += ind.ydelse / 7;
        m.normalLoen += normal.loen / 7;
        m.normalYdelse += normal.ydelse / 7;
      }
    }

    const kommuneskat = plan.kommuneskatPct / 100;
    const rows: MaanedIndkomst[] = maaneder.map((maaned) => {
      const m = perMaaned.get(maaned)!;
      const netto = estimerNettoMaaned({ loen: m.loen, ydelse: m.ydelse, kommuneskat }).netto;
      const normalNetto = estimerNettoMaaned({ loen: m.normalLoen, ydelse: m.normalYdelse, kommuneskat }).netto;
      return {
        maaned,
        loen: m.loen,
        ydelse: m.ydelse,
        brutto: m.loen + m.ydelse,
        normal: m.normalLoen + m.normalYdelse,
        netto,
        normalNetto,
      };
    });
    const sum = (k: keyof MaanedIndkomst) => rows.reduce((s, r) => s + (r[k] as number), 0);
    return {
      id: f.id,
      ugesats: ugesats(f),
      normalUge: normal.loen + normal.ydelse,
      maaneder: rows,
      bruttoIAlt: sum("brutto"),
      normalIAlt: sum("normal"),
      nettoIAlt: sum("netto"),
      normalNettoIAlt: sum("normalNetto"),
      tabBrutto: sum("normal") - sum("brutto"),
      tabNetto: sum("normalNetto") - sum("netto"),
    };
  });

  const husstand = maaneder.map((maaned, idx) => ({
    maaned,
    netto: foraeldre.reduce((s, f) => s + f.maaneder[idx].netto, 0),
    normalNetto: foraeldre.reduce((s, f) => s + f.maaneder[idx].normalNetto, 0),
    brutto: foraeldre.reduce((s, f) => s + f.maaneder[idx].brutto, 0),
  }));

  return {
    maaneder,
    foraeldre,
    husstand,
    tabNetto: foraeldre.reduce((s, f) => s + f.tabNetto, 0),
    tabBrutto: foraeldre.reduce((s, f) => s + f.tabBrutto, 0),
  };
}
