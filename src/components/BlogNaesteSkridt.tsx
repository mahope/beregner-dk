import Link from "next/link";

interface NaesteSkridtProps {
  /** The calculator the reader is being sent to. */
  href: string;
  /** The action, in imperative Danish: "Beregn din barselsdagpenge". */
  handling: string;
  /** What the calculator does, in one sentence the article has not already said. */
  beskrivelse: string;
  /**
   * The other tool the article is actually about, when there is a second one.
   * Quiet by design: the primary button stays the only button, because two
   * buttons of equal weight is how a reader ends up picking neither.
   */
  sekundaer?: { href: string; handling: string };
}

/**
 * The last thing a reader sees on an article.
 *
 * Every article already links to its calculators mid-text, but the page ended
 * with "Relaterede artikler", so the final click offered was another article.
 * Plausible showed 85 % bounce on /blog/barsel-2026-regler-og-satser (184
 * visitors): people read the answer and left without ever opening the tool the
 * article was written around.
 *
 * One primary action, on the tokens the site already uses. The dark-mode text
 * colour is not white: `--color-primary` is a light blue in dark mode, so
 * white on it would sit near 2:1 contrast.
 */
export function NaesteSkridt({ href, handling, beskrivelse, sekundaer }: NaesteSkridtProps) {
  return (
    <section className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-5 not-prose dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Regn det ud</h2>
      <p className="mt-1 mb-4 text-gray-700 dark:text-gray-300">{beskrivelse}</p>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-[var(--color-primary-hover)] dark:text-gray-900 dark:focus:ring-blue-800"
      >
        {handling}
      </Link>
      {sekundaer ? (
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          <Link
            href={sekundaer.href}
            className="inline-block py-1 font-medium underline underline-offset-2 hover:text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:hover:text-white dark:focus:ring-blue-800"
          >
            {sekundaer.handling}
          </Link>
        </p>
      ) : null}
    </section>
  );
}
