"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";

const labels = {
  da: {
    starttidspunkt: "Starttidspunkt",
    sluttidspunkt: "Sluttidspunkt",
    startdato: "Startdato",
    slutdato: "Slutdato",
    valgfri: "(valgfri)",
    fratraekPause: "Fratræk pause (minutter)",
    pausePlaceholder: "F.eks. 30 min frokostpause",
    minSuffix: "min",
    tidIAlt: "Tid i alt",
    overMidnat: "🌙 Over midnat",
    decimalTimer: "Decimal timer",
    timerWord: "timer",
    arbejdsdage8t: "Arbejdsdage (8t)",
    dageWord: "dage",
    detaljeretVisning: "📊 Detaljeret visning",
    minutterWord: "minutter",
    sekunderWord: "sekunder",
    timerDecimal: "timer (decimal)",
    timerAbbr: "t",
    minAbbr: "m",
    hurtigeEksempler: "⚡ Hurtige eksempler",
    presetNormal: "Normal arbejdsdag (8-16)",
    presetKontor: "Kontor (9-17, 1t pause)",
    presetNat: "Nattevagt (22-06)",
    calculatorName: "Tidsberegner",
  },
  se: {
    starttidspunkt: "Starttid",
    sluttidspunkt: "Sluttid",
    startdato: "Startdatum",
    slutdato: "Slutdatum",
    valgfri: "(valfri)",
    fratraekPause: "Dra av rast (minuter)",
    pausePlaceholder: "T.ex. 30 min lunchrast",
    minSuffix: "min",
    tidIAlt: "Total tid",
    overMidnat: "🌙 Över midnatt",
    decimalTimer: "Decimaltimmar",
    timerWord: "timmar",
    arbejdsdage8t: "Arbetsdagar (8h)",
    dageWord: "dagar",
    detaljeretVisning: "📊 Detaljerad vy",
    minutterWord: "minuter",
    sekunderWord: "sekunder",
    timerDecimal: "timmar (decimal)",
    timerAbbr: "h",
    minAbbr: "m",
    hurtigeEksempler: "⚡ Snabbexempel",
    presetNormal: "Normal arbetsdag (8-16)",
    presetKontor: "Kontor (9-17, 1h rast)",
    presetNat: "Nattskift (22-06)",
    calculatorName: "Tidsberäknare",
  },
} as const;

export default function TidsBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const [startTid, setStartTid] = useState<string>("09:00");
  const [slutTid, setSlutTid] = useState<string>("17:00");
  const [startDato, setStartDato] = useState<string>("");
  const [slutDato, setSlutDato] = useState<string>("");
  const [fratraekPause, setFratraekPause] = useState<number>(0);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'tidsberegner') {
      const inputs = urlState.inputs;
      if (inputs.startTid) setStartTid(inputs.startTid);
      if (inputs.slutTid) setSlutTid(inputs.slutTid);
      if (inputs.startDato) setStartDato(inputs.startDato);
      if (inputs.slutDato) setSlutDato(inputs.slutDato);
      if (inputs.fratraekPause !== undefined) setFratraekPause(inputs.fratraekPause);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("tidsberegner");
    const timer = setTimeout(() => {
      trackCalculation("tidsberegner");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'tidsberegner',
      inputs: { startTid, slutTid, startDato, slutDato, fratraekPause },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [startTid, slutTid, startDato, slutDato, fratraekPause]);

  const handleReset = useCallback(() => {
    setStartTid("09:00");
    setSlutTid("17:00");
    setStartDato("");
    setSlutDato("");
    setFratraekPause(0);
  }, []);

  const beregning = useMemo(() => {
    const [startTime, startMin] = startTid.split(":").map(Number);
    const [slutTime, slutMin] = slutTid.split(":").map(Number);

    let startMinutter = startTime * 60 + startMin;
    let slutMinutter = slutTime * 60 + slutMin;

    // Hvis start og slut dato er sat, beregn total inkl. dage
    let totalDage = 0;
    if (startDato && slutDato) {
      const start = new Date(startDato);
      const slut = new Date(slutDato);
      totalDage = Math.floor((slut.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (totalDage < 0) {
        return null;
      }
    }

    // Håndter over midnat
    if (slutMinutter < startMinutter) {
      slutMinutter += 24 * 60;
      if (!startDato || !slutDato) {
        totalDage = 1;
      }
    }

    let differensMinutter = slutMinutter - startMinutter;
    
    // Tilføj hele dage
    differensMinutter += totalDage * 24 * 60;
    
    // Fratræk pause
    differensMinutter -= fratraekPause;

    if (differensMinutter < 0) differensMinutter = 0;

    const totalTimer = differensMinutter / 60;
    const timer = Math.floor(differensMinutter / 60);
    const minutter = differensMinutter % 60;

    // Beregn arbejdsdage (8 timer = 1 dag)
    const arbejdsdage = (differensMinutter / 60 / 8).toFixed(2);

    // Beregn i sekunder
    const sekunder = differensMinutter * 60;

    return {
      timer,
      minutter,
      totalTimer: totalTimer.toFixed(2),
      totalMinutter: differensMinutter,
      sekunder,
      arbejdsdage,
      decimalTimer: totalTimer.toFixed(2),
      overMidnat: slutMinutter > 24 * 60,
    };
  }, [startTid, slutTid, startDato, slutDato, fratraekPause]);

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.starttidspunkt}</label>
            <input
              type="time"
              value={startTid}
              onChange={(e) => setStartTid(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              {l.startdato} <span className="text-gray-400 dark:text-gray-500">{l.valgfri}</span>
            </label>
            <input
              type="date"
              value={startDato}
              onChange={(e) => setStartDato(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.sluttidspunkt}</label>
            <input
              type="time"
              value={slutTid}
              onChange={(e) => setSlutTid(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              {l.slutdato} <span className="text-gray-400 dark:text-gray-500">{l.valgfri}</span>
            </label>
            <input
              type="date"
              value={slutDato}
              onChange={(e) => setSlutDato(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Pause fratræk */}
      <div className="max-w-md">
        <label className="block text-sm font-medium mb-2 dark:text-gray-200">
          {l.fratraekPause}
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="480"
            step="5"
            value={fratraekPause}
            onChange={(e) => setFratraekPause(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder={l.pausePlaceholder}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">{l.minSuffix}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultater */}
      {beregning && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-blue-100 rounded-xl text-center dark:bg-blue-900/20">
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{l.tidIAlt}</p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                {beregning.timer}{l.timerAbbr} {beregning.minutter}{l.minAbbr}
              </p>
              {beregning.overMidnat && (
                <p className="text-xs text-blue-500 mt-1 dark:text-blue-400">{l.overMidnat}</p>
              )}
            </div>
            <div className="p-6 bg-green-100 rounded-xl text-center dark:bg-green-900/20">
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{l.decimalTimer}</p>
              <p className="text-4xl font-bold text-green-700 dark:text-green-400">
                {beregning.decimalTimer}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.timerWord}</p>
            </div>
            <div className="p-6 bg-purple-100 rounded-xl text-center dark:bg-purple-900/20">
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{l.arbejdsdage8t}</p>
              <p className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                {beregning.arbejdsdage}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.dageWord}</p>
            </div>
          </div>

          {/* Detaljeret breakdown */}
          <div className="bg-gray-50 rounded-lg p-6 dark:bg-gray-800 dark:border dark:border-gray-700">
            <h3 className="font-semibold mb-4 dark:text-white">{l.detaljeretVisning}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{beregning.totalMinutter}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{l.minutterWord}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{beregning.sekunder.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{l.sekunderWord}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{beregning.totalTimer}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{l.timerDecimal}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">
                  {(parseFloat(beregning.totalTimer) / 24).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{l.dageWord}</p>
              </div>
            </div>
          </div>

          {/* Share button */}
          <div className="flex justify-center gap-3">
            <CopyResultButton text={`${beregning.timer}${l.timerAbbr} ${beregning.minutter}${l.minAbbr} (${beregning.decimalTimer} ${l.timerWord})`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName={l.calculatorName}
              resultSummary={`${beregning.timer}${l.timerAbbr} ${beregning.minutter}${l.minAbbr} (${beregning.decimalTimer} ${l.timerWord})`}
            />
          </div>

          {/* Quick presets */}
          <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
            <h3 className="font-medium mb-3 dark:text-white">{l.hurtigeEksempler}</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button"
                onClick={() => { setStartTid("08:00"); setSlutTid("16:00"); setFratraekPause(30); }}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {l.presetNormal}
              </button>
              <button type="button"
                onClick={() => { setStartTid("09:00"); setSlutTid("17:00"); setFratraekPause(60); }}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {l.presetKontor}
              </button>
              <button type="button"
                onClick={() => { setStartTid("22:00"); setSlutTid("06:00"); setFratraekPause(30); }}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {l.presetNat}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
