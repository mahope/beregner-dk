"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnAegloesning } from "@/lib/aegloesning";

const labels = {
  da: {
    lastPeriod: "Første dag i sidste menstruation",
    cycle: "Cykluslængde",
    days: "dage",
    ovulation: "Ægløsning (mest frugtbar)",
    window: "Frugtbart vindue",
    nextPeriod: "Næste menstruation",
    name: "Ægløsningsberegner",
    note: "Estimat baseret på en typisk cyklus, hvor ægløsning sker ca. 14 dage før næste menstruation. Det er ikke en sikker prævention — cyklusser varierer.",
    to: "til",
  },
  se: {
    lastPeriod: "Första dagen i senaste mens",
    cycle: "Cykellängd",
    days: "dagar",
    ovulation: "Ägglossning (mest fertil)",
    window: "Fertilt fönster",
    nextPeriod: "Nästa mens",
    name: "Ägglossningskalkylator",
    note: "Uppskattning baserad på en typisk cykel där ägglossning sker ca 14 dagar före nästa mens. Det är inte ett säkert preventivmedel — cykler varierar.",
    to: "till",
  },
} as const;

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function AegloesningBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const localeTag = locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK";
  const fmtDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(localeTag, {
      weekday: "short", day: "numeric", month: "long", timeZone: "UTC",
    });
  };

  const [lastPeriod, setLastPeriod] = useState<string>("");
  const [cycle, setCycle] = useState<number>(28);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "aegloesning") {
      const i = urlState.inputs;
      if (typeof i.lastPeriod === "string") setLastPeriod(i.lastPeriod);
      if (i.cycle !== undefined) setCycle(Number(i.cycle));
    } else {
      setLastPeriod(todayISO());
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("aegloesning");
    const timer = setTimeout(() => {
      trackCalculation("aegloesning");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setLastPeriod(todayISO());
    setCycle(28);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "aegloesning",
      inputs: { lastPeriod, cycle },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [lastPeriod, cycle]);

  const r = useMemo(() => (lastPeriod ? beregnAegloesning(lastPeriod, cycle) : null), [lastPeriod, cycle]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.lastPeriod}</label>
            <input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.cycle}</label>
            <div className="relative">
              <input type="number" min="20" max="45" step="1" value={cycle} onChange={(e) => setCycle(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-14 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{l.days}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          {r ? (
            <div className="space-y-3 animate-fade-in">
              <div className="rounded-lg p-4 text-center bg-pink-100 dark:bg-pink-900/30">
                <div className="text-sm font-medium text-pink-800 dark:text-pink-300">{l.ovulation}</div>
                <div className="text-xl font-bold text-pink-600 dark:text-pink-400">{fmtDate(r.aegloesning)}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.window}</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {fmtDate(r.frugtbarStart)} {l.to} {fmtDate(r.frugtbarSlut)}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.nextPeriod}</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{fmtDate(r.naesteMenstruation)}</div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">{l.note}</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={r ? `${l.ovulation}: ${fmtDate(r.aegloesning)}` : l.name} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={r ? `${l.ovulation}: ${fmtDate(r.aegloesning)}` : l.name} />
      </div>
    </div>
  );
}
