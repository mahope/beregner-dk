import type { Kategori } from "@/lib/barsel/types";

/** Tailwind classes per category (background of a filled week/day). */
export const KATEGORI_BG: Record<Kategori, string> = {
  graviditet: "bg-violet-400 dark:bg-violet-500",
  oeremaerket: "bg-amber-500 dark:bg-amber-400",
  egen: "bg-sky-500 dark:bg-sky-400",
  overfoert: "bg-teal-600 dark:bg-teal-400",
  ferie: "bg-emerald-400 dark:bg-emerald-500",
  arbejde: "bg-gray-100 dark:bg-gray-700",
  udskudt: "bg-fuchsia-500 dark:bg-fuchsia-400",
  "uden-ret": "bg-red-500 dark:bg-red-400",
};

export const KATEGORI_TEKST: Record<Kategori, string> = {
  graviditet: "Graviditetsorlov",
  oeremaerket: "Øremærket",
  egen: "Egne uger (delbare)",
  overfoert: "Overført",
  ferie: "Ferie",
  arbejde: "Arbejde",
  udskudt: "Udskudt",
  "uden-ret": "Uden dagpenge",
};

export const KATEGORI_KORT: Record<Kategori, string> = {
  graviditet: "Graviditet",
  oeremaerket: "Øremærket",
  egen: "Egne",
  overfoert: "Overført",
  ferie: "Ferie",
  arbejde: "Arbejde",
  udskudt: "Udskudt",
  "uden-ret": "Uden dagpenge",
};

export const LEGEND: Kategori[] = [
  "graviditet",
  "oeremaerket",
  "egen",
  "overfoert",
  "ferie",
  "uden-ret",
  "arbejde",
];

/** Accent per person row (A/B) for names and borders. */
export const PERSON_ACCENT = [
  "text-rose-700 dark:text-rose-300",
  "text-blue-700 dark:text-blue-300",
] as const;

export const PERSON_DOT = ["bg-rose-500", "bg-blue-600"] as const;

export const kr = (n: number) =>
  `${Math.round(n).toLocaleString("da-DK")} kr.`;

export const tal = (n: number, decimals = 0) =>
  n.toLocaleString("da-DK", { minimumFractionDigits: 0, maximumFractionDigits: decimals });
