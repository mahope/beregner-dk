import type { Inflation } from "@/lib/statbank";

/** Source line for the inflation default fetched from Danmarks Statistik. */
export function InflationKilde({ inflation }: { inflation: Inflation }) {
  const pct = inflation.pct.toLocaleString("da-DK", { maximumFractionDigits: 2 });
  return (
    <p className="text-xs text-gray-500 dark:text-gray-400">
      Standard er seneste årlige inflation: {pct} % i {inflation.maaned} (forbrugerprisindeks, ændring over 12 måneder).
      Kilde:{" "}
      <a
        href="https://www.statistikbanken.dk/PRIS01"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-700 dark:hover:text-gray-200"
      >
        Danmarks Statistik, PRIS01
      </a>
      . Du kan selv rette satsen.
    </p>
  );
}
