"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";

interface Tidszone {
  id: string;
  navn: string;
  offset: number; // UTC offset i minutter
  by: string;
}

const tidszoner: Tidszone[] = [
  { id: "dk", navn: "Danmark (CET/CEST)", offset: 60, by: "København" },
  { id: "uk", navn: "Storbritannien (GMT/BST)", offset: 0, by: "London" },
  { id: "us_east", navn: "USA Østkyst (EST/EDT)", offset: -300, by: "New York" },
  { id: "us_west", navn: "USA Vestkyst (PST/PDT)", offset: -480, by: "Los Angeles" },
  { id: "japan", navn: "Japan (JST)", offset: 540, by: "Tokyo" },
  { id: "china", navn: "Kina (CST)", offset: 480, by: "Beijing" },
  { id: "australia", navn: "Australien (AEST)", offset: 600, by: "Sydney" },
  { id: "india", navn: "Indien (IST)", offset: 330, by: "Mumbai" },
  { id: "dubai", navn: "Dubai (GST)", offset: 240, by: "Dubai" },
  { id: "brazil", navn: "Brasilien (BRT)", offset: -180, by: "São Paulo" },
  { id: "germany", navn: "Tyskland (CET/CEST)", offset: 60, by: "Berlin" },
  { id: "france", navn: "Frankrig (CET/CEST)", offset: 60, by: "Paris" },
  { id: "thailand", navn: "Thailand (ICT)", offset: 420, by: "Bangkok" },
  { id: "singapore", navn: "Singapore (SGT)", offset: 480, by: "Singapore" },
  { id: "south_africa", navn: "Sydafrika (SAST)", offset: 120, by: "Johannesburg" },
];

export default function TidszoneBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      navn: {
        dk: "Danmark (CET/CEST)",
        uk: "Storbritannien (GMT/BST)",
        us_east: "USA Østkyst (EST/EDT)",
        us_west: "USA Vestkyst (PST/PDT)",
        japan: "Japan (JST)",
        china: "Kina (CST)",
        australia: "Australien (AEST)",
        india: "Indien (IST)",
        dubai: "Dubai (GST)",
        brazil: "Brasilien (BRT)",
        germany: "Tyskland (CET/CEST)",
        france: "Frankrig (CET/CEST)",
        thailand: "Thailand (ICT)",
        singapore: "Singapore (SGT)",
        south_africa: "Sydafrika (SAST)",
      } as Record<string, string>,
      by: {
        dk: "København", uk: "London", us_east: "New York", us_west: "Los Angeles",
        japan: "Tokyo", china: "Beijing", australia: "Sydney", india: "Mumbai",
        dubai: "Dubai", brazil: "São Paulo", germany: "Berlin", france: "Paris",
        thailand: "Bangkok", singapore: "Singapore", south_africa: "Johannesburg",
      } as Record<string, string>,
      nowIn: (by: string) => `Klokken nu i ${by}`,
      fromZone: "Fra tidszone",
      toZone: "Til tidszone",
      timeDiff: "Tidsforskel",
      hoursWord: "timer",
      diffSentence: (tilBy: string, abs: number, ahead: boolean, fraBy: string) =>
        `${tilBy} er ${abs} timer${ahead ? " foran" : " bagud"} ${fraBy}`,
      convertTitle: "Konverter et specifikt tidspunkt",
      hourLabel: "Time",
      minuteLabel: "Minut",
      dayBefore: "(dagen før)",
      nextDay: "(næste dag)",
      summary: (fraTid: string, fraBy: string, tilTid: string, tilBy: string, dagTekst: string) =>
        `${fraTid} i ${fraBy} = ${tilTid} i ${tilBy} ${dagTekst}`,
      calcName: "Tidszoneberegner",
      diffFromDenmark: "Tidsforskel fra Danmark",
      hourSuffix: "t",
      dstTitle: "⚠️ Om sommertid",
      dstBody:
        "Denne beregner bruger standard tidsforskelle. Husk at sommertid (DST) kan påvirke den faktiske tidsforskel. Danmark skifter til sommertid sidste søndag i marts og tilbage sidste søndag i oktober.",
      dateLocale: "da-DK",
    },
    se: {
      navn: {
        dk: "Danmark (CET/CEST)",
        uk: "Storbritannien (GMT/BST)",
        us_east: "USA Östkusten (EST/EDT)",
        us_west: "USA Västkusten (PST/PDT)",
        japan: "Japan (JST)",
        china: "Kina (CST)",
        australia: "Australien (AEST)",
        india: "Indien (IST)",
        dubai: "Dubai (GST)",
        brazil: "Brasilien (BRT)",
        germany: "Tyskland (CET/CEST)",
        france: "Frankrike (CET/CEST)",
        thailand: "Thailand (ICT)",
        singapore: "Singapore (SGT)",
        south_africa: "Sydafrika (SAST)",
      } as Record<string, string>,
      by: {
        dk: "Köpenhamn", uk: "London", us_east: "New York", us_west: "Los Angeles",
        japan: "Tokyo", china: "Beijing", australia: "Sydney", india: "Mumbai",
        dubai: "Dubai", brazil: "São Paulo", germany: "Berlin", france: "Paris",
        thailand: "Bangkok", singapore: "Singapore", south_africa: "Johannesburg",
      } as Record<string, string>,
      nowIn: (by: string) => `Klockan nu i ${by}`,
      fromZone: "Från tidszon",
      toZone: "Till tidszon",
      timeDiff: "Tidsskillnad",
      hoursWord: "timmar",
      diffSentence: (tilBy: string, abs: number, ahead: boolean, fraBy: string) =>
        `${tilBy} är ${abs} timmar${ahead ? " före" : " efter"} ${fraBy}`,
      convertTitle: "Konvertera en specifik tidpunkt",
      hourLabel: "Timme",
      minuteLabel: "Minut",
      dayBefore: "(dagen innan)",
      nextDay: "(nästa dag)",
      summary: (fraTid: string, fraBy: string, tilTid: string, tilBy: string, dagTekst: string) =>
        `${fraTid} i ${fraBy} = ${tilTid} i ${tilBy} ${dagTekst}`,
      calcName: "Tidszonsberäknare",
      diffFromDenmark: "Tidsskillnad från Danmark",
      hourSuffix: "h",
      dstTitle: "⚠️ Om sommartid",
      dstBody:
        "Den här beräknaren använder standardtidsskillnader. Kom ihåg att sommartid (DST) kan påverka den faktiska tidsskillnaden. Danmark byter till sommartid sista söndagen i mars och tillbaka sista söndagen i oktober.",
      dateLocale: "sv-SE",
    },
  } as const;
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [fraTidszone, setFraTidszone] = useState<string>("dk");
  const [tilTidszone, setTilTidszone] = useState<string>("us_east");
  const [timer, setTimer] = useState<number>(12);
  const [minutter, setMinutter] = useState<number>(0);
  const [aktuelTid, setAktuelTid] = useState<Date>(new Date());

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'tidszone') {
      const inputs = urlState.inputs;
      if (inputs.fraTidszone) setFraTidszone(inputs.fraTidszone);
      if (inputs.tilTidszone) setTilTidszone(inputs.tilTidszone);
      if (inputs.timer !== undefined) setTimer(inputs.timer);
      if (inputs.minutter !== undefined) setMinutter(inputs.minutter);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("tidszone");
    const timer = setTimeout(() => {
      trackCalculation("tidszone");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'tidszone',
      inputs: { fraTidszone, tilTidszone, timer, minutter },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [fraTidszone, tilTidszone, timer, minutter]);

  // Opdater aktuel tid hvert sekund
  useEffect(() => {
    const interval = setInterval(() => {
      setAktuelTid(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = useCallback(() => {
    setFraTidszone("dk");
    setTilTidszone("us_east");
    setTimer(12);
    setMinutter(0);
  }, []);

  const beregning = useMemo(() => {
    const fraTz = tidszoner.find(t => t.id === fraTidszone)!;
    const tilTz = tidszoner.find(t => t.id === tilTidszone)!;
    
    // Forskellen i minutter
    const forskelMinutter = tilTz.offset - fraTz.offset;
    const forskelTimer = forskelMinutter / 60;
    
    // Beregn tid i destination
    let totalMinutterFra = timer * 60 + minutter;
    let totalMinutterTil = totalMinutterFra + forskelMinutter;
    
    // Håndter dag-skift
    let dagForskel = 0;
    if (totalMinutterTil < 0) {
      totalMinutterTil += 24 * 60;
      dagForskel = -1;
    } else if (totalMinutterTil >= 24 * 60) {
      totalMinutterTil -= 24 * 60;
      dagForskel = 1;
    }
    
    const tilTimer = Math.floor(totalMinutterTil / 60);
    const tilMinutter = totalMinutterTil % 60;
    
    // Aktuelle tider
    const now = new Date();
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
    
    const fraLokalTid = new Date(utcNow + fraTz.offset * 60000);
    const tilLokalTid = new Date(utcNow + tilTz.offset * 60000);
    
    return {
      fraTz,
      tilTz,
      forskelTimer,
      forskelMinutter,
      tilTimer,
      tilMinutter,
      dagForskel,
      fraLokalTid,
      tilLokalTid,
    };
  }, [fraTidszone, tilTidszone, timer, minutter, aktuelTid]);

  const formatTid = (timer: number, minutter: number) => {
    return `${timer.toString().padStart(2, '0')}:${minutter.toString().padStart(2, '0')}`;
  };

  const formatDato = (dato: Date) => {
    return dato.toLocaleTimeString(l.dateLocale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getDagTekst = () => {
    if (beregning.dagForskel === -1) return l.dayBefore;
    if (beregning.dagForskel === 1) return l.nextDay;
    return "";
  };

  return (
    <div className="space-y-8">
      {/* Aktuelle tider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{l.nowIn(l.by[beregning.fraTz.id])}</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatDato(beregning.fraLokalTid)}</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{l.nowIn(l.by[beregning.tilTz.id])}</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatDato(beregning.tilLokalTid)}</p>
        </div>
      </div>

      {/* Valg af tidszoner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.fromZone}</label>
          <select
            value={fraTidszone}
            onChange={(e) => setFraTidszone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {tidszoner.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {l.by[tz.id]} - {l.navn[tz.id]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.toZone}</label>
          <select
            value={tilTidszone}
            onChange={(e) => setTilTidszone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {tidszoner.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {l.by[tz.id]} - {l.navn[tz.id]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tidsforskel info */}
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {l.timeDiff}: <strong className="dark:text-white">
            {beregning.forskelTimer >= 0 ? '+' : ''}{beregning.forskelTimer} {l.hoursWord}
          </strong>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {l.diffSentence(l.by[beregning.tilTz.id], Math.abs(beregning.forskelTimer), beregning.forskelTimer >= 0, l.by[beregning.fraTz.id])}
        </p>
      </div>

      {/* Manuel tid konvertering */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="font-medium mb-4 dark:text-white">{l.convertTitle}</h3>
        <div className="grid grid-cols-2 gap-4 max-w-xs">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.hourLabel}</label>
            <select
              value={timer}
              onChange={(e) => setTimer(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.minuteLabel}</label>
            <select
              value={minutter}
              onChange={(e) => setMinutter(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Konverteringsresultat */}
      <div className="p-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <p className="text-sm opacity-75">{l.by[beregning.fraTz.id]}</p>
            <p className="text-4xl font-bold">{formatTid(timer, minutter)}</p>
          </div>
          <div className="text-center text-4xl">→</div>
          <div className="text-center">
            <p className="text-sm opacity-75">{l.by[beregning.tilTz.id]}</p>
            <p className="text-4xl font-bold">
              {formatTid(beregning.tilTimer, beregning.tilMinutter)}
            </p>
            <p className="text-sm opacity-75">{getDagTekst()}</p>
          </div>
        </div>
      </div>

      {/* Share button */}
      <div className="flex justify-center gap-3">
        <CopyResultButton text={l.summary(formatTid(timer, minutter), l.by[beregning.fraTz.id], formatTid(beregning.tilTimer, beregning.tilMinutter), l.by[beregning.tilTz.id], getDagTekst())} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName={l.calcName}
          resultSummary={l.summary(formatTid(timer, minutter), l.by[beregning.fraTz.id], formatTid(beregning.tilTimer, beregning.tilMinutter), l.by[beregning.tilTz.id], getDagTekst())}
        />
      </div>

      {/* Populære tidszoner fra Danmark */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
          <h3 className="font-medium dark:text-white">{l.diffFromDenmark}</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {tidszoner
              .filter(tz => tz.id !== 'dk')
              .map((tz) => {
                const forskel = (tz.offset - 60) / 60;
                return (
                  <div key={tz.id} className="flex justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <span className="dark:text-gray-300">{l.by[tz.id]}</span>
                    <span className="font-mono dark:text-white">
                      {forskel >= 0 ? '+' : ''}{forskel}{l.hourSuffix}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">{l.dstTitle}</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          {l.dstBody}
        </p>
      </div>
    </div>
  );
}
