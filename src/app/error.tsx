"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
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
  const [locale, setLocale] = useState<Locale>("da");

  useEffect(() => {
    setLocale(getBrowserLocale());
  }, []);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

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
