/**
 * Helpers for editing a parent's list of periods week by week.
 *
 * Periods are stored as compact runs; editing expands them into a week map,
 * changes the requested weeks and compresses them back into sorted,
 * non-overlapping runs.
 */

import type { Periode, UgeType } from "./types";

export interface UgeCelle {
  type: UgeType;
  arbejdsProcent?: number;
}

export type UgeKort = Map<number, UgeCelle>;

export const MIN_UGE = -4;
/** Planning horizon: until the child is well past 2 years old. */
export const MAX_UGE = 120;

export function udvid(perioder: Periode[]): UgeKort {
  const map: UgeKort = new Map();
  for (const p of perioder) {
    const start = Math.max(MIN_UGE, Math.floor(p.start));
    const slut = Math.min(MAX_UGE, Math.floor(p.slut));
    for (let w = start; w < slut; w++) {
      map.set(
        w,
        p.type === "deltid"
          ? { type: "deltid", arbejdsProcent: normaliserProcent(p.arbejdsProcent) }
          : { type: p.type }
      );
    }
  }
  return map;
}

export function normaliserProcent(value: number | undefined): number {
  const n = Number.isFinite(value) ? Math.round(value as number) : 50;
  return Math.min(90, Math.max(10, n));
}

function sammeCelle(a: UgeCelle, b: UgeCelle): boolean {
  return a.type === b.type && (a.arbejdsProcent ?? 0) === (b.arbejdsProcent ?? 0);
}

export function komprimer(map: UgeKort): Periode[] {
  const weeks = [...map.keys()].sort((a, b) => a - b);
  const result: Periode[] = [];
  for (const w of weeks) {
    const cell = map.get(w)!;
    const last = result[result.length - 1];
    if (
      last &&
      last.slut === w &&
      sammeCelle({ type: last.type, arbejdsProcent: last.arbejdsProcent }, cell)
    ) {
      last.slut = w + 1;
    } else {
      result.push({
        start: w,
        slut: w + 1,
        type: cell.type,
        ...(cell.type === "deltid" ? { arbejdsProcent: cell.arbejdsProcent } : {}),
      });
    }
  }
  return result;
}

/** Set (or clear, when `celle` is null) the weeks [start, slut). */
export function saetUger(
  perioder: Periode[],
  start: number,
  slut: number,
  celle: UgeCelle | null
): Periode[] {
  const map = udvid(perioder);
  const from = Math.max(MIN_UGE, Math.min(start, slut));
  const to = Math.min(MAX_UGE, Math.max(start, slut));
  for (let w = from; w < to; w++) {
    if (celle) map.set(w, celle.type === "deltid" ? { type: "deltid", arbejdsProcent: normaliserProcent(celle.arbejdsProcent) } : { type: celle.type });
    else map.delete(w);
  }
  return komprimer(map);
}

export function celleFor(perioder: Periode[], uge: number): UgeCelle | null {
  for (const p of perioder) {
    if (uge >= p.start && uge < p.slut) {
      return p.type === "deltid"
        ? { type: "deltid", arbejdsProcent: normaliserProcent(p.arbejdsProcent) }
        : { type: p.type };
    }
  }
  return null;
}

/** Share of a full leave week consumed by the cell (0 for work and holiday). */
export function orlovsandel(celle: UgeCelle | null | undefined): number {
  if (!celle) return 0;
  if (celle.type === "orlov") return 1;
  if (celle.type === "deltid") return (100 - normaliserProcent(celle.arbejdsProcent)) / 100;
  return 0;
}
