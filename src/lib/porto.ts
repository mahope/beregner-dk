/**
 * Dansk brevporto. PostNord stopped delivering letters in Denmark on
 * 1 January 2026; dao (Dansk Avis Omdeling A/S) took over the nationwide
 * letter monopoly on the same date and delivers every addresserede brev up
 * to 2 kg at uniform prices (postloven § 14).
 *
 * Every price on this page is read from dao's own published list, so the
 * table, the calculator and the FAQ can never disagree. Prices are verified
 * against the source in `PORTO_KILDE` — they must be re-read before a new
 * year, and they may change mid-year.
 */

export type PortoDestination = "danmark" | "udlandet";
export type PortoType = "almindelig" | "plus";

export interface PortoVare {
  destination: PortoDestination;
  type: PortoType;
  /** Upper bound of the weight class in grams. */
  vaegtMax: number;
  pris: number;
  /** Delivery time as dao states it. */
  levering: string;
}

export const PORTO_KILDE = {
  priser:
    "https://dao.as/brev/ (dao's egen prisliste: Danmark alm. 100 g 23 kr., Danmark alm. 250 g 46 kr., Danmark ekstra hurtig PLUS 100 g 36 kr., Danmark ekstra hurtig PLUS 250 g 59 kr., udland alm. 100 g 46 kr., udland alm. 250 g 92 kr.)",
  vilkaar:
    "https://dao.as/en/private-letters/ (breve op til 250 g og max. 1 cm tykkelse, almindelige breve op til 5 hverdage, PLUS 1-2 hverdage, udland typisk 4-16 hverdage)",
  omstilling:
    "https://www.trafikstyrelsen.dk/post-og-koerekort/landsdaekkende-omdeling-af-breve/hvordan-sender-du-et-brev-fra-1-januar-2026 (PostNord ophører med brevomdeling 1. januar 2026, dao overtager breve i hele landet og til og fra udland)",
  bekreftelse:
    "https://www.dr.dk/nyheder/indland/ramt-af-daos-brevkaos-her-eksperts-raad-til-hvad-du-goer-hvis-du-skal-sende-vigtig-brevpost (almindeligt brev under 100 g 23 kr., rekommanderet brev under 100 g 210 kr., kilde: dao)",
  bregner:
    "Et rekommanderet brev koster fra 210 kr. op til 100 g (dao), og til udlandet indleveres rekommanderede breve stadig hos PostNord (trafikstyrelsen.dk)",
  verifiedAt: "2026-10-09",
} as const;

/** Max letter weight. Above this the shipment is a parcel. */
export const PORTO_MAX_VAEGT_G = 250;

/** Max thickness for a letter in centimetres. */
export const PORTO_MAX_TYKKELSE_CM = 1;

/**
 * A registered letter (rekommanderet brev) to a Danish address costs from this
 * amount up to 100 g. Dao publishes it as a single "from" price, so the
 * calculator cannot weigh it — it is shown as a fact instead. To a foreign
 * address a registered letter still goes in with PostNord (trafikstyrelsen.dk).
 */
export const PORTO_REKOMMANDERET_FRA_KR = 210;

/**
 * dao says it has over 1.600 shops nationwide (dao.as, 9/10 2026). The number
 * moves, so the page reads it from here instead of typing it into the text.
 */
export const PORTO_DAO_SHOPS = 1600;

/** The two dao weight classes, and what they cover. */
export const PORTO_VAEGTKLASSER = [
  { vaegtMax: 100, label: "0-100 g" },
  { vaegtMax: 250, label: "101-250 g" },
] as const;

export const PORTO_VARER: PortoVare[] = [
  {
    destination: "danmark",
    type: "almindelig",
    vaegtMax: 100,
    pris: 23,
    levering: "2-5 hverdage",
  },
  {
    destination: "danmark",
    type: "almindelig",
    vaegtMax: 250,
    pris: 46,
    levering: "2-5 hverdage",
  },
  {
    destination: "danmark",
    type: "plus",
    vaegtMax: 100,
    pris: 36,
    levering: "1-2 hverdage",
  },
  {
    destination: "danmark",
    type: "plus",
    vaegtMax: 250,
    pris: 59,
    levering: "1-2 hverdage",
  },
  {
    destination: "udlandet",
    type: "almindelig",
    vaegtMax: 100,
    pris: 46,
    levering: "typisk 4-16 hverdage",
  },
  {
    destination: "udlandet",
    type: "almindelig",
    vaegtMax: 250,
    pris: 92,
    levering: "typisk 4-16 hverdage",
  },
];

export interface PortoInput {
  destination: PortoDestination;
  type: PortoType;
  /** Weight in grams. */
  vaegtGram: number;
  /** How many identical letters (sheets/prints), 1 or more. */
  antal?: number;
}

export interface PortoResultat {
  destination: PortoDestination;
  type: PortoType;
  /** Weight of the letter in grams, as given. */
  vaegtGram: number;
  /** The weight class the letter falls into. */
  vaegtKlasse: number;
  /** Price for one letter in DKK. */
  pris: number;
  levering: string;
  /** Price for all letters in DKK. */
  total: number;
  antal: number;
  /** True when the letter is over 250 g and must go as a parcel. */
  forTungt: boolean;
}

/** Weight class for a letter: 100 g or 250 g. */
export function vaegtKlasse(vaegtGram: number): number {
  if (vaegtGram <= 0) return PORTO_VAEGTKLASSER[0].vaegtMax;
  const klass = PORTO_VAEGTKLASSER.find((k) => vaegtGram <= k.vaegtMax);
  return klass ? klass.vaegtMax : PORTO_MAX_VAEGT_G;
}

export function beregnPorto(input: PortoInput): PortoResultat {
  const antal = Math.max(1, Math.floor(input.antal ?? 1));
  const vaegt = Math.max(0, Math.round(input.vaegtGram));
  const forTungt = vaegt > PORTO_MAX_VAEGT_G;

  const klasse = forTungt ? PORTO_MAX_VAEGT_G : vaegtKlasse(vaegt);
  // Dao har ingen hasteservice til udlandet, så et PLUS-udlandsbrev falder
  // tilbage på almindeligt brev frem for at give ingen pris.
  const vare = PORTO_VARER.find(
    (v) =>
      v.destination === input.destination &&
      v.type === input.type &&
      v.vaegtMax === klasse
  ) ?? PORTO_VARER.find(
    (v) => v.destination === input.destination && v.vaegtMax === klasse
  ) ?? PORTO_VARER[0];

  return {
    destination: input.destination,
    type: input.type,
    vaegtGram: vaegt,
    vaegtKlasse: klasse,
    pris: vare.pris,
    levering: vare.levering,
    total: vare.pris * antal,
    antal,
    forTungt,
  };
}
