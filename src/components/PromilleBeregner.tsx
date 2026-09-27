"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnPromille, graenseForLocale, Koen } from "@/lib/promille";
import { formatNumber } from "@/lib/format";

const labels = {
  da: {
    drinks: "Antal genstande",
    weight: "Kropsvægt",
    sex: "Køn",
    man: "Mand",
    woman: "Kvinde",
    hours: "Timer siden første genstand",
    yourBac: "Din anslåede promille",
    mayDrive: (gr: string) => `Du er under grænsen på ${gr}`,
    atGraensen: (gr: string) => `Du er præcis på grænsen (${gr}) — kør ikke bil`,
    mayNotDrive: (gr: string) => `Du er over grænsen på ${gr} — kør ikke bil`,
    grams: "Ren alkohol",
    timeToZero: "Tid til 0 ‰",
    timeToLimit: "Under grænsen om",
    hoursUnit: "timer",
    driveNote:
      "Kør aldrig efter alkohol. Dette er et gennemsnitligt estimat efter Widmark-formlen — din faktiske promille afhænger af mad, stofskifte og meget andet.",
    name: "Promilleberegner",
    drinkHint: "1 genstand = 12 g ren alkohol (fx 33 cl øl, 12 cl vin eller 4 cl spiritus)",
    noResult: "Indtast antal genstande og kropsvægt — uden dem kan promillen ikke beregnes.",
    unknown: "—",
    copyFrame: (led: string, verdikt: string, tidsrum: string) =>
      tidsrum ? `${led} ${verdikt} ${tidsrum}` : `${led} ${verdikt}`,
    copyTimesUnder: (heltAedru: string) => `Du er allerede under grænsen — helt ædru om ${heltAedru} time.`,
    copyTimesOver: (tilGraense: string, heltAedru: string) =>
      `Under grænsen igen om ${tilGraense} time, helt ædru om ${heltAedru} time.`,
  },
  se: {
    drinks: "Antal standardglas",
    weight: "Kroppsvikt",
    sex: "Kön",
    man: "Man",
    woman: "Kvinna",
    hours: "Timmar sedan första glaset",
    yourBac: "Din uppskattade promille",
    mayDrive: (gr: string) => `Du är under gränsen på ${gr}`,
    atGraensen: (gr: string) => `Du är precis på gränsen (${gr}) — kör inte bil`,
    mayNotDrive: (gr: string) => `Du är över gränsen på ${gr} — kör inte bil`,
    grams: "Ren alkohol",
    timeToZero: "Tid till 0 ‰",
    timeToLimit: "Under gränsen om",
    hoursUnit: "timmar",
    driveNote:
      "Kör aldrig efter alkohol. Detta är en genomsnittlig uppskattning enligt Widmark-formlen — din faktiska promille beror på mat, ämnesomsättning och mycket annat.",
    name: "Promillekalkylator",
    drinkHint: "1 standardglas = 12 g ren alkohol (t.ex. 33 cl öl, 12 cl vin eller 4 cl sprit)",
    noResult: "Fyll i antal standardglas och kroppsvikt — utan dem går promillen inte att beräkna.",
    unknown: "—",
    copyFrame: (led: string, verdikt: string, tidsrum: string) =>
      tidsrum ? `${led} ${verdikt} ${tidsrum}` : `${led} ${verdikt}`,
    copyTimesUnder: (heltNykter: string) => `Du är redan under gränsen — helt nykter om ${heltNykter} timmar.`,
    copyTimesOver: (tilGraense: string, heltNykter: string) =>
      `Under gränsen igen om ${tilGraense} timmar, helt nykter om ${heltNykter} timmar.`,
  },
} as const;

export default function PromilleBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  // Legal driving limit differs: Denmark 0.5 ‰, Sweden and Norway 0.2 ‰.
  // It comes from the library so the tool, the tables and the FAQ cannot
  // disagree about which country is being calculated for.
  const limit = graenseForLocale(locale);
  const limitTekst = `${formatNumber(limit, locale)} ‰`;

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

  const r = useMemo(() => beregnPromille(drinks, weight, sex, hours, limit), [drinks, weight, sex, hours, limit]);
  const mayDrive = r ? r.maaKoere : false;
  const bacText = r ? formatNumber(r.promille, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : l.unknown;
  const timeToLimit = r && !r.paaGraensen
    ? formatNumber(r.timerTilGraense, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : l.unknown;
  const timeToZero = r
    ? formatNumber(r.timerTilNul, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : l.unknown;

  /**
   * The text the reader copies or shares. It is the only place the string is
   * built, because `/moms` once sent two different strings from the two
   * buttons, and because a promille without its four inputs is a legal claim
   * nobody can check or reuse: 0,66 ‰ means nothing on its own.
   */
  const verdikt = !r
    ? ""
    : r.maaKoere
      ? l.mayDrive(limitTekst)
      : r.paaGraensen
        ? l.atGraensen(limitTekst)
        : l.mayNotDrive(limitTekst);

  const tidsrum = !r || r.paaGraensen
    ? ""
    : r.maaKoere
      ? l.copyTimesUnder(timeToZero)
      : l.copyTimesOver(timeToLimit, timeToZero);

  const deltTekst = r
    ? l.copyFrame(
        `${formatNumber(drinks, locale)} ${locale === "se" ? "standardglas" : "genstande"}, ` +
          `${formatNumber(weight, locale)} kg, ${sex === "mand" ? l.man : l.woman}, ` +
          `${formatNumber(hours, locale)} ${locale === "se" ? "timmar" : "timer"} ${locale === "se" ? "sedan" : "siden"}: ` +
          `${bacText} ‰`,
        verdikt,
        tidsrum
      )
    : l.noResult;

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
            {r ? (
              <>
                <div className={`rounded-lg p-4 text-center ${mayDrive ? "bg-green-100 dark:bg-green-900/30" : r.paaGraensen ? "bg-amber-100 dark:bg-amber-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{l.yourBac}</div>
                  <div className={`text-4xl font-bold ${mayDrive ? "text-green-600 dark:text-green-400" : r.paaGraensen ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                    {bacText} ‰
                  </div>
                  <div className={`text-xs mt-1 font-medium ${mayDrive ? "text-green-700 dark:text-green-400" : r.paaGraensen ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"}`}>
                    {verdikt}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{l.grams}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(r.gramAlkohol, locale)} g</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {l.timeToLimit} {limitTekst}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {timeToLimit} {l.hoursUnit}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{l.timeToZero}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {timeToZero} {l.hoursUnit}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">{l.driveNote}</p>
              </>
            ) : (
              /* Uden et resultat må værktøjet ikke svare "du er under grænsen":
                 det er en tilladelse til at køre bil, og den må ikke komme fra
                 et felt brugeren endnu ikke har tastet. */
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">{l.noResult}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={deltTekst} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={deltTekst} />
      </div>
    </div>
  );
}
