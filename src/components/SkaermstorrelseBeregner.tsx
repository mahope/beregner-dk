"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  SEERAFSTAND_FJERN_GRAD,
  SEERAFSTAND_NAER_GRAD,
  SKARM_FORMATER,
  SKARM_STANDARD_FORMAT,
  SKARM_STANDARD_TOMMER,
  beregnSeerafstand,
  beregnSkarmMaal,
  type SkarmFormat,
} from "@/lib/skaermstorrelse";

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function SkaermstorrelseBeregner() {
  const [tommer, setTommer] = useState(SKARM_STANDARD_TOMMER);
  const [format, setFormat] = useState<SkarmFormat>(SKARM_STANDARD_FORMAT);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "tv-storrelse") {
      const i = urlState.inputs;
      if (i.tommer !== undefined) setTommer(Number(i.tommer));
      if (i.format !== undefined) setFormat(i.format as SkarmFormat);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("tv-storrelse");
    const timer = setTimeout(() => {
      trackCalculation("tv-storrelse");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setTommer(SKARM_STANDARD_TOMMER);
    setFormat(SKARM_STANDARD_FORMAT);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "tv-storrelse",
      inputs: { tommer, format },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [tommer, format]);

  const maal = useMemo(() => beregnSkarmMaal(tommer, format), [tommer, format]);
  const afstand = useMemo(
    () => (maal ? beregnSeerafstand(maal.breddeCm) : null),
    [maal],
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="skaerm-tommer" className={labelClass}>
              Skærmens diagonal (tommer)
            </label>
            <input
              id="skaerm-tommer"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={tommer}
              onChange={(e) => setTommer(Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Det tal butikken opgiver — målt diagonalt fra hjørne til hjørne.
            </p>
          </div>

          <fieldset>
            <legend className={labelClass}>Skærmformat</legend>
            <div className="grid grid-cols-1 gap-2" role="group" aria-label="Skærmformat">
              {SKARM_FORMATER.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={format === f.id}
                  onClick={() => setFormat(f.id)}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors ${
                    format === f.id
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          {maal && afstand ? (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Bredde × højde
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {fmt(maal.breddeCm)} × {fmt(maal.hoejdeCm)} cm
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Diagonal</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {fmt(maal.diagonalCm)} cm
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Billedflade</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {fmt(maal.arealM2, 2)} m²
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Anbefalet seerafstand
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(afstand.naerCm / 100)}–{fmt(afstand.fjernCm / 100)} m
                </div>
              </div>

              <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                Et {fmt(maal.tommer, 0)}-tommers tv i {maal.format} er {fmt(maal.breddeCm)} cm bredt
                og {fmt(maal.hoejdeCm)} cm højt.
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Seerafstanden svarer til en vandret synsvinkel på {SEERAFSTAND_NAER_GRAD}–
                {SEERAFSTAND_FJERN_GRAD} grader. Sidder du tættere på, fylder skærmen mere af
                synsfeltet — det føles mere biografagtigt, men kan også blive trættende.
              </p>
            </div>
          ) : (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Skriv skærmens diagonal i tommer for at se målene i centimeter.
            </p>
          )}
        </div>
      </div>

      {maal && afstand && (
        <div className="flex justify-center mt-6 gap-3">
          <CopyResultButton
            text={`${fmt(maal.tommer, 0)}" (${maal.format}) = ${fmt(maal.breddeCm)} × ${fmt(maal.hoejdeCm)} cm`}
          />
          <ShareCalculation
            getShareableLink={getShareableLink}
            calculatorName="TV-størrelse"
            resultSummary={`${fmt(maal.tommer, 0)}" = ${fmt(maal.breddeCm)} × ${fmt(maal.hoejdeCm)} cm`}
          />
        </div>
      )}
    </div>
  );
}
