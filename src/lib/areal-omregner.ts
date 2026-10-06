/**
 * Omregning af areal mellem m², cm², km², hektar, kvadratfod og acre.
 *
 * Faktorerne er **eksakte**, ikke afrundede: 1 fod er præcis 0,3048 m
 * (yard-and-pound-aftalen af 1959, som Danmark, Sverige og USA alle bruger),
 * så 1 kvadratfod er præcis 0,3048 × 0,3048 = 0,09290304 m². 1 acre er de
 * 43.560 kvadratfod i en acre, altså 4.046,8564224 m². Alt andet er
 * SI-præfikser og SI-enheder, derfor 1:1, 1:10.000 og 1:1.000.000.
 *
 * Kaldet kommer fra dansk autocomplete 6/10 02:2x: 9 af 10 træffere under
 * «omregn kvadratmeter til» er denne omregning (kvadratcentimeter, kvadratfod,
 * kvadratkilometer, hektar, acres, square feet), og 10 af 10 træffere under
 * «kvadratfod» starter med «kvadratfod til …». Værktøjet på /kvadratmeter
 * kunne *vise* m², cm², hektar og kvadratfod for det areal man lige har
 * regnet, men havde intet felt at skrive i — så den omvende vej, «500
 * kvadratfod til m²», kunne ikke løses på sitet overhovedet.
 *
 * Kun tal og id'er heri — ingen sprogstrenge (samme regel som
 * `areal-eksempler.ts`), så en dansk streng ikke kan lække til beraknare.se.
 */

/** 1 fod i meter. Præcis, jf. yard-and-pound-aftalen af 1959. */
export const FOD_I_METER = 0.3048;

/** 1 tomme i meter. Præcis, samme aftale. */
export const TOMMER_I_METER = 0.0254;

/** 1 kvadratfod (sq ft) i m². Præcis, fordi foden er præcis. */
export const KVADRATFOD_I_M2 = FOD_I_METER * FOD_I_METER;

/** Antal kvadratfod i én acre. Præcist: 66 × 660. */
export const KVADRATFOD_PR_ACRE = 43_560;

/** 1 acre (international) i m². Præcis, fordi kvadratfoden er præcis. */
export const ACRE_I_M2 = KVADRATFOD_I_M2 * KVADRATFOD_PR_ACRE;

export type ArealEnhedId = "m2" | "cm2" | "km2" | "hektar" | "kvadratfod" | "acre";

export interface ArealEnhed {
  id: ArealEnhedId;
  /** Hvor mange m² én enhed udgør. */
  faktorM2: number;
  /** Antal decimaler enheden vises med i værktøjet og i brødteksten. */
  decimaler: number;
}

/**
 * Rækkefølgen er m² først, fordi det er enheden danske og svenske læsere
 * skriver ind i; resten er den rækkefølge, de siger den i autocomplete.
 */
export const AREAL_ENHEDER: readonly ArealEnhed[] = [
  { id: "m2", faktorM2: 1, decimaler: 2 },
  { id: "cm2", faktorM2: 1 / 10_000, decimaler: 0 },
  { id: "km2", faktorM2: 1_000_000, decimaler: 6 },
  { id: "hektar", faktorM2: 10_000, decimaler: 4 },
  { id: "kvadratfod", faktorM2: KVADRATFOD_I_M2, decimaler: 2 },
  { id: "acre", faktorM2: ACRE_I_M2, decimaler: 6 },
] as const;

export function arealEnhed(id: ArealEnhedId): ArealEnhed {
  const fundet = AREAL_ENHEDER.find((enhed) => enhed.id === id);
  if (!fundet) {
    throw new Error(`Ukendt arealenhed: ${id}`);
  }
  return fundet;
}

/**
 * Tallet skal være et rigtigt tal i det mindste. Tomme felter, `NaN` og
 * negative arealer giver `false`, fordi værktøjet så ikke skal regne videre
 * på dem — et areal kan ikke være negativt, og brugeren kan ikke have
 * mening i et resultat af `-20 m²`.
 */
export function erGyldigArealvaerdi(vaerdi: number): boolean {
  return Number.isFinite(vaerdi) && vaerdi >= 0;
}

/** Værdien i m². Ugyldige tal giver `NaN`, så værktøjet kan skjule facit. */
export function omregnTilM2(vaerdi: number, fra: ArealEnhedId): number {
  if (!erGyldigArealvaerdi(vaerdi)) return Number.NaN;
  return vaerdi * arealEnhed(fra).faktorM2;
}

/** Værdien i den valgte enhed. Ugyldige tal giver `NaN`. */
export function omregnAreal(vaerdi: number, fra: ArealEnhedId, til: ArealEnhedId): number {
  const m2 = omregnTilM2(vaerdi, fra);
  if (!Number.isFinite(m2)) return Number.NaN;
  return m2 / arealEnhed(til).faktorM2;
}

/**
 * Værdien i alle seks enheder, så værktøjet kan vise dem på én gang og
 * brødteksten kan læse de samme tal som læseren indtastede (C73's R4).
 */
export function omregnTilAlle(
  vaerdi: number,
  fra: ArealEnhedId,
): Record<ArealEnhedId, number> {
  const m2 = omregnTilM2(vaerdi, fra);
  const ud = {} as Record<ArealEnhedId, number>;
  for (const enhed of AREAL_ENHEDER) {
    ud[enhed.id] = Number.isFinite(m2) ? m2 / enhed.faktorM2 : Number.NaN;
  }
  return ud;
}

/**
 * Afrundet til enhedens egne decimaler. Tallet bruges i både værktøjet og
 * brødteksten, så en læser kan efterprøve præcis det, der står på siden.
 */
export function rundAreal(vaerdi: number, id: ArealEnhedId): number {
  const faktor = 10 ** arealEnhed(id).decimaler;
  return Math.round(vaerdi * faktor) / faktor;
}

/**
 * De tre omregninger `/kvadratmeter` skriver i brødteksten. De er valgt efter
 * de danske autocomplete-træffere: «500 kvadratfod» (første træffer under
 * «kvadratfod»), «kvadratmeter til acres» og «kvadratfod til kvadratmeter».
 * Færdigtal — brødteksten læser dem herfra, så de ikke kan komme i
 * forskæld med værktøjet.
 */
export const OMREGNINGS_EKSEAMPLER = [
  { vaerdi: 500, fra: "kvadratfod", til: "m2" },
  { vaerdi: 1, fra: "acre", til: "m2" },
  { vaerdi: 100, fra: "m2", til: "kvadratfod" },
] as const satisfies readonly { vaerdi: number; fra: ArealEnhedId; til: ArealEnhedId }[];