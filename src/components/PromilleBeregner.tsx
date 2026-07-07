"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnPromille, Koen } from "@/lib/promille";

const labels = {
  da: {
    drinks: "Antal genstande",
    weight: "Kropsvægt",
    sex: "Køn",
    man: "Mand",
    woman: "Kvinde",
    hours: "Timer siden første genstand",
    yourBac: "Din anslåede promille",
    mayDrive: "Du er under grænsen på 0,5 ‰",
    mayNotDrive: "Du er over grænsen på 0,5 ‰ — kør ikke bil",
    grams: "Ren alkohol",
    timeToZero: "Tid til 0 ‰",
    hoursUnit: "timer",
    driveNote:
      "Kør aldrig efter alkohol. Dette er et gennemsnitligt estimat efter Widmark-formlen — din faktiske promille afhænger af mad, stofskifte og meget andet.",
    name: "Promilleberegner",
    drinkHint: "1 genstand = 12 g ren alkohol (fx 33 cl øl, 12 cl vin eller 4 cl spiritus)",
  },
  se: {
    drinks: "Antal standardglas",
    weight: "Kroppsvikt",
    sex: "Kön",
    man: "Man",
    woman: "Kvinna",
    hours: "Timmar sedan första glaset",
    yourBac: "Din uppskattade promille",
    mayDrive: "Du är under gränsen på 0,2 ‰",
    mayNotDrive: "Du är över gränsen på 0,2 ‰ — kör inte bil",
    grams: "Ren alkohol",
    timeToZero: "Tid till 0 ‰",
    hoursUnit: "timmar",
    driveNote:
      "Kör aldrig efter alkohol. Detta är en genomsnittlig uppskattning enligt Widmark-formeln — din faktiska promille beror på mat, ämnesomsättning och mycket annat.",
    name: "Promillekalkylator",
    drinkHint: "1 standardglas = 12 g ren alkohol (t.ex. 33 cl öl, 12 cl vin eller 4 cl sprit)",
  },
} as const;

// Legal driving limit differs: Denmark 0.5 ‰, Sweden 0.2 ‰.
const LIMIT: Record<string, number> = { da: 0.5, se: 0.2, no: 0.2 };

export default function PromilleBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const limit = LIMIT[locale] ?? 0.5;

  const [drinks, setDrinks] = useState<number>(3);
  const [weight, setWeight] = useState<number>(75);
  const [sex, setSex] = useState<Koen>("mand");
  const [hours, setHours] = useState<number>(2);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "promille") {
      const i = urlState.inputs;
      if (i.drinks !== undefined) setDrinks(Number(i.drinks));
      if (i.weight !== undefined) setWeight(Number(i.weight));
      if (i.sex === "mand" || i.sex === "kvinde") setSex(i.sex);
      if (i.hours !== undefined) setHours(Number(i.hours));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("promille");
    const timer = setTimeout(() => {
      trackCalculation("promille");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setDrinks(3);
    setWeight(75);
    setSex("mand");
    setHours(2);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "promille",
      inputs: { drinks, weight, sex, hours },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [drinks, weight, sex, hours]);

  const r = useMemo(() => beregnPromille(drinks, weight, sex, hours), [drinks, weight, sex, hours]);
  const mayDrive = r ? r.promille < limit : true;
  const bacText = r ? r.promille.toFixed(2).replace(".", ",") : "0,00";

  const field = (label: string, value: number, onChange: (n: number) => void, step: string, unit: string) => (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type="number" step={step} min="0" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {field(l.drinks, drinks, setDrinks, "1", "")}
          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">{l.drinkHint}</p>
          {field(l.weight, weight, setWeight, "1", "kg")}

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.sex}</label>
            <div className="grid grid-cols-2 gap-2">
              {(["mand", "kvinde"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setSex(s)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    sex === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}>
                  {s === "mand" ? l.man : l.woman}
                </button>
              ))}
            </div>
          </div>

          {field(l.hours, hours, setHours, "0.5", l.hoursUnit)}

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className={`rounded-lg p-4 text-center ${mayDrive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{l.yourBac}</div>
              <div className={`text-4xl font-bold ${mayDrive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {bacText} ‰
              </div>
              <div className={`text-xs mt-1 font-medium ${mayDrive ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                {mayDrive ? l.mayDrive : l.mayNotDrive}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.grams}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{r ? r.gramAlkohol : 0} g</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.timeToZero}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {r ? r.timerTilNul.toFixed(1).replace(".", ",") : "0"} {l.hoursUnit}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">{l.driveNote}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.yourBac}: ${bacText} ‰`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.yourBac}: ${bacText} ‰`} />
      </div>
    </div>
  );
}
