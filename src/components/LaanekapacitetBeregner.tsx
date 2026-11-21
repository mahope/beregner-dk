"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import {
  generateShareableLink,
  getStateFromUrl,
  CalculationState,
} from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  GAELDSFAKTOR_STANDARD,
  GAELDSFAKTOR_VALG,
  REALKREDIT_MAKS_PCT,
  UDBETALING_MIN_PCT,
  beregnLaanekapacitet,
} from "@/lib/laanekapacitet";

const kr = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 0 });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function LaanekapacitetBeregner() {
  const [husstandsindkomst, setHusstandsindkomst] = useState(500000);
  const [udbetaling, setUdbetaling] = useState(300000);
  const [eksisterendeGaeld, setEksisterendeGaeld] = useState(0);
  const [gaeldsfaktor, setGaeldsfaktor] = useState(GAELDSFAKTOR_STANDARD);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "laanekapacitet") {
      const i = urlState.inputs;
      if (i.husstandsindkomst !== undefined) setHusstandsindkomst(Number(i.husstandsindkomst));
      if (i.udbetaling !== undefined) setUdbetaling(Number(i.udbetaling));
      if (i.eksisterendeGaeld !== undefined) setEksisterendeGaeld(Number(i.eksisterendeGaeld));
      if (i.gaeldsfaktor !== undefined) setGaeldsfaktor(Number(i.gaeldsfaktor));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("laanekapacitet");
    const timer = setTimeout(() => {
      trackCalculation("laanekapacitet");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setHusstandsindkomst(500000);
    setUdbetaling(300000);
    setEksisterendeGaeld(0);
    setGaeldsfaktor(GAELDSFAKTOR_STANDARD);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "laanekapacitet",
      inputs: { husstandsindkomst, udbetaling, eksisterendeGaeld, gaeldsfaktor },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [husstandsindkomst, udbetaling, eksisterendeGaeld, gaeldsfaktor]);

  const resultat = useMemo(
    () => beregnLaanekapacitet({ husstandsindkomst, udbetaling, eksisterendeGaeld, gaeldsfaktor }),
    [husstandsindkomst, udbetaling, eksisterendeGaeld, gaeldsfaktor],
  );

  const binder =
    resultat.bindendeGraense === "gaeldsfaktor"
      ? `Gældsfaktoren på ${resultat.gaeldsfaktor.toLocaleString("da-DK")} sætter grænsen.`
      : `Udbetalingen sætter grænsen — den rækker til ${kr(resultat.maksBoligpris)} kr. med ${UDBETALING_MIN_PCT} % kontant.`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="laanek-indkomst" className={labelClass}>
              Husstandens indkomst før skat (kr./år)
            </label>
            <input
              id="laanek-indkomst"
              type="number"
              min="0"
              step="10000"
              inputMode="numeric"
              value={husstandsindkomst}
              onChange={(e) => setHusstandsindkomst(Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Læg begge låntageres bruttoløn sammen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="laanek-udbetaling" className={labelClass}>
                Udbetaling (kr.)
              </label>
              <input
                id="laanek-udbetaling"
                type="number"
                min="0"
                step="10000"
                inputMode="numeric"
                value={udbetaling}
                onChange={(e) => setUdbetaling(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="laanek-gaeld" className={labelClass}>
                Anden gæld (kr.)
              </label>
              <input
                id="laanek-gaeld"
                type="number"
                min="0"
                step="10000"
                inputMode="numeric"
                value={eksisterendeGaeld}
                onChange={(e) => setEksisterendeGaeld(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <fieldset>
            <legend className={labelClass}>Bankens gældsfaktor</legend>
            <div className="flex gap-2" role="group" aria-label="Bankens gældsfaktor">
              {GAELDSFAKTOR_VALG.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={gaeldsfaktor === n}
                  onClick={() => setGaeldsfaktor(n)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    gaeldsfaktor === n
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {n.toLocaleString("da-DK")}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              4 er Finanstilsynets referencepunkt. Har du mere end {UDBETALING_MIN_PCT} % i
              udbetaling, tillader nogle banker 5.
            </p>
          </fieldset>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Du kan købe bolig for op til
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {kr(resultat.maksBoligpris)} kr.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Lån op til</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {kr(resultat.laanVedMaks)} kr.
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Udbetaling ({UDBETALING_MIN_PCT} %)
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {kr(resultat.kraevUdbetaling)} kr.
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Realkredit ({REALKREDIT_MAKS_PCT} %)
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {kr(resultat.realkreditDel)} kr.
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Banklån (15 %)</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {kr(resultat.banklaanDel)} kr.
                </div>
              </div>
            </div>

            <p className="text-sm text-center text-gray-700 dark:text-gray-300">{binder}</p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tallet er et skøn ud fra indkomst, udbetaling og gældsfaktor. Banken vurderer
              også dit rådighedsbeløb og din økonomi i øvrigt, og en rentestigning kan sænke
              beløbet. Kontakt din bank for en præcis vurdering.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={`Med ${kr(resultat.husstandsindkomst)} kr. i indkomst og ${kr(resultat.udbetaling)} kr. i udbetaling kan du købe bolig for op til ${kr(resultat.maksBoligpris)} kr.`}
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Lånekapacitet"
          resultSummary={`Du kan købe bolig for op til ${kr(resultat.maksBoligpris)} kr.`}
        />
      </div>
    </div>
  );
}
