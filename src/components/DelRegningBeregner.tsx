"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { delRegning } from "@/lib/del-regning";

const labels = {
  da: {
    total: "Regningens beløb",
    people: "Antal personer",
    tip: "Drikkepenge",
    perPerson: "Pr. person",
    tipAmount: "Drikkepenge",
    grandTotal: "I alt med drikkepenge",
    name: "Del regningen",
    note: "Del en regning ligeligt mellem flere personer. Drikkepenge er valgfrit — i Danmark er de ikke forventede, men altid velkomne ved god service.",
  },
  se: {
    total: "Notans belopp",
    people: "Antal personer",
    tip: "Dricks",
    perPerson: "Per person",
    tipAmount: "Dricks",
    grandTotal: "Totalt med dricks",
    name: "Dela notan",
    note: "Dela en nota jämnt mellan flera personer. Dricks är valfritt — i Sverige förväntas det inte, men uppskattas vid bra service.",
  },
} as const;

const TIP_PRESETS = [0, 5, 10, 15];

export default function DelRegningBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const [total, setTotal] = useState<number>(500);
  const [people, setPeople] = useState<number>(4);
  const [tip, setTip] = useState<number>(0);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "delregning") {
      const i = urlState.inputs;
      if (i.total !== undefined) setTotal(Number(i.total));
      if (i.people !== undefined) setPeople(Number(i.people));
      if (i.tip !== undefined) setTip(Number(i.tip));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("delregning");
    const timer = setTimeout(() => {
      trackCalculation("delregning");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setTotal(500);
    setPeople(4);
    setTip(0);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "delregning",
      inputs: { total, people, tip },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [total, people, tip]);

  const r = useMemo(() => delRegning(total, people, tip), [total, people, tip]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.total}</label>
            <div className="relative">
              <input type="number" min="0" step="1" value={total} onChange={(e) => setTotal(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.people}</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPeople(Math.max(1, people - 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-lg font-bold">−</button>
              <input type="number" min="1" value={people} onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))}
                className="flex-1 text-center px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <button type="button" onClick={() => setPeople(people + 1)}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-lg font-bold">+</button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.tip} (%)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {TIP_PRESETS.map((p) => (
                <button key={p} type="button" onClick={() => setTip(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tip === p
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}>
                  {p}%
                </button>
              ))}
            </div>
            <div className="relative">
              <input type="number" min="0" step="1" value={tip} onChange={(e) => setTip(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{l.perPerson}</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{r ? fmt(r.prPerson) : "0,00"} kr</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{l.tipAmount}</span>
                <span className="font-medium dark:text-gray-200">{r ? fmt(r.drikkepenge) : "0,00"} kr</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">{l.grandTotal}</span>
                <span className="font-medium dark:text-gray-200">{r ? fmt(r.totalMedDrikkepenge) : "0,00"} kr</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.perPerson}: ${r ? fmt(r.prPerson) : "0,00"} kr`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.perPerson}: ${r ? fmt(r.prPerson) : "0,00"} kr`} />
      </div>
    </div>
  );
}
