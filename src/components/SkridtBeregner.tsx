"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnSkridt, SkridtKoen } from "@/lib/skridt";

const labels = {
  da: {
    steps: "Antal skridt",
    sex: "Skridtlængde",
    kvinde: "Kvinde (66 cm)",
    mand: "Mand (79 cm)",
    weight: "Kropsvægt (til kalorier)",
    result: "Så langt er det",
    time: "Gangtid",
    kcal: "Forbrænding",
    minutes: "min",
    hours: "t",
    name: "Skridt til km",
    note: "Vejledende: skridtlængde 66 cm (kvinde) / 79 cm (mand) og kadence 117 skridt/min fra gang-målinger (Murray 1964/1970). Kalorier: MET 3,5 for normal gang. Din faktiske skridtlængde afhænger af højde og tempo.",
  },
  se: {
    steps: "Antal steg",
    sex: "Steglängd",
    kvinde: "Kvinna (66 cm)",
    mand: "Man (79 cm)",
    weight: "Kroppsvikt (för kalorier)",
    result: "Så långt är det",
    time: "Gångtid",
    kcal: "Förbränning",
    minutes: "min",
    hours: "t",
    name: "Steg till km",
    note: "Vägledande: steglängd 66 cm (kvinna) / 79 cm (man) och kadens 117 steg/min från gångmätningar (Murray 1964/1970). Kalorier: MET 3,5 för normal gång. Din faktiska steglängd beror på längd och tempo.",
  },
} as const;

export default function SkridtBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      maximumFractionDigits: 2,
    });

  const [steps, setSteps] = useState<number>(10_000);
  const [koen, setKoen] = useState<SkridtKoen>("kvinde");
  const [weight, setWeight] = useState<number>(70);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "skridt") {
      const i = urlState.inputs;
      if (i.steps !== undefined) setSteps(Number(i.steps));
      if (i.koen === "kvinde" || i.koen === "mand") setKoen(i.koen);
      if (i.weight !== undefined) setWeight(Number(i.weight));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("skridt");
    const timer = setTimeout(() => {
      trackCalculation("skridt");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setSteps(10_000);
    setKoen("kvinde");
    setWeight(70);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "skridt",
      inputs: { steps, koen, weight },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [steps, koen, weight]);

  const r = useMemo(() => beregnSkridt(steps, koen, weight), [steps, koen, weight]);

  const tidText = (min: number) => {
    const t = Math.floor(min / 60);
    const m = min % 60;
    return t > 0 ? `${t} ${l.hours} ${m} ${l.minutes}` : `${m} ${l.minutes}`;
  };

  const sexBtn = (k: SkridtKoen, text: string) => (
    <button
      key={k}
      type="button"
      onClick={() => setKoen(k)}
      aria-pressed={koen === k}
      className={`flex-1 min-h-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 ${
        koen === k
          ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
          : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="skridt-antal" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.steps}</label>
            <div className="relative">
              <input id="skridt-antal" type="number" min="0" step="500" value={steps} onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div>
            <span className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.sex}</span>
            <div className="flex gap-2">
              {sexBtn("kvinde", l.kvinde)}
              {sexBtn("mand", l.mand)}
            </div>
          </div>
          <div>
            <label htmlFor="skridt-vaegt" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.weight}</label>
            <div className="relative">
              <input id="skridt-vaegt" type="number" min="0" step="1" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
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
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{r ? fmt(r.km) : "—"} km</div>
            </div>
            {r && (
              <>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.time}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{tidText(r.minutter)}</div>
                </div>
                {r.kcal !== null && (
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{l.kcal}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{fmt(r.kcal)} kcal</div>
                  </div>
                )}
              </>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.result}: ${r ? fmt(r.km) : "—"} km`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.result}: ${r ? fmt(r.km) : "—"} km`} />
      </div>
    </div>
  );
}
