import { easterSunday } from "./dage-til";
import { formatDatoTekst, ugedagsnavn } from "./ugedag";

export type HelligdagLocale = "da" | "se";

export interface Helligdag {
  date: Date;
  name: string;
}

const WEEKEND_DAYS = new Set([0, 6]);

function localDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

function easterDate(year: number, offsetDays: number): Date {
  const easter = easterSunday(year);
  const date = new Date(
    easter.getUTCFullYear(),
    easter.getUTCMonth(),
    easter.getUTCDate() + offsetDays
  );
  return date;
}

/** Saturday falling in the window [firstDayOfWindow, firstDayOfWindow + 6]. */
function saturdayInWindow(year: number, month: number, day: number): Date {
  const candidate = localDate(year, month, day);
  const shift = (6 - candidate.getDay() + 7) % 7;
  return localDate(year, month, day + shift);
}

/**
 * Fixed-date holidays per locale. Store bededag is deliberately absent: it was
 * abolished as a public holiday from 2024. Nytårsaften is also absent on the
 * Danish side because it is not an official holiday, only a non-working day.
 */
function getFixedHelligdage(
  year: number,
  locale: HelligdagLocale
): Helligdag[] {
  if (locale === "da") {
    return [
      { date: localDate(year, 1, 1), name: "Nytårsdag" },
      { date: localDate(year, 6, 5), name: "Grundlovsdag" },
      { date: localDate(year, 12, 24), name: "Juleaftensdag" },
      { date: localDate(year, 12, 25), name: "Juledag" },
      { date: localDate(year, 12, 26), name: "2. juledag" },
    ];
  }
  return [
    { date: localDate(year, 1, 1), name: "Nyårsdagen" },
    { date: localDate(year, 1, 6), name: "Trettondedag jul" },
    { date: localDate(year, 5, 1), name: "Första maj" },
    { date: localDate(year, 6, 6), name: "Sveriges nationaldag" },
    { date: saturdayInWindow(year, 6, 20), name: "Midsommarafton" },
    { date: saturdayInWindow(year, 6, 21), name: "Midsommardagen" },
    { date: saturdayInWindow(year, 10, 31), name: "Alla helgons dag" },
    { date: localDate(year, 12, 24), name: "Julafton" },
    { date: localDate(year, 12, 25), name: "Juldagen" },
    { date: localDate(year, 12, 26), name: "Annandag jul" },
    { date: localDate(year, 12, 31), name: "Nyårsafton" },
  ];
}

/**
 * Easter-anchored holidays: påske (-7 til +1) plus de tre danske dage der
 * følger efter påsken, og de svenska til og med pingstdagen.
 *
 * Afstandene er påskedagens egne, fordi påskedagen er en søndag: palmesøndag er
 * den søndag før påsken (påskedag - 7), kristi himmelfartsdag er torsdag
 * (søndag + 39), pinsedagen er søndagen (søndag + 49) og 2. pinsedag er
 * mandagen (søndag + 50). De ligger derfor på hver sin ugedag, hvert år, i
 * begge lande.
 *
 * Palmesøndag og påskedagen er begge **helligdage uden ekstra fridag**: de er
 * altid søndage, så de tælles af `taellWeekender` og ikke af
 * `taellHelligdagePaaHverdag`. Danmark har 13 helligdage, men kun 12 der falder
 * på en hverdag — og det er dem `/dato` kalder «helligdage på hverdage».
 *
 * `annandag pingst` (mandagen efter pingstdagen) er med vilje *ikke* på den
 * svenska liste: lagen (1989:253) tæller kun pingstdagen, og mandagen er en
 * almindelig arbejdsdag i Sverige. Den er til gengæld med på den danske, hvor
 * både pinsedag og 2. pinsedag er helligdage.
 */
function getEasterHelligdage(
  year: number,
  locale: HelligdagLocale
): Helligdag[] {
  if (locale === "da") {
    return [
      { date: easterDate(year, -7), name: "Palmesøndag" },
      { date: easterDate(year, -3), name: "Skærtorsdag" },
      { date: easterDate(year, -2), name: "Langfredag" },
      { date: easterDate(year, 0), name: "Påskedag" },
      { date: easterDate(year, 1), name: "2. påskedag" },
      { date: easterDate(year, 39), name: "Kristi himmelfartsdag" },
      { date: easterDate(year, 49), name: "Pinsedag" },
      { date: easterDate(year, 50), name: "2. pinsedag" },
    ];
  }
  return [
    { date: easterDate(year, -2), name: "Långfredagen" },
    { date: easterDate(year, 0), name: "Påskdagen" },
    { date: easterDate(year, 1), name: "Annandag påsk" },
    { date: easterDate(year, 39), name: "Kristi himmelsfärdsdag" },
    { date: easterDate(year, 49), name: "Pingstdagen" },
  ];
}

/** All Danish/Swedish helligdage in `year`, sorted by date. */
export function getHelligdage(
  year: number,
  locale: HelligdagLocale
): Helligdag[] {
  return [...getFixedHelligdage(year, locale), ...getEasterHelligdage(year, locale)]
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * The holiday names in the order they fall, joined for a sentence: "Nytårsdag,
 * skærtorsdag, langfredag, …". Copy on `/dato` and in the FAQ used to name the
 * holidays by hand, and the hand-written list had drifted: it never mentioned
 * Kristi himmelfartsdag, pinsedag or 2. pinsedag, so the page told readers that
 * the tool skipped nine holidays when it skips twelve. Reading the names out of
 * `getHelligdage` makes that impossible — the sentence cannot outgrow the list.
 *
 * The names keep their own capital, so callers must introduce them where a
 * capital is right (start of a sentence, or after a colon). Lowercasing them
 * here would break "Sveriges nationaldag", where Swedish keeps the genitive
 * capitalised.
 *
 * The year only picks the ordering and the Easter-derived dates; the names are
 * the same every year.
 */
export function helligdagsnavne(
  year: number,
  locale: HelligdagLocale
): string {
  return getHelligdage(year, locale)
    .map((h) => h.name)
    .join(", ");
}

/**
 * Nytårsaften is not an official public holiday, but it is a non-working day in
 * both Denmark and Sweden, so it is excluded from working-day counts without
 * being listed as a holiday.
 */
function erNytarsaften(date: Date): boolean {
  return date.getMonth() === 11 && date.getDate() === 31;
}

/** True when `date` is a working day: not a weekend, holiday or New Year's Eve. */
export function erArbejdsdag(date: Date, locale: HelligdagLocale): boolean {
  return (
    !WEEKEND_DAYS.has(date.getDay()) &&
    !erNytarsaften(date) &&
    !erHelligdag(date, locale)
  );
}

const MS_PER_DAY = 86400000;

function toUtcDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function fromUtcDayNumber(dayNumber: number): Date {
  const d = new Date(dayNumber);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * The holidays of one year as UTC day numbers, built once per year and locale.
 *
 * `erHelligdag` is called once per calendar day by `taellArbejdsdage`, so
 * counting the working days of a year used to rebuild and re-sort that year's
 * whole holiday list — Easter included — once for every single day. Counting
 * the same year twelve times over, as `maanederITaar` does, did it about 370
 * times, and the day-exhaustive test in `dato-eksempler.test.ts` ran out of
 * time in CI because of it. The set stays private to this module, so no caller
 * can mutate it, and a year only ever picks fixed dates and Easter offsets, so
 * a cached list can never go stale. The keys are the calendar years actually
 * asked for, which is a handful.
 */
const helligdagNogleDage = new Map<string, Set<number>>();

function helligdagsdage(year: number, locale: HelligdagLocale): Set<number> {
  const nogle = `${year}|${locale}`;
  let dage = helligdagNogleDage.get(nogle);
  if (!dage) {
    dage = new Set(getHelligdage(year, locale).map((h) => toUtcDayNumber(h.date)));
    helligdagNogleDage.set(nogle, dage);
  }
  return dage;
}

/** True when `date` is an official public holiday in `locale`. */
export function erHelligdag(date: Date, locale: HelligdagLocale): boolean {
  return helligdagsdage(date.getFullYear(), locale).has(toUtcDayNumber(date));
}

/**
 * Every calendar day in the inclusive interval, built from UTC day numbers so
 * daylight-saving transitions can neither skip nor repeat a day.
 */
function eachDay(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  for (
    let t = toUtcDayNumber(from);
    t <= toUtcDayNumber(to);
    t += MS_PER_DAY
  ) {
    days.push(fromUtcDayNumber(t));
  }
  return days;
}

/**
 * Counts working days in the inclusive interval [from, to]. Returns 0 when
 * `to` is before `from` so a reversed interval never reports a positive count.
 */
export function taellArbejdsdage(
  from: Date,
  to: Date,
  locale: HelligdagLocale
): number {
  if (to.getTime() < from.getTime()) return 0;
  return eachDay(from, to).filter((d) => erArbejdsdag(d, locale)).length;
}

/**
 * Counts Saturdays and Sundays in the inclusive interval [from, to]. Kept apart
 * from `taellArbejdsdage` so callers can report weekends, holidays and New Year's
 * Eve as separate figures instead of lumping them together.
 */
export function taellWeekender(from: Date, to: Date): number {
  if (to.getTime() < from.getTime()) return 0;
  return eachDay(from, to).filter((d) => WEEKEND_DAYS.has(d.getDay())).length;
}

/**
 * Counts official public holidays in the inclusive interval that do not already
 * fall on a weekend. A holiday on a Saturday or Sunday is counted by
 * `taellWeekender`, so adding this to working days and weekend days makes the
 * three categories cover every day of the interval exactly once.
 */
export function taellHelligdagePaaHverdag(
  from: Date,
  to: Date,
  locale: HelligdagLocale
): number {
  if (to.getTime() < from.getTime()) return 0;
  return eachDay(from, to).filter(
    (d) => !WEEKEND_DAYS.has(d.getDay()) && erHelligdag(d, locale)
  ).length;
}

/**
 * Counts New Year's Eve in the inclusive interval [from, to]. It is a
 * non-working day that is not an official holiday, so it is in none of the three
 * day categories and callers need the figure to explain the remainder.
 */
export function taellNytarsaften(from: Date, to: Date): number {
  if (to.getTime() < from.getTime()) return 0;
  return eachDay(from, to).filter(erNytarsaften).length;
}

/** Counts official public holidays in the inclusive interval [from, to]. */
export function taellHelligdage(
  from: Date,
  to: Date,
  locale: HelligdagLocale
): number {
  if (to.getTime() < from.getTime()) return 0;
  return eachDay(from, to).filter((d) => erHelligdag(d, locale)).length;
}

/**
 * Advances `antal` working days past `base`. `antal` may be negative, which
 * walks backwards. `antal` 0 returns `base` unchanged.
 */
export function foegArbejdsdage(
  base: Date,
  antal: number,
  locale: HelligdagLocale
): Date {
  const step = antal >= 0 ? 1 : -1;
  let remaining = Math.abs(Math.trunc(antal));
  let dayNumber = toUtcDayNumber(base);
  while (remaining > 0) {
    dayNumber += step * MS_PER_DAY;
    if (erArbejdsdag(fromUtcDayNumber(dayNumber), locale)) remaining--;
  }
  return fromUtcDayNumber(dayNumber);
}

// ─── /helligdage ─────────────────────────────────────────────────────────

/**
 * `/helligdage` («helligdage 2026/2027») og `/helgdagar` ligger hver på sin
 * egen sti, fordi svensken skal have svenske navne så vel som svenske datoer.
 * Stien vælger sproget, samme regel som `/dage-til` og `/ugedag` — et kald til
 * den anden sprogs sti er routingens 301.
 */
export const HELLIGDAG_PATH: Record<HelligdagLocale, string> = {
  da: "/helligdage",
  se: "/helgdagar",
};

export function getHelligdagPath(locale: string): string | null {
  if (locale !== "da" && locale !== "se") return null;
  return HELLIGDAG_PATH[locale];
}

/**
 * Hver helligdag til sin egen «dage til»-side, så listen ikke bliver en blind
 * ende. Slugs'ne er de, `/dage-til` allerede har (se `DAGE_TIL_EVENTS`), og
 * dem har testen forpligtet sig til at finde igen — en helligdag uden et
 * link står blot som `null`.
 */
const HELLIGDAG_TIL_DAGE_TIL: Record<HelligdagLocale, Record<string, string>> = {
  da: {
    "Nytårsdag": "nytaarsdag",
    "Grundlovsdag": "grundlovsdag",
    "Juleaftensdag": "24-december",
    "Juledag": "juledagen",
    "2. juledag": "2-juledag",
    "Palmesøndag": "palmesondag",
    "Skærtorsdag": "skaertorsdag",
    "Langfredag": "langfredag",
    "Påskedag": "paskedag",
    "Kristi himmelfartsdag": "kristi-himmelfartsdag",
    "2. pinsedag": "2-pinsedag",
  },
  se: {
    "Nyårsdagen": "nyarsdagen",
    "Sveriges nationaldag": "nationaldagen",
    "Julafton": "24-december",
    "Juldagen": "juldagen",
    "Annandag jul": "annandag-jul",
    "Palmsöndagen": "palmsondagen",
    "Skärtorsdagen": "skartorsdagen",
    "Påskdagen": "paskdagen",
    "Kristi himmelsfärdsdag": "kristi-himmelsfardsdag",
    "Pingstdagen": "pingstdagen",
  },
};

/** Helligdage med en fast kalenderdato — de øvrige følger påsken. */
const FASTE_HELLIGDAGE = new Map<HelligdagLocale, ReadonlySet<string>>([
  [
    "da",
    new Set([
      "Nytårsdag",
      "Grundlovsdag",
      "Juleaftensdag",
      "Juledag",
      "2. juledag",
    ]),
  ],
  [
    "se",
    new Set([
      "Nyårsdagen",
      "Trettondedag jul",
      "Första maj",
      "Sveriges nationaldag",
      "Midsommarafton",
      "Midsommardagen",
      "Alla helgons dag",
      "Julafton",
      "Juldagen",
      "Annandag jul",
      "Nyårsafton",
    ]),
  ],
]);

export interface HelligdagRad {
  /** ISO-dato (ÅÅÅÅ-MM-DD), så ugedagsnavnet kan slås op lokalt. */
  iso: string;
  navn: string;
  /** «26. december 2026» / «26 december 2026». */
  datoTekst: string;
  ugedag: string;
  /** Fast kalenderdato (jul, nytår, grundlovsdag) mod påskeafhængig. */
  fast: boolean;
  /** Falder dagen på en hverdag, giver den en ekstra fri dag. */
  paaHverdag: boolean;
  /** `/dage-til/<slug>` for den samme helligdag, hvis siden den har. */
  dageTilSlug: string | null;
}

function isoDato(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/**
 * Årets helligdage som tabelrækker, i den rækkefølge de falder.
 *
 * `datoTekst` og `ugedag` læses af de samme funktioner som `/ugedag` bruger,
 * så en dato ikke kan stå i to formater på to sider (punkt 11).
 */
export function helligdagRaekker(
  year: number,
  locale: HelligdagLocale
): HelligdagRad[] {
  return getHelligdage(year, locale).map((h) => {
    const iso = isoDato(h.date);
    return {
      iso,
      navn: h.name,
      datoTekst: formatDatoTekst(iso, locale),
      ugedag: ugedagsnavn(iso, locale) ?? "",
      fast: FASTE_HELLIGDAGE.get(locale)?.has(h.name) ?? false,
      paaHverdag: !WEEKEND_DAYS.has(h.date.getDay()),
      dageTilSlug: HELLIGDAG_TIL_DAGE_TIL[locale][h.name] ?? null,
    };
  });
}

export interface HelligdagNesteRad extends HelligdagRad {
  dageTil: number;
}

/**
 * De næste helligdage fra `fra`, også når året skifter: listen slutter først,
 * når `antal` af dem er fundet i indeværende og efterfølgende år.
 */
export function naesteHelligdage(
  fra: Date,
  locale: HelligdagLocale,
  antal = 3
): HelligdagNesteRad[] {
  const fraDag = new Date(fra.getFullYear(), fra.getMonth(), fra.getDate());
  const fundet: HelligdagNesteRad[] = [];
  for (const year of [fra.getFullYear(), fra.getFullYear() + 1]) {
    for (const rad of helligdagRaekker(year, locale)) {
      if (fundet.length >= antal) return fundet;
      const dato = new Date(rad.iso + "T00:00:00");
      if (dato.getTime() < fraDag.getTime()) continue;
      fundet.push({
        ...rad,
        dageTil: Math.round(
          (dato.getTime() - fraDag.getTime()) / MS_PER_DAY
        ),
      });
    }
  }
  return fundet;
}

export interface HelligdagAntal {
  /** Alle helligdage på listen. */
  total: number;
  /** Dem der falder på en hverdag og derfor giver en ekstra fri dag. */
  paaHverdag: number;
  /** Dem der falder i weekenden og dermed er "gemt". */
  paaWeekend: number;
}

export function helligdagAntal(
  year: number,
  locale: HelligdagLocale
): HelligdagAntal {
  const raekker = helligdagRaekker(year, locale);
  const paaHverdag = raekker.filter((r) => r.paaHverdag).length;
  return {
    total: raekker.length,
    paaHverdag,
    paaWeekend: raekker.length - paaHverdag,
  };
}
