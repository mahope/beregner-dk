import Link from "next/link";
import { getLocale } from "@/lib/get-locale";
import { getTranslations } from "@/lib/i18n";
import { getRelatedCalculators, getCalculatorsByLocale } from "@/lib/calculator-list";
import type { Calculator } from "@/lib/calculator-list";

interface RelatedCalculatorsProps {
  current?: string;
  calculators?: Calculator[];
}

export async function RelatedCalculators({
  current,
  calculators,
}: RelatedCalculatorsProps) {
  const locale = await getLocale();
  const t = getTranslations(locale);

  let items: Calculator[];

  if (calculators && calculators.length > 0) {
    items = calculators;
  } else if (current) {
    items = getRelatedCalculators(current, locale);
  } else {
    items = getCalculatorsByLocale(locale).slice(0, 5);
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 dark:text-white">{t.ui.relatedCalculators}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md dark:hover:bg-gray-700 transition-shadow flex items-center gap-3"
          >
            {calc.icon && <span className="text-2xl">{calc.icon}</span>}
            <div>
              <p className="font-medium dark:text-white">{calc.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{calc.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelatedCalculators;
