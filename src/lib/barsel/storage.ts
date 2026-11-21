/**
 * Versioned localStorage persistence for the planner.
 *
 * Everything stays in the browser. Every read and write is wrapped in
 * try/catch because storage can be disabled, full or throw in private mode.
 */

import { isIsoDate } from "./dato";
import { normaliserProcent } from "./perioder";
import type {
  Beskaeftigelse,
  BarselsPlan,
  DatoType,
  Foraelder,
  ForaelderId,
  Konstellation,
  LoenSegment,
  Periode,
  UgeType,
} from "./types";

export const STORAGE_KEY = "minberegner:barselsplan";
export const SCHEMA_VERSION = 1;

export interface GemtData {
  v: number;
  gemt: string;
  plan: BarselsPlan;
}

const KONSTELLATIONER: Konstellation[] = [
  "mor-far",
  "mor-medmor",
  "to-foraeldre",
  "solo",
  "adoption-par",
  "adoption-solo",
];
const BESKAEFTIGELSER: Beskaeftigelse[] = ["loenmodtager", "selvstaendig", "ledig", "studerende"];
const UGETYPER: UgeType[] = ["orlov", "deltid", "ferie"];

const tal = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const tekst = (value: unknown, fallback: string, maxLength = 40): string =>
  typeof value === "string" ? value.slice(0, maxLength) : fallback;

function saniterPerioder(value: unknown): Periode[] {
  if (!Array.isArray(value)) return [];
  const result: Periode[] = [];
  for (const raw of value.slice(0, 200)) {
    if (!raw || typeof raw !== "object") continue;
    const p = raw as Record<string, unknown>;
    const type = UGETYPER.includes(p.type as UgeType) ? (p.type as UgeType) : null;
    const start = Math.round(tal(p.start, Number.NaN, -4, 120));
    const slut = Math.round(tal(p.slut, Number.NaN, -4, 120));
    if (!type || !Number.isFinite(start) || !Number.isFinite(slut) || slut <= start) continue;
    result.push(
      type === "deltid"
        ? { start, slut, type, arbejdsProcent: normaliserProcent(p.arbejdsProcent as number) }
        : { start, slut, type }
    );
  }
  return result.sort((a, b) => a.start - b.start);
}

function saniterSegmenter(value: unknown): LoenSegment[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 4)
    .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
    .map((s) => ({
      uger: Math.round(tal(s.uger, 0, 0, 60)),
      procent: Math.round(tal(s.procent, 100, 0, 100)),
    }));
}

function saniterForaelder(raw: unknown, fallback: Foraelder): Foraelder {
  if (!raw || typeof raw !== "object") return fallback;
  const f = raw as Record<string, unknown>;
  return {
    id: fallback.id,
    navn: tekst(f.navn, fallback.navn),
    beskaeftigelse: BESKAEFTIGELSER.includes(f.beskaeftigelse as Beskaeftigelse)
      ? (f.beskaeftigelse as Beskaeftigelse)
      : fallback.beskaeftigelse,
    maanedsloen: tal(f.maanedsloen, fallback.maanedsloen, 0, 500_000),
    ugentligeTimer: tal(f.ugentligeTimer, fallback.ugentligeTimer, 1, 60),
    loenUnderBarsel: saniterSegmenter(f.loenUnderBarsel),
    ydelseMaaned: tal(f.ydelseMaaned, fallback.ydelseMaaned, 0, 100_000),
    udskudteUger: Math.round(tal(f.udskudteUger, 0, 0, 52)),
    perioder: saniterPerioder(f.perioder),
  };
}

/**
 * Turn anything (old schema, partial data, hand-edited JSON) into a valid
 * plan, falling back field by field to `fallback`.
 */
export function saniterPlan(raw: unknown, fallback: BarselsPlan): BarselsPlan {
  if (!raw || typeof raw !== "object") return fallback;
  const p = raw as Record<string, unknown>;
  const konstellation = KONSTELLATIONER.includes(p.konstellation as Konstellation)
    ? (p.konstellation as Konstellation)
    : fallback.konstellation;
  const naertstaaende = konstellation === "solo" && p.naertstaaende === true;
  const antalForaeldre =
    konstellation === "adoption-solo" || (konstellation === "solo" && !naertstaaende) ? 1 : 2;
  const rawForaeldre = Array.isArray(p.foraeldre) ? p.foraeldre : [];
  const ids: ForaelderId[] = ["a", "b"];
  const foraeldre = ids.slice(0, antalForaeldre).map((id, i) => {
    const fb =
      fallback.foraeldre[i] ??
      ({ ...fallback.foraeldre[0], id, navn: i === 0 ? "Forælder 1" : "Forælder 2", perioder: [] } as Foraelder);
    return saniterForaelder(rawForaeldre[i], { ...fb, id });
  });
  const antal = Math.round(tal(p.antalBoern, 1, 1, 4)) as 1 | 2 | 3 | 4;
  return {
    konstellation,
    datoType: (p.datoType === "foedsel" || p.datoType === "termin"
      ? p.datoType
      : fallback.datoType) as DatoType,
    dato: isIsoDate(p.dato) ? p.dato : fallback.dato,
    antalBoern: antal,
    adoptionUdland: p.adoptionUdland === true,
    naertstaaende,
    indlaeggelsesUger: Math.round(tal(p.indlaeggelsesUger, 0, 0, 52)),
    kommuneskatPct: tal(p.kommuneskatPct, fallback.kommuneskatPct, 20, 30),
    foraeldre,
  };
}

export type Migrering = (data: Record<string, unknown>) => Record<string, unknown>;

/**
 * Migrations keyed by the version they upgrade FROM. Each returns data in the
 * next version's shape. Version 0 is a bare plan without the envelope (that is
 * also what a share link contains).
 */
export const MIGRERINGER: Record<number, Migrering> = {
  0: (bare) => ({ v: 1, gemt: new Date(0).toISOString(), plan: bare }),
};

/**
 * Migrate stored data of any known version to the current schema and
 * sanitise it. Returns null for unknown future versions (never guess at
 * newer data) or when a migration step is missing.
 */
export function migrer(
  raw: unknown,
  fallback: BarselsPlan,
  migreringer: Record<number, Migrering> = MIGRERINGER,
  maalVersion: number = SCHEMA_VERSION
): BarselsPlan | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  let data = raw as Record<string, unknown>;
  let version = typeof data.v === "number" && "plan" in data ? data.v : 0;
  if (!Number.isInteger(version) || version > maalVersion) return null;
  while (version < maalVersion) {
    const step = migreringer[version];
    if (!step) return null;
    data = step(data);
    const next = typeof data.v === "number" ? data.v : Number.NaN;
    if (!(next > version)) return null;
    version = next;
  }
  return saniterPlan(data.plan, fallback);
}

export function indlaesPlan(fallback: BarselsPlan, storage?: Storage | null): BarselsPlan | null {
  try {
    const store = storage ?? (typeof window !== "undefined" ? window.localStorage : null);
    if (!store) return null;
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrer(JSON.parse(raw), fallback);
  } catch {
    return null;
  }
}

export function gemPlan(plan: BarselsPlan, storage?: Storage | null, now: Date = new Date()): boolean {
  try {
    const store = storage ?? (typeof window !== "undefined" ? window.localStorage : null);
    if (!store) return false;
    const data: GemtData = { v: SCHEMA_VERSION, gemt: now.toISOString(), plan };
    store.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function sletPlan(storage?: Storage | null): boolean {
  try {
    const store = storage ?? (typeof window !== "undefined" ? window.localStorage : null);
    if (!store) return false;
    store.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
