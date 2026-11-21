"use client";

import { RotateCcw } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface ResetButtonProps {
  onReset: () => void;
  label?: string;
  className?: string;
}

const RESET_LABEL: Record<string, string> = {
  da: "Nulstil",
  se: "Återställ",
  no: "Nullstill",
};

export function ResetButton({ onReset, label, className }: ResetButtonProps) {
  const { locale } = useLocale();
  const text = label ?? RESET_LABEL[locale] ?? RESET_LABEL.da;
  return (
    <button
      type="button"
      onClick={onReset}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${className || ""}`}
    >
      <RotateCcw size={14} />
      {text}
    </button>
  );
}
