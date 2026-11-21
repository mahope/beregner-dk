"use client";

import type { PriceArea } from "@/lib/energi/elpriser";

const OMRAADER: { id: PriceArea; label: string; hint: string }[] = [
  { id: "DK1", label: "Vest (DK1)", hint: "Jylland og Fyn" },
  { id: "DK2", label: "Øst (DK2)", hint: "Sjælland, øerne og Bornholm" },
];

export const OMRAADE_NAVN: Record<PriceArea, string> = { DK1: "Vestdanmark (DK1)", DK2: "Østdanmark (DK2)" };

/** Two-button toggle for the Danish price areas (west/east of Storebælt). */
export default function PrisomraadeVaelger({ value, onChange }: { value: PriceArea; onChange: (a: PriceArea) => void }) {
  return (
    <div role="group" aria-label="Prisområde" className="grid grid-cols-2 gap-2">
      {OMRAADER.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`px-3 py-2 rounded-lg text-sm border text-left transition-colors ${
            value === o.id
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400"
          }`}
        >
          <span className="block font-medium">{o.label}</span>
          <span className={`block text-xs ${value === o.id ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{o.hint}</span>
        </button>
      ))}
    </div>
  );
}
