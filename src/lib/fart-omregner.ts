/**
 * Omregning af hastighed mellem km/t, m/s, mph og knop.
 *
 * Faktorerne er **eksakte**, ikke afrundede. 1 yard er præcis 0,9144 m
 * (yard-and-pound-aftalen af 1959, som Danmark, Sverige og USA alle bruger),
 * så 1 international mil er præcis 1760 × 0,9144 = 1.609,344 km, og 1 mph
 * er derfor præcis 1,609344 km/t. 1 sømil er præcis 1.852 m
 * (international konvention), så 1 knop er præcis 1,852 km/t. 1 m/s er
 * præcis 3,6 km/t, fordi der er 3.600 sekunder i en time.
 *
 * Kaldet kommer fra dansk autocomplete 6/10 20:3x: **10 af 10** træffere under
 * «km i timen» er denne omregning («km i timen omregner», «km i timen til miles
 * per hour», «km i timen til meter i sekundet», «km i timen til knob», «km i
 * timen til sekundmeter», «km i timen til minutter per km»), og «knop
 * omregner» svarer «omregner knop til km» på to af fire træffere. Værktøjet på
 * /fart kunne finde *farten i km/t*, men havde intet felt at skrive i — så
 * «omregn km/t til m/s» og «10 knop til km» kunne ikke løses på sitet.
 *
 * Tempo (minutter pr. kilometer) og sekunder pr. 100 m er **ikke** med i
 * enhedslisten, fordi de ikke er lineære: de går *modsat* farten, så de
 * regnes i `tempoMinPrKm` og `sekundPr100m` i stedet for ganges på en faktor.
 *
 * Kun tal og id'er heri — ingen sprogstrenge (samme regel som
 * `areal-omregner.ts`), så en dansk streng ikke kan lække til beraknare.se.
 */

/** 1 yard i meter. Præcis, jf. yard-and-pound-aftalen af 1959. */
export const YARD_I_METER = 0.9144;

/** Antal yard i én international mil. Præcist: 1760. */
export const YARD_PR_MIL = 1760;

/** 1 international mil i kilometer. Præcis: 1760 × 0,9144 m = 1,609344 km. */
export const MIL_I_KM = (YARD_I_METER * YARD_PR_MIL) / 1000;

/** 1 sømil i meter. Præcis: 1852 m (international konvention). */
export const SOMERMIL_I_METER = 1852;

/** 1 sømil i kilometer. Præcis: 1,852. */
export const SOMERMIL_I_KM = SOMERMIL_I_METER / 1000;

/** Sekunder i én time. Præcis, definitionen af en time. */
export const SEKUNDER_I_TIME = 3600;

export type HastighedId = "km_t" | "m_s" | "mph" | "knop";

export interface HastighedEnhed {
  id: HastighedId;
  /** Hvor mange km/t én enhed udgør. */
  faktorKmT: number;
  /** Antal decimaler enheden vises med i værktøjet og i brødteksten. */
  decimaler: number;
}

/**
 * Rækkefølgen er km/t først, fordi det er enheden danske og svenske læsere
 * skriver ind i; resten er den rækkefølge, de siger den i autocomplete.
 */
export const HASTIGHED_ENHEDER: readonly HastighedEnhed[] = [
  { id: "km_t", faktorKmT: 1, decimaler: 1 },
  { id: "m_s", faktorKmT: SEKUNDER_I_TIME / 1000, decimaler: 2 },
  { id: "mph", faktorKmT: MIL_I_KM, decimaler: 1 },
  { id: "knop", faktorKmT: SOMERMIL_I_KM, decimaler: 1 },
] as const;

export function hastighedEnhed(id: HastighedId): HastighedEnhed {
  const fundet = HASTIGHED_ENHEDER.find((enhed) => enhed.id === id);
  if (!fundet) {
    throw new Error(`Ukendt hastighedsenhed: ${id}`);
  }
  return fundet;
}

/**
 * Tallet skal være et rigtigt tal i det mindste. Tomme felter og `NaN` giver
 * `false`, fordi værktøjet så ikke skal regne videre på dem. Negative
 * hastigheder er dog **gyldige**: en cykel kører 15 km/t *baglæns* på ruten
 * (eller en mand går -5 km/t), så modsat retning er et tegn på, der bruges.
 */
export function erGyldigFartvaerdi(vaerdi: number): boolean {
  return Number.isFinite(vaerdi);
}

/** Værdien i km/t. Ugyldige tal giver `NaN`, så værktøjet kan skjule facit. */
export function omregnTilKmT(vaerdi: number, fra: HastighedId): number {
  if (!erGyldigFartvaerdi(vaerdi)) return Number.NaN;
  return vaerdi * hastighedEnhed(fra).faktorKmT;
}

/** Værdien i den valgte enhed. Ugyldige tal giver `NaN`. */
export function omregnFart(
  vaerdi: number,
  fra: HastighedId,
  til: HastighedId,
): number {
  const kmT = omregnTilKmT(vaerdi, fra);
  if (!Number.isFinite(kmT)) return Number.NaN;
  return kmT / hastighedEnhed(til).faktorKmT;
}

/**
 * Værdien i alle fire enheder, så værktøjet kan vise dem på én gang og
 * brødteksten kan læse de samme tal som læseren indtastede.
 */
export function omregnFartTilAlle(
  vaerdi: number,
  fra: HastighedId,
): Record<HastighedId, number> {
  const kmT = omregnTilKmT(vaerdi, fra);
  const ud = {} as Record<HastighedId, number>;
  for (const enhed of HASTIGHED_ENHEDER) {
    ud[enhed.id] = Number.isFinite(kmT) ? kmT / enhed.faktorKmT : Number.NaN;
  }
  return ud;
}

/**
 * Afrundet til enhedens egne decimaler. Tallet bruges i både værktøjet og
 * brødteksten, så en læser kan efterprøve præcis det, der står på siden.
 */
export function rundFart(vaerdi: number, id: HastighedId): number {
  const faktor = 10 ** hastighedEnhed(id).decimaler;
  return Math.round(vaerdi * faktor) / faktor;
}

/**
 * Tempo i minutter pr. kilometer ud fra farten i km/t. Samme formel som
 * `beregnFart` bruger (`paceMinPrKm`), så de to værktøjer på `/fart` ikke kan
 * glide fra hinanden. Farten 0 giver `null`, fordi tempoet ved stående er
 * udefineret — ikke uendeligt.
 */
export function tempoMinPrKm(kmT: number): number | null {
  if (!Number.isFinite(kmT) || kmT === 0) return null;
  return 60 / kmT;
}

/** Meter i én kilometer. Præcis, definitionen af kilometerpræfikset. */
export const METER_I_KM = 1000;

/**
 * Sekunder pr. 100 meter ud fra farten i km/t. 10 km/t er 36 sekunder pr.
 * 100 m, som er det samme som 6 min/km. Farten 0 giver `null`.
 *
 * 100 m er 0,1 km, så tiden i sekunder er 0,1 km ÷ (km/t) × 3600.
 */
export function sekunderPr100m(kmT: number): number | null {
  if (!Number.isFinite(kmT) || kmT === 0) return null;
  return (100 / METER_I_KM / kmT) * SEKUNDER_I_TIME;
}

/**
 * De fire omregninger `/fart` skriver i brødteksten. De er valgt efter de
 * danske autocomplete-træffere: «100 km i timen til meter i sekundet»,
 * «km i timen til miles per hour», «km i timen til knob» og «omregner knop til
 * km». Færdigtal — brødteksten læser dem herfra, så de ikke kan komme i
 * forskæld med værktøjet.
 */
export const OMREGNINGS_EKSEAMPLER = [
  { vaerdi: 100, fra: "km_t", til: "m_s" },
  { vaerdi: 100, fra: "km_t", til: "mph" },
  { vaerdi: 100, fra: "km_t", til: "knop" },
  { vaerdi: 10, fra: "knop", til: "km_t" },
  { vaerdi: 60, fra: "mph", til: "km_t" },
] as const;

/**
 * De fire eksakte faktorer og de fire eksempelomregninger, formateret i det
 * sprog de læses i. Både værktøjets note og sidens brødtekst læser herfra,
 * så de ikke kan komme i forskæld med hinanden eller med `omregnFart`.
 */
export function fartOmregningsFakta(locale: "da" | "no" | "se"): {
  milKm: string;
  somermilKm: string;
  sekPerTime: string;
  meterPerSekund: string;
  eksempler: { vaerdi: number; fra: HastighedId; til: HastighedId; resultat: string }[];
} {
  const fmt = (tal: number, decimaler: number) =>
    tal.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimaler,
    });
  return {
    milKm: fmt(MIL_I_KM, 6),
    somermilKm: fmt(SOMERMIL_I_KM, 3),
    sekPerTime: fmt(SEKUNDER_I_TIME, 0),
    meterPerSekund: fmt(SEKUNDER_I_TIME / METER_I_KM, 1),
    eksempler: OMREGNINGS_EKSEAMPLER.map(({ vaerdi, fra, til }) => ({
      vaerdi,
      fra,
      til,
      resultat: fmt(rundFart(omregnFart(vaerdi, fra, til), til), hastighedEnhed(til).decimaler),
    })),
  };
}
