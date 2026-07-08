"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnSparemaal } from "@/lib/sparemaal";

const labels = {
  da: {
    goal: "Sparemål",
    years: "Antal år",
    rate: "Forventet årlig rente",
    start: "Startbeløb (valgfrit)",
    yearsUnit: "år",
    monthly: "Månedlig opsparing",
    deposited: "Samlet indbetalt",
    interest: "Heraf renter",
    name: "Sparemålsberegner",
    note: "Beregner hvor meget du skal spare op om måneden for at nå dit mål. Renten tilskrives månedligt. Historisk afkast er ingen garanti for fremtiden.",
  },
  se: {
    goal: "Sparmål",
    years: "Antal år",
    rate: "Förväntad årlig ränta",
    start: "Startbelopp (valfritt)",
    yearsUnit: "år",
    monthly: "Månadssparande",
    deposited: "Totalt insatt",
    interest: "Varav ränta",
    name: "Sparmålskalkylator",
    note: "Beräknar hur mycket du behöver spara per månad för att nå ditt mål. Räntan läggs till månadsvis. Historisk avkastning är ingen garanti för framtiden.",
  },
} as const;

export default function SparemaalBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => Math.round(n).toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  const [goal, setGoal] = useState<number>(100000);
  const [years, setYears] = useState<number>(5);
  const [rate, setRate] = useState<number>(5);
  const [start, setStart] = useState<number>(0);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "sparemaal") {
      const i = urlState.inputs;
      if (i.goal !== undefined) setGoal(Number(i.goal));
      if (i.years !== undefined) setYears(Number(i.years));
      if (i.rate !== undefined) setRate(Number(i.rate));
      if (i.start !== undefined) setStart(Number(i.start));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("sparemaal");
    const timer = setTimeout(() => {
      trackCalculation("sparemaal");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setGoal(100000);
    setYears(5);
    setRate(5);
    setStart(0);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "sparemaal",
      inputs: { goal, years, rate, start },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [goal, years, rate, start]);

  const r = useMemo(() => beregnSparemaal(goal, years, rate, start), [goal, years, rate, start]);

  const field = (label: string, value: number, onChange: (n: number) => void, unit: string, step: string) => (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type="number" min="0" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {field(l.goal, goal, setGoal, "kr", "1000")}
          {field(l.years, years, setYears, l.yearsUnit, "1")}
          {field(l.rate, rate, setRate, "%", "0.1")}
          {field(l.start, start, setStart, "kr", "1000")}
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{l.monthly}</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{r ? fmt(r.maanedligOpsparing) : "—"} kr</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{l.deposited}</span>
                <span className="font-medium dark:text-gray-200">{r ? fmt(r.totalIndbetalt) : "—"} kr</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-400">{l.interest}</span>
                <span className="font-medium dark:text-gray-200">{r ? fmt(r.renterTjent) : "—"} kr</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.monthly}: ${r ? fmt(r.maanedligOpsparing) : "—"} kr`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.monthly}: ${r ? fmt(r.maanedligOpsparing) : "—"} kr`} />
      </div>
    </div>
  );
}
