import { SATSER_2026 } from "./satser-2026";

/**
 * Arveafgift / boafgift — de tal brødteksten på `/arveafgift` regner med.
 *
 * Satserne er ikke her: de ligger i {@link SATSER_2026} med kildeangivelse
 * (skm.dk), og beregneren `ArveafgiftBeregner` læser dem derfra. Det, der lå
 * i siden, var *regnestykkerne om* satserne — «bundfradraget på 392.300 kr» stod
 * syv gange i brødteksten, og «(1.000.000 − 392.300) × 15% = 91.155 kr» stod
 * som ét skrevet tal. De var alle rigtige i 2026, og netop derfor ville de være
 * stående i 2027, hvor bundfradraget stiger, mens siden så læste det gamle tal
 * syv steder.
 *
 * Modulet er derfor ikke en kopi af satserne, men den regning brødteksten
 * hævder: den effektive marginale sats og de to arveeksempler.
 */

/** Bundfradraget pr. bo. Ægtefæller er fritaget og bruger det ikke. */
export const BUNDFRADRAG = SATSER_2026.arveBundfradrag;

/** Boafgiften for nærmeste familie. */
export const BOAFGIFT_SATS = SATSER_2026.boafgift;

/**
 * Tillægsafgiften for søskende og andre. Den beregnes af arven *efter* boafgift,
 * ikke af bundfradraget — derfor står den ikke i {@link BOAFGIFT_SATS}s grundlag.
 */
export const TILLAEGSBOAFGIFT_SATS = SATSER_2026.tillaegsboafgift;

/**
 * Den effektive marginale sats for søskende og andre: 15 % boafgift plus 25 %
 * tillægsafgift af de resterende 85 %, altså 36,25 %.
 *
 * Siden skrev «Den effektive marginale sats nærmer sig 36,25 % for store
 * arvebeløb» — tallet er rigtigt, men det var håndskrevet, så det fulgte ikke de to
 * satser det er regnet ud af. Nu er det afledet, og «nærmer sig» er væk: for en
 * vilkårligt stor arv er den **præcis** 36,25 %.
 */
export const EFFEKTIV_MARGINAL_SATS =
  BOAFGIFT_SATS + (1 - BOAFGIFT_SATS) * TILLAEGSBOAFGIFT_SATS;

/** Ét regnet eksempel, så brødteksten ikke skal regne det selv. */
export interface ArveEksempel {
  /** Arv efter afdøde, i kroner. */
  arv: number;
  /** Beløbet over bundfradraget — boafgiftens grundlag. */
  grundlag: number;
  /** Boafgiften. */
  boafgift: number;
  /** Tillægsafgiften, 0 for grupper uden tillægsafgift. */
  tillaeg: number;
  /** Boafgift + tillægsafgift. */
  iAlt: number;
  /** Det arven efter afgifter bliver hos arvingen. */
  modtager: number;
}

/**
 * Regner ét eksempel med de samme regler som `ArveafgiftBeregner`: bundfradraget
 * trækkes fra først, boafgiften betales af resten, og tillægsafgiften af arven
 * *efter* boafgift.
 */
export function beregnArveafgift(arv: number, medTillaeg = false): ArveEksempel {
  const grundlag = Math.max(0, arv - BUNDFRADRAG);
  const boafgift = grundlag * BOAFGIFT_SATS;
  const tillaeg = medTillaeg ? (arv - boafgift) * TILLAEGSBOAFGIFT_SATS : 0;
  const iAlt = boafgift + tillaeg;
  return { arv, grundlag, boafgift, tillaeg, iAlt, modtager: arv - iAlt };
}

/**
 * Arbejdseksemplet under «Bundfradraget» på `/arveafgift`: et barn arver
 * 1.000.000 kr, bundfradraget trækkes fra, og de 15 % rammer resten.
 *
 * Arvbeløbet er et valg — det er ikke en sats, og ingen skal slå det op — men
 * **afgiften er** regnet her, så den ikke kan blive stående ved et nyt
 * bundfradrag.
 */
export const EKSEMPEL_BARN = beregnArveafgift(1_000_000);

/**
 * De to fulde regneeksempler `/blog/arveafgift-regler-og-satser` gennemgår, som
 * `/arveafgift`s guideboks navngiver: 1.500.000 kr til børn og 800.000 kr til en
 * søskende.
 *
 * Guideboksen siger «to fulde regneeksempler på 1.500.000 kr til børn og 800.000
 * kr til en søskende» — altså påstande om et andet dokuments indhold. De to
 * beløb skal derfor have samme ejer som indlægget, ellers kan siden love en
 * regning, indlægget ikke viser.
 */
export const EKSEMPLER_GUIDE = {
  barn: beregnArveafgift(1_500_000),
  soeskende: beregnArveafgift(800_000, true),
};