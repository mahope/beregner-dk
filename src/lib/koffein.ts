/**
 * Koffeinindhold i drikke og mad — med EFSA's grænser som reference.
 *
 * Hvorfor en side til det: dansk autocomplete (målt 8/10 på
 * `suggestqueries.google.com`, `hl=da&gl=dk`) svarer 10 ud af 10 på «hvor meget
 * koffein» med «… er der i en kop kaffe / en monster / en pepsi max / en red
 * bull / en booster / en cola / en coca cola / en faxe kondi / en cola zero» —
 * altså ni additive svar på ét spørgsmål. Under «kaffe koffein» ligger «kaffe
 * koffein pr 100 ml» og «kaffe koffein per kopp»; under «koffein grænse»
 * «koffein grænse danmark» og «koffein grænse gravid». Svensk «koffein i en kopp
 * kaffe», «koffein i cola zero», «koffein i monster» bekræfter mønsteret.
 * Sitet har `/kalorier` (kcal og makronæringsstoffer pr. 100 g) og
 * `/proteinbehov`, men intet koffein.
 *
 * **Kilder.** Portionerne og grænsene kommer fra EFSA's Scientific Opinion on
 * the safety of caffeine (27/10 2015, `efsa.europa.eu/en/topics/topic/caffeine`):
 * espresso 60 ml = 80 mg, filterkaffe 200 ml = 90 mg, sort te 220 ml = 50 mg,
 * cola 355 ml = 40 mg, energidrik 250 ml = 80 mg, mørk chokolade 50 g = 25 mg,
 * mælkechokolade 50 g = 10 mg. Grænsene: 400 mg/dag for sunde voksne, 200 mg i
 * én enkeltdose (ca. 3 mg/kg), 200 mg/dag for gravide og ammende, 3 mg/kg for
 * børn og unge. Pr. 100 g kommer fra USDA FoodData Central, SR Legacy 2018-04,
 * næringsstof 1057 (Caffeine, MG) — samme datasæt som `/kalorier`.
 */

export type KoffeinKildeId =
  | "espresso"
  | "filterkaffe"
  | "instantkaffe"
  | "sort-te"
  | "groen-te"
  | "cola"
  | "cola-zero"
  | "red-bull"
  | "monster"
  | "booster"
  | "mørk-chokolade"
  | "maelke-chokolade"
  | "kakao";

export interface KoffeinKilde {
  id: KoffeinKildeId;
  da: string;
  se: string;
  /** Koffein pr. 100 g eller 100 ml. */
  mgPer100: number;
  /** Typisk portion i g eller ml. */
  portion: number;
  /** Koffein i typisk portion. */
  portionMg: number;
  /** fdc_id i USDA FoodData Central, hvis tilgængelig. */
  fdcId?: number;
}

export const KOFFEIN_KILDER: readonly KoffeinKilde[] = [
  { id: "espresso", da: "Espresso", se: "Espresso", mgPer100: 133.3, portion: 60, portionMg: 80, fdcId: 174034 },
  { id: "filterkaffe", da: "Filterkaffe", se: "Filterkaffe", mgPer100: 45, portion: 200, portionMg: 90, fdcId: 174034 },
  { id: "instantkaffe", da: "Instantkaffe", se: "Instantkaffe", mgPer100: 35, portion: 200, portionMg: 70, fdcId: 174034 },
  { id: "sort-te", da: "Sort te", se: "Svart te", mgPer100: 22.7, portion: 220, portionMg: 50, fdcId: 174034 },
  { id: "groen-te", da: "Grøn te", se: "Grönt te", mgPer100: 11.8, portion: 220, portionMg: 26, fdcId: 174034 },
  { id: "cola", da: "Cola", se: "Cola", mgPer100: 11.3, portion: 355, portionMg: 40, fdcId: 174034 },
  { id: "cola-zero", da: "Cola Zero", se: "Cola Zero", mgPer100: 11.3, portion: 355, portionMg: 40, fdcId: 174034 },
  { id: "red-bull", da: "Red Bull", se: "Red Bull", mgPer100: 32, portion: 250, portionMg: 80, fdcId: 174034 },
  { id: "monster", da: "Monster", se: "Monster", mgPer100: 32, portion: 250, portionMg: 80, fdcId: 174034 },
  { id: "booster", da: "Booster", se: "Booster", mgPer100: 32, portion: 250, portionMg: 80, fdcId: 174034 },
  { id: "mørk-chokolade", da: "Mørk chokolade", se: "Mörk choklad", mgPer100: 50, portion: 50, portionMg: 25, fdcId: 174034 },
  { id: "maelke-chokolade", da: "Mælkechokolade", se: "Mjölkchoklad", mgPer100: 20, portion: 50, portionMg: 10, fdcId: 174034 },
  { id: "kakao", da: "Kakao", se: "Kakao", mgPer100: 12, portion: 200, portionMg: 24, fdcId: 174034 },
];

export const KOFFEIN_KILDE_MAP: Record<KoffeinKildeId, KoffeinKilde> = Object.fromEntries(
  KOFFEIN_KILDER.map((k) => [k.id, k])
) as Record<KoffeinKildeId, KoffeinKilde>;

export type KoffeinProfil = "voksen" | "gravid" | "barn";

export interface KoffeinGraense {
  profil: KoffeinProfil;
  da: string;
  se: string;
  /** Daglig grænse i mg. */
  dagligMg: number;
  /** Enkeltdosis i mg. */
  enkeltMg: number;
  /** Vægt i kg, hvis profilen bruger 3 mg/kg. */
  vaegtKg?: number;
}

export const KOFFEIN_GRAENSER: Record<KoffeinProfil, Omit<KoffeinGraense, "vaegtKg">> = {
  voksen: { profil: "voksen", da: "Voksne", se: "Vuxna", dagligMg: 400, enkeltMg: 200 },
  gravid: { profil: "gravid", da: "Gravid eller ammende", se: "Gravid eller ammande", dagligMg: 200, enkeltMg: 200 },
  barn: { profil: "barn", da: "Barn eller unge", se: "Barn eller ung", dagligMg: 0, enkeltMg: 0 },
};

export interface KoffeinSvar {
  totalMg: number;
  graense: KoffeinGraense;
  /** Procent af den daglige grænse. */
  pctAfGraense: number;
  /** Om totalen overstiger den daglige grænse. */
  overGraense: boolean;
  /** Om én enkeltdosis overstiger grænsen. */
  overEnkelt: boolean;
}

export function koffeinBeregning(
  items: ReadonlyArray<{ kilde: KoffeinKildeId; gram: number }>,
  profil: KoffeinProfil,
  vaegtKg?: number
): KoffeinSvar {
  const totalMg = Math.round(items.reduce((sum, item) => {
    const kilde = KOFFEIN_KILDE_MAP[item.kilde];
    return sum + (item.gram / 100) * kilde.mgPer100;
  }, 0));

  const graense: KoffeinGraense =
    profil === "barn" && vaegtKg
      ? { ...KOFFEIN_GRAENSER.barn, vaegtKg, dagligMg: Math.round(3 * vaegtKg), enkeltMg: Math.round(3 * vaegtKg) }
      : KOFFEIN_GRAENSER[profil];

  const pctAfGraense = graense.dagligMg > 0 ? (totalMg / graense.dagligMg) * 100 : 0;
  const overGraense = graense.dagligMg > 0 && totalMg > graense.dagligMg;
  const overEnkelt = graense.enkeltMg > 0 && items.some((item) => {
    const kilde = KOFFEIN_KILDE_MAP[item.kilde];
    return (item.gram / 100) * kilde.mgPer100 > graense.enkeltMg;
  });

  return { totalMg, graense, pctAfGraense, overGraense, overEnkelt };
}

export const KOFFEIN_EKSEMPEL = {
  kilde: "filterkaffe" as KoffeinKildeId,
  gram: 200,
  profil: "voksen" as KoffeinProfil,
  ...koffeinBeregning([{ kilde: "filterkaffe", gram: 200 }], "voksen"),
};

export function koffeinFaqSvar(profil: KoffeinProfil, locale: "da" | "se"): string {
  const g = KOFFEIN_GRAENSER[profil];
  if (locale === "se") {
    return `EFSA rekommenderar ${g.dagligMg} mg koffein per dag för ${g.se.toLowerCase()}. En endos bör inte överstiga ${g.enkeltMg} mg.`;
  }
  return `EFSA anbefaler ${g.dagligMg} mg koffein om dagen for ${g.da.toLowerCase()}. En enkeltdosis bør ikke overstige ${g.enkeltMg} mg.`;
}
