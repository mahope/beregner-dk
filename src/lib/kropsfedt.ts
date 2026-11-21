/**
 * Estimate body-fat percentage with the U.S. Navy circumference method
 * (metric variant, measurements in centimetres, base-10 logarithms).
 *
 *   Men:   %BF = 495 / (1.0324 − 0.19077·log10(waist − neck)
 *                                + 0.15456·log10(height)) − 450
 *   Women: %BF = 495 / (1.29579 − 0.35004·log10(waist + hip − neck)
 *                                 + 0.22100·log10(height)) − 450
 *
 * This is an estimate; results vary with measurement accuracy and body type.
 */

export type Koen = "mand" | "kvinde";

export type FedtKategori = "essentiel" | "atlet" | "fitness" | "gennemsnit" | "over";

export interface KropsfedtResultat {
  procent: number;
  kategori: FedtKategori;
}

function kategoriser(koen: Koen, bf: number): FedtKategori {
  if (koen === "mand") {
    if (bf < 6) return "essentiel";
    if (bf < 14) return "atlet";
    if (bf < 18) return "fitness";
    if (bf < 25) return "gennemsnit";
    return "over";
  }
  if (bf < 14) return "essentiel";
  if (bf < 21) return "atlet";
  if (bf < 25) return "fitness";
  if (bf < 32) return "gennemsnit";
  return "over";
}

export function beregnKropsfedt(
  koen: Koen,
  hoejde: number,
  talje: number,
  hals: number,
  hofte: number
): KropsfedtResultat | null {
  if (hoejde <= 0 || talje <= 0 || hals <= 0) return null;

  let bf: number;
  if (koen === "mand") {
    const diff = talje - hals;
    if (diff <= 0) return null;
    bf =
      495 /
        (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(hoejde)) -
      450;
  } else {
    if (hofte <= 0) return null;
    const diff = talje + hofte - hals;
    if (diff <= 0) return null;
    bf =
      495 /
        (1.29579 - 0.35004 * Math.log10(diff) + 0.221 * Math.log10(hoejde)) -
      450;
  }

  if (!Number.isFinite(bf) || bf <= 0) return null;

  const procent = Math.round(bf * 10) / 10;
  return { procent, kategori: kategoriser(koen, procent) };
}
