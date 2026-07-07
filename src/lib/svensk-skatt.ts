/**
 * Swedish income-tax model for 2026 (persons under 66).
 *
 * Implements the official Skatteverket rules from the technical description
 * "SKV 433, utgåva 36" (inkomstår 2026): grundavdrag, jobbskatteavdrag
 * (skattereduktion för arbetsinkomst), statlig inkomstskatt, allmän
 * pensionsavgift (fully credited) and public service-avgift. Verified against
 * the worked examples in that document.
 *
 * All amounts are SEK/year unless noted. Rates are decimals.
 */

export const SVENSK_SKATT_2026 = {
  prisbasbelopp: 59200, // PBB 2026
  skiktgrans: 643000, // statlig skatt tas ut på beskattningsbar inkomst över detta
  statligSkatt: 0.2, // 20 %
  kommunalskattSnitt: 0.3238, // genomsnittlig kommunalskatt 2026 (kommun + region)
  begravningsavgift: 0.0028, // genomsnitt, betalas av alla
  kyrkoavgiftSnitt: 0.01, // genomsnitt, endast medlemmar i Svenska kyrkan
  pensionsavgift: 0.07, // allmän pensionsavgift (krediteras fullt ut)
  publicServiceSats: 0.01,
  publicServiceMax: 1184, // maximal public service-avgift 2026
} as const;

const PBB = SVENSK_SKATT_2026.prisbasbelopp;

/** Round up to nearest 100 kr (grundavdrag rounding rule). */
function avrundaUppHundra(n: number): number {
  return Math.ceil(n / 100) * 100;
}

/**
 * Grundavdrag for persons under 66, based on fastställd förvärvsinkomst (FFI).
 * Piecewise per SKV 433 (tiers in prisbasbelopp). Capped at FFI, rounded up
 * to nearest 100.
 */
export function beregnGrundavdrag(ffi: number): number {
  if (ffi <= 0) return 0;
  let ga: number;
  if (ffi <= 0.99 * PBB) {
    ga = 0.423 * PBB;
  } else if (ffi <= 2.72 * PBB) {
    ga = 0.423 * PBB + 0.2 * (ffi - 0.99 * PBB);
  } else if (ffi <= 3.11 * PBB) {
    ga = 0.77 * PBB;
  } else if (ffi <= 7.88 * PBB) {
    ga = 0.77 * PBB - 0.1 * (ffi - 3.11 * PBB);
  } else {
    ga = 0.293 * PBB;
  }
  return avrundaUppHundra(Math.min(ga, ffi));
}

/**
 * Jobbskatteavdrag (skattereduktion för arbetsinkomst) for persons under 66,
 * per SKV 433 (tiers in prisbasbelopp), multiplied by the municipal tax rate.
 * `arbetsinkomst` is floored to nearest 100 for this computation.
 */
export function beregnJobbskatteavdrag(
  arbetsinkomst: number,
  grundavdrag: number,
  kommunalskatt: number
): number {
  const ai = Math.floor(arbetsinkomst / 100) * 100;
  let underlag: number; // (arbetsinkomst-del − grundavdrag)
  if (ai <= 0.91 * PBB) {
    underlag = ai - grundavdrag;
  } else if (ai <= 3.24 * PBB) {
    underlag = 0.91 * PBB + 0.3874 * (ai - 0.91 * PBB) - grundavdrag;
  } else if (ai <= 8.08 * PBB) {
    underlag = 1.813 * PBB + 0.251 * (ai - 3.24 * PBB) - grundavdrag;
  } else {
    underlag = 3.027 * PBB - grundavdrag;
  }
  return Math.max(0, underlag) * kommunalskatt;
}

export interface SvenskSkattResultat {
  arsloen: number;
  grundavdrag: number;
  beskattningsbar: number;
  kommunalSkatt: number;
  statligSkatt: number;
  jobbskatteavdrag: number;
  publicService: number;
  begravningsavgift: number;
  kyrkoavgift: number;
  summaSkatt: number;
  nettoAar: number;
  nettoMaaned: number;
  effektivSkattProcent: number;
}

/**
 * Full net-salary computation for a person under 66. `kommunalskatt` is the
 * municipal rate as a decimal (e.g. 0.3238). `kyrkomedlem` adds kyrkoavgift.
 *
 * Allmän pensionsavgift (7 %) is added and fully credited, so it nets to zero;
 * its credit competes with the jobbskatteavdrag for the municipal-tax budget,
 * which is modelled so the result is exact for real salaries.
 */
export function beregnSvenskSkatt(
  arsloen: number,
  kommunalskatt: number = SVENSK_SKATT_2026.kommunalskattSnitt,
  kyrkomedlem = false
): SvenskSkattResultat | null {
  if (!arsloen || arsloen <= 0) return null;

  const grundavdrag = beregnGrundavdrag(arsloen);
  const beskattningsbar = Math.max(0, arsloen - grundavdrag);

  const kommunalSkatt = beskattningsbar * kommunalskatt;
  const statligSkatt =
    Math.max(0, beskattningsbar - SVENSK_SKATT_2026.skiktgrans) *
    SVENSK_SKATT_2026.statligSkatt;

  // Allmän pensionsavgift (100 % credited) is subtracted from the municipal
  // tax before the jobbskatteavdrag, so the reduction cannot exceed what is
  // left of the municipal tax.
  const pensionsavgiftReduktion = arsloen * SVENSK_SKATT_2026.pensionsavgift;
  const jsaRaw = beregnJobbskatteavdrag(arsloen, grundavdrag, kommunalskatt);
  const jobbskatteavdrag = Math.min(
    jsaRaw,
    Math.max(0, kommunalSkatt - pensionsavgiftReduktion)
  );

  const publicService = Math.min(
    beskattningsbar * SVENSK_SKATT_2026.publicServiceSats,
    SVENSK_SKATT_2026.publicServiceMax
  );
  const begravningsavgift = beskattningsbar * SVENSK_SKATT_2026.begravningsavgift;
  const kyrkoavgift = kyrkomedlem
    ? beskattningsbar * SVENSK_SKATT_2026.kyrkoavgiftSnitt
    : 0;

  const summaSkatt =
    kommunalSkatt +
    statligSkatt -
    jobbskatteavdrag +
    publicService +
    begravningsavgift +
    kyrkoavgift;
  const nettoAar = arsloen - summaSkatt;

  return {
    arsloen,
    grundavdrag,
    beskattningsbar,
    kommunalSkatt: Math.round(kommunalSkatt),
    statligSkatt: Math.round(statligSkatt),
    jobbskatteavdrag: Math.round(jobbskatteavdrag),
    publicService: Math.round(publicService),
    begravningsavgift: Math.round(begravningsavgift),
    kyrkoavgift: Math.round(kyrkoavgift),
    summaSkatt: Math.round(summaSkatt),
    nettoAar: Math.round(nettoAar),
    nettoMaaned: Math.round(nettoAar / 12),
    effektivSkattProcent: Math.round((summaSkatt / arsloen) * 1000) / 10,
  };
}
