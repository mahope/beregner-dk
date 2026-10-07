/**
 * Søvnbehov pr. alder — som *regler med kilde*, ikke tal i brødtekst.
 *
 * Hvorfor en side til det: dansk autocomplete (målt 7/10 på
 * `suggestqueries.google.com`, `hl=da&gl=dk`) svarer ti gange ud af ti på
 * «hvor meget søvn skal man have» med en aldersvariant — «… skal en 13 årig
 * have», «… en 10 årig have», «… skal børn have», «… skal en voksen have» — og
 * det svenske forslag «sömnbehov» gentager mønsteret pr. alder. Sitet havde
 * `/vandbehov`, `/kalorier` og `/alder`, men intet sted der svarede på, hvor
 * meget søvn en given alder har brug for.
 *
 * Tabellen er den, Sleep Foundation gengiver, og som American Academy of Sleep
 * Medicine (AASM) og American Academy of Pediatrics (AAP) står bag: spædbørn
 * 4-12 mdr 12-16 timer (inkl. lur), småbørn 1-2 år 11-14, børnehavebørn 3-5 år
 * 10-13, skolebørn 6-12 år 9-12, teenagere 13-18 år 8-10 og voksne 18+ mindst
 * 7 — siden angiver selv 7-9 timer for de fleste voksne. Babyer under fire
 * måneder har ingen egen anbefaling; de sover typisk 14-17 timer i døgnet.
 * Kilde: sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need
 * (læst 7/10 2026), der citerer AASM/SRS-konsensus (J Clin Sleep Med 2015) og
 * AASM's børne-konsensus (J Clin Sleep Med 2016).
 *
 * Tallene er en tommelfingerregel: det individuelle behov varierer, og siden
 * siger det selv. Derfor er siden «vejledende» og ikke en diagnose.
 */

/** De syv aldersgrupper værktøjet regner på, fra yngst til ældst. */
export type SoevnGruppeId =
  | "baby"
  | "spaedbarn"
  | "smaabarn"
  | "boernehave"
  | "skole"
  | "teen"
  | "voksen";

export interface SoevnGruppe {
  id: SoevnGruppeId;
  /** Gruppens navn, dansk. */
  da: string;
  /** Gruppens navn, svensk. */
  se: string;
  /** Aldersbåndet som brødtekst, dansk. */
  alderDa: string;
  /** Aldersbåndet som brødtekst, svensk. */
  alderSe: string;
  /** Mindste anbefalede søvn i timer i døgnet. */
  minTimer: number;
  /** Højeste anbefalede søvn i timer i døgnet. */
  maxTimer: number;
  /** Om anbefalingen regner lur med. */
  lur: boolean;
  /** Nedre aldersgrænse i år (inklusive). */
  minAar: number;
  /** Øvre aldersgrænse i år (eksklusive); `Infinity` for den sidste. */
  maxAar: number;
}

/**
 * Grænsen mellem teenager og voksen er sat ved 18 år, fordi kilden skriver
 * «Teen 13-18» og «Adult 18 years and older» — de to overlapper ved 18, og et
 * værktøj skal give ét svar. 18-årige hører derfor til voksen-gruppen, hvor
 * anbefalingen (7-9 timer) er den samme som den øvre del af teenagerens.
 */
export const SOEVN_GRUPPER: readonly SoevnGruppe[] = [
  {
    id: "baby",
    da: "Baby",
    se: "Bebis",
    alderDa: "0-3 måneder",
    alderSe: "0-3 månader",
    minTimer: 14,
    maxTimer: 17,
    lur: true,
    minAar: 0,
    maxAar: 4 / 12,
  },
  {
    id: "spaedbarn",
    da: "Spædbarn",
    se: "Spädbarn",
    alderDa: "4-12 måneder",
    alderSe: "4-12 månader",
    minTimer: 12,
    maxTimer: 16,
    lur: true,
    minAar: 4 / 12,
    maxAar: 1,
  },
  {
    id: "smaabarn",
    da: "Småbarn",
    se: "Småbarn",
    alderDa: "1-2 år",
    alderSe: "1-2 år",
    minTimer: 11,
    maxTimer: 14,
    lur: true,
    minAar: 1,
    maxAar: 3,
  },
  {
    id: "boernehave",
    da: "Børnehavebarn",
    se: "Förskolebarn",
    alderDa: "3-5 år",
    alderSe: "3-5 år",
    minTimer: 10,
    maxTimer: 13,
    lur: true,
    minAar: 3,
    maxAar: 6,
  },
  {
    id: "skole",
    da: "Skolebarn",
    se: "Skolbarn",
    alderDa: "6-12 år",
    alderSe: "6-12 år",
    minTimer: 9,
    maxTimer: 12,
    lur: false,
    minAar: 6,
    maxAar: 13,
  },
  {
    id: "teen",
    da: "Teenager",
    se: "Tonåring",
    alderDa: "13-17 år",
    alderSe: "13-17 år",
    minTimer: 8,
    maxTimer: 10,
    lur: false,
    minAar: 13,
    maxAar: 18,
  },
  {
    id: "voksen",
    da: "Voksen",
    se: "Vuxen",
    alderDa: "18 år og derover",
    alderSe: "18 år och äldre",
    minTimer: 7,
    maxTimer: 9,
    lur: false,
    minAar: 18,
    maxAar: Infinity,
  },
];

/** Mindste og største alder værktøjet tager imod, i år. */
export const MIN_ALDER = 0;
export const MAX_ALDER = 120;

function assertAlder(alder: number): void {
  if (
    typeof alder !== "number" ||
    !Number.isFinite(alder) ||
    alder < MIN_ALDER ||
    alder > MAX_ALDER
  ) {
    throw new Error(
      `Alderen skal være et tal mellem ${MIN_ALDER} og ${MAX_ALDER} år: ${String(alder)}`
    );
  }
}

/**
 * Aldersgruppen en given alder hører til. Grænsen mellem to grupper hører til
 * den ældste af dem, så en 13-årig er teenager og ikke skolebarn.
 */
export function soevnGruppeForAlder(alder: number): SoevnGruppe {
  assertAlder(alder);
  for (const gruppe of SOEVN_GRUPPER) {
    if (alder >= gruppe.minAar && alder < gruppe.maxAar) return gruppe;
  }
  // `maxAar` på den sidste gruppe er `Infinity`, så loopet fanger alt. Linjen
  // her er kun en vagt, hvis tabellen en dag redigeres uden en åben ende.
  return SOEVN_GRUPPER[SOEVN_GRUPPER.length - 1];
}

export interface SoevnbehovSvar {
  alder: number;
  gruppe: SoevnGruppe;
  minTimer: number;
  maxTimer: number;
}

/** Hele svaret i ét kald, så værktøjet ikke skal slå gruppen op bagefter. */
export function soevnbehov(alder: number): SoevnbehovSvar {
  const gruppe = soevnGruppeForAlder(alder);
  return {
    alder,
    gruppe,
    minTimer: gruppe.minTimer,
    maxTimer: gruppe.maxTimer,
  };
}

/** Længden på én søvncyklus i minutter — den gængse tilnærmelse er 90 min. */
export const SOEVNCYKLUS_MINUTTER = 90;

/**
 * Minutter værktøjet regner med at falde i søvn. Det er en antagelse og ikke et
 * tal fra kilden, så den står her og ikke gemt i komponenten.
 */
export const INDSOVNING_MINUTTER = 15;

/** De cyklus-antal værktøjet foreslår sengetider for, fra længst til kortest. */
export const SENGETID_CYKLUSSER: readonly number[] = [6, 5, 4];

export interface Sengetid {
  cyklusser: number;
  /** Sengetid som «HH:MM» på 24-timers form. */
  tid: string;
}

function formaterTid(minutter: number): string {
  const iDoegnet = ((minutter % 1440) + 1440) % 1440;
  const timer = Math.floor(iDoegnet / 60);
  const min = iDoegnet % 60;
  return `${String(timer).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function parseTid(tid: string): number {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(tid.trim());
  if (!m) throw new Error(`Tiden skal stå som «HH:MM»: ${String(tid)}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * Sengetider der giver et helt antal søvncyklusser, hvis man skal stå op på et
 * bestemt tidspunkt. Værktøjet trækker cyklusserne og indsovningstiden fra
 * vækketiden, så resultatet er det tidspunkt, man skal gå i seng.
 */
export function sengetider(vaekketid: string): Sengetid[] {
  const vaekkeMinutter = parseTid(vaekketid);
  return SENGETID_CYKLUSSER.map((cyklusser) => ({
    cyklusser,
    tid: formaterTid(vaekkeMinutter - cyklusser * SOEVNCYKLUS_MINUTTER - INDSOVNING_MINUTTER),
  }));
}

/** Timer som «8-10» uden mellemrum, den form titel og tabel bruger. */
export function soevnInterval(svar: SoevnbehovSvar): string {
  return `${svar.minTimer}-${svar.maxTimer}`;
}

/**
 * Et gennemregnet eksempel — det samme tal i titel, FAQ og løsning.
 *
 * Uden ét fælles eksempel kan `metaTitle`, brødteksten og FAQ'en vise hver sit
 * interval, og de skrives i tre filer. Derfor regnes det her og læses alle
 * steder.
 */
export const SOEVN_EKSEMPEL = {
  aar: 15,
  ...soevnbehov(15),
};

/**
 * FAQ-svaret på «hvor meget søvn har en på N år brug for?».
 *
 * Tallet læses fra `soevnbehov`, så svaret ikke kan komme til at vise noget
 * andet end værktøjet og tabellen oven over det.
 */
export function soevnbehovFaqSvar(alder: number, locale: "da" | "se"): string {
  const svar = soevnbehov(alder);
  const gruppe = svar.gruppe;
  const navn = (locale === "se" ? gruppe.se : gruppe.da).toLowerCase();
  const lur = gruppe.lur
    ? locale === "se"
      ? " (inklusive tupplurar)"
      : " (inklusive lur)"
    : "";
  if (locale === "se") {
    return `${alder} år hör till gruppen ${navn} och rekommenderas ${svar.minTimer}-${svar.maxTimer} timmars sömn per dygn${lur}.`;
  }
  return `${alder} år hører til gruppen ${navn} og anbefales ${svar.minTimer}-${svar.maxTimer} timers søvn i døgnet${lur}.`;
}
