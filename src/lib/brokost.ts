/**
 * Brokost over Storebæltsbroen for én tur, plus årsforbrug.
 *
 * Kilde: storebaelt.dk/priser, afsnittet «Prisliste 2026», læst 6. oktober 2026.
 * Prisen afhænger af køretøjets type og størrelse og af betalingsformen:
 * `eksprespris*` kræver et automatisk betalingsmiddel (Bizz eller
 * nummerpladebetaling) i en grøn ekspresbane, `kort- og kontantpris**` er det,
 * du betaler i de blå og gule baner. Fritidsrabatterne (aften-, weekend- og
 * helligdagsrabat) er Storebælt Privataftaler og gælder tur/retur for køretøjer
 * under 6 m.
 *
 * Tallene står **her** og ikke i brødteksten, så værktøjet og sidens egen
 * tekst ikke kan komme til at sige hver sit (`regnestykker`-porten dømmer
 * netop det).
 */

/** Sådan betales turen. Kort- og kontantprisen er dyrere pr. overfart. */
export type Betalingsform = "ekspres" | "kort";

export interface BrokostKategory {
  /** Nøglen bruges i kaldene; etiketten er den danske overskrift i værktøjet. */
  nokkel: string;
  etiket: string;
  /** Eksprespris i kroner for én overfart, `null` når betalingsformen ikke kan bruges. */
  eksprespris: number;
  /** Kort- og kontantpris i kroner for én overfart, `null` når den ikke findes. */
  kortpris: number | null;
  /**
   * Om køretøjet er under 6 m. Kun sådanne køretøjer kan få aften-, weekend-
   * og helligdagsrabat, og kun de må bruge fritidsbilletterne.
   */
  underSeksMeter: boolean;
  /** Hvilken gruppe køretøjet hører til, så værktøjet kan gruppere listen. */
  gruppe: "personbil" | "varebil" | "autocamper" | "lastbil" | "bus";
}

/**
 * Prisliste 2026 for en enkelttur, som den står på storebaelt.dk/priser den
 * 6. oktober 2026. Rækkerne er kopieret i den rækkefølge, kilden lister dem i.
 */
export const BROKOST_KATEGORIER: readonly BrokostKategory[] = [
  { nokkel: "personbil-3-6", etiket: "Personbil 3-6 m", eksprespris: 205, kortpris: 235, underSeksMeter: true, gruppe: "personbil" },
  { nokkel: "personbil-over-6", etiket: "Personbil over 6 m under 2,7 m høj", eksprespris: 314, kortpris: 360, underSeksMeter: false, gruppe: "personbil" },
  { nokkel: "personbil-campingvogn", etiket: "Personbil med campingvogn", eksprespris: 314, kortpris: 360, underSeksMeter: false, gruppe: "personbil" },
  { nokkel: "personbil-anhaenger-6", etiket: "Personbil med anhænger op til 6 m", eksprespris: 205, kortpris: 235, underSeksMeter: true, gruppe: "personbil" },
  { nokkel: "personbil-anhaenger-over-6", etiket: "Personbil med anhænger over 6 m", eksprespris: 314, kortpris: 360, underSeksMeter: false, gruppe: "personbil" },
  { nokkel: "personbil-op-til-3", etiket: "Personbil op til 3 m", eksprespris: 109, kortpris: 125, underSeksMeter: true, gruppe: "personbil" },
  { nokkel: "motorcykel-3", etiket: "Motorcykel op til 3 m", eksprespris: 109, kortpris: 125, underSeksMeter: true, gruppe: "personbil" },
  { nokkel: "motorcykel-anhaenger", etiket: "Motorcykel med anhænger 3-6 m", eksprespris: 205, kortpris: 235, underSeksMeter: true, gruppe: "personbil" },
  { nokkel: "varebil-6", etiket: "Varebil op til 6 m", eksprespris: 205, kortpris: 235, underSeksMeter: true, gruppe: "varebil" },
  { nokkel: "varebil-anhaenger-6", etiket: "Varebil med anhænger op til 6 m", eksprespris: 205, kortpris: 235, underSeksMeter: true, gruppe: "varebil" },
  { nokkel: "varebil-over-6", etiket: "Varebil over 6 m under 2,7 m høj", eksprespris: 314, kortpris: 360, underSeksMeter: false, gruppe: "varebil" },
  { nokkel: "varebil-anhaenger-over-6", etiket: "Varebil med anhænger over 6 m under 2,7 m høj", eksprespris: 314, kortpris: 360, underSeksMeter: false, gruppe: "varebil" },
  { nokkel: "varebil-hoj", etiket: "Varebil over 6 m og over 2,7 m høj", eksprespris: 613, kortpris: 645, underSeksMeter: false, gruppe: "varebil" },
  { nokkel: "varebil-anhaenger-hoj", etiket: "Varebil med anhænger over 6 m og over 2,7 m høj", eksprespris: 613, kortpris: 645, underSeksMeter: false, gruppe: "varebil" },
  { nokkel: "autocamper-10", etiket: "Autocamper op til 10 m", eksprespris: 613, kortpris: 645, underSeksMeter: false, gruppe: "autocamper" },
  { nokkel: "autocamper-over-3500", etiket: "Autocamper over 3.500 kg og over 10 m", eksprespris: 969, kortpris: 1020, underSeksMeter: false, gruppe: "autocamper" },
  { nokkel: "autocamper-under-3500-6", etiket: "Autocamper under 3.500 kg og op til 6 m", eksprespris: 205, kortpris: 235, underSeksMeter: true, gruppe: "autocamper" },
  { nokkel: "autocamper-aftale", etiket: "Autocamper under 3.500 kg og over 6 m med autocamperaftale", eksprespris: 314, kortpris: null, underSeksMeter: false, gruppe: "autocamper" },
  { nokkel: "lastbil-10", etiket: "Lastbil op til 10 m", eksprespris: 613, kortpris: 645, underSeksMeter: false, gruppe: "lastbil" },
  { nokkel: "lastbil-20", etiket: "Lastbil 10-20 m", eksprespris: 969, kortpris: 1020, underSeksMeter: false, gruppe: "lastbil" },
  { nokkel: "lastbil-100", etiket: "Lastbil over 20 m og op til 100 t", eksprespris: 1454, kortpris: 1530, underSeksMeter: false, gruppe: "lastbil" },
  { nokkel: "saertransport", etiket: "Særtransport over 20 m og over 100 t", eksprespris: 4992, kortpris: 5255, underSeksMeter: false, gruppe: "lastbil" },
  { nokkel: "bus-6", etiket: "Bus op til 6 m", eksprespris: 205, kortpris: 235, underSeksMeter: true, gruppe: "bus" },
  { nokkel: "bus-over-6", etiket: "Bus over 6 m under 2,7 m høj", eksprespris: 314, kortpris: 360, underSeksMeter: false, gruppe: "bus" },
  { nokkel: "bus-10-hoj", etiket: "Bus 6-10 m og over 2,7 m høj", eksprespris: 613, kortpris: 645, underSeksMeter: false, gruppe: "bus" },
  { nokkel: "bus-20-hoj", etiket: "Bus 10-20 m og over 2,7 m høj", eksprespris: 969, kortpris: 1020, underSeksMeter: false, gruppe: "bus" },
] as const;

/** Den køretøjstype værktøjet er forudindstillet på, og sidens regneeksempel. */
export const BROKOST_START = "personbil-3-6" as const;

/** Antal overfarter i den valgte tur. Tur/retur er to overfarter. */
export const BROKOST_START_OVERFARTER = 2;
export const MIN_OVERFARTER = 1;
export const MAX_OVERFARTER = 60;

/** Antal gange turen gentages om året, så værktøjet kan regne årsforbrug. */
export const BROKOST_START_TURE = 12;
export const MIN_TURE = 1;
export const MAX_TURE = 365;

export type Rabat = "ingen" | "aften" | "weekend" | "helligdag";

/**
 * Fritidsrabattene er priser for **tur/retur**, så de er et fast beløb for
 * hele turen og ikke pr. overfart. Kilden: «Aftenrabat 246 kr. tur/retur»,
 * «Weekendrabat 346 kr.», «Helligdagsrabat 346 kr.».
 */
export const BROKOST_RABATTER: Record<Exclude<Rabat, "ingen">, number> = {
  aften: 246,
  weekend: 346,
  helligdag: 346,
};

export function brokostKategori(nokkel: string): BrokostKategory | null {
  return BROKOST_KATEGORIER.find((k) => k.nokkel === nokkel) ?? null;
}

/**
 * Prisen for én overfart i den valgte betalingsform. `null` når kilden siger, at
 * kombinationen ikke kan bruges (autocamperaftalen kræver betalingsmiddel).
 */
export function brokostPrisPrOverfart(
  kategori: BrokostKategory,
  betaling: Betalingsform
): number | null {
  return betaling === "ekspres" ? kategori.eksprespris : kategori.kortpris;
}

export interface BrokostResultat {
  kategori: BrokostKategory;
  /** Pris for én overfart, altså kilden uændret. */
  prisPrOverfart: number;
  /** Hvor mange overfarter turen indeholder. */
  overfarter: number;
  /** Pris for turen før rabat. */
  turFoerRabat: number;
  /** Hvor meget fritidsrabatten trækker fra. */
  rabatKr: number;
  /** Pris for turen efter rabat. */
  turEfterRabat: number;
  /** Pris for turen efter rabat, delt med overfarterne. */
  prOverfartEfterRabat: number;
  /** Hvor mange gange turen gentages om året. */
  ture: number;
  /** Årsforbrug efter rabat. */
  aarsforbrug: number;
  /** Årsforbrug fordelt på tolv måneder. */
  prMaaned: number;
  /**
   * Hvorfor et valgt fritidsrabat ikke kan bruges, eller `null` når det kan.
   * Værktøjet skal sige det samme som regnestykket, ellers lader brugeren
   * tro at sparet kommer fra.
   */
  rabatForbehold: "ikke-under-6-m" | "ikke-kort" | "ikke-tur-retur" | "ikke-billigere" | null;
  /** Hvilket fritidsrabat der blev valgt, så værktøjet kan vise billetprisen. */
  rabat: Rabat;
}

/**
 * Regner turens pris og årsforbrug.
 *
 * Fritidsrabattene kræver alle tre: et køretøj under 6 m, betaling med
 * automatisk betalingsmiddel og en tur/retur. Mangler en af dem, er
 * `rabatKr` 0 og `rabatForbehold` siger hvilken.
 */
export function beregnBrokost(input: {
  nokkel: string;
  betalingsform: Betalingsform;
  overfarter: number;
  ture: number;
  rabat: Rabat;
}): BrokostResultat | null {
  const kategori = brokostKategori(input.nokkel);
  if (!kategori) return null;

  const prisPrOverfart = brokostPrisPrOverfart(kategori, input.betalingsform);
  if (prisPrOverfart === null) return null;

  const overfarter = Math.min(MAX_OVERFARTER, Math.max(MIN_OVERFARTER, Math.round(input.overfarter)));
  const ture = Math.min(MAX_TURE, Math.max(MIN_TURE, Math.round(input.ture)));

  // Fritidsrabattene er tur/retur-priser, så de kan ikke slås sammen med
  // et antal overfarter, der ikke er præcis to.
  let rabatForbehold: BrokostResultat["rabatForbehold"] = null;
  if (input.rabat !== "ingen") {
    if (!kategori.underSeksMeter) rabatForbehold = "ikke-under-6-m";
    else if (input.betalingsform !== "ekspres") rabatForbehold = "ikke-kort";
    else if (overfarter !== 2) rabatForbehold = "ikke-tur-retur";
    // Billetten er fast, så den kan være dyrere end de enkeltpriser den
    // erstatter: en bil på 3 m koster 218 kr. tur/retur, og aftenbilletten
    // koster 246 kr. Værktøjet må ikke fremstille det som en besparelse.
    else if (BROKOST_RABATTER[input.rabat] >= prisPrOverfart * 2)
      rabatForbehold = "ikke-billigere";
  }

  const turFoerRabat = prisPrOverfart * overfarter;
  // Et fritidsrabat er ikke en fradragspost, men en **egen billet til en fast
  // pris for tur/retur** («Aftenrabat 246 kr. tur/retur»). Den erstatter derfor
  // de to enkeltpriser i stedet for at trækkes fra dem — ellers fik en bil på
  // 3 m til 109 kr. en tur på 218 − 246 = −28 kr.
  const billetpris = input.rabat === "ingen" ? null : BROKOST_RABATTER[input.rabat];
  const turEfterRabat = rabatForbehold === null && billetpris !== null ? billetpris : turFoerRabat;
  const rabatKr = turFoerRabat - turEfterRabat;
  const aarsforbrug = turEfterRabat * ture;

  return {
    kategori,
    prisPrOverfart,
    overfarter,
    turFoerRabat,
    rabatKr,
    turEfterRabat,
    prOverfartEfterRabat: turEfterRabat / overfarter,
    ture,
    aarsforbrug,
    prMaaned: aarsforbrug / 12,
    rabatForbehold,
    rabat: input.rabat,
  };
}

/** Antallet af køretøjstyper i prislisten, brugt i brødteksten og porten. */
export const BROKOST_ANTAL_KATEGORIER = BROKOST_KATEGORIER.length;

/** Laveste og højeste eksprespris i listen, så brødteksten kan vise spændet. */
export const BROKOST_MIN_EKSPRESPRIS = Math.min(
  ...BROKOST_KATEGORIER.map((k) => k.eksprespris)
);
export const BROKOST_MAX_EKSPRESPRIS = Math.max(
  ...BROKOST_KATEGORIER.map((k) => k.eksprespris)
);

/**
 * Forskellen mellem kort- og eksprespris for én køretøjstype. Kilden oplyser
 * ingen rabatsats, så den forskel værktøjet viser, regnes på de to tal.
 */
export function brokostForskel(kategori: BrokostKategory): number | null {
  if (kategori.kortpris === null) return null;
  return kategori.kortpris - kategori.eksprespris;
}

/** Hvor meget kortbetaling koster ekstra om året for et givent antal ture. */
export function brokostAarsforskel(
  kategori: BrokostKategory,
  overfarter: number,
  ture: number
): number | null {
  const forskel = brokostForskel(kategori);
  if (forskel === null) return null;
  return forskel * overfarter * ture;
}
