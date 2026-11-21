import { heleDageMellem, parseIsoDato, tilIsoDato } from "./lokal-dato";

/**
 * "Hvor langt er jeg henne?" — graviditetsugen regnet ud fra den dato, man
 * kender.
 *
 * `/termin` regner den anden vej: man skriver første dag i sidste menstruation,
 * og siden giver terminsdatoen. Denne side svarer på det modsatte spørgsmål,
 * som dansk autocomplete (målt 9/10 2026, hl=da) har ti træffere på under både
 * "hvor mange uger er jeg henne" og "hvor langt er jeg henne" — bl.a. "på en
 * bestemt dato", "ud fra termin", "ud fra ægløsning" og "ivf". Fælles for dem
 * er, at datoen man kender *ikke* er sidste menstruation, så `/termin`'s ene
 * felt ikke kan svare.
 *
 * Alle tal bygger på Naegeles regel, den samme regel `/termin` bruger: en
 * graviditet regnes fra første dag i sidste menstruation og varer 280 dage
 * (40 uger). Ægløsningen sættes til 14 dage efter, altså dag 14 af graviditeten,
 * og en termin er derfor 266 dage efter undfangelsen. Beregningen antager en
 * regelmæssig 28-dages cyklus; ved en anden cyklus eller ved IVF retter
 * ultralydsscanningen i uge 12 terminsdatoen, og lægen bruger herefter den.
 *
 * Modulet kender ingen `Date.now()`: reference-datoen er et argument, så en
 * test kan låse tallene på en bestemt dag, og så siden kan regne i *sidens*
 * tidszone og ikke i serverens eller læserens.
 */

/** Dage fra første dag i sidste menstruation til terminsdatoen (40 uger). */
export const GRAVIDITET_DAGE = 280;

/** Dage fra første dag i sidste menstruation til ægløsningen (dag 14). */
export const AEGLOESNING_DAGE = 14;

/** Dage fra undfangelsen til terminsdatoen (280 − 14). */
export const TERMIN_FRA_UNDFANGELSE_DAGE = GRAVIDITET_DAGE - AEGLOESNING_DAGE;

/** Længste graviditet, værktøjet svarer på, i dage — 45 uger. */
export const MAKS_GRAVIDITET_DAGE = 45 * 7;

export const GRAVIDITETSUGE_KILDE =
  "Naegeles regel: en graviditet regnes fra første dag i sidste menstruation og varer 280 dage (40 uger). Ægløsningen sættes til dag 14. Ved en anden cyklus eller ved IVF retter ultralydsscanningen i uge 12 terminsdatoen.";

export type GraviditetInputKind = "sidsteMens" | "termin" | "undfangelse";

export interface GraviditetInput {
  kind: GraviditetInputKind;
  /** Den kendte dato som "YYYY-MM-DD". */
  dato: string;
}

export interface Graviditetsuge {
  /** Hele uger henne (0-44). */
  uger: number;
  /** Dage ind i den aktuelle uge (0-6). */
  dage: number;
  /** Hele graviditetsdage siden første dag i sidste menstruation. */
  totalDage: number;
  /** Terminsdatoen som "YYYY-MM-DD". */
  termin: string;
  /** Ægløsnings-/undfangelsesdatoen som "YYYY-MM-DD". */
  undfangelse: string;
  /** Første dag i sidste menstruation som "YYYY-MM-DD". */
  sidsteMens: string;
  /** 1, 2 eller 3 — samme grænser som `/termin` bruger. */
  trimester: 1 | 2 | 3;
  /** Hele dage til terminsdatoen; negativ hvis den er passeret. */
  dageTilTermin: number;
  /** Hvor stor en del af de 280 dage der er gået, 0-100. */
  procent: number;
}

/** Flytter en "YYYY-MM-DD" et antal kalenderdage, læst som kalenderfelter. */
export function plusDage(iso: string, dage: number): string | null {
  const dato = parseIsoDato(iso);
  if (!dato) return null;
  return tilIsoDato(new Date(dato.getFullYear(), dato.getMonth(), dato.getDate() + dage));
}

/**
 * Regner graviditetsugen for den kendte dato mod en reference-dato (typisk i
 * dag). Giver `null`, når en dato er ugyldig, når reference-datoen ligger før
 * undfangelsen, eller når graviditeten ville være over 45 uger — så værktøjet
 * aldrig viser en uge, der ikke findes.
 */
export function beregnGraviditetsuge(
  input: GraviditetInput,
  referenceIso: string
): Graviditetsuge | null {
  if (!parseIsoDato(input.dato) || !parseIsoDato(referenceIso)) return null;

  const sidsteMens =
    input.kind === "sidsteMens"
      ? input.dato
      : input.kind === "termin"
        ? plusDage(input.dato, -GRAVIDITET_DAGE)
        : plusDage(input.dato, -AEGLOESNING_DAGE);
  if (!sidsteMens) return null;

  const termin = plusDage(sidsteMens, GRAVIDITET_DAGE);
  const undfangelse = plusDage(sidsteMens, AEGLOESNING_DAGE);
  if (!termin || !undfangelse) return null;

  const fra = parseIsoDato(sidsteMens)!;
  const til = parseIsoDato(referenceIso)!;
  const totalDage = heleDageMellem(fra, til);

  if (totalDage < 0 || totalDage > MAKS_GRAVIDITET_DAGE) return null;

  const uger = Math.floor(totalDage / 7);
  const dage = totalDage % 7;
  const trimester: 1 | 2 | 3 = uger < 13 ? 1 : uger < 27 ? 2 : 3;

  return {
    uger,
    dage,
    totalDage,
    termin,
    undfangelse,
    sidsteMens,
    trimester,
    dageTilTermin: GRAVIDITET_DAGE - totalDage,
    procent: Math.min(100, Math.max(0, Math.round((totalDage / GRAVIDITET_DAGE) * 100))),
  };
}
