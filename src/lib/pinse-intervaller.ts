/**
 * The two *interval* questions in the pinse cluster, answered with figures the
 * code computes.
 *
 * "hvor mange dage er der fra påske til pinse" and "hvor mange dage er der i
 * pinsen" are the two remaining Danish autocomplete suggestions under
 * "hvor mange dage er der til pinse", and neither is a countdown: the first asks
 * for a distance between two fixed dates, the second for a period. A
 * `dage-til` page would answer them with a number that never changes and look
 * like a countdown, which is the mistake the existing pinse page avoided — so
 * they belong on `/dato`, next to the month and year tables.
 *
 * Nothing here is written by hand. The dates are looked up in `getHelligdage`
 * by the names that module already uses, so there is one place that knows when
 * pinsedagen falls, and every figure is `daysBetween` or one of the
 * `taell*` counters `DatoBeregner` itself shows. The prose on `/dato` and in the
 * FAQ therefore cannot drift from either the holiday list or the tool.
 */
import { daysBetween } from "./dage-til";
import {
  getHelligdage,
  type Helligdag,
  taellArbejdsdage,
  taellHelligdage,
  taellHelligdagePaaHverdag,
  taellWeekender,
  type HelligdagLocale,
} from "./helligdage";

/** The holiday names `getHelligdage` uses, so the dates are never re-derived. */
const NAVNE: Record<
  HelligdagLocale,
  { paaskedag: string; himmelfartsdag: string; pinsedag: string; andenPinsedag: string }
> = {
  da: {
    paaskedag: "Påskedag",
    himmelfartsdag: "Kristi himmelfartsdag",
    pinsedag: "Pinsedag",
    andenPinsedag: "2. pinsedag",
  },
  se: {
    paaskedag: "Påskdagen",
    himmelfartsdag: "Kristi himmelsfärdsdag",
    pinsedag: "Pingstdagen",
    // Lookup for `Annandag pingst` *must* miss: the Swedish list deliberately
    // leaves it out, because lagen (1989:253) makes only pingstdagen a holiday
    // and the Monday after it an ordinary working day.
    andenPinsedag: "Annandag pingst",
  },
};

const TIDZONE: Record<HelligdagLocale, string> = {
  da: "Europe/Copenhagen",
  se: "Europe/Stockholm",
};

/** Days between Kristi himmelfartsdag and 2. pinsedag: 39 → 50 is always 11. */
const HIMMELFART_TIL_ANDEN_PINSE = 11;

function datoMedNavn(
  year: number,
  locale: HelligdagLocale,
  navn: string
): Date | null {
  return getHelligdage(year, locale).find((h) => h.name === navn)?.date ?? null;
}

/**
 * The holidays by name, in date order, with **one entry per day** rather than
 * one per list entry. `getHelligdage` can carry two names on the same date, and
 * in the pinse period it does whenever 5 June — Grundlovsdag — lands on pinsedag
 * or on 2. pinsedag: 7 of the 61 years the tests cover, the next being 2028.
 *
 * The reason matters, so it is spelled out rather than shortened to "2.
 * pinsedag". Measured over the same 61 years (`npx tsx`, 2026-09-30, against
 * `dateutil` and a Meeus-implementering), Grundlovsdag is 2. pinsedag in 1995,
 * 2006, 2017 and 2028, and pinsedag in 2022, 2033 and 2044 — påske is 17.
 * april in the last three, so pinsedag falls a day before the Monday. Seven is
 * the right count either way, but only four are the case an earlier version of
 * this comment named, and the test locks the split.
 *
 * The old list read "Grundlovsdag, 2. pinsedag" as two holidays on one day, so
 * the sentence on `/dato` named four holidays while `periodeHelligdage` counted
 * three, and the reader counting the days along got one day too many. The extra
 * name now goes in parentheses, so both names survive and the length still
 * equals the days.
 */
function navnePrDag(helligdage: Helligdag[]): string[] {
  const prDag = new Map<number, string[]>();
  for (const h of [...helligdage].sort((a, b) => a.date.getTime() - b.date.getTime())) {
    prDag.set(h.date.getTime(), [...(prDag.get(h.date.getTime()) ?? []), h.name]);
  }
  return [...prDag.values()].map((navne) =>
    navne.length === 1 ? navne[0] : `${navne[0]} (${navne.slice(1).join(", ")})`
  );
}

/**
 * Adds days on the calendar, not on the clock. The dates from `getHelligdage`
 * are local midnights, so shifting them with the `Date` constructor keeps the
 * calendar day through a daylight-saving change.
 */
function plusDage(date: Date, dage: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dage);
}

/**
 * One of the three days between påske and pinse, with the distance from påskedag
 * that makes it easy to see the pattern: 39, 49 and 50 days, every year.
 */
export interface PinseDag {
  /** The day's own name in the locale. */
  navn: string;
  date: Date;
  /** Days from påskedag: 39, 49 and 50. */
  dageFraPaaske: number;
  /** True when the day is an official public holiday in the locale. */
  helligdag: boolean;
}

export interface PinseInterval {
  year: number;
  paaskedag: Date;
  /** Kristi himmelfartsdag, 10 days before pinsedagen. */
  himmelfartsdag: Date;
  pinsedag: Date;
  /**
   * The Monday after pinsedagen. An official holiday in Denmark; an ordinary
   * working day in Sweden, where it has no entry in the holiday list.
   */
  andenPinsedag: Date;
  /** Kristi himmelfartsdag, pinsedag and 2. pinsedag, in date order. */
  dage: PinseDag[];
  /** Days from Kristi himmelfartsdag to 2. pinsedag: always 11. */
  dageHimmelfartTilAndenPinse: number;
  /** Calendar days in [Kristi himmelfartsdag, 2. pinsedag]: always 12. */
  periodeKalenderdage: number;
  /**
   * Working days inside that period: 6 in Denmark and 7 in Sweden in most
   * years, but not as a rule — a holiday that lands on a weekend takes no
   * working day with it, so both figures are one lower in some years (5 in
   * Denmark in 8 of the 61 years the tests cover, 6 in Sweden in 11). Counted,
   * never fixed; `periodeArbejdsdage` is why the page quotes a number for the
   * year it shows instead of a constant.
   */
  periodeArbejdsdage: number;
  /**
   * Holiday *days* inside the period: 3 in Denmark and 2 in Sweden, and 4 in
   * Denmark in the 11 of the 18 years when Grundlovsdag 5 June falls inside it
   * on a day of its own. Counted by day, not by list entry, so a day that
   * carries two names — pinsedag or 2. pinsedag fell on Grundlovsdag in 1995,
   * 2006, 2017, 2022, 2028, 2033 and 2044 — still counts once, and it always
   * equals `periodeHelligdagsnavne.length`.
   */
  periodeHelligdage: number;
  /**
   * The holidays inside the period by name, in date order, one entry per day.
   * Not always just the three pinse days: when Kristi himmelfartsdag falls late
   * in May, Grundlovsdag on 5 June lands inside the period too, and it does so
   * in 18 of the 61 years the tests cover. The names are read out of the list
   * instead of being written in the sentence, so they cannot drift.
   */
  periodeHelligdagsnavne: string[];
  /** Weekend days inside the period: always 4, because it spans two weekends. */
  periodeWeekenddage: number;
  /** Holidays inside the period that are not already weekend days. */
  periodeHelligdagePaaHverdag: number;
  /**
   * Days that are not working days inside the period: the 12 calendar days minus
   * `periodeArbejdsdage`, so 6 or 7 in Denmark and 5 or 6 in Sweden.
   */
  periodeFrieDage: number;
}

/**
 * Everything the pinse interval answers need for one year. Throws when a name
 * `getHelligdage` is supposed to have has gone missing, because a silently
 * absent holiday would print a wrong date instead of failing the build.
 */
export function pinseInterval(year: number, locale: HelligdagLocale): PinseInterval {
  const navne = NAVNE[locale];
  const paaskedag = datoMedNavn(year, locale, navne.paaskedag);
  const himmelfartsdag = datoMedNavn(year, locale, navne.himmelfartsdag);
  const pinsedag = datoMedNavn(year, locale, navne.pinsedag);
  if (!paaskedag || !himmelfartsdag || !pinsedag) {
    throw new Error(`Mangler påske- eller pinsedag ${locale} ${year}`);
  }
  // 2. pinsedag is always Kristi himmelfartsdag plus 11 days, because the
  // offsets from påskedag are 39 and 50. Denmark's list must agree; Sweden has
  // no entry, which is the point of the difference between the two lists.
  const andenPinsedag = plusDage(himmelfartsdag, HIMMELFART_TIL_ANDEN_PINSE);
  const danskAndenPinsedag = datoMedNavn(year, "da", NAVNE.da.andenPinsedag);
  if (locale === "da" && danskAndenPinsedag?.getTime() !== andenPinsedag.getTime()) {
    throw new Error(`2. pinsedag ${year} er ikke kristi himmelfartsdag + 11 dage`);
  }
  const dage: PinseDag[] = [
    { navn: navne.himmelfartsdag, date: himmelfartsdag, helligdag: true },
    { navn: navne.pinsedag, date: pinsedag, helligdag: true },
    { navn: navne.andenPinsedag, date: andenPinsedag, helligdag: locale === "da" },
  ].map((d) => ({ ...d, dageFraPaaske: daysBetween(paaskedag, d.date) }));
  const periodeKalenderdage = daysBetween(himmelfartsdag, andenPinsedag) + 1;
  const periodeArbejdsdage = taellArbejdsdage(himmelfartsdag, andenPinsedag, locale);
  const iPerioden = getHelligdage(year, locale).filter(
    (h) => h.date.getTime() >= himmelfartsdag.getTime() &&
      h.date.getTime() <= andenPinsedag.getTime()
  );
  return {
    year,
    paaskedag,
    himmelfartsdag,
    pinsedag,
    andenPinsedag,
    dage,
    dageHimmelfartTilAndenPinse: daysBetween(himmelfartsdag, andenPinsedag),
    periodeKalenderdage,
    periodeArbejdsdage,
    periodeHelligdage: taellHelligdage(himmelfartsdag, andenPinsedag, locale),
    periodeHelligdagsnavne: navnePrDag(iPerioden),
    periodeWeekenddage: taellWeekender(himmelfartsdag, andenPinsedag),
    periodeHelligdagePaaHverdag: taellHelligdagePaaHverdag(himmelfartsdag, andenPinsedag, locale),
    periodeFrieDage: periodeKalenderdage - periodeArbejdsdage,
  };
}

/**
 * The calendar day an instant falls on in a timezone, as a UTC midnight. The
 * instant is read the way a reader in that timezone reads the clock, so
 * 2027-05-17T21:59Z is still 17 May in Copenhagen and Stockholm (both are
 * UTC+2 in May), while 22:00Z is already 18 May.
 */
function dagITidszone(dato: Date, tidszone: string): number {
  const dele = new Intl.DateTimeFormat("en-CA", {
    timeZone: tidszone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dato);
  const vaerdi = (type: "year" | "month" | "day") =>
    Number(dele.find((del) => del.type === type)?.value);
  return Date.UTC(vaerdi("year"), vaerdi("month") - 1, vaerdi("day"));
}

/**
 * The calendar day of a date `pinseInterval` built as a local midnight, read
 * from its own fields.
 *
 * `daysBetween` would have been the shorter way to compare the two, but it maps
 * both sides through `Europe/Copenhagen`: a local midnight *east* of the site — a
 * server in Asia/Tokyo, where 17 May 00:00 is 16 May in Copenhagen — becomes the
 * day before, so the year turned over a day early. The fields a date was built
 * from *are* the date, in every timezone, so nothing here depends on the clock
 * the server happens to run on.
 */
function lokalDag(dato: Date): number {
  return Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate());
}

/** The calendar year the reader stands on, in the locale's own timezone. */
function kalenderAar(today: Date, locale: HelligdagLocale): number {
  return new Date(dagITidszone(today, TIDZONE[locale])).getUTCFullYear();
}

/**
 * The year whose pinse has not yet been fully spent. The Danish week runs the
 * latest — it ends on the Monday, 2. pinsedag — so it decides the cut-off for
 * both locales, and a reader standing *on* the last day still sees that year.
 */
export function pinseAar(today: Date, locale: HelligdagLocale = "da"): number {
  const year = kalenderAar(today, locale);
  const interval = pinseInterval(year, locale);
  return dagITidszone(today, TIDZONE[locale]) > lokalDag(interval.andenPinsedag)
    ? year + 1
    : year;
}

/**
 * The pinse interval for the pinse the reader has not had yet. Unlike the
 * distances, the dates depend on the year, so a stale render is visible in the
 * text instead of hiding behind a number that happens to be right.
 */
export function naestePinseInterval(
  today: Date,
  locale: HelligdagLocale = "da"
): PinseInterval {
  return pinseInterval(pinseAar(today, locale), locale);
}

/**
 * The distance the two autocomplete questions ask for, in one line of data:
 * påskedag → pinsedag is always 49 days, påskedag → 2. pinsedag always 50.
 */
export interface PinseAfstande {
  /** 39 — påskedag to Kristi himmelfartsdag. */
  himmelfart: number;
  /** 49 — påskedag to pinsedag. */
  pinse: number;
  /** 50 — påskedag to 2. pinsedag. */
  andenPinse: number;
  /** 10 — Kristi himmelfartsdag to pinsedag. */
  himmelfartTilPinse: number;
}

export function pinseAfstande(
  year: number,
  locale: HelligdagLocale
): PinseAfstande {
  const interval = pinseInterval(year, locale);
  return {
    himmelfart: interval.dage[0].dageFraPaaske,
    pinse: interval.dage[1].dageFraPaaske,
    andenPinse: interval.dage[2].dageFraPaaske,
    himmelfartTilPinse: daysBetween(interval.himmelfartsdag, interval.pinsedag),
  };
}