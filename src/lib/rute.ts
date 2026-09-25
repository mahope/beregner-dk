// Driving distance between two points via FOSSGIS' public routing servers (OpenStreetMap data).
// Primary: Valhalla (valhalla1.openstreetmap.de) with `shortest: true`, because Skat uses the
// shortest normal route. `shortest` ignores ferry penalties, so when that route uses a ferry we
// ask again with ferries disabled and report both (a daily commute rarely goes by ferry).
// Fallback: OSRM (routing.openstreetmap.de), which only knows the fastest route, so we request
// alternatives and pick the shortest one.
// Usage policy (fossgis.de/arbeitsgruppen/osm-server/nutzungsbedingungen): light use only, max
// 1 request/second, an identifying User-Agent + Referer, and visible OSM attribution.
// Server-side only: called from /api/rute, never from the browser.
import type { LatLon } from "./utm";

export type RuteKilde = "valhalla" | "osrm";

export interface Rute {
  /** One-way driving distance in km. */
  km: number;
  /** Whether the route includes a ferry crossing (null when the service does not say). */
  faerge: boolean | null;
  /** Whether the route has tolls, i.e. Storebælt or Øresund in Denmark (null when unknown). */
  betalingsbro: boolean | null;
  /** Shortest distance when a ferry is allowed, if shorter than `km` (which avoids ferries). */
  kmMedFaerge: number | null;
  kilde: RuteKilde;
}

type RuteData = Pick<Rute, "km" | "faerge" | "betalingsbro">;

export const ROUTING_USER_AGENT = "MinBeregner.dk/1.0 (+https://minberegner.dk/befordringsfradrag)";
const REFERER = "https://minberegner.dk/befordringsfradrag";
const VALHALLA_URL = "https://valhalla1.openstreetmap.de/route";
const OSRM_URL = "https://routing.openstreetmap.de/routed-car/route/v1/driving";
const TIMEOUT_MS = 8000;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const posNum = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);

/** Parses a Valhalla /route response requested with `units: "kilometers"`. */
export function parseValhalla(json: unknown): RuteData | null {
  if (!isObj(json) || !isObj(json.trip)) return null;
  const trip = json.trip;
  if (trip.status !== undefined && trip.status !== 0) return null;
  if (trip.units !== undefined && trip.units !== "kilometers") return null;
  const summary = isObj(trip.summary) ? trip.summary : null;
  const km = posNum(summary?.length);
  if (km === null) return null;
  const bool = (v: unknown) => (typeof v === "boolean" ? v : null);
  return { km, faerge: bool(summary?.has_ferry), betalingsbro: bool(summary?.has_toll) };
}

/** Parses an OSRM /route response and returns the shortest of the returned routes. */
export function parseOsrm(json: unknown): RuteData | null {
  if (!isObj(json) || json.code !== "Ok" || !Array.isArray(json.routes)) return null;
  let kortest: number | null = null;
  for (const r of json.routes) {
    const meter = isObj(r) ? posNum(r.distance) : null;
    if (meter !== null && (kortest === null || meter < kortest)) kortest = meter;
  }
  return kortest === null ? null : { km: kortest / 1000, faerge: null, betalingsbro: null };
}

type FetchImpl = typeof fetch;

async function hentJson(url: string, fetchImpl: FetchImpl): Promise<unknown> {
  const res = await fetchImpl(url, {
    headers: { "User-Agent": ROUTING_USER_AGENT, Referer: REFERER, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`routing svarede ${res.status}`);
  return res.json();
}

export function valhallaUrl(fra: LatLon, til: LatLon, udenFaerge = false): string {
  const body = {
    locations: [
      { lat: fra.lat, lon: fra.lon },
      { lat: til.lat, lon: til.lon },
    ],
    costing: "auto",
    costing_options: { auto: udenFaerge ? { use_ferry: 0 } : { shortest: true } },
    units: "kilometers",
    directions_type: "none",
  };
  return `${VALHALLA_URL}?json=${encodeURIComponent(JSON.stringify(body))}`;
}

export function osrmUrl(fra: LatLon, til: LatLon): string {
  const c = (p: LatLon) => `${p.lon.toFixed(6)},${p.lat.toFixed(6)}`;
  return `${OSRM_URL}/${c(fra)};${c(til)}?overview=false&alternatives=3&steps=false`;
}

// ── Global throttle towards FOSSGIS: at most one upstream request per second ───────────────
const MIN_INTERVAL_MS = 1000;
const MAX_WAIT_MS = 4000;
let naesteLedige = 0;

/** Reserves an upstream slot. Returns false when the queue is too long (we answer 503 instead). */
async function reserverSlot(now = Date.now()): Promise<boolean> {
  const start = Math.max(now, naesteLedige);
  if (start - now > MAX_WAIT_MS) return false;
  naesteLedige = start + MIN_INTERVAL_MS;
  if (start > now) await new Promise((r) => setTimeout(r, start - now));
  return true;
}

// ── Result cache (routes change rarely; keyed on ~10 m rounded coordinates) ────────────────
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_MAX = 2000;
const cache = new Map<string, { rute: Rute; udloeber: number }>();

export function cacheNoegle(fra: LatLon, til: LatLon): string {
  const r = (p: LatLon) => `${p.lat.toFixed(4)},${p.lon.toFixed(4)}`;
  return `${r(fra)};${r(til)}`;
}

export class RoutingOptagetError extends Error {}

/** Finds the shortest driving route. Throws when both services fail or the throttle is full. */
export async function findRute(fra: LatLon, til: LatLon, fetchImpl: FetchImpl = fetch): Promise<Rute> {
  const noegle = cacheNoegle(fra, til);
  const hit = cache.get(noegle);
  if (hit && hit.udloeber > Date.now()) return hit.rute;

  let rute: Rute | null = null;
  if (!(await reserverSlot())) throw new RoutingOptagetError("routing throttle full");
  try {
    const kort = parseValhalla(await hentJson(valhallaUrl(fra, til), fetchImpl));
    if (kort) rute = { ...kort, kmMedFaerge: null, kilde: "valhalla" };
    if (kort?.faerge && (await reserverSlot())) {
      try {
        const land = parseValhalla(await hentJson(valhallaUrl(fra, til, true), fetchImpl));
        if (land && !land.faerge) rute = { ...land, kmMedFaerge: kort.km < land.km ? kort.km : null, kilde: "valhalla" };
      } catch {
        // keep the ferry route
      }
    }
  } catch {
    // fall through to OSRM
  }
  if (!rute) {
    if (!(await reserverSlot())) throw new RoutingOptagetError("routing throttle full");
    const o = parseOsrm(await hentJson(osrmUrl(fra, til), fetchImpl));
    if (!o) throw new Error("routing gav intet resultat");
    rute = { ...o, kmMedFaerge: null, kilde: "osrm" };
  }

  if (cache.size >= CACHE_MAX) {
    const aeldste = cache.keys().next().value;
    if (aeldste !== undefined) cache.delete(aeldste);
  }
  cache.set(noegle, { rute, udloeber: Date.now() + CACHE_TTL_MS });
  return rute;
}

/** Rough bounding box for Denmark incl. Bornholm and Ertholmene. */
export function erIDanmark(p: LatLon): boolean {
  return p.lat >= 54.4 && p.lat <= 57.9 && p.lon >= 7.8 && p.lon <= 15.3;
}

/** Parses "lat,lon" from a query parameter. */
export function parseKoordinat(v: string | null): LatLon | null {
  if (!v) return null;
  const m = /^(-?\d{1,3}(?:\.\d{1,8})?),(-?\d{1,3}(?:\.\d{1,8})?)$/.exec(v.trim());
  if (!m) return null;
  const lat = Number(m[1]);
  const lon = Number(m[2]);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

/** Test hook: reset module state between tests. */
export function _nulstilRuteState(): void {
  cache.clear();
  naesteLedige = 0;
}
