// Latest annual inflation (consumer price index, change vs. same month last year) from
// Danmarks Statistik's StatBank API, table PRIS01 (replaced PRIS111 in February 2026).
// Fetched server-side, revalidated daily; callers fall back to their static default on null.

export const STATBANK_INFLATION_URL =
  "https://api.statbank.dk/v1/data/PRIS01/JSONSTAT?lang=da&VAREGR=000000&ENHED=300&Tid=(-n%2B2)";
const TIMEOUT_MS = 3000;

export interface Inflation {
  /** Annual inflation in percent, e.g. 2.0. */
  pct: number;
  /** StatBank period code, e.g. "2026M08". */
  periode: string;
  /** Human-readable Danish month, e.g. "august 2026". */
  maaned: string;
}

const MAANEDER = [
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

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** "2026M08" -> "august 2026" */
export function formatPeriode(periode: string): string | null {
  const m = /^(\d{4})M(\d{2})$/.exec(periode);
  if (!m) return null;
  const idx = Number(m[2]) - 1;
  return idx >= 0 && idx < 12 ? `${MAANEDER[idx]} ${m[1]}` : null;
}

/** Parses a JSON-stat response and returns the most recent month that has a value. */
export function parseStatbankInflation(json: unknown): Inflation | null {
  const ds = isObj(json) && isObj(json.dataset) ? json.dataset : null;
  if (!ds || !Array.isArray(ds.value) || !isObj(ds.dimension)) return null;
  const tid = isObj(ds.dimension.Tid) && isObj(ds.dimension.Tid.category) ? ds.dimension.Tid.category : null;
  const index = tid && isObj(tid.index) ? tid.index : null;
  if (!index) return null;
  // Only the time dimension may vary; all others must be single-valued.
  if (Array.isArray(ds.size) && ds.size.length > 0) {
    const produkt = (ds.size as unknown[]).reduce<number>((a, b) => a * (typeof b === "number" ? b : 0), 1);
    if (produkt !== ds.value.length) return null;
  }

  const perioder = Object.entries(index)
    .filter((e): e is [string, number] => typeof e[1] === "number")
    .sort((a, b) => a[1] - b[1]);
  for (let i = perioder.length - 1; i >= 0; i--) {
    const [periode, pos] = perioder[i];
    const v = ds.value[pos];
    const maaned = formatPeriode(periode);
    if (typeof v === "number" && Number.isFinite(v) && v > -20 && v < 50 && maaned) {
      return { pct: v, periode, maaned };
    }
  }
  return null;
}

/** Fetches the latest annual inflation. Returns null on any failure (callers keep their default). */
export async function hentInflation(): Promise<Inflation | null> {
  try {
    const res = await fetch(STATBANK_INFLATION_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return parseStatbankInflation(await res.json());
  } catch {
    return null;
  }
}
