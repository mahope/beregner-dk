/**
 * Gram til dl — køkkenomregner mellem vægt og rumfang.
 *
 * Gram måler vægt og deciliter måler rumfang, så omregningen afhænger af
 * ingrediensens tæthed: `dl = gram ÷ (gram pr. dl)` og `gram = dl × (gram pr. dl)`.
 * Værdierne nedenfor er de gængse danske køkkenmål (hvor meget 1 dl vejer) og
 * varierer med, hvor fast varen er fyldt i målet — derfor er værktøjet
 * vejledende, ikke en facitliste.
 *
 * **Kilden er én tabel for alle varer**, så to varer ikke kan komme til at
 * bygge på hver sin kilde. Tallene står i `GRAM_TIL_DL_KILDE`.
 */

export interface GramTilDlVare {
  /** Stabil id til URL-state og opslag. */
  id: string;
  /** Varens navn, som det står i tabellen. */
  navn: string;
  /** Hvor mange gram 1 dl vejer ifølge kilden. */
  gramPrDl: number;
  /** Grupperingen i tabellen. */
  kategori: GramTilDlKategori;
}

export type GramTilDlKategori =
  | "Mel og gryn"
  | "Sukker og sødt"
  | "Fedt og væske"
  | "Nødder og pulver";

export const GRAM_TIL_DL_KILDE = {
  url: "https://illvid.dk/teknologi/foedevarer/gram-til-dl",
  beskrivelse:
    "Illustreret Videnskabs omregningstabel «Gram til dl» angiver, hvor meget 1 dl vejer for de almindelige ingredienser i dansk bagning og madlavning. Vægten er et køkkenmål og varierer med, hvor fast varen fyldes i målet — derfor er beregneren vejledende.",
  verifiedAt: "2026-10-08",
} as const;

/** 1 dl vejer så mange gram, ifølge kilden. */
export const GRAM_TIL_DL_VARER: readonly GramTilDlVare[] = [
  { id: "hvedemel", navn: "Hvedemel", gramPrDl: 60, kategori: "Mel og gryn" },
  { id: "fuldkornsmel", navn: "Fuldkornsmel", gramPrDl: 60, kategori: "Mel og gryn" },
  { id: "grahamsmel", navn: "Grahamsmel", gramPrDl: 60, kategori: "Mel og gryn" },
  { id: "majsstivelse", navn: "Majsstivelse", gramPrDl: 50, kategori: "Mel og gryn" },
  { id: "havregryn", navn: "Havregryn (finvalsede)", gramPrDl: 30, kategori: "Mel og gryn" },
  { id: "groedris", navn: "Grødris", gramPrDl: 90, kategori: "Mel og gryn" },
  { id: "ris", navn: "Ris (løse)", gramPrDl: 80, kategori: "Mel og gryn" },
  { id: "linser", navn: "Linser", gramPrDl: 75, kategori: "Mel og gryn" },
  { id: "sukker", navn: "Sukker (hvidt)", gramPrDl: 85, kategori: "Sukker og sødt" },
  { id: "brun-farin", navn: "Brun farin", gramPrDl: 60, kategori: "Sukker og sødt" },
  { id: "flormelis", navn: "Flormelis", gramPrDl: 50, kategori: "Sukker og sødt" },
  { id: "sirup", navn: "Sirup", gramPrDl: 145, kategori: "Sukker og sødt" },
  { id: "honning", navn: "Honning", gramPrDl: 140, kategori: "Sukker og sødt" },
  { id: "smoer-smeltet", navn: "Smør (smeltet)", gramPrDl: 90, kategori: "Fedt og væske" },
  { id: "smoer-fast", navn: "Smør (fast)", gramPrDl: 95, kategori: "Fedt og væske" },
  { id: "olie", navn: "Olie", gramPrDl: 90, kategori: "Fedt og væske" },
  { id: "vaeske", navn: "Væske (vand og mælk)", gramPrDl: 100, kategori: "Fedt og væske" },
  { id: "kokosmel", navn: "Kokosmel", gramPrDl: 35, kategori: "Nødder og pulver" },
  { id: "kakaopulver", navn: "Kakaopulver", gramPrDl: 45, kategori: "Nødder og pulver" },
  { id: "mandler", navn: "Hele mandler", gramPrDl: 60, kategori: "Nødder og pulver" },
  { id: "hasselnoedder", navn: "Hele hasselnødder", gramPrDl: 60, kategori: "Nødder og pulver" },
] as const;

/** Rækkefølgen kategorierne vises i. */
export const GRAM_TIL_DL_KATEGORIER: readonly GramTilDlKategori[] = [
  "Mel og gryn",
  "Sukker og sødt",
  "Fedt og væske",
  "Nødder og pulver",
] as const;

/** Slår en vare op på id. Ukendt id giver `undefined`. */
export function vareVedId(id: string): GramTilDlVare | undefined {
  return GRAM_TIL_DL_VARER.find((v) => v.id === id);
}

/** Varen værktøjet starter på. Hvedemel er den mest søgte omregning. */
export const GRAM_TIL_DL_STANDARD_VARE = "hvedemel";

/** Mængden værktøjet starter på. */
export const GRAM_TIL_DL_STANDARD_MAENGDE = 150;

/** Antal decimaler i dl-svaret. */
export const GRAM_TIL_DL_DL_DECIMALER = 2;

/**
 * Omregner gram til deciliter for en tæthed i gram pr. dl.
 *
 * 150 g hvedemel med 60 g pr. dl giver `150 ÷ 60 = 2,5` dl. Ugyldig eller
 * negativ tæthed giver 0 i stedet for uendeligt, så UI'et aldrig viser `NaN`.
 */
export function gramTilDl(gram: number, gramPrDl: number): number {
  if (!Number.isFinite(gram) || !Number.isFinite(gramPrDl) || gramPrDl <= 0) return 0;
  return gram / gramPrDl;
}

/**
 * Omregner deciliter til gram for en tæthed i gram pr. dl.
 *
 * 2 dl sukker med 85 g pr. dl giver `2 × 85 = 170` g.
 */
export function dlTilGram(dl: number, gramPrDl: number): number {
  if (!Number.isFinite(dl) || !Number.isFinite(gramPrDl) || gramPrDl <= 0) return 0;
  return dl * gramPrDl;
}

export type GramTilDlRetning = "gram-til-dl" | "dl-til-gram";

export interface GramTilDlValg {
  vareId: string;
  maengde: number;
  retning: GramTilDlRetning;
}

export interface GramTilDlResultat {
  vare: GramTilDlVare;
  /** Resultatet i den anden enhed end den indtastede. */
  svar: number;
  /** Enheden svaret står i: "dl" eller "g". */
  svarEnhed: "dl" | "g";
  /** Den indtastede mængde, som den læses. */
  maengde: number;
  /** Enheden den indtastede mængde står i. */
  maengdeEnhed: "g" | "dl";
}

/**
 * Regner et omregningssvar for en vare.
 *
 * Retningen bestemmer, hvad der er indtastet, og hvad der svares i: `gram-til-dl`
 * læser gram og svarer i dl, `dl-til-gram` gør det omvendte.
 */
export function beregnGramTilDl(valg: GramTilDlValg): GramTilDlResultat {
  const vare = vareVedId(valg.vareId) ?? GRAM_TIL_DL_VARER[0];
  const maengde = Number.isFinite(valg.maengde) ? Math.max(0, valg.maengde) : 0;

  if (valg.retning === "dl-til-gram") {
    return {
      vare,
      svar: dlTilGram(maengde, vare.gramPrDl),
      svarEnhed: "g",
      maengde,
      maengdeEnhed: "dl",
    };
  }

  return {
    vare,
    svar: gramTilDl(maengde, vare.gramPrDl),
    svarEnhed: "dl",
    maengde,
    maengdeEnhed: "g",
  };
}

/** Eksemplet værktøjet, brødteksten og porten regner på. */
export const GRAM_TIL_DL_EKSEMPEL: GramTilDlValg = {
  vareId: GRAM_TIL_DL_STANDARD_VARE,
  maengde: GRAM_TIL_DL_STANDARD_MAENGDE,
  retning: "gram-til-dl",
};

/** Eksemplets resultat, så alle tekster læser samme tal. */
export function gramTilDlEksempel(): GramTilDlResultat {
  return beregnGramTilDl(GRAM_TIL_DL_EKSEMPEL);
}

/** Formaterer et tal med dansk komma og et fast antal decimaler. */
export function formatGramTilDl(
  tal: number,
  maksDecimaler = GRAM_TIL_DL_DL_DECIMALER,
): string {
  return tal.toLocaleString("da-DK", { maximumFractionDigits: maksDecimaler });
}
