"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

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
    return dato.toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getDagTekst = () => {
    if (beregning.dagForskel === -1) return "(dagen før)";
    if (beregning.dagForskel === 1) return "(næste dag)";
    return "";
  };

  return (
    <div className="space-y-8">
      {/* Aktuelle tider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Klokken nu i {beregning.fraTz.by}</p>
          <p className="text-3xl font-bold text-blue-600">{formatDato(beregning.fraLokalTid)}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Klokken nu i {beregning.tilTz.by}</p>
          <p className="text-3xl font-bold text-green-600">{formatDato(beregning.tilLokalTid)}</p>
        </div>
      </div>

      {/* Valg af tidszoner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Fra tidszone</label>
          <select
            value={fraTidszone}
            onChange={(e) => setFraTidszone(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          >
            {tidszoner.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {tz.by} - {tz.navn}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Til tidszone</label>
          <select
            value={tilTidszone}
            onChange={(e) => setTilTidszone(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          >
            {tidszoner.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {tz.by} - {tz.navn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tidsforskel info */}
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600">
          Tidsforskel: <strong>
            {beregning.forskelTimer >= 0 ? '+' : ''}{beregning.forskelTimer} timer
          </strong>
        </p>
        <p className="text-sm text-gray-500">
          {beregning.tilTz.by} er {Math.abs(beregning.forskelTimer)} timer 
          {beregning.forskelTimer >= 0 ? ' foran' : ' bagud'} {beregning.fraTz.by}
        </p>
      </div>

      {/* Manuel tid konvertering */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium mb-4">Konverter et specifikt tidspunkt</h3>
        <div className="grid grid-cols-2 gap-4 max-w-xs">
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <select
              value={timer}
              onChange={(e) => setTimer(parseInt(e.target.value))}
              className="w-full px-4 py-3 border rounded-lg"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Minut</label>
            <select
              value={minutter}
              onChange={(e) => setMinutter(parseInt(e.target.value))}
              className="w-full px-4 py-3 border rounded-lg"
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
            <p className="text-sm opacity-75">{beregning.fraTz.by}</p>
            <p className="text-4xl font-bold">{formatTid(timer, minutter)}</p>
          </div>
          <div className="text-center text-4xl">→</div>
          <div className="text-center">
            <p className="text-sm opacity-75">{beregning.tilTz.by}</p>
            <p className="text-4xl font-bold">
              {formatTid(beregning.tilTimer, beregning.tilMinutter)}
            </p>
            <p className="text-sm opacity-75">{getDagTekst()}</p>
          </div>
        </div>
      </div>

      {/* Share button */}
      <div className="flex justify-center gap-3">
        <CopyResultButton text={`${formatTid(timer, minutter)} i ${beregning.fraTz.by} = ${formatTid(beregning.tilTimer, beregning.tilMinutter)} i ${beregning.tilTz.by} ${getDagTekst()}`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Tidszoneberegner"
          resultSummary={`${formatTid(timer, minutter)} i ${beregning.fraTz.by} = ${formatTid(beregning.tilTimer, beregning.tilMinutter)} i ${beregning.tilTz.by} ${getDagTekst()}`}
        />
      </div>

      {/* Populære tidszoner fra Danmark */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">Tidsforskel fra Danmark</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {tidszoner
              .filter(tz => tz.id !== 'dk')
              .map((tz) => {
                const forskel = (tz.offset - 60) / 60;
                return (
                  <div key={tz.id} className="flex justify-between p-2 hover:bg-gray-50 rounded">
                    <span>{tz.by}</span>
                    <span className="font-mono">
                      {forskel >= 0 ? '+' : ''}{forskel}t
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">⚠️ Om sommertid</h3>
        <p className="text-sm text-yellow-700">
          Denne beregner bruger standard tidsforskelle. Husk at sommertid (DST) kan påvirke 
          den faktiske tidsforskel. Danmark skifter til sommertid sidste søndag i marts og 
          tilbage sidste søndag i oktober.
        </p>
      </div>
    </div>
  );
}
