"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n";
import type { DomainConfig } from "@/lib/domain-config";

interface LocaleContextValue {
  locale: Locale;
  domainConfig: DomainConfig;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  domainConfig,
  children,
}: {
  locale: Locale;
  domainConfig: DomainConfig;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, domainConfig }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Fallback for components rendered outside provider (shouldn't happen)
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}

/**
 * Samme kontekst, men **uden** at kaste.
 *
 * Rodens `error.tsx` lå tidligere i en `useLocale`, og Sentry fangede
 * «useLocale must be used within a LocaleProvider» 2/10 på `POST /` — altså
 * lige i den komponent, der skal vise en fejl. Konteksten mangler, når fejlen
 * rammer `layout.tsx` selv: så står Next over `error.tsx` og renderer den uden
 * rod-layoutens `LocaleProvider`.
 *
 * Derfor læser fejlsiden denne i stedet: med provider får den domænets sprog
 * **på serveren**, altså i den HTML Google og alle uden JavaScript ser, og
 * uden provider falder den tilbage på domænet i browseren i stedet for at
 * kaste en ny fejl oven i fejlen.
 */
export function useLocaleOptional(): LocaleContextValue | null {
  return useContext(LocaleContext);
}
