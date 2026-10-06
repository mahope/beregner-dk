/**
 * Omregning af bilens forbrug mellem km/l, l/100 km og de to gallon-enheder.
 *
 * Faktorerne er **eksakte**, ikke afrundede. Den internationale mil er præcis
 * 1,609344 km (den britiske yard-and-pound-aftale af 1959, som Danmark,
 * Sverige, Storbritannien og USA alle bruger). Den amerikanske gallon er de
 * 231 kubiktommer i en «US liquid gallon», og en tomme er præcis 0,0254 m, så
 * gallonen er præcis 3,785411784 liter. Den britiske gallon er de 4,54609
 * liter, Imperial gallon hedder i SI-enheder.
 *
 * Den vigtigste fælde står i `KM_PER_LITER_FAKTORER`: mpg er **afstand pr.
 * brændstof**, samme retning som km/l, så én mil pr. gallon er milen *delt ind
 * i* gallonen (1,609344 ÷ 3,785411784 = 0,425143707 km/l) og ikke den anden
 * vej rundt. Og l/100 km er overhovedet ikke et forhold til km/l, men den
 * omvendte enhed: 6,7 l/100 km er 100 ÷ 6,7 = 14,93 km/l.
 *
 * Kaldet kommer fra dansk autocomplete 6/10 02:4x: 6 af 10 træffere under «km/l»
 * er en omregning («km/l til l/100km», «km/l to l/100km», «km/l to mpg», «km/l
 * vs mpg», «km/l to l/100», «km/l to l/km»), og «benzinforbrug pr km» er også en
 * træffer. `BraendstofBeregner` må *vise* l/100 km for det forbrug man lige har
 * fundet ud af liter og kilometer, men havde intet felt at skrive i — så «6,7
 * l/100 km, hvad er det i km/l?» kunne ikke løses på sitet overhovedet.
 *
 * Kun tal og id'er heri — ingen sprogstrenge (samme regel som
 * `areal-omregner.ts`), så en dansk streng ikke kan lække til beraknare.se.
 */

/** 1 international mil i km. Præcis, jf. yard-and-pound-aftalen af 1959. */
export const MIL_I_KM = 1.609344;

/** 1 tomme i meter. Præcis, samme aftale. */
const TOMME_I_METER = 0.0254;

/**
 * 1 kubiktomme i liter. Præcis, fordi tommen er præcis. `TOMME_I_METER³` er
 * kubik**meter**, og 1 m³ er 1.000 liter — uden de 1.000 bliver gallonen
 * 1.000 gange for lille, og alle mpg-tal 1.000 gange for små.
 */
const KUBIKTOMME_I_LITER = TOMME_I_METER ** 3 * 1000;

/** 1 US gallon i liter: de 231 kubiktommer i en «US liquid gallon». Præcis. */
export const US_GALLON_I_LITER = 231 * KUBIKTOMME_I_LITER;

/** 1 britisk (imperial) gallon i liter. Præcis i SI-enheder. */
export const IMP_GALLON_I_LITER = 4.54609;

/**
 * Så mange km/l én mil pr. US gallon er: 1,609344 ÷ 3,785411784 = 0,425143707.
 * Det er *ikke* 3,785411784 ÷ 1,609344 — mpg er afstand pr. brændstof, samme
 * retning som km/l, så det er gallonen der skal deles ind i milen.
 */
export const MPG_US_I_KM_PER_LITER = MIL_I_KM / US_GALLON_I_LITER;

/** Så mange km/l én mil pr. britisk gallon er: 1,609344 ÷ 4,54609 = 0,354006190. */
export const MPG_UK_I_KM_PER_LITER = MIL_I_KM / IMP_GALLON_I_LITER;

export type ForbrugsEnhedId = "kmPerLiter" | "literPr100km" | "mpg" | "mpgUk";

/**
 * Hvilken vej enheden regner. `kmPerLiter` er *afstand pr. brændstof* — det
 * gælder både km/l og begge gallon-enheder, for mpg er mil pr. gallon — mens
 * `literPr100km` er *brændstof pr. afstand*. Den er derfor den eneste
 * **omvendte** enhed, og den mangler med vilje i `KM_PER_LITER_FAKTORER`.
 */
export type ForbrugsRetning = "kmPerLiter" | "literPr100km";

/**
 * Hvor mange km/l én enhed udgør, for de tre enheder der er *afstand pr.
 * brændstof*. `literPr100km` står ikke heri: den er 100 ÷ km/l, ikke et
 * forhold til km/l.
 */
export const KM_PER_LITER_FAKTORER: Record<
  Exclude<ForbrugsEnhedId, "literPr100km">,
  number
> = {
  kmPerLiter: 1,
  mpg: MPG_US_I_KM_PER_LITER,
  mpgUk: MPG_UK_I_KM_PER_LITER,
};

export interface ForbrugsEnhed {
  id: ForbrugsEnhedId;
  retning: ForbrugsRetning;
  /** Antal decimaler enheden vises med i værktøjet og i brødteksten. */
  decimaler: number;
}

/**
 * Rækkefølgen er km/l først, fordi det er enheden danske og svenske læsere
 * skriver ind i; l/100 km er den danske brændstoftank, og gallon-enhederne
 * står til sidst i den rækkefølge, de siger dem i autocomplete.
 */
export const FORBRUGS_ENHEDER: readonly ForbrugsEnhed[] = [
  { id: "kmPerLiter", retning: "kmPerLiter", decimaler: 2 },
  { id: "literPr100km", retning: "literPr100km", decimaler: 2 },
  { id: "mpg", retning: "kmPerLiter", decimaler: 1 },
  { id: "mpgUk", retning: "kmPerLiter", decimaler: 1 },
] as const;

export function forbrugsEnhed(id: ForbrugsEnhedId): ForbrugsEnhed {
  const fundet = FORBRUGS_ENHEDER.find((enhed) => enhed.id === id);
  if (!fundet) {
    throw new Error(`Ukendt forbrugsenhed: ${id}`);
  }
  return fundet;
}

/**
 * Tallet skal være et rigtigt tal i det mindste, og det skal være positivt:
 * 0 liter pr. 100 km er en bil der ikke bruger brændstof, og `100 ÷ 0` er
 * uendeligt, så værktøjet skal kunne skjule facit i stedet for at skrive
 * «Infinity km/l».
 */
export function erGyldigtForbrug(vaerdi: number): boolean {
  return Number.isFinite(vaerdi) && vaerdi > 0;
}

/** Værdien i km/l. Ugyldige tal giver `NaN`, så værktøjet kan skjule facit. */
export function omregnTilKmPerLiter(vaerdi: number, fra: ForbrugsEnhedId): number {
  if (!erGyldigtForbrug(vaerdi)) return Number.NaN;
  if (fra === "literPr100km") return 100 / vaerdi;
  return vaerdi * KM_PER_LITER_FAKTORER[fra];
}

/** En værdi i km/l omsat til den valgte enhed. `NaN` forlænges ud i `NaN`. */
function fraKmPerLiter(kmPerLiter: number, til: ForbrugsEnhedId): number {
  if (!Number.isFinite(kmPerLiter)) return Number.NaN;
  if (til === "literPr100km") return 100 / kmPerLiter;
  return kmPerLiter / KM_PER_LITER_FAKTORER[til];
}

/** Værdien i den valgte enhed. Ugyldige tal giver `NaN`. */
export function omregnForbrug(
  vaerdi: number,
  fra: ForbrugsEnhedId,
  til: ForbrugsEnhedId,
): number {
  return fraKmPerLiter(omregnTilKmPerLiter(vaerdi, fra), til);
}

/**
 * Værdien i alle fire enheder, så værktøjet kan vise dem på én gang og
 * brødteksten kan læse de samme tal som læseren indtastede.
 */
export function omregnTilAlleForbrug(
  vaerdi: number,
  fra: ForbrugsEnhedId,
): Record<ForbrugsEnhedId, number> {
  const kmPerLiter = omregnTilKmPerLiter(vaerdi, fra);
  const ud = {} as Record<ForbrugsEnhedId, number>;
  for (const enhed of FORBRUGS_ENHEDER) {
    ud[enhed.id] = fraKmPerLiter(kmPerLiter, enhed.id);
  }
  return ud;
}

/**
 * Afrundet til enhedens egne decimaler. Tallet bruges i både værktøjet og
 * brødteksten, så en læser kan efterprøve præcis det, der står på siden.
 */
export function rundForbrug(vaerdi: number, id: ForbrugsEnhedId): number {
  const faktor = 10 ** forbrugsEnhed(id).decimaler;
  return Math.round(vaerdi * faktor) / faktor;
}

/**
 * De tre omregninger `/braendstof` skriver i brødteksten. De er valgt efter de
 * danske autocomplete-træffere: «benzinforbrug pr km», «km/l to l/100km» og
 * «km/l to mpg». Færdigtal — brødteksten læser dem herfra, så de ikke kan komme
 * i forskæld med værktøjet.
 */
export const FORBRUGS_OMREGNINGS_EKSEAMPLER = [
  { vaerdi: 6.7, fra: "literPr100km", til: "kmPerLiter" },
  { vaerdi: 15, fra: "kmPerLiter", til: "literPr100km" },
  { vaerdi: 15, fra: "kmPerLiter", til: "mpg" },
] as const satisfies readonly {
  vaerdi: number;
  fra: ForbrugsEnhedId;
  til: ForbrugsEnhedId;
}[];