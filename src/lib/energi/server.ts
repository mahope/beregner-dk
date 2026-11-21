/**
 * Server-side fetching of Energi Data Service and PVGIS data with caching,
 * timeouts and fallback. Every public function returns null instead of
 * throwing, so the calculators keep working if an API is down.
 */
import { unstable_cache } from "next/cache";
import {
  addDays,
  average,
  type DagPriser,
  dkNu,
  ENERGINET_CODES,
  ENERGINET_GLN,
  NETSELSKABER,
  PRICE_AREAS,
  type PriceArea,
  parseDatahubTariffs,
  parseDayAheadPrices,
  prisForTime,
  standardTariffer,
  type Tariffer,
  toHourlySpot,
} from "./elpriser";
import { buildPvgisUrl, type PvgisResultat, parsePvgis } from "./solceller";

const EDS = "https://api.energidataservice.dk/dataset";

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

function edsUrl(dataset: string, params: Record<string, string>): string {
  return `${EDS}/${dataset}?${new URLSearchParams(params).toString()}`;
}

// ─── Spot prices + tariffs ────────────────────────────────────────────────

export type ElprisOmraade = { tariffer: Tariffer; dage: DagPriser[] };

export type ElprisData = {
  /** ISO timestamp of the actual API fetch. */
  hentet: string;
  /** Today's date in Danish time (YYYY-MM-DD). */
  idag: string;
  omraader: Record<PriceArea, ElprisOmraade>;
};

async function hentElpriser(idag: string): Promise<ElprisData> {
  const imorgen = addDays(idag, 1);
  const spotReq = fetchJson(
    edsUrl("DayAheadPrices", {
      start: idag,
      end: addDays(idag, 2),
      filter: JSON.stringify({ PriceArea: PRICE_AREAS }),
      columns: "TimeDK,PriceArea,DayAheadPriceDKK",
      sort: "TimeDK asc",
      limit: "0",
    }),
    5000,
  );
  const tariffReq = fetchJson(
    edsUrl("DatahubPricelist", {
      start: addDays(idag, -400),
      filter: JSON.stringify({
        GLN_Number: [...PRICE_AREAS.map((a) => NETSELSKABER[a].gln), ENERGINET_GLN],
        ChargeTypeCode: [...PRICE_AREAS.map((a) => NETSELSKABER[a].code), ...Object.values(ENERGINET_CODES)],
      }),
      limit: "0",
    }),
    5000,
  ).catch((err) => {
    console.warn("[energi] DatahubPricelist failed, using standard tariffs:", String(err));
    return null;
  });

  const [spotJson, tariffJson] = await Promise.all([spotReq, tariffReq]);
  const records = parseDayAheadPrices(spotJson);

  const omraader = {} as Record<PriceArea, ElprisOmraade>;
  for (const area of PRICE_AREAS) {
    const hourly = toHourlySpot(records, area);
    const dage: DagPriser[] = [];
    let tariffer = standardTariffer(area);
    for (const date of [idag, imorgen]) {
      const spots = hourly.get(date);
      if (!spots || spots.length === 0) continue;
      const t = (tariffJson ? parseDatahubTariffs(tariffJson, area, date) : null) ?? standardTariffer(area);
      if (date === idag) tariffer = t;
      dage.push({ date, hours: spots.map((s) => prisForTime(s.spot, s.hour, t)) });
    }
    if (!dage.some((d) => d.date === idag)) throw new Error(`No spot prices for ${area} ${idag}`);
    omraader[area] = { tariffer, dage };
  }
  return { hentet: new Date().toISOString(), idag, omraader };
}

/**
 * Today's and (after ~13:00) tomorrow's prices for DK1 and DK2. Cached for
 * 15 minutes per Danish date; returns null if the API is unreachable.
 */
export async function getElprisData(): Promise<ElprisData | null> {
  const idag = dkNu().date;
  try {
    return await unstable_cache(() => hentElpriser(idag), ["energi-elpriser-v1", idag], {
      revalidate: 900,
      tags: ["energi-elpriser"],
    })();
  } catch (err) {
    console.warn("[energi] spot prices unavailable, falling back:", String(err));
    return null;
  }
}

// ─── 12-month average spot price ──────────────────────────────────────────

export type SpotGennemsnit = {
  hentet: string;
  fra: string;
  til: string;
  /** Average spot price kr/kWh excl. VAT per area. */
  omraader: Record<PriceArea, number>;
};

async function hentSpotGennemsnit(idag: string): Promise<SpotGennemsnit> {
  const fra = addDays(idag, -365);
  const results = await Promise.all(
    PRICE_AREAS.map(async (area) => {
      const json = await fetchJson(
        edsUrl("DayAheadPrices", {
          start: fra,
          end: idag,
          filter: JSON.stringify({ PriceArea: [area] }),
          columns: "DayAheadPriceDKK",
          limit: "0",
        }),
        10000,
      );
      const rows = (json as { records?: { DayAheadPriceDKK?: unknown }[] })?.records;
      if (!Array.isArray(rows)) throw new Error("DayAheadPrices: missing records");
      const values = rows.map((r) => r.DayAheadPriceDKK).filter((v): v is number => typeof v === "number");
      // Require roughly 10 months of quarter-hour data before trusting the average.
      if (values.length < 96 * 300) throw new Error(`Too little data for ${area}: ${values.length}`);
      return [area, average(values) / 1000] as const;
    }),
  );
  return {
    hentet: new Date().toISOString(),
    fra,
    til: idag,
    omraader: Object.fromEntries(results) as Record<PriceArea, number>,
  };
}

/** Average spot price over the last 12 months, cached for a day. */
export async function getSpotGennemsnit12Mdr(): Promise<SpotGennemsnit | null> {
  const idag = dkNu().date;
  try {
    return await unstable_cache(() => hentSpotGennemsnit(idag), ["energi-spot-12m-v1", idag], {
      revalidate: 86400,
    })();
  } catch (err) {
    console.warn("[energi] 12-month spot average unavailable:", String(err));
    return null;
  }
}

// ─── PVGIS ────────────────────────────────────────────────────────────────

export type PvgisData = PvgisResultat & { hentet: string };

/** Yearly production for 1 kWp from PVGIS. Cached for 30 days per rounded coordinate. */
export async function getPvgis(p: { lat: number; lon: number; angle: number; aspect: number }): Promise<PvgisData | null> {
  const lat = Math.round(p.lat * 10) / 10;
  const lon = Math.round(p.lon * 10) / 10;
  const angle = Math.round(p.angle);
  const aspect = Math.round(p.aspect);
  try {
    return await unstable_cache(
      async () => {
        const json = await fetchJson(buildPvgisUrl({ lat, lon, angle, aspect }), 10000);
        return { ...parsePvgis(json), hentet: new Date().toISOString() };
      },
      ["energi-pvgis-v1", String(lat), String(lon), String(angle), String(aspect)],
      { revalidate: 60 * 60 * 24 * 30 },
    )();
  } catch (err) {
    console.warn("[energi] PVGIS unavailable:", String(err));
    return null;
  }
}
