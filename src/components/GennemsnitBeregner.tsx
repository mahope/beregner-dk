"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { parseTal, beregnStatistik } from "@/lib/gennemsnit";

const labels = {
  da: {
    input: "Indtast tal",
    placeholder: "fx 12, 15, 9, 21, 18",
    hint: "Adskil tallene med komma, mellemrum eller linjeskift.",
    average: "Gennemsnit",
    count: "Antal",
    sum: "Sum",
    median: "Median",
    min: "Mindste",
    max: "Største",
    name: "Gennemsnitsberegner",
    empty: "Indtast nogle tal for at se resultatet.",
  },
  se: {
    input: "Ange tal",
    placeholder: "t.ex. 12, 15, 9, 21, 18",
    hint: "Separera talen med komma, mellanslag eller radbrytning.",
    average: "Medelvärde",
    count: "Antal",
    sum: "Summa",
    median: "Median",
    min: "Minsta",
    max: "Största",
    name: "Medelvärdeskalkylator",
    empty: "Ange några tal för att se resultatet.",
  },
} as const;

export default function GennemsnitBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      maximumFractionDigits: 4,
    });

  const [input, setInput] = useState<string>("12, 15, 9, 21, 18");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "gennemsnit" && typeof urlState.inputs.input === "string") {
      setInput(urlState.inputs.input);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("gennemsnit");
    const timer = setTimeout(() => {
      trackCalculation("gennemsnit");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setInput("12, 15, 9, 21, 18");
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "gennemsnit",
      inputs: { input },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [input]);

  const r = useMemo(() => beregnStatistik(parseTal(input)), [input]);

  const stat = (label: string, value: string) => (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.input}</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={l.placeholder}
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-y"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{l.hint}</p>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          {r ? (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{l.average}</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{fmt(r.gennemsnit)}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {stat(l.count, fmt(r.antal))}
                {stat(l.sum, fmt(r.sum))}
                {stat(l.median, fmt(r.median))}
                {stat(l.min, fmt(r.min))}
                {stat(l.max, fmt(r.max))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">{l.empty}</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={r ? `${l.average}: ${fmt(r.gennemsnit)} · ${l.median}: ${fmt(r.median)} · ${l.sum}: ${fmt(r.sum)}` : l.empty} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={r ? `${l.average}: ${fmt(r.gennemsnit)}` : l.empty} />
      </div>
    </div>
  );
}
