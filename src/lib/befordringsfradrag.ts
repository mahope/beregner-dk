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

  let ekstraFradragPerAar = 0;
  if (indkomstFørAms < SATS.koerselEkstraIndkomstGraense) {
    const maxEkstra = SATS.koerselEkstraFradragMax;
    const nedtrappesFra = SATS.koerselEkstraIndkomstGraense - maxEkstra;
    if (indkomstFørAms <= nedtrappesFra) {
      ekstraFradragPerAar = maxEkstra;
    } else {
      ekstraFradragPerAar = Math.max(0, maxEkstra - (indkomstFørAms - nedtrappesFra));
    }
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