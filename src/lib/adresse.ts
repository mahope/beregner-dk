// Address search via Adressevælger (Klimadatastyrelsen), which replaces DAWA (closing 1 Oct 2026).
// Called directly from the browser (CORS: *). The token is for now a fixed, public string;
// user-specific tokens are expected late 2026 / early 2027.
// Docs: https://confluence.sdfi.dk/pages/viewpage.action?pageId=234782998
// Never use DAWA / api.dataforsyningen.dk. Shared by the BBR lookup and the route distance.
import { type LatLon, utmToWgs84 } from "./utm";

export const ADRESSEVAELGER_URL = "https://adressevaelger.dk";
export const ADRESSEVAELGER_TOKEN = "adressevaelger123";
const TIMEOUT_MS = 6000;

/** A suggestion in the autocomplete list. */
export type Forslag =
  /** A specific address (possibly with floor/door) that can be looked up. */
  | { type: "adresse"; id: string; titel: string; husnummerId: string | null }
  /** A road, a road in a postcode or a house number with several addresses: the search must be refined. */
  | {
      type: "fortsaet";
      titel: string;
      naesteTekst: string;
      markoer: number;
      kilde: "vejnavn" | "navngivenvejpostnummer" | "husnummer";
      /** For `kilde: "husnummer"`: the access address id, so callers that do not need a floor can pick it. */
      husnummerId?: string;
    };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v : null);

/** Parses the `/adresser/soeg` response. Unknown types are skipped. */
export function parseSoegning(json: unknown): Forslag[] {
  if (!isObj(json) || !Array.isArray(json.fund)) return [];
  const ud: Forslag[] = [];
  for (const f of json.fund) {
    if (!isObj(f)) continue;
    const titel = str(f.titel);
    if (!titel) continue;
    switch (f.type) {
      case "adresse": {
        const id = str(f.id);
        if (id) ud.push({ type: "adresse", id, titel, husnummerId: str(f.husnummerId) });
        break;
      }
      case "husnummer":
        // Entrance with several addresses: search again on the title so the floors are listed.
        ud.push({
          type: "fortsaet",
          titel,
          naesteTekst: titel,
          markoer: titel.length,
          kilde: "husnummer",
          ...(str(f.id) ? { husnummerId: str(f.id) as string } : {}),
        });
        break;
      case "navngivenvejpostnummer": {
        // "Vejers Havvej 6853 Vejers Strand" -> "Vejers Havvej , 6853 Vejers Strand" with the caret after
        // the road name, so the user can type the house number right away.
        const vej = str(f.vejnavn) ?? titel;
        const postnr = str(f.postnr);
        const by = str(f.postdistrikt);
        const hale = postnr ? `, ${postnr}${by ? ` ${by}` : ""}` : "";
        ud.push({ type: "fortsaet", titel, naesteTekst: `${vej} ${hale}`, markoer: vej.length + 1, kilde: "navngivenvejpostnummer" });
        break;
      }
      case "vejnavn": {
        const vej = str(f.vejNavn) ?? str(f.vejnavn) ?? titel;
        ud.push({ type: "fortsaet", titel, naesteTekst: `${vej} `, markoer: vej.length + 1, kilde: "vejnavn" });
        break;
      }
    }
  }
  return ud;
}

type HentOpts = { signal?: AbortSignal; fetchImpl?: typeof fetch };

async function hentJson(sti: string, { signal, fetchImpl = fetch }: HentOpts): Promise<unknown> {
  const url = new URL(sti, ADRESSEVAELGER_URL);
  url.searchParams.set("token", ADRESSEVAELGER_TOKEN);
  // Own timeout (not AbortSignal.any/timeout, which older Safari lacks). A timeout throws a plain
  // Error, so callers can tell it apart from their own AbortError.
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  if (signal?.aborted) ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    const res = await fetchImpl(url.toString(), { signal: ctrl.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Adressevælger svarede ${res.status}`);
    return await res.json();
  } catch (e) {
    if (timedOut) throw new Error("Adressevælger svarede ikke i tide");
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

export async function soegAdresser(tekst: string, opts: HentOpts = {}): Promise<Forslag[]> {
  const q = tekst.trim();
  if (q.length < 2) return [];
  return parseSoegning(await hentJson(`/adresser/soeg?tekst=${encodeURIComponent(q)}`, opts));
}

export interface AdressePunkt extends LatLon {
  /** Access address (husnummer) id. */
  husnummerId: string;
  betegnelse: string;
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * Parses the access point from `/husnumre/{id}` (`husnummer`) or `/adresser/{id}` (`adresse.husnummer`).
 * Coordinates are in `adgangspunkt.koordinater`, EPSG:25832, and are converted to WGS84.
 */
export function parseAdressePunkt(json: unknown): AdressePunkt | null {
  if (!isObj(json)) return null;
  const h = isObj(json.husnummer)
    ? json.husnummer
    : isObj(json.adresse) && isObj(json.adresse.husnummer)
      ? json.adresse.husnummer
      : null;
  if (!h) return null;
  const husnummerId = str(h.id_lokalid);
  const betegnelse = str(h.adgangsadressebetegnelse);
  const ap = isObj(h.adgangspunkt) ? h.adgangspunkt : null;
  const k = ap && isObj(ap.koordinater) ? ap.koordinater : null;
  const x = num(k?.x);
  const y = num(k?.y);
  if (!husnummerId || !betegnelse || x === null || y === null) return null;
  // Sanity check: Danish UTM 32 eastings/northings (incl. Bornholm).
  if (x < 380000 || x > 920000 || y < 6000000 || y > 6450000) return null;
  return { husnummerId, betegnelse, ...utmToWgs84(x, y, 32) };
}

/** Looks up the coordinates of a chosen address (via its house number when known). */
export async function hentAdressePunkt(
  valgt: { id: string; husnummerId: string | null },
  opts: HentOpts = {},
): Promise<AdressePunkt | null> {
  const sti = valgt.husnummerId
    ? `/husnumre/${encodeURIComponent(valgt.husnummerId)}`
    : `/adresser/${encodeURIComponent(valgt.id)}`;
  return parseAdressePunkt(await hentJson(sti, opts));
}
