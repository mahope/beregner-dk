/**
 * Efterløn 2026 — single source of truth for efterlønsalder, folkepensionsalder
 * og den skattefri præmie.
 *
 * Kilde: borger.dk (skrevet af Styrelsen for Arbejmarked og Rekruttering)
 * - Efterlønsalder og folkepensionsalder:
 *   https://www.borger.dk/pension-og-efterloen/Efterloen-fleksydelse-delpension/efterloen/foer-du-gaar-paa-efterloen
 * - Skattefri præmie:
 *   https://www.borger.dk/pension-og-efterloen/Efterloen-fleksydelse-delpension/efterloen/skattefri-praemie
 * Verificeret: 2026-09-26
 *
 * Folkepensionsalderen i `EFTERLOEN_ALDER_2026` er den samme skala som
 * `folkepension.ts`, og `efterloen.test.ts` håndhæver det.
 *
 * Borger.dk offentliggør tabellen for fødte til og med 31. december 1970. For
 * yngre fødselsår stiger efterløns- og folkepensionsalderen løbende med
 * middellevetiden, så de kan ikke fastsættes her — det står som `undefined`, og
 * værktøjet skal så bede om a-kassen.
 */

/** Én række i borger.dk's skema, med hele fødselsår for opslag på fødselsår. */
export interface EfterloenAldersRække {
  /** Første fødselsår i rækken. */
  fraAar: number;
  /** Sidste fødselsår i rækken. `undefined` når rækken er åben. */
  tilAar?: number;
  /** Fødselsdatoerne i rækken, som borger.dk skriver dem. */
  fraDato: string;
  tilDato?: string;
  /**
   * Efterlønsalderen. For fødselsår der går på tværs af to rækker (1959) er
   * værdierne et interval, fordi fødselsdatoen er afgørende.
   */
  efterloensalder: { lav: number; hoej: number };
  /** Folkepensionsalderen i samme række. */
  folkepensionsalder: number;
  /** Højst mulige antal år på efterløn i rækken. */
  maxAarPaaEfterloen: { lav: number; hoej: number };
}

export const EFTERLOEN_ALDER_KILDE =
  "https://www.borger.dk/pension-og-efterloen/Efterloen-fleksydelse-delpension/efterloen/foer-du-gaar-paa-efterloen";
export const EFTERLOEN_ALDER_VERIFICERET = "2026-09-26";

export const EFTERLOEN_ALDER_2026: readonly EfterloenAldersRække[] = [
  {
    fraAar: 1956,
    tilAar: 1958,
    fraDato: "1. juli 1956",
    tilDato: "31. december 1958",
    efterloensalder: { lav: 63, hoej: 63 },
    folkepensionsalder: 67,
    maxAarPaaEfterloen: { lav: 4, hoej: 4 },
  },
  {
    fraAar: 1959,
    tilAar: 1959,
    fraDato: "1. januar 1959",
    tilDato: "30. juni 1959",
    efterloensalder: { lav: 63.5, hoej: 64 },
    folkepensionsalder: 67,
    maxAarPaaEfterloen: { lav: 3, hoej: 3.5 },
  },
  {
    fraAar: 1960,
    tilAar: 1962,
    fraDato: "1. juli 1959",
    tilDato: "31. december 1962",
    efterloensalder: { lav: 64, hoej: 64 },
    folkepensionsalder: 67,
    maxAarPaaEfterloen: { lav: 3, hoej: 3 },
  },
  {
    fraAar: 1963,
    tilAar: 1966,
    fraDato: "1. januar 1963",
    tilDato: "31. december 1966",
    efterloensalder: { lav: 65, hoej: 65 },
    folkepensionsalder: 68,
    maxAarPaaEfterloen: { lav: 3, hoej: 3 },
  },
  {
    fraAar: 1967,
    tilAar: 1970,
    fraDato: "1. januar 1967",
    tilDato: "31. december 1970",
    efterloensalder: { lav: 66, hoej: 66 },
    folkepensionsalder: 69,
    maxAarPaaEfterloen: { lav: 3, hoej: 3 },
  },
];

export const SKATTEFRI_PRAEMIE_KILDE =
  "https://www.borger.dk/pension-og-efterloen/Efterloen-fleksydelse-delpension/efterloen/skattefri-praemie";

export const SKATTEFRI_PRAEMIE_2026 = {
  kilde: SKATTEFRI_PRAEMIE_KILDE,
  verifiedAt: "2026-09-26",
  /** Én portion kræver som udgangspunkt 481 arbejdstimer (37 timer i 3 måneder). */
  timerPerPortion: 481,
  /** Der kan højst optjenes 12 portioner. */
  maxPortioner: 12,
  /** Portionsbeløbet i 2026, som fuldtids- og deltidsforsikret. */
  portion: { full: 15870, part: 10580 },
  /**
   * For at optjene præmie *mens* man er på efterløn skal man have ventet 2 år
   * med at gå på efterløn og arbejdet disse timer i ventetiden.
   */
  udskydelseAar: 2,
  udskydelseTimer: { full: 3120, part: 2496 },
} as const;

/** 12 portioner a 481 timer = 5.772 timer, som er loftet borger.dk oplyser. */
export const MAX_TIMER_TIL_PRAEMIE =
  SKATTEFRI_PRAEMIE_2026.timerPerPortion * SKATTEFRI_PRAEMIE_2026.maxPortioner;

export interface EfterloenAlder {
  efterloensalder: number;
  folkepensionsalder?: number;
  /** Højst mulige år på efterløn, uden udskydelse. */
  maxAarPaaEfterloen?: number;
  /** `false` når fødselsåret går på tværs af to aldersrækker (1959). */
  praecis: boolean;
  /**
   * `true` når fødselsåret er nyere end den offentliggjorte tabel, så alderen
   * skal afklares hos a-kassen.
   */
  udenForTabel: boolean;
}

/**
 * Efterløns- og folkepensionsalder for et helt fødselsår.
 *
 * For fødselsår der går på tværs af to rækker (1959) bruges den **højeste**
 * efterlønsalder og det **færeste** år på efterløn, så værktøjet aldrig lover
 * en lavere alder end den reelle. `praecis` er `false`, når det er tilfældet.
 */
export function efterloenAlder(fodselsaar: number): EfterloenAlder {
  const række = EFTERLOEN_ALDER_2026.find(
    (r) => fodselsaar >= r.fraAar && fodselsaar <= (r.tilAar ?? fodselsaar)
  );

  if (!række) {
    return { efterloensalder: NaN, praecis: false, udenForTabel: true };
  }

  const praecis = række.efterloensalder.lav === række.efterloensalder.hoej;

  return {
    efterloensalder: række.efterloensalder.hoej,
    folkepensionsalder: række.folkepensionsalder,
    maxAarPaaEfterloen: række.maxAarPaaEfterloen.lav,
    praecis,
    udenForTabel: false,
  };
}

/**
 * Antal skattefri præmieportioner for et antal arbejdstimer **mens man er på
 * efterløn**. Kun hele portioner tæller, og loftet er 12 portioner (5.772 timer).
 *
 * Borger.dk oplyser, at optjening fra efterløn forudsætter, at man har ventet
 * 2 år med at gå på efterløn (og arbejdet de 3.120/2.496 timer i ventetiden),
 * så uden udskydelse er der ingen portioner.
 */
export function praemiePortioner(
  timer: number,
  harVentetMedAtGaaPaaEfterloen: boolean
): number {
  if (!harVentetMedAtGaaPaaEfterloen) return 0;
  if (timer < SKATTEFRI_PRAEMIE_2026.timerPerPortion) return 0;

  const portioner = Math.floor(timer / SKATTEFRI_PRAEMIE_2026.timerPerPortion);

  return Math.min(SKATTEFRI_PRAEMIE_2026.maxPortioner, portioner);
}

/**
 * Om der mangler en dokumenteret forudsætning for præmie fra efterløn, så
 * værktøjet kan forklare hvorfor der vises 0 portioner.
 */
export function praemieManglerForudsætning(
  timer: number,
  harVentetMedAtGaaPaaEfterloen: boolean
): boolean {
  return timer >= SKATTEFRI_PRAEMIE_2026.timerPerPortion && !harVentetMedAtGaaPaaEfterloen;
}
