/**
 * Brokost over Øresundsbroen for én overfart, plus årsforbrug.
 *
 * Kilde: oresundsbron.com/da/priser, afsnittet «Prisen for at køre over
 * Øresundsbron», læst 6. oktober 2026. Priserne er i DKK pr. enkelttur,
 * inklusive 25 % moms, og gælder fra 14. september 2026.
 *
 * Øresundsbron har tre betalingsformer, ikke to som Storebælt:
 *
 * - **ØresundGO** er en rabataftale med en årsafgift på 370 kr., der giver den
 *   laveste pris pr. overfart.
 * - **Onlinebillet** købes på forhånd og er gyldig i 30 dage. Kilden angiver en
 *   pris med 10 % rabat ved tilmelding til nyhedsbrevet; rabatten er ikke trukket
 *   ind i tallet her.
 * - **Betalingsanlægget** er normalprisen, når man betaler i betalingsstationen.
 *
 * Tallene står **her** og ikke i brødteksten, så værktøjet og sidens egen tekst
 * ikke kan komme til at sige hver sit.
 */

/** Sådan betales turen over Øresundsbron. */
export type OresundBetalingsform = "go" | "online" | "normal";

export interface OresundKategori {
  /** Nøglen bruges i kaldene; etiketten er den danske overskrift i værktøjet. */
  nokkel: string;
  etiket: string;
  /** Pris med ØresundGO-aftalen, i kroner pr. overfart. */
  go: number;
  /** Pris for en onlinebillet, i kroner pr. overfart. */
  online: number;
  /** Normalpris i betalingsanlægget, i kroner pr. overfart. */
  normal: number;
  /** Hvilken gruppe køretøjet hører til, så værktøjet kan gruppere listen. */
  gruppe: "personbil" | "motorcykel" | "varebil" | "autocamper" | "minibus";
}

/**
 * Prisliste fra oresundsbron.com/da/priser, læst 6. oktober 2026. Rækkerne er
 * kopieret i den rækkefølge, kilden lister dem i.
 */
export const ORESUND_KATEGORIER: readonly OresundKategori[] = [
  { nokkel: "personbil-max-6", etiket: "Personbil (max 6 m)", go: 182, online: 420, normal: 470, gruppe: "personbil" },
  { nokkel: "personbil-anhaenger-15", etiket: "Personbil (max 6 m) med påhæng (max 15 m)", go: 364, online: 840, normal: 940, gruppe: "personbil" },
  { nokkel: "personbil-anhaenger-over-15", etiket: "Personbil med påhæng (over 15 m)", go: 725, online: 1485, normal: 1655, gruppe: "personbil" },
  { nokkel: "autocamper-max-6", etiket: "Autocamper (max 6 m)", go: 182, online: 420, normal: 470, gruppe: "autocamper" },
  { nokkel: "autocamper-6-10", etiket: "Autocamper (6-10 m)", go: 364, online: 840, normal: 940, gruppe: "autocamper" },
  { nokkel: "autocamper-over-10", etiket: "Autocamper (over 10 m)", go: 725, online: 1485, normal: 1655, gruppe: "autocamper" },
  { nokkel: "autocamper-anhaenger", etiket: "Autocamper (over 6 m) med påhæng", go: 725, online: 1485, normal: 1655, gruppe: "autocamper" },
  { nokkel: "minibus-6-10", etiket: "Minibus (6-10 m)", go: 364, online: 840, normal: 940, gruppe: "minibus" },
  { nokkel: "motorcykel", etiket: "Motorcykel", go: 94, online: 215, normal: 240, gruppe: "motorcykel" },
  { nokkel: "varebil-6-9", etiket: "Varebil (6-9 m)", go: 364, online: 840, normal: 940, gruppe: "varebil" },
  { nokkel: "varebil-over-9", etiket: "Varebil (over 9 m)", go: 725, online: 1485, normal: 1655, gruppe: "varebil" },
] as const;

/** Årsafgiften for ØresundGO-aftalen, i kroner. */
export const ORESUND_GO_AARSAFGIFT = 370;

/** Den køretøjstype værktøjet er forudindstillet på, og sidens regneeksempel. */
export const ORESUND_START = "personbil-max-6" as const;

/** Antal ture (tur/retur) om året, som værktøjet regner årsforbrug ud fra. */
export const ORESUND_START_TURE = 12;
export const ORESUND_MIN_TURE = 1;
export const ORESUND_MAX_TURE = 365;

export function oresundKategori(nokkel: string): OresundKategori | null {
  return ORESUND_KATEGORIER.find((k) => k.nokkel === nokkel) ?? null;
}

/** Prisen for én overfart i den valgte betalingsform. */
export function oresundPris(kategori: OresundKategori, form: OresundBetalingsform): number {
  return kategori[form];
}

export interface OresundResultat {
  kategori: OresundKategori;
  betalingsform: OresundBetalingsform;
  /** Pris for én overfart, altså kilden uændret. */
  prisPrOverfart: number;
  /** Pris for en tur/retur, altså to overfarter. */
  turReturPris: number;
  /** Antal ture (tur/retur) om året. */
  ture: number;
  /** Årsforbrug med den valgte betalingsform. */
  aarsforbrug: number;
  /** Årsforbrug fordelt på tolv måneder. */
  prMaaned: number;
  /**
   * Hvad den samme rejse koster om året til normalpris i betalingsanlægget.
   * Bruges til at vise, hvad ØresundGO sparer.
   */
  normalAarsforbrug: number;
  /** Hvad ØresundGO sparer om året mod normalprisen. Kun sat for `go`. */
  besparelseModNormal: number | null;
  /** Årsafgiften for ØresundGO, `0` når betalingsformen ikke er `go`. */
  aarsafgift: number;
}

/**
 * Regner turens pris og årsforbrug. `ture` er antal tur/retur om året, fordi
 * kilden oplyser prisen pr. enkelttur og de fleste kører frem og tilbage.
 */
export function beregnOresundsbroen(input: {
  nokkel: string;
  betalingsform: OresundBetalingsform;
  ture: number;
}): OresundResultat | null {
  const kategori = oresundKategori(input.nokkel);
  if (!kategori) return null;

  const ture = Math.min(ORESUND_MAX_TURE, Math.max(ORESUND_MIN_TURE, Math.round(input.ture)));
  const prisPrOverfart = oresundPris(kategori, input.betalingsform);
  const turReturPris = prisPrOverfart * 2;
  const aarsafgift = input.betalingsform === "go" ? ORESUND_GO_AARSAFGIFT : 0;
  const aarsforbrug = turReturPris * ture + aarsafgift;

  const normalAarsforbrug = kategori.normal * 2 * ture;
  const besparelseModNormal =
    input.betalingsform === "go" ? normalAarsforbrug - aarsforbrug : null;

  return {
    kategori,
    betalingsform: input.betalingsform,
    prisPrOverfart,
    turReturPris,
    ture,
    aarsforbrug,
    prMaaned: aarsforbrug / 12,
    normalAarsforbrug,
    besparelseModNormal,
    aarsafgift,
  };
}

/**
 * Hvor mange tur/retur der skal til, før ØresundGOs årsafgift er tjent ind mod
 * normalprisen. Kilden siger «sparer årsafgiften allerede på den første
 * returrejse»; tallet regnes her, så teksten ikke kan påstå noget andet.
 */
export function oresundGoBreakEven(kategori: OresundKategori): number {
  const besparelsePrTur = (kategori.normal - kategori.go) * 2;
  if (besparelsePrTur <= 0) return 0;
  return Math.ceil(ORESUND_GO_AARSAFGIFT / besparelsePrTur);
}

/** Antallet af køretøjstyper i prislisten, brugt i brødteksten og porten. */
export const ORESUND_ANTAL_KATEGORIER = ORESUND_KATEGORIER.length;

/** Laveste og højeste normalpris i listen, så brødteksten kan vise spændet. */
export const ORESUND_MIN_NORMALPRIS = Math.min(
  ...ORESUND_KATEGORIER.map((k) => k.normal)
);
export const ORESUND_MAX_NORMALPRIS = Math.max(
  ...ORESUND_KATEGORIER.map((k) => k.normal)
);
