/**
 * Portioner pr. person — hvor meget mad skal der beregnes til et antal personer?
 *
 * Tallene er de anbefalede mængder pr. voksen fra dk-kogebogen.dk's tabel
 * «Beregnede mængder pr. person». Mængden er vejledende: rettens rolle
 * (hovedret eller tilbehør), tilbehøret ved siden af og appetitten flytter
 * tallet, og derfor er hver vare et interval i stedet for ét fast tal.
 *
 * **Kilden er én tabel for alle varer**, så to varer ikke kan komme til at
 * bygge på hver sin. Tallene står i `PORTIONER_KILDE`.
 */

export type PortionEnhed = "g" | "dl";

export type PortionKategori = "Kød og fisk" | "Kartofler og grønt" | "Pasta, ris og tilbehør";

export interface PortionVare {
  /** Stabil id til URL-state og opslag. */
  id: string;
  /** Varens navn, som det står i tabellen. */
  navn: string;
  /** Laveste anbefalede mængde pr. person. */
  min: number;
  /** Højeste anbefalede mængde pr. person. */
  max: number;
  /** Mængden måles i gram eller deciliter. */
  enhed: PortionEnhed;
  /** Grupperingen i tabellen. */
  kategori: PortionKategori;
}

export const PORTIONER_KILDE = {
  url: "https://www.dk-kogebogen.dk/teknik/teknik-beregn-mangde.php",
  beskrivelse:
    "Mængderne pr. person er fra dk-kogebogen.dk's tabel «Beregnet mængde pr. person», der angiver, hvor meget man beregner pr. voksen til en almindelig ret. Mængden afhænger af rettens rolle, tilbehøret og appetitten — derfor er hver vare et interval og værktøjet vejledende.",
  verifiedAt: "2026-10-08",
} as const;

/** Anbefalet mængde pr. person, ifølge kilden. */
export const PORTIONER_VARER: readonly PortionVare[] = [
  // Kød og fisk
  { id: "koed-ben-steg", navn: "Kød med ben til steg", min: 200, max: 300, enhed: "g", kategori: "Kød og fisk" },
  { id: "koed-benfrit-steg", navn: "Benfrit kød til steg", min: 150, max: 200, enhed: "g", kategori: "Kød og fisk" },
  { id: "hakket-koedsovs", navn: "Hakket kød til kødsovs", min: 75, max: 125, enhed: "g", kategori: "Kød og fisk" },
  { id: "hakket-boef", navn: "Hakket kød til bøf", min: 100, max: 150, enhed: "g", kategori: "Kød og fisk" },
  { id: "kyllingefilet", navn: "Kyllingefilet uden ben", min: 150, max: 150, enhed: "g", kategori: "Kød og fisk" },
  { id: "poelser", navn: "Pølser", min: 150, max: 200, enhed: "g", kategori: "Kød og fisk" },
  { id: "fisk-fileter", navn: "Fisk, rensede fileter", min: 200, max: 200, enhed: "g", kategori: "Kød og fisk" },

  // Kartofler og grønt
  { id: "kartofler", navn: "Kartofler, uskrællede", min: 150, max: 250, enhed: "g", kategori: "Kartofler og grønt" },
  { id: "kartoffelmos", navn: "Kartofler til mos", min: 200, max: 300, enhed: "g", kategori: "Kartofler og grønt" },
  { id: "floede-kartofler", navn: "Flødekartofler", min: 250, max: 300, enhed: "g", kategori: "Kartofler og grønt" },
  { id: "brunede-kartofler", navn: "Brunede kartofler", min: 150, max: 150, enhed: "g", kategori: "Kartofler og grønt" },
  { id: "roedkaal", navn: "Rødkål", min: 80, max: 80, enhed: "g", kategori: "Kartofler og grønt" },
  { id: "groensager", navn: "Grønsager, rensede", min: 150, max: 200, enhed: "g", kategori: "Kartofler og grønt" },
  { id: "groen-salat", navn: "Grøn salat", min: 100, max: 100, enhed: "g", kategori: "Kartofler og grønt" },
  { id: "blandet-salat", navn: "Blandet salat", min: 150, max: 150, enhed: "g", kategori: "Kartofler og grønt" },

  // Pasta, ris og tilbehør
  { id: "pasta-toerret", navn: "Pasta, tørret", min: 75, max: 100, enhed: "g", kategori: "Pasta, ris og tilbehør" },
  { id: "pasta-frisk", navn: "Pasta, frisk", min: 125, max: 150, enhed: "g", kategori: "Pasta, ris og tilbehør" },
  { id: "nudler", navn: "Nudler, tørrede", min: 75, max: 100, enhed: "g", kategori: "Pasta, ris og tilbehør" },
  { id: "couscous", navn: "Cous cous, rå", min: 75, max: 75, enhed: "g", kategori: "Pasta, ris og tilbehør" },
  { id: "ris", navn: "Ris", min: 1, max: 1, enhed: "dl", kategori: "Pasta, ris og tilbehør" },
  { id: "sauce", navn: "Sauce", min: 1, max: 1, enhed: "dl", kategori: "Pasta, ris og tilbehør" },
] as const;

/** Rækkefølgen kategorierne vises i. */
export const PORTIONER_KATEGORIER: readonly PortionKategori[] = [
  "Kød og fisk",
  "Kartofler og grønt",
  "Pasta, ris og tilbehør",
] as const;

/** Slår en vare op på id. Ukendt id giver `undefined`. */
export function vareVedId(id: string): PortionVare | undefined {
  return PORTIONER_VARER.find((v) => v.id === id);
}

/** En vare med den samlede mængde for det valgte antal personer. */
export interface PortionRaekke extends PortionVare {
  totalMin: number;
  totalMax: number;
}

/**
 * Regner den samlede mængde for hver vare ud fra antallet af personer.
 * Nul, negative tal og ikke-tal behandles som 0 personer.
 */
export function beregnPortioner(antalPersoner: number): PortionRaekke[] {
  const antal = Number.isFinite(antalPersoner) && antalPersoner > 0 ? antalPersoner : 0;
  return PORTIONER_VARER.map((v) => ({
    ...v,
    totalMin: antal * v.min,
    totalMax: antal * v.max,
  }));
}

/** Formaterer en mængde med dansk talformat og dens enhed, fx «1.000 g». */
export function formatPortion(vaerdi: number, enhed: PortionEnhed): string {
  return `${vaerdi.toLocaleString("da-DK", { maximumFractionDigits: 1 })} ${enhed}`;
}

/** Værktøjets eksempel: en almindelig middag til fire. */
export const PORTIONER_EKSEMPEL = {
  antalPersoner: 4,
};

/** Antallet værktøjet starter på. */
export const PORTIONER_STANDARD_ANTAL = PORTIONER_EKSEMPEL.antalPersoner;
