import type { Locale } from "./i18n";

/**
 * Public URL slugs per language.
 *
 * Every calculator lives in one route folder named with its Danish slug
 * (`src/app/dato`), and `page-data.ts`, `calculator-list.ts` and the tests all
 * key on that slug. That is the *internal* slug. A Swedish or Norwegian visitor
 * used to see it in the address bar too — `beraknare.se/nedtaelling` — which
 * reads as a foreign site in the SERP and carries no keyword for the query
 * ("nedräkning"). The *public* slug is what the domain serves, links to,
 * canonicalises and lists in its sitemap.
 *
 * The proxy rewrites a public slug to the internal folder and 301s the internal
 * slug to the public one, so the same page never answers on two URLs.
 *
 * A calculator that is missing from a locale's map keeps its Danish slug on
 * purpose (the word is the same in that language: `bmi`, `moms`, `kvadratmeter`).
 * `locale-slugs.test.ts` forces that to be a decision: every shared calculator
 * must be either mapped or listed in `SAMME_SLUG`, so a new Danish-slug page
 * cannot reach a Swedish domain by accident.
 */
export type SlugLocale = Exclude<Locale, "da">;

/** Danish (internal) slug → the slug this language's domain serves. */
export const LOCALE_SLUGS: Record<SlugLocale, Readonly<Record<string, string>>> = {
  se: {
    // The five pages Search Console shows with the most impressions.
    dato: "datum",
    tidsberegner: "tidskalkylator",
    nedtaelling: "nedrakning",
    tidszone: "tidszon",
    // Calculators
    "elbil-lading": "elbil-laddning",
    vandbehov: "vattenbehov",
    skridt: "steg-till-km",
    "motion-kalorier": "kaloriforbranning",
    ohm: "ohms-lag",
    loenstigning: "loneokning",
    aegloesning: "agglossning",
    planetvaegt: "planetvikt",
    idealvaegt: "idealvikt",
    rumfang: "volym",
    omkreds: "omkrets",
    "retvinklet-trekant": "ratvinklig-triangel",
    hundealder: "hundar-till-manniskoar",
    soevnbehov: "somnbehov",
    laantype: "annuitetslan-serielan",
    sparemaal: "sparmal",
    kropsfedt: "kroppsfett",
    "del-regning": "dela-notan",
    brok: "brak",
    enheder: "enhetsomvandlare",
    fart: "hastighet",
    gennemsnit: "medelvarde",
    enhedspris: "jamforpris",
    afkast: "avkastning",
    "loen-konverter": "lonekalkylator",
    vaegttab: "viktminskning",
    rejsebudget: "resebudget",
    bryllup: "brollop",
    braendstof: "bransle",
    renteberegner: "rantekalkylator",
    opsparing: "sparkalkylator",
    laaneberegner: "lanekalkylator",
    billaan: "billan",
    forbrugslaan: "konsumtionslan",
    gaeldsfri: "skuldfri",
    boliglaan: "bolanekalkylator",
    elberegner: "elkalkylator",
    timepris: "timpris",
    termin: "beraknad-forlossning",
  },
  no: {
    tidsberegner: "tidskalkulator",
    tidszone: "tidssone",
    vaegttab: "vekttap",
    rejsebudget: "reisebudsjett",
    konfirmation: "konfirmasjon",
    braendstof: "drivstoff",
    renteberegner: "rentekalkulator",
    opsparing: "sparekalkulator",
    laaneberegner: "lanekalkulator",
    billaan: "billan",
    forbrugslaan: "forbrukslan",
    gaeldsfri: "gjeldfri",
    boliglaan: "boliglan",
    elberegner: "elkalkulator",
  },
};

/**
 * Shared calculators whose Danish slug is also the right word in that language,
 * so they are deliberately not renamed. Together with `LOCALE_SLUGS` this must
 * cover every calculator the language serves.
 */
export const SAMME_SLUG: Record<SlugLocale, readonly string[]> = {
  se: [
    "elbil", "proteinbehov", "1rm", "areal", "koffein", "promille", "temperatur",
    "budget", "bmi", "kalorier", "procent", "kvadratmeter", "alder", "pace",
    "konfirmation", "bil", "valuta", "leasing", "solceller", "moms",
  ],
  no: [
    "bmi", "kalorier", "procent", "kvadratmeter", "alder", "dato", "bryllup",
    "bil", "valuta", "leasing", "solceller", "timepris", "termin", "moms", "pace",
    ],
};

const publicBySlug = new Map<string, Map<string, string>>();
const internalBySlug = new Map<string, Map<string, string>>();

for (const locale of ["se", "no"] as const) {
  const fremad = new Map<string, string>();
  const tilbage = new Map<string, string>();
  for (const [intern, offentlig] of Object.entries(LOCALE_SLUGS[locale])) {
    fremad.set(intern, offentlig);
    tilbage.set(offentlig, intern);
  }
  publicBySlug.set(locale, fremad);
  internalBySlug.set(locale, tilbage);
}

/** The slug a language's domain serves for an internal (Danish) slug. */
export function localizedSlug(slug: string, locale: Locale): string {
  if (locale === "da") return slug;
  return publicBySlug.get(locale)?.get(slug) ?? slug;
}

/**
 * The internal slug behind a public one, or `null` when `slug` is not a public
 * slug in that language. The internal slug of an unrenamed page is itself, but
 * that is not what this answers: it only recognises the renamed ones.
 */
export function internalSlugFor(slug: string, locale: Locale): string | null {
  if (locale === "da") return null;
  return internalBySlug.get(locale)?.get(slug) ?? null;
}

/** `/dato` → `/datum` on the Swedish domain. Other paths are returned as is. */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === "da") return path;
  const match = /^\/([^/?#]+)(.*)$/.exec(path);
  if (!match) return path;
  return `/${localizedSlug(match[1], locale)}${match[2]}`;
}

/**
 * The internal path behind a public one in *any* language, for code that has no
 * locale at hand (the icon lookup). Safe because the test locks every public
 * slug to one internal slug across all languages.
 */
export function internalPathAnyLocale(path: string): string {
  const match = /^\/([^/?#]+)(.*)$/.exec(path);
  if (!match) return path;
  for (const locale of ["se", "no"] as const) {
    const intern = internalBySlug.get(locale)?.get(match[1]);
    if (intern) return `/${intern}${match[2]}`;
  }
  return path;
}

/** `/nedtaelling` on the Swedish domain is the old URL: where does it go? */
export function legacyRedirectTarget(path: string, locale: Locale): string | null {
  if (locale === "da") return null;
  const match = /^\/([^/?#]+)$/.exec(path);
  if (!match) return null;
  const offentlig = publicBySlug.get(locale)?.get(match[1]);
  return offentlig ? `/${offentlig}` : null;
}

/** `/nedrakning` on the Swedish domain is served by the `/nedtaelling` folder. */
export function rewriteTarget(path: string, locale: Locale): string | null {
  if (locale === "da") return null;
  const match = /^\/([^/?#]+)$/.exec(path);
  if (!match) return null;
  const intern = internalBySlug.get(locale)?.get(match[1]);
  return intern ? `/${intern}` : null;
}
