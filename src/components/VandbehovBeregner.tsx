"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnVandbehov } from "@/lib/vandbehov";

const labels = {
  da: {
    weight: "Kropsvægt",
    exercise: "Motion i dag",
    result: "Anbefalet væskeindtag",
    glasses: "Svarer til",
    glassesUnit: "glas à 250 ml",
    litres: "liter",
    minutes: "min",
    name: "Vandbehov",
    note: "Vejledende estimat: ca. 35 ml pr. kg plus væske til at erstatte det, du sveder ud ved motion. En del væske kommer også fra mad. Drik mere i varme og ved sygdom.",
  },
  se: {
    weight: "Kroppsvikt",
    exercise: "Motion idag",
    result: "Rekommenderat vätskeintag",
    glasses: "Motsvarar",
    glassesUnit: "glas à 250 ml",
    litres: "liter",
    minutes: "min",
    name: "Vattenbehov",
    note: "Vägledande uppskattning: ca 35 ml per kg plus vätska för att ersätta det du svettas ut vid motion. En del vätska kommer också från mat. Drick mer i värme och vid sjukdom.",
  },
} as const;

export default function VandbehovBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", { maximumFractionDigits: 2 });

  const [weight, setWeight] = useState<number>(75);
  const [exercise, setExercise] = useState<number>(30);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "vandbehov") {
      const i = urlState.inputs;
      if (i.weight !== undefined) setWeight(Number(i.weight));
      if (i.exercise !== undefined) setExercise(Number(i.exercise));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("vandbehov");
    const timer = setTimeout(() => {
      trackCalculation("vandbehov");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setWeight(75);
    setExercise(30);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "vandbehov",
      inputs: { weight, exercise },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [weight, exercise]);

  const r = useMemo(() => beregnVandbehov(weight, exercise), [weight, exercise]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.weight}</label>
            <div className="relative">
              <input type="number" min="0" step="1" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.exercise}</label>
            <div className="relative">
              <input type="number" min="0" step="15" value={exercise} onChange={(e) => setExercise(Number(e.target.value))}
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
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{r ? fmt(r.liter) : "—"} {l.litres}</div>
            </div>
            {r && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.glasses}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{r.glas} {l.glassesUnit}</div>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.result}: ${r ? fmt(r.liter) : "—"} ${l.litres}`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.result}: ${r ? fmt(r.liter) : "—"} ${l.litres}`} />
      </div>
    </div>
  );
}
