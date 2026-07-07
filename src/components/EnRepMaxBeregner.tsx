"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregn1RM, vaegtVedProcent } from "@/lib/enrepmax";

const labels = {
  da: {
    weight: "Vægt løftet",
    reps: "Antal gentagelser",
    oneRM: "Anslået 1RM",
    table: "Træningsvægte",
    reps1: "1 gentagelse",
    repsLabel: "gent.",
    name: "1RM beregner",
    note: "1RM (one-rep max) er den maksimale vægt, du kan løfte én gang. Estimeret som gennemsnit af Epley- og Brzycki-formlerne. Løft altid med god teknik og en makker.",
  },
  se: {
    weight: "Vikt lyft",
    reps: "Antal repetitioner",
    oneRM: "Uppskattat 1RM",
    table: "Träningsvikter",
    reps1: "1 repetition",
    repsLabel: "reps",
    name: "1RM kalkylator",
    note: "1RM (one-rep max) är den maximala vikt du kan lyfta en gång. Uppskattat som genomsnitt av Epley- och Brzycki-formlerna. Lyft alltid med god teknik och en spotter.",
  },
} as const;

// Approximate reps achievable at each % of 1RM (standard training table).
const PROCENT_TABEL: { pct: number; reps: number }[] = [
  { pct: 100, reps: 1 },
  { pct: 95, reps: 2 },
  { pct: 90, reps: 4 },
  { pct: 85, reps: 6 },
  { pct: 80, reps: 8 },
  { pct: 75, reps: 10 },
  { pct: 70, reps: 12 },
];

export default function EnRepMaxBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", { maximumFractionDigits: 1 });

  const [weight, setWeight] = useState<number>(100);
  const [reps, setReps] = useState<number>(5);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "enrepmax") {
      const i = urlState.inputs;
      if (i.weight !== undefined) setWeight(Number(i.weight));
      if (i.reps !== undefined) setReps(Number(i.reps));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("enrepmax");
    const timer = setTimeout(() => {
      trackCalculation("enrepmax");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setWeight(100);
    setReps(5);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "enrepmax",
      inputs: { weight, reps },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [weight, reps]);

  const r = useMemo(() => beregn1RM(weight, reps), [weight, reps]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.weight}</label>
            <div className="relative">
              <input type="number" min="0" step="0.5" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.reps}</label>
            <input type="number" min="1" max="36" step="1" value={reps} onChange={(e) => setReps(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{l.oneRM}</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{r ? fmt(r.oneRM) : "—"} kg</div>
            </div>
            {r && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{l.table}</div>
                <div className="space-y-1">
                  {PROCENT_TABEL.map((row) => (
                    <div key={row.pct} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{row.pct}% · {row.reps} {l.repsLabel}</span>
                      <span className="font-medium dark:text-gray-200">{fmt(vaegtVedProcent(r.oneRM, row.pct))} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.oneRM}: ${r ? fmt(r.oneRM) : "—"} kg`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.oneRM}: ${r ? fmt(r.oneRM) : "—"} kg`} />
      </div>
    </div>
  );
}
