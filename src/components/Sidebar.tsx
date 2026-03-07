import Link from "next/link";
import { SidebarAd } from "@/components/ads/AdBanner";
import NewsletterSignup from "@/components/NewsletterSignup";

interface SidebarProps {
  currentHref?: string;
  adSlotId?: string;
}

const popularBeregnere = [
  { title: "Løn efter skat", href: "/loen-efter-skat", icon: "💰" },
  { title: "Momsberegner", href: "/moms", icon: "🧾" },
  { title: "BMI Beregner", href: "/bmi", icon: "⚖️" },
  { title: "Låneberegner", href: "/laaneberegner", icon: "🏦" },
  { title: "Procentberegner", href: "/procent", icon: "➗" },
  { title: "Valutaberegner", href: "/valuta", icon: "💱" },
  { title: "Feriepenge", href: "/feriepenge", icon: "🏖️" },
  { title: "Boliglån", href: "/boliglaan", icon: "🏡" },
];

export default function Sidebar({ currentHref, adSlotId }: SidebarProps) {
  const beregnere = popularBeregnere.filter((b) => b.href !== currentHref);

  return (
    <aside className="hidden lg:block lg:w-[300px] flex-shrink-0">
      <div className="sticky top-8 space-y-6">
        <SidebarAd slotId={adSlotId || "sidebar"} />

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
            Populære beregnere
          </h3>
          <nav className="space-y-1">
            {beregnere.slice(0, 6).map((b) => (
              <Link
                key={b.href}
                href={b.href}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-base">{b.icon}</span>
                {b.title}
              </Link>
            ))}
          </nav>
        </div>

        <NewsletterSignup />
      </div>
    </aside>
  );
}
