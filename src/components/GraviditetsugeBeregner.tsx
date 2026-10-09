"use client";

import { useMemo, useState } from "react";
import { Baby } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { beregnGraviditetsuge, type GraviditetInputKind } from "@/lib/graviditetsuge";
import { iDagPaSiden } from "@/lib/lokal-dato";

const kindLabels: Record<GraviditetInputKind, string> = {
  sidsteMens: "Første dag i sidste menstruation",
  termin: "Terminsdato",
  undfangelse: "Ægløsnings- eller undfangelsesdato",
};

const kindHints: Record<GraviditetInputKind, string> = {
  sidsteMens: "Den dag din seneste menstruation begyndte. Det er den dato, graviditeten regnes fra.",
  termin: "Har du fået en terminsdato ved en scanning, kan du regne tilbage fra den.",
  undfangelse: "Kender du ægløsningsdagen eller undfangelsen, sættes den til dag 14 af graviditeten.",
};

function formatDato(iso: string): string {
  const [aar, maaned, dag] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(aar, maaned - 1, dag));
}

export default function GraviditetsugeBeregner() {
  const [kind, setKind] = useState<GraviditetInputKind>("sidsteMens");
  const [dato, setDato] = useState("");
  const [brugAndenDato, setBrugAndenDato] = useState(false);
  const [reference, setReference] = useState("");

  const resultat = useMemo(() => {
    if (!dato) return null;
    const ref = brugAndenDato && reference ? reference : iDagPaSiden(new Date(), "da");
    return beregnGraviditetsuge({ kind, dato }, ref);
  }, [kind, dato, brugAndenDato, reference]);

  const harDato = dato !== "";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 md:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label
              htmlFor="graviditetsuge-kind"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Hvilken dato kender du?
            </label>
            <select
              id="graviditetsuge-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as GraviditetInputKind)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {(Object.keys(kindLabels) as GraviditetInputKind[]).map((k) => (
                <option key={k} value={k}>
                  {kindLabels[k]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{kindHints[kind]}</p>
          </div>

          <div>
            <label
              htmlFor="graviditetsuge-dato"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {kindLabels[kind]}
            </label>
            <input
              id="graviditetsuge-dato"
              type="date"
              value={dato}
              onChange={(e) => setDato(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="graviditetsuge-anden-dato"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <input
                id="graviditetsuge-anden-dato"
                type="checkbox"
                checked={brugAndenDato}
                onChange={(e) => setBrugAndenDato(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Beregn på en anden dato end i dag
            </label>
            {brugAndenDato && (
              <input
                type="date"
                aria-label="Beregn pr. dato"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            )}
          </div>
        </div>

        <div className="rounded-xl bg-pink-50 p-6 dark:bg-pink-900/20">
          {resultat ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4 text-center shadow-sm dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">Du er i uge</div>
                <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                  {resultat.uger}
                  <span className="text-2xl">+{resultat.dage}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {resultat.uger} uger og {resultat.dage} {resultat.dage === 1 ? "dag" : "dage"} henne
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Trimester</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {resultat.trimester}.
                  </div>
                </div>
                <div className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Dage til termin</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {resultat.dageTilTermin}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {resultat.procent} % af graviditeten
                </div>
                <div className="mt-2 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-600">
                  <div
                    className="h-3 rounded-full bg-pink-500 transition-all"
                    style={{ width: `${resultat.procent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 rounded-lg bg-white p-3 text-sm shadow-sm dark:bg-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Terminsdato</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    {formatDato(resultat.termin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ægløsning (ca.)</span>
                  <span className="text-gray-900 dark:text-gray-200">
                    {formatDato(resultat.undfangelse)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sidste menstruation</span>
                  <span className="text-gray-900 dark:text-gray-200">
                    {formatDato(resultat.sidsteMens)}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <CopyResultButton
                  text={`Du er i uge ${resultat.uger}+${resultat.dage}. Terminsdato: ${formatDato(
                    resultat.termin
                  )}.`}
                />
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <div className="mb-3 flex justify-center">
                <Baby
                  className="h-10 w-10 text-gray-300 dark:text-gray-600"
                  strokeWidth={1.75}
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
              <p>
                {harDato
                  ? "Datoen ligger uden for en graviditet. Tjek at den er skrevet rigtigt."
                  : "Vælg den dato du kender, så regner vi ugen ud."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
