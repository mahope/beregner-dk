"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { forkortBrok } from "@/lib/brok";

const labels = {
  da: {
    numerator: "Tæller (øverst)",
    denominator: "Nævner (nederst)",
    simplified: "Forkortet brøk",
    decimal: "Decimaltal",
    percent: "Procent",
    invalid: "Nævneren må ikke være 0.",
    name: "Brøkberegner",
    note: "Forkort en brøk til dens enkleste form, og se den som decimaltal og procent. Indtast hele tal.",
  },
  se: {
    numerator: "Täljare (överst)",
    denominator: "Nämnare (nederst)",
    simplified: "Förkortat bråk",
    decimal: "Decimaltal",
    percent: "Procent",
    invalid: "Nämnaren får inte vara 0.",
    name: "Bråkkalkylator",
    note: "Förkorta ett bråk till dess enklaste form och se det som decimaltal och procent. Ange heltal.",
  },
} as const;

export default function BrokBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", { maximumFractionDigits: 6 });

  const [numerator, setNumerator] = useState<number>(6);
  const [denominator, setDenominator] = useState<number>(8);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "brok") {
      const i = urlState.inputs;
      if (i.numerator !== undefined) setNumerator(Number(i.numerator));
      if (i.denominator !== undefined) setDenominator(Number(i.denominator));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("brok");
    const timer = setTimeout(() => {
      trackCalculation("brok");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setNumerator(6);
    setDenominator(8);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "brok",
      inputs: { numerator, denominator },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [numerator, denominator]);

  const r = useMemo(() => forkortBrok(Math.trunc(numerator), Math.trunc(denominator)), [numerator, denominator]);

  const field = (label: string, value: number, onChange: (n: number) => void) => (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input type="number" step="1" value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center text-lg" />
    </div>
  );

  const stat = (label: string, value: string) => (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {field(l.numerator, numerator, setNumerator)}
          <div className="border-t-2 border-gray-300 dark:border-gray-600" />
          {field(l.denominator, denominator, setDenominator)}
          <div className="flex justify-end pt-1">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          {r ? (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{l.simplified}</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{r.taeller}/{r.naevner}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {stat(l.decimal, fmt(r.decimal))}
                {stat(l.percent, `${fmt(r.procent)} %`)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
            </div>
          ) : (
            <p className="text-sm text-red-500 dark:text-red-400 text-center py-8">{l.invalid}</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={r ? `${r.taeller}/${r.naevner} = ${fmt(r.decimal)} = ${fmt(r.procent)} %` : l.invalid} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={r ? `${r.taeller}/${r.naevner}` : l.invalid} />
      </div>
    </div>
  );
}
