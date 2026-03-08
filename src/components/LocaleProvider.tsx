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
