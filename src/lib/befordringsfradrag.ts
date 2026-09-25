import { SATSER_2026 } from "./satser-2026";

export interface BefordringsfradragInput {
  kmPerDag: number;
  arbejdsdagePerAar: number;
  yderkommune: boolean;
  broStorebaeltTureAar: number;
  broOeresundTureAar: number;
  broOffentlig: boolean;
  indkomstFørAms: number;
}

export interface BefordringsfradragResult {
  fradraegPerDag: number;
  fradraegPerAar: number;
  skattevaerdi: number;
  almFradragPerAar: number;
  ekstraFradragPerAar: number;
  note: string | null;
}

export function beregnBefordringsfradrag(
  input: BefordringsfradragInput
): BefordringsfradragResult | null {
  const { kmPerDag, arbejdsdagePerAar, yderkommune, broStorebaeltTureAar, broOeresundTureAar, broOffentlig, indkomstFørAms } = input;

  if (kmPerDag < 0 || arbejdsdagePerAar < 0 || arbejdsdagePerAar > 365) return null;
  if (broStorebaeltTureAar < 0 || broOeresundTureAar < 0) return null;
  if (indkomstFørAms < 0) return null;

  const SATS = SATSER_2026;

  const kmOverBund = Math.max(0, kmPerDag - SATS.koerselBundgraense);

  if (kmOverBund === 0) {
    return {
      fradraegPerDag: 0,
      fradraegPerAar: 0,
      skattevaerdi: 0,
      almFradragPerAar: 0,
      ekstraFradragPerAar: 0,
      note: "Du kører under 24 km dagligt (12 km hver vej) og har ikke ret til befordringsfradrag.",
    };
  }

  const sats = yderkommune ? SATS.koerselYderkommuneSats : SATS.koerselSatsLav;
  const hoejSats = yderkommune ? SATS.koerselYderkommuneSats : SATS.koerselSatsHoej;

  const lavKm = Math.min(kmOverBund, SATS.koerselHoejGraense - SATS.koerselBundgraense);
  const hoejKm = Math.max(0, kmOverBund - (SATS.koerselHoejGraense - SATS.koerselBundgraense));

  let koerselFradragPerDag = lavKm * sats + hoejKm * hoejSats;

  let broFradragPerAar = 0;
  if (broStorebaeltTureAar > 0) {
    broFradragPerAar += broStorebaeltTureAar * (broOffentlig ? SATS.koerselBroStorebaeltOff : SATS.koerselBroStorebaelt);
  }
  if (broOeresundTureAar > 0) {
    broFradragPerAar += broOeresundTureAar * (broOffentlig ? SATS.koerselBroOeresundOff : SATS.koerselBroOeresund);
  }

  const almFradragPerAar = koerselFradragPerDag * arbejdsdagePerAar + broFradragPerAar;

  // Forhøjet fradrag for lav indkomst (LL § 9 C, stk. 4): 64 % af det normale kørselsfradrag,
  // højst 30.800 kr. Over 341.500 kr. nedsættes procenten med 1,28 point og maksimum med 2 %
  // for hver fulde 1.000 kr., så tillægget er væk ved 391.500 kr. Brofradrag indgår ikke.
  let ekstraFradragPerAar = 0;
  if (indkomstFørAms < SATS.koerselEkstraIndkomstGraense) {
    const tusinder = Math.max(0, Math.floor((indkomstFørAms - SATS.koerselEkstraAftrapningFra) / 1000));
    const pct = Math.max(0, SATS.koerselEkstraPct - tusinder * SATS.koerselEkstraAftrapningPct);
    const maks = Math.max(0, SATS.koerselEkstraFradragMax * (1 - tusinder * SATS.koerselEkstraMaxAftrapning));
    const normaltKoerselsfradrag = koerselFradragPerDag * arbejdsdagePerAar;
    ekstraFradragPerAar = Math.round(Math.min(normaltKoerselsfradrag * pct, maks) * 100) / 100;
  }

  const fradragPerAar = almFradragPerAar + ekstraFradragPerAar;

  const skattevaerdi = fradragPerAar * SATS.kommuneskatSnit;

  let note: string | null = null;
  if (yderkommune) {
    note = "Du har valgt den forhøjede sats for yderkommuner og småøer.";
  }

  return {
    fradraegPerDag: koerselFradragPerDag,
    fradraegPerAar: fradragPerAar,
    skattevaerdi: Math.round(skattevaerdi * 100) / 100,
    almFradragPerAar,
    ekstraFradragPerAar,
    note,
  };
}