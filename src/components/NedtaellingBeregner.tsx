"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { PartyPopper } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnNedtaelling } from "@/lib/nedtaelling";

const labels = {
  da: {
    target: "Vælg en dato",
    days: "dage",
    weeks: "uger",
    andDays: "og",
    toGo: "til",
    ago: "siden",
    today: "Det er i dag!",
    name: "Nedtælling",
    note: "Tæl dage til en fødselsdag, ferie, eksamen eller en anden vigtig dato. Beregningen tæller fra dags dato.",
  },
  se: {
    target: "Välj ett datum",
    days: "dagar",
    weeks: "veckor",
    andDays: "och",
    toGo: "till",
    ago: "sedan",
    today: "Det är idag!",
    name: "Nedräkning",
    note: "Räkna dagar till en födelsedag, semester, tenta eller ett annat viktigt datum. Beräkningen räknar från dagens datum.",
  },
} as const;

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function NedtaellingBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  const [target, setTarget] = useState<string>("");
  const [today, setToday] = useState<string>("");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    setToday(todayISO());
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "nedtaelling" && typeof urlState.inputs.target === "string") {
      setTarget(urlState.inputs.target);
    } else {
      // Default to 30 days ahead.
      const d = new Date();
      d.setDate(d.getDate() + 30);
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setTarget(`${d.getFullYear()}-${m}-${day}`);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("nedtaelling");
    const timer = setTimeout(() => {
      trackCalculation("nedtaelling");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setTarget(`${d.getFullYear()}-${m}-${day}`);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "nedtaelling",
      inputs: { target },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [target]);

  const r = useMemo(() => (today && target ? beregnNedtaelling(today, target) : null), [today, target]);

  const summary = r
    ? r.dage === 0
      ? l.today
      : `${fmt(r.dage)} ${l.days} ${r.erFortid ? l.ago : l.toGo}`
    : "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.target}</label>
            <input type="date" value={target} onChange={(e) => setTarget(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-6 text-center bg-blue-100 dark:bg-blue-900/30">
              {r && r.dage === 0 ? (
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 inline-flex items-center justify-center gap-2"><PartyPopper className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.today}</div>
              ) : (
                <>
                  <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">{r ? fmt(r.dage) : "—"}</div>
                  <div className="text-sm mt-1 text-blue-800 dark:text-blue-300">
                    {l.days} {r ? (r.erFortid ? l.ago : l.toGo) : ""}
                  </div>
                </>
              )}
            </div>
            {r && r.dage > 0 && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm text-sm">
                <span className="font-medium dark:text-gray-200">
                  {fmt(r.uger)} {l.weeks} {l.andDays} {fmt(r.restDage)} {l.days}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={summary} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name} resultSummary={summary} />
      </div>
    </div>
  );
}
