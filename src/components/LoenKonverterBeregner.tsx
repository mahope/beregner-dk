"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { konverterLoen, LoenEnhed } from "@/lib/loen-konverter";

const labels = {
  da: {
    amount: "Beløb",
    unit: "Enhed",
    time: "Pr. time",
    maaned: "Pr. måned",
    aar: "Pr. år",
    hours: "Timer pr. uge",
    hourly: "Timeløn",
    monthly: "Månedsløn",
    yearly: "Årsløn",
    note: "Bruttoløn før skat. Beregnet ud fra 52 uger om året. En dansk fuldtidsstilling er typisk 37 timer om ugen.",
    name: "Lønberegner",
    perHour: "kr/time",
    hoursUnit: "t/uge",
  },
  se: {
    amount: "Belopp",
    unit: "Enhet",
    time: "Per timme",
    maaned: "Per månad",
    aar: "Per år",
    hours: "Timmar per vecka",
    hourly: "Timlön",
    monthly: "Månadslön",
    yearly: "Årslön",
    note: "Bruttolön före skatt. Beräknat utifrån 52 veckor om året. En svensk heltid är vanligtvis 40 timmar per vecka.",
    name: "Lönekalkylator",
    perHour: "kr/tim",
    hoursUnit: "tim/v",
  },
} as const;

export default function LoenKonverterBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => Math.round(n).toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  const [amount, setAmount] = useState<number>(locale === "se" ? 40000 : 40000);
  const [unit, setUnit] = useState<LoenEnhed>("maaned");
  const [hours, setHours] = useState<number>(locale === "se" ? 40 : 37);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "loenkonverter") {
      const i = urlState.inputs;
      if (i.amount !== undefined) setAmount(Number(i.amount));
      if (i.unit === "time" || i.unit === "maaned" || i.unit === "aar") setUnit(i.unit);
      if (i.hours !== undefined) setHours(Number(i.hours));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("loenkonverter");
    const timer = setTimeout(() => {
      trackCalculation("loenkonverter");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setAmount(40000);
    setUnit("maaned");
    setHours(locale === "se" ? 40 : 37);
  }, [locale]);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "loenkonverter",
      inputs: { amount, unit, hours },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [amount, unit, hours]);

  const r = useMemo(() => konverterLoen(amount, unit, hours), [amount, unit, hours]);

  const unitBtn = (u: LoenEnhed, text: string) => (
    <button key={u} type="button" onClick={() => setUnit(u)}
      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        unit === u
          ? "bg-blue-600 text-white"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}>
      {text}
    </button>
  );

  const resultRow = (label: string, value: number, unitText: string, highlight: boolean) => (
    <div className={`flex justify-between items-center rounded-lg p-3 ${highlight ? "bg-blue-100 dark:bg-blue-900/30" : "bg-white dark:bg-gray-700 shadow-sm"}`}>
      <span className={`text-sm ${highlight ? "text-blue-800 dark:text-blue-300 font-medium" : "text-gray-600 dark:text-gray-400"}`}>{label}</span>
      <span className={`font-bold ${highlight ? "text-blue-700 dark:text-blue-300 text-lg" : "text-gray-900 dark:text-white"}`}>{value} {unitText}</span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.amount}</label>
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.unit}</label>
            <div className="grid grid-cols-3 gap-2">
              {unitBtn("time", l.time)}
              {unitBtn("maaned", l.maaned)}
              {unitBtn("aar", l.aar)}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.hours}</label>
            <div className="relative">
              <input type="number" min="1" step="0.5" value={hours} onChange={(e) => setHours(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-16 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">{l.hoursUnit}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-3 animate-fade-in">
            {resultRow(l.hourly, r ? Math.round(r.time * 100) / 100 : 0, l.perHour, unit === "time")}
            {resultRow(l.monthly, r ? Math.round(r.maaned) : 0, "kr", unit === "maaned")}
            {resultRow(l.yearly, r ? Math.round(r.aar) : 0, "kr", unit === "aar")}
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.hourly}: ${r ? fmt(r.time) : 0} ${l.perHour} · ${l.monthly}: ${r ? fmt(r.maaned) : 0} kr · ${l.yearly}: ${r ? fmt(r.aar) : 0} kr`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.monthly}: ${r ? fmt(r.maaned) : 0} kr`} />
      </div>
    </div>
  );
}
