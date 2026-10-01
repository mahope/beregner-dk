/**
 * Børne- og ungeydelse 2026 — single source of truth.
 * Beløbene er pr. udbetalingsinterval, som de står hos borger.dk.
 * Kilde: https://www.borger.dk/familie-og-boern/familieydelser-oversigt/boerne-ungeydelse
 * Nedsættelse: https://www.borger.dk/familie-og-boern/familieydelser-oversigt/boerne-ungeydelse/boerne-ungeydelse-nedsaettelse
 * Verificeret: 2026-09-25
 * Udbetalingsreglen (20. i hver måned, hverdagen inden ved weekend/helligdag)
 * er verificeret mod samme side 2026-09-28.
 */

import { erArbejdsdag, foegArbejdsdage } from "./helligdage";

export interface BoernSats {
  /** Aldersgruppe, som den står hos borger.dk. */
  alder: string;
  /** Nedre aldersgrænse i hele år. */
  fraAar: number;
  /** Hvor hyppigt beløbet udbetales. */
  interval: "kvartal" | "maaned";
  /** interval i dansk læsbar form, fx i prosa. */
  intervalNavn: "kvartal" | "måned";
  /** Hele beløbet pr. interval. */
  hel: number;
  /** Halvdelen af beløbet pr. interval, når forældrene har fælles forældremyndighed. */
  halv: number;
}

export const BOERNE_SATSER_2026: readonly BoernSats[] = [
  { alder: "0-2 år", fraAar: 0, interval: "kvartal", intervalNavn: "kvartal", hel: 5370, halv: 2685 },
  { alder: "3-6 år", fraAar: 3, interval: "kvartal", intervalNavn: "kvartal", hel: 4248, halv: 2124 },
  { alder: "7-14 år", fraAar: 7, interval: "kvartal", intervalNavn: "kvartal", hel: 3342, halv: 1671 },
  { alder: "15-17 år", fraAar: 15, interval: "maaned", intervalNavn: "måned", hel: 1114, halv: 557 },
] as const;

export const BOERNEUNGEYDELSE_2026 = {
  source:
    "https://www.borger.dk/familie-og-boern/familieydelser-oversigt/boerne-ungeydelse",
  nedsættelseSource:
    "https://www.borger.dk/familie-og-boern/familieydelser-oversigt/boerne-ungeydelse/boerne-ungeydelse-nedsaettelse",
  verifiedAt: "2026-09-25",
  /**
   * Nedsættelsen er fra 1. januar 2022 udelukkende ud fra egen indkomst — også når
   * forældrene bor sammen. Den anden forælders indkomst påvirker ikke ydelsen.
   */
  aftrapning: {
    /** Årligt indtægtsgrundlag, hvor nedsættelsen begynder. */
    graense: 961100,
    /** Nedsættelsen er 2 % af beløbet over grænsen. */
    pct: 0.02,
  },
  udbetaling: {
    /**
     * Børneydelsen udbetales den 20. i januar, april, juli og oktober.
     * Dag og måneder er holdt adskilt, fordi den gamle form var
     * `[20, 4, 7, 10]` — dag 20 og så kun tre måneder, altså uden januar.
     * Udbetalingsmånederne er de fire, borger.dk angiver.
     */
    boerneydelse: { dag: 20, maaneder: [1, 4, 7, 10] },
    ungeydelseDag: 20,
  },
} as const;

/** Antal udbetalinger pr. år for et givent interval. */
export function udbetalingerPrAar(interval: BoernSats["interval"]): number {
  return interval === "kvartal" ? 4 : 12;
}

/** Satsen for et barn med den givne alder, eller `undefined` hvis barnet er fyldt 18. */
export function satsForAlder(alder: number): BoernSats | undefined {
  if (!Number.isFinite(alder) || alder < 0) return undefined;
  return BOERNE_SATSER_2026.filter((sats) => alder >= sats.fraAar).at(-1);
}

/** Hele årsbeløbet for en sats, beregnet af de officielle intervalbeløb. */
export function aarligBelob(sats: BoernSats): number {
  return sats.hel * udbetalingerPrAar(sats.interval);
}

/**
 * Hvad ét interval svarer til omregnet til måneden. For en kvartalssats er det
 * årsbeløbet delt med 12, altså det samme som satsen delt med 4 ganget 3 —
 * ikke satsen delt med 3, fordi kvartalet dækker tre måneder.
 */
export function maanedligOmregnet(sats: BoernSats): number {
  return aarligBelob(sats) / 12;
}

export interface Udbetalingsdato {
  /** Den nominelle udbetalingsdato, altid den 20. i måneden. */
  dato: Date;
  /** Månedens nummer, 1-12. */
  maaned: number;
  /** Udbetalingsdagens ugedag på dansk. */
  ugedag: string;
  /** Sand når den 20. er en weekend- eller helligdagsudbetaling. */
  forskudt: boolean;
  /** Dagen pengene faktisk står på konto, når `forskudt` er sand. */
  betalingsdato: Date;
}

/**
 * Ugedagene i dansk, som de skrives i en sætning: «tirsdag 20. oktober 2026».
 *
 * Eksporteres, fordi tre steder ellers ville eje hver sin liste — og en liste
 * der glider fra den, `Udbetalingsdato.ugedag` kommer fra, giver to forskellige
 * ugedage for den samme dato på to sider.
 */
export const UGEDAGE_DA = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
] as const;

/**
 * Månedernes navne i dansk, som de skrives i en sætning. Eksporteres af samme
 * grund som `UGEDAGE_DA`: et tidspunkt skal kunne læses med de samme ord
 * overallest, søgemaskinen og i koden.
 */
export const MAANEDER_DA = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
] as const;

/**
 * Udbetalingsdatoerne for et år, med den nominelle 20. og den dag pengene
 * faktisk står på konto. Udbetaling Danmark flytter betalingen til hverdagen
 * inden, når den 20. falder på en weekend eller en helligdag — det står sådan
 * på borger.dk, og weekendfaldene er reelle (tre af tolv i 2026).
 *
 * Beregningen bruger `helligdage.ts`, så den ikke genopfinder kalenderen.
 */
export function udbetalingsdatoerAar(
  aar: number,
  interval: BoernSats["interval"]
): Udbetalingsdato[] {
  const maaneder =
    interval === "kvartal"
      ? [...BOERNEUNGEYDELSE_2026.udbetaling.boerneydelse.maaneder]
      : Array.from({ length: 12 }, (_, i) => i + 1);
  const dag =
    interval === "kvartal"
      ? BOERNEUNGEYDELSE_2026.udbetaling.boerneydelse.dag
      : BOERNEUNGEYDELSE_2026.udbetaling.ungeydelseDag;

  return maaneder.map((maaned) => {
    const dato = new Date(aar, maaned - 1, dag);
    const forskudt = !erArbejdsdag(dato, "da");
    return {
      dato,
      maaned,
      ugedag: UGEDAGE_DA[dato.getDay()],
      forskudt,
      betalingsdato: forskudt ? foegArbejdsdage(dato, -1, "da") : dato,
    };
  });
}

/**
 * Den næste udbetaling på eller efter `fraDato`, for det givne interval.
 *
 * Autocomplete 1/10 viser, at spørgsmålet ikke er «hvad er reglen», men «hvornår
 * kommer de»: «børnepenge hvornår», «børnepenge juli 2026 udbetaling» og «børnepenge
 * 20 juli» er alle træffere. Det svarer kræver dagens dato, så det kun kan regnes
 * i et serverkald — ikke i et modul-niveau-`const` som `allPages` i
 * `page-data.ts`.
 *
 * Reglen er den samme som `udbetalingsdatoerAar` bruger, så de to ikke kan komme
 * på afveje: nominelle 20. og den arbejdsdag pengene faktisk står på konto.
 * Søgningen løber over årsskiftet, fordi det næste kvartal efter 20. december er
 * 20. januar året efter — et fast årstal ville give det sidste af i december.
 *
 * `fraDato` skal være dagens kalenderdato læst i **sidens** tidszone
 * (`iDagPaSiden`), aldrig `new Date()` i serverens egen zone.
 */
export function naesteUdbetalingsdato(
  fraDato: Date,
  interval: BoernSats["interval"]
): { betalingsdato: Date; nominell: Date; dage: number } {
  // Dag-tallet bygges af UTC-dagnumre, så et skifte mellem sommer- og vintertid
  // hverken springer en dag over eller tæller den to gange — samme greb som
  // `helligdage.ts` bruger.
  const dagNummer = (d: Date) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000;
  const fra = dagNummer(fraDato);

  // To års udkig er nok: begge intervaller har mindst fire betalinger om året,
  // så den næste ligger aldrig mere end ni måneder ude i fremtiden.
  for (let aar = fraDato.getFullYear(); aar <= fraDato.getFullYear() + 1; aar++) {
    const traef = udbetalingsdatoerAar(aar, interval).find(
      (u) => dagNummer(u.betalingsdato) >= fra
    );
    if (traef) {
      return {
        betalingsdato: traef.betalingsdato,
        nominell: traef.dato,
        dage: dagNummer(traef.betalingsdato) - fra,
      };
    }
  }
  throw new Error(`Ingen udbetalingsdato for ${interval} efter ${fraDato.toISOString()}`);
}

/**
 * Årlig nedsættelse ved indkomst over grænsen. Beregnes på indtægtsgrundlaget,
 * som hos Udbetaling Danmark svarer til beskatningsgrundlaget for mellemskat.
 */
export function beregnAftrapning(indtægtsgrundlag: number): number {
  if (!Number.isFinite(indtægtsgrundlag)) return 0;
  const over = indtægtsgrundlag - BOERNEUNGEYDELSE_2026.aftrapning.graense;
  if (over <= 0) return 0;
  return over * BOERNEUNGEYDELSE_2026.aftrapning.pct;
}
