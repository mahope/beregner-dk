"use client";

import { useMemo, useState } from "react";
import {
  MADVARER,
  MADVARER_KILDE,
  fedtIgram,
  fedtPer100Kcal,
  fedtRangliste,
  fedtTal,
  gramForFedt,
  soegMadvarer,
  type Madvare,
} from "@/lib/fedt-i-madvarer";

const FEDT_MAAL_GRAM = 20;

const feltCls =
  "w-full px-4 py-3 border border-gray-300 rounded-lg text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white";

const talFeltCls =
  "w-full px-2 py-2 border border-gray-300 rounded-lg text-base tabular-nums dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export default function FedtIMadvarerTabel() {
  const [soegning, setSoegning] = useState("");
  const [gram, setGram] = useState<Record<string, string>>({});

  // Rækkefølgen er fedt pr. 100 g, den højeste først, så de mest fedttætte
  // kilder står øverst — også når læseren ikke søger.
  const fundne = useMemo(() => {
    const rækkefølge = new Map(fedtRangliste().map((m, i) => [m.fdcId, i]));
    return soegMadvarer(soegning).sort(
      (a, b) => (rækkefølge.get(a.fdcId) ?? 0) - (rækkefølge.get(b.fdcId) ?? 0)
    );
  }, [soegning]);

  const gramFor = (navn: string) => gram[navn] ?? "100";
  const talFor = (navn: string) => Number(gramFor(navn).replace(",", "."));

  const række = (madvare: Madvare) => {
    const maengde = Math.max(0, talFor(madvare.navn));
    const fedt = fedtIgram(madvare, maengde);
    return (
      <tr key={madvare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
        <th
          scope="row"
          className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100"
        >
          {madvare.navn}
        </th>
        <td className="py-2 px-2">
          <label htmlFor={`fedt-gram-${madvare.fdcId}`} className="sr-only">
            {`Gram ${madvare.navn}`}
          </label>
          <input
            id={`fedt-gram-${madvare.fdcId}`}
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
          {fedtTal(fedt, 1)} g
        </td>
        <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
          {fedtTal(madvare.fedt100g, 1)} g
        </td>
        <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400 hidden md:table-cell">
          {madvare.fedt100g > 0
            ? `${fedtTal(gramForFedt(madvare, FEDT_MAAL_GRAM), 0)} g`
            : "—"}
        </td>
        <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400 hidden md:table-cell">
          {fedtTal(fedtPer100Kcal(madvare), 1)} g
        </td>
      </tr>
    );
  };

  return (
    <section
      aria-labelledby="fedttabel-overskrift"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8"
    >
      <h2 id="fedttabel-overskrift" className="text-xl font-bold mb-4 dark:text-white">
        Fedt i madvarer
      </h2>

      <div className="mb-4">
        <label
          htmlFor="fedttabel-soegning"
          className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
        >
          Søg efter en madvare
        </label>
        <input
          id="fedttabel-soegning"
          type="search"
          value={soegning}
          placeholder="f.eks. æg, avocado eller fløde"
          onChange={(e) => setSoegning(e.target.value)}
          className={feltCls}
        />
      </div>

      <p aria-live="polite" className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {soegning.trim() === ""
          ? `Viser alle ${MADVARER.length} madvarer, sorteret efter fedt pr. 100 g. Skriv i feltet for at søge.`
          : `${fundne.length} ${
              fundne.length === 1 ? "madvare matcher" : "madvarer matcher"
            } din søgning.`}
      </p>

      {fundne.length === 0 ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Ingen madvare matcher. Prøv en kortere søgning — eller søg på engelsk, for det er
          navnet i kilden.
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
                  Fedt
                </th>
                <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-28 tabular-nums">
                  Pr. 100 g
                </th>
                <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-32 tabular-nums hidden md:table-cell">
                  Gram for {FEDT_MAAL_GRAM} g
                </th>
                <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-32 tabular-nums hidden md:table-cell">
                  Pr. 100 kcal
                </th>
              </tr>
            </thead>
            <tbody>{fundne.map(række)}</tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        Tallene er fra {MADVARER_KILDE.database}, datasættet {MADVARER_KILDE.dataset}, udgaven{" "}
        {MADVARER_KILDE.udgave}, pr. 100 g. Kolonnerne «Gram for {FEDT_MAAL_GRAM} g» og «Pr.
        100 kcal» er regnet ud af de samme tal.
      </p>
    </section>
  );
}
