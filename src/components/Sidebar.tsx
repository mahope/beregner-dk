"use client";

import Link from "next/link";
import { SidebarAd } from "@/components/ads/AdBanner";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";
import { getPopularCalculators } from "@/lib/calculator-list";

interface SidebarProps {
  currentHref?: string;
  adSlotId?: string;
}

export default function Sidebar({ currentHref, adSlotId }: SidebarProps) {
  const { locale } = useLocale();
  const l = locale as "da" | "no" | "se";
  const popular = getPopularCalculators(l);
  const beregnere = popular.filter((b) => b.href !== currentHref);

  return (
    <aside className="hidden lg:block lg:w-[300px] flex-shrink-0">
      <div className="sticky top-8 space-y-6">
        <SidebarAd slotId={adSlotId || "sidebar"} />

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
            {t(l, "ui.popularCalculators")}
          </h3>
          <nav className="space-y-1">
            {beregnere.slice(0, 6).map((b) => (
              <Link
                key={b.href}
                href={b.href}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {b.icon && <span className="text-base">{b.icon}</span>}
                {b.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
