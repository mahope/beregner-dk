/**
 * Blood alcohol concentration (promille / BAC) using the Widmark formula.
 *
 * BAC(‰) = A / (r · m) − β · t
 *   A = grams of pure alcohol
 *   r = Widmark distribution factor (0.68 men, 0.55 women)
 *   m = body weight in kg
 *   β = elimination rate (~0.15 ‰ per hour)
 *   t = hours since drinking started
 *
 * One standard drink ("genstand" / "standardglas") = 12 g pure alcohol in
 * both Denmark and Sweden. This is an estimate — actual BAC varies with food,
 * metabolism and other factors.
 */

export const GRAM_PR_GENSTAND = 12;
export const ELIMINATION_PR_TIME = 0.15; // ‰/hour
const R_MAND = 0.68;
const R_KVINDE = 0.55;

export type Koen = "mand" | "kvinde";

/**
 * The legal driving limit is a property of the country, not of the maths:
 * Denmark 0.5 ‰, Sweden and Norway 0.2 ‰. It lives here so the library can
 * never answer with the Danish limit on beraknare.se (see PROMILLEGRANSE).
 */
export const PROMILLEGRANSE: Record<"da" | "se" | "no", number> = {
  da: 0.5,
  se: 0.2,
  no: 0.2,
};

export const PROMILLEGRANSE_DA = PROMILLEGRANSE.da;

/**
 * Legal driving limits per country, in ‰, for the /promille page's
 * "grænsen i udlandet" table. Numbers only — the country names and the
 * special rules are Danish copy on the page itself, so the library stays
 * locale-free and cannot leak to beraknare.se.
 *
 * Denmark, Sweden and Norway are locked against PROMILLEGRANSE by
 * src/app/promille/page.test.tsx, so the printed table can never contradict
 * the limit the calculator itself compares against.
 *
 * Source for Denmark and Sweden: the law itself, not a summary of it.
 * Denmark 0.5 ‰ is færdselsloven § 53 ("overstiger 0,50 promille"), read
 * 2026-09-30 in Rådet for Sikker Trafik's verbatim reproduction because
 * retsinformation.dk serves agents nothing but the SPA shell. Sweden 0.2 ‰ is
 * trafikbrottslagen (1951:649) 4 §, read 2026-09-30 on riksdagen.se. The eight
 * other countries still come from WHO's country overview via Wikipedia — they
 * are left alone on purpose, see `LOVKILDE` in promille-loenkilde.test.tsx.
 * These are ordinary-driver limits. The page's "strengere regel" column states
 * the separate lower limits, including Denmark's 0.2 ‰ for a licence holder's
 * first 3 years, which are not in this map.
 */
export const PROMILLEGRANSE_UDLAND: Record<string, number> = {
  danmark: 0.5,
  sverige: 0.2,
  norge: 0.2,
  polen: 0.2,
  tyskland: 0.5,
  frankrig: 0.5,
  spanien: 0.5,
  italien: 0.5,
  graekenland: 0.5,
  holland: 0.5,
  oestrig: 0.5,
  storbritannien: 0.8,
};

export function graenseForLocale(locale: string): number {
  return PROMILLEGRANSE[locale as keyof typeof PROMILLEGRANSE] ?? PROMILLEGRANSE.da;
}

export interface PromilleResultat {
  promille: number;
  gramAlkohol: number;
  timerTilNul: number; // hours until BAC reaches 0
  timerTilGraense: number; // hours until BAC is below the legal limit
  maaKoere: boolean; // below the legal driving limit
  /**
   * The displayed promille is *exactly* the legal limit. Both the Danish and
   * the Swedish rules make it an offence to drive when the concentration
   * *exceeds* the limit, so at 0.50 ‰ (DA) / 0.20 ‰ (SE) nobody is over it —
   * but nobody is under it either, and `maaKoere` stays false on purpose, so
   * the tool never tells a borderline reader to get behind the wheel. The
   * flag exists so the wording can say "på grænsen" instead of claiming the
   * reader is "over grænsen", which the page's own text ("ulovligt at køre
   * bil med en promille over 0,5 ‰") contradicts.
   */
  paaGraensen: boolean;
}

/**
 * Hours until the promille drops to the legal limit. Rounded up, never down,
 * so the answer can never be more optimistic than the arithmetic. Uses the
 * same rounded promille the page displays, so the number read and the number
 * calculated can never disagree.
 */
export function timerTilGraense(promille: number, graense: number = PROMILLEGRANSE_DA): number {
  const difference = promille - graense;
  if (difference <= 0) return 0;
  return Math.ceil((difference / ELIMINATION_PR_TIME) * 10) / 10;
}

export function beregnPromille(
  antalGenstande: number,
  vaegtKg: number,
  koen: Koen,
  timerSiden: number,
  graense: number = PROMILLEGRANSE_DA
): PromilleResultat | null {
  if (!antalGenstande || antalGenstande <= 0 || !vaegtKg || vaegtKg <= 0) return null;

  const gramAlkohol = antalGenstande * GRAM_PR_GENSTAND;
  const r = koen === "mand" ? R_MAND : R_KVINDE;
  const peak = gramAlkohol / (r * vaegtKg);
  const promille = Math.max(0, peak - ELIMINATION_PR_TIME * Math.max(0, timerSiden));
  const afrundet = Math.round(promille * 100) / 100;

  return {
    promille: afrundet,
    gramAlkohol,
    timerTilNul: Math.ceil((afrundet / ELIMINATION_PR_TIME) * 10) / 10,
    timerTilGraense: timerTilGraense(afrundet, graense),
    maaKoere: afrundet < graense,
    paaGraensen: afrundet === graense,
  };
}
