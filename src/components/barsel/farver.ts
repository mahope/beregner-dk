import type { Foraelder, Kategori } from "@/lib/barsel/types";
import { nyForaelder } from "@/lib/barsel/skabeloner";

/**
 * Colour system: one hue per person. Weeks that only this person can use
 * (pregnancy leave and earmarked weeks) are striped, shareable weeks are solid,
 * and weeks transferred from the other parent are a light tint of the same hue.
 */
const PERSON_FYLDT = ["bg-pink-600 dark:bg-pink-400", "bg-blue-700 dark:bg-blue-400"] as const;
const PERSON_LYS = ["bg-pink-300 dark:bg-pink-800", "bg-blue-300 dark:bg-blue-800"] as const;

export const FERIE_BG = "bg-gray-400 dark:bg-gray-500";
export const UDEN_RET_BG = "bg-amber-500 dark:bg-amber-400";

/** Tailwind classes for a filled week/day for the given person (0 or 1). */
export function ugeFarve(kat: Kategori, person: number): string {
  const p = person > 0 ? 1 : 0;
  switch (kat) {
    case "graviditet":
    case "oeremaerket":
      return `${PERSON_FYLDT[p]} barsel-stribet`;
    case "egen":
    case "udskudt":
      return PERSON_FYLDT[p];
    case "overfoert":
      return PERSON_LYS[p];
    case "ferie":
      return FERIE_BG;
    case "uden-ret":
      return UDEN_RET_BG;
    case "arbejde":
      return "";
  }
}

export const KATEGORI_TEKST: Record<Kategori, string> = {
  graviditet: "Graviditetsorlov",
  oeremaerket: "Øremærket",
  egen: "Delbare uger",
  overfoert: "Overført",
  ferie: "Ferie",
  arbejde: "Arbejde",
  udskudt: "Udskudt",
  "uden-ret": "Uden barselsdagpenge",
};

export type ForklaringId = "kun-dig" | "delbar" | "overfoert" | "ferie" | "uden-ret";

/** The legend: five entries, drawn in a neutral colour (the hue belongs to the person). */
export const FORKLARING: { id: ForklaringId; tekst: string; swatch: string }[] = [
  { id: "kun-dig", tekst: "Graviditetsorlov og øremærkede uger", swatch: "bg-gray-700 dark:bg-gray-300 barsel-stribet" },
  { id: "delbar", tekst: "Delbare uger", swatch: "bg-gray-700 dark:bg-gray-300" },
  { id: "overfoert", tekst: "Overført fra den anden", swatch: "bg-gray-300 dark:bg-gray-600" },
  { id: "ferie", tekst: "Ferie", swatch: FERIE_BG },
  { id: "uden-ret", tekst: "Uden barselsdagpenge", swatch: UDEN_RET_BG },
];

/** Accent per person row (A/B) for names and borders. */
export const PERSON_ACCENT = ["text-pink-700 dark:text-pink-300", "text-blue-700 dark:text-blue-300"] as const;

export const PERSON_DOT = ["bg-pink-600 dark:bg-pink-400", "bg-blue-700 dark:bg-blue-400"] as const;

const EKSEMPEL = nyForaelder("a", "");

/** True when the salary is still the untouched example value from the default plan. */
export function harEksempelLoen(f: Foraelder): boolean {
  return f.beskaeftigelse === "loenmodtager" && f.maanedsloen === EKSEMPEL.maanedsloen && f.ugentligeTimer === EKSEMPEL.ugentligeTimer;
}

export const stortForbogstav = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const kr = (n: number) => `${Math.round(n).toLocaleString("da-DK")} kr.`;

export const tal = (n: number, decimals = 0) =>
  n.toLocaleString("da-DK", { minimumFractionDigits: 0, maximumFractionDigits: decimals });
