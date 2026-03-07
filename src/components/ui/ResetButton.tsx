"use client";

import { RotateCcw } from "lucide-react";

interface ResetButtonProps {
  onReset: () => void;
  label?: string;
  className?: string;
}

export function ResetButton({ onReset, label = "Nulstil", className }: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${className || ""}`}
    >
      <RotateCcw size={14} />
      {label}
    </button>
  );
}
