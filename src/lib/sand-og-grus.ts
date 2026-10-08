/**
 * Sand- og grusberegner — hvor mange m³ og ton skal der til et areal?
 *
 * Regnestykket er rent geometri: `volumen = areal × lagtykkelse`, hvor arealet
 * er `længde × bredde` i m² og lagtykkelsen i cm omregnes til meter (`/ 100`).
 * Vægten er `volumen × densitet`, og densiteten er materialets ton pr. m³.
 *
 * **Hverken lagtykkelse eller densitet er en fast kendsgerning:** begge er
 * vejledende værdier fra danske sand- og grusleverandører og er redigerbare i
 * værktøjet. Derfor bærer siden ingen tal, den ikke selv regner frem — tabel,
 * brødtekst og FAQ læser alle dette modul.
 *
 * Kilde og verificeringsdato: se `SAND_OG_GRUS_KILDE`.
 */

export interface GrusMateriale {
  id: string;
  navn: string;
  /** Typisk lagtykkelse, nedre grænse, i cm. */
  lagCmMin: number;
  /** Typisk lagtykkelse, øvre grænse, i cm. */
  lagCmMax: number;
  /** Den lagtykkelse værktøjet starter på, i cm. */
  lagCmStandard: number;
  /** Vejledende densitet i ton pr. m³ (komprimeret materiale). */
  densitetTPerM3: number;
  /** Kort forklaring af, hvad materialet bruges til. */
  brug: string;
}

/**
 * De tre materialer, siden dækker, med lagtykkelser og densiteter.
 *
 * Lagtykkelserne er leverandørernes anbefalinger: afretningssand 3-5 cm under
 * fliser, stabilgrus 10-20 cm som bærelag og bundsikring 10-15 cm nederst.
 * Densiteterne (sand 1,6, stabilgrus 1,9 og bundsikring 1,8 t/m³) er de
 * vejledende værdier for det komprimerede materiale.
 */
export const GRUS_MATERIALER: readonly GrusMateriale[] = [
  {
    id: "afretningssand",
    navn: "Afretningssand (flisesand)",
    lagCmMin: 3,
    lagCmMax: 5,
    lagCmStandard: 5,
    densitetTPerM3: 1.6,
    brug: "Det øverste lag under fliser og belægningssten, hvor fliserne rettes af.",
  },
  {
    id: "stabilgrus",
    navn: "Stabilgrus",
    lagCmMin: 10,
    lagCmMax: 20,
    lagCmStandard: 15,
    densitetTPerM3: 1.9,
    brug: "Bærelag i indkørsler og stier og under terrasser, der skal bære noget.",
  },
  {
    id: "bundsikring",
    navn: "Bundsikring (fyldsand)",
    lagCmMin: 10,
    lagCmMax: 15,
    lagCmStandard: 12,
    densitetTPerM3: 1.8,
    brug: "Det nederste lag, der leder vand væk og spærrer for fugtig jord.",
  },
] as const;

export const SAND_OG_GRUS_KILDE = {
  lagtykkelser:
    "https://www.sandshoppen.dk/maengdeberegner/ og https://havehandel.dk/pages/maengdeberegner",
  densiteter: "https://materialeberegner.dk/beregnere/underlag",
  beskrivelse:
    "Danske sand- og grusleverandører anbefaler afretningssand i 3-5 cm under fliser, stabilgrus i 10-20 cm som bærelag og bundsikring i 10-15 cm nederst. Vejledende densiteter for det komprimerede materiale er 1,6 t/m³ for sand, 1,9 t/m³ for stabilgrus og 1,8 t/m³ for bundsikring.",
  verifiedAt: "2026-10-08",
} as const;

/** Spild tillagt i standardberegningen, i procent. Samme tommelfingerregel som fliser. */
export const GRUS_STANDARD_SPILD_PCT = 10;

/** Ekstra materiale til komprimering, i procent. Leverandørerne regner med 1,2× laget. */
export const GRUS_KOMPRIMERING_EKSTRA_PCT = 20;

/** Standardarealet værktøjet og brødteksten regner på, i meter. */
export const GRUS_STANDARD_LAENGDE_M = 5;
export const GRUS_STANDARD_BREDDE_M = 2;

/** Liter pr. kubikmeter. */
export const LITER_PR_M3 = 1000;

export interface GrusValg {
  /** Arealets længde i meter. */
  laengdeM: number;
  /** Arealets bredde i meter. */
  breddeM: number;
  /** Materialets id fra `GRUS_MATERIALER`. Ukendt id giver første materiale. */
  materialeId: string;
  /** Lagtykkelse i cm. Udefineret bruger materialets standard. */
  lagCm?: number;
  /** Spild i procent. Negativ eller udefineret behandles som 0. */
  spildPct?: number;
}

export interface GrusResultat {
  /** Arealet i m². */
  arealM2: number;
  /** Den anvendte lagtykkelse i cm. */
  lagCm: number;
  /** Volumen uden spild, i m³. */
  volumenM3: number;
  /** Volumen inkl. spild, i m³. Det der skal bestilles. */
  volumenMedSpildM3: number;
  /** Volumen inkl. spild, i liter. */
  literMedSpild: number;
  /** Vægt inkl. spild, i ton. */
  tonMedSpild: number;
  /** Materialet beregningen er lavet for. */
  materiale: GrusMateriale;
}

/** Slår et materiale op på id og falder tilbage til det første, så et ukendt id aldrig giver 0. */
export function grusMaterialeVedId(id: string | undefined): GrusMateriale {
  return GRUS_MATERIALER.find((m) => m.id === id) ?? GRUS_MATERIALER[0];
}

function positiv(tal: number | undefined): number {
  return typeof tal === "number" && Number.isFinite(tal) && tal > 0 ? tal : 0;
}

/**
 * Regner mængden af sand eller grus for et areal.
 *
 * Et areal på 5 × 2 m er 10 m². Med 5 cm afretningssand er volumen
 * `10 × 0,05 = 0,5 m³`, og med 10 % spild `0,5 × 1,10 = 0,55 m³`. Sand vejer
 * 1,6 t/m³, så det bliver `0,55 × 1,6 = 0,88 ton`.
 */
export function beregnGrus(valg: GrusValg): GrusResultat {
  const laengde = positiv(valg.laengdeM);
  const bredde = positiv(valg.breddeM);
  const materiale = grusMaterialeVedId(valg.materialeId);
  const lagCm =
    typeof valg.lagCm === "number" && Number.isFinite(valg.lagCm) && valg.lagCm > 0
      ? valg.lagCm
      : materiale.lagCmStandard;
  const spildPct = positiv(valg.spildPct);

  const arealM2 = laengde * bredde;
  const volumenM3 = arealM2 * (lagCm / 100);
  const volumenMedSpildM3 = volumenM3 * (1 + spildPct / 100);

  return {
    arealM2,
    lagCm,
    volumenM3,
    volumenMedSpildM3,
    literMedSpild: volumenMedSpildM3 * LITER_PR_M3,
    tonMedSpild: volumenMedSpildM3 * materiale.densitetTPerM3,
    materiale,
  };
}

/** Standardarealet værktøjet og brødteksten regner på. */
export const GRUS_EKSEMPEL: GrusValg = {
  laengdeM: GRUS_STANDARD_LAENGDE_M,
  breddeM: GRUS_STANDARD_BREDDE_M,
  materialeId: "afretningssand",
  lagCm: GRUS_MATERIALER[0].lagCmStandard,
  spildPct: GRUS_STANDARD_SPILD_PCT,
};

/** Eksemplets resultat, så brødteksten og porten læser samme tal. */
export function grusEksempel(): GrusResultat {
  return beregnGrus(GRUS_EKSEMPEL);
}
