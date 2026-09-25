"use client";

import { useState } from "react";
import { monthLabel } from "@/lib/barsel/dato";
import type { Analyse } from "@/lib/barsel/motor";
import type { Oekonomi } from "@/lib/barsel/oekonomi";
import type { BarselsPlan } from "@/lib/barsel/types";
import { PERSON_DOT, kr } from "./farver";

interface Props {
  plan: BarselsPlan;
  analyse: Analyse;
  oekonomi: Oekonomi;
}

const BAR = ["bg-rose-400 dark:bg-rose-500", "bg-blue-500 dark:bg-blue-400"] as const;

export default function OekonomiVisning({ plan, analyse, oekonomi }: Props) {
  const [maal, setMaal] = useState<"netto" | "brutto">("netto");
  const vaerdi = (fi: number, mi: number) =>
    maal === "netto" ? oekonomi.foraeldre[fi].maaneder[mi].netto : oekonomi.foraeldre[fi].maaneder[mi].brutto;
  const normal = (mi: number) =>
    oekonomi.foraeldre.reduce(
      (s, f) => s + (maal === "netto" ? f.maaneder[mi].normalNetto : f.maaneder[mi].normal),
      0
    );
  const maks = Math.max(
    1,
    ...oekonomi.maaneder.map((_, mi) => Math.max(normal(mi), oekonomi.foraeldre.reduce((s, _f, fi) => s + vaerdi(fi, mi), 0)))
  );
  const tab = maal === "netto" ? oekonomi.tabNetto : oekonomi.tabBrutto;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 p-4 dark:from-rose-900/20 dark:to-amber-900/20 sm:col-span-2">
          <p className="text-sm text-gray-700 dark:text-gray-200">Samlet indkomstnedgang i perioden ({maal === "netto" ? "efter skat, vejledende" : "før skat"})</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-gray-900 dark:text-white">{kr(Math.max(0, tab))}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            Sammenlignet med normal løn fra {monthLabel(oekonomi.maaneder[0])} til {monthLabel(oekonomi.maaneder[oekonomi.maaneder.length - 1])}.
          </p>
        </div>
        {plan.foraeldre.map((f, i) => {
          const o = oekonomi.foraeldre[i];
          return (
            <div key={f.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <span className={`h-2.5 w-2.5 rounded-full ${PERSON_DOT[i]}`} aria-hidden="true" />
                {analyse.foraeldre[i].navn}
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                {f.beskaeftigelse === "studerende" ? "SU fortsætter under orloven" : <>Barselsdagpenge: <strong className="tabular-nums">{kr(o.ugesats)}</strong>/uge før skat</>}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                Nedgang: <strong className="tabular-nums">{kr(Math.max(0, maal === "netto" ? o.tabNetto : o.tabBrutto))}</strong>
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800 print:hidden" role="group" aria-label="Vis beløb">
          {(["netto", "brutto"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={maal === m}
              onClick={() => setMaal(m)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                maal === m ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {m === "netto" ? "Efter skat" : "Før skat"}
            </button>
          ))}
        </div>
        <ul className="flex flex-wrap gap-3 text-xs text-gray-700 dark:text-gray-300">
          {analyse.foraeldre.map((a, i) => (
            <li key={a.id} className="inline-flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-sm ${BAR[i]}`} aria-hidden="true" />
              {a.navn}
            </li>
          ))}
          <li className="inline-flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-gray-700 dark:border-gray-200" aria-hidden="true" />
            Normal indkomst
          </li>
        </ul>
      </div>

      <figure>
        <div className="flex h-56 items-end gap-[2px] border-b border-gray-300 dark:border-gray-600 sm:gap-1" aria-hidden="true">
          {oekonomi.maaneder.map((m, mi) => {
            const n = normal(mi);
            return (
              <div key={m} className="relative flex h-full flex-1 flex-col justify-end">
                <div
                  className="absolute inset-x-0 border-t-2 border-dashed border-gray-700 dark:border-gray-200"
                  style={{ bottom: `${(n / maks) * 100}%` }}
                />
                {oekonomi.foraeldre
                  .map((_, fi) => fi)
                  .reverse()
                  .map((fi) => (
                    <div
                      key={fi}
                      className={`${BAR[fi]} ${fi === oekonomi.foraeldre.length - 1 ? "rounded-t-sm" : ""}`}
                      style={{ height: `${(vaerdi(fi, mi) / maks) * 100}%` }}
                    />
                  ))}
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-[2px] sm:gap-1" aria-hidden="true">
          {oekonomi.maaneder.map((m, mi) => (
            <div key={m} className="flex-1 overflow-hidden text-center text-[10px] leading-tight text-gray-600 dark:text-gray-400">
              {mi % 2 === 0 || oekonomi.maaneder.length < 14 ? monthLabel(m, true).split(" ")[0] : ""}
              {(m.endsWith("-01") || mi === 0) && <div className="font-semibold">{m.slice(0, 4)}</div>}
            </div>
          ))}
        </div>
        <figcaption className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          Husstandens indkomst pr. måned {maal === "netto" ? "efter skat" : "før skat"}. Den stiplede linje er jeres normale indkomst. Tallene står i tabellen herunder.
        </figcaption>
      </figure>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-[32rem] text-sm">
          <caption className="sr-only">Indkomst pr. måned {maal === "netto" ? "efter skat" : "før skat"}</caption>
          <thead className="bg-gray-50 text-left text-gray-700 dark:bg-gray-900/50 dark:text-gray-200">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">
                Måned
              </th>
              {analyse.foraeldre.map((a) => (
                <th key={a.id} scope="col" className="px-3 py-2 text-right font-semibold">
                  {a.navn}
                </th>
              ))}
              {analyse.foraeldre.length > 1 && (
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  I alt
                </th>
              )}
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                Forskel
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {oekonomi.maaneder.map((m, mi) => {
              const sum = oekonomi.foraeldre.reduce((s, _f, fi) => s + vaerdi(fi, mi), 0);
              const diff = sum - normal(mi);
              return (
                <tr key={m} className="text-gray-900 dark:text-gray-100">
                  <th scope="row" className="px-3 py-1.5 text-left font-normal capitalize">
                    {monthLabel(m)}
                  </th>
                  {oekonomi.foraeldre.map((_f, fi) => (
                    <td key={fi} className="px-3 py-1.5 text-right tabular-nums">
                      {kr(vaerdi(fi, mi))}
                    </td>
                  ))}
                  {oekonomi.foraeldre.length > 1 && <td className="px-3 py-1.5 text-right font-medium tabular-nums">{kr(sum)}</td>}
                  <td className={`px-3 py-1.5 text-right tabular-nums ${diff < -1 ? "text-red-700 dark:text-red-300" : "text-gray-600 dark:text-gray-400"}`}>
                    {Math.abs(diff) < 1 ? "–" : kr(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Vejledende: Løn og løn under barsel er fratrukket 8 % AM-bidrag; barselsdagpenge er ikke AM-bidragspligtige. Skatten er beregnet groft med bundskat,
        {` ${plan.kommuneskatPct.toLocaleString("da-DK")} %`} kommuneskat, personfradrag og beskæftigelsesfradrag, som om månedens indkomst gjaldt hele året. ATP,
        pension, feriepenge og fradrag er ikke medregnet.
      </p>
    </div>
  );
}
