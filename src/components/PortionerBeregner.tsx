"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  PORTIONER_KATEGORIER,
  PORTIONER_STANDARD_ANTAL,
  PORTIONER_VARER,
  beregnPortioner,
  formatPortion,
  type PortionEnhed,
} from "@/lib/portioner";

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

/** Vist i den fremhævede boks — de mest søgte varer. */
const FREMHAEVEDE = ["pasta-toerret", "ris", "kartofler", "koed-benfrit-steg"] as const;

function interval(min: number, max: number, enhed: PortionEnhed): string {
  return min === max
    ? formatPortion(min, enhed)
    : `${formatPortion(min, enhed)}–${formatPortion(max, enhed)}`;
}

export default function PortionerBeregner() {
  const [antalPersoner, setAntalPersoner] = useState(PORTIONER_STANDARD_ANTAL);

  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("portioner");
    const timer = setTimeout(() => {
      trackCalculation("portioner");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setAntalPersoner(PORTIONER_STANDARD_ANTAL);
  }, []);

  const raekker = useMemo(() => beregnPortioner(antalPersoner), [antalPersoner]);
  const personer = Number.isFinite(antalPersoner) && antalPersoner > 0 ? antalPersoner : 0;
  const personerTekst = personer.toLocaleString("da-DK", { maximumFractionDigits: 1 });

  const fremhaevede = FREMHAEVEDE.map((id) => raekker.find((r) => r.id === id)!).filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="portioner-personer" className={labelClass}>
              Antal personer
            </label>
            <input
              id="portioner-personer"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={antalPersoner}
              onChange={(e) => setAntalPersoner(Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Skriv antallet af gæster, så regnes mængden for hver vare ud nedenfor.
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tallene er anbefalede mængder pr. voksen. Børn spiser typisk omkring halvt så meget,
            og er retten et tilbehør i stedet for hovedretten, skal du gå efter den lave ende.
          </p>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Til {personerTekst} personer
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                Se mængderne i tabellen
              </div>
            </div>

            <div className="space-y-2">
              {fremhaevede.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{r.navn}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {interval(r.totalMin, r.totalMax, r.enhed)}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mængderne er vejledende. Er der mange retter eller meget tilbehør, kan du nøjes med
              den lave ende af intervallet.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Vare</th>
              <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Pr. person</th>
              <th className="py-2 font-medium text-gray-700 dark:text-gray-300">
                I alt ({personerTekst} pers.)
              </th>
            </tr>
          </thead>
          <tbody>
            {PORTIONER_KATEGORIER.map((kategori) => (
              <Fragment key={kategori}>
                <tr>
                  <td
                    colSpan={3}
                    className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {kategori}
                  </td>
                </tr>
                {raekker
                  .filter((r) => r.kategori === kategori)
                  .map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 pr-4 text-gray-900 dark:text-white">{r.navn}</td>
                      <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">
                        {interval(r.min, r.max, r.enhed)}
                      </td>
                      <td className="py-2 font-semibold text-gray-900 dark:text-white">
                        {interval(r.totalMin, r.totalMax, r.enhed)}
                      </td>
                    </tr>
                  ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6">
        <CopyResultButton
          text={`Mængder til ${personerTekst} personer: ${fremhaevede
            .map((r) => `${r.navn} ${interval(r.totalMin, r.totalMax, r.enhed)}`)
            .join(", ")}`}
        />
      </div>
    </div>
  );
}
