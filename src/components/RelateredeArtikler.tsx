import Link from "next/link";
import { BEREGNER_ARTIKLER } from "@/lib/blog-kobling";
import type { Locale } from "@/lib/i18n";

interface RelateredeArtiklerProps {
  /** Stien på beregnersiden, fx `/moms`. */
  current: string;
  /**
   * Siden har allerede slået denne op til sin egen tekst, så den gives videre
   * i stedet for at komme fra endnu et `getLocale()`-kald.
   */
  locale: Locale;
}

/**
 * Returlinks fra en beregner til de indlæg, der svarer til spørgsmålet på siden.
 * Koblingen ligger i `@/lib/blog-kobling`, så den ikke spredes i sidernes
 * brødtekst. Indlæggene er danske, så blokken vises kun på de danske domæner —
 * ellers ville den tilføje dansk tekst på beraknare.se.
 */
export function RelateredeArtikler({ current, locale }: RelateredeArtiklerProps) {
  const artikler = BEREGNER_ARTIKLER[current];

  if (locale !== "da" || !artikler || artikler.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Guides om emnet</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {artikler.map((artikel) => (
          <Link
            key={artikel.slug}
            href={`/blog/${artikel.slug}`}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md dark:hover:bg-gray-700 transition-shadow"
          >
            <p className="font-medium dark:text-white">{artikel.titel}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{artikel.beskrivelse}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelateredeArtikler;
