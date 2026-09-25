/**
 * PVGIS (EU JRC) parsing and the solar-panel economics used by /solceller.
 */

export const PVGIS_VERSION = "v5_3";

/** Roof orientations and their PVGIS aspect (0 = south, -90 = east, 90 = west). */
export const PVGIS_ASPEKT = {
  syd: 0,
  sydvest: 45,
  sydoest: -45,
  vest: 90,
  oest: -90,
} as const;

export type PvgisRetning = keyof typeof PVGIS_ASPEKT;

export const HAELDNINGER = [0, 15, 25, 35, 45, 60] as const;

export type PvgisResultat = {
  /** Yearly production for 1 kWp in kWh. */
  kwhPrKwp: number;
  /** Monthly production for 1 kWp in kWh (Jan..Dec). */
  maaneder: number[];
};

/** Parse a PVcalc JSON response (peakpower=1). Throws on an unexpected shape. */
export function parsePvgis(json: unknown): PvgisResultat {
  const outputs = (json as { outputs?: Record<string, any> })?.outputs;
  const ey = outputs?.totals?.fixed?.E_y;
  if (typeof ey !== "number" || !Number.isFinite(ey) || ey <= 0) {
    throw new Error("PVGIS: missing outputs.totals.fixed.E_y");
  }
  const monthly: unknown = outputs?.monthly?.fixed;
  const maaneder = Array.isArray(monthly)
    ? monthly
        .slice()
        .sort((a, b) => (a?.month ?? 0) - (b?.month ?? 0))
        .map((m) => (typeof m?.E_m === "number" ? m.E_m : 0))
    : [];
  return { kwhPrKwp: ey, maaneder };
}

export function buildPvgisUrl(p: { lat: number; lon: number; angle: number; aspect: number }): string {
  const q = new URLSearchParams({
    lat: String(p.lat),
    lon: String(p.lon),
    peakpower: "1",
    loss: "14",
    angle: String(p.angle),
    aspect: String(p.aspect),
    mountingplace: "building",
    outputformat: "json",
  });
  return `https://re.jrc.ec.europa.eu/api/${PVGIS_VERSION}/PVcalc?${q.toString()}`;
}

export type SolOekonomiInput = {
  /** Yearly production in kWh. */
  produktion: number;
  /** Yearly household consumption in kWh (caps self-consumption). */
  forbrug: number;
  /** Share of production used in the home, 0-1. */
  egetforbrugAndel: number;
  /** Price paid for bought electricity, kr/kWh incl. everything. */
  koebspris: number;
  /** Price received for surplus sold to the grid, kr/kWh. */
  salgspris: number;
  anlaegspris: number;
};

export type SolOekonomi = {
  egetforbrug: number;
  overskud: number;
  vaerdiEget: number;
  vaerdiOverskud: number;
  aarligVaerdi: number;
  /** Years until the investment is paid back, or null if it never is. */
  tilbagebetalingsAar: number | null;
};

export function solOekonomi(i: SolOekonomiInput): SolOekonomi {
  const andel = Math.min(1, Math.max(0, i.egetforbrugAndel));
  const produktion = Math.max(0, i.produktion);
  const egetforbrug = Math.min(produktion * andel, Math.max(0, i.forbrug));
  const overskud = produktion - egetforbrug;
  const vaerdiEget = egetforbrug * i.koebspris;
  const vaerdiOverskud = overskud * i.salgspris;
  const aarligVaerdi = vaerdiEget + vaerdiOverskud;
  return {
    egetforbrug,
    overskud,
    vaerdiEget,
    vaerdiOverskud,
    aarligVaerdi,
    tilbagebetalingsAar: aarligVaerdi > 0 && i.anlaegspris > 0 ? i.anlaegspris / aarligVaerdi : null,
  };
}
