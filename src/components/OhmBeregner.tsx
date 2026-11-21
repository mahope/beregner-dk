"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnOhm, OhmMaal } from "@/lib/ohm";

const labels = {
  da: {
    calc: "Beregn",
    voltage: "Spænding",
    current: "Strøm",
    resistance: "Modstand",
    voltField: "Spænding (V)",
    currField: "Strøm (A)",
    resField: "Modstand (Ω)",
    power: "Effekt",
    name: "Ohms lov beregner",
    note: "Ohms lov: spænding = strøm × modstand (V = I × R). Effekten beregnes som P = V × I. Enheder: volt (V), ampere (A), ohm (Ω), watt (W).",
  },
  se: {
    calc: "Beräkna",
    voltage: "Spänning",
    current: "Ström",
    resistance: "Resistans",
    voltField: "Spänning (V)",
    currField: "Ström (A)",
    resField: "Resistans (Ω)",
    power: "Effekt",
    name: "Ohms lag kalkylator",
    note: "Ohms lag: spänning = ström × resistans (V = I × R). Effekten beräknas som P = V × I. Enheter: volt (V), ampere (A), ohm (Ω), watt (W).",
  },
} as const;

export default function OhmBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", { maximumFractionDigits: 3 });

  const [maal, setMaal] = useState<OhmMaal>("spaending");
  const [volt, setVolt] = useState<number>(0);
  const [amp, setAmp] = useState<number>(2);
  const [ohm, setOhm] = useState<number>(12);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "ohm") {
      const i = urlState.inputs;
      if (i.maal === "spaending" || i.maal === "stroem" || i.maal === "modstand") setMaal(i.maal);
      if (i.volt !== undefined) setVolt(Number(i.volt));
      if (i.amp !== undefined) setAmp(Number(i.amp));
      if (i.ohm !== undefined) setOhm(Number(i.ohm));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("ohm");
    const timer = setTimeout(() => {
      trackCalculation("ohm");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setMaal("spaending");
    setVolt(0);
    setAmp(2);
    setOhm(12);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "ohm",
      inputs: { maal, volt, amp, ohm },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [maal, volt, amp, ohm]);

  const r = useMemo(() => beregnOhm(maal, volt, amp, ohm), [maal, volt, amp, ohm]);

  const modeBtn = (m: OhmMaal, text: string) => (
    <button key={m} type="button" onClick={() => setMaal(m)}
      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        maal === m ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}>
      {text}
    </button>
  );

  const field = (label: string, value: number, onChange: (n: number) => void, unit: string) => (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type="number" min="0" step="any" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{unit}</span>
      </div>
    </div>
  );

  const mr = r
    ? maal === "spaending"
      ? { label: l.voltage, value: `${fmt(r.spaending)} V` }
      : maal === "stroem"
        ? { label: l.current, value: `${fmt(r.stroem)} A` }
        : { label: l.resistance, value: `${fmt(r.modstand)} Ω` }
    : { label: l.voltage, value: "—" };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.calc}</label>
            <div className="grid grid-cols-3 gap-2">
              {modeBtn("spaending", l.voltage)}
              {modeBtn("stroem", l.current)}
              {modeBtn("modstand", l.resistance)}
            </div>
          </div>
          {maal !== "spaending" && field(l.voltField, volt, setVolt, "V")}
          {maal !== "stroem" && field(l.currField, amp, setAmp, "A")}
          {maal !== "modstand" && field(l.resField, ohm, setOhm, "Ω")}
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{mr.label}</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{mr.value}</div>
            </div>
            {r && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.power}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{fmt(r.effekt)} W</div>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${mr.label}: ${mr.value}`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name} resultSummary={`${mr.label}: ${mr.value}`} />
      </div>
    </div>
  );
}
