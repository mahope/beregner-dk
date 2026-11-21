/**
 * Materialebehov ud fra et beregnet areal: spild, antal salg-enheder og pris.
 *
 * Arealet kommer fra arealberegningen på /kvadratmeter (se KvadratmeterBeregner).
 * Når det skal bruges til at købe noget, skal der lægges spild oveni for
 * tilskæring, snit og transportbeskadigelse. Branchens tommelfingerregel er
 * 5-10 %, og de danske gulvleverandører anbefaler 10 % til gulvarbejder.
 *
 * Dækning pr. enhed (fx m² pr. liter maling) står på produktets datablad og
 * varierer med underlag og kvalitet, så den er en redigerbar standardværdi
 * og ikke en fast kendsgerning.
 *
 * Kilde og verificeringsdato: se `KILDE` nederst i denne fil.
 * Se IMPLEMENTATION_PLAN.md (opgave K1).
 */

export type MaterialeId = "gulv" | "fliser" | "maling" | "tapet";

export interface MaterialeEnhed {
  da: string;
  se: string;
  no: string;
}

export interface Materialekategori {
  id: MaterialeId;
  /** Navn til visning, pr. domæne. */
  navn: MaterialeEnhed;
  /** Branchens tommelfingerregel for spild, i procent. */
  spildPct: number;
  /**
   * Hvor mange m² én salgsenhed dækker. 0 betyder at materialet sælges pr. m²,
   * så der regnes ingen pakker, kun et samlet købsareal.
   */
  daekningPrEnhedM2: number;
  /** Hvad én salgsenhed hedder. */
  enhed: MaterialeEnhed;
}

/** Standardværdi for spild, brugt når brugeren ikke selv sætter en værdi. */
export const STANDARD_SPILD_PCT = 10;

/**
 * De fire materialetyper værktøjet regner på. Kun materialetyper med en
 * dokumenteret tommelfingerregel for spild og et kendt salgsformat.
 */
export const MATERIALER: Materialekategori[] = [
  {
    id: "gulv",
    navn: { da: "Gulv (parket, laminat, klikgulv)", se: "Golv (parkett, laminat, klickgolv)", no: "Gulv (parkett, laminat, klikkgulv)" },
    spildPct: 10,
    daekningPrEnhedM2: 0,
    enhed: { da: "m²", se: "m²", no: "m²" },
  },
  {
    id: "fliser",
    navn: { da: "Fliser", se: "Kakel", no: "Fliser" },
    spildPct: 10,
    daekningPrEnhedM2: 0,
    enhed: { da: "m²", se: "m²", no: "m²" },
  },
  {
    id: "maling",
    navn: { da: "Maling (vægge og loft)", se: "Färg (väggar och tak)", no: "Maling (vegger og tak)" },
    spildPct: 10,
    daekningPrEnhedM2: 10,
    enhed: { da: "liter", se: "liter", no: "liter" },
  },
  {
    id: "tapet",
    navn: { da: "Tapet", se: "Tapet", no: "Tapet" },
    spildPct: 10,
    daekningPrEnhedM2: 5,
    enhed: { da: "rulle", se: "rulle", no: "rulle" },
  },
];

export const KILDE = {
  spild: "https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/",
  beskrivelse:
    "Danske gulvleverandører anbefaler at lægge 10 % til for spild ved skæring og tilpasning; 5-10 % er den gængse tommelfingerregel. Malingens dækning står på produktets eget datablad og varierer med underlag og kvalitet.",
  verifiedAt: "2026-09-25",
} as const;

export interface Materialebehov {
  /** Arealet uden spild, gange antal ens felter. */
  samletArealM2: number;
  /** Spildarealet i m². */
  spildM2: number;
  /** Det der skal købes: samlet areal + spild. */
  arealMedSpildM2: number;
  /** Antal salgs-enheder, der skal købes. Null når materialet sælges pr. m². */
  enheder: number | null;
}

export interface MaterialebehovValg {
  /** Antal ens felter (fx 4 identiske rum). Hele arealet ganges med dette. */
  antalFelter?: number;
  /** Spild i procent. Negativ behandles som 0. */
  spildPct?: number;
  /** Dækning pr. enhed i m². 0 eller lavere = sælges pr. m². */
  daekningPrEnhedM2?: number;
}

/** Slår en kategori op på id. Ukendte id'er falder tilbage til gulv. */
export function materialeVedId(id: string | null | undefined): Materialekategori {
  return MATERIALER.find((m) => m.id === id) ?? MATERIALER[0];
}

export function materialeNavn(kategori: Materialekategori, locale: string): string {
  return kategori.navn[(locale === "se" || locale === "no" ? locale : "da") as "da" | "se" | "no"];
}

export function materialeEnhedNavn(kategori: Materialekategori, locale: string): string {
  return kategori.enhed[(locale === "se" || locale === "no" ? locale : "da") as "da" | "se" | "no"];
}

/**
 * Regner materialebehov ud fra et areal.
 *
 * @param arealM2 Arealet for ét felt, i m². Null/negative tal giver intet behov.
 */
export function beregnMaterialbehov(
  arealM2: number,
  kategori: Materialekategori,
  valg: MaterialebehovValg = {},
): Materialebehov {
  const areal = Number.isFinite(arealM2) && arealM2 > 0 ? arealM2 : 0;
  const antalFelter = gyldigtTal(valg.antalFelter) && (valg.antalFelter as number) >= 1
    ? Math.floor(valg.antalFelter as number)
    : 1;
  const spildPct = valg.spildPct === undefined
    ? kategori.spildPct
    : gyldigtTal(valg.spildPct) && (valg.spildPct as number) > 0
      ? (valg.spildPct as number)
      : 0;
  const daekning = valg.daekningPrEnhedM2 === undefined
    ? kategori.daekningPrEnhedM2
    : gyldigtTal(valg.daekningPrEnhedM2) && (valg.daekningPrEnhedM2 as number) > 0
      ? (valg.daekningPrEnhedM2 as number)
      : 0;

  const samletArealM2 = areal * antalFelter;
  const spildM2 = samletArealM2 * (spildPct / 100);
  const arealMedSpildM2 = samletArealM2 + spildM2;
  const enheder = daekning > 0 && arealMedSpildM2 > 0 ? Math.ceil(arealMedSpildM2 / daekning) : null;

  return { samletArealM2, spildM2, arealMedSpildM2, enheder };
}

/**
 * Samlet købspris. Prisen oplyses pr. enhed for materialer, der sælges i
 * pakker, liter eller ruller, og pr. m² for materialer, der sælges pr. m².
 */
export function beregnMaterialpris(behov: Materialebehov, prisPr: number): number {
  const pris = gyldigtTal(prisPr) && prisPr > 0 ? prisPr : 0;
  if (pris === 0) return 0;
  return behov.enheder !== null ? behov.enheder * pris : behov.arealMedSpildM2 * pris;
}

function gyldigtTal(tal: number | undefined): boolean {
  return tal !== undefined && Number.isFinite(tal);
}

function prixEnhed(pris: { prEnhed?: number }): number | undefined {
  return Number.isFinite(pris.prEnhed) ? pris.prEnhed : undefined;
}
