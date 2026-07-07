"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnMotionKalorier, findAktivitet, AKTIVITETER } from "@/lib/motion-kalorier";

const labels = {
  da: {
    activity: "Aktivitet",
    weight: "Kropsvægt",
    duration: "Varighed",
    minutes: "min",
    result: "Forbrændte kalorier",
    perHour: "svarer til pr. time",
    name: "Kalorieforbrænding ved motion",
    note: "Estimeret ud fra MET-værdier (Compendium of Physical Activities). Det faktiske forbrug afhænger af intensitet, kondition og stofskifte.",
    act: {
      gang: "Gang", raskGang: "Rask gang", loeb: "Løb", cykling: "Cykling",
      svoemning: "Svømning", styrketraening: "Styrketræning", yoga: "Yoga",
      fodbold: "Fodbold", dans: "Dans", roning: "Roning",
    } as Record<string, string>,
  },
  se: {
    activity: "Aktivitet",
    weight: "Kroppsvikt",
    duration: "Längd",
    minutes: "min",
    result: "Förbrända kalorier",
    perHour: "motsvarar per timme",
    name: "Kaloriförbränning vid motion",
    note: "Uppskattat utifrån MET-värden (Compendium of Physical Activities). Den faktiska förbrukningen beror på intensitet, kondition och ämnesomsättning.",
    act: {
      gang: "Promenad", raskGang: "Rask promenad", loeb: "Löpning", cykling: "Cykling",
      svoemning: "Simning", styrketraening: "Styrketräning", yoga: "Yoga",
      fodbold: "Fotboll", dans: "Dans", roning: "Rodd",
    } as Record<string, string>,
  },
} as const;

export default function MotionKalorierBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => Math.round(n).toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  const [activity, setActivity] = useState<string>("loeb");
  const [weight, setWeight] = useState<number>(75);
  const [duration, setDuration] = useState<number>(30);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "motionkalorier") {
      const i = urlState.inputs;
      if (typeof i.activity === "string") setActivity(i.activity);
      if (i.weight !== undefined) setWeight(Number(i.weight));
      if (i.duration !== undefined) setDuration(Number(i.duration));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("motionkalorier");
    const timer = setTimeout(() => {
      trackCalculation("motionkalorier");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setActivity("loeb");
    setWeight(75);
    setDuration(30);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "motionkalorier",
      inputs: { activity, weight, duration },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [activity, weight, duration]);

  const met = findAktivitet(activity)?.met ?? 0;
  const kcal = useMemo(() => beregnMotionKalorier(met, weight, duration), [met, weight, duration]);
  const perHour = useMemo(() => beregnMotionKalorier(met, weight, 60), [met, weight]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.activity}</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {AKTIVITETER.map((a) => (
                <option key={a.id} value={a.id}>{l.act[a.id]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.weight}</label>
            <div className="relative">
              <input type="number" min="0" step="1" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.duration}</label>
            <div className="relative">
              <input type="number" min="0" step="5" value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{l.minutes}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{l.result}</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{kcal ? fmt(kcal) : "—"} kcal</div>
            </div>
            {perHour && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.perHour}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{fmt(perHour)} kcal</div>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.result}: ${kcal ? fmt(kcal) : "—"} kcal`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.result}: ${kcal ? fmt(kcal) : "—"} kcal`} />
      </div>
    </div>
  );
}
