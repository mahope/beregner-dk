/**
 * Skattefradragsberegningen — ren logik, ingen UI.
 *
 * Alle satser og lofter læses fra `satser-2026.ts`, så `/skattefradrag` og
 * `/befordringsfradrag` ikke kan komme ud af trit om kørselsfradraget. Se
 * `SKATTEFRADRAG_2026` for kilde, verificeringsdato og hvilke tal der endnu
 * mangler en primær kilde.
 *
 * Fradragsværdierne er forenklede: et ligningsmæssigt fradrag værdersættes
 * til den gennemsnitlige kommunale skat plus bundskatten, mens
 * rentefradraget værdersættes efter sin egen to-trinssats. Den faktiske
 * besparelse afhænger af kommunen, indkomstniveau og topskat, så værktøjet
 * er vejledende.
 */
import { beregnRentefradrag } from "./rentefradrag";
import { SATSER_2026, SKATTEFRADRAG_2026 } from "./satser-2026";

export interface SkattefradragInput {
  /** Afstand til arbejde én vej, i km. */
  afstandKm: number;
  /** Fradragsberettigede arbejdsdage pr. år. */
  arbejdsdage: number;
  /** Årlige renteudgifter, i kroner. */
  aarligRente: number;
  fagforening: number;
  aKasse: number;
  /** Arbejdsløn til håndværkerydelser, i kroner. */
  haandvaerker: number;
  /** Serviceydelser (rengøring, have mv.), i kroner. */
  serviceydelser: number;
  donationer: number;
  oevrigeFradrag: number;
}

export type FradragType = "ligningsmaessigt" | "kapitalindkomst" | "boligfradrag";

export interface FradragPost {
  navn: string;
  beloeb: number;
  type: FradragType;
}

export interface SkattefradragResultat {
  /** Samlet fradrag inkl. boligjob/servicefradrag, i kroner. */
  samletFradrag: number;
  /** Skattebesparelsen i kroner, afrundet til hele kroner. */
  totalBesparelse: number;
  /** Skattebesparelsen fordelt på 12 måneder. */
  besparelsePrMd: number;
  poster: FradragPost[];
  koerselsFradrag: number;
  renteFradrag: number;
  renteBesparelse: number;
  fagOgAkasse: number;
  boligfradrag: number;
}

function belob(vaerdi: number): number {
  return Number.isFinite(vaerdi) && vaerdi > 0 ? vaerdi : 0;
}

function rund(op: number): number {
  return Math.round(op);
}

/**
 * Kørselsfradraget for én pendler: de første 24 km dagligt (12 km hver vej)
 * giver intet fradrag, de næste op til 120 km (altså 96 fradragsberettigede
 * km) giver høj sats, og km over 120 km giver lav sats. Fradraget gælder
 * uanset transportmiddel, fordi det beregnes på afstanden.
 */
export function beregnKoerselsfradragAar(afstandKm: number, arbejdsdage: number): number {
  const dage = Math.min(
    belob(arbejdsdage) || SKATTEFRADRAG_2026.koerselDageMax,
    SKATTEFRADRAG_2026.koerselDageMax,
  );
  const turRetur = belob(afstandKm) * 2;
  if (turRetur <= SATSER_2026.koerselBundgraense) return 0;

  const fradragsKm = turRetur - SATSER_2026.koerselBundgraense;
  const hoejKm = Math.max(0, SATSER_2026.koerselHoejGraense - SATSER_2026.koerselBundgraense);
  const iHoejSats = Math.min(fradragsKm, hoejKm);
  const iLavSats = Math.max(0, fradragsKm - hoejKm);

  return rund(
    (iHoejSats * SATSER_2026.koerselSatsLav + iLavSats * SATSER_2026.koerselSatsHoej) * dage,
  );
}

export function beregnSkattefradrag(input: SkattefradragInput): SkattefradragResultat | null {
  const koerselsFradrag = beregnKoerselsfradragAar(input.afstandKm, input.arbejdsdage);

  const renteFradrag = belob(input.aarligRente);
  const renteBesparelse = rund(beregnRentefradrag(renteFradrag, "single").besparelse);

  const fagforeningBeloeb = Math.min(belob(input.fagforening), SKATTEFRADRAG_2026.fagforeningMax);
  const aKasseBeloeb = belob(input.aKasse);
  const fagOgAkasse = fagforeningBeloeb + aKasseBeloeb;

  const haandvaerkerBeloeb = Math.min(belob(input.haandvaerker), SKATTEFRADRAG_2026.haandvaerkerMax);
  const serviceBeloeb = Math.min(belob(input.serviceydelser), SKATTEFRADRAG_2026.servicefradragMax);
  const boligfradrag = haandvaerkerBeloeb + serviceBeloeb;

  const donationerBeloeb = belob(input.donationer);
  const oevrigeBeloeb = belob(input.oevrigeFradrag);
  const oevrigtTotal = donationerBeloeb + oevrigeBeloeb;

  const samletFradrag = koerselsFradrag + renteFradrag + fagOgAkasse + oevrigtTotal;

  // Ligningsmæssige fradrag værdersættes til den gennemsnitlige kommunale
  // skat plus bundskatten. Boligjob-/servicefradrag har egen, lavere
  // fradragsværdi, og rentefradrag erstattes af sin egen to-trinssats.
  const skattesats = SATSER_2026.kommuneskatSnit + SATSER_2026.bundskat;
  const besparelseAlmindelig = rund(samletFradrag * skattesats);
  const besparelseBoligfradrag = rund(boligfradrag * SKATTEFRADRAG_2026.boligfradragSkattevaerdi);
  const totalBesparelse =
    besparelseAlmindelig +
    besparelseBoligfradrag +
    (renteBesparelse - rund(renteFradrag * skattesats));

  if (samletFradrag <= 0 && boligfradrag <= 0) return null;

  const poster: FradragPost[] = [
    ...(koerselsFradrag > 0
      ? [{ navn: "Kørselsfradrag", beloeb: koerselsFradrag, type: "ligningsmaessigt" as const }]
      : []),
    ...(renteFradrag > 0
      ? [{ navn: "Rentefradrag", beloeb: renteFradrag, type: "kapitalindkomst" as const }]
      : []),
    ...(fagforeningBeloeb > 0
      ? [{ navn: "Fagforening", beloeb: fagforeningBeloeb, type: "ligningsmaessigt" as const }]
      : []),
    ...(aKasseBeloeb > 0
      ? [{ navn: "A-kasse", beloeb: aKasseBeloeb, type: "ligningsmaessigt" as const }]
      : []),
    ...(haandvaerkerBeloeb > 0
      ? [{ navn: "Håndværkerfradrag", beloeb: haandvaerkerBeloeb, type: "boligfradrag" as const }]
      : []),
    ...(serviceBeloeb > 0
      ? [{ navn: "Serviceydelser", beloeb: serviceBeloeb, type: "boligfradrag" as const }]
      : []),
    ...(donationerBeloeb > 0
      ? [{ navn: "Donationer/gaver", beloeb: donationerBeloeb, type: "ligningsmaessigt" as const }]
      : []),
    ...(oevrigeBeloeb > 0
      ? [{ navn: "Øvrige fradrag", beloeb: oevrigeBeloeb, type: "ligningsmaessigt" as const }]
      : []),
  ];

  return {
    samletFradrag: samletFradrag + boligfradrag,
    totalBesparelse: rund(totalBesparelse),
    besparelsePrMd: rund(totalBesparelse / 12),
    poster,
    koerselsFradrag,
    renteFradrag,
    renteBesparelse,
    fagOgAkasse,
    boligfradrag,
  };
}
