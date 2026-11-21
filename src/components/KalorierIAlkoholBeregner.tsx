"use client";

import { useMemo, useState } from "react";
import {
  ALKOHOL_DRIKKE,
  beregnAlkoholKalorier,
  ALKOHOL_KILDE,
} from "@/lib/kalorier-i-alkohol";

const labels = {
  overskrift: "Kalorier i alkohol",
  intro:
    "Skriv, hvor mange du har drukket af hver, og siden lægger kalorier, alkohol og genstande sammen.",
  drik: "Drik",
  servering: "Servering",
  kcalPrServering: "Kcal pr. servering",
  antal: "Antal",
  kcal: "Kcal",
  genstande: "Genstande",
  alkohol: "Gram alkohol",
  iAlt: "I alt",
  tom: "Du har ikke skrevet noget ind endnu.",
  tomHjaelp: "Sæt et tal i kolonnen «Antal» ved den drik, du har haft.",
  slet: "Nulstil",
  kilde: (database: string, datasæt: string) =>
    `Tallene er fra ${database}, datasættet ${datasæt}, og hver række bærer sit eget fdc-id.`,
} as const;

const feltCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white";
const celleCls = "px-3 py-2 border-b border-gray-200 dark:border-gray-700";

export default function KalorierIAlkoholBeregner() {
  const [typer, setTyper] = useState<Record<string, string>>({});
  const [nulstillet, setNulstillet] = useState(0);

  const total = useMemo(() => {
    const parsed: Record<string, number> = {};
    for (const d of ALKOHOL_DRIKKE) {
      const v = Number((typer[d.id] ?? "").replace(",", "."));
      if (v > 0) parsed[d.id] = Math.floor(v);
    }
    return beregnAlkoholKalorier(parsed);
  }, [typer, nulstillet]);

  const valgt = total.rækker.filter((r) => r.antal > 0);
  const num = (n: number, decimaler = 0) =>
    n.toLocaleString("da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimaler,
    });

  return (
    <section aria-labelledby="alkohol-kalorier-overskrift">
      <h2 id="alkohol-kalorier-overskrift" className="text-xl font-semibold mb-2">
        {labels.overskrift}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{labels.intro}</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-400">
              <th scope="col" className="px-3 py-2">
                {labels.drik}
              </th>
              <th scope="col" className="px-3 py-2">
                {labels.servering}
              </th>
              <th scope="col" className="px-3 py-2">
                {labels.kcalPrServering}
              </th>
              <th scope="col" className="px-3 py-2 w-28">
                {labels.antal}
              </th>
              <th scope="col" className="px-3 py-2">
                {labels.kcal}
              </th>
              <th scope="col" className="px-3 py-2">
                {labels.genstande}
              </th>
            </tr>
          </thead>
          <tbody>
            {total.rækker.map((r) => {
              const inputId = `alkohol-${r.id}`;
              return (
                <tr key={r.id}>
                  <th scope="row" className={`${celleCls} font-medium text-left`}>
                    <label htmlFor={inputId}>{r.navn}</label>
                  </th>
                  <td className={celleCls}>{num(r.ml)} ml</td>
                  <td className={celleCls}>{num(r.kcalPrServering)} kcal</td>
                  <td className={celleCls}>
                    <input
                      id={inputId}
                      type="number"
                      min={0}
                      max={99}
                      step={1}
                      inputMode="numeric"
                      value={typer[r.id] ?? ""}
                      onChange={(e) => {
                        setTyper((prev) => ({ ...prev, [r.id]: e.target.value }));
                        setNulstillet((n) => n + 0);
                      }}
                      className={feltCls}
                    />
                  </td>
                  <td className={celleCls}>{r.antal > 0 ? `${num(r.kcalTotal)} kcal` : "—"}</td>
                  <td className={celleCls}>
                    {r.antal > 0 ? num(r.genstandeTotal, 2) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {valgt.length > 0 && (
            <tfoot>
              <tr className="font-semibold">
                <th scope="row" className={`${celleCls} text-left`}>
                  {labels.iAlt}
                </th>
                <td className={celleCls}>{valgt.length} dere</td>
                <td className={celleCls} />
                <td className={celleCls}>
                  <button
                    type="button"
                    onClick={() => {
                      setTyper({});
                      setNulstillet((n) => n + 1);
                    }}
                    className="text-sm text-blue-700 underline dark:text-blue-300"
                  >
                    {labels.slet}
                  </button>
                </td>
                <td className={celleCls}>{num(total.kcal)} kcal</td>
                <td className={celleCls}>{num(total.genstande, 2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div aria-live="polite" className="mt-4">
        {valgt.length > 0 ? (
          <p className="text-lg">
            <strong>{num(total.kcal)} kcal</strong> og{" "}
            <strong>{num(total.genstande, 2)} genstande</strong> ({num(
              total.alkoholGram,
              1,
            )}{" "}
            g ren alkohol) ud af det, du har skrevet ind.
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            {labels.tom} {labels.tomHjaelp}
          </p>
        )}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        {labels.kilde(ALKOHOL_KILDE.database, ALKOHOL_KILDE.datasæt)}
      </p>
    </section>
  );
}
