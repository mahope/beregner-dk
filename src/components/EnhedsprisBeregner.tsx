"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { sammenlignEnhedspris } from "@/lib/enhedspris";

const labels = {
  da: {
    unit: "Enhed",
    productA: "Vare A",
    productB: "Vare B",
    price: "Pris",
    amount: "Mængde",
    unitPrice: "Pris pr. enhed",
    cheapest: "Billigst",
    equal: "Præcis samme pris pr. enhed",
    saving: "billigere pr. enhed",
    note: "Sammenlign to varer med forskellig størrelse. Indtast pris og mængde i samme enhed (fx kg, liter eller stk).",
    name: "Enhedspris",
    aCheaper: "Vare A er billigst",
    bCheaper: "Vare B er billigst",
  },
  se: {
    unit: "Enhet",
    productA: "Vara A",
    productB: "Vara B",
    price: "Pris",
    amount: "Mängd",
    unitPrice: "Jämförpris",
    cheapest: "Billigast",
    equal: "Exakt samma jämförpris",
    saving: "billigare per enhet",
    note: "Jämför två varor med olika storlek. Ange pris och mängd i samma enhet (t.ex. kg, liter eller st).",
    name: "Jämförpris",
    aCheaper: "Vara A är billigast",
    bCheaper: "Vara B är billigast",
  },
} as const;

const UNITS = ["kg", "g", "l", "cl", "stk", "m"];

export default function EnhedsprisBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const [unit, setUnit] = useState<string>("kg");
  const [priceA, setPriceA] = useState<number>(20);
  const [amountA, setAmountA] = useState<number>(1);
  const [priceB, setPriceB] = useState<number>(35);
  const [amountB, setAmountB] = useState<number>(2);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "enhedspris") {
      const i = urlState.inputs;
      if (typeof i.unit === "string") setUnit(i.unit);
      if (i.priceA !== undefined) setPriceA(Number(i.priceA));
      if (i.amountA !== undefined) setAmountA(Number(i.amountA));
      if (i.priceB !== undefined) setPriceB(Number(i.priceB));
      if (i.amountB !== undefined) setAmountB(Number(i.amountB));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("enhedspris");
    const timer = setTimeout(() => {
      trackCalculation("enhedspris");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setUnit("kg");
    setPriceA(20);
    setAmountA(1);
    setPriceB(35);
    setAmountB(2);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "enhedspris",
      inputs: { unit, priceA, amountA, priceB, amountB },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [unit, priceA, amountA, priceB, amountB]);

  const r = useMemo(
    () => sammenlignEnhedspris(priceA, amountA, priceB, amountB),
    [priceA, amountA, priceB, amountB]
  );

  const productCol = (
    title: string,
    price: number, setPrice: (n: number) => void,
    amount: number, setAmount: (n: number) => void,
    isCheapest: boolean
  ) => (
    <div className={`rounded-xl p-4 border-2 ${isCheapest ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700"}`}>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">{title}</p>
      <div className="space-y-2">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{l.price}</label>
          <div className="relative">
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{l.amount}</label>
          <div className="relative">
            <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.unit}</label>
            <div className="flex flex-wrap gap-2">
              {UNITS.map((u) => (
                <button key={u} type="button" onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    unit === u
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}>
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {productCol(l.productA, priceA, setPriceA, amountA, setAmountA, r?.billigst === "A")}
            {productCol(l.productB, priceB, setPriceB, amountB, setAmountB, r?.billigst === "B")}
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-green-100 dark:bg-green-900/30">
              <div className="text-sm font-medium text-green-800 dark:text-green-300">{l.cheapest}</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {r?.billigst === "lige" ? "=" : r?.billigst === "A" ? l.aCheaper : l.bCheaper}
              </div>
              {r && r.billigst !== "lige" && (
                <div className="text-xs mt-1 text-green-700 dark:text-green-400">
                  {fmt(r.besparelseProcent)} % {l.saving}
                </div>
              )}
              {r?.billigst === "lige" && (
                <div className="text-xs mt-1 text-green-700 dark:text-green-400">{l.equal}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.productA}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{r ? fmt(r.enhedsprisA) : "0,00"}</div>
                <div className="text-xs text-gray-400">kr/{unit}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.productB}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{r ? fmt(r.enhedsprisB) : "0,00"}</div>
                <div className="text-xs text-gray-400">kr/{unit}</div>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.productA}: ${r ? fmt(r.enhedsprisA) : "0,00"} kr/${unit} · ${l.productB}: ${r ? fmt(r.enhedsprisB) : "0,00"} kr/${unit}`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={r?.billigst === "A" ? l.aCheaper : r?.billigst === "B" ? l.bCheaper : l.equal} />
      </div>
    </div>
  );
}
