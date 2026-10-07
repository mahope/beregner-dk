/**
 * Elbil-lading — hvad koster det at lade en elbil fra A til B?
 *
 * Regningen er ren energiøkonomi: et batteri på `batteriKwh` kWh, der skal
 * fyldes fra `ladningNuPct` til `ladningTilPct` procent, skal have
 *
 *   kWh til opladning = batteri × (til − nu) ÷ 100
 *
 * og koster `kWh × elpris`. Prisen pr. 100 km og pr. måned følger af bilens
 * forbrug på samme måde som `/elbil` regner besparelsen: `forbrug × elpris`,
 * uden nogen effektivitetsfaktor, så de to sider ikke kan glide fra hinanden.
 *
 * Standardværdierne (elpris og forbrug) læses fra `ELBIL_FORUDSETNINGER` i
 * `braendstof.ts` — samme kilde som `/elbil` og `/braendstof` bruger.
 */

import { ELBIL_FORUDSETNINGER } from "./braendstof";

/** Måneder på et år, til omregning af årlig kørsel til månedlig. */
export const MAANEDER_IAAR = 12;

/** Batterikapaciteten værktøjet starter med, i kWh — en mellemstor elbil. */
export const STANDARD_BATTERI_KWH = 60;

/** Hvor meget batteriet er ladt ved start, i procent. */
export const STANDARD_LADNING_NU_PCT = 20;

/** Hvor meget batteriet skal fyldes op, i procent. */
export const STANDARD_LADNING_TIL_PCT = 80;

export interface ElbilLadingInput {
  /** Batterikapaciteten i kWh. */
  batteriKwh: number;
  /** Ladningen nu, i procent af kapaciteten. */
  ladningNuPct: number;
  /** Ønsket ladning efter opladningen, i procent. */
  ladningTilPct: number;
  /** Elprisen i kr/kWh. */
  elpris: number;
  /** Bilens forbrug i kWh/100 km. */
  forbrugKwh100km: number;
  /** Kørsel pr. måned i km. */
  kmPrMaaned: number;
}

export interface ElbilLadingResult {
  /** Energien der skal lades, i kWh. */
  kwhTilOpladning: number;
  /** Prisen for opladningen, i kr. */
  prisForOpladning: number;
  /** Prisen pr. 100 km, i kr. */
  prisPr100km: number;
  /** Prisen pr. km, i kr. */
  prisPrKm: number;
  /** Energiforbrug pr. måned, i kWh. */
  kwhPrMaaned: number;
  /** Ladeomkostningen pr. måned, i kr. */
  maanedligPris: number;
}

/**
 * Standardværdierne for et sprog, læst fra `ELBIL_FORUDSETNINGER` så siden,
 * værktøjet og FAQ'en taler om de samme tal.
 */
export function elbilLadingStandard(locale: string): ElbilLadingInput {
  const f = locale === "se" ? ELBIL_FORUDSETNINGER.se : ELBIL_FORUDSETNINGER.da;
  return {
    batteriKwh: STANDARD_BATTERI_KWH,
    ladningNuPct: STANDARD_LADNING_NU_PCT,
    ladningTilPct: STANDARD_LADNING_TIL_PCT,
    elpris: f.elKwhPris,
    forbrugKwh100km: f.elKwhPer100km,
    kmPrMaaned: Math.round(f.kmPrAar / MAANEDER_IAAR),
  };
}

/**
 * Regner ladeomkostningen ud fra batteri, ladningsinterval, elpris og kørsel.
 *
 * En procentdel af batteriet der ikke er et positivt, endeligt tal, eller hvor
 * `ladningTilPct` er mindre end `ladningNuPct`, giver `null` — så et tomt
 * felt viser intet svar frem for «NaN kr».
 */
export function beregnElbilLading(input: ElbilLadingInput): ElbilLadingResult | null {
  const { batteriKwh, ladningNuPct, ladningTilPct, elpris, forbrugKwh100km, kmPrMaaned } = input;
  const tal = [batteriKwh, ladningNuPct, ladningTilPct, elpris, forbrugKwh100km, kmPrMaaned];
  if (tal.some((v) => typeof v !== "number" || !Number.isFinite(v) || v < 0)) {
    return null;
  }
  if (ladningTilPct <= ladningNuPct || ladningTilPct > 100) {
    return null;
  }
  const kwhTilOpladning = (batteriKwh * (ladningTilPct - ladningNuPct)) / 100;
  const prisForOpladning = kwhTilOpladning * elpris;
  const prisPr100km = forbrugKwh100km * elpris;
  const kwhPrMaaned = (kmPrMaaned / 100) * forbrugKwh100km;
  return {
    kwhTilOpladning,
    prisForOpladning,
    prisPr100km,
    prisPrKm: prisPr100km / 100,
    kwhPrMaaned,
    maanedligPris: kwhPrMaaned * elpris,
  };
}

export const ELBIL_LADING_KILDE = {
  beskrivelse:
    "Regningen er ren energiøkonomi: kWh × kr/kWh. Elprisen og forbruget er standardværdier fra ELBIL_FORUDSETNINGER (samme kilde som /elbil og /braendstof) og kan ændres i værktøjet. En oplader i hjemmet er typisk omkring 85-90 % effektiv, så den reelle regning fra stikkontakten kan være lidt højere end beregnet.",
  verifiedAt: "2026-10-07",
} as const;
