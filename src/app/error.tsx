"use client";

import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useLocale();
  const l = locale as Locale;

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">
        {t(l, "ui.error")}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {t(l, "ui.errorDescription")}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {t(l, "ui.tryAgain")}
      </button>
    </div>
  );
}
