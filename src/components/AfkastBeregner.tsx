"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnAfkast } from "@/lib/afkast";

const labels = {
  da: {
    start: "Startbeløb (investeret)",
    end: "Slutværdi (i dag)",
    years: "Antal år (valgfrit)",
    yearsUnit: "år",
    roi: "Samlet afkast",
    gain: "Gevinst",
    annual: "Årligt afkast (CAGR)",
    name: "Afkastberegner",
    note: "Beregn dit afkast (ROI) og det gennemsnitlige årlige afkast (CAGR). Historisk afkast er ingen garanti for fremtidigt afkast.",
  },
  se: {
    start: "Startbelopp (investerat)",
    end: "Slutvärde (idag)",
    years: "Antal år (valfritt)",
    yearsUnit: "år",
    roi: "Total avkastning",
    gain: "Vinst",
    annual: "Årlig avkastning (CAGR)",
    name: "Avkastningskalkylator",
    note: "Beräkna din avkastning (ROI) och den genomsnittliga årliga avkastningen (CAGR). Historisk avkastning är ingen garanti för framtida avkastning.",
  },
} as const;

export default function AfkastBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmtKr = (n: number) => Math.round(n).toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");
  const fmtPct = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", { maximumFractionDigits: 2 });

  const [start, setStart] = useState<number>(10000);
  const [end, setEnd] = useState<number>(13000);
  const [years, setYears] = useState<number>(3);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "afkast") {
      const i = urlState.inputs;
      if (i.start !== undefined) setStart(Number(i.start));
      if (i.end !== undefined) setEnd(Number(i.end));
      if (i.years !== undefined) setYears(Number(i.years));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("afkast");
    const timer = setTimeout(() => {
      trackCalculation("afkast");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setStart(10000);
    setEnd(13000);
    setYears(3);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "afkast",
      inputs: { start, end, years },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [start, end, years]);

  const r = useMemo(() => beregnAfkast(start, end, years), [start, end, years]);
  const positive = r ? r.gevinst >= 0 : true;

  const field = (label: string, value: number, onChange: (n: number) => void, unit: string, step = "100") => (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type="number" min="0" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {field(l.start, start, setStart, "kr")}
          {field(l.end, end, setEnd, "kr")}
          {field(l.years, years, setYears, l.yearsUnit, "1")}
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className={`rounded-lg p-4 text-center ${positive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              <div className={`text-sm font-medium ${positive ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>{l.roi}</div>
              <div className={`text-4xl font-bold ${positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {r ? fmtPct(r.afkastProcent) : "—"} %
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{l.gain}</span>
                <span className="font-medium dark:text-gray-200">{r ? fmtKr(r.gevinst) : "—"} kr</span>
              </div>
              {r && r.aarligProcent !== null && (
                <div className="flex justify-between border-t pt-1.5 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">{l.annual}</span>
                  <span className="font-medium dark:text-gray-200">{fmtPct(r.aarligProcent)} %</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.roi}: ${r ? fmtPct(r.afkastProcent) : "—"} %`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.roi}: ${r ? fmtPct(r.afkastProcent) : "—"} %`} />
      </div>
    </div>
  );
}
