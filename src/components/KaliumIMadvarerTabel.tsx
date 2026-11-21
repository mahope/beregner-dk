"use client";

import { useMemo, useState } from "react";
import {
  KALIUM_ANBEFALING_MG,
  KALIUM_MADVARER,
  MADVARER_KILDE,
  andelAfAnbefaling,
  gramForAnbefaling,
  kalium100g,
  kaliumIgram,
  kaliumRangliste,
  kaliumTal,
  soegKaliumvarer,
  type Kaliumvare,
} from "@/lib/kalium-i-madvarer";

const KALIUM_MAAL_MG = KALIUM_ANBEFALING_MG;

const feltCls =
  "w-full px-4 py-3 border border-gray-300 rounded-lg text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white";

const talFeltCls =
  "w-full px-2 py-2 border border-gray-300 rounded-lg text-base tabular-nums dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export default function KaliumIMadvarerTabel() {
  const [soegning, setSoegning] = useState("");
  const [gram, setGram] = useState<Record<string, string>>({});

  // Rækkefølgen er kalium pr. 100 g, den højeste først, så de mest kaliumrige
  // kilder står øverst — også når læseren ikke søger.
  const fundne = useMemo(() => {
    const rækkefølge = new Map(kaliumRangliste().map((m, i) => [m.fdcId, i]));
    return soegKaliumvarer(soegning).sort(
      (a, b) => (rækkefølge.get(a.fdcId) ?? 0) - (rækkefølge.get(b.fdcId) ?? 0)
    );
  }, [soegning]);

  const gramFor = (navn: string) => gram[navn] ?? "100";
  const talFor = (navn: string) => Number(gramFor(navn).replace(",", "."));

  const række = (madvare: Kaliumvare) => {
    const maengde = Math.max(0, talFor(madvare.navn));
    const kalium = kaliumIgram(madvare, maengde);
    return (
      <tr key={madvare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
        <th
          scope="row"
          className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100"
        >
          {madvare.navn}
        </th>
        <td className="py-2 px-2">
          <label htmlFor={`kalium-gram-${madvare.fdcId}`} className="sr-only">
            {`Gram ${madvare.navn}`}
          </label>
          <input
            id={`kalium-gram-${madvare.fdcId}`}
            type="number"
            inputMode="numeric"
            min="0"
            step="any"
            value={gramFor(madvare.navn)}
            onChange={(e) =>
              setGram((forrige) => ({ ...forrige, [madvare.navn]: e.target.value }))
            }
            className={talFeltCls}
          />
        </td>
        <td className="py-2 px-2 tabular-nums font-medium text-gray-800 dark:text-gray-100">
          {kaliumTal(kalium)} mg
        </td>
        <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
          {kaliumTal(kalium100g(madvare))} mg
        </td>
        <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400 hidden md:table-cell">
          {kalium100g(madvare) > 0
            ? `${kaliumTal(gramForAnbefaling(madvare), 0)} g`
            : "—"}
        </td>
        <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400 hidden md:table-cell">
          {kalium100g(madvare) > 0
            ? `${kaliumTal(andelAfAnbefaling(madvare), 0)} %`
            : "—"}
        </td>
      </tr>
    );
  };

  return (
    <section
      aria-labelledby="kaliumtabel-overskrift"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8"
    >
      <h2 id="kaliumtabel-overskrift" className="text-xl font-bold mb-4 dark:text-white">
        Kalium i madvarer
      </h2>

      <div className="mb-4">
        <label
          htmlFor="kaliumtabel-soegning"
          className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
        >
          Søg efter en madvare
        </label>
        <input
          id="kaliumtabel-soegning"
          type="search"
          value={soegning}
          placeholder="f.eks. banan, kartoffel eller avocado"
          onChange={(e) => setSoegning(e.target.value)}
          className={feltCls}
        />
      </div>

      <p aria-live="polite" className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {soegning.trim() === ""
          ? `Viser alle ${KALIUM_MADVARER.length} madvarer, sorteret efter kalium pr. 100 g. Skriv i feltet for at søge.`
          : `${fundne.length} ${
              fundne.length === 1 ? "madvare matcher" : "madvarer matcher"
            } din søgning.`}
      </p>

      {fundne.length === 0 ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Ingen madvare matcher. Prøv en kortere søgning.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                  Madvare
                </th>
                <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-20">
                  Gram
                </th>
                <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-24 tabular-nums">
                  Kalium
                </th>
                <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-28 tabular-nums">
                  Kalium pr. 100 g
                </th>
                <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-32 tabular-nums hidden md:table-cell">
                  Gram for {kaliumTal(KALIUM_MAAL_MG, 0)} mg
                </th>
                <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-32 tabular-nums hidden md:table-cell">
                  Andel af {kaliumTal(KALIUM_MAAL_MG, 0)} mg
                </th>
              </tr>
            </thead>
            <tbody>{fundne.map(række)}</tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        Kaliumtallet er fra {MADVARER_KILDE.database}, datasættet {MADVARER_KILDE.dataset},
        udgaven {MADVARER_KILDE.udgave}, pr. 100 g. «Gram for{" "}
        {kaliumTal(KALIUM_MAAL_MG, 0)} mg» og andelen af anbefalingen er regnet ud af de
        samme tal.
      </p>
    </section>
  );
}
