"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { useLocaleOptional } from "@/components/LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return "da";
  return getDomainConfig(window.location.hostname).locale;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Rod-layoutet læser domænet **på serveren** og lægger `LocaleProvider` om
  // hele træet, så konteksten er med, når en side kaster. Da behøver den ingen
  // `useEffect` for at vide sit sprog: server-HTML'en på beraknare.se siger
  // «Något gick fel» og ikke «Noget gik galt».
  //
  // `useLocale()` kastede, da konteksten mangner — altså når fejlen rammer
  // `layout.tsx` selv, fordi Next så renderer denne side uden provideren. Derfor
  // læses den med `useLocaleOptional`, og så falder vi tilbage på domænet i
  // browseren i stedet for at kaste oven i fejlen.
  const ctx = useLocaleOptional();
  const [browserLocale, setBrowserLocale] = useState<Locale | null>(null);

  useEffect(() => {
    setBrowserLocale(getBrowserLocale());
  }, []);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const locale = ctx?.locale ?? browserLocale ?? "da";

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">
        {t(locale, "ui.error")}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {t(locale, "ui.errorDescription")}
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {t(locale, "ui.tryAgain")}
      </button>
    </div>
  );
}
