"use client";

import { useMemo, useState } from "react";
import { Mail } from "lucide-react";
import {
  PORTO_MAX_TYKKELSE_CM,
  PORTO_MAX_VAEGT_G,
  PORTO_VARER,
  beregnPorto,
} from "@/lib/porto";

export default function PortoBeregner() {
  const [destination, setDestination] = useState<"danmark" | "udlandet">("danmark");
  const [type, setType] = useState<"almindelig" | "plus">("almindelig");
  const [vaegt, setVaegt] = useState<string>("50");
  const [tykkelse, setTykkelse] = useState<string>("");
  const [antal, setAntal] = useState<string>("1");

  const resultat = useMemo(() => {
    if (vaegt === "") return null;
    return beregnPorto({
      destination,
      type,
      vaegtGram: Number(vaegt) || 0,
      antal: Number(antal) || 1,
    });
  }, [destination, type, vaegt, antal]);

  const tykkelseTal = Number(tykkelse);
  const forTykt = tykkelse !== "" && tykkelseTal > PORTO_MAX_TYKKELSE_CM;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 md:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label
              htmlFor="porto-destination"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Hvor skal brevet hen?
            </label>
            <select
              id="porto-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value as "danmark" | "udlandet")}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="danmark">I Danmark</option>
              <option value="udlandet">Til udlandet</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="porto-type"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Brevtype
            </label>
            <select
              id="porto-type"
              value={type}
              onChange={(e) => setType(e.target.value as "almindelig" | "plus")}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
            >
              <option value="almindelig">Almindeligt brev</option>
              <option value="plus" disabled={destination === "udlandet"}>
                Hurtigt brev (PLUS)
              </option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {destination === "udlandet"
                ? "PLUS findes kun i Danmark. Et udlandsbrev sendes altid som almindeligt brev."
                : "PLUS ligger fremme inden for 1-2 hverdage mod 2-5 hverdage for et almindeligt brev."}
            </p>
          </div>

          <div>
            <label
              htmlFor="porto-vaegt"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Vægt i gram
            </label>
            <div className="flex items-center gap-2">
              <input
                id="porto-vaegt"
                type="number"
                min={1}
                max={5000}
                value={vaegt}
                onChange={(e) => setVaegt(e.target.value)}
                placeholder="50"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">g</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="porto-tykkelse"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Tykkelse i centimeter (valgfri)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="porto-tykkelse"
                type="number"
                min={0}
                max={99}
                step={0.1}
                value={tykkelse}
                onChange={(e) => setTykkelse(e.target.value)}
                placeholder="0,5"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">cm</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Et brev må højst være {PORTO_MAX_TYKKELSE_CM} cm tykt og {PORTO_MAX_VAEGT_G} g — ellers er
              det en pakke.
            </p>
          </div>

          <div>
            <label
              htmlFor="porto-antal"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Antal breve
            </label>
            <div className="flex items-center gap-2">
              <input
                id="porto-antal"
                type="number"
                min={1}
                max={999}
                value={antal}
                onChange={(e) => setAntal(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">stk.</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
          {resultat ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4 text-center shadow-sm dark:bg-gray-700">
                <div className="flex justify-center">
                  <Mail
                    className="h-8 w-8 text-blue-500 dark:text-blue-400"
                    strokeWidth={1.75}
                    aria-hidden="true"
                    focusable="false"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Porto pr. brev</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {resultat.pris}
                  <span className="text-2xl"> kr.</span>
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {destination === "danmark" ? "I Danmark" : "Til udlandet"} ·{" "}
                  {type === "plus" ? "PLUS" : "almindeligt"} · op til {resultat.vaegtKlasse} g
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Leveringstid</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {resultat.levering}
                  </div>
                </div>
                <div className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    I alt ({resultat.antal} brev)
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {resultat.total} kr.
                  </div>
                </div>
              </div>

              {resultat.forTungt && (
                <p
                  role="status"
                  className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                >
                  Et brev må højst veje {PORTO_MAX_VAEGT_G} g. Over {PORTO_MAX_VAEGT_G} g skal det
                  sendes som pakke, og portoet afhænger af pakkens format.
                </p>
              )}
              {forTykt && (
                <p
                  role="status"
                  className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                >
                  Et brev må højst være {PORTO_MAX_TYKKELSE_CM} cm tykt. Et tykkere omslag skal sendes
                  som pakke.
                </p>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <div className="mb-3 flex justify-center">
                <Mail
                  className="h-10 w-10 text-gray-300 dark:text-gray-600"
                  strokeWidth={1.75}
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
              <p>Skriv brevsets vægt i gram, så regner vi portoet ud.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Dao&apos;s brevpriser
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                <th className="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Vægt</th>
                <th className="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Brevtype</th>
                <th className="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Levering</th>
                <th className="pb-2 font-medium text-gray-600 dark:text-gray-400">Pris</th>
              </tr>
            </thead>
            <tbody>
              {PORTO_VARER.map((vare) => (
                <tr
                  key={`${vare.destination}-${vare.type}-${vare.vaegtMax}`}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                    {vare.vaegtMax === 100 ? "0-100 g" : "101-250 g"}
                  </td>
                  <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                    {vare.destination === "danmark" ? "Danmark" : "Udland"} ·{" "}
                    {vare.type === "plus" ? "PLUS" : "almindeligt"}
                  </td>
                  <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{vare.levering}</td>
                  <td className="py-3 font-medium text-gray-900 dark:text-gray-100">
                    {vare.pris} kr.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Priserne er dao&apos;s egen prisliste, læst 9. oktober 2026.
        </p>
      </div>
    </div>
  );
}
