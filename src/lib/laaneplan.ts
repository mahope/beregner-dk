/**
 * Låneplan: amortiseringsplan, gebyrer og ÅOP for annuitetslån og serielån.
 *
 * Ydelsen og renterne for hovedtallene kommer fra `laanebeloeb.ts`, så den nye
 * låneplan ikke kan vise en anden ydelse end resten af sitet. Her ligger det,
 * `laanebeloeb.ts` ikke har: måned-for-måned-planen, gebyrer og ÅOP.
 *
 * Gebyrer: `stiftelsesgebyr` betales én gang ved oprettelsen (og trækkes i
 * praksis af det udbetalte beløb eller lægges oven i første ydelse; her
 * behandles det som en udgift ved start, hvilket er det, ÅOP-reglerne gør).
 * `maanedsgebyr` betales sammen med hver ydelse og indgår ikke i rentetallene,
 * men i den samlede tilbagebetaling og i ÅOP.
 *
 * ÅOP er den årlige rente, der gør nutidsværdien af alle betalinger lig med det
 * udbetalte beløb (hovedstol minus stiftelsesgebyr), med månedlige betalinger
 * diskonteret som `(1 + ÅOP)^(t/12)`. Det er samme definition som i
 * forbrugerkreditloven og EU's kreditdirektiv, og den løses numerisk med
 * bisektion, fordi den ikke har en lukket form, når der er gebyrer.
 */

import { annuitetsYdelse, antalMaaneder, type Laanetype } from "@/lib/laanebeloeb";

export type { Laanetype };

export const MIN_HOVEDSTOL = 1_000;
export const MAX_HOVEDSTOL = 20_000_000;
export const MAX_AARSRENTE = 40;
export const MAX_LOEBETID_AAR = 50;
export const MAX_GEBYR = 100_000;

export interface LaaneInput {
  hovedstol: number;
  /** Årlig nominel rente (debitorrente) i procent. */
  aarsrente: number;
  /** Løbetid i år; kan være decimal (fx 2,5 år = 30 måneder). */
  loebetidAar: number;
  /** Engangsgebyr ved oprettelse, i kroner. */
  stiftelsesgebyr?: number;
  /** Gebyr pr. måned, i kroner. */
  maanedsgebyr?: number;
  type: Laanetype;
}

export interface Terminsraekke {
  maaned: number;
  /** Ydelse på lånet (renter + afdrag), uden månedsgebyr. */
  ydelse: number;
  rente: number;
  afdrag: number;
  restgaeld: number;
}

export interface Laaneplan {
  type: Laanetype;
  raekker: Terminsraekke[];
  antalMaaneder: number;
  /** Ydelse i måned 1 uden månedsgebyr. */
  foersteYdelse: number;
  sidsteYdelse: number;
  samletRente: number;
  /** Alt der betales: ydelser + stiftelsesgebyr + månedsgebyrer. */
  samletTilbagebetaling: number;
  samletGebyr: number;
  /** Det beløb, låntageren faktisk får udbetalt. */
  udbetalt: number;
  /** ÅOP i procent. */
  aop: number;
}

export function validerInput(i: LaaneInput): string | null {
  if (!Number.isFinite(i.hovedstol) || i.hovedstol < MIN_HOVEDSTOL || i.hovedstol > MAX_HOVEDSTOL) {
    return `Lånebeløbet skal være mellem ${MIN_HOVEDSTOL} og ${MAX_HOVEDSTOL} kr.`;
  }
  if (!Number.isFinite(i.aarsrente) || i.aarsrente < 0 || i.aarsrente > MAX_AARSRENTE) {
    return `Renten skal være mellem 0 og ${MAX_AARSRENTE} %.`;
  }
  if (!Number.isFinite(i.loebetidAar) || antalMaaneder(i.loebetidAar) < 1 || i.loebetidAar > MAX_LOEBETID_AAR) {
    return `Løbetiden skal være mellem 1 måned og ${MAX_LOEBETID_AAR} år.`;
  }
  for (const g of [i.stiftelsesgebyr ?? 0, i.maanedsgebyr ?? 0]) {
    if (!Number.isFinite(g) || g < 0 || g > MAX_GEBYR) {
      return `Gebyrer skal være mellem 0 og ${MAX_GEBYR} kr.`;
    }
  }
  if ((i.stiftelsesgebyr ?? 0) >= i.hovedstol) return "Stiftelsesgebyret skal være mindre end lånebeløbet.";
  return null;
}

/**
 * ÅOP i procent for en strøm af månedlige betalinger.
 *
 * `udbetalt` er t=0; `betalinger[k]` betales efter k+1 måneder. Bisektion på
 * den årlige rente: nutidsværdien falder monotont i renten, så der er højst
 * én rod. Ligger roden under 0 (betaler mindre end man fik), returneres 0.
 */
export function aopFraBetalinger(udbetalt: number, betalinger: readonly number[]): number {
  const nutidsvaerdi = (aop: number) => {
    let sum = 0;
    for (let k = 0; k < betalinger.length; k++) {
      sum += betalinger[k] / (1 + aop) ** ((k + 1) / 12);
    }
    return sum - udbetalt;
  };
  if (betalinger.length === 0 || udbetalt <= 0) return 0;
  if (nutidsvaerdi(0) <= 0) return 0;
  let lo = 0;
  let hi = 1;
  while (nutidsvaerdi(hi) > 0 && hi < 1e6) hi *= 2;
  for (let n = 0; n < 200; n++) {
    const mid = (lo + hi) / 2;
    if (nutidsvaerdi(mid) > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}

/** Bygger hele planen. Kaster ved ugyldigt input, så en fejl aldrig bliver `NaN`. */
export function beregnLaaneplan(input: LaaneInput): Laaneplan {
  const fejl = validerInput(input);
  if (fejl) throw new Error(fejl);

  const { hovedstol, aarsrente, loebetidAar, type } = input;
  const stiftelsesgebyr = input.stiftelsesgebyr ?? 0;
  const maanedsgebyr = input.maanedsgebyr ?? 0;
  const n = antalMaaneder(loebetidAar);
  const r = aarsrente / 100 / 12;

  const ydelseAnnuitet = annuitetsYdelse(hovedstol, aarsrente, loebetidAar);
  const fastAfdrag = hovedstol / n;

  const raekker: Terminsraekke[] = [];
  let rest = hovedstol;
  let samletRente = 0;
  for (let m = 1; m <= n; m++) {
    const rente = rest * r;
    // Sidste termin lukker restgælden præcist, så afrundingsstøv ikke står tilbage.
    const afdrag = m === n ? rest : type === "annuitet" ? ydelseAnnuitet - rente : fastAfdrag;
    rest = m === n ? 0 : rest - afdrag;
    samletRente += rente;
    raekker.push({ maaned: m, ydelse: afdrag + rente, rente, afdrag, restgaeld: Math.max(rest, 0) });
  }

  const betalinger = raekker.map((x) => x.ydelse + maanedsgebyr);
  // Stiftelsesgebyret er en udgift ved start: låntageren får hovedstol minus gebyr.
  const udbetalt = hovedstol - stiftelsesgebyr;
  const samletGebyr = stiftelsesgebyr + maanedsgebyr * n;

  return {
    type,
    raekker,
    antalMaaneder: n,
    foersteYdelse: raekker[0].ydelse,
    sidsteYdelse: raekker[n - 1].ydelse,
    samletRente,
    samletTilbagebetaling: hovedstol + samletRente + samletGebyr,
    samletGebyr,
    udbetalt,
    aop: aopFraBetalinger(udbetalt, betalinger),
  };
}

export interface Sammenligning {
  annuitet: Laaneplan;
  serielaan: Laaneplan;
  /** Serielånets besparelse i renter (positiv, når serielån er billigst). */
  renteForskel: number;
  /** Serielånets første ydelse minus annuitetslånets. */
  foersteYdelseForskel: number;
  /** Første måned hvor serielånets ydelse er lavere end annuitetslånets, ellers null. */
  krydsMaaned: number | null;
}

export function sammenlign(input: Omit<LaaneInput, "type">): Sammenligning {
  const annuitet = beregnLaaneplan({ ...input, type: "annuitet" });
  const serielaan = beregnLaaneplan({ ...input, type: "serielaan" });
  const kryds = serielaan.raekker.find((x, i) => x.ydelse < annuitet.raekker[i].ydelse);
  return {
    annuitet,
    serielaan,
    renteForskel: annuitet.samletRente - serielaan.samletRente,
    foersteYdelseForskel: serielaan.foersteYdelse - annuitet.foersteYdelse,
    krydsMaaned: kryds ? kryds.maaned : null,
  };
}

/** Det, der gemmes i et del-link. */
export interface LaaneState {
  hovedstol: number;
  aarsrente: number;
  loebetidAar: number;
  stiftelsesgebyr: number;
  maanedsgebyr: number;
  type: Laanetype;
}

const URL_NOEGLER = {
  hovedstol: "beloeb",
  aarsrente: "rente",
  loebetidAar: "aar",
  stiftelsesgebyr: "stiftelse",
  maanedsgebyr: "gebyr",
  type: "type",
} as const;

/** Del-link som læsbare parametre: `?beloeb=500000&rente=5&aar=30&type=annuitet`. */
export function tilQuery(s: LaaneState): string {
  const p = new URLSearchParams();
  p.set(URL_NOEGLER.hovedstol, String(s.hovedstol));
  p.set(URL_NOEGLER.aarsrente, String(s.aarsrente));
  p.set(URL_NOEGLER.loebetidAar, String(s.loebetidAar));
  if (s.stiftelsesgebyr) p.set(URL_NOEGLER.stiftelsesgebyr, String(s.stiftelsesgebyr));
  if (s.maanedsgebyr) p.set(URL_NOEGLER.maanedsgebyr, String(s.maanedsgebyr));
  p.set(URL_NOEGLER.type, s.type);
  return p.toString();
}

/**
 * Læser et del-link. Hver parameter der mangler eller er ugyldig, falder
 * tilbage til `standard`, så et ødelagt link aldrig giver `NaN` i værktøjet.
 */
export function fraQuery(query: string, standard: LaaneState): LaaneState {
  const p = new URLSearchParams(query);
  const tal = (noegle: string, min: number, max: number, fallback: number) => {
    const raa = p.get(noegle);
    if (raa === null || raa.trim() === "") return fallback;
    const v = Number(raa);
    return Number.isFinite(v) && v >= min && v <= max ? v : fallback;
  };
  const type = p.get(URL_NOEGLER.type);
  return {
    hovedstol: tal(URL_NOEGLER.hovedstol, MIN_HOVEDSTOL, MAX_HOVEDSTOL, standard.hovedstol),
    aarsrente: tal(URL_NOEGLER.aarsrente, 0, MAX_AARSRENTE, standard.aarsrente),
    loebetidAar: tal(URL_NOEGLER.loebetidAar, 1 / 12, MAX_LOEBETID_AAR, standard.loebetidAar),
    stiftelsesgebyr: tal(URL_NOEGLER.stiftelsesgebyr, 0, MAX_GEBYR, 0),
    maanedsgebyr: tal(URL_NOEGLER.maanedsgebyr, 0, MAX_GEBYR, 0),
    type: type === "annuitet" || type === "serielaan" ? type : standard.type,
  };
}

export interface Aarsraekke {
  aar: number;
  ydelse: number;
  rente: number;
  afdrag: number;
  restgaeld: number;
}

/** Samler en plan i hele år til tabel og søjlediagram. */
export function aarsOversigt(plan: Laaneplan): Aarsraekke[] {
  const ud: Aarsraekke[] = [];
  for (const x of plan.raekker) {
    const aar = Math.ceil(x.maaned / 12);
    let post = ud[aar - 1];
    if (!post) {
      post = { aar, ydelse: 0, rente: 0, afdrag: 0, restgaeld: 0 };
      ud.push(post);
    }
    post.ydelse += x.ydelse;
    post.rente += x.rente;
    post.afdrag += x.afdrag;
    post.restgaeld = x.restgaeld;
  }
  return ud;
}

/** Restgælden efter hvert år (og ved start), til grafen. */
export function restgaeldPrAar(plan: Laaneplan, hovedstol: number): { aar: number; restgaeld: number }[] {
  const punkter = [{ aar: 0, restgaeld: hovedstol }];
  for (const x of plan.raekker) {
    if (x.maaned % 12 === 0 || x.maaned === plan.antalMaaneder) {
      punkter.push({ aar: x.maaned / 12, restgaeld: x.restgaeld });
    }
  }
  return punkter;
}
