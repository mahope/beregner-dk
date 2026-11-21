"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  kalorieIgram,
  MADVARE_GRUPPE_NAVN,
  MADVARE_GRUPPER,
  MADVARER,
  MADVARER_KILDE,
  soegMadvarer,
  type MadvareGruppe,
} from "@/lib/kalorier-madvarer";

const labels = {
  overskrift: "Kalorier i madvarer",
  soeg: "Søg efter madvar",
  soegPladsholder: "f.eks. æg, banan eller ris",
  madvar: "Madvar",
  gram: "Gram",
  kcal: "kcal",
  protein: "Protein",
  fedt: "Fedt",
  kulhydrat: "Kulhydrat",
  per100: "Kalorier pr. 100 g",
  ingen: "Ingen madvar matcher",
  ingenHjælp: (navn: string) => `Prøv en kortere søgning, eller søg på engelsk: «${navn}» er den engelske betegnelge i kilden.`,
  resultat: (antal: number, færdig: boolean) =>
    færdig
      ? `Viser alle ${antal} madvarer. Skriv i feltet for at søge.`
      : `${antal} ${antal === 1 ? "madvar matcher" : "madvarer matcher"} din søgning.`,
  kilde: (database: string, dataset: string, udgave: string) =>
    `Tallene er fra ${database}, datasættet ${dataset}, udgaven ${udgave}, pr. 100 g.`,
} as const;

const feltCls =
  "w-full px-4 py-3 border border-gray-300 rounded-lg text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export default function KalorieTabel({ locale }: { locale: Locale }) {
  const [soegning, setSoegning] = useState("");
  const [gram, setGram] = useState<Record<string, string>>({});

  const fundne = useMemo(() => soegMadvarer(soegning), [soegning]);
  const grupper = useMemo(() => {
    const med = new Set(fundne.map((m) => m.gruppe));
    return MADVARE_GRUPPER.filter((g) => med.has(g));
  }, [fundne]);

  const fmt = (n: number, decimaler = 0) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimaler,
    });

  const gramFor = (navn: string) => gram[navn] ?? "100";
  const talFor = (navn: string) => Number(gramFor(navn).replace(",", "."));

  return (
    <section
      aria-labelledby="kalorietabel-overskrift"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8"
    >
      <h2 id="kalorietabel-overskrift" className="text-xl font-bold mb-4 dark:text-white">
        {labels.overskrift}
      </h2>

      <div className="mb-4">
        <label
          htmlFor="kalorietabel-soegning"
          className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
        >
          {labels.soeg}
        </label>
        <input
          id="kalorietabel-soegning"
          type="search"
          value={soegning}
          placeholder={labels.soegPladsholder}
          onChange={(e) => setSoegning(e.target.value)}
          className={feltCls}
        />
      </div>

      <p aria-live="polite" className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {soegning.trim() === ""
          ? labels.resultat(MADVARER.length, true)
          : labels.resultat(fundne.length, false)}
      </p>

      {fundne.length === 0 ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {labels.ingen}. {labels.ingenHjælp(soegning.trim())}
        </p>
      ) : (
        <div className="space-y-6">
          {grupper.map((gruppe: MadvareGruppe) => (
            <div key={gruppe}>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {MADVARE_GRUPPE_NAVN[gruppe]}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                      <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                        {labels.madvar}
                      </th>
                      <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-20">
                        {labels.gram}
                      </th>
                      <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-24 tabular-nums">
                        {labels.kcal}
                      </th>
                      <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-20 tabular-nums hidden md:table-cell">
                        {labels.protein}
                      </th>
                      <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-20 tabular-nums hidden md:table-cell">
                        {labels.fedt}
                      </th>
                      <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 w-24 tabular-nums hidden md:table-cell">
                        {labels.kulhydrat}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundne
                      .filter((m) => m.gruppe === gruppe)
                      .map((madvare) => (
                        <tr key={madvare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                          <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                            {madvare.navn}
                          </th>
                          <td className="py-2 px-2">
                            <label htmlFor={`kalorietabel-gram-${madvare.fdcId}`} className="sr-only">
                              {`${labels.gram} ${madvare.navn}`}
                            </label>
                            <input
                              id={`kalorietabel-gram-${madvare.fdcId}`}
                              type="number"
                              inputMode="numeric"
                              min="0"
                              step="any"
                              value={gramFor(madvare.navn)}
                              onChange={(e) =>
                                setGram((forrige) => ({ ...forrige, [madvare.navn]: e.target.value }))
                              }
                              className="w-full px-2 py-2 border border-gray-300 rounded-lg text-base tabular-nums dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-2 tabular-nums font-medium text-gray-800 dark:text-gray-100">
                            {fmt(kalorieIgram(madvare, talFor(madvare.navn)))}
                          </td>
                          <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400 hidden md:table-cell">
                            {fmt((madvare.protein100g * Math.max(0, talFor(madvare.navn))) / 100, 1)} g
                          </td>
                          <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400 hidden md:table-cell">
                            {fmt((madvare.fedt100g * Math.max(0, talFor(madvare.navn))) / 100, 1)} g
                          </td>
                          <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400 hidden md:table-cell">
                            {fmt((madvare.kulhydrat100g * Math.max(0, talFor(madvare.navn))) / 100, 1)} g
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        {labels.kilde(MADVARER_KILDE.database, MADVARER_KILDE.dataset, MADVARER_KILDE.udgave)}{" "}
        {MADVARER_KILDE.naeringsstoffer}.
      </p>
    </section>
  );
}