/**
 * Én kilde til datoerne på blogindlæggene.
 *
 * Før denne fil lå datoen to steder: i `src/app/blog/page.tsx`'s `blogPosts`
 * (ISO, synlig for læseren som "2026-09-24") og i hvert indlægs egen byline
 * ("24. september 2026"). De to kunne glide fra hinanden, og de gjorde det:
 * `maanedsbudget` stod som 24. august på indekset og 23. august på indlægget,
 * og `su` stod som 24. september på indekset mens indlægget siger
 * "Opdateret 26. september 2026".
 *
 * `publiceret` er den dato læseren ser. `opdateret` er kun sat for de fire
 * indlæg, der faktisk viser en "Opdateret"-byline — for de andre er den
 * med vilje `null`, så `dateModified` ikke løber hvert år automatisk.
 */

export interface BlogArtikkel {
  /** Slug'en under /blog. */
  slug: string;
  /** Udgivelsesdato, ISO, så den kan læses af både `<time>` og JSON-LD. */
  publiceret: string;
  /** Dato for seneste reelle indholdsmæssige opdatering, eller `null`. */
  opdateret: string | null;
  /** Læsetid i hele minutter. */
  laesetidMinutter: number;
}

export const BLOG_ARTIKLER: BlogArtikkel[] = [
  { slug: "30-procent-reglen-husleje", publiceret: "2026-02-07", opdateret: null, laesetidMinutter: 4 },
  { slug: "arveafgift-regler-og-satser", publiceret: "2026-02-17", opdateret: null, laesetidMinutter: 8 },
  { slug: "barsel-2026-regler-og-satser", publiceret: "2026-02-17", opdateret: null, laesetidMinutter: 8 },
  { slug: "biloekonomi-2026-hvad-koster-det-at-eje-bil", publiceret: "2026-08-23", opdateret: null, laesetidMinutter: 10 },
  { slug: "bmi-for-boern-saadan-tjekker-du", publiceret: "2026-02-13", opdateret: null, laesetidMinutter: 9 },
  { slug: "bmi-voksen-saadan-tolk-er-du-tallet", publiceret: "2026-10-01", opdateret: null, laesetidMinutter: 6 },
  { slug: "boernepenge-2026-satser-og-regler", publiceret: "2026-08-24", opdateret: null, laesetidMinutter: 8 },
  { slug: "boliglaan-2026-renter-og-afdrag", publiceret: "2026-02-17", opdateret: null, laesetidMinutter: 9 },
  { slug: "boligsalg-2026-guide-til-omkostninger-og-provenu", publiceret: "2026-08-24", opdateret: null, laesetidMinutter: 9 },
  { slug: "boligstoette-2026-nye-regler", publiceret: "2026-09-24", opdateret: "2026-09-24", laesetidMinutter: 8 },
  { slug: "dagpenge-saadan-finder-du-din-sats", publiceret: "2026-02-17", opdateret: null, laesetidMinutter: 7 },
  { slug: "elpriser-2026-beregn-dit-forbrug", publiceret: "2026-02-17", opdateret: null, laesetidMinutter: 7 },
  { slug: "fradrag-2026-komplet-guide", publiceret: "2026-02-17", opdateret: null, laesetidMinutter: 8 },
  { slug: "guide-feriepenge-hvornaar-og-hvor-meget", publiceret: "2026-02-13", opdateret: null, laesetidMinutter: 8 },
  { slug: "guide-til-laan-og-renter", publiceret: "2026-02-07", opdateret: null, laesetidMinutter: 7 },
  { slug: "hvad-er-klokken-i-usa-naar-den-er-12-i-danmark", publiceret: "2026-09-26", opdateret: null, laesetidMinutter: 8 },
  { slug: "hvordan-beregner-man-moms", publiceret: "2026-02-07", opdateret: null, laesetidMinutter: 5 },
  { slug: "koeb-af-bolig-2026-omkostninger", publiceret: "2026-02-17", opdateret: null, laesetidMinutter: 9 },
  { slug: "kvadratmeter-saadan-regner-du-ud", publiceret: "2026-09-26", opdateret: null, laesetidMinutter: 7 },
  { slug: "leasing-af-bil-2026-pris-og-guide", publiceret: "2026-08-23", opdateret: null, laesetidMinutter: 9 },
  { slug: "maanedsbudget-2026-komplet-guide", publiceret: "2026-08-23", opdateret: null, laesetidMinutter: 10 },
  { slug: "pension-hvor-meget-skal-du-spare-op", publiceret: "2026-02-13", opdateret: null, laesetidMinutter: 10 },
  { slug: "privatoekonomi-for-unge", publiceret: "2026-09-24", opdateret: "2026-09-24", laesetidMinutter: 7 },
  { slug: "saadan-beregner-du-din-reelle-timeloen", publiceret: "2026-02-13", opdateret: null, laesetidMinutter: 7 },
  { slug: "saadan-finder-du-din-timepris-som-freelancer", publiceret: "2026-02-07", opdateret: null, laesetidMinutter: 6 },
  { slug: "skat-2026-alt-du-skal-vide", publiceret: "2026-02-17", opdateret: "2026-09-26", laesetidMinutter: 8 },
  { slug: "spar-penge-paa-braendstof", publiceret: "2026-02-07", opdateret: null, laesetidMinutter: 5 },
  { slug: "su-2026-satser-og-regler", publiceret: "2026-09-24", opdateret: "2026-09-26", laesetidMinutter: 9 },
];

const BY_SLUG = new Map(BLOG_ARTIKLER.map((a) => [a.slug, a]));

export function blogArtikler(): BlogArtikkel[] {
  return BLOG_ARTIKLER;
}

/** Kaster med vilje: en ukendt slug må ikke få en stille, tom dato. */
export function blogArtikel(slug: string): BlogArtikkel {
  const artikel = BY_SLUG.get(slug);
  if (!artikel) {
    throw new Error(`Ukendt blog-slug: ${slug}`);
  }
  return artikel;
}

const MAANEDER_DA = [
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
];

/**
 * "2026-09-24" → "24. september 2026".
 *
 * Datoerne er konstrueret i UTC og formateres i UTC, fordi `new Date("2026-09-24")`
 * ellers tolkes som kl. 00.00 *lokalt* — og i dansk tid (UTC+1) ville det give
 * den 23. september. Det er præcis den forskydning, der gjorde `maanedsbudget`
 * og `su` uforståelige i forvejen.
 */
export function formatBlogDato(iso: string): string {
  const dato = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(dato.getTime())) {
    throw new Error(`Ugyldig ISO-dato: ${iso}`);
  }
  const dag = dato.getUTCDate();
  const maaned = MAANEDER_DA[dato.getUTCMonth()];
  return `${dag}. ${maaned} ${dato.getUTCFullYear()}`;
}

/** Den dato et indlæg faktisk viser: opdateringen når den findes, ellers publicering. */
export function blogSynligDato(artikel: BlogArtikkel): string {
  return artikel.opdateret ?? artikel.publiceret;
}
