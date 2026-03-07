import Link from "next/link";
import type { Metadata } from "next";
import NotFoundSearch from "@/components/NotFoundSearch";

export const metadata: Metadata = {
  title: "Side ikke fundet — MinBeregner.dk",
  description: "Siden blev ikke fundet. Find den rigtige beregner med vores søgefunktion.",
};

const popularBeregnere = [
  { title: "Løn efter skat", href: "/loen-efter-skat", icon: "💰" },
  { title: "BMI Beregner", href: "/bmi", icon: "⚖️" },
  { title: "Momsberegner", href: "/moms", icon: "🧾" },
  { title: "Låneberegner", href: "/laaneberegner", icon: "🏦" },
  { title: "Procentberegner", href: "/procent", icon: "➗" },
  { title: "Valutaberegner", href: "/valuta", icon: "💱" },
];

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl font-bold mb-2 dark:text-white">
        Siden blev ikke fundet
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Vi kunne desværre ikke finde den side du leder efter. Prøv at søge efter en beregner nedenfor.
      </p>

      <NotFoundSearch />

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Populære beregnere
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {popularBeregnere.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all text-sm font-medium text-gray-900 dark:text-white"
            >
              <span className="text-xl">{b.icon}</span>
              {b.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          ← Gå til forsiden
        </Link>
      </div>
    </div>
  );
}
