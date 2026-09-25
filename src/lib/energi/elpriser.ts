/**
 * Danish electricity prices: parsing of Energi Data Service responses and the
 * pure price math used by /elberegner, /elbil and /solceller.
 *
 * All prices are kr/kWh. Spot, tariffs and elafgift are excl. VAT; `total`
 * is incl. 25% VAT, which is what households pay (excl. supplier markup).
 */

export type PriceArea = "DK1" | "DK2";
export const PRICE_AREAS: PriceArea[] = ["DK1", "DK2"];

export const MOMS_SATS = 0.25;

/**
 * Standard values used when DatahubPricelist cannot be fetched. Energinet's
 * tariffs and elafgift are the 2026 rates (DatahubPricelist, GLN 5790000432752;
 * elafgift 0,8 øre/kWh for 2026-2027 per Den juridiske vejledning E.A.4.3.6.1).
 * The flat net tariff is an approximate yearly average for a C customer
 * (N1/Radius time-of-use tariffs 2026 average roughly 0,15-0,37 kr/kWh).
 */
export const STANDARD_TARIFFER = {
  nettarif: 0.25,
  transmission: 0.043,
  system: 0.072,
  elafgift: 0.008,
} as const;

/** Fallback spot price (kr/kWh excl. VAT) when no 12-month average is available. */
export const STANDARD_SPOTPRIS = 0.75;

/** The net company used as reference tariff for each price area. */
export const NETSELSKABER: Record<PriceArea, { name: string; gln: string; code: string }> = {
  DK1: { name: "N1", gln: "5790001089030", code: "CD" },
  DK2: { name: "Radius", gln: "5790000705689", code: "DT_C_01" },
};

export const ENERGINET_GLN = "5790000432752";
export const ENERGINET_CODES = { transmission: "40000", system: "41000", elafgift: "EA-001" } as const;

export const KILDER = {
  energidataservice: "https://www.energidataservice.dk/tso-electricity/DayAheadPrices",
  datahubPricelist: "https://www.energidataservice.dk/tso-electricity/DatahubPricelist",
  elafgift: "https://info.skat.dk/data.aspx?oid=2061620",
  pvgis: "https://re.jrc.ec.europa.eu/pvg_tools/en/",
} as const;

// ─── Spot prices ──────────────────────────────────────────────────────────

export type SpotRecord = { timeDk: string; area: string; dkkPerMwh: number };

/** Parse a DayAheadPrices response. Invalid rows are skipped; a non-dataset body throws. */
export function parseDayAheadPrices(json: unknown): SpotRecord[] {
  const records = (json as { records?: unknown })?.records;
  if (!Array.isArray(records)) throw new Error("DayAheadPrices: missing records");
  const out: SpotRecord[] = [];
  for (const r of records as Record<string, unknown>[]) {
    const timeDk = r?.TimeDK;
    const area = r?.PriceArea;
    const price = r?.DayAheadPriceDKK;
    if (typeof timeDk !== "string" || typeof area !== "string") continue;
    if (typeof price !== "number" || !Number.isFinite(price)) continue;
    out.push({ timeDk, area, dkkPerMwh: price });
  }
  return out;
}

export type HourSpot = { date: string; hour: number; spot: number };

/** Average quarter-hour prices into hourly kr/kWh values for one area, grouped by DK date. */
export function toHourlySpot(records: SpotRecord[], area: string): Map<string, HourSpot[]> {
  const sums = new Map<string, { sum: number; n: number }>();
  for (const r of records) {
    if (r.area !== area) continue;
    const key = r.timeDk.slice(0, 13); // YYYY-MM-DDTHH
    const s = sums.get(key) ?? { sum: 0, n: 0 };
    s.sum += r.dkkPerMwh;
    s.n += 1;
    sums.set(key, s);
  }
  const byDate = new Map<string, HourSpot[]>();
  for (const [key, { sum, n }] of [...sums.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const date = key.slice(0, 10);
    const hour = Number(key.slice(11, 13));
    const list = byDate.get(date) ?? [];
    list.push({ date, hour, spot: sum / n / 1000 });
    byDate.set(date, list);
  }
  return byDate;
}

// ─── Tariffs ──────────────────────────────────────────────────────────────

export type Tariffer = {
  kilde: "live" | "standard";
  netselskab: string;
  /** Net tariff per hour of day (index 0 = 00-01), kr/kWh excl. VAT. */
  nettarif: number[];
  transmission: number;
  system: number;
  elafgift: number;
};

export function standardTariffer(area: PriceArea): Tariffer {
  return {
    kilde: "standard",
    netselskab: NETSELSKABER[area].name,
    nettarif: Array(24).fill(STANDARD_TARIFFER.nettarif),
    transmission: STANDARD_TARIFFER.transmission,
    system: STANDARD_TARIFFER.system,
    elafgift: STANDARD_TARIFFER.elafgift,
  };
}

type PricelistRow = Record<string, unknown>;

function isValidOn(row: PricelistRow, date: string): boolean {
  const from = typeof row.ValidFrom === "string" ? row.ValidFrom.slice(0, 10) : null;
  const to = typeof row.ValidTo === "string" ? row.ValidTo.slice(0, 10) : null;
  if (!from || from > date) return false;
  return to === null || date < to;
}

function findRow(rows: PricelistRow[], gln: string, code: string, date: string, hourly: boolean) {
  return rows.find(
    (r) =>
      r.GLN_Number === gln &&
      r.ChargeTypeCode === code &&
      isValidOn(r, date) &&
      (hourly ? r.ResolutionDuration === "PT1H" : true) &&
      typeof r.Price1 === "number",
  );
}

/**
 * Pick the tariffs valid on `date` (YYYY-MM-DD, DK time) for a price area.
 * Returns null if any component is missing, so the caller can fall back.
 */
export function parseDatahubTariffs(json: unknown, area: PriceArea, date: string): Tariffer | null {
  const rows = (json as { records?: unknown })?.records;
  if (!Array.isArray(rows)) return null;
  const net = NETSELSKABER[area];
  const netRow = findRow(rows, net.gln, net.code, date, true);
  const tr = findRow(rows, ENERGINET_GLN, ENERGINET_CODES.transmission, date, false);
  const sys = findRow(rows, ENERGINET_GLN, ENERGINET_CODES.system, date, false);
  const afg = findRow(rows, ENERGINET_GLN, ENERGINET_CODES.elafgift, date, false);
  if (!netRow || !tr || !sys || !afg) return null;

  // Price1..Price24 = hours 00-23. Missing slots fall back to Price1 (a flat tariff).
  const p1 = netRow.Price1 as number;
  const nettarif = Array.from({ length: 24 }, (_, i) => {
    const v = netRow[`Price${i + 1}`];
    return typeof v === "number" && Number.isFinite(v) ? v : p1;
  });
  return {
    kilde: "live",
    netselskab: net.name,
    nettarif,
    transmission: tr.Price1 as number,
    system: sys.Price1 as number,
    elafgift: afg.Price1 as number,
  };
}

// ─── Price math ───────────────────────────────────────────────────────────

export type HourTotal = {
  hour: number;
  spot: number;
  nettarif: number;
  energinet: number;
  elafgift: number;
  moms: number;
  total: number;
};

/** Full consumer price for one hour: (spot + net tariff + Energinet + elafgift) × 1,25. */
export function prisForTime(spot: number, hour: number, t: Tariffer): HourTotal {
  const nettarif = t.nettarif[hour] ?? t.nettarif[0];
  const energinet = t.transmission + t.system;
  const exMoms = spot + nettarif + energinet + t.elafgift;
  const moms = exMoms * MOMS_SATS;
  return { hour, spot, nettarif, energinet, elafgift: t.elafgift, moms, total: exMoms + moms };
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/** Average price components over a set of hours (e.g. a whole day). */
export function gennemsnitsPris(hours: HourTotal[]): Omit<HourTotal, "hour"> {
  return {
    spot: average(hours.map((h) => h.spot)),
    nettarif: average(hours.map((h) => h.nettarif)),
    energinet: average(hours.map((h) => h.energinet)),
    elafgift: average(hours.map((h) => h.elafgift)),
    moms: average(hours.map((h) => h.moms)),
    total: average(hours.map((h) => h.total)),
  };
}

/** Indices of the `n` cheapest values (ties broken by earliest index). */
export function billigsteIndekser(values: number[], n: number): Set<number> {
  return new Set(
    values
      .map((v, i) => ({ v, i }))
      .sort((a, b) => a.v - b.v || a.i - b.i)
      .slice(0, Math.max(0, n))
      .map((x) => x.i),
  );
}

/**
 * Cheapest contiguous window of `length` values. Returns the start index and
 * the window average, or null if there are fewer than `length` values.
 * Ties go to the earliest window.
 */
export function billigsteVindue(values: number[], length: number): { start: number; gennemsnit: number } | null {
  if (length <= 0 || values.length < length) return null;
  let sum = 0;
  for (let i = 0; i < length; i++) sum += values[i];
  let best = sum;
  let bestStart = 0;
  for (let i = length; i < values.length; i++) {
    sum += values[i] - values[i - length];
    if (sum < best - 1e-12) {
      best = sum;
      bestStart = i - length + 1;
    }
  }
  return { start: bestStart, gennemsnit: best / length };
}

export type DagPriser = { date: string; hours: HourTotal[] };

export type LadeVindue = {
  startDate: string;
  startHour: number;
  slutDate: string;
  slutHour: number;
  gennemsnit: number;
  /** True if tomorrow's prices were not available and the window may be incomplete. */
  kunIDag: boolean;
};

/**
 * Cheapest `length` contiguous hours "tonight": from 18:00 today (or the
 * current hour if later) until 08:00 the next morning. Before 08:00 the
 * current night is used instead. Only hours with known prices are considered.
 */
export function billigsteNatVindue(
  days: DagPriser[],
  now: { date: string; hour: number },
  length = 4,
): LadeVindue | null {
  const flat = days.flatMap((d) => d.hours.map((h) => ({ date: d.date, hour: h.hour, total: h.total })));
  const key = (date: string, hour: number) => `${date}T${String(hour).padStart(2, "0")}`;
  let fromKey: string;
  let toKey: string;
  if (now.hour < 8) {
    fromKey = key(now.date, now.hour);
    toKey = key(now.date, 8);
  } else {
    fromKey = key(now.date, Math.max(18, now.hour));
    toKey = key(addDays(now.date, 1), 8);
  }
  const window = flat.filter((h) => {
    const k = key(h.date, h.hour);
    return k >= fromKey && k < toKey;
  });
  const res = billigsteVindue(window.map((h) => h.total), length);
  if (!res) return null;
  const first = window[res.start];
  const last = window[res.start + length - 1];
  const slutHour = (last.hour + 1) % 24;
  const slutDate = last.hour === 23 ? addDays(last.date, 1) : last.date;
  const hasTomorrow = days.some((d) => d.date === addDays(now.date, 1) && d.hours.length > 0);
  return {
    startDate: first.date,
    startHour: first.hour,
    slutDate,
    slutHour,
    gennemsnit: res.gennemsnit,
    kunIDag: now.hour >= 8 && !hasTomorrow,
  };
}

// ─── Danish time helpers ──────────────────────────────────────────────────

/** Date (YYYY-MM-DD), hour and minute in Europe/Copenhagen for an instant. */
export function dkNu(d: Date = new Date()): { date: string; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Copenhagen",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** "HH:MM" in Danish time for an ISO timestamp. */
export function formatKlokkeslaet(iso: string): string {
  const { hour, minute } = dkNu(new Date(iso));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Price area from a Danish postal code: Zealand, islands and Bornholm are DK2, Funen and Jutland DK1. */
export function prisomraadeForPostnummer(postnr: string): PriceArea | null {
  if (!/^\d{4}$/.test(postnr)) return null;
  return Number(postnr) < 5000 ? "DK2" : "DK1";
}
