"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnLoenstigning } from "@/lib/loenstigning";

const labels = {
  da: {
    old: "Nuværende løn",
    new: "Ny løn",
    change: "Ændring",
    diff: "Forskel i kroner",
    increase: "Lønstigning",
    decrease: "Lønnedgang",
    name: "Lønstigning i procent",
    note: "Beregn den procentvise ændring mellem to lønninger. Virker med timeløn, månedsløn eller årsløn — bare brug samme enhed begge steder. Beløbene er bruttoløn.",
  },
  se: {
    old: "Nuvarande lön",
    new: "Ny lön",
    change: "Ändring",
    diff: "Skillnad i kronor",
    increase: "Löneökning",
    decrease: "Lönesänkning",
    name: "Löneökning i procent",
    note: "Beräkna den procentuella ändringen mellan två löner. Fungerar med timlön, månadslön eller årslön — använd bara samma enhet på båda. Beloppen är bruttolön.",
  },
} as const;

export default function LoenstigningBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmtKr = (n: number) => Math.round(n).toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");
  const fmtPct = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", { maximumFractionDigits: 2 });

  const [oldLoen, setOldLoen] = useState<number>(30000);
  const [newLoen, setNewLoen] = useState<number>(33000);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "loenstigning") {
      const i = urlState.inputs;
      if (i.oldLoen !== undefined) setOldLoen(Number(i.oldLoen));
      if (i.newLoen !== undefined) setNewLoen(Number(i.newLoen));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("loenstigning");
    const timer = setTimeout(() => {
      trackCalculation("loenstigning");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setOldLoen(30000);
    setNewLoen(33000);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "loenstigning",
      inputs: { oldLoen, newLoen },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [oldLoen, newLoen]);

  const r = useMemo(() => beregnLoenstigning(oldLoen, newLoen), [oldLoen, newLoen]);
  const up = r ? r.erStigning : true;

  const field = (label: string, value: number, onChange: (n: number) => void) => (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type="number" min="0" step="100" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {field(l.old, oldLoen, setOldLoen)}
          {field(l.new, newLoen, setNewLoen)}
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className={`rounded-lg p-4 text-center ${up ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              <div className={`text-sm font-medium ${up ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
                {up ? l.increase : l.decrease}
              </div>
              <div className={`text-4xl font-bold ${up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {r ? `${r.procent > 0 ? "+" : ""}${fmtPct(r.procent)}` : "—"} %
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{l.diff}</span>
                <span className="font-medium dark:text-gray-200">{r ? `${r.forskel > 0 ? "+" : ""}${fmtKr(r.forskel)}` : "—"} kr</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${up ? l.increase : l.decrease}: ${r ? fmtPct(r.procent) : "—"} %`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${up ? l.increase : l.decrease}: ${r ? fmtPct(r.procent) : "—"} %`} />
      </div>
    </div>
  );
}
