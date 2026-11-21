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
 * One month of `year`, with its length, working days and weekend days. Built
 * from `daysBetween` and `taellArbejdsdage` so the figures are the same ones
 * `DatoBeregner` produces for a range covering the same month. Exported so a
 * caller that needs a single month — `denneMaanedEksempel` — reads it here
 * instead of building the other eleven as well.
 */
export function maanedRaekke(
  year: number,
  month: number,
  locale: HelligdagLocale
): MaanedRække {
  const foerste = new Date(year, month - 1, 1);
  const sidste = new Date(year, month, 0);
  return {
    month,
    name: maanedNavn(month, locale),
    dage: daysBetween(foerste, sidste, locale) + 1,
    arbejdsdage: taellArbejdsdage(foerste, sidste, locale),
    weekenddage: taellWeekender(foerste, sidste),
    skudaar: month === 2 && erSkudaar(year),
  };
}

/** The twelve months of `year`, in calendar order. */
export function maanederITaar(
  year: number,
  locale: HelligdagLocale
): MaanedRække[] {
  return Array.from({ length: 12 }, (_, i) =>
    maanedRaekke(year, i + 1, locale)
  );
}

/** The Gregorian mean year of 365,2425 days over 12 months. */
export const GNNEMSNIT_DAGE_PR_MAANED = 365.2425 / 12;

export interface Aarstal {
  year: number;
  /** 365, or 366 in a leap year. */
  dage: number;
  /** Working days in the whole year, holidays included in the exclusion. */
  arbejdsdage: number;
  /** Months in the year — always 12, also in a leap year. */
  maneder: number;
  skudaar: boolean;
}

/** Days, working days and month count for a whole calendar year. */
export function aarstal(year: number, locale: HelligdagLocale): Aarstal {
  const foerste = new Date(year, 0, 1);
  const sidste = new Date(year, 11, 31);
  return {
    year,
    dage: daysBetween(foerste, sidste, locale) + 1,
    arbejdsdage: taellArbejdsdage(foerste, sidste, locale),
    // Et år har altid 12 måneder. Et skudår har 366 *dage*, men den 29. februar
    // er en dag inde i februar, ikke en trettende måned.
    maneder: 12,
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
    formelResultat: daysBetween(foerste, efterFoelgende, locale),
    raekker: maanederITaar(year, locale),
    aar: year,
    aarDage: aar.dage,
    aarArbejdsdage: aar.arbejdsdage,
    gennemsnit: GNNEMSNIT_DAGE_PR_MAANED,
  };
}

/** The site's timezone per locale — the one `/dato`'s countdowns are written in. */
const DATO_TIMEZONE: Record<HelligdagLocale, string> = {
  da: "Europe/Copenhagen",
  se: "Europe/Stockholm",
};

/**
 * The local day in the locale's timezone, as UTC midnight. A UTC-server reading
 * its own `getDate()` would be a day behind (or ahead) between midnight and
 * 02:00, which is exactly the window somebody opens "hvor mange dage er der i
 * den her måned" in.
 */
function dagITidszone(today: Date, locale: HelligdagLocale): Date {
  const dele = new Intl.DateTimeFormat("en-CA", {
    timeZone: DATO_TIMEZONE[locale],
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(today);
  const vaerdi = (type: string) =>
    Number(dele.find((d) => d.type === type)?.value);
  return new Date(Date.UTC(vaerdi("year"), vaerdi("month") - 1, vaerdi("day")));
}

export interface DenneMaanedEksempel {
  /** The year the current month sits in. */
  year: number;
  /** 1-12, so callers can index or format without a second lookup. */
  month: number;
  /** Localised month name, e.g. "september". */
  name: string;
  /** Calendar days in the month — 28, 29, 30 or 31. */
  dage: number;
  /** How many of them are over, counting today as the month's first of those. */
  dageForbruget: number;
  /** How many are left after today. Always `dage - dageForbruget`. */
  dageTilbage: number;
  /** Working days in the month, from the same counter the tool uses. */
  arbejdsdage: number;
  /** Saturdays and Sundays in the month. */
  weekenddage: number;
  /** First day of the month, as `ISO`. */
  foersteDag: string;
  /** Last day of the month, as `ISO`. */
  sidsteDag: string;
  /** Day of the month, 1-31. */
  dato: number;
}

/**
 * The month the reader is standing in: its length, how much of it is over and
 * how much is left. "hvor mange dage er der i juli 2026" and "hvor mange dage
 * er der i den her måned" are Danish autocomplete suggestions, and the table
 * on `/dato` only answers the first kind for the *whole* year — a table of
 * twelve rows where the reader has to find their own month.
 *
 * The figures come from `daysBetween` and the `taell*` counters, exactly like
 * {@link maanederITaar}, so the one-month answer and the twelve-row table can
 * never disagree. `today` is read in the locale's timezone.
 */
export function denneMaanedEksempel(
  today: Date,
  locale: HelligdagLocale
): DenneMaanedEksempel {
  const nu = dagITidszone(today, locale);
  const year = nu.getUTCFullYear();
  const month = nu.getUTCMonth() + 1;
  const foerste = new Date(year, month - 1, 1);
  const efterFoelgende = new Date(year, month, 1);
  const raekke = maanedRaekke(year, month, locale);
  const dage = daysBetween(foerste, efterFoelgende, locale);
  return {
    year,
    month,
    name: maanedNavn(month, locale),
    dage,
    dageForbruget: nu.getUTCDate(),
    dageTilbage: dage - nu.getUTCDate(),
    arbejdsdage: raekke.arbejdsdage,
    weekenddage: raekke.weekenddage,
    foersteDag: isoDato(foerste),
    sidsteDag: isoDato(new Date(year, month, 0)),
    dato: nu.getUTCDate(),
  };
}
