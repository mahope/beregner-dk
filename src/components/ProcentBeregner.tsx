"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { trackCalculation } from "@/lib/analytics";
import { ShareCalculation } from "@/components/ShareCalculation";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { ModeSelector, ModeOption } from "@/components/ModeSelector";

type BeregningsMode = "find-procent" | "find-resultat" | "find-heltal" | "stigning";

const MODES: ModeOption<BeregningsMode>[] = [
  { id: "find-procent", label: "Find procent", desc: "X er ? % af Y" },
  { id: "find-resultat", label: "Find resultat", desc: "X % af Y = ?" },
  { id: "find-heltal", label: "Find heltal", desc: "X er Y% af ?" },
  { id: "stigning", label: "Procentvis ændring", desc: "Fra X til Y = ?%" },
];

export default function ProcentBeregner() {
  const [mode, setMode] = useState<BeregningsMode>("find-procent");
  
  // Find procent mode
  const [deltal, setDeltal] = useState<number>(25);
  const [heltal, setHeltal] = useState<number>(100);
  
  // Find resultat mode
  const [procent, setProcent] = useState<number>(25);
  const [baseVal, setBaseVal] = useState<number>(200);
  
  // Stigning mode
  const [fra, setFra] = useState<number>(100);
  const [til, setTil] = useState<number>(125);
  
  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'procent') {
      const inputs = urlState.inputs;
      if (inputs.mode) setMode(inputs.mode);
      if (inputs.deltal !== undefined) setDeltal(inputs.deltal);
      if (inputs.heltal !== undefined) setHeltal(inputs.heltal);
      if (inputs.procent !== undefined) setProcent(inputs.procent);
      if (inputs.baseVal !== undefined) setBaseVal(inputs.baseVal);
      if (inputs.fra !== undefined) setFra(inputs.fra);
      if (inputs.til !== undefined) setTil(inputs.til);
    }
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'procent',
      inputs: { mode, deltal, heltal, procent, baseVal, fra, til },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [mode, deltal, heltal, procent, baseVal, fra, til]);

  const resultat = useMemo(() => {
    switch (mode) {
      case "find-procent":
        if (heltal === 0) return null;
        const procentAfHeltal = (deltal / heltal) * 100;
        return {
          type: "find-procent" as const,
          resultat: procentAfHeltal,
          forklaring: `${deltal} er ${procentAfHeltal.toFixed(2)}% af ${heltal}`,
        };
      
      case "find-resultat":
        const resultatVaerdi = (procent / 100) * baseVal;
        return {
          type: "find-resultat" as const,
          resultat: resultatVaerdi,
          forklaring: `${procent}% af ${baseVal} er ${resultatVaerdi.toFixed(2)}`,
        };
      
      case "find-heltal":
        if (procent === 0) return null;
        const heltalVaerdi = (deltal / procent) * 100;
        return {
          type: "find-heltal" as const,
          resultat: heltalVaerdi,
          forklaring: `Hvis ${deltal} er ${procent}%, så er 100% = ${heltalVaerdi.toFixed(2)}`,
        };
      
      case "stigning":
        if (fra === 0) return null;
        const aendring = til - fra;
        const procentAendring = (aendring / fra) * 100;
        const erStigning = aendring >= 0;
        return {
          type: "stigning" as const,
          resultat: procentAendring,
          aendring,
          erStigning,
          forklaring: `${erStigning ? "Stigning" : "Fald"} fra ${fra} til ${til} er ${Math.abs(procentAendring).toFixed(2)}%`,
        };
      
      default:
        return null;
    }
  }, [mode, deltal, heltal, procent, baseVal, fra, til]);

  // Track calculation once per session
  useEffect(() => {
    if (resultat && !hasTracked.current) {
      const timer = setTimeout(() => {
        trackCalculation("procent");
        hasTracked.current = true;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [resultat]);

  return (
    <div className="space-y-8">
      {/* Mode selection with keyboard navigation */}
      <ModeSelector
        modes={MODES}
        currentMode={mode}
        onChange={setMode}
        name="Beregningstype"
        columns={4}
      />

      {/* Input fields based on mode */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        {mode === "find-procent" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <input
              type="number"
              value={deltal}
              onChange={(e) => setDeltal(parseFloat(e.target.value) || 0)}
              aria-label="Del-tal (tælleren)"
              className="w-28 px-4 py-3 border dark:border-gray-600 rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">er</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" aria-label="Resultat procent">?%</span>
            <span className="text-gray-600 dark:text-gray-400">af</span>
            <input
              type="number"
              value={heltal}
              onChange={(e) => setHeltal(parseFloat(e.target.value) || 0)}
              aria-label="Heltal (nævneren)"
              className="w-28 px-4 py-3 border dark:border-gray-600 rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        )}

        {mode === "find-resultat" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <input
              type="number"
              value={procent}
              onChange={(e) => setProcent(parseFloat(e.target.value) || 0)}
              aria-label="Procent"
              className="w-28 px-4 py-3 border dark:border-gray-600 rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">% af</span>
            <input
              type="number"
              value={baseVal}
              onChange={(e) => setBaseVal(parseFloat(e.target.value) || 0)}
              aria-label="Grundværdi"
              className="w-28 px-4 py-3 border dark:border-gray-600 rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">=</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" aria-label="Resultat">?</span>
          </div>
        )}

        {mode === "find-heltal" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <input
              type="number"
              value={deltal}
              onChange={(e) => setDeltal(parseFloat(e.target.value) || 0)}
              aria-label="Del-værdi"
              className="w-28 px-4 py-3 border dark:border-gray-600 rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">er</span>
            <input
              type="number"
              value={procent}
              onChange={(e) => setProcent(parseFloat(e.target.value) || 0)}
              aria-label="Procent"
              className="w-28 px-4 py-3 border dark:border-gray-600 rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">% af</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" aria-label="Resultat heltal">?</span>
          </div>
        )}

        {mode === "stigning" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <span className="text-gray-600 dark:text-gray-400">Fra</span>
            <input
              type="number"
              value={fra}
              onChange={(e) => setFra(parseFloat(e.target.value) || 0)}
              aria-label="Startværdi"
              className="w-28 px-4 py-3 border dark:border-gray-600 rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">til</span>
            <input
              type="number"
              value={til}
              onChange={(e) => setTil(parseFloat(e.target.value) || 0)}
              aria-label="Slutværdi"
              className="w-28 px-4 py-3 border dark:border-gray-600 rounded-lg text-center text-xl bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-gray-600 dark:text-gray-400">=</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" aria-label="Procentvis ændring">?%</span>
          </div>
        )}
      </div>

      {/* Result */}
      {resultat && (
        <div className={`p-6 rounded-xl text-center ${
          resultat.type === "stigning" && !resultat.erStigning 
            ? "bg-red-50" 
            : "bg-green-50"
        }`}>
          <p className="text-sm text-gray-600 mb-2">Resultat</p>
          <p className={`text-5xl font-bold ${
            resultat.type === "stigning" && !resultat.erStigning
              ? "text-red-600"
              : "text-green-600"
          }`}>
            {resultat.type === "find-procent" || resultat.type === "stigning"
              ? `${resultat.resultat.toFixed(2)}%`
              : resultat.resultat.toFixed(2)}
          </p>
          <p className="text-gray-600 mt-2">{resultat.forklaring}</p>
          
          {/* Share button */}
          <div className="mt-4 flex justify-center">
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Procentberegner"
              resultSummary={resultat.forklaring}
            />
          </div>
        </div>
      )}

      {/* Quick reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-medium mb-2 dark:text-gray-100">Hurtig reference</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>10% = 1/10</li>
            <li>25% = 1/4</li>
            <li>33% ≈ 1/3</li>
            <li>50% = 1/2</li>
            <li>75% = 3/4</li>
          </ul>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-medium mb-2 dark:text-gray-100">Formler</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>Procent = (Del / Heltal) × 100</li>
            <li>Del = (Procent / 100) × Heltal</li>
            <li>Heltal = Del × (100 / Procent)</li>
            <li>Ændring = ((Ny - Gammel) / Gammel) × 100</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
