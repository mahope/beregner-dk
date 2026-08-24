"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnRygestopBesparelse } from "@/lib/rygestop";

const labels = {
  da: {
    cigaretter: "Cigaretter pr. dag",
    pakkepris: "Pris pr. pakke",
    pakkestoerrelse: "Cigaretter pr. pakke",
    resultHeading: "Så meget kan du spare ved at holde op",
    dag: "Pr. dag",
    maaned: "Pr. måned",
    aar: "Pr. år",
    femAar: "Over 5 år",
    pakkerAar: "Pakker om året",
    calcName: "Rygestop-besparelse",
  },
} as const;

export default function RygestopBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString("da-DK", { maximumFractionDigits: 0 });

  const [cigaretterPrDag, setCigaretterPrDag] = useState(15);
  const [pakkeprisKr, setPakkeprisKr] = useState(60);
  const [cigaretterPrPakke, setCigaretterPrPakke] = useState(20);

  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "rygestop") {
      const i = urlState.inputs;
      if (i.cigaretterPrDag !== undefined) setCigaretterPrDag(Number(i.cigaretterPrDag));
      if (i.pakkeprisKr !== undefined) setPakkeprisKr(Number(i.pakkeprisKr));
      if (i.cigaretterPrPakke !== undefined) setCigaretterPrPakke(Number(i.cigaretterPrPakke));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("rygestop");
    const timer = setTimeout(() => {
      trackCalculation("rygestop");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setCigaretterPrDag(15);
    setPakkeprisKr(60);
    setCigaretterPrPakke(20);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "rygestop",
      inputs: { cigaretterPrDag, pakkeprisKr, cigaretterPrPakke },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [cigaretterPrDag, pakkeprisKr, cigaretterPrPakke]);

  const r = useMemo(
    () => beregnRygestopBesparelse(cigaretterPrDag, pakkeprisKr, cigaretterPrPakke),
    [cigaretterPrDag, pakkeprisKr, cigaretterPrPakke]
  );

  const inputCls = "w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>{l.cigaretter}</label>
          <div className="relative">
            <input type="number" min="1" max="100" step="1" value={cigaretterPrDag} onChange={(e) => setCigaretterPrDag(Number(e.target.value))} className={inputCls} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">stk</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>{l.pakkepris}</label>
          <div className="relative">
            <input type="number" min="1" max="500" step="0.5" value={pakkeprisKr} onChange={(e) => setPakkeprisKr(Number(e.target.value))} className={inputCls} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>{l.pakkestoerrelse}</label>
          <div className="relative">
            <input type="number" min="1" max="100" step="1" value={cigaretterPrPakke} onChange={(e) => setCigaretterPrPakke(Number(e.target.value))} className={inputCls} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">stk</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Standardpakken i Danmark indeholder 20.</p>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <ResetButton onReset={handleReset} />
      </div>

      {r && (
        <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">{l.resultHeading}</p>
          <div className="rounded-lg p-4 text-center bg-emerald-100 dark:bg-emerald-900/30 mb-4">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">{l.aar}</p>
            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(r.aar)} kr</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.dag}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(r.dag)} kr</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.maaned}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(r.maaned)} kr</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm col-span-2 md:col-span-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.femAar}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(r.femAar)} kr</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Det svarer til {fmt(Math.round(r.pakkerPrAar))} cigaretpakker om året.
          </p>

          <div className="flex justify-center mt-4 gap-3">
            <CopyResultButton
              text={`Rygestop-besparelse: ${fmt(r.dag)} kr/dag · ${fmt(r.maaned)} kr/måned · ${fmt(r.aar)} kr/år`}
            />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName={l.calcName}
              resultSummary={`${fmt(r.aar)} kr om året`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
