"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";

export default function TidsBeregner() {
  const [startTid, setStartTid] = useState<string>("09:00");
  const [slutTid, setSlutTid] = useState<string>("17:00");
  const [startDato, setStartDato] = useState<string>("");
  const [slutDato, setSlutDato] = useState<string>("");
  const [fratraekPause, setFratraekPause] = useState<number>(0);

  const hasLoadedUrl = useRef(false);

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
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'tidsberegner',
      inputs: { startTid, slutTid, startDato, slutDato, fratraekPause },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [startTid, slutTid, startDato, slutDato, fratraekPause]);

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
            <label className="block text-sm font-medium mb-2">Starttidspunkt</label>
            <input
              type="time"
              value={startTid}
              onChange={(e) => setStartTid(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Startdato <span className="text-gray-400">(valgfri)</span>
            </label>
            <input
              type="date"
              value={startDato}
              onChange={(e) => setStartDato(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sluttidspunkt</label>
            <input
              type="time"
              value={slutTid}
              onChange={(e) => setSlutTid(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Slutdato <span className="text-gray-400">(valgfri)</span>
            </label>
            <input
              type="date"
              value={slutDato}
              onChange={(e) => setSlutDato(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        </div>
      </div>

      {/* Pause fratræk */}
      <div className="max-w-md">
        <label className="block text-sm font-medium mb-2">
          Fratræk pause (minutter)
        </label>
        <input
          type="number"
          min="0"
          max="480"
          step="5"
          value={fratraekPause}
          onChange={(e) => setFratraekPause(parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 border rounded-lg"
          placeholder="F.eks. 30 min frokostpause"
        />
      </div>

      {/* Resultater */}
      {beregning && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-blue-100 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Tid i alt</p>
              <p className="text-4xl font-bold text-blue-700">
                {beregning.timer}t {beregning.minutter}m
              </p>
              {beregning.overMidnat && (
                <p className="text-xs text-blue-500 mt-1">🌙 Over midnat</p>
              )}
            </div>
            <div className="p-6 bg-green-100 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Decimal timer</p>
              <p className="text-4xl font-bold text-green-700">
                {beregning.decimalTimer}
              </p>
              <p className="text-xs text-gray-500">timer</p>
            </div>
            <div className="p-6 bg-purple-100 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Arbejdsdage (8t)</p>
              <p className="text-4xl font-bold text-purple-700">
                {beregning.arbejdsdage}
              </p>
              <p className="text-xs text-gray-500">dage</p>
            </div>
          </div>

          {/* Detaljeret breakdown */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">📊 Detaljeret visning</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-700">{beregning.totalMinutter}</p>
                <p className="text-sm text-gray-500">minutter</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-700">{beregning.sekunder.toLocaleString()}</p>
                <p className="text-sm text-gray-500">sekunder</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-700">{beregning.totalTimer}</p>
                <p className="text-sm text-gray-500">timer (decimal)</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-700">
                  {(parseFloat(beregning.totalTimer) / 24).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">dage</p>
              </div>
            </div>
          </div>

          {/* Share button */}
          <div className="flex justify-center">
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Tidsberegner"
              resultSummary={`${beregning.timer}t ${beregning.minutter}m (${beregning.decimalTimer} timer)`}
            />
          </div>

          {/* Quick presets */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-3">⚡ Hurtige eksempler</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setStartTid("08:00"); setSlutTid("16:00"); setFratraekPause(30); }}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
              >
                Normal arbejdsdag (8-16)
              </button>
              <button
                onClick={() => { setStartTid("09:00"); setSlutTid("17:00"); setFratraekPause(60); }}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
              >
                Kontor (9-17, 1t pause)
              </button>
              <button
                onClick={() => { setStartTid("22:00"); setSlutTid("06:00"); setFratraekPause(30); }}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
              >
                Nattevagt (22-06)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
