"use client";

import { useState, useCallback, useEffect, useId } from "react";

interface InputFieldProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  ariaLabel?: string;
  min?: number;
  max?: number;
  required?: boolean;
  step?: number | string;
  unit?: string;
  className?: string;
  inline?: boolean;
}

function getErrorMessage(
  value: number,
  rawValue: string,
  required?: boolean,
  min?: number,
  max?: number
): string | null {
  if (required && rawValue.trim() === "") {
    return "Indtast venligst en værdi";
  }

  if (rawValue.trim() === "") return null;

  if (min !== undefined && min >= 0 && value < 0) {
    return "Værdien kan ikke være negativ";
  }

  if (min !== undefined && max !== undefined && value < min) {
    return `Indtast en værdi mellem ${min} og ${max}`;
  }

  if (min !== undefined && max === undefined && value < min) {
    return `Indtast en værdi på mindst ${min}`;
  }

  if (max !== undefined && min === undefined && value > max) {
    return `Indtast en værdi på højst ${max}`;
  }

  if (max !== undefined && min !== undefined && value > max) {
    return `Indtast en værdi mellem ${min} og ${max}`;
  }

  return null;
}

export function InputField({
  value,
  onChange,
  label,
  ariaLabel,
  min,
  max,
  required,
  step,
  unit,
  className,
  inline,
}: InputFieldProps) {
  const [touched, setTouched] = useState(false);
  const [rawValue, setRawValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const id = useId();

  // Sync rawValue with external value changes (e.g. URL state loading)
  useEffect(() => {
    if (!isFocused) {
      setRawValue(String(value));
    }
  }, [value, isFocused]);

  const error = touched ? getErrorMessage(value, rawValue, required, min, max) : null;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setRawValue(raw);
      const parsed = parseFloat(raw);
      onChange(isNaN(parsed) ? 0 : parsed);
    },
    [onChange]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTouched(true);
  }, []);

  if (inline) {
    return (
      <div className="inline-flex flex-col">
        <input
          id={id}
          type="number"
          value={rawValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          className={`px-4 py-3 border rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100 ${
            error
              ? "border-red-400 dark:border-red-500"
              : "dark:border-gray-600"
          } ${className || "w-28"}`}
        />
        {error && (
          <span className="text-red-500 dark:text-red-400 text-xs mt-1 max-w-28">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-2 dark:text-gray-200">
          {label}
        </label>
      )}
      <div className={unit ? "relative" : undefined}>
        <input
          id={id}
          type="number"
          value={rawValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          className={`w-full px-4 py-3 border rounded-lg text-lg bg-white dark:bg-gray-800 dark:text-white ${
            error
              ? "border-red-400 dark:border-red-500"
              : "dark:border-gray-600"
          } ${unit ? "pr-12" : ""} ${className || ""}`}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
