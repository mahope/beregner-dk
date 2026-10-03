"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { forkortBrok, regnMedBroker, type BrokOperation } from "@/lib/brok";

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
    regnTitle: "Regn med de fire regler",
    regnBody:
      "Plus og minus skal have ens nævnere, så den mindste fællesnævner lægges under. Gange og dele skal ikke — dele vender den anden brøk.",
    chooseRule: "Vælg regel",
    firstFraction: "Det første brøk",
    secondFraction: "Den anden brøk",

    firstNumerator: "Første tæller",
    firstDenominator: "Første nævner",
    secondNumerator: "Anden tæller",
    secondDenominator: "Anden nævner",
    result: "Resultat",
    commonDenominator: "Fællesnævner",
    resultProcent: "Resultat i procent",
    equalised: "Nævnerne blev gjort ens",
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
    regnTitle: "Räkna med de fyra reglerna",
    regnBody:
      "Plus och minus måste ha lika nämnare, så minsta gemensamma nämnare läggs under. Gånger och delar ska inte — delar vänder det andra bråket.",
    chooseRule: "Välj regel",
    secondFraction: "Det andra bråket",
    firstFraction: "Det första bråket",
    firstNumerator: "Första täljare",
    firstDenominator: "Första nämnare",
    secondNumerator: "Andra täljare",
    secondDenominator: "Andra nämnare",
    result: "Resultat",
    commonDenominator: "Gemensam nämnare",
    resultProcent: "Resultat i procent",
    equalised: "Nämnarna gjordes lika",
  },
} as const;

const operations = {
  da: { plus: "Plus", minus: "Minus", gange: "Gange", dele: "Dele" },
  se: { plus: "Plus", minus: "Minus", gange: "Gånger", dele: "Dela" },
} as const;

export default function BrokBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", { maximumFractionDigits: 6 });

  const [numerator, setNumerator] = useState<number>(6);
  const [denominator, setDenominator] = useState<number>(8);
  const [taeller1, setTaeller1] = useState<number>(1);
  const [naevner1, setNaevner1] = useState<number>(2);
  const [taeller2, setTaeller2] = useState<number>(1);
  const [naevner2, setNaevner2] = useState<number>(3);
  const [operation, setOperation] = useState<BrokOperation>("plus");

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

  const regneLabels = operations[locale === "se" ? "se" : "da"];
  const regne = useMemo(
    () => regnMedBroker(Math.trunc(taeller1), Math.trunc(naevner1), Math.trunc(taeller2), Math.trunc(naevner2), operation),
    [taeller1, naevner1, taeller2, naevner2, operation]
  );

  // A fraction is defined by whole numbers, so a decimal typed into a field is
  // rounded **into the field** rather than silently cut off when the result is
  // calculated. Showing "1.5" while calculating with 1 would leave the reader
  // with no way to see the mistake.
  const field = (id: string, label: string, value: number, onChange: (n: number) => void) => (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input id={id} type="number" step="1" value={value} onChange={(e) => onChange(Math.round(Number(e.target.value)))}
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
          {field("brok-taeler", l.numerator, numerator, setNumerator)}
          <div className="border-t-2 border-gray-300 dark:border-gray-600" />
          {field("brok-naevner", l.denominator, denominator, setDenominator)}
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

      <section aria-labelledby="brok-regn-title" className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 id="brok-regn-title" className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {l.regnTitle}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{l.regnBody}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
              <fieldset>
                <legend className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {l.chooseRule}
                </legend>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(regneLabels) as BrokOperation[]).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOperation(op)}
                      aria-pressed={operation === op}
                      className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                        operation === op
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {regneLabels[op]}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex items-end gap-3">
                {/* `min-w-0`: browseren giver `fieldset` en
                    `min-inline-size: min-content`, og i en flex-række ville de to
                    brøker så skubbe hinanden ud over kanten på 360 px. */}
                <fieldset className="min-w-0 flex-1">
                  <legend className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {l.firstFraction}
                  </legend>
                  <div className="space-y-3">
                    {field("brok-t1", l.firstNumerator, taeller1, setTaeller1)}
                    {field("brok-n1", l.firstDenominator, naevner1, setNaevner1)}
                  </div>
                </fieldset>
                <span
                  aria-hidden="true"
                  className="pb-3 text-2xl font-bold text-gray-400 dark:text-gray-500"
                >
                  {regneLabels[operation] === "Gange" || regneLabels[operation] === "Gånger"
                    ? "×"
                    : regneLabels[operation] === "Dele" || regneLabels[operation] === "Dela"
                      ? "÷"
                      : regneLabels[operation] === "Minus"
                        ? "−"
                        : "+"}
                </span>
                <fieldset className="min-w-0 flex-1">
                  <legend className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {l.secondFraction}
                  </legend>
                  <div className="space-y-3">
                    {field("brok-t2", l.secondNumerator, taeller2, setTaeller2)}
                    {field("brok-n2", l.secondDenominator, naevner2, setNaevner2)}
                  </div>
                </fieldset>
              </div>
            </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 self-start">
            {regne ? (
              <div className="space-y-4">
                <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {l.result}
                  </div>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {regne.taeller}/{regne.naevner}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {stat(l.decimal, fmt(regne.decimal))}
                  {stat(l.resultProcent, `${fmt(regne.procent)} %`)}
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {l.commonDenominator}:{" "}
                  <strong>{regne.fællesNaevner}</strong>
                  {regne.brugteFællesNaevner ? ` — ${l.equalised}` : ""}
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-500 dark:text-red-400 text-center py-8">
                {l.invalid}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
