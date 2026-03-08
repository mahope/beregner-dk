'use client';

import { useLocale } from '@/components/LocaleProvider';
import { t } from '@/lib/i18n';

export function SkipLink() {
  const { locale } = useLocale();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg focus:outline-none"
    >
      {t(locale as "da" | "no" | "se", "ui.skipLink")}
    </a>
  );
}

export default SkipLink;
