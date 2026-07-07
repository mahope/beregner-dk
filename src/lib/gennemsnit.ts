/**
 * Parse a free-text list of numbers and compute basic statistics
 * (count, sum, mean, median, min, max).
 *
 * Numbers may be separated by commas, spaces, semicolons or newlines, and a
 * comma is accepted as a decimal separator when it is not used as a list
 * separator (Danish/Swedish users type "3,5").
 */

export interface Statistik {
  antal: number;
  sum: number;
  gennemsnit: number;
  median: number;
  min: number;
  max: number;
}

export function parseTal(input: string): number[] {
  if (!input) return [];
  // Split on newlines, semicolons, commas followed by whitespace, or whitespace.
  // Keep a lone comma between digits as a decimal separator.
  const normalised = input
    .replace(/(\d),(\d)/g, "$1DECIMAL$2") // protect decimal commas
    .replace(/[;,]/g, " ")
    .replace(/DECIMAL/g, ".");
  return normalised
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((n) => !Number.isNaN(n));
}

export function beregnStatistik(tal: number[]): Statistik | null {
  if (!tal || tal.length === 0) return null;

  const sorted = [...tal].sort((a, b) => a - b);
  const sum = tal.reduce((acc, n) => acc + n, 0);
  const antal = tal.length;

  const mid = Math.floor(antal / 2);
  const median =
    antal % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  return {
    antal,
    sum,
    gennemsnit: sum / antal,
    median,
    min: sorted[0],
    max: sorted[antal - 1],
  };
}
