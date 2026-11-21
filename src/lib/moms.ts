import type { Locale } from "./i18n";

/**
 * Momsregnestykket laeger i komponenten, indtil dette modul blev skrevet. Det
 * er det eneste sted, hvor sats, faktor og momsandel beregnes, saa vaerktøjet,
 * informationsboksen, formlerne og "Hurtig reference" ikke kan komme i
 * ukarakter om hvilket tal hoerer til hvilken sats.
 */

export type MomsBeregningstype = "tillaegMoms" | "fratraekMoms" | "findMoms";

/** Satserne der gaelder i hvert land. Danmark og Norge har kun 25 %. */
export const MOMS_SATSER: Record<Locale, readonly number[]> = {
  da: [25],
  no: [25],
  se: [25, 12, 6],
};

export const DEFAULT_MOMS_SATS = 25;

export interface MomsSatsValg {
  sats: number;
  /** Kun svenske satser har et navn, der skal vises i vaerktøjet. */
  navn: string;
}

/** Sveriges tre satser med de navn, vaerktøjet bruger paa knapperne. */
export const MOMS_SATS_VALG_SE: readonly MomsSatsValg[] = [
  { sats: 25, navn: "Standard" },
  { sats: 12, navn: "Mat, hotell" },
  { sats: 6, navn: "Böcker, kultur" },
];

/** En sats der ikke hoerer til landet falder tilbage paa den normale. */
export function normalizeMomssats(value: unknown, locale: Locale): number {
  const parsed = Number(value);
  return MOMS_SATSER[locale].includes(parsed) ? parsed : DEFAULT_MOMS_SATS;
}

/** 25 % -> 1,25. Det er den faktor, brødteksten og formlerne ogsaa taler om. */
export function momsFaktor(momssats: number): number {
  return 1 + momssats / 100;
}

/**
 * Momsandelen i en pris inkl. moms: 25 % -> 20 %. Ikke 25 %, fordi momsen
 * beregnes af prisen uden moms (25 / 125 = 0,20).
 */
export function momsAndel(momssats: number): number {
  return momssats / (100 + momssats);
}

export interface MomsResultat {
  prisUdenMoms: number;
  momsBeloeb: number;
  prisInklMoms: number;
}

/**
 * De tre valg i vaerktøjet. "Fratraek moms" og "Find moms" er bevidst samme
 * regnestykke — de er to navne paa det samme svar, og vaerktøjet viser alle
 * tre tal, saa det er den, brugeren leder efter, der afgoer hvilken.
 */
export function beregnMoms(
  beloeb: number,
  type: MomsBeregningstype,
  momssats: number
): MomsResultat {
  const faktor = momsFaktor(momssats);
  if (type === "tillaegMoms") {
    const prisInklMoms = beloeb * faktor;
    return { prisUdenMoms: beloeb, momsBeloeb: prisInklMoms - beloeb, prisInklMoms };
  }
  const prisUdenMoms = beloeb / faktor;
  return { prisUdenMoms, momsBeloeb: beloeb - prisUdenMoms, prisInklMoms: beloeb };
}

/** Beloebene i "Hurtig reference". */
export const MOMS_REFERENCE_BELOEB: readonly number[] = [100, 500, 1000, 5000, 10000];

/**
 * Rækkerne i "Hurtig reference", beregnet af `beregnMoms` — samme modul som
 * vaerktøjet bruger, saa tabellen ikke kan vise et tal regnestykket ikke
 * ville give.
 */
export function referenceRaekker(momssats: number): MomsResultat[] {
  return MOMS_REFERENCE_BELOEB.map((beloeb) => beregnMoms(beloeb, "tillaegMoms", momssats));
}

/**
 * Rækkerne i "Sådan regner du moms baglæns", beregnet af `beregnMoms` i
 * "fratraekMoms"-retningen — samme modul og samme regnestykke som vaerktøjet,
 * saa tabellen ikke kan vise et tal regnestykket ikke ville give.
 *
 * Det er priser *med* moms i kassen, fordi det er den pris folk har: 1.250 kr.
 * paa hylden er 1.000 kr. ekskl. moms, og det er 1.250 kr., der skal ÷ 1,25.
 */
export function fratraekRaekker(momssats: number): MomsResultat[] {
  return MOMS_REFERENCE_BELOEB.map((beloeb) => beregnMoms(beloeb, "fratraekMoms", momssats));
}

interface OpsummeringTekst {
  net: string;
  moms: string;
  brutto: string;
  sats: string;
  andel: string;
}

const OPSUMMERING: Record<
  "da" | "se",
  Record<MomsBeregningstype, (t: OpsummeringTekst) => string>
> = {
  da: {
    tillaegMoms: (t) => `${t.net} uden moms + ${t.moms} moms (${t.sats} %) = ${t.brutto} inkl. moms`,
    fratraekMoms: (t) => `${t.brutto} inkl. moms − ${t.moms} moms = ${t.net} uden moms`,
    findMoms: (t) => `Moms i ${t.brutto} er ${t.moms} (${t.andel} % af beløbet)`,
  },
  se: {
    tillaegMoms: (t) => `${t.net} utan moms + ${t.moms} moms (${t.sats} %) = ${t.brutto} inkl. moms`,
    fratraekMoms: (t) => `${t.brutto} inkl. moms − ${t.moms} moms = ${t.net} utan moms`,
    findMoms: (t) => `Momsen i ${t.brutto} är ${t.moms} (${t.andel} % av beloppet)`,
  },
};

/**
 * Den tekst der kopieres, deles og printes. Den skal kunne staa pa egen hoved,
 * saa den naevner momsen og de to priser — ikke bare "1.000 kr. + moms =
 * 1.250 kr.", hvor momsen mangler som tal.
 */
export function opsummering(
  type: MomsBeregningstype,
  resultat: MomsResultat,
  momssats: number,
  formater: { pris: (tal: number) => string; procent: (tal: number) => string },
  locale: "da" | "se"
): string {
  return OPSUMMERING[locale][type]({
    net: formater.pris(resultat.prisUdenMoms),
    moms: formater.pris(resultat.momsBeloeb),
    brutto: formater.pris(resultat.prisInklMoms),
    sats: formater.procent(momssats),
    andel: formater.procent(momsAndel(momssats) * 100),
  });
}
