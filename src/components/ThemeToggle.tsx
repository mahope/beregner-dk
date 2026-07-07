"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useLocale } from "@/components/LocaleProvider";
import type { Locale } from "@/lib/i18n";

const themeLabels = {
  da: { system: "Tema: Automatisk (følger system)", dark: "Tema: Mørk", light: "Tema: Lys", toggle: "Skift tema" },
  no: { system: "Tema: Automatisk (følger system)", dark: "Tema: Mørk", light: "Tema: Lys", toggle: "Bytt tema" },
  se: { system: "Tema: Automatiskt (följer system)", dark: "Tema: Mörkt", light: "Tema: Ljust", toggle: "Byt tema" },
} as const;

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { locale } = useLocale();
  const l = themeLabels[locale as Locale] || themeLabels.da;

  const cycleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <button type="button"
      onClick={cycleTheme}
      className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={theme === "system" ? l.system : theme === "dark" ? l.dark : l.light}
      aria-label={l.toggle}
    >
      {theme === "system" ? (
        <Monitor className="w-5 h-5" />
      ) : resolvedTheme === "dark" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
