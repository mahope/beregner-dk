"use client";

import { useEffect, useId, useState } from "react";

export const inputKlasse =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export const labelKlasse = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200";

interface TalFeltProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hjaelp?: string;
  id?: string;
}

/** Number input that keeps the raw text while typing (so "" and "3," work). */
export function TalFelt({ label, value, onChange, min = 0, max, step = 1, suffix, hjaelp, id }: TalFeltProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [tekst, setTekst] = useState(String(value));

  useEffect(() => {
    const parsed = Number(tekst.replace(",", "."));
    if (tekst !== "" && (!Number.isFinite(parsed) || parsed !== value)) setTekst(String(value));
  }, [value]);

  return (
    <div>
      <label htmlFor={inputId} className={labelKlasse}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={tekst}
          onChange={(e) => {
            setTekst(e.target.value);
            const n = Number(e.target.value.replace(",", "."));
            if (e.target.value !== "" && Number.isFinite(n)) {
              const clamped = Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, n));
              onChange(clamped);
            }
          }}
          onBlur={() => setTekst(String(value))}
          aria-describedby={hjaelp ? `${inputId}-hjaelp` : undefined}
          className={`${inputKlasse} ${suffix ? "pr-14" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      {hjaelp && (
        <p id={`${inputId}-hjaelp`} className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {hjaelp}
        </p>
      )}
    </div>
  );
}

interface SegmentProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string; beskrivelse?: string }[];
  onChange: (value: T) => void;
  kolonner?: string;
}

/** Radio group styled as cards/buttons. */
export function Segment<T extends string>({ label, value, options, onChange, kolonner = "grid-cols-2 sm:grid-cols-3" }: SegmentProps<T>) {
  const name = useId();
  return (
    <fieldset>
      <legend className={labelKlasse}>{label}</legend>
      <div className={`grid gap-2 ${kolonner}`}>
        {options.map((o) => {
          const valgt = o.value === value;
          return (
            <label
              key={o.value}
              className={`flex cursor-pointer flex-col rounded-lg border-2 px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
                valgt
                  ? "border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-100"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-500"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={valgt}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className="font-semibold">{o.label}</span>
              {o.beskrivelse && <span className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">{o.beskrivelse}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
