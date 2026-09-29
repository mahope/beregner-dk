/**
 * Læg to tidsrum sammen — det svar på "læg timer og minutter sammen" /
 * "addera timmar och minuter", som begge sprog har i autocomplete men ingen
 * af sidernes to sproggrene svarede på (0 forekomster i den server-renderede
 * HTML på begge domæner).
 *
 * Tallene er **ikke** håndskrevet: hver række går gennem
 * `beregnTidsinterval`, altså det samme modul `TidsBeregner` selv bruger, så
 * siden ikke kan lægge et tal ved siden af logikken modsiger (C84's
 * fejlklasse). Summen er `timer` og `minutter` fra de to resultater lagt
 * sammen og så normaliseret med div/mod 60 — samme to regler som modulet
 * bruger i `beregnTidsinterval`.
 *
 * Modulet rummer **kun tal**: al landnavn, overskrift og tekst ligger i
 * `page.tsx`' sproggrene, ellers kunne modulet lække dansk til beraknare.se
 * (C73's R4).
 */

import { beregnTidsinterval } from "./tidsberegner";

export interface TidsSumRaekke {
  /** Nøgle, ikke tekst: overskrifterne er sprogafhængige og bor på siden. */
  id: "arbejdsuge" | "to_vagter" | "pause_storre_end_en_time";
  /** Første tidsrums klokkeslæt, som det skrives i felterne. */
  forsteStart: string;
  forsteSlut: string;
  andenStart: string;
  andenSlut: string;
  /** Pause i minutter på hvert af de to rum. */
  pauseForste: number;
  pauseAnden: number;
  /** Hvorfor rækken er med, kort og konkret. */
  bemaerkingDa: string;
  bemaerkingSe: string;
}

export interface TidsSumResultat {
  timer: number;
  minutter: number;
  totalMinutter: number;
  decimalTimer: number;
  /** Helt døgn, når summen passerer 24 timer. */
  heleDoegn: number;
}

/**
 * De tre par. De er valgt efter de søgninger, de faktisk skal svare på:
 *
 * DA-autocomplete under "timer og minutter" har **fire** variationer der
 * handler om at lægge sammen — "læg timer og minutter sammen" (nr. 4),
 * "regn timer og minutter sammen" (nr. 7) og "plus timer og minutter"
 * (nr. 8) — og under "timer og minutter i excel" ligger
 * "summera timer og minutter i excel" og "læg timer og minutter sammen i
 * excel". SE-autocomplete under "timmar och minuter" har
 * "addera timmar och minuter" (nr. 5) og "summera timmar och minuter i
 * excel" (nr. 6).
 *
 * Den tredje række er den fælde, der griber folk: en pause på 90 minutter
 * er mere end én time, så det er ikke nok at trække `0,5` fra — summeringen
 * skal ske **efter** pausen er trukket, ellers får man et negativt tal.
 */
export const TIDS_SUMMER: TidsSumRaekke[] = [
  {
    id: "arbejdsuge",
    forsteStart: "08:00",
    forsteSlut: "16:00",
    andenStart: "09:00",
    andenSlut: "17:00",
    pauseForste: 30,
    pauseAnden: 30,
    bemaerkingDa: "To dage med 30 minutters pause hver — den almindelige arbejdsuge.",
    bemaerkingSe: "Två dagar med 30 minuters paus var — den vanliga arbetsveckan.",
  },
  {
    id: "to_vagter",
    forsteStart: "08:30",
    forsteSlut: "16:45",
    andenStart: "16:45",
    andenSlut: "22:00",
    pauseForste: 0,
    pauseAnden: 0,
    bemaerkingDa: "Dagens to vagter lagt sammen uden pause — 8 t 15 min + 5 t 15 min.",
    bemaerkingSe: "Dagens två skift lagda ihop utan paus — 8 h 15 min + 5 h 15 min.",
  },
  {
    id: "pause_storre_end_en_time",
    forsteStart: "09:00",
    forsteSlut: "17:00",
    andenStart: "10:00",
    andenSlut: "18:00",
    pauseForste: 90,
    pauseAnden: 0,
    bemaerkingDa: "En pause på 90 minutter: træk den fra, før du lægger sammen.",
    bemaerkingSe: "En paus på 90 minuter: dra av den innan du lägger ihop.",
  },
];

/**
 * Summen af to klokkeslags-intervaller, hver med sin egen pause. Begge rum
 * går gennem `beregnTidsinterval` — det er derfor de **kan** sammenlignes
 * med værktøjet, og hvorfor et tal i tabellen ikke kan glide fra det.
 *
 * Returnerer `null` hvis et af de fire klokkeslæg ikke kan læses, så en
 * ugyldig række ikke får et tal stående ved siden af.
 */
export function summerTidsrum(raekke: TidsSumRaekke): TidsSumResultat | null {
  const foerste = beregnTidsinterval({
    startTid: raekke.forsteStart,
    slutTid: raekke.forsteSlut,
    fratraekPause: raekke.pauseForste,
  });
  const anden = beregnTidsinterval({
    startTid: raekke.andenStart,
    slutTid: raekke.andenSlut,
    fratraekPause: raekke.pauseAnden,
  });
  if (!foerste || !anden) return null;

  const totalMinutter = foerste.totalMinutter + anden.totalMinutter;
  return {
    timer: Math.floor(totalMinutter / 60),
    minutter: totalMinutter % 60,
    totalMinutter,
    decimalTimer: totalMinutter / 60,
    heleDoegn: totalMinutter / (24 * 60),
  };
}

/**
 * Excel-formlen der gør det samme på to par celler. A1 og C1 er starttider,
 * B1 og D1 er sluttider, og den returnerer decimaltimer.
 *
 * Den kender **ikke** pauser, og det er ikke en mangel: det er præcis den
 * fælde brødteksten beskriver. Rækken `to_vagter` har ingen pause, og der
 * giver formlen præcis `summerTidsrum`s 13,50. Rækkerne med pause kræver
 * `EXCEL_SUM_MED_PAUSE` — begge krydscheckes mod modulet i testen, så
 * formlen i den indekserede tekst ikke kan modsige tabellen ved siden af
 * (C84's fejlklasse).
 */
export const EXCEL_SUM_FORMEL = "=(B1-A1)*24+(D1-C1)*24";

/**
 * Samme sumel med pauserne trukket fra i timer, fordi Excel's `=(B1-A1)*24`
 * ikke kender en frokostpause. E1 og E2 er pauserne i timer.
 *
 * `to_vagter` har pause 0, så formlen med tomme pause-celler giver samme
 * 13,50 som `EXCEL_SUM_FORMEL` — den er derfor den, der bruges på den
 * række, mens de to andre bruger denne.
 */
export const EXCEL_SUM_MED_PAUSE =
  "=(B1-A1)*24+(D1-C1)*24-E1-E2";

/** Antallet af hele døgn, formateret med to decimaler — bruges i tabellen. */
export function formatDoegn(heleDoegn: number, locale: "da" | "se"): string {
  return heleDoegn.toFixed(2).replace(".", ",") + (locale === "se" ? " dygn" : " døgn");
}
