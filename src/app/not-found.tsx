import Link from "next/link";
import NotFoundSearch from "@/components/NotFoundSearch";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPopularCalculators } from "@/lib/calculator-list";

const notFoundText = {
  da: {
    title: "Siden blev ikke fundet",
    description: "Vi kunne desværre ikke finde den side du leder efter. Prøv at søge efter en beregner nedenfor.",
    popular: "Populære beregnere",
    backHome: "Gå til forsiden",
  },
  no: {
    title: "Siden ble ikke funnet",
    description: "Vi kunne dessverre ikke finne siden du leter etter. Prøv å søke etter en kalkulator nedenfor.",
    popular: "Populære kalkulatorer",
    backHome: "Gå til forsiden",
  },
  se: {
    title: "Sidan hittades inte",
    description: "Vi kunde tyvärr inte hitta sidan du letar efter. Försök att söka efter en kalkylator nedan.",
    popular: "Populära kalkylatorer",
    backHome: "Gå till startsidan",
  },
} as const;

export default async function NotFound() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const texts = notFoundText[locale] || notFoundText.da;
  const popular = getPopularCalculators(locale).slice(0, 6);

  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl font-bold mb-2 dark:text-white">
        {texts.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {texts.description}
      </p>

      <NotFoundSearch />

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          {texts.popular}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {popular.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all text-sm font-medium text-gray-900 dark:text-white"
            >
              {b.icon && <span className="text-xl">{b.icon}</span>}
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
          ← {texts.backHome}
        </Link>
      </div>
    </div>
  );
}
