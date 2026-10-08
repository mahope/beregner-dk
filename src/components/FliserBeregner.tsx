"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  FLISER_STANDARD_BREDDE_CM,
  FLISER_STANDARD_BREDDE_M,
  FLISER_STANDARD_HOEJDE_CM,
  FLISER_STANDARD_LAENGDE_M,
  FLISER_STANDARD_PR_ESKE,
  FLISER_STANDARD_SPILD_PCT,
  beregnFliser,
} from "@/lib/fliser";

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function FliserBeregner() {
  const [laengdeM, setLaengdeM] = useState(FLISER_STANDARD_LAENGDE_M);
  const [breddeM, setBreddeM] = useState(FLISER_STANDARD_BREDDE_M);
  const [fliseBreddeCm, setFliseBreddeCm] = useState(FLISER_STANDARD_BREDDE_CM);
  const [fliseHoejdeCm, setFliseHoejdeCm] = useState(FLISER_STANDARD_HOEJDE_CM);
  const [spildPct, setSpildPct] = useState(FLISER_STANDARD_SPILD_PCT);
  const [fliserPrEske, setFliserPrEske] = useState(FLISER_STANDARD_PR_ESKE);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "fliser") {
      const i = urlState.inputs;
      if (i.laengdeM !== undefined) setLaengdeM(Number(i.laengdeM));
      if (i.breddeM !== undefined) setBreddeM(Number(i.breddeM));
      if (i.fliseBreddeCm !== undefined) setFliseBreddeCm(Number(i.fliseBreddeCm));
      if (i.fliseHoejdeCm !== undefined) setFliseHoejdeCm(Number(i.fliseHoejdeCm));
      if (i.spildPct !== undefined) setSpildPct(Number(i.spildPct));
      if (i.fliserPrEske !== undefined) setFliserPrEske(Number(i.fliserPrEske));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("fliser");
    const timer = setTimeout(() => {
      trackCalculation("fliser");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setLaengdeM(FLISER_STANDARD_LAENGDE_M);
    setBreddeM(FLISER_STANDARD_BREDDE_M);
    setFliseBreddeCm(FLISER_STANDARD_BREDDE_CM);
    setFliseHoejdeCm(FLISER_STANDARD_HOEJDE_CM);
    setSpildPct(FLISER_STANDARD_SPILD_PCT);
    setFliserPrEske(FLISER_STANDARD_PR_ESKE);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "fliser",
      inputs: { laengdeM, breddeM, fliseBreddeCm, fliseHoejdeCm, spildPct, fliserPrEske },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [laengdeM, breddeM, fliseBreddeCm, fliseHoejdeCm, spildPct, fliserPrEske]);

  const resultat = useMemo(
    () =>
      beregnFliser({
        laengdeM,
        breddeM,
        fliseBreddeCm,
        fliseHoejdeCm,
        spildPct,
        fliserPrEske,
      }),
    [laengdeM, breddeM, fliseBreddeCm, fliseHoejdeCm, spildPct, fliserPrEske],
  );

  const format = `${fmt(fliseBreddeCm, 0)} × ${fmt(fliseHoejdeCm, 0)} cm`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fliser-laengde" className={labelClass}>
                Længde (m)
              </label>
              <input
                id="fliser-laengde"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={laengdeM}
                onChange={(e) => setLaengdeM(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fliser-bredde" className={labelClass}>
                Bredde (m)
              </label>
              <input
                id="fliser-bredde"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={breddeM}
                onChange={(e) => setBreddeM(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fliser-flise-bredde" className={labelClass}>
                Flise bredde (cm)
              </label>
              <input
                id="fliser-flise-bredde"
                type="number"
                min="1"
                step="1"
                inputMode="decimal"
                value={fliseBreddeCm}
                onChange={(e) => setFliseBreddeCm(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fliser-flise-hoejde" className={labelClass}>
                Flise højde (cm)
              </label>
              <input
                id="fliser-flise-hoejde"
                type="number"
                min="1"
                step="1"
                inputMode="decimal"
                value={fliseHoejdeCm}
                onChange={(e) => setFliseHoejdeCm(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fliser-spild" className={labelClass}>
                Spild (%)
              </label>
              <input
                id="fliser-spild"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                value={spildPct}
                onChange={(e) => setSpildPct(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fliser-pr-eske" className={labelClass}>
                Fliser pr. kasse
              </label>
              <input
                id="fliser-pr-eske"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={fliserPrEske}
                onChange={(e) => setFliserPrEske(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Spild dækker tilskæring langs kanter og hjørner. Antal fliser pr. kasse står på
            kassen — 60 × 60-fliser sælges ofte med 3-4 pr. kasse.
          </p>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Fliser i alt</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {fmt(resultat.fliserMedSpild, 0)} fliser
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Rummets areal</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.arealM2, 1)} m²
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Kasser</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.esker, 0)} kasser
                </div>
              </div>
            </div>

            <p className="text-sm text-center text-gray-700 dark:text-gray-300">
              {fmt(resultat.arealM2, 1)} m² med {format} og {fmt(spildPct, 0)} % spild giver{" "}
              <strong>{fmt(resultat.fliserMedSpild, 0)} fliser</strong> — altså{" "}
              {fmt(resultat.esker, 0)} kasser ({fmt(resultat.koebM2, 1)} m²).
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Én flise på {format} fylder {fmt(resultat.fliseArealM2, 2)} m², så der går{" "}
              {fmt(resultat.fliserPrM2, 1)} fliser på én m². Køb en kasse for meget frem for en
              for lidt — resten kan bruges til opretning.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={`${fmt(resultat.arealM2, 1)} m² med ${format} = ${fmt(resultat.fliserMedSpild, 0)} fliser (${fmt(resultat.esker, 0)} kasser)`}
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Fliseberegner"
          resultSummary={`${fmt(resultat.arealM2, 1)} m² = ${fmt(resultat.fliserMedSpild, 0)} fliser`}
        />
      </div>
    </div>
  );
}
