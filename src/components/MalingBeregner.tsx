"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  MALING_DAEKNING_M2_PR_LITER,
  MALING_STANDARD_HOEJDE_M,
  MALING_STANDARD_SPILD_PCT,
  MALING_STANDARD_STROEG,
  beregnMalingAreal,
  beregnMalingLiter,
} from "@/lib/maling";

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function MalingBeregner() {
  const [laengdeM, setLaengdeM] = useState(5);
  const [breddeM, setBreddeM] = useState(4);
  const [hoejdeM, setHoejdeM] = useState(MALING_STANDARD_HOEJDE_M);
  const [antalRum, setAntalRum] = useState(1);
  const [fravalgM2, setFravalgM2] = useState(0);
  const [medLoft, setMedLoft] = useState(false);
  const [straag, setStraag] = useState(MALING_STANDARD_STROEG);
  const [daekning, setDaekning] = useState(MALING_DAEKNING_M2_PR_LITER);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "maling") {
      const i = urlState.inputs;
      if (i.laengdeM !== undefined) setLaengdeM(Number(i.laengdeM));
      if (i.breddeM !== undefined) setBreddeM(Number(i.breddeM));
      if (i.hoejdeM !== undefined) setHoejdeM(Number(i.hoejdeM));
      if (i.antalRum !== undefined) setAntalRum(Number(i.antalRum));
      if (i.fravalgM2 !== undefined) setFravalgM2(Number(i.fravalgM2));
      if (i.medLoft !== undefined) setMedLoft(Boolean(i.medLoft));
      if (i.straag !== undefined) setStraag(Number(i.straag));
      if (i.daekning !== undefined) setDaekning(Number(i.daekning));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("maling");
    const timer = setTimeout(() => {
      trackCalculation("maling");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setLaengdeM(5);
    setBreddeM(4);
    setHoejdeM(MALING_STANDARD_HOEJDE_M);
    setAntalRum(1);
    setFravalgM2(0);
    setMedLoft(false);
    setStraag(MALING_STANDARD_STROEG);
    setDaekning(MALING_DAEKNING_M2_PR_LITER);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "maling",
      inputs: { laengdeM, breddeM, hoejdeM, antalRum, fravalgM2, medLoft, straag, daekning },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [laengdeM, breddeM, hoejdeM, antalRum, fravalgM2, medLoft, straag, daekning]);

  const areal = useMemo(
    () => beregnMalingAreal({ laengdeM, breddeM, hoejdeM, antalRum, fravalgM2, medLoft }),
    [laengdeM, breddeM, hoejdeM, antalRum, fravalgM2, medLoft],
  );
  const liter = useMemo(
    () => beregnMalingLiter(areal.samletM2, straag, daekning),
    [areal.samletM2, straag, daekning],
  );

  const straagValg = [1, 2, 3];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="maling-laengde" className={labelClass}>
                Længde (m)
              </label>
              <input
                id="maling-laengde"
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
              <label htmlFor="maling-bredde" className={labelClass}>
                Bredde (m)
              </label>
              <input
                id="maling-bredde"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={breddeM}
                onChange={(e) => setBreddeM(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="maling-hoejde" className={labelClass}>
                Højde (m)
              </label>
              <input
                id="maling-hoejde"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={hoejdeM}
                onChange={(e) => setHoejdeM(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="maling-antal" className={labelClass}>
                Antal rum
              </label>
              <input
                id="maling-antal"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={antalRum}
                onChange={(e) => setAntalRum(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="maling-fravalg" className={labelClass}>
                Døre og vinduer (m²)
              </label>
              <input
                id="maling-fravalg"
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                value={fravalgM2}
                onChange={(e) => setFravalgM2(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="maling-loft"
              type="checkbox"
              checked={medLoft}
              onChange={(e) => setMedLoft(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-300 dark:border-gray-600"
            />
            <label htmlFor="maling-loft" className="text-sm text-gray-700 dark:text-gray-300">
              Medregn loftet
            </label>
          </div>

          <fieldset>
            <legend className={labelClass}>Antal strøg</legend>
            <div className="flex gap-2" role="group" aria-label="Antal strøg">
              {straagValg.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={straag === n}
                  onClick={() => setStraag(n)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    straag === n
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="maling-daekning" className={labelClass}>
              Dækkevne (m² pr. liter)
            </label>
            <input
              id="maling-daekning"
              type="number"
              min="1"
              step="1"
              inputMode="decimal"
              value={daekning}
              onChange={(e) => setDaekning(Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Står på malingsdåsen. En typisk vægmaling dækker ca. {MALING_DAEKNING_M2_PR_LITER} m² pr.
              liter pr. strøg.
            </p>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Maling i alt</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {fmt(liter.literMedSpild, 1)} liter
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Maleareal</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(areal.samletM2, 1)} m²
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Køb</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(liter.literKoeb, 0)} liter
                </div>
              </div>
            </div>

            <p className="text-sm text-center text-gray-700 dark:text-gray-300">
              {fmt(areal.samletM2, 1)} m² med {straag} strøg og {fmt(daekning, 0)} m² pr. liter giver{" "}
              <strong>{fmt(liter.literEksakt, 1)} liter</strong> plus {fmt(MALING_STANDARD_SPILD_PCT, 0)} % til
              spild.
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dækkevnen varierer med underlag og maling, og et sugende eller ru underlag bruger mere end
              dåsen lover. Køb derfor hellere en liter for meget end en for lidt — resten kan bruges til
              opretning.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={`${fmt(areal.samletM2, 1)} m² med ${straag} strøg = ${fmt(liter.literMedSpild, 1)} liter maling`}
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Malingberegner"
          resultSummary={`${fmt(areal.samletM2, 1)} m² = ${fmt(liter.literMedSpild, 1)} liter maling`}
        />
      </div>
    </div>
  );
}
