/**
 * Worked examples for the "antal dage i en måned" cluster on `/dato`.
 *
 * "antal dage i en måned" is the number one Danish autocomplete suggestion under
 * both "antal dage i en måned" and "hvor mange dage i en måned", and the Swedish
 * cluster asks the same question ("antal dagar i en månad", "hur många
 * arbetsdagar i en månad"). The page answered the *year* ("1 år = 365 dage") but
 * never the month, so every figure here is computed rather than written by hand:
 * a month length is `daysBetween` between the first and the last day of that
 * month, and the working-day figure is `taellArbejdsdage` from the same module
 * `DatoBeregner` counts with. The page therefore cannot drift from the tool the
 * way a hand-written table would.
 */
import { daysBetween } from "./dage-til";
import { taellArbejdsdage, taellWeekender } from "./helligdage";
import type { HelligdagLocale } from "./helligdage";

export interface MaanedRække {
  /** 1-12, so callers can index or format without a second lookup. */
  month: number;
  /** Localised month name. */
  name: string;
  /** Calendar days in the month. */
  dage: number;
  /** Working days in the month, excluding weekends, holidays and New Year's Eve. */
  arbejdsdage: number;
  /** Saturdays and Sundays in the month. */
  weekenddage: number;
  /** True for February in a leap year, where the answer is 29 and not 28. */
  skudaar: boolean;
}

const MAANED_NAVN_DA = [
  "januar", "februar", "marts", "april", "maj", "juni",
  "juli", "august", "september", "oktober", "november", "december",
];

const MAANED_NAVN_SE = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

function maanedNavn(month: number, locale: HelligdagLocale): string {
  const names = locale === "se" ? MAANED_NAVN_SE : MAANED_NAVN_DA;
  return names[month - 1];
}

/** True when `year` is a leap year: divisible by 4, except centuries not by 400. */
export function erSkudaar(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/**
 * The twelve months of `year`, each with its length, working days and weekend
 * days. Built from `daysBetween` and `taellArbejdsdage` so the figures are the
 * same ones `DatoBeregner` produces for a range covering the same month.
 */
export function maanederITaar(
  year: number,
  locale: HelligdagLocale
): MaanedRække[] {
  const skudaar = erSkudaar(year);
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const foerste = new Date(year, i, 1);
    const sidste = new Date(year, i + 1, 0);
    const dage = daysBetween(foerste, sidste) + 1;
    return {
      month,
      name: maanedNavn(month, locale),
      dage,
      arbejdsdage: taellArbejdsdage(foerste, sidste, locale),
      weekenddage: taellWeekender(foerste, sidste),
      skudaar: month === 2 && skudaar,
    };
  });
}

/** The Gregorian mean year of 365,2425 days over 12 months. */
export const GNNEMSNIT_DAGE_PR_MAANED = 365.2425 / 12;

export interface Aarstal {
  year: number;
  /** 365, or 366 in a leap year. */
  dage: number;
  /** Working days in the whole year, holidays included in the exclusion. */
  arbejdsdage: number;
  /** 12 for an ordinary year, 13 in a leap year. */
  maneder: number;
  skudaar: boolean;
}

/** Days, working days and month count for a whole calendar year. */
export function aarstal(year: number, locale: HelligdagLocale): Aarstal {
  const foerste = new Date(year, 0, 1);
  const sidste = new Date(year, 11, 31);
  return {
    year,
    dage: daysBetween(foerste, sidste) + 1,
    arbejdsdage: taellArbejdsdage(foerste, sidste, locale),
    maneder: erSkudaar(year) ? 13 : 12,
    skudaar: erSkudaar(year),
  };
}

export interface MaanedEksempel {
  /** The year the examples describe. */
  year: number;
  /** The month the worked example uses, 1-12. */
  month: number;
  /** Start date as `ISO`, e.g. "2026-02-01". */
  start: string;
  /** The day after the month's last day, as `ISO`. */
  sluttOgKoeb: string;
  /** What `=B1-A1` returns when A1 is the first day of the month. */
  formelResultat: number;
  /** The twelve rows of the table. */
  raekker: MaanedRække[];
  /** Days in the year, 365 or 366. */
  aar: number;
  aarDage: number;
  aarArbejdsdage: number;
  gennemsnit: number;
}

function isoDato(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dag}`;
}

/**
 * The worked example the page prints. February 2026 is the interesting month:
 * it is the shortest one, and the day after its last day is 1 March, so
 * `=B1-A1` on A1 = 1 February and B1 = 1 March returns 28 without any month
 * arithmetic. The figures come from the same functions the table uses, so the
 * example and the table cannot disagree.
 */
export function maanedEksempel(
  year: number,
  month: number,
  locale: HelligdagLocale
): MaanedEksempel {
  const foerste = new Date(year, month - 1, 1);
  const efterFoelgende = new Date(year, month, 1);
  const aar = aarstal(year, locale);
  return {
    year,
    month,
    start: isoDato(foerste),
    sluttOgKoeb: isoDato(efterFoelgende),
    formelResultat: daysBetween(foerste, efterFoelgende),
    raekker: maanederITaar(year, locale),
    aar: year,
    aarDage: aar.dage,
    aarArbejdsdage: aar.arbejdsdage,
    gennemsnit: GNNEMSNIT_DAGE_PR_MAANED,
  };
}
