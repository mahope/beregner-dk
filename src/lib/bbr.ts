// BBR (Bygnings- og Boligregistret) and the cadastre (Matrikel) via Datafordeler's GraphQL services.
// The lookup runs server-side in /api/bbr because it needs an API key. This file holds no key and
// can therefore also be imported from the client (types, parsers and the client call).
// Code lists: https://teknik.bbr.dk/kodelister/0/1/0/BygAnvendelse (and EnhAnvendelse, Livscyklus)

export const BBR_GRAPHQL_URL = "https://graphql.datafordeler.dk/BBR/v2";
export const MAT_GRAPHQL_URL = "https://graphql.datafordeler.dk/MAT/v2";
export const BBR_DK = "https://bbr.dk/";

/** Buildings on a house number (access address). */
export const BYGNING_QUERY = `query ($husnummer: String!, $tid: DafDateTime!) { BBR_Bygning(first: 50, virkningstid: $tid, registreringstid: $tid, where: { husnummer: { eq: $husnummer } }) { nodes { id_lokalId status byg021BygningensAnvendelse byg026Opfoerelsesaar byg027OmTilbygningsaar byg038SamletBygningsareal byg039BygningensSamledeBoligAreal jordstykke virkningTil registreringTil } } }`;

/** Units (dwellings) on a specific address, e.g. an apartment. */
export const ENHED_QUERY = `query ($adresse: String!, $tid: DafDateTime!) { BBR_Enhed(first: 20, virkningstid: $tid, registreringstid: $tid, where: { adresseIdentificerer: { eq: $adresse } }) { nodes { id_lokalId status bygning enh020EnhedensAnvendelse enh026EnhedensSamledeAreal enh027ArealTilBeboelse enh031AntalVaerelser virkningTil registreringTil } } }`;

/** The land parcel a building stands on (registered area in m²). */
export const JORDSTYKKE_QUERY = `query ($id: String!, $tid: DafDateTime!) { MAT_Jordstykke(first: 5, virkningstid: $tid, registreringstid: $tid, where: { id_lokalId: { eq: $id } }) { nodes { id_lokalId status registreretAreal virkningTil registreringTil } } }`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const erUuid = (s: unknown): s is string => typeof s === "string" && UUID.test(s);
const JORDSTYKKE_ID = /^\d{1,12}$/;

/** Livscyklus: 6 = Opført, 7 = Gældende. Everything else is projected, demolished, historic, erroneous etc. */
const GAELDENDE_STATUS = new Set(["6", "7"]);

/** Official code list BygAnvendelse (teknik.bbr.dk). Only codes relevant for dwellings get a text. */
const BYG_ANVENDELSE: Record<string, string> = {
  "110": "Stuehus til landbrugsejendom",
  "120": "Fritliggende enfamiliehus",
  "121": "Sammenbygget enfamiliehus",
  "122": "Fritliggende enfamiliehus i tæt-lav bebyggelse",
  "130": "Række-, kæde- eller dobbelthus",
  "131": "Række-, kæde- og klyngehus",
  "132": "Dobbelthus",
  "140": "Etageboligbygning, flerfamiliehus eller tofamiliehus",
  "150": "Kollegium",
  "160": "Boligbygning til døgninstitution",
  "185": "Anneks i tilknytning til helårsbolig",
  "190": "Anden bygning til helårsbeboelse",
  "510": "Sommerhus",
  "540": "Kolonihavehus",
  "585": "Anneks i tilknytning til fritids- og sommerhus",
  "910": "Garage",
  "920": "Carport",
  "930": "Udhus",
};

/** The code list EnhAnvendelse uses other words for dwelling units than for buildings. */
const ENH_ANVENDELSE: Record<string, string> = {
  "140": "Bolig i etageejendom, flerfamiliehus eller tofamiliehus",
  "150": "Kollegiebolig",
  "160": "Bolig i døgninstitution",
  "190": "Anden enhed til helårsbeboelse",
};

/** Codes for dwellings (year-round and leisure). 9xx (garage, carport, shed etc.) never count. */
const BOLIG_KODER = new Set(["110", "120", "121", "122", "130", "131", "132", "140", "150", "160", "185", "190", "510", "540", "585"]);
/** Buildings with several dwellings, where the building's total area is not your dwelling's area. */
const FLERE_BOLIGER = new Set(["140", "150", "160"]);
/** Annexes only count if there is also an actual dwelling. */
const ANNEKS = new Set(["185", "585"]);

export const erBoligkode = (kode: string | null | undefined) => !!kode && BOLIG_KODER.has(kode);

export function anvendelsesTekst(kode: string | null | undefined, enhed = false): string | null {
  if (!kode) return null;
  return (enhed ? ENH_ANVENDELSE[kode] : undefined) ?? BYG_ANVENDELSE[kode] ?? `Anvendelseskode ${kode}`;
}

export type Bygning = {
  id: string;
  status: string | null;
  anvendelse: string | null;
  opfoerelsesaar: number | null;
  ombygningsaar: number | null;
  samletAreal: number | null;
  boligareal: number | null;
  jordstykke: string | null;
};

export type Enhed = {
  id: string;
  status: string | null;
  bygning: string | null;
  anvendelse: string | null;
  samletAreal: number | null;
  boligareal: number | null;
  vaerelser: number | null;
};

/** What the client receives: compact and without raw BBR fields. */
export type BbrData = {
  /** Dwelling area in m². For apartments the unit's area, otherwise the sum of current dwelling buildings. */
  boligareal: number | null;
  /** Number of rooms registered on the unit (BBR_Enhed.enh031AntalVaerelser). */
  vaerelser: number | null;
  opfoerelsesaar: number | null;
  /** Latest conversion/extension year, if later than the construction year. */
  ombygningsaar: number | null;
  /** Registered area of the land parcel (Matrikel). Null for apartments and when unknown. */
  grundareal: number | null;
  anvendelseKode: string | null;
  anvendelse: string | null;
  /** True when the dwelling is part of a building with several dwellings (apartment). */
  lejlighed: boolean;
};

export type BbrSvar =
  | { tilgaengelig: false }
  | { tilgaengelig: true; fundet: false }
  | ({ tilgaengelig: true; fundet: true } & BbrData);

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : Number.NaN;
  return Number.isFinite(n) ? n : null;
};
/** Year: BBR uses 1000 as "unknown" on e.g. old sheds. */
const aar = (v: unknown): number | null => {
  const n = num(v);
  return n !== null && n >= 1200 && n <= 2100 ? Math.trunc(n) : null;
};
const positiv = (v: unknown): number | null => {
  const n = num(v);
  return n !== null && n > 0 ? n : null;
};

function noder(json: unknown, rod: string): Obj[] | null {
  if (!isObj(json) || !isObj(json.data)) return null;
  const forbindelse = json.data[rod];
  if (!isObj(forbindelse) || !Array.isArray(forbindelse.nodes)) return null;
  return forbindelse.nodes.filter(isObj);
}

const udenSlutdato = (n: Obj) => n.virkningTil == null && n.registreringTil == null;

/** Only current versions: status Opført/Gældende and no end date on effect or registration. */
function gaeldende(n: Obj): boolean {
  const status = str(n.status);
  return !!status && GAELDENDE_STATUS.has(status) && udenSlutdato(n);
}

/** Parses the BYGNING_QUERY response. Returns null if the response is malformed (e.g. GraphQL errors). */
export function parseBygninger(json: unknown): Bygning[] | null {
  const n = noder(json, "BBR_Bygning");
  if (!n) return null;
  return n.filter(gaeldende).flatMap((b): Bygning[] => {
    const id = str(b.id_lokalId);
    if (!id) return [];
    const opfoert = aar(b.byg026Opfoerelsesaar);
    const om = aar(b.byg027OmTilbygningsaar);
    const jordstykke = str(b.jordstykke);
    return [
      {
        id,
        status: str(b.status),
        anvendelse: str(b.byg021BygningensAnvendelse),
        opfoerelsesaar: opfoert,
        ombygningsaar: om !== null && (opfoert === null || om > opfoert) ? om : null,
        samletAreal: positiv(b.byg038SamletBygningsareal),
        boligareal: positiv(b.byg039BygningensSamledeBoligAreal),
        jordstykke: jordstykke && JORDSTYKKE_ID.test(jordstykke) ? jordstykke : null,
      },
    ];
  });
}

/** Parses the ENHED_QUERY response. */
export function parseEnheder(json: unknown): Enhed[] | null {
  const n = noder(json, "BBR_Enhed");
  if (!n) return null;
  return n.filter(gaeldende).flatMap((e): Enhed[] => {
    const id = str(e.id_lokalId);
    if (!id) return [];
    const vaerelser = positiv(e.enh031AntalVaerelser);
    return [
      {
        id,
        status: str(e.status),
        bygning: str(e.bygning),
        anvendelse: str(e.enh020EnhedensAnvendelse),
        samletAreal: positiv(e.enh026EnhedensSamledeAreal),
        boligareal: positiv(e.enh027ArealTilBeboelse),
        vaerelser: vaerelser !== null && vaerelser < 100 ? Math.trunc(vaerelser) : null,
      },
    ];
  });
}

/** Parses the JORDSTYKKE_QUERY response into the registered area, or null. Matrikel uses the text status "Gældende". */
export function parseJordstykkeAreal(json: unknown): number | null {
  const n = noder(json, "MAT_Jordstykke");
  if (!n) return null;
  const gyldig = n.find((j) => str(j.status) === "Gældende" && udenSlutdato(j));
  return gyldig ? positiv(gyldig.registreretAreal) : null;
}

type Udledt = { data: BbrData; jordstykke: string | null };

/**
 * Combines buildings and units into one compact answer.
 * - If the address has a current dwelling unit, the unit's area, rooms and use are used (apartments, but also houses).
 * - Otherwise the dwelling area of current dwelling buildings on the house number is summed. Garages, carports and sheds (9xx) never count.
 * - If the address is in a multi-dwelling building without a specific unit, the dwelling's area is unknown.
 * Also returns the land parcel id to look up the plot area, but only for single dwellings.
 * Returns null if there is no dwelling.
 */
export function udledBbr(bygninger: Bygning[], enheder: Enhed[] = []): Udledt | null {
  const boligbygninger = bygninger.filter((b) => erBoligkode(b.anvendelse));
  const enhed = enheder.find((e) => erBoligkode(e.anvendelse));

  if (enhed) {
    const byg = bygninger.find((b) => b.id === enhed.bygning) ?? null;
    const lejlighed = FLERE_BOLIGER.has(byg?.anvendelse ?? "") || FLERE_BOLIGER.has(enhed.anvendelse ?? "");
    return {
      data: {
        boligareal: enhed.boligareal ?? enhed.samletAreal,
        vaerelser: enhed.vaerelser,
        opfoerelsesaar: byg?.opfoerelsesaar ?? null,
        ombygningsaar: byg?.ombygningsaar ?? null,
        grundareal: null,
        anvendelseKode: enhed.anvendelse,
        anvendelse: anvendelsesTekst(enhed.anvendelse, true),
        lejlighed,
      },
      jordstykke: lejlighed ? null : (byg?.jordstykke ?? null),
    };
  }

  const egentlige = boligbygninger.filter((b) => !ANNEKS.has(b.anvendelse ?? ""));
  if (egentlige.length === 0) return null;
  const bygAreal = (b: Bygning) => b.boligareal ?? b.samletAreal ?? 0;
  const hoved = [...egentlige].sort((a, b) => bygAreal(b) - bygAreal(a))[0];
  const lejlighed = FLERE_BOLIGER.has(hoved.anvendelse ?? "");
  const sum = boligbygninger.reduce((s, b) => s + bygAreal(b), 0);
  const ombygget = egentlige.map((b) => b.ombygningsaar).filter((x): x is number => x !== null);

  return {
    data: {
      boligareal: lejlighed || sum <= 0 ? null : sum,
      vaerelser: null,
      opfoerelsesaar: hoved.opfoerelsesaar,
      ombygningsaar: ombygget.length ? Math.max(...ombygget) : null,
      grundareal: null,
      anvendelseKode: hoved.anvendelse,
      anvendelse: anvendelsesTekst(hoved.anvendelse),
      lejlighed,
    },
    jordstykke: lejlighed ? null : hoved.jordstykke,
  };
}

/** Client: look up BBR via our own server (the key stays on the server). POST keeps address ids out of URLs and access logs. */
export async function hentBbr(
  husnummerId: string,
  adresseId: string | null,
  opts: { signal?: AbortSignal; fetchImpl?: typeof fetch } = {},
): Promise<BbrSvar> {
  const { signal, fetchImpl = fetch } = opts;
  try {
    const res = await fetchImpl("/api/bbr", {
      method: "POST",
      signal,
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ husnummerId, adresseId }),
    });
    if (!res.ok) return { tilgaengelig: false };
    const j: unknown = await res.json();
    return isObj(j) && typeof j.tilgaengelig === "boolean" ? (j as BbrSvar) : { tilgaengelig: false };
  } catch {
    return { tilgaengelig: false };
  }
}
