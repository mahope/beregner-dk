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
  placeholder?: string;
  helpText?: string;
  customValidation?: (value: number, rawValue: string) => string | null;
}

function getErrorMessage(
  value: number,
  rawValue: string,
  required?: boolean,
  min?: number,
  max?: number,
  customValidation?: (value: number, rawValue: string) => string | null
): string | null {
  if (required && rawValue.trim() === "") {
    return "Indtast venligst en værdi";
  }

  if (rawValue.trim() === "") return null;

  if (rawValue.trim() !== "" && isNaN(Number(rawValue))) {
    return "Indtast venligst et gyldigt tal";
  }

  if (min !== undefined && min >= 0 && value < 0) {
    return "Værdien kan ikke være negativ";
  }

  if (min !== undefined && max !== undefined && value < min) {
    return `Indtast et tal mellem ${min} og ${max}`;
  }

  if (min !== undefined && max === undefined && value < min) {
    return `Indtast en værdi på mindst ${min}`;
  }

  if (max !== undefined && min === undefined && value > max) {
    return `Indtast en værdi på højst ${max}`;
  }

  if (max !== undefined && min !== undefined && value > max) {
    return `Indtast et tal mellem ${min} og ${max}`;
  }

  if (customValidation) {
    return customValidation(value, rawValue);
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
  placeholder,
  helpText,
  customValidation,
}: InputFieldProps) {
  const [touched, setTouched] = useState(false);
  const [rawValue, setRawValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  // Sync rawValue with external value changes (e.g. URL state loading)
  useEffect(() => {
    if (!isFocused) {
      setRawValue(String(value));
    }
  }, [value, isFocused]);

  const error = touched ? getErrorMessage(value, rawValue, required, min, max, customValidation) : null;
  const isValid = touched && !error && rawValue.trim() !== "";

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

  const borderClass = error
    ? "border-red-400 dark:border-red-500 focus:ring-red-300 dark:focus:ring-red-600"
    : isValid
      ? "border-green-400 dark:border-green-500 focus:ring-green-300 dark:focus:ring-green-600"
      : "border-gray-300 dark:border-gray-600 focus:ring-blue-300 dark:focus:ring-blue-600";

  const describedBy = [
    error ? errorId : null,
    helpText ? helpId : null,
  ].filter(Boolean).join(" ") || undefined;

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
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`px-4 py-3 border rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors ${borderClass} ${className || "w-28"}`}
        />
        {error && (
          <span id={errorId} role="alert" className="text-red-500 dark:text-red-400 text-xs mt-1 max-w-28">
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
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full px-4 py-3 border rounded-lg text-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 transition-colors ${borderClass} ${unit ? "pr-12" : ""} ${className || ""}`}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
      )}
      {helpText && !error && (
        <p id={helpId} className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helpText}</p>
      )}
    </div>
  );
}
