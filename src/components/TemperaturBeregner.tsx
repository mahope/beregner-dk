"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { konverterTemperatur, TempEnhed } from "@/lib/temperatur";

const labels = {
  da: {
    value: "Temperatur",
    from: "Fra enhed",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    name: "Temperaturberegner",
    note: "Omregn mellem Celsius, Fahrenheit og Kelvin. Vand fryser ved 0 °C (32 °F) og koger ved 100 °C (212 °F).",
  },
  se: {
    value: "Temperatur",
    from: "Från enhet",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    kelvin: "Kelvin",
    name: "Temperaturkalkylator",
    note: "Omvandla mellan Celsius, Fahrenheit och Kelvin. Vatten fryser vid 0 °C (32 °F) och kokar vid 100 °C (212 °F).",
  },
} as const;

export default function TemperaturBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      maximumFractionDigits: 2,
    });

  const [value, setValue] = useState<number>(20);
  const [from, setFrom] = useState<TempEnhed>("celsius");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "temperatur") {
      const i = urlState.inputs;
      if (i.value !== undefined) setValue(Number(i.value));
      if (i.from === "celsius" || i.from === "fahrenheit" || i.from === "kelvin") setFrom(i.from);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("temperatur");
    const timer = setTimeout(() => {
      trackCalculation("temperatur");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setValue(20);
    setFrom("celsius");
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "temperatur",
      inputs: { value, from },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [value, from]);

  const r = useMemo(() => konverterTemperatur(value, from), [value, from]);

  const unitBtn = (u: TempEnhed, text: string) => (
    <button key={u} type="button" onClick={() => setFrom(u)}
      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        from === u
          ? "bg-blue-600 text-white"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}>
      {text}
    </button>
  );

  const resultCard = (label: string, value: number, symbol: string, highlight: boolean) => (
    <div className={`rounded-lg p-4 text-center ${highlight ? "bg-blue-100 dark:bg-blue-900/30" : "bg-white dark:bg-gray-700 shadow-sm"}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
        {fmt(value)}{symbol}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.value}</label>
            <input type="number" step="0.1" value={value} onChange={(e) => setValue(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.from}</label>
            <div className="grid grid-cols-3 gap-2">
              {unitBtn("celsius", "°C")}
              {unitBtn("fahrenheit", "°F")}
              {unitBtn("kelvin", "K")}
            </div>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-3 animate-fade-in">
            {resultCard(l.celsius, r ? r.celsius : 0, " °C", from === "celsius")}
            {resultCard(l.fahrenheit, r ? r.fahrenheit : 0, " °F", from === "fahrenheit")}
            {resultCard(l.kelvin, r ? r.kelvin : 0, " K", from === "kelvin")}
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${fmt(r?.celsius ?? 0)} °C = ${fmt(r?.fahrenheit ?? 0)} °F = ${fmt(r?.kelvin ?? 0)} K`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${fmt(r?.celsius ?? 0)} °C = ${fmt(r?.fahrenheit ?? 0)} °F`} />
      </div>
    </div>
  );
}
