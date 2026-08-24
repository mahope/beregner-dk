"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnAlkoholenheder } from "@/lib/alkoholenheder";

const labels = {
  da: {
    volume: "Mængde pr. drink",
    abv: "Alkoholprocent",
    antal: "Antal drinks",
    resultHeading: "Antal alkoholenheder (genstande)",
    enhederPrDrink: "Pr. drink",
    enhederTotal: "I alt",
    gramPrDrink: "Gram alkohol pr. drink",
    gramTotal: "Gram alkohol i alt",
    calcName: "Alkoholenheder",
    cl: "cl",
    pct: "%",
    vejledende: "Beregningen er vejledende. Alkoholindhold i praktiske serveringer kan afvige."
  },
} as const;

const defaultDrinks = [
  { label: "Almindelig øl (33 cl, 4,6%)", volume: 33, abv: 4.6 },
  { label: "Stærk øl (33 cl, 8%)", volume: 33, abv: 8 },
  { label: "Vin (12 cl, 12%)", volume: 12, abv: 12 },
  { label: "Vin (18 cl, 12%)", volume: 18, abv: 12 },
  { label: "Hvidvin (16 cl, 12%)", volume: 16, abv: 12 },
  { label: "Flaske øl (50 cl, 4,6%)", volume: 50, abv: 4.6 },
  { label: "Alkoholfri øl (33 cl, 0,5%)", volume: 33, abv: 0.5 },
  { label: "Cider (33 cl, 4,5%)", volume: 33, abv: 4.5 },
  { label: "Shot (4 cl, 40%)", volume: 4, abv: 40 },
  { label: "Likør (4 cl, 24%)", volume: 4, abv: 24 },
];

export default function AlkoholenhederBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString("da-DK", { maximumFractionDigits: 1 });

  const [volumeCl, setVolumeCl] = useState(33);
  const [abvPct, setAbvPct] = useState(4.6);
  const [antal, setAntal] = useState(1);

  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "alkoholenheder") {
      const i = urlState.inputs;
      if (i.volumeCl !== undefined) setVolumeCl(Number(i.volumeCl));
      if (i.abvPct !== undefined) setAbvPct(Number(i.abvPct));
      if (i.antal !== undefined) setAntal(Number(i.antal));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("alkoholenheder");
    const timer = setTimeout(() => {
      trackCalculation("alkoholenheder");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setVolumeCl(33);
    setAbvPct(4.6);
    setAntal(1);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "alkoholenheder",
      inputs: { volumeCl, abvPct, antal },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [volumeCl, abvPct, antal]);

  const r = useMemo(
    () => beregnAlkoholenheder(volumeCl, abvPct, antal),
    [volumeCl, abvPct, antal]
  );

  const inputCls = "w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";

  return (
    <div>
      <div className="mb-4">
        <label className={labelCls}>{l.volume}</label>
        <div className="relative">
          <input type="number" min="1" max="500" step="1" value={volumeCl} onChange={(e) => setVolumeCl(Number(e.target.value))} className={inputCls} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{l.cl}</span>
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>{l.abv}</label>
        <div className="relative">
          <input type="number" min="0.1" max="100" step="0.1" value={abvPct} onChange={(e) => setAbvPct(Number(e.target.value))} className={inputCls} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{l.pct}</span>
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>{l.antal}</label>
        <div className="relative">
          <input type="number" min="0.1" max="100" step="0.5" value={antal} onChange={(e) => setAntal(Number(e.target.value))} className={inputCls} />
        </div>
      </div>

      <details className="mb-4">
        <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer font-medium">Almindelige serveringer</summary>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {defaultDrinks.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => { setVolumeCl(d.volume); setAbvPct(d.abv); }}
              className="text-left px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {d.label}
            </button>
          ))}
        </div>
      </details>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {r && (
        <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">{l.resultHeading}</p>
          <div className="rounded-lg p-4 text-center bg-purple-100 dark:bg-purple-900/30 mb-4">
            <p className="text-xs text-purple-700 dark:text-purple-300">{l.enhederTotal}</p>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{fmt(r.enhederTotal)} genstande</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.enhederPrDrink}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(r.enhederPrDrink)}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.gramTotal}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(r.alkoholGramTotal)} g</p>
            </div>
          </div>

          <div className="flex justify-center mt-4 gap-3">
            <CopyResultButton
              text={`Alkoholenheder: ${fmt(r.enhederTotal)} genstande (${fmt(r.alkoholGramTotal)} g alkohol)`}
            />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName={l.calcName}
              resultSummary={`${fmt(r.enhederTotal)} genstande`}
            />
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">{l.vejledende}</p>
        </div>
      )}
    </div>
  );
}