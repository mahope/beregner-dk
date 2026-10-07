import { braendstofForudsætninger } from "./braendstof";
import { formatNumber, getCurrencySuffix } from "./format";
import type { Locale } from "./i18n";

/**
 * Forudsætningerne bag `/bil`: beregnerens standardindgange, de årlige
 * omkostninger den regner dem til, og de estimater brødteksten bruger.
 *
 * De 16 håndskrevne beløb på siden lå i to lister, der ikke havde samme
 * opbygning som beregnerens egne tal. Den værste var ikke en mangel, men en
 * modsigelse: siden lovede «2,50-4,50 kr/km» for en typisk dansk bil, mens
 * `BilBeregner` med sine standardindgange viser 4,90 kr/km — fordi 15 %
 * værditab på 250.000 kr er 37.500 kr om året. Læseren fik to svar på det
 * samme spørgsmål på den samme side.
 *
 * Svensk var en modsigelse af den anden slags: artiklen skrev «18-20 kr/liter»
 * for benzin, mens beregneren startede på 13,5 kr/liter på **alle** domæner,
 * fordi standardindgangene lå i komponenten uden sprog. Brændstof- og
 * elprisen læses derfor fra `braendstofForudsætninger`, som `/braendstof` og
 * `/elbil` allerede bruger — så de tre værktøjer ikke kan glide fra hinanden.
 */
export type BilBraendstof = "benzin" | "diesel" | "hybrid" | "el";

export const BIL_BRAENDSTOF: BilBraendstof[] = ["benzin", "diesel", "hybrid", "el"];

/** De værdier brugeren ser i `BilBeregner`, når intet er rørt. */
export interface BilStandardindgange {
  bilpris: number;
  kmPrAar: number;
  /** Km pr. liter. Bruges af benzin, diesel og hybrid. */
  kmPrLiter: number;
  kwh100km: number;
  forsikring: number;
  vaerditabProcent: number;
}

/** De omkostninger, der ikke afhænger af et felt brugeren kan ændre. */
export interface BilDriftsomkostninger {
  /** Årlig vægtafgift/fordonsskatt pr. brændstoftype, i sitets valuta. */
  vaegt: Record<BilBraendstof, number>;
  /** Service og reparationer som andel af bilens pris. */
  serviceProcent: number;
  /** Dæk, skift og slitage om året. */
  daek: number;
}

/**
 * Uverificerede estimater uden officiel kilde. De er **ikke** beregnerens
 * egne tal, og de bruges kun i brødteksten, med et navn der siger det.
 *
 * `vaegtafgiftEl` stod i den danske tekst som «0 kr (til 2026)» — en påstand om
 * en afgiftsperiode, som ingen kilde i repoet underbygger (skat.dk svarer
 * HTTP 500). Derfor står der kun, hvad beregneren faktisk regner med, og
 * teksten siger det samme. Se ❓ i `IMPLEMENTATION_PLAN.md`.
 */
export const BIL_ESTIMATER = {
  daekHoldelighedKm: { fra: 30000, til: 50000 },
  vaegtafgiftEl: 0,
} as const;

const STANDARD: BilStandardindgange = {
  bilpris: 250000,
  kmPrAar: 15000,
  kmPrLiter: 15,
  kwh100km: 17,
  forsikring: 8000,
  vaerditabProcent: 15,
};

const DRIFT: Record<"da" | "se" | "no", BilDriftsomkostninger> = {
  da: {
    vaegt: { benzin: 4000, diesel: 5500, hybrid: 3000, el: 0 },
    serviceProcent: 3,
    daek: 3000,
  },
  se: {
    // Elbilens fordonsskatt stod som «360 kr (lägsta nivå)» i den svenske tekst
    // mens beregneren regnede med 0. Uverificeret, men tallet er ikke nyt.
    vaegt: { benzin: 4000, diesel: 5500, hybrid: 3000, el: 360 },
    serviceProcent: 3,
    daek: 3000,
  },
  no: {
    // Norge bruger danske værdier for vægtafgift (elbil 0 kr)
    vaegt: { benzin: 4000, diesel: 5500, hybrid: 3000, el: 0 },
    serviceProcent: 3,
    daek: 3000,
  },
};

export type BilSprog = "da" | "se" | "no";

/** De omkostninger der ligger uden for beregnerens felter, pr. sprog. */
export function bilDriftsomkostninger(locale: string): BilDriftsomkostninger {
  return DRIFT[locale as BilSprog] ?? DRIFT.da;
}

/**
 * Standardindgangene pr. sprog. Brændstof- og elprisen læses fra
 * `braendstofForudsætninger`, så `/bil`, `/braendstof` og `/elbil` regner med
 * den samme literpris — før 2/10 startede `/bil` på den danske pris på
 * beraknare.se, hvilket var 4 kroner pr. liter under den målte.
 */
export function bilStandardindgange(locale: string): BilStandardindgange & {
  braendstofpris: number;
  elpris: number;
} {
  const f = braendstofForudsætninger(locale);
  return {
    ...STANDARD,
    braendstofpris: f.benzin.literPris,
    elpris: f.el.kwhPris,
  };
}

/**
 * Service og reparationer om året for en bil med den pris. Artiklen skriver
 * beløbet ud i sin egen sætning, så den ikke skal plukke det ud af en række.
 */
export function bilServiceomkostning(bilpris: number, sprog: BilSprog): number {
  return (bilpris * bilDriftsomkostninger(sprog).serviceProcent) / 100;
}

export interface BilInput extends BilStandardindgange {
  braendstof: BilBraendstof;
  braendstofpris: number;
  elpris: number;
}

export interface BilResultat {
  braendstof: number;
  forsikring: number;
  vaegt: number;
  vaerditab: number;
  service: number;
  daek: number;
  aarligt: number;
  maanedligt: number;
  /** Pr. kilometer, uden afrunding — formatteren tager sig af resten. */
  prKm: number;
}

/**
 * Beregnerens egen regnestykke, flyttet ud af komponenten, så brødteksten kan
 * vise præcis hvad værktøjet viser. Samme rækkefølge og samme summering som
 * `BilBeregner` før 2/10.
 */
export function beregnBilOmkostninger(input: BilInput, locale: string = "da"): BilResultat {
  const drift = bilDriftsomkostninger(locale);
  const erEl = input.braendstof === "el";
  const braendstof = erEl
    ? (input.kwh100km / 100) * input.kmPrAar * input.elpris
    : (input.kmPrAar / input.kmPrLiter) * input.braendstofpris;
  const vaegt = drift.vaegt[input.braendstof];
  const vaerditab = input.bilpris * (input.vaerditabProcent / 100);
  const service = input.bilpris * (drift.serviceProcent / 100);
  const daek = drift.daek;
  const aarligt = braendstof + input.forsikring + vaegt + vaerditab + service + daek;
  return {
    braendstof,
    forsikring: input.forsikring,
    vaegt,
    vaerditab,
    service,
    daek,
    aarligt,
    maanedligt: aarligt / 12,
    prKm: input.kmPrAar > 0 ? aarligt / input.kmPrAar : 0,
  };
}

/**
 * Beregnerens resultat for de fire brændstoftyper, med alt annet på standard.
 * Artiklens «Pris pr. kilometer»-tabel læser den, så en celle aldrig kan have
 * en pris, værktøjet ikke viser for de samme indgange.
 */
export function bilResultater(locale: string = "da"): BilResultat[] {
  const standard = bilStandardindgange(locale);
  return BIL_BRAENDSTOF.map((braendstof) =>
    beregnBilOmkostninger({ ...standard, braendstof }, locale),
  );
}

/** Laveste og højeste pris pr. kilometer i `bilResultater`. */
export function bilPrisPrKmSpaend(locale: string = "da"): { fra: number; til: number } {
  const prKm = bilResultater(locale).map((r) => r.prKm);
  return { fra: Math.min(...prKm), til: Math.max(...prKm) };
}

export interface BilRaekke extends BilResultat {
  type: BilBraendstof;
  /** Rækkens navn på det sprog, artiklen skrives på. */
  navn: string;
}

/**
 * De fire brændstoftyper med deres resultat og navn, så artiklens to tabeller
 * (vægtafgift og pris pr. kilometer) læser samme rækker og ikke hver sin.
 */
export function bilRaekker(sprog: BilSprog): BilRaekke[] {
  const resultater = bilResultater(sprog);
  return BIL_BRAENDSTOF.map((type, i) => ({ type, navn: BIL_NAVN[sprog][type], ...resultater[i] }));
}

/** Ét beløb i sitets egen skrivemåde: 1.500 kr. på dansk, 1 500 kr på svensk. */
export function bilBelob(locale: Locale, value: number): string {
  return `${formatNumber(Math.round(value), locale)} ${getCurrencySuffix(locale)}`;
}

/**
 * Et interval i samme skrivemåde: «1.500-4.000 kr.» mod «1 500-4 000 kr».
 * Bindestreg, fordi det er sådan intervallerne er skrevet i brødteksten.
 */
export function bilInterval(locale: Locale, fra: number, til: number): string {
  return `${formatNumber(fra, locale)}-${formatNumber(til, locale)} ${getCurrencySuffix(locale)}`;
}

/** Dækkenes holdelighed i km, samme notationsform. */
export function bilDaekHoldelighed(locale: Locale): string {
  const { fra, til } = BIL_ESTIMATER.daekHoldelighedKm;
  return `${formatNumber(fra, locale)}-${formatNumber(til, locale)} km`;
}

/** Én pris pr. kilometer med to decimaler: «4,90 kr.». */
export function bilKrPrKm(value: number, locale: Locale): string {
  const to = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${formatNumber(value, locale, to)} ${getCurrencySuffix(locale)}`;
}

/**
 * Spændvidden i `bilPrisPrKmSpaend` som tekst, med de samme to decimaler som
 * den enkelte pris — ellers ville «4,158-5 kr.» stå over for celler der siger
 * 4,16 og 5,00.
 */
export function bilPrisPrKmSpaendTekst(sprog: BilSprog, locale: Locale): string {
  const { fra, til } = bilPrisPrKmSpaend(sprog);
  const to = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${formatNumber(fra, locale, to)}-${formatNumber(til, locale, to)} ${getCurrencySuffix(locale)}`;
}

/** Enhedspris i komponentens egen notationsform: «13,5 kr/liter». */
export function bilEnhedspris(value: number, locale: Locale, enhed: string): string {
  return `${formatNumber(value, locale)} kr/${enhed}`;
}

/** En procentandel uden tusindtalsseparator: «3 %». */
export function bilProcent(value: number, locale: Locale): string {
  return `${formatNumber(value, locale)} %`;
}

/** Navnene på rækkerne i de to tabeller, på begge sprog. */
export const BIL_NAVN: Record<BilSprog, Record<BilBraendstof, string>> = {
  da: { benzin: "Benzin", diesel: "Diesel", hybrid: "Hybrid", el: "Elbil" },
  se: { benzin: "Bensin", diesel: "Diesel", hybrid: "Laddhybrid", el: "Elbil" },
  no: { benzin: "Bensin", diesel: "Diesel", hybrid: "Hybrid", el: "Elbil" },
};
