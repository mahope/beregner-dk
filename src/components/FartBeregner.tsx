"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnFart, FartMaal } from "@/lib/fart";

const labels = {
  da: {
    calc: "Beregn",
    fart: "Fart",
    distance: "Distance",
    tid: "Tid",
    speedField: "Fart (km/t)",
    distField: "Distance (km)",
    hours: "Timer",
    minutes: "Minutter",
    result: "Resultat",
    pace: "Tempo",
    perKm: "min/km",
    speedUnit: "km/t",
    name: "Fartberegner",
    note: "Beregn fart, distance eller tid ud fra de to andre. Tempo vises som minutter pr. kilometer — nyttigt til løb og cykling.",
    hUnit: "t",
    mUnit: "min",
  },
  se: {
    calc: "Beräkna",
    fart: "Hastighet",
    distance: "Sträcka",
    tid: "Tid",
    speedField: "Hastighet (km/h)",
    distField: "Sträcka (km)",
    hours: "Timmar",
    minutes: "Minuter",
    result: "Resultat",
    pace: "Tempo",
    perKm: "min/km",
    speedUnit: "km/h",
    name: "Hastighetskalkylator",
    note: "Beräkna hastighet, sträcka eller tid utifrån de två andra. Tempo visas som minuter per kilometer — användbart för löpning och cykling.",
    hUnit: "h",
    mUnit: "min",
  },
} as const;

export default function FartBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      maximumFractionDigits: 2,
    });

  const [maal, setMaal] = useState<FartMaal>("fart");
  const [speed, setSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<number>(10);
  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(0);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "fart") {
      const i = urlState.inputs;
      if (i.maal === "fart" || i.maal === "distance" || i.maal === "tid") setMaal(i.maal);
      if (i.speed !== undefined) setSpeed(Number(i.speed));
      if (i.distance !== undefined) setDistance(Number(i.distance));
      if (i.hours !== undefined) setHours(Number(i.hours));
      if (i.minutes !== undefined) setMinutes(Number(i.minutes));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("fart");
    const timer = setTimeout(() => {
      trackCalculation("fart");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setMaal("fart");
    setSpeed(0);
    setDistance(10);
    setHours(1);
    setMinutes(0);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "fart",
      inputs: { maal, speed, distance, hours, minutes },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [maal, speed, distance, hours, minutes]);

  const tid = hours + minutes / 60;
  const r = useMemo(() => beregnFart(maal, speed, distance, tid), [maal, speed, distance, tid]);

  const tidText = (t: number) => {
    const h = Math.floor(t);
    const m = Math.round((t - h) * 60);
    return `${h} ${l.hUnit} ${m} ${l.mUnit}`;
  };

  const modeBtn = (m: FartMaal, text: string) => (
    <button key={m} type="button" onClick={() => setMaal(m)}
      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        maal === m
          ? "bg-blue-600 text-white"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}>
      {text}
    </button>
  );

  const numField = (label: string, value: number, onChange: (n: number) => void, unit: string) => (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type="number" min="0" step="0.1" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-14 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">{unit}</span>
      </div>
    </div>
  );

  const timeFields = (
    <div className="grid grid-cols-2 gap-3">
      {numField(l.hours, hours, setHours, l.hUnit)}
      {numField(l.minutes, minutes, setMinutes, l.mUnit)}
    </div>
  );

  const mainResult = () => {
    if (!r) return { label: l.result, value: "—" };
    if (maal === "fart") return { label: l.fart, value: `${fmt(r.fart)} ${l.speedUnit}` };
    if (maal === "distance") return { label: l.distance, value: `${fmt(r.distance)} km` };
    return { label: l.tid, value: tidText(r.tid) };
  };
  const mr = mainResult();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.calc}</label>
            <div className="grid grid-cols-3 gap-2">
              {modeBtn("fart", l.fart)}
              {modeBtn("distance", l.distance)}
              {modeBtn("tid", l.tid)}
            </div>
          </div>

          {maal !== "fart" && numField(l.speedField, speed, setSpeed, l.speedUnit)}
          {maal !== "distance" && numField(l.distField, distance, setDistance, "km")}
          {maal !== "tid" && timeFields}

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

            {r && r.fart > 0 && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.pace}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(r.paceMinPrKm)} {l.perKm}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${mr.label}: ${mr.value}`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${mr.label}: ${mr.value}`} />
      </div>
    </div>
  );
}
