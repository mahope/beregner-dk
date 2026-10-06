/**
 * Nutidskroner — omregn et beløb fra et år til dagens prisniveau.
 *
 * Tallene kommer fra **Danmarks Statistiks forbrugerprisindeks**:
 *
 * - `PRIS8` «Forbrugerprisindeks, årsgennemsnit» (1900-2025) er årsgennemsnittet
 *   af indekset, hentet fra StatBank 7/10 2026:
 *   `https://api.statbank.dk/v1/data/PRIS8/CSV?TYPE=INDEKS&Tid=*`
 * - `PRIS01` «Forbrugerprisindeks» (2025=100) er den månedlige serie. Den
 *   seneste offentliggjorte måned er **august 2026 = 102,58** (hentet 7/10 2026:
 *   `https://api.statbank.dk/v1/data/PRIS01/CSV?VAREGR=000000&ENHED=100`).
 *
 * De to tabeller har hver sit indeks-niveau, men et *forhold* mellem to år er
 * det samme i begge. `FORBRUGERPRISINDEKS_NU` skalerer derfor august 2026 ind i
 * PRIS8's niveau: PRIS01's 2025-gennemsnit er præcis 100, og PRIS8's 2025-tal er
 * 8.343, så 102,58 × 8.343 / 100 = 8.558. Det er det tal, et beløb ganges med
 * for at nå dagens prisniveau.
 *
 * Basen (1900 = 100) er uden betydning for beregningen, fordi kun forholdet
 * mellem to indeksværdier bruges. Derfor kan et beløb fra 1900 og et fra 2025
 * regnes med samme formel.
 */

/** StatBank-tabellerne bag tallene. */
export const NUTIDSKRONER_KILDE = {
  aarlig: "PRIS8",
  maanedlig: "PRIS01",
  navn: "Danmarks Statistik, forbrugerprisindeks (årsgennemsnit)",
  url: "https://www.dst.dk/da/Statistik/emner/priser-og-forbrug/forbrugerprisindeks",
  hentet: "2026-10-07",
} as const;

/** Den seneste måned, tallene dækker. */
export const NUTIDSKRONER_NU_PERIODE = "august 2026";

/** Året, «nutid» hører til i år-vælgeren. */
export const NUTIDSKRONER_NU_AAR = 2026;

/** Det tidligste år, indekset dækker. */
export const NUTIDSKRONER_AAR_MIN = 1900;

/** Det seneste hele år med et offentliggjort årsgennemsnit. */
export const NUTIDSKRONER_SENESTE_HELE_AAR = 2025;

/**
 * Årsgennemsnit af forbrugerprisindekset, 1900-2025 (PRIS8). Værdierne står,
 * som Danmarks Statistik offentliggjorde dem — de er ikke afrundet her.
 */
export const FORBRUGERPRISINDEKS_AARLIG: Readonly<Record<number, number>> = {
  1900: 100, 1901: 100, 1902: 101, 1903: 101, 1904: 102, 1905: 102, 1906: 103, 1907: 106,
  1908: 107, 1909: 108, 1910: 109, 1911: 109, 1912: 113, 1913: 116, 1914: 119, 1915: 140,
  1916: 165, 1917: 191, 1918: 223, 1919: 264, 1920: 315, 1921: 268, 1922: 228, 1923: 237,
  1924: 251, 1925: 244, 1926: 207, 1927: 200, 1928: 199, 1929: 198, 1930: 188, 1931: 178,
  1932: 177, 1933: 181, 1934: 188, 1935: 196, 1936: 198, 1937: 205, 1938: 207, 1939: 213,
  1940: 266, 1941: 305, 1942: 315, 1943: 318, 1944: 325, 1945: 328, 1946: 326, 1947: 335,
  1948: 344, 1949: 352, 1950: 384, 1951: 429, 1952: 439, 1953: 436, 1954: 444, 1955: 474,
  1956: 498, 1957: 504, 1958: 509, 1959: 519, 1960: 531, 1961: 555, 1962: 591, 1963: 622,
  1964: 645, 1965: 686, 1966: 733, 1967: 787, 1968: 850, 1969: 880, 1970: 937, 1971: 992,
  1972: 1058, 1973: 1156, 1974: 1333, 1975: 1461, 1976: 1592, 1977: 1769, 1978: 1946, 1979: 2133,
  1980: 2396, 1981: 2677, 1982: 2948, 1983: 3152, 1984: 3350, 1985: 3507, 1986: 3636, 1987: 3782,
  1988: 3953, 1989: 4142, 1990: 4251, 1991: 4353, 1992: 4445, 1993: 4500, 1994: 4590, 1995: 4686,
  1996: 4785, 1997: 4890, 1998: 4980, 1999: 5104, 2000: 5253, 2001: 5377, 2002: 5507, 2003: 5622,
  2004: 5687, 2005: 5790, 2006: 5900, 2007: 6001, 2008: 6205, 2009: 6287, 2010: 6432, 2011: 6609,
  2012: 6768, 2013: 6821, 2014: 6860, 2015: 6891, 2016: 6909, 2017: 6988, 2018: 7045, 2019: 7098,
  2020: 7128, 2021: 7260, 2022: 7819, 2023: 8077, 2024: 8188, 2025: 8343,
};

/**
 * Dagens prisniveau, skaleret ind i PRIS8's niveau. Se modul-docblocken:
 * august 2026 er 102,58 med 2025 = 100, og PRIS8's 2025-gennemsnit er 8.343, så
 * 102,58 × 8.343 / 100 = 8.558 (afrundet til hele indekspoint).
 */
export const FORBRUGERPRISINDEKS_NU = 8558;

/** Indeksværdien for et år, eller null hvis året ligger uden for serien. */
export function forbrugerprisindeks(aar: number): number | null {
  if (aar === NUTIDSKRONER_NU_AAR) return FORBRUGERPRISINDEKS_NU;
  return FORBRUGERPRISINDEKS_AARLIG[aar] ?? null;
}

/** De år, vælgerne kan vise: hele år 1900-2025 plus «nutid» 2026. */
export function nutidskroneAar(): number[] {
  const aar = Object.keys(FORBRUGERPRISINDEKS_AARLIG).map(Number);
  return [...aar, NUTIDSKRONER_NU_AAR];
}

export interface NutidskroneResultat {
  /** Beløbet regnet om til `tilAar`. */
  beloeb: number;
  fraAar: number;
  tilAar: number;
  indeksFra: number;
  indeksTil: number;
  /** `indeksTil / indeksFra` — hvor mange gange dyrere `tilAar` er. */
  faktor: number;
  /** Prisstigningen i procent, fx 62,9 for 2000 -> august 2026. */
  aendringPct: number;
}

/**
 * Regn `beloeb` fra `fraAar` om til `tilAar` (standard: dagens niveau).
 * Returnerer null for et ukendt år eller et negativt beløb.
 */
export function omregnTilNutidskroner(
  beloeb: number,
  fraAar: number,
  tilAar: number = NUTIDSKRONER_NU_AAR
): NutidskroneResultat | null {
  const indeksFra = forbrugerprisindeks(fraAar);
  const indeksTil = forbrugerprisindeks(tilAar);
  if (indeksFra === null || indeksTil === null) return null;
  if (!Number.isFinite(beloeb) || beloeb < 0) return null;
  const faktor = indeksTil / indeksFra;
  return {
    beloeb: beloeb * faktor,
    fraAar,
    tilAar,
    indeksFra,
    indeksTil,
    faktor,
    aendringPct: (faktor - 1) * 100,
  };
}

/** De år, eksempeltabellen på siden viser. */
export const NUTIDSKRONER_EKSEMPEL_AAR = [1980, 1990, 2000, 2010, 2015, 2020] as const;
