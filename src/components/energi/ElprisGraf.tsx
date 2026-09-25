"use client";

import { useState } from "react";
import { billigsteIndekser, type DagPriser } from "@/lib/energi/elpriser";

export const kr2 = (n: number) =>
  n.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const hh = (h: number) => String(h % 24).padStart(2, "0");

type Props = {
  dage: DagPriser[];
  idag: string;
  /** Current Danish hour, highlighted on today's chart. */
  nuTime?: number;
  antalBilligste?: number;
};

/** Bar chart + table of today's and tomorrow's hourly consumer prices, cheapest hours marked. */
export default function ElprisGraf({ dage, idag, nuTime, antalBilligste = 4 }: Props) {
  const iDag = dage.find((d) => d.date === idag);
  const iMorgen = dage.find((d) => d.date !== idag);
  const [visMorgen, setVisMorgen] = useState(false);
  const dag = visMorgen && iMorgen ? iMorgen : iDag;
  if (!dag) return null;

  const totals = dag.hours.map((h) => h.total);
  const billigste = billigsteIndekser(totals, antalBilligste);
  const max = Math.max(...totals, 0.01);
  const minIdx = totals.indexOf(Math.min(...totals));
  const maxIdx = totals.indexOf(Math.max(...totals));
  const erIdag = dag.date === idag;

  const fane = (aktiv: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${
      aktiv
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400"
    }`;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-medium dark:text-white">Elpris time for time</h3>
        <div className="flex gap-2" role="group" aria-label="Vælg dag">
          <button type="button" className={fane(!visMorgen || !iMorgen)} aria-pressed={!visMorgen || !iMorgen} onClick={() => setVisMorgen(false)}>
            I dag
          </button>
          <button
            type="button"
            className={`${fane(visMorgen && !!iMorgen)} disabled:opacity-60 disabled:cursor-not-allowed`}
            aria-pressed={visMorgen && !!iMorgen}
            disabled={!iMorgen}
            onClick={() => setVisMorgen(true)}
            title={iMorgen ? undefined : "Morgendagens priser offentliggøres ca. kl. 13"}
          >
            {iMorgen ? "I morgen" : "I morgen (ca. kl. 13)"}
          </button>
        </div>
      </div>

      <div
        className="flex items-end gap-px sm:gap-0.5 h-40"
        role="img"
        aria-label={`Elpris pr. time. Billigst kl. ${hh(dag.hours[minIdx].hour)}: ${kr2(totals[minIdx])} kr/kWh. Dyrest kl. ${hh(dag.hours[maxIdx].hour)}: ${kr2(totals[maxIdx])} kr/kWh.`}
      >
        {dag.hours.map((h, i) => {
          const pct = Math.max(2, (Math.max(h.total, 0) / max) * 100);
          const erNu = erIdag && nuTime === h.hour;
          return (
            <div
              key={`${dag.date}-${i}`}
              className={`flex-1 min-w-0 rounded-t-sm ${
                billigste.has(i) ? "bg-green-500 dark:bg-green-400" : "bg-blue-300 dark:bg-blue-500/70"
              } ${erNu ? "ring-2 ring-offset-1 ring-gray-800 dark:ring-white dark:ring-offset-gray-800" : ""}`}
              style={{ height: `${pct}%` }}
              title={`kl. ${hh(h.hour)}-${hh(h.hour + 1)}: ${kr2(h.total)} kr/kWh (spot ${kr2(h.spot)} kr)`}
            />
          );
        })}
      </div>
      <div className="flex gap-px sm:gap-0.5 mt-1 text-[10px] text-gray-500 dark:text-gray-400" aria-hidden="true">
        {dag.hours.map((h, i) => (
          <div key={i} className="flex-1 min-w-0 text-center overflow-visible whitespace-nowrap">
            {h.hour % 3 === 0 ? hh(h.hour) : ""}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-600 dark:text-gray-300">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-400 inline-block" />
          {antalBilligste} billigste timer
        </span>
        <span>
          Billigst kl. {hh(dag.hours[minIdx].hour)}-{hh(dag.hours[minIdx].hour + 1)}: <strong>{kr2(totals[minIdx])} kr</strong>
        </span>
        <span>
          Dyrest kl. {hh(dag.hours[maxIdx].hour)}-{hh(dag.hours[maxIdx].hour + 1)}: <strong>{kr2(totals[maxIdx])} kr</strong>
        </span>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-blue-700 dark:text-blue-400">Vis alle timer som tabel</summary>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-400">
                <th className="py-1 pr-2 font-medium">Time</th>
                <th className="py-1 pr-2 font-medium text-right">Spot</th>
                <th className="py-1 pr-2 font-medium text-right">Nettarif</th>
                <th className="py-1 font-medium text-right">I alt inkl. moms</th>
              </tr>
            </thead>
            <tbody>
              {dag.hours.map((h, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-100 dark:border-gray-700 ${billigste.has(i) ? "bg-green-50 dark:bg-green-900/20 font-medium" : ""}`}
                >
                  <td className="py-1 pr-2 dark:text-gray-300">
                    {hh(h.hour)}-{hh(h.hour + 1)}
                  </td>
                  <td className="py-1 pr-2 text-right dark:text-gray-300">{kr2(h.spot)}</td>
                  <td className="py-1 pr-2 text-right dark:text-gray-300">{kr2(h.nettarif)}</td>
                  <td className="py-1 text-right dark:text-white">{kr2(h.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Kr/kWh. Spotprisen handles i kvarter og er vist som gennemsnit pr. time. Spot og nettarif er ekskl. moms.
        </p>
      </details>
    </div>
  );
}
