"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatBelob } from "@/lib/format";
import {
  STANDARD_BATTERI_KWH,
  STANDARD_LADNING_NU_PCT,
  STANDARD_LADNING_TIL_PCT,
  beregnElbilLading,
  elbilLadingStandard,
  type ElbilLadingInput,
} from "@/lib/elbil-lading";

// Siden findes på både minberegner.dk og beraknare.se, så værktøjets tal
// følger sidens egen locale — ellers fik en svensk læser dansk tusindtals-
// separator. Samme formatering som brødteksten bruger (`formatBelob`).
const talFormatter = (locale: string) => (n: number, maks = 0) =>
  formatBelob(n, locale === "se" ? "se" : "da", maks);

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

/** Formaterer et tal i sidens egen notation. */
type Tal = (n: number, maks?: number) => string;

const labels = {
  da: {
    name: "Elbil-lading",
    batteri: "Batterikapacitet (kWh)",
    ladningNu: "Ladning nu (%)",
    ladningTil: "Ladning til (%)",
    elpris: "Elpris (kr/kWh)",
    forbrug: "Forbrug (kWh/100 km)",
    kmPrMaaned: "Kørsel pr. måned (km)",
    kwhTilOpladning: "Energi til opladning",
    prisForOpladning: "Pris for at lade",
    prisPr100km: "Pris pr. 100 km",
    kwhPrMaaned: "Forbrug pr. måned",
    maanedligPris: "Ladeomkostning pr. måned",
    batteriHint: "Står på bilens specifikationer — fx 60 kWh.",
    elprisHint: "Den elpris du betaler — fx 2,50 kr/kWh.",
    maanedTekst: (r: { kwhPrMaaned: number }, tal: Tal, kmPrMaaned: number, forbrugKwh100km: number) =>
      `${tal(r.kwhPrMaaned)} kWh pr. måned ved ${tal(kmPrMaaned)} km og ${tal(forbrugKwh100km, 1)} kWh/100 km.`,
    resultSummary: (r: { kwhTilOpladning: number; prisForOpladning: number }, tal: Tal) =>
      `${tal(r.kwhTilOpladning)} kWh koster ${tal(r.prisForOpladning)} kr.`,
    copyText: (r: { kwhTilOpladning: number; prisForOpladning: number }, tal: Tal) =>
      `${tal(r.kwhTilOpladning)} kWh × elpris = ${tal(r.prisForOpladning)} kr.`,
    empty: "Skriv batteriets størrelse og ladningsniveauer for at se prisen.",
  },
  se: {
    name: "Laddkostnad elbil",
    batteri: "Batterikapacitet (kWh)",
    ladningNu: "Laddning nu (%)",
    ladningTil: "Laddning till (%)",
    elpris: "Elpris (kr/kWh)",
    forbrug: "Förbrukning (kWh/100 km)",
    kmPrMaaned: "Körning per månad (km)",
    kwhTilOpladning: "Energi till laddning",
    prisForOpladning: "Kostnad för laddning",
    prisPr100km: "Kostnad per 100 km",
    kwhPrMaaned: "Förbrukning per månad",
    maanedligPris: "Laddkostnad per månad",
    batteriHint: "Står på bilens specifikationer — till exempel 60 kWh.",
    elprisHint: "Det elpris du betalar — till exempel 2,50 kr/kWh.",
    maanedTekst: (r: { kwhPrMaaned: number }, tal: Tal, kmPrMaaned: number, forbrugKwh100km: number) =>
      `${tal(r.kwhPrMaaned)} kWh per månad vid ${tal(kmPrMaaned)} km och ${tal(forbrugKwh100km, 1)} kWh/100 km.`,
    resultSummary: (r: { kwhTilOpladning: number; prisForOpladning: number }, tal: Tal) =>
      `${tal(r.kwhTilOpladning)} kWh kostar ${tal(r.prisForOpladning)} kr.`,
    copyText: (r: { kwhTilOpladning: number; prisForOpladning: number }, tal: Tal) =>
      `${tal(r.kwhTilOpladning)} kWh × elpris = ${tal(r.prisForOpladning)} kr.`,
    empty: "Ange batteriets storlek och laddningsnivåer för att se kostnaden.",
  },
} as const;

type LocaleKey = keyof typeof labels;

export default function ElbilLadingBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as LocaleKey] ?? labels.da;
  const fmt = useMemo(() => talFormatter(locale), [locale]);
  const standard = useMemo(() => elbilLadingStandard(locale), [locale]);

  const [batteriKwh, setBatteriKwh] = useState(standard.batteriKwh);
  const [ladningNuPct, setLadningNuPct] = useState(standard.ladningNuPct);
  const [ladningTilPct, setLadningTilPct] = useState(standard.ladningTilPct);
  const [elpris, setElpris] = useState(standard.elpris);
  const [forbrugKwh100km, setForbrugKwh100km] = useState(standard.forbrugKwh100km);
  const [kmPrMaaned, setKmPrMaaned] = useState(standard.kmPrMaaned);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "elbil-lading") {
      const i = urlState.inputs;
      if (i.batteriKwh !== undefined) setBatteriKwh(Number(i.batteriKwh));
      if (i.ladningNuPct !== undefined) setLadningNuPct(Number(i.ladningNuPct));
      if (i.ladningTilPct !== undefined) setLadningTilPct(Number(i.ladningTilPct));
      if (i.elpris !== undefined) setElpris(Number(i.elpris));
      if (i.forbrugKwh100km !== undefined) setForbrugKwh100km(Number(i.forbrugKwh100km));
      if (i.kmPrMaaned !== undefined) setKmPrMaaned(Number(i.kmPrMaaned));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("elbil-lading");
    const timer = setTimeout(() => {
      trackCalculation("elbil-lading");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setBatteriKwh(standard.batteriKwh);
    setLadningNuPct(standard.ladningNuPct);
    setLadningTilPct(standard.ladningTilPct);
    setElpris(standard.elpris);
    setForbrugKwh100km(standard.forbrugKwh100km);
    setKmPrMaaned(standard.kmPrMaaned);
  }, [standard]);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "elbil-lading",
      inputs: { batteriKwh, ladningNuPct, ladningTilPct, elpris, forbrugKwh100km, kmPrMaaned },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [batteriKwh, ladningNuPct, ladningTilPct, elpris, forbrugKwh100km, kmPrMaaned]);

  const input: ElbilLadingInput = useMemo(
    () => ({ batteriKwh, ladningNuPct, ladningTilPct, elpris, forbrugKwh100km, kmPrMaaned }),
    [batteriKwh, ladningNuPct, ladningTilPct, elpris, forbrugKwh100km, kmPrMaaned],
  );
  const result = useMemo(() => beregnElbilLading(input), [input]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="elbil-lading-batteri" className={labelClass}>
              {l.batteri}
            </label>
            <input
              id="elbil-lading-batteri"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={batteriKwh}
              onChange={(e) => setBatteriKwh(Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
{l.batteriHint}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="elbil-lading-nu" className={labelClass}>
                {l.ladningNu}
              </label>
              <input
                id="elbil-lading-nu"
                type="number"
                min="0"
                max="100"
                step="1"
                inputMode="decimal"
                value={ladningNuPct}
                onChange={(e) => setLadningNuPct(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="elbil-lading-til" className={labelClass}>
                {l.ladningTil}
              </label>
              <input
                id="elbil-lading-til"
                type="number"
                min="0"
                max="100"
                step="1"
                inputMode="decimal"
                value={ladningTilPct}
                onChange={(e) => setLadningTilPct(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="elbil-lading-elpris" className={labelClass}>
              {l.elpris}
            </label>
            <input
              id="elbil-lading-elpris"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={elpris}
              onChange={(e) => setElpris(Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
{l.elprisHint}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="elbil-lading-forbrug" className={labelClass}>
                {l.forbrug}
              </label>
              <input
                id="elbil-lading-forbrug"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={forbrugKwh100km}
                onChange={(e) => setForbrugKwh100km(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="elbil-lading-km" className={labelClass}>
                {l.kmPrMaaned}
              </label>
              <input
                id="elbil-lading-km"
                type="number"
                min="0"
                step="50"
                inputMode="decimal"
                value={kmPrMaaned}
                onChange={(e) => setKmPrMaaned(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {l.prisForOpladning}
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {fmt(result.prisForOpladning)} kr.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.kwhTilOpladning}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {fmt(result.kwhTilOpladning, 1)} kWh
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.prisPr100km}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {fmt(result.prisPr100km)} kr.
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{l.maanedligPris}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(result.maanedligPris)} kr.
                </div>
              </div>

              <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                {l.resultSummary(result, fmt)}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {l.maanedTekst(result, fmt, kmPrMaaned, forbrugKwh100km)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">{l.empty}</p>
          )}
        </div>
      </div>

      {result && (
        <div className="flex justify-center mt-6 gap-3">
          <CopyResultButton text={l.copyText(result, fmt)} />
          <ShareCalculation
            getShareableLink={getShareableLink}
            calculatorName={l.name}
            resultSummary={l.resultSummary(result, fmt)}
          />
        </div>
      )}
    </div>
  );
}
