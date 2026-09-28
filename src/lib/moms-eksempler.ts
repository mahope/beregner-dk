/**
 * Worked examples for the baklänges and Excel sections on /moms (se).
 *
 * Every number the page prints is derived from `beregnMoms` and
 * `fratraekRaekker` — the same module the calculator itself uses — so the
 * page cannot drift away from the tool.
 */

import { beregnMoms, fratraekRaekker, DEFAULT_MOMS_SATS, type MomsResultat } from "./moms";
import { formatNumber } from "./format";

export interface BaklaengesEksempel {
  prisInklMoms: number;
  prisUdenMoms: number;
  momsBeloeb: number;
}

/**
 * "499" är med, eftersom det är det belopp där 20 %-metoden och ÷ 1,25
 * ger varje sitt svar — det är skillnad som avsnittet handlar om.
 */
export const BAKLAENGES_EKSEMPEL_BELOEB = [1250, 499, 2000];

export function baklaengesEksempler(): BaklaengesEksempel[] {
  return BAKLAENGES_EKSEMPEL_BELOEB.map((inkl) =>
    beregnMoms(inkl, "fratraekMoms", DEFAULT_MOMS_SATS)
  );
}

export function baklaengesTabel(): MomsResultat[] {
  return fratraekRaekker(DEFAULT_MOMS_SATS);
}

/** Svensk beloppstecken: "1 250 kr" med non-breaking space som tusentalsavskiljare. */
export function krSe(tal: number): string {
  return `${formatNumber(tal, "se", { maximumFractionDigits: 2 })} kr`;
}
