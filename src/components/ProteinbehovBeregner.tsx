"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, type CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnProteinbehov, type Aktivitetsniveau } from "@/lib/proteinbehov";

const labels = {
  da: {
    weight: "Kropsvægt",
    level: "Aktivitetsniveau",
    result: "Anbefalet proteinindtag",
    gram: "gram",
    perDay: "pr. dag",
    range: "Spænd",
    from: "Fra",
    to: "til",
    note: "Vejledende estimat. Proteinbehov varierer med alder, køn, træningsform, genetik og helbred. Rådfør dig med en læge eller diætist ved specifikke behov.",
    name: "Proteinbehov",
    levels: {
      stillesiddende: "Stillesiddende (ingen motion)",
      "let-aktiv": "Let aktiv (1-3 dage/uge)",
      "moderat-aktiv": "Moderat aktiv (3-5 dage/uge)",
      "meget-aktiv": "Meget aktiv (6-7 dage/uge)",
      "ekstrem-aktiv": "Elite-/ekstremaktiv",
    } as Record<Aktivitetsniveau, string>,
  },
  se: {
    weight: "Kroppsvikt",
    level: "Aktivitetsnivå",
    result: "Rekommenderat proteinintag",
    gram: "gram",
    perDay: "per dag",
    range: "Intervall",
    from: "Från",
    to: "till",
    note: "Vägledande uppskattning. Proteinbehov varierar med ålder, kön, träningsform, genetik och hälsa. Rådfråga läkare eller dietist vid specifika behov.",
    name: "Proteinbehov",
    levels: {
      stillesiddende: "Stillasittande (ingen motion)",
      "let-aktiv": "Lätt aktiv (1-3 dagar/vecka)",
      "moderat-aktiv": "Måttligt aktiv (3-5 dagar/vecka)",
      "meget-aktiv": "Mycket aktiv (6-7 dagar/vecka)",
      "ekstrem-aktiv": "Elit-/extremt aktiv",
    } as Record<Aktivitetsniveau, string>,
  },
} as const;

export default function ProteinbehovBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : "da-DK", { maximumFractionDigits: 0 });

  const [weight, setWeight] = useState<number>(75);
  const [level, setLevel] = useState<Aktivitetsniveau>("moderat-aktiv");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "proteinbehov") {
      const i = urlState.inputs;
      if (i.weight !== undefined) setWeight(Number(i.weight));
      if (i.level !== undefined) setLevel(i.level as Aktivitetsniveau);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("proteinbehov");
    const timer = setTimeout(() => {
      trackCalculation("proteinbehov");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setWeight(75);
    setLevel("moderat-aktiv");
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "proteinbehov",
      inputs: { weight, level },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [weight, level]);

  const r = useMemo(() => beregnProteinbehov(weight, level), [weight, level]);

  const niveauOptions = Object.entries(l.levels) as [Aktivitetsniveau, string][];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.weight}</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="500"
                step="1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.level}</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Aktivitetsniveau)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {niveauOptions.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-rose-100 dark:bg-rose-900/30">
              <div className="text-sm font-medium text-rose-800 dark:text-rose-300">{l.result}</div>
              <div className="text-4xl font-bold text-rose-600 dark:text-rose-400">
                {r ? fmt(r.gram) : "—"}
              </div>
              <div className="text-sm text-rose-700 dark:text-rose-300">{l.gram} {l.perDay}</div>
            </div>
            {r && (
              <div className="space-y-2">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.range}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {l.from} {fmt(r.min)} {l.to} {fmt(r.max)} {l.gram}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">g/kg</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{r.faktor}</div>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.result}: ${r ? fmt(r.gram) : "—"} ${l.gram}`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName={l.name}
          resultSummary={`${l.result}: ${r ? fmt(r.gram) : "—"} ${l.gram}`}
        />
      </div>
    </div>
  );
}