"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  BYGGEPRIS_NIVEAUER,
  BYGGEPRIS_STANDARD_AREAL,
  BYGGEPRIS_STANDARD_NIVEAU,
  beregnByggepris,
  type ByggeprisNiveau,
} from "@/lib/byggepris";

const fmt = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 0 });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const NIVEAUER: { id: ByggeprisNiveau; label: string }[] = [
  { id: "typehus", label: "Typehus (standard)" },
  { id: "totalentreprise", label: "Totalentreprise (middel)" },
  { id: "arkitekttegnet", label: "Arkitekttegnet (høj)" },
];

export default function ByggeprisBeregner() {
  const [arealM2, setArealM2] = useState(BYGGEPRIS_STANDARD_AREAL);
  const [niveau, setNiveau] = useState<ByggeprisNiveau>(BYGGEPRIS_STANDARD_NIVEAU);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "byggepris") {
      const i = urlState.inputs;
      if (i.arealM2 !== undefined) setArealM2(Number(i.arealM2));
      if (i.niveau !== undefined && i.niveau in BYGGEPRIS_NIVEAUER) {
        setNiveau(i.niveau as ByggeprisNiveau);
      }
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("byggepris");
    const timer = setTimeout(() => {
      trackCalculation("byggepris");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setArealM2(BYGGEPRIS_STANDARD_AREAL);
    setNiveau(BYGGEPRIS_STANDARD_NIVEAU);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "byggepris",
      inputs: { arealM2, niveau },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [arealM2, niveau]);

  const resultat = useMemo(() => beregnByggepris(arealM2, niveau), [arealM2, niveau]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="byggepris-areal" className={labelClass}>
              Boligareal (m²)
            </label>
            <input
              id="byggepris-areal"
              type="number"
              min="0"
              step="10"
              inputMode="numeric"
              value={arealM2}
              onChange={(e) => setArealM2(Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Arealet er det færdige hus samlede boligareal.
            </p>
          </div>

          <fieldset>
            <legend className={labelClass}>Standard</legend>
            <div className="flex flex-col gap-2" role="group" aria-label="Standard">
              {NIVEAUER.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  aria-pressed={niveau === n.id}
                  onClick={() => setNiveau(n.id)}
                  className={`min-h-11 px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors ${
                    niveau === n.id
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Byggepris (ekskl. grund)
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {fmt(resultat.byggeprisMin)}-{fmt(resultat.byggeprisMax)} kr.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Boligareal</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(arealM2)} m²
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Kvadratmeterpris</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.kvadratmeterprisMin)}-{fmt(resultat.kvadratmeterprisMax)} kr.
                </div>
              </div>
            </div>

            <p className="text-sm text-center text-gray-700 dark:text-gray-300">
              {fmt(arealM2)} m² til {fmt(resultat.kvadratmeterprisMin)}-{fmt(resultat.kvadratmeterprisMax)}{" "}
              kr./m² giver <strong>{fmt(resultat.byggeprisMin)}-{fmt(resultat.byggeprisMax)} kr.</strong>
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Priserne er vejledende og dækker selve huset — ikke grund, byggemodning eller tilslutning.
              Jo større huset er, jo lavere ligger prisen typisk pr. m².
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={`${fmt(arealM2)} m² til ${fmt(resultat.kvadratmeterprisMin)}-${fmt(resultat.kvadratmeterprisMax)} kr./m² = ${fmt(resultat.byggeprisMin)}-${fmt(resultat.byggeprisMax)} kr.`}
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Byggeprisberegner"
          resultSummary={`${fmt(arealM2)} m² = ${fmt(resultat.byggeprisMin)}-${fmt(resultat.byggeprisMax)} kr.`}
        />
      </div>
    </div>
  );
}
