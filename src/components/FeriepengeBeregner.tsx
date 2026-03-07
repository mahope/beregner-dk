"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

export default function FeriepengeBeregner() {
  const [bruttoLoen, setBruttoLoen] = useState<number>(40000);
  const [periode, setPeriode] = useState<"maaned" | "aar">("maaned");
  const [feriedage, setFeriedage] = useState<number>(25);
  const [samletFerie, setSamletFerie] = useState(true);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'feriepenge') {
      const inputs = urlState.inputs;
      if (inputs.bruttoLoen !== undefined) setBruttoLoen(inputs.bruttoLoen);
      if (inputs.periode) setPeriode(inputs.periode);
      if (inputs.feriedage !== undefined) setFeriedage(inputs.feriedage);
      if (inputs.samletFerie !== undefined) setSamletFerie(inputs.samletFerie);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("feriepenge");
    const timer = setTimeout(() => {
      trackCalculation("feriepenge");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'feriepenge',
      inputs: { bruttoLoen, periode, feriedage, samletFerie },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [bruttoLoen, periode, feriedage, samletFerie]);

  const handleReset = useCallback(() => {
    setBruttoLoen(40000);
    setPeriode("maaned");
    setFeriedage(25);
    setSamletFerie(true);
  }, []);

  const beregning = useMemo(() => {
    // Konverter til årlig løn
    const aarligBrutto = periode === "maaned" ? bruttoLoen * 12 : bruttoLoen;
    
    // Ferieberettiget løn (inkl. feriepenge-grundlag)
    const ferieberettigetLoen = aarligBrutto;
    
    // Feriepenge: 12,5% af ferieberettiget løn
    const feriepengeTotal = ferieberettigetLoen * 0.125;
    
    // AM-bidrag (8%) af feriepenge
    const amBidrag = feriepengeTotal * 0.08;
    const feriepengeEfterAM = feriepengeTotal - amBidrag;
    
    // Estimeret skat (ca. 38% efter AM)
    const skatPct = 0.38;
    const skat = feriepengeEfterAM * skatPct;
    const feriepengeNetto = feriepengeEfterAM - skat;
    
    // Per feriedag (25 dage = fuld ferie)
    const perDagBrutto = feriepengeTotal / 25;
    const perDagNetto = feriepengeNetto / 25;
    
    // Hvis ikke alle dage
    const udbetalingBrutto = (feriepengeTotal / 25) * feriedage;
    const udbetalingNetto = (feriepengeNetto / 25) * feriedage;

    return {
      ferieberettigetLoen,
      feriepengeTotal,
      amBidrag,
      feriepengeEfterAM,
      skat,
      feriepengeNetto,
      perDagBrutto,
      perDagNetto,
      udbetalingBrutto,
      udbetalingNetto,
    };
  }, [bruttoLoen, periode, feriedage]);

  const formatKr = (beloeb: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(beloeb);
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Bruttoløn ({periode === "maaned" ? "pr. måned" : "pr. år"})
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                value={bruttoLoen}
                onChange={(e) => setBruttoLoen(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">kr</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Periode</label>
            <div className="flex gap-4">
              <button
                onClick={() => setPeriode("maaned")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  periode === "maaned"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
                }`}
              >
                Månedlig løn
              </button>
              <button
                onClick={() => setPeriode("aar")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  periode === "aar"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
                }`}
              >
                Årlig løn
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Antal feriedage at udbetale
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="25"
                value={feriedage}
                onChange={(e) => setFeriedage(parseInt(e.target.value) || 25)}
                className="w-full px-4 py-3 pr-14 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm dark:text-gray-400">dage</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              Fuld ferie = 25 dage (5 uger)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="samletFerie"
              checked={samletFerie}
              onChange={(e) => setSamletFerie(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="samletFerie" className="text-sm dark:text-gray-200">
              Vis samlet årlig feriepenge
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-green-100 rounded-xl text-center dark:bg-green-900/20">
          <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">
            Du får udbetalt ({feriedage} dage)
          </p>
          <p className="text-4xl font-bold text-green-700 dark:text-green-400">
            {formatKr(beregning.udbetalingNetto)}
          </p>
          <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
            (før skat: {formatKr(beregning.udbetalingBrutto)})
          </p>
        </div>
        
        {samletFerie && (
          <div className="p-6 bg-blue-50 rounded-xl text-center dark:bg-blue-900/20">
            <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">Samlet årlig feriepenge</p>
            <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
              {formatKr(beregning.feriepengeNetto)}
            </p>
            <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
              (før skat: {formatKr(beregning.feriepengeTotal)})
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Per feriedag:</strong> {formatKr(beregning.perDagNetto)} netto 
          ({formatKr(beregning.perDagBrutto)} før skat)
        </p>
      </div>

      <div className="flex justify-center">
        <CopyResultButton text={`${formatKr(beregning.udbetalingNetto)} netto for ${feriedage} feriedage`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Feriepengeberegner"
          resultSummary={`${formatKr(beregning.udbetalingNetto)} netto for ${feriedage} feriedage`}
        />
      </div>

      {/* Detaljeret breakdown */}
      <details className="bg-gray-50 rounded-lg dark:bg-gray-800 dark:border dark:border-gray-700">
        <summary className="p-4 cursor-pointer font-medium dark:text-gray-200">
          Se detaljeret beregning
        </summary>
        <div className="p-4 pt-0 space-y-2 text-sm dark:text-gray-300">
          <div className="flex justify-between">
            <span>Ferieberettiget løn (årlig)</span>
            <span>{formatKr(beregning.ferieberettigetLoen)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-2 dark:border-gray-700">
            <span>Feriepenge (12,5%)</span>
            <span>{formatKr(beregning.feriepengeTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>- AM-bidrag (8%)</span>
            <span>{formatKr(beregning.amBidrag)}</span>
          </div>
          <div className="flex justify-between">
            <span>Efter AM-bidrag</span>
            <span>{formatKr(beregning.feriepengeEfterAM)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>- Skat (estimat ~38%)</span>
            <span>{formatKr(beregning.skat)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 text-green-700 dark:border-gray-700 dark:text-green-400">
            <span>Netto feriepenge (25 dage)</span>
            <span>{formatKr(beregning.feriepengeNetto)}</span>
          </div>
        </div>
      </details>
    </div>
  );
}
